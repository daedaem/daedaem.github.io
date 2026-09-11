import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { checkRenderedCodeContrast, lightCodeBackground } from './code-contrast.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const background = lightCodeBackground(source('src/styles/global.css'))
const block = (
  light = '#e36209',
  dark = '#f97583',
  root = '--shiki-dark-bg:#24292e;--shiki-dark:#e1e4e8',
) =>
  `<pre class="astro-code" style="background-color:#fff;color:#24292e;${root}"><code><span style="color:${light};--shiki-dark:${dark}">if</span></code></pre>`
const article = (attrs, code = block()) => `<article ${attrs}>${code}</article>`

test('missing light background fails closed instead of borrowing the dark palette', () => {
  assert.equal(lightCodeBackground(':root { --code-bg: #fff; }'), '#fff')
  for (const css of [
    ':root { --text: #111; } :root[data-theme="dark"] { --code-bg: #222; }',
    ':root { --code-bg: var(--missing); }',
    ':root[data-theme="dark"] { --code-bg: #222; }',
    '',
  ])
    assert.throws(() => lightCodeBackground(css), /valid light --code-bg/)
  for (const missing of [undefined, null, '', 'var(--missing)']) {
    assert.match(checkRenderedCodeContrast(block(), missing).join(' '), /cannot be skipped/)
  }
})

test('only explicit forced-dark pages omit the unused light pair', () => {
  for (const attrs of [
    'class="post" data-code-theme="dark"',
    "data-code-theme='dark' class='post'",
  ]) {
    assert.deepEqual(checkRenderedCodeContrast(article(attrs), background), [])
  }
  const badDark = checkRenderedCodeContrast(
    article('data-code-theme="dark"', block('#24292e', '#444444')),
    background,
  )
  assert.equal(badDark.length, 1)
  assert.match(badDark[0], /^dark code/)
})

test('wiki .post, archived notes and algorithms keep both light and dark checks', () => {
  for (const attrs of [
    'class="post"',
    'class="post is-archived" data-code-theme="auto"',
    'class="solution"',
    'class="post" data-code-theme="dark-disabled"',
  ]) {
    const failures = checkRenderedCodeContrast(
      article(attrs, block('#e36209', '#444444')),
      background,
    )
    assert.equal(failures.length, 2, attrs)
    assert.ok(failures.some((error) => error.startsWith('light code')))
    assert.ok(failures.some((error) => error.startsWith('dark code')))
  }
  const wrapper = `<div data-code-theme="dark">${article('class="post"')}</div>`
  assert.match(checkRenderedCodeContrast(wrapper, background).join(' '), /light code/)
})

test('forced-dark Shiki blocks require the root foreground and background', () => {
  for (const root of ['', '--shiki-dark:#e1e4e8', '--shiki-dark-bg:#24292e']) {
    const failures = checkRenderedCodeContrast(
      article('data-code-theme="dark"', block('#24292e', '#f97583', root)),
      background,
    )
    assert.equal(failures.length, 1)
    assert.match(failures[0], /Forced-dark code is missing/)
  }
})

test('layout, CSS and the site check share an explicit code-theme contract', () => {
  const layout = source('src/layouts/PostLayout.astro')
  assert.match(layout, /data-code-theme=\{archived \? 'auto' : 'dark'\}/)
  assert.match(layout, /\.post\[data-code-theme='dark'\] \.body :global\(pre\.astro-code\)/)
  assert.doesNotMatch(layout, /\.post:not\(\.is-archived\)/)
  assert.match(source('src/pages/wiki/[...slug].astro'), /<article class="post">/)
  assert.doesNotMatch(source('src/pages/wiki/[...slug].astro'), /data-code-theme="dark"/)
  assert.match(source('scripts/check-site.mjs'), /lightCodeBackground\(readerCss\)/)
})
