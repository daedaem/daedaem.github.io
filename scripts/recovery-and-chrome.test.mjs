import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('an empty wiki result is announced in the visible count row with a reset beside it', () => {
  const wiki = source('src/pages/wiki/index.astro')
  assert.match(wiki, /' · 조건에 맞는 문서가 없습니다'/)
  assert.match(wiki, /id="wiki-clear"[^>]*hidden/)
  assert.match(wiki, /id="wiki-global"/)
  assert.match(wiki, /new CustomEvent\('site-search', \{ detail: query\.value\.trim\(\) \}\)/)
  // 목록의 날짜는 다른 목록과 같은 짧은 형식을 쓴다.
  assert.match(wiki, /formatCompactDate\(entry\.data\.updated \?\? entry\.data\.created\)/)
})

test('the 404 page names the problem and offers search', () => {
  const page = source('src/pages/404.astro')
  assert.match(page, /<h1>페이지를 찾을 수 없습니다<\/h1>/)
  assert.match(page, /id="notfound-search"/)
  assert.match(page, /site-search/)
})

test('the two-row mobile header steps aside while reading and returns on scroll up or focus', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /matchMedia\('\(max-width: 640px\)'\)/)
  assert.match(header, /header\.is-away\s*\{\s*translate: 0 -100%;/)
  assert.match(header, /addEventListener\('focusin'/)
  assert.match(header, /prefers-reduced-motion: reduce/)
})

test('focus rings share one 2px style and search keeps its text label on small screens', () => {
  const css = source('src/styles/global.css')
  assert.match(
    css,
    /:where\(a, button, summary, select, input, textarea, \[tabindex\]\):focus-visible \{\s*outline: 2px solid var\(--accent\);/,
  )
  const search = source('src/components/Search.astro')
  assert.doesNotMatch(search, /#search-open span,\s*#search-open kbd \{\s*display: none;/)
})

test('the dark home panel is a sunken navy instead of the bright logo tile', () => {
  const css = source('src/styles/global.css')
  assert.match(css, /--hero-bg: #223e60;/)
  assert.equal(css.match(/--hero-bg: #1f3148;/g)?.length, 2)
  assert.match(
    source('src/pages/index.astro'),
    /background: var\(--hero-bg\);\s*color: var\(--hero-ink\);/,
  )
})

test('recommended posts show their writing date like every other list', () => {
  assert.match(
    source('src/pages/index.astro'),
    /<time datetime=\{post\.data\.date\.toISOString\(\)\}>\s*작성 \{formatCompactDate\(post\.data\.date\)\}/,
  )
})

test('search labels each result with its kind and keeps wiki navigation out of excerpts', () => {
  const search = source('src/components/Search.astro')
  assert.match(search, /processResult:/)
  assert.match(search, /result\.meta\.title = `\$\{kind\} · \$\{result\.meta\.title\}`/)
  assert.match(search, /id="search-help"/)
  const wiki = source('src/pages/wiki/[...slug].astro')
  assert.match(wiki, /<aside class="side" data-pagefind-ignore>/)
})
