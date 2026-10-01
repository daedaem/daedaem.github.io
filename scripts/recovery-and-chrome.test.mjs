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
  // 목록의 날짜는 다른 목록과 같은 짧은 형식(PostRow의 formatCompactDate)을 쓴다. 처음 쓴 날이다
  assert.match(wiki, /const revised = \(entry: [^=]*\) => entry\.data\.created\n/)
  assert.match(wiki, /<PostRow[\s\S]*?date=\{revised\(entry\)\}/)
  assert.match(source('src/components/PostRow.astro'), /formatCompactDate\(date\)/)
})

test('the 404 page names the problem and offers search', () => {
  const page = source('src/pages/404.astro')
  assert.match(page, /<h1>페이지를 찾을 수 없습니다<\/h1>/)
  assert.match(page, /id="notfound-search"/)
  assert.match(page, /site-search/)
})

test('saved s4 header stays in document flow without obscuring reading or anchor targets', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /<header id="site-header" class="top">/)
  assert.doesNotMatch(
    header,
    /position:\s*(?:sticky|fixed)|is-away|addEventListener\('scroll'|<script/,
  )
  assert.match(header, /\.top-in\s*\{[^}]*min-height:\s*64px/)
  const css = source('src/styles/global.css')
  assert.match(css, /--header-h:\s*0px/)
  assert.match(css, /--header-clearance:\s*24px/)
  assert.match(css, /scroll-padding-top:\s*var\(--header-clearance\)/)
  assert.match(header, /<Search\s*\/>/)
  assert.match(header, /<ThemeToggle\s*\/>/)
})

test('focus rings share one 2px style and search retains an accessible name on small screens', () => {
  const css = source('src/styles/global.css')
  assert.match(
    css,
    /:where\(a, button, summary, select, input, textarea, \[tabindex\]\):focus-visible \{\s*outline: 2px solid var\(--accent\);/,
  )
  const search = source('src/components/Search.astro')
  assert.match(search, /id="search-open"[\s\S]*?aria-label="검색"/)
  assert.match(source('src/components/Header.astro'), /#search-open\)\s*\{[^}]*width:\s*44px/)
  assert.doesNotMatch(
    source('src/components/Header.astro'),
    /#search-open\)\s*\{[^}]*display:\s*none/,
  )
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

test('saved s4 posts retain the same authoring date semantics as other lists', () => {
  // 홈 추천 글도 PostRow를 쓰므로 같은 <time>과 같은 짧은 날짜 형식을 받는다
  assert.match(source('src/pages/index.astro'), /<CaseRow[\s\S]*?date=\{post\.data\.date\}/)
  assert.match(
    source('src/components/CaseRow.astro'),
    /<time datetime=\{date\.toISOString\(\)\}\s*>\{formatCompactDate\(date\)\}<\/time>/,
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
    /<section\s+class="back"\s+id="back"\s+aria-label="이 문서를 참고하는 글·문서"\s+data-pagefind-ignore\s*>/,
    /<section class="back" aria-label="같은 주제의 문서" data-pagefind-ignore>/,
  ]) {
    assert.match(wiki, chrome)
  }
})
