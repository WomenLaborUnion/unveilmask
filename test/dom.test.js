import { test } from 'node:test';
import assert from 'node:assert/strict';

import { render } from '../src/dom.js';

test('render: builds hover-reveal markup with masked text', () => {
  const html = render('hello@example.com');
  assert.ok(html.includes('class="nm"'));
  assert.ok(html.includes('tabindex="0"'));
  assert.ok(html.includes('data-nm-value="hello@example.com"'));
  assert.ok(html.includes('<span class="nm-masked">he*lo@example.com</span>'));
  assert.ok(html.includes('<span class="nm-real" aria-hidden="true">hello@example.com</span>'));
});

test('render: starts revealed when option is set', () => {
  const html = render('010-1234-5678', { revealed: true });
  assert.ok(html.includes('class="nm nm-revealed"'));
});

test('render: escapes HTML in the value', () => {
  const html = render('<script>"x"&</script>');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;'));
});
