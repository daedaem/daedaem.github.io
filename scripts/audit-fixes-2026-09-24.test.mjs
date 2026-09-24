import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// 최종 평가 5명(사용성·타이포그래피·채용 독자·접근성·동료 개발자)이 배포 조건으로 건 수정의 계약.
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const css = source('src/styles/global.css')

test('입력란·선택 상자·단추의 테두리는 바탕과 3:1 이상인 전용 토큰을 쓴다', () => {
  assert.match(css, /--line-input: #767f8c;/)
  assert.equal((css.match(/--line-input: #8a94a3;/g) ?? []).length, 2)
  for (const selector of ['.list-input', '.f-q input', '.btn']) {
    const rule = css.match(new RegExp(selector.replace(/[.]/g, '\\.') + ' \\{[^}]*\\}'))?.[0]
    assert.match(rule, /border: 1px solid var\(--line-input\)/, selector)
  }
  assert.match(
    source('src/components/Search.astro'),
    /\.pagefind-ui__button \{[^}]*border: 1px solid var\(--line-input\)/,
  )
})

test('넓은 화면의 차례 레일은 본문보다 앞에 있어 키보드로 본문을 다 지나지 않아도 닿는다', () => {
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const text = source(path)
    const rail = text.indexOf('<nav class="rail"')
    assert.ok(rail > text.indexOf('<details class="toc"'), path)
    assert.ok(rail < text.indexOf('<div class="prose">'), path)
  }
})

test('강제 색상에서도 눌린 칩과 현재 메뉴가 구분된다', () => {
  assert.match(
    css,
    /@media \(forced-colors: active\) \{\s*\.chip\[aria-pressed='true'\],\s*\.chip\[aria-current\]:not\(\[aria-current='false'\]\) \{\s*forced-color-adjust: none;\s*background: Highlight;/,
  )
  const header = source('src/components/Header.astro')
  assert.match(header, /nav a\[aria-current\] \{[^}]*border-bottom-color: var\(--accent\);/)
  assert.doesNotMatch(header, /box-shadow: inset 0 -2px 0/)
  assert.match(
    header,
    /@media \(forced-colors: active\) \{\s*\.nav a \{\s*border-bottom-style: none;\s*\}\s*nav a\[aria-current\] \{\s*border-bottom-style: solid;/,
  )
})

test('위키 칩은 다른 축의 조건으로 건수를 다시 세고, 0편인 칩은 누를 수 없다', () => {
  const wiki = source('src/pages/wiki/index.astro')
  assert.match(wiki, /import \{ selectDocuments, facetCounts \} from '@\/utils\/wiki-library\.mjs'/)
  assert.match(wiki, /const counts = facetCounts\(docs, \{ query: query\.value, topic, status \}\)/)
  assert.match(wiki, /pressChips\(topics, 'topic', topic, counts\.topic\)/)
  assert.match(wiki, /pressChips\(statusChips, 'status', status, counts\.status\)/)
  assert.match(wiki, /if \(!pressed && count === 0\) chip\.setAttribute\('aria-disabled', 'true'\)/)
  assert.equal(
    (wiki.match(/if \(chip\.getAttribute\('aria-disabled'\) === 'true'\) return/g) ?? []).length,
    2,
  )
  assert.match(css, /\.chip\[aria-disabled='true'\] \{[^}]*cursor: default;/)
  // 빈 결과의 '조건 초기화'를 누르면 초점이 찾기 입력으로 간다
  assert.match(
    wiki,
    /getElementById\('wiki-reset'\)!\.addEventListener\('click', \(\) => \{\s*reset\(\)\s*query\.focus\(\)/,
  )
})

test('위키 문서: 역링크 절은 늘 있고 없으면 한 문장, 머리 메타 줄에 건수 앵커, 상태 설명 한 문장', () => {
  const wiki = source('src/pages/wiki/[...slug].astro')
  assert.match(wiki, /<h2 class="k">이 문서를 참고하는 글·문서<\/h2>/)
  assert.match(wiki, /<p class="none">이 문서를 참고하는 글은 아직 없습니다\.<\/p>/)
  assert.match(
    wiki,
    /references\.length > 0 && \([\s\S]*?href="#back" set:text=\{`참고 \$\{references\.length\} ↓`\}/,
  )
  assert.match(wiki, /'한 차례 정리를 마친 문서입니다\.'/)
  assert.match(wiki, /'보완하는 중입니다\. 빠진 내용이 있을 수 있습니다\.'/)
  assert.match(wiki, /<p class="deck-note">\{statusNote\}<\/p>/)
  // 같은 주제의 문서에서 역링크·이어 읽기에 이미 든 문서는 뺀다
  assert.match(wiki, /const \{ related \} = selectWikiReading\(pool, entry\)/)
  assert.match(wiki, /\.filter\(\(e\) => !listed\.has\(`\/wiki\/\$\{e\.id\}\/`\)\)/)
})

test('메타 줄의 날짜·사례 시점·읽기 시간은 한 덩어리로 줄을 바꾼다', () => {
  assert.match(css, /\.meta time,\s*\.meta \.nowrap \{\s*white-space: nowrap;/)
  const post = source('src/layouts/PostLayout.astro')
  assert.match(post, /<span class="nowrap" set:text=\{`사례 시점 \$\{happened\}`\} \/>/)
  assert.match(post, /<span class="nowrap" set:text=\{`\$\{readingMinutes\}분 읽기`\} \/>/)
  assert.doesNotMatch(
    source('src/components/ContentDates.astro'),
    /\.inline time \{\s*white-space: normal/,
  )
})

test('홈 직무는 이름 옆 본문 크기, 글 목록의 안내는 차례와 같은 펼침 문법, 404 링크는 하나', () => {
  assert.match(css, /\.ident \.role \{\s*font-size: 1\.0625rem;/)
  const posts = source('src/pages/posts/index.astro')
  assert.match(
    posts,
    /<details class="criteria">\s*<summary>\s*<span class="k">기록·날짜 안내<\/span>\s*<svg/,
  )
  assert.match(posts, /\.criteria\[open\] summary svg \{\s*transform: rotate\(180deg\);/)
  assert.match(posts, /\.criteria \{[^}]*border: 1px solid var\(--line\);/)
})

test('작은 조판 결정: 이름 결합 공백, 제목 초점 링, h2 자간, 종류 라벨 nowrap, 주제 이름 원문 표기', () => {
  assert.match(source('src/pages/learn/index.astro'), /학습 노트 아카이브 <span class="n">/)
  assert.match(
    css,
    /h4\[tabindex='-1'\]:focus-visible \{[^}]*outline: 2px solid var\(--accent\);\s*outline-offset: 4px;/,
  )
  assert.doesNotMatch(css, /h4\[tabindex='-1'\]:focus-visible \{[^}]*outline: none/)
  assert.match(css, /\.prose h2 \{[^}]*letter-spacing: -0\.01em;/)
  assert.match(css, /\.k-in \{[^}]*white-space: nowrap;\s*flex-shrink: 0;/)
  assert.match(css, /\.k \.name \{\s*text-transform: none;/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<span class="name">\{cat\.name\}<\/span>/)
  assert.match(row, /<span class="name">\{label\}<\/span>/)
  assert.match(css, /\.prose > \.visually-hidden \{\s*margin: 0;/)
  assert.match(
    css,
    /@media \(max-width: 40em\) \{\s*body \{\s*font-size: 1\.0625rem;\s*line-height: 1\.75;/,
  )
  assert.match(
    source('src/components/Search.astro'),
    /\.pagefind-ui__search-clear:focus-visible,\s*#search-mount \.pagefind-ui__button:focus-visible \{\s*outline: 2px solid var\(--accent\);/,
  )
})
