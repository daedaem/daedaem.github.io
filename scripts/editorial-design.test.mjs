import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { load } from 'js-yaml'
import {
  COVER_PRESETS,
  isLocalCoverImage,
  resolvePostCover,
  splitEditorialTitle,
} from '../src/utils/editorial.mjs'
import { MONOGRAM_PATH } from '../src/utils/brand.mjs'
import { HOME_READING_PICKS } from '../src/utils/home-content.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('approved articles own their covers rather than borrowing a home position', () => {
  assert.deepEqual(
    HOME_READING_PICKS.map(({ id }) => {
      const raw = source(`src/content/posts/${id}.md`)
      const data = load(raw.match(/^---\n([\s\S]*?)\n---/)[1])
      assert.deepEqual(
        resolvePostCover(data),
        data.coverImage ? { kind: 'image', src: data.coverImage } : { kind: data.cover },
      )
      return data.cover
    }),
    ['null', 'query', 'legacy'],
  )
  for (const cover of ['new-article', 'toString', '__proto__', '', undefined, null]) {
    assert.equal(resolvePostCover({ cover }), undefined)
  }
  assert.deepEqual(resolvePostCover({ cover: 'query' }), { kind: 'query' })
  assert.doesNotMatch(
    source('src/utils/editorial.mjs'),
    /HOME_READING_PICKS|null-and-empty-string-sync-failure|address-search-9s-to-100ms/,
  )
  const home = source('src/pages/index.astro')
  assert.match(home, /selectHomeContent\(posts\)/)
  // 홈은 표지를 그리지 않는다. 추천 글 행은 원인 한 줄(frontmatter cause, 없으면 causeSummary)을 보인다
  assert.doesNotMatch(home, /resolvePostCover|PostCover/)
  assert.match(home, /cause=\{post\.data\.cause \?\? post\.causeSummary\}/)
})

test('custom local covers override presets while empty values stay optional', () => {
  for (const path of ['/uploads/cover.webp', '/uploads/posts/cover.PNG', '/uploads/표지.avif']) {
    assert.ok(isLocalCoverImage(path))
    assert.deepEqual(resolvePostCover({ cover: 'query', coverImage: path }), {
      kind: 'image',
      src: path,
    })
  }
  assert.equal(resolvePostCover(), undefined)
  assert.equal(resolvePostCover({ cover: '', coverImage: null }), undefined)
  assert.deepEqual(resolvePostCover({ cover: 'null', coverImage: '' }), { kind: 'null' })
})

test('cover sources reject remote URLs, traversal, non-images and encoded paths', () => {
  for (const path of [
    undefined,
    null,
    '',
    {},
    'https://example.com/a.png',
    '//example.com/a.png',
    'data:image/png;base64,a',
    '/private/a.png',
    '/uploads/../a.png',
    '/uploads//a.png',
    '/uploads/%2e%2e/a.png',
    '/uploads/a.png?track=1',
    '/uploads/a.png#x',
    '/uploads/a.svg',
    '/uploads/a.html',
    '/uploads/a\\b.png',
    '/uploads/a\nb.png',
  ]) {
    assert.equal(isLocalCoverImage(path), false, String(path))
    assert.equal(resolvePostCover({ coverImage: path }), undefined, String(path))
  }
})

test('home, all-post and category lists share one cover-free row without changing reading pages', () => {
  for (const path of [
    'src/pages/index.astro',
    'src/pages/posts/index.astro',
    'src/pages/categories/[category].astro',
  ]) {
    const text = source(path)
    assert.doesNotMatch(text, /resolvePostCover|PostCover|readingMinutes/)
    assert.match(text, /<PostRow[\s\S]*?category=\{(?:post|p)\.data\.category\}/)
  }
  const row = source('src/components/PostRow.astro')
  assert.doesNotMatch(row, /PostCover|cover|readingMinutes/)
  assert.match(row, /<li class="row"[^>]*>\s*<a class="row-a" href=\{href\}>/)
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /@container \(max-width: 220px\)/)
  assert.match(cover, /alt=""/)
  assert.doesNotMatch(cover, /0[123] \/ FIELD NOTES/)
  assert.doesNotMatch(source('src/layouts/PostLayout.astro'), /<PostCover/)
  assert.deepEqual(Object.keys(COVER_PRESETS), ['null', 'query', 'legacy'])
})

test('title styling preserves every character and only splits the first colon-space', () => {
  const titles = [
    '바꾼 적 없는데 결재가 또 올라온다: 빈 값 비교와 인터페이스 규약',
    '첫째: 둘째: 셋째',
    'https://example.com',
    '제목',
    '',
  ]
  for (const title of titles) {
    const { main, separator, subtitle } = splitEditorialTitle(title)
    assert.equal(main + separator + subtitle, title)
  }
  assert.deepEqual(splitEditorialTitle('첫째: 둘째: 셋째'), {
    main: '첫째',
    separator: ': ',
    subtitle: '둘째: 셋째',
  })
  const layout = source('src/layouts/PostLayout.astro')
  // 제목은 나누지 않고 그대로 둔다. 본문은 슬롯을 문자열로 받아 첫머리 고지를 앞으로 옮긴다
  assert.match(layout, /<h1 tabindex="-1">\{title\}<\/h1>/)
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /original=\{archived\}/)
  assert.match(layout, /publishedAt=\{date\}/)
  assert.match(layout, /updatedAt=\{updated\}/)
  assert.match(layout, /사례 시점 \$\{happened\}/)
  assert.match(layout, /<p class="k">원인 한 줄<\/p>/)
})

test('header and all favicon sizes use the approved monogram', () => {
  assert.match(source('src/components/Mark.astro'), /d=\{MONOGRAM_PATH\}/)
  assert.ok(source('public/favicon.svg').includes(`d="${MONOGRAM_PATH}"`))
  for (const [name, size] of [
    ['favicon-96x96.png', 96],
    ['apple-touch-icon.png', 180],
  ]) {
    const data = readFileSync(new URL(`../public/${name}`, import.meta.url))
    assert.equal(data.toString('hex', 0, 8), '89504e470d0a1a0a')
    assert.equal(data.readUInt32BE(16), size)
    assert.equal(data.readUInt32BE(20), size)
  }
  const ico = readFileSync(new URL('../public/favicon.ico', import.meta.url))
  assert.equal(ico.readUInt16LE(2), 1)
  assert.equal(ico.readUInt16LE(4), 3)
  for (const [index, size] of [16, 32, 48].entries()) {
    const entry = 6 + index * 16
    assert.equal(ico[entry], size)
    assert.equal(ico[entry + 1], size)
    const start = ico.readUInt32LE(entry + 12)
    assert.equal(ico.toString('hex', start, start + 8), '89504e470d0a1a0a')
    assert.ok(start + ico.readUInt32LE(entry + 8) <= ico.length)
  }
})

test('production design retains navigation and real search without mock controls or external fonts', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /PRIMARY_NAV\.map/)
  assert.match(header, /<Search\s*\/>/)
  assert.match(header, /<ThemeToggle\s*\/>/)
  const home = source('src/pages/index.astro')
  assert.doesNotMatch(home, /dd-editorial|data-palette|Tweak|search-dialog|fonts\.googleapis/)
  assert.match(source('src/layouts/PostLayout.astro'), /<Comments\s*\/>/)
  assert.match(source('src/components/Footer.astro'), /href="\/admin\/"/)
})

test('anchor landings and sticky article/wiki navigation share the header clearance', () => {
  const css = source('src/styles/global.css')
  // 머리줄 높이(데스크톱 61, 모바일 96) + 1rem
  assert.match(css, /--header-h: 61px;/)
  assert.match(css, /--header-h: 96px;/)
  assert.match(css, /--header-clearance: calc\(var\(--header-h\) \+ 1rem\);/)
  assert.match(css, /scroll-padding-top: var\(--header-clearance\)/)
  // 위키 목록에는 따라오는 사이드바가 없다(칩 필터가 머리 아래 한 열에 있다)
  assert.doesNotMatch(source('src/pages/wiki/index.astro'), /position: sticky|library-layout/)
  // 글·위키 문서의 오른쪽 레일(전역 nav.rail)도 머리줄 아래에서 시작한다
  assert.match(css, /nav\.rail \{[^}]*top: calc\(var\(--header-clearance\) \+ 1\.5rem\);/)
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    assert.match(source(path), /<nav class="rail" aria-label="차례" data-pagefind-ignore>/)
  }
})

test('home reads label, name, sentence, then recommended rows, recent rows and link rows in one column', () => {
  const home = source('src/pages/index.astro')
  const order = [
    '<section class="ident"',
    'id="recommended-title"',
    'id="recent-title"',
    'id="more-title"',
    '<ul class="linkrows">',
  ].map((needle) => home.indexOf(needle))
  assert.ok(
    order.every((index, i) => index >= 0 && (i === 0 || index > order[i - 1])),
    String(order),
  )
  // 더 보기 행의 건수는 컬렉션에서 센다
  assert.match(home, /\{wiki\.length\}편 · 주제와 상태로 거르기/)
  assert.match(home, /학습 노트 \{notes\.length\}편 · 알고리즘 풀이 \{solutions\.length\}건/)
  assert.doesNotMatch(home, /@media|grid-template|reading-rail|archive-links|selectRecentWiki/)
})

test('row separators are one global rule and the whole row is the link', () => {
  const css = source('src/styles/global.css')
  assert.match(
    css,
    /\.rows > li\s*\{[^}]*position: relative;[^}]*border-bottom: 1px solid var\(--line\);/,
  )
  assert.match(css, /\.row-a\s*\{[^}]*padding: 0\.95rem 0 1\.05rem;[^}]*text-decoration: none;/)
  const row = source('src/components/PostRow.astro')
  const parts = [
    '<span class="k">',
    '<time datetime={date.toISOString()}>',
    '<span class="row-t">',
    '<span class="row-c">',
  ]
  const at = parts.map((needle) => row.indexOf(needle))
  assert.ok(
    at.every((index, i) => index >= 0 && (i === 0 || index > at[i - 1])),
    String(at),
  )
})
