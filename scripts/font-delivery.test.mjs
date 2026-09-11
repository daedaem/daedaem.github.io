import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { inlineFontCSS } from '../src/utils/font-css.mjs'

const css = readFileSync(new URL('../public/fonts/pretendard/pretendardvariable-dynamic-subset.min.css', import.meta.url), 'utf8')
const result = inlineFontCSS(css)

test('inlined font declarations retain every subset, unicode range, weight and swap behavior', () => {
  assert.equal(result.replaceAll('url(/fonts/pretendard/woff2/', 'url(./woff2/'), css)
  assert.equal((result.match(/@font-face/g) ?? []).length, 92)
  assert.equal((result.match(/font-display:swap/g) ?? []).length, 92)
})
test('font URLs remain valid on nested article paths', () => {
  const urls = [...result.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1])
  assert.equal(urls.length, 92)
  for (const url of urls) {
    assert.ok(url.startsWith('/fonts/pretendard/woff2/'))
    assert.ok(existsSync(new URL('../public' + url, import.meta.url)), url)
  }
})
test('head uses the rebased declarations without a blocking font stylesheet or new script', () => {
  const head = readFileSync(new URL('../src/components/BaseHead.astro', import.meta.url), 'utf8')
  assert.match(head, /<style is:inline set:html=\{inlineFontCSS\(pretendardCss\)\}/)
  assert.doesNotMatch(head, /rel="stylesheet" href="\/fonts\/pretendard/)
  assert.match(head, /\[90, 89, 91\]/)
})
