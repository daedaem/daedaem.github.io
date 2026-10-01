import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('category navigation is one chip row of real links: no sidebar, no disclosure, no script', () => {
  const nav = source('src/components/CategoryNav.astro')
  assert.match(nav, /<nav class="chips catnav" aria-label="카테고리">/)
  assert.doesNotMatch(nav, /<details|<script|matchMedia|position: sticky/)
  assert.match(nav, /counts\.get\(c\.id\) \?\? 0\) > 0/)
  assert.match(nav, /href=\{`\/categories\/\$\{c\.id\}\/`\}/)
  assert.match(
    nav,
    /class="chip"[\s\S]*?data-cat=\{c\.id\}[\s\S]*?aria-current=\{active === c\.id \? 'page' : undefined\}/,
  )
  assert.match(nav, /<span class="n">\{counts\.get\(c\.id\) \?\? 0\}<\/span>/)
  for (const gone of ['ReadingCatalog', 'ReadingCategories']) {
    assert.equal(existsSync(new URL(`../src/components/${gone}.astro`, import.meta.url)), false)
  }
})

test('archive rows retain their metadata and case rows add illustrations without inventing reading times', () => {
  const row = source('src/components/PostRow.astro')
  // 분류 이름은 .name으로 감싸 라벨의 대문자 변환을 받지 않는다(Spring은 Spring으로 보인다)
  assert.match(
    row,
    /<span data-cat=\{cat\.id\}>\s*<span class="name">\{cat\.name\}<\/span>\s*<\/span>/,
  )
  assert.match(
    row,
    /<time datetime=\{date\.toISOString\(\)\}>\{formatCompactDate\(date\)\}<\/time>/,
  )
  assert.doesNotMatch(row, /PostCover|<img|readingMinutes|분 읽기|ContentDates/)
  // 위키 주제처럼 색상각만 있는 이름은 점(.dot.hue)을 앞에 붙인다
  assert.match(row, /<i class="dot hue" style=\{`--wt: \$\{hue\}`\} aria-hidden="true" \/>/)
  assert.match(
    source('src/styles/global.css'),
    /\.dot\.hue\s*\{\s*--dot: hsl\(var\(--wt\) 65% 48%\);/,
  )
  const caseRow = source('src/components/CaseRow.astro')
  assert.match(caseRow, /\{cat && <span>\{cat\.name\}<\/span>\}/)
  assert.match(
    caseRow,
    /<time datetime=\{date\.toISOString\(\)\}\s*>\{formatCompactDate\(date\)\}<\/time>/,
  )
  assert.match(caseRow, /kind && \(\s*<div class="cover">\s*<IsometricCover kind=\{kind\} \/>/)
  assert.doesNotMatch(caseRow, /<img|readingMinutes|분 읽기|ContentDates/)
})

test('both catalog routes use the same s4 case rows, full metadata and real category navigation', () => {
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro']) {
    const text = source(path)
    assert.match(text, /<div class="page case-page">/)
    assert.match(text, /<PageHead title=/)
    assert.match(text, /<CategoryNav counts=\{counts\} total=\{(?:posts\.length|total)\}/)
    assert.match(text, /<ol class="case-list">\s*\{posts\.map\(\(p\) => \(\s*<CaseRow/)
    assert.match(
      text,
      /href=\{`\/posts\/\$\{p\.id\}\/`\}[\s\S]*?title=\{p\.data\.title\}[\s\S]*?description=\{p\.data\.description\}[\s\S]*?date=\{p\.data\.date\}[\s\S]*?happened=\{p\.data\.happened\}[\s\S]*?category=\{p\.data\.category\}/,
    )
    assert.match(text, /getCollection\('posts', \(\{ data \}\) => !data\.draft\)/)
    assert.match(text, /b\.data\.date\.valueOf\(\) - a\.data\.date\.valueOf\(\)/)
    assert.doesNotMatch(text, /headingLevel=\{3\}/)
    assert.doesNotMatch(text, /updated=\{p\.data\.updated\}|ReadingCatalog|wrap-wide/)
  }
  // 분류 페이지 머리는 건수 라벨과 분류 점을 함께 둔다
  assert.match(
    source('src/pages/categories/[category].astro'),
    /<PageHead title=\{category\.name\} label=\{`\$\{posts\.length\}편`\} category=\{category\.id\}>/,
  )
  const head = source('src/components/PageHead.astro')
  assert.match(
    head,
    /<header class="phead">\s*\{label && <p class="k">\{label\}<\/p>\}\s*<h1 data-cat=\{category\}>\{title\}<\/h1>/,
  )
})

test('home uses one published case list with full titles and descriptions while archive cause lines remain intact', () => {
  const home = source('src/pages/index.astro')
  assert.match(
    home,
    /posts\.map\(\(post\) => \(\s*<CaseRow\s+headingLevel=\{3\}[\s\S]*?title=\{post\.data\.title\}[\s\S]*?description=\{HOME_SUMMARIES\[post\.id\] \?\? post\.data\.description\}[\s\S]*?date=\{post\.data\.date\}/,
  )
  assert.doesNotMatch(home, /splitEditorialTitle|heading\.subtitle|class="subtitle"|card-title/)
  assert.equal((home.match(/<ol class="case-list">/g) ?? []).length, 1)
  assert.match(home, /getCollection\('posts', \(\{ data \}\) => !data\.draft\)/)
  assert.doesNotMatch(home, /recommended\.map|selectHomeContent/)
  assert.match(home, /<h2 id="posts-title">글 <span>\{posts\.length\}<\/span><\/h2>/)
  const caseRow = source('src/components/CaseRow.astro')
  assert.match(caseRow, /headingLevel = 2 \} = Astro\.props/)
  assert.match(caseRow, /const Heading = headingLevel === 3 \? 'h3' : 'h2'/)
  assert.match(
    caseRow,
    /<a class:list=\{[^\n]+\} href=\{href\}>\s*<Heading class="reading-title"><TitleText title=\{title\} \/><\/Heading>/,
  )
  assert.match(caseRow, /\{description && <p class="reading-excerpt">\{description\}<\/p>\}/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<span class="row-t">\{title\}<\/span>/)
  assert.match(
    row,
    /<span class="row-c">\s*<span class="row-ck">원인<\/span>\s*\{cause\}\s*<\/span>/,
  )
})

test('catalog explanations are disclosed, not deleted, and original date meaning is retained', () => {
  const posts = source('src/pages/posts/index.astro')
  assert.match(posts, /<p class="lede">실제로 맡아 고친 문제를 남깁니다\.<\/p>/)
  assert.match(posts, /<details class="criteria">/)
  assert.match(posts.replace(/\s+/g, ' '), /작성일은 그 일을 블로그에 글로 정리한 날입니다\./)
  assert.match(posts, /min-height:\s*var\(--control-size\)/)
  // 머리 라벨은 건수만("6편"). 제목 '글'을 라벨에 되풀이하지 않는다
  assert.match(posts, /<PageHead title="글" label=\{`\$\{posts\.length\}편`\}>/)
})

test('reader changes are scoped to cases and preserve full title, cause, content and comments', () => {
  const layout = source('src/layouts/PostLayout.astro')
  // 사례 본문은 s4의 18px 읽기 조판이다. 강제 다크 코드 면은 없고 기존 학습 노트는 보존한다.
  assert.doesNotMatch(layout, /data-code-theme/)
  assert.doesNotMatch(layout, /font-size:\s*1\.0625rem/)
  // 제목은 부제처럼 나누지 않고 같은 모양 그대로 h1에 둔다(줄바꿈만 콜론 뒤에서)
  assert.match(layout, /<h1 tabindex="-1"><TitleText title=\{title\} \/><\/h1>/)
  assert.doesNotMatch(layout, /class="subtitle"/)
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /<Comments\s*\/>/)
  assert.match(layout, /\{cause\}/)
  assert.match(layout, /'is-archived': archived, 'case-article': !archived/)
  assert.match(layout, /\.case-article \.prose\s*\{\s*font-size: 18px;\s*line-height: 32px;/)
  assert.match(layout, /if \(document\.querySelector\('\.is-archived'\)\) initTocSheet\(\)/)
  assert.match(
    layout,
    /<details class:list=\{\['toc', \{ 'case-toc': !archived \}\]\} data-pagefind-ignore>/,
  )
})
