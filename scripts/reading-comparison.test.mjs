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
  // 시안의 알약 칩. 무채색이라 분류 색점은 두지 않는다
  assert.match(nav, /class="chip"[\s\S]*?aria-current=\{active === c\.id \? 'page' : undefined\}/)
  assert.doesNotMatch(nav, /data-cat/)
  assert.match(nav, /<span class="n">\{counts\.get\(c\.id\) \?\? 0\}<\/span>/)
  for (const gone of ['ReadingCatalog', 'ReadingCategories']) {
    assert.equal(existsSync(new URL(`../src/components/${gone}.astro`, import.meta.url)), false)
  }
})

test('lines carry the category name, a compact mono date and no thumbnail or reading time', () => {
  const row = source('src/components/PostRow.astro')
  // 작은 줄은 분류(또는 주제) 이름을 쓴 대로 두고 색점은 두지 않는다(시안의 무채색 줄)
  assert.match(row, /cat\?\.name \?\? label/)
  assert.match(
    row,
    /<time class="mono" datetime=\{date\.toISOString\(\)\}\s*>\{formatCompactDate\(date\)\}<\/time\s*>/,
  )
  assert.doesNotMatch(row, /PostCover|<img|readingMinutes|분 읽기|ContentDates|data-cat|dot hue/)
  assert.doesNotMatch(source('src/styles/global.css'), /\[data-cat\]::before|\.dot\.hue/)
})

test('both catalog routes use the same rows, head and chip navigation', () => {
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro']) {
    const text = source(path)
    assert.match(text, /<div class="page">/)
    assert.match(text, /<PageHead title=/)
    assert.match(text, /<CategoryNav counts=\{counts\} total=\{(?:posts\.length|total)\}/)
    assert.match(
      text,
      /<ol class="nlist long">\s*\{posts\.map\(\(p, i\) => \(\s*<PostRow\s*n=\{i \+ 1\}/,
    )
    assert.doesNotMatch(text, /updated=\{p\.data\.updated\}|ReadingCatalog|wrap-wide/)
  }
  // 분류 페이지 머리: 제목 옆 건수 배지(시안의 .count-b)
  assert.match(
    source('src/pages/categories/[category].astro'),
    /<PageHead title=\{category\.name\} label=\{`\$\{posts\.length\}편`\}>/,
  )
  const head = source('src/components/PageHead.astro')
  assert.match(
    head,
    /<header class="phead">\s*<h1>\s*\{title\}\{\s*label && \(\s*<>\s*\{' '\}\s*<span class="count-b">\{label\}<\/span>/,
  )
})

test('home recommended cards show the cause line and keep the full title in the card link', () => {
  const home = source('src/pages/index.astro')
  assert.match(
    home,
    /\{\[lead, \.\.\.pair\]\.map\(\(post\) => \{[\s\S]*?<a class:list=\{\['card', \{ big \}\]\} href=\{c\.href\}>[\s\S]*?<h3 class="card-t">\{post\.data\.title\}<\/h3>/,
  )
  assert.match(home, /cause: post\.data\.cause \?\? post\.causeSummary/)
  assert.doesNotMatch(home, /splitEditorialTitle|heading\.subtitle|class="subtitle"|card-title/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<span class="line-t"\s*>\{title\}/)
  assert.match(row, /<span class="line-c">\s*<span class="ck">원인<\/span>\s*\{cause\}\s*<\/span>/)
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
  // 사례 글도 다른 글과 같은 본문 크기(전역 body)를 쓴다. 강제 다크 코드 면은 없다
  assert.doesNotMatch(layout, /data-code-theme/)
  assert.doesNotMatch(layout, /font-size:\s*1\.0625rem/)
  // 제목은 나누지 않고 그대로 h1에 둔다
  assert.match(layout, /<h1 tabindex="-1">\{title\}<\/h1>/)
  assert.doesNotMatch(layout, /splitEditorialTitle|class="subtitle"/)
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /<Comments\s*\/>/)
  assert.match(layout, /\{cause\}/)
})
