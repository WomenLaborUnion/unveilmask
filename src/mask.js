/**
 * Core masking logic for nomalized-masker.
 *
 * Masking replaces the *middle* of a value with a mask character,
 * keeping the head and tail recognizable. Pure functions, no DOM.
 */

const DEFAULT_MASK_CHAR = '*';

/**
 * @typedef {Object} MaskOptions
 * @property {'auto'|'email'|'phone'|'name'|'generic'} [type='auto'] value type
 * @property {string} [maskChar='*'] character used for masking
 */

/**
 * Mask the middle of a value.
 *
 * @param {string} value
 * @param {MaskOptions} [options]
 * @returns {string} masked value
 *
 * @example
 * mask('hello@example.com');            // 'he***o@example.com'
 * mask('010-1234-5678', { type: 'phone' }); // '010-****-5678'
 * mask('홍길동', { type: 'name' });      // '홍*동'
 */
export function mask(value, options = {}) {
  const { type = 'auto', maskChar = DEFAULT_MASK_CHAR } = options;
  const str = String(value ?? '');

  if (str.length === 0) return str;

  const resolvedType = type === 'auto' ? detectType(str) : type;

  switch (resolvedType) {
    case 'email':
      return maskEmail(str, maskChar);
    case 'phone':
      return maskPhone(str, maskChar);
    case 'name':
      return maskName(str, maskChar);
    case 'generic':
    default:
      return maskGeneric(str, maskChar);
  }
}

/**
 * Detect the value type from its shape.
 * @param {string} str
 * @returns {'email'|'phone'|'generic'}
 */
export function detectType(str) {
  if (str.includes('@')) return 'email';
  if (isPhoneLike(str)) return 'phone';
  return 'generic';
}

function isPhoneLike(str) {
  const digits = str.replace(/\D/g, '');
  if (digits.length < 6 || digits.length > 15) return false;
  // only digits and common phone separators
  return /^[\d\s\-+().]+$/.test(str);
}

/**
 * Mask the middle of a plain string, keeping roughly the first
 * and last third visible.
 *
 * 'abcdefgh' -> 'ab****gh'
 */
export function maskGeneric(str, maskChar = DEFAULT_MASK_CHAR) {
  const chars = Array.from(str);
  const n = chars.length;

  if (n === 0) return str;
  if (n === 1) return maskChar;
  if (n === 2) return chars[0] + maskChar;

  const headLen = Math.ceil(n / 3);
  const tailLen = Math.ceil(n / 3);

  // too short to keep both thirds: keep only first and last char
  if (headLen + tailLen >= n) {
    return chars[0] + maskChar.repeat(n - 2) + chars[n - 1];
  }

  const head = chars.slice(0, headLen).join('');
  const tail = chars.slice(n - tailLen).join('');
  return head + maskChar.repeat(n - headLen - tailLen) + tail;
}

/**
 * Mask the middle of the local part; the domain stays visible.
 *
 * 'hello@example.com' -> 'he***o@example.com'
 */
export function maskEmail(str, maskChar = DEFAULT_MASK_CHAR) {
  const atIndex = str.indexOf('@');
  if (atIndex <= 0) return maskGeneric(str, maskChar); // not really an email

  const local = str.slice(0, atIndex);
  const domain = str.slice(atIndex); // includes '@'
  return maskGeneric(local, maskChar) + domain;
}

/**
 * Mask the middle digit groups; the prefix (area/mobile/country code)
 * and the last group stay visible. Separators are preserved.
 *
 * '010-1234-5678'    -> '010-****-5678'
 * '+82 10 1234 5678' -> '+82 10 **** 5678'
 * '01012345678'      -> '010****5678'
 */
export function maskPhone(str, maskChar = DEFAULT_MASK_CHAR) {
  const chars = Array.from(str);

  // group consecutive digits: '010-1234-5678' -> [[0,1,2],[4,5,6,7],[9,10,11,12]]
  const groups = [];
  let current = null;
  chars.forEach((ch, i) => {
    if (/\d/.test(ch)) {
      if (!current) {
        current = [];
        groups.push(current);
      }
      current.push(i);
    } else {
      current = null;
    }
  });

  const allDigits = groups.flat();
  const keep = new Set();

  if (allDigits.length <= 4) {
    // too short to keep a tail: reveal only the final digit
    keep.add(allDigits[allDigits.length - 1]);
  } else if (groups.length === 1) {
    // continuous run without separators
    const run = groups[0];
    run.slice(-4).forEach((i) => keep.add(i));
    if (run.length >= 8) run.slice(0, 3).forEach((i) => keep.add(i)); // mobile prefix like 010
  } else {
    // keep the leading group when it looks like a prefix:
    // an area/mobile code (010, 02, 555) or a country code right after '+'
    const first = groups[0];
    const isCountryCode = chars[0] === '+' && first[0] <= 2;
    if (first.length <= 3 || isCountryCode) first.forEach((i) => keep.add(i));
    // after a country code, the next short group is the area/mobile code
    if (isCountryCode && groups.length >= 3 && groups[1].length <= 3) {
      groups[1].forEach((i) => keep.add(i));
    }
    // keep the final group (or just its last four digits when it is long)
    groups[groups.length - 1].slice(-4).forEach((i) => keep.add(i));
  }

  return chars.map((ch, i) => (/\d/.test(ch) && !keep.has(i) ? maskChar : ch)).join('');
}

/**
 * Mask the middle of each whitespace-separated word (for names).
 *
 * '홍길동'    -> '홍*동'
 * 'John Doe' -> 'J**n D**e'
 */
export function maskName(str, maskChar = DEFAULT_MASK_CHAR) {
  return str
    .split(/(\s+)/) // keep separators
    .map((part) => (/^\s+$/.test(part) ? part : maskWord(part, maskChar)))
    .join('');
}

/**
 * Mask a single name word, keeping the first and last character.
 *
 * '홍길동' -> '홍*동'
 * 'Kim'   -> 'K*m'
 * 'Elizabeth' -> 'E*******h'
 */
export function maskWord(word, maskChar = DEFAULT_MASK_CHAR) {
  const chars = Array.from(word);
  const n = chars.length;

  if (n === 1) return maskChar;
  if (n === 2) return chars[0] + maskChar;
  return chars[0] + maskChar.repeat(n - 2) + chars[n - 1];
}
