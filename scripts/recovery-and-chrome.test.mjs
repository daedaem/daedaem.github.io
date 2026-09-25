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
  // 카드의 날짜는 다른 목록과 같은 짧은 형식(formatCompactDate)을 쓴다. 마지막 갱신일이다
  assert.match(
    wiki,
    /const revised = \(entry: [^=]*\) => entry\.data\.updated \?\? entry\.data\.created/,
  )
  assert.match(wiki, /<a class="wcard"[\s\S]*?formatCompactDate\(revised\(entry\)\)/)
  assert.match(source('src/components/PostRow.astro'), /formatCompactDate\(date\)/)
})

test('the 404 page names the problem and offers search', () => {
  const page = source('src/pages/404.astro')
  assert.match(page, /<h1>페이지를 찾을 수 없습니다 <span class="count-b">404<\/span><\/h1>/)
  assert.match(page, /id="notfound-search"/)
  assert.match(page, /site-search/)
})

test('the sticky header steps aside while reading only on narrow screens and returns on scroll up, focus or an open dialog', () => {
  const header = source('src/components/Header.astro')
  // 데스크톱(한 줄 머리줄)은 늘 둔다. 좁은 화면(두 줄)에서만 아래로 읽을 때 올라간다
  assert.match(header, /const narrow = matchMedia\('\(max-width: 640px\)'\)/)
  assert.match(
    header,
    /!narrow\.matches \|\|\s*y < 120 \|\|\s*header\.contains\(document\.activeElement\) \|\|/,
  )
  // 차례로 건너뛴 큰 이동은 방향으로 세지 않는다(숨은 머리줄이 줄어든 착지 여백 위로 내려오지 않게)
  assert.match(header, /const jumped = Math\.abs\(y - lastY\) > innerHeight/)
  assert.match(
    source('src/styles/global.css'),
    /:root:has\(#site-header\.is-away\) \{\s*--header-clearance: 1\.25rem;/,
  )
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

test('the home has no navy panel: the hero is text on the page background', () => {
  const css = source('src/styles/global.css')
  assert.doesNotMatch(css, /--hero-bg|--hero-ink|--cover-navy/)
  const home = source('src/pages/index.astro')
  assert.doesNotMatch(home, /background:/)
  // 시안의 머리: 판·그림 없이 글자만. 강조는 '원인' 한 낱말의 글자색(그라디언트)뿐이다
  const hero = css.match(/\.hero \{([^}]*)\}/)?.[1]
  assert.doesNotMatch(hero, /background|border/)
  assert.match(css, /\.grad \{[^}]*background-clip: text;[^}]*color: transparent;/)
  assert.match(css, /@media \(forced-colors: active\) \{\s*\.grad \{[^}]*color: CanvasText;/)
})

test('recommended posts show their writing date like every other list', () => {
  // 홈 추천 카드도 번호 줄과 같은 <time>과 같은 짧은 날짜 형식(고정폭 숫자)을 쓴다
  assert.match(
    source('src/pages/index.astro'),
    /<time datetime=\{post\.data\.date\.toISOString\(\)\}>\s*작성 <span class="mono">\{formatCompactDate\(post\.data\.date\)\}<\/span>/,
  )
  assert.match(
    source('src/components/PostRow.astro'),
    /<time class="mono" datetime=\{date\.toISOString\(\)\}\s*>\{formatCompactDate\(date\)\}<\/time\s*>/,
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
