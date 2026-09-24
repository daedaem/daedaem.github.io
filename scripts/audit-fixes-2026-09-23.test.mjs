import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('버튼을 누른 뒤에도 키보드 초점이 제자리에 남는다', () => {
  // 복사 중 버튼을 비활성화하면 초점이 body로 떨어진다. 중복 실행은 createCodeCopy의 busy가 막는다.
  assert.doesNotMatch(source('src/layouts/BaseLayout.astro'), /btn\.disabled/)
  assert.match(source('src/utils/code-copy.mjs'), /if \(busy\) return/)
  // 위키 쪽을 넘기면 초점을 목록 제목으로 옮긴다
  const wiki = source('src/pages/wiki/index.astro')
  assert.match(wiki, /<h2 id="wiki-heading" tabindex="-1">/)
  assert.match(wiki, /heading\.focus\(\{ preventScroll: true \}\)/)
})

test('검색 대화상자: 초점이 제목 띠에 가려지지 않고, 결과 수와 부분 일치를 알린다', () => {
  const search = source('src/components/Search.astro')
  assert.match(search, /#search-dialog \{[^}]*scroll-padding-top:/)
  assert.match(search, /id="search-status"[^>]*role="status"/)
  assert.match(search, /id="search-partial"[^>]*hidden/)
  assert.match(search, /new MutationObserver/)
})

test('안내 문장 속 링크는 밑줄로 링크임을 보인다', () => {
  assert.match(source('src/styles/global.css'), /\.text-link \{[^}]*text-decoration: underline;/)
  const notFound = source('src/pages/404.astro')
  assert.match(notFound, /class="text-link"[^>]*href="\/notes\/"/)
  // 404의 이동 행: 글 목록 · 학습 위키 · 학습 노트 아카이브 · 검색 단추. 화살표는 모바일에서도 보인다
  assert.match(notFound, /<ul class="linkrows">/)
  for (const href of ['/posts/', '/wiki/', '/notes/'])
    assert.ok(notFound.includes(`href: '${href}'`))
  assert.match(notFound, /<button type="button" id="notfound-search">/)
  assert.match(source('src/pages/projects.astro'), /class="text-link" href="\/posts\/"/)
  assert.match(
    source('src/layouts/PostLayout.astro'),
    /class="text-link archive-link" href="\/notes\/"/,
  )
})

test('표 칸은 낱말 중간에서 끊지 않는다', () => {
  assert.match(source('src/styles/global.css'), /th,\s*td \{[^}]*overflow-wrap: normal;/)
})

test('글이 없는 분류와 문서가 없는 정리 상태는 만들지 않는다', () => {
  assert.match(
    source('src/pages/categories/[category].astro'),
    /CATEGORIES\.filter\(\(category\) => \(counts\.get\(category\.id\) \?\? 0\) > 0\)/,
  )
  assert.match(
    source('src/pages/wiki/index.astro'),
    /entries\.some\(\(entry\) => entry\.data\.status === value\)/,
  )
})

test('목록의 순서와 표기가 화면에 보이는 값과 맞는다', () => {
  // 태그 페이지는 작성일만 보이므로 작성일로 정렬한다
  const tags = source('src/pages/tags/[tag].astro')
  assert.match(tags, /sortDate: w\.data\.created,/)
  assert.doesNotMatch(tags, /sortDate: w\.data\.updated/)
  // 읽기 시간은 어디서나 'N분 읽기'로 쓴다
  assert.doesNotMatch(source('src/components/PostRow.astro'), /\}분<\/span>/)
  assert.doesNotMatch(source('src/layouts/PostLayout.astro'), /\}분<\/span>/)
  // 글 목록 안내는 상세 화면과 같은 이름('사례 시점')을 쓴다
  const posts = source('src/pages/posts/index.astro')
  assert.match(posts, /사례 시점/)
  assert.doesNotMatch(posts, /사건 시기/)
  // 이어 읽기는 같은 주제로 한정하지 않으므로 제목도 약속하지 않는다
  assert.doesNotMatch(source('src/components/RelatedReading.astro'), /같은 주제로/)
})

test('풀이 상세는 목록과 같은 레벨 표기를 쓰고, 설명에 빈 조각을 남기지 않는다', () => {
  const page = source('src/pages/algorithms/[...slug].astro')
  assert.match(page, /tier\.replace\(\/\^lv\(\\d\)\$\/, 'Level \$1'\)/)
  assert.match(page, /\.filter\(Boolean\)/)
  assert.doesNotMatch(page, /\{d\.tier\}/)
})

test('현재 페이지와 현재 구역을 구분해 알린다', () => {
  assert.match(source('src/components/Header.astro'), /path === item\.href \? 'page' : 'true'/)
  assert.match(source('src/components/Header.astro'), /nav a\[aria-current\] \{/)
  assert.match(source('src/components/LearningNav.astro'), /path === link\.href \? 'page'/)
})

test('필터 주소로 연 알고리즘 목록은 복원이 끝날 때까지 숨겨 화면이 밀리지 않는다', () => {
  const page = source('src/pages/algorithms/index.astro')
  assert.match(page, /classList\.add\('algo-restoring'\)/)
  // 모듈이 실패해도 목록이 영영 숨지 않도록 자동 해제를 둔다
  assert.match(
    page,
    /setTimeout\(\(\) => document\.documentElement\.classList\.remove\('algo-restoring'\), \d+\)/,
  )
  assert.match(
    page,
    /readURL\(\)\s*document\.documentElement\.classList\.remove\('algo-restoring'\)/,
  )
})

test('표지 img에 sizes가 한 번만 나간다', () => {
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /const \{ sizes: _defaultSizes, \.\.\.spreadAttributes \}/)
  assert.match(cover, /\{\.\.\.spreadAttributes\}/)
  assert.doesNotMatch(cover, /\{\.\.\.imageAttributes\}/)
})

test('노트 상세도 사례 글·위키와 같은 목차를 받는다', () => {
  const note = source('src/pages/notes/[...slug].astro')
  assert.match(note, /const \{ Content, headings \} = await render\(note\)/)
  assert.match(note, /headings=\{headings\}/)
})

test('넓은 화면 글 목록은 표지가 요약 옆까지 걸쳐 제목과 요약 사이가 비지 않는다', () => {
  const row = source('src/components/PostRow.astro')
  assert.match(
    row,
    /@media \(min-width: 768px\)[\s\S]*\.row\.with-cover:not\(\.no-desc\) \.row-content \{[^}]*'desc cover'/,
  )
})

test('찾는 목록은 행 전체를 누를 수 있다', () => {
  assert.match(source('src/styles/global.css'), /\.stretched-link::after \{[^}]*inset: 0;/)
  for (const [path, row] of [
    ['src/pages/notes/index.astro', /\n  li \{[^}]*position: relative;/],
    ['src/pages/algorithms/index.astro', /\.list li \{[^}]*position: relative;/],
    ['src/pages/tags/[tag].astro', /\.list li \{[^}]*position: relative;/],
    ['src/pages/algorithms/[...slug].astro', /\.related li \{[^}]*position: relative;/],
    ['src/pages/wiki/index.astro', /\.documents li \{[^}]*position: relative;/],
  ]) {
    const text = source(path)
    assert.match(text, /class="(name )?stretched-link"/, `${path}의 목록 링크`)
    assert.match(text, row, `${path}의 행이 링크의 기준 상자가 된다`)
  }
  // 한 줄짜리 보조 링크도 44px
  assert.match(
    source('src/pages/algorithms/[...slug].astro'),
    /\.source-link \{[^}]*min-height: var\(--control-size\)/,
  )
  assert.match(
    source('src/layouts/PostLayout.astro'),
    /section\.back a \{[^}]*min-height: var\(--control-size\)/,
  )
})
