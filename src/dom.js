/**
 * DOM bindings for unveilmask.
 *
 * Renders a masked value that reveals the original on hover / focus.
 * The real value is stored in the DOM — this is a UX convenience,
 * NOT a security boundary (see README).
 */

import { mask } from './mask.js';

const CLASS_ROOT = 'nm';
const CLASS_MASKED = 'nm-masked';
const CLASS_REAL = 'nm-real';
const CLASS_REVEALED = 'nm-revealed';

/**
 * Mount a hover-reveal masker inside an element. The element's own
 * content is replaced.
 *
 * @param {HTMLElement} element container element
 * @param {string} value original value
 * @param {import('./mask.js').MaskOptions & { revealed?: boolean }} [options]
 * @returns {HTMLElement} the container element (chained)
 *
 * @example
 * mount(document.querySelector('#email'), 'hello@example.com');
 */
export function mount(element, value, options = {}) {
  const { revealed = false, ...maskOptions } = options;

  const maskedText = mask(value, maskOptions);

  element.classList.add(CLASS_ROOT);
  if (!element.hasAttribute('tabindex')) {
    element.setAttribute('tabindex', '0'); // keyboard users can focus to reveal
  }
  if (revealed) element.classList.add(CLASS_REVEALED);
  element.dataset.nmValue = String(value);

  element.textContent = '';

  const masked = document.createElement('span');
  masked.className = CLASS_MASKED;
  masked.textContent = maskedText;

  const real = document.createElement('span');
  real.className = CLASS_REAL;
  real.setAttribute('aria-hidden', 'true'); // screen readers read the masked text
  real.textContent = String(value);

  element.append(masked, real);
  return element;
}

/**
 * Build the hover-reveal HTML for a value (useful for templating/SSR).
 *
 * @returns {string} HTML string
 *
 * @example
 * render('hello@example.com');
 * // '<span class="nm" tabindex="0" data-nm-value="hello@example.com">...'
 */
export function render(value, options = {}) {
  const { revealed = false, ...maskOptions } = options;
  const maskedText = mask(value, maskOptions);
  const revealClass = revealed ? ` ${CLASS_REVEALED}` : '';

  const esc = escapeHtml(String(value));
  return (
    `<span class="${CLASS_ROOT}${revealClass}" tabindex="0" data-nm-value="${esc}">` +
    `<span class="${CLASS_MASKED}">${escapeHtml(maskedText)}</span>` +
    `<span class="${CLASS_REAL}" aria-hidden="true">${esc}</span>` +
    `</span>`
  );
}

/**
 * Initialize every `[data-nm-value]` element under root.
 *
 * @param {ParentNode} [root=document]
 * @returns {HTMLElement[]} mounted elements
 *
 * @example
 * <span data-nm-value="hello@example.com" data-nm-type="email"></span>
 * autoInit();
 */
export function autoInit(root = document) {
  const nodes = root.querySelectorAll('[data-nm-value]');
  return Array.from(nodes, (el) =>
    mount(el, el.dataset.nmValue, { type: el.dataset.nmType || 'auto' }),
  );
}

/** Programmatically reveal a mounted masker (adds hover-independent reveal). */
export function reveal(element) {
  element.classList.add(CLASS_REVEALED);
}

/** Hide a programmatically revealed masker. */
export function hide(element) {
  element.classList.remove(CLASS_REVEALED);
}

/** Toggle the revealed state of a mounted masker. */
export function toggle(element, force) {
  element.classList.toggle(CLASS_REVEALED, force);
}

/** Unmount: restore the element's text content to the original value. */
export function unmount(element) {
  const value = element.dataset.nmValue ?? '';
  element.classList.remove(CLASS_ROOT, CLASS_REVEALED);
  element.removeAttribute('tabindex');
  delete element.dataset.nmValue;
  element.textContent = value;
  return element;
}

function escapeHtml(str) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
