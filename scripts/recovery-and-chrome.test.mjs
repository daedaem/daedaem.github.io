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
  // 빈 결과 안에서도 조건을 지울 수 있다
  assert.match(
    wiki,
    /<div id="wiki-empty" class="empty" hidden>[\s\S]*?id="wiki-reset"[\s\S]*?id="wiki-global"/,
  )
  // 목록의 날짜는 다른 목록과 같은 짧은 형식(PostRow의 formatCompactDate)을 쓴다. 마지막 갱신일이다
  assert.match(
    wiki,
    /const revised = \(entry: [^=]*\) => entry\.data\.updated \?\? entry\.data\.created/,
  )
  assert.match(wiki, /<PostRow[\s\S]*?date=\{revised\(entry\)\}/)
  assert.match(source('src/components/PostRow.astro'), /formatCompactDate\(date\)/)
})

test('the 404 page names the problem and offers search', () => {
  const page = source('src/pages/404.astro')
  assert.match(page, /<h1>페이지를 찾을 수 없습니다<\/h1>/)
  assert.match(page, /id="notfound-search"/)
  assert.match(page, /site-search/)
})

test('the sticky header steps aside while reading on every width and returns on scroll up, focus or an open dialog', () => {
  const header = source('src/components/Header.astro')
  assert.doesNotMatch(header, /matchMedia\('\(max-width: 640px\)'\)/)
  assert.match(header, /y < 120 \|\| header\.contains\(document\.activeElement\) \|\|/)
  assert.match(header, /document\.querySelector\('dialog\[open\]'\)/)
  assert.match(header, /header\.is-away\s*\{\s*translate: 0 -100%;/)
  assert.match(header, /addEventListener\('focusin'/)
  assert.match(header, /prefers-reduced-motion: reduce/)
  assert.match(header, /position: sticky;\s*top: 0;/)
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

test('the home has no navy panel: the identity block is text on the page background', () => {
  const css = source('src/styles/global.css')
  assert.doesNotMatch(css, /--hero-bg|--hero-ink|--cover-navy/)
  const home = source('src/pages/index.astro')
  assert.doesNotMatch(home, /hero|background:/)
  assert.match(
    css,
    /\.ident\s*\{\s*padding-bottom: 1\.1rem;\s*border-bottom: 1px solid var\(--line\);/,
  )
})

test('recommended posts show their writing date like every other list', () => {
  // 홈 추천 글도 PostRow를 쓰므로 같은 <time>과 같은 짧은 날짜 형식을 받는다
  assert.match(source('src/pages/index.astro'), /<PostRow[\s\S]*?date=\{post\.data\.date\}/)
  assert.match(
    source('src/components/PostRow.astro'),
    /<time datetime=\{date\.toISOString\(\)\}>\{formatCompactDate\(date\)\}<\/time>/,
  )
})

test('search labels each result with its kind and keeps wiki navigation out of excerpts', () => {
  const search = source('src/components/Search.astro')
  assert.match(search, /processResult:/)
  assert.match(search, /result\.meta\.title = `\$\{kind\} · \$\{result\.meta\.title\}`/)
  assert.match(search, /id="search-help"/)
  const wiki = source('src/pages/wiki/[...slug].astro')
  for (const chrome of [
    /<details class="toc" data-pagefind-ignore>/,
    /<nav class="rail" aria-label="차례" data-pagefind-ignore>/,
    /<section class="back" aria-label="이 문서를 참고하는 글" data-pagefind-ignore>/,
    /<section class="back" aria-label="같은 주제의 문서" data-pagefind-ignore>/,
  ]) {
    assert.match(wiki, chrome)
  }
})
