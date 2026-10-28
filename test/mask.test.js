import { test } from 'node:test';
import assert from 'node:assert/strict';

import { mask, detectType, maskGeneric, maskEmail, maskPhone, maskName, maskWord } from '../src/mask.js';

test('detectType: email, phone, generic', () => {
  assert.equal(detectType('hello@example.com'), 'email');
  assert.equal(detectType('010-1234-5678'), 'phone');
  assert.equal(detectType('+82 10 1234 5678'), 'phone');
  assert.equal(detectType('홍길동'), 'generic');
  assert.equal(detectType('abc123'), 'generic');
  // too short / weird shapes are not phone-like
  assert.equal(detectType('12345'), 'generic');
  assert.equal(detectType('12a45'), 'generic');
});

test('maskGeneric: keeps head and tail thirds', () => {
  assert.equal(maskGeneric('abcdefghi'), 'abc***ghi');
  assert.equal(maskGeneric('abcdefgh'), 'abc**fgh');
  assert.equal(maskGeneric('abcdef'), 'ab**ef');
  assert.equal(maskGeneric('abcde'), 'ab*de');
  assert.equal(maskGeneric('abcd'), 'a**d');
  assert.equal(maskGeneric('abc'), 'a*c');
  assert.equal(maskGeneric('ab'), 'a*');
  assert.equal(maskGeneric('a'), '*');
  assert.equal(maskGeneric(''), '');
});

test('maskGeneric: custom mask character', () => {
  assert.equal(maskGeneric('abcdefgh', '#'), 'abc##fgh');
});

test('maskGeneric: handles unicode characters as single units', () => {
  assert.equal(maskGeneric('한국어문장입니다'), '한국어**입니다');
});

test('maskEmail: masks local part only', () => {
  assert.equal(maskEmail('hello@example.com'), 'he*lo@example.com');
  assert.equal(maskEmail('hi@example.com'), 'h*@example.com');
  assert.equal(maskEmail('a@example.com'), '*@example.com');
  // domain with multiple labels untouched
  assert.equal(maskEmail('abcde@mail.example.co.kr'), 'ab*de@mail.example.co.kr');
});

test('maskEmail: falls back to generic when no local part', () => {
  assert.equal(maskEmail('@example.com'), '@exa****.com');
});

test('maskPhone: masks middle groups, keeps prefix and last group', () => {
  assert.equal(maskPhone('010-1234-5678'), '010-****-5678');
  assert.equal(maskPhone('02-123-4567'), '02-***-4567');
  assert.equal(maskPhone('(010) 1234-5678'), '(010) ****-5678');
  assert.equal(maskPhone('+82 10 1234 5678'), '+82 10 **** 5678');
  assert.equal(maskPhone('+1 555 123 4567'), '+1 555 *** 4567');
  assert.equal(maskPhone('010-12345678'), '010-****5678');
});

test('maskPhone: continuous digit run without separators', () => {
  assert.equal(maskPhone('01012345678'), '010****5678'); // >= 8 digits: keep first 3
  assert.equal(maskPhone('12345678'), '123*5678');
  assert.equal(maskPhone('1234567'), '***4567');
  assert.equal(maskPhone('12345'), '*2345');
});

test('maskPhone: short numbers mask all but the final digit', () => {
  assert.equal(maskPhone('1234'), '***4');
  assert.equal(maskPhone('123'), '**3');
});

test('maskPhone: custom mask character', () => {
  assert.equal(maskPhone('010-1234-5678', '●'), '010-●●●●-5678');
});

test('maskName: masks each word, keeps first/last char', () => {
  assert.equal(maskName('홍길동'), '홍*동');
  assert.equal(maskName('선희'), '선*');
  assert.equal(maskName('김'), '*');
  assert.equal(maskName('John Doe'), 'J**n D*e');
  assert.equal(maskName('Mary Anne Smith'), 'M**y A**e S***h');
  assert.equal(maskName('Kim'), 'K*m');
});

test('maskWord: word-level masking', () => {
  assert.equal(maskWord('Elizabeth'), 'E*******h');
  assert.equal(maskWord('ab'), 'a*');
  assert.equal(maskWord('a'), '*');
});

test('mask: auto type detection', () => {
  assert.equal(mask('hello@example.com'), 'he*lo@example.com');
  assert.equal(mask('010-1234-5678'), '010-****-5678');
  assert.equal(mask('홍길동'), '홍*동');
});

test('mask: explicit type overrides auto', () => {
  assert.equal(mask('홍길동', { type: 'name' }), '홍*동');
  assert.equal(mask('01012345678', { type: 'generic' }), '0101***5678');
});

test('mask: custom maskChar', () => {
  assert.equal(mask('010-1234-5678', { maskChar: '●' }), '010-●●●●-5678');
  assert.equal(mask('hello@example.com', { maskChar: '●' }), 'he●lo@example.com');
});

test('mask: edge cases', () => {
  assert.equal(mask(''), '');
  assert.equal(mask(null), '');
  assert.equal(mask(undefined), '');
});
