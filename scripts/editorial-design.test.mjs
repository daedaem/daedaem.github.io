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
  // 홈 추천 카드: 표지 그림이 있는 첫 추천 글이 큰 카드이고, 그림은 글의 coverImage 파일만 쓴다(프리셋 표지 없음).
  // 카드는 원인 한 줄(frontmatter cause, 없으면 causeSummary)을 보인다
  assert.doesNotMatch(home, /resolvePostCover|PostCover/)
  assert.match(
    home,
    /recommended\.find\(\(post\) => post\.data\.coverImage\) \?\? recommended\[0\]/,
  )
  assert.match(home, /<CoverImage\s+class="card-img"\s+src=\{post\.data\.coverImage\}/)
  assert.match(home, /cause: post\.data\.cause \?\? post\.causeSummary/)
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

test('home, all-post and category lists share one cover-free numbered line; covers are real images only', () => {
  for (const path of [
    'src/pages/index.astro',
    'src/pages/posts/index.astro',
    'src/pages/categories/[category].astro',
  ]) {
    const text = source(path)
    assert.doesNotMatch(text, /resolvePostCover|PostCover/)
    assert.match(text, /<PostRow[\s\S]*?category=\{(?:post|p)\.data\.category\}/)
  }
  // 번호 줄에는 표지·읽기 시간이 없다(읽기 시간은 홈 추천 카드와 글 머리에만)
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro'])
    assert.doesNotMatch(source(path), /readingMinutes/)
  const row = source('src/components/PostRow.astro')
  assert.doesNotMatch(row, /PostCover|cover|readingMinutes/)
  assert.match(row, /<li data-id=\{dataId\}>\s*<a class="line" href=\{href\}>/)
  // 표지 그림: 폭·높이·srcset을 등록 정보에서 읽고, 장식이라 alt를 비우며, 비동기로 푼다
  const image = source('src/components/CoverImage.astro')
  assert.match(image, /getCoverImageAttributes\(src\)/)
  assert.match(image, /width=\{width\}\s*height=\{height\}/)
  assert.match(image, /alt=""/)
  assert.match(image, /decoding="async"/)
  assert.match(image, /loading=\{priority \? 'eager' : 'lazy'\}/)
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /@container \(max-width: 220px\)/)
  assert.match(cover, /alt=""/)
  assert.doesNotMatch(cover, /0[123] \/ FIELD NOTES/)
  // 글 머리의 표지는 넓은 화면에서만 제목 옆에 보인다(모바일 본문 시작 예산을 지킨다)
  const layout = source('src/layouts/PostLayout.astro')
  assert.doesNotMatch(layout, /<PostCover/)
  assert.match(layout, /<CoverImage class="art-cover" src=\{cover\} sizes="200px" \/>/)
  const css = source('src/styles/global.css')
  assert.match(css, /\.art-cover \{\s*display: none;/)
  assert.match(css, /@media \(min-width: 64em\) \{[^@]*\.art-cover \{\s*display: block;/)
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
  // 바닥글: 글 · 위키 · 학습 기록 · 소개 · 프로젝트 · RSS · GitHub · Email · LinkedIn.
  // 작성자 도구(/admin/)는 바닥글에 두지 않는다(페이지는 남아 주소로 연다)
  const footer = source('src/components/Footer.astro')
  assert.doesNotMatch(footer, /href="\/admin\/"/)
  assert.match(footer, /href="\/projects\/"/)
  assert.match(footer, /mailto:\$\{SITE\.email\}/)
  assert.match(footer, /SITE\.linkedinUrl/)
  assert.deepEqual(
    [...footer.matchAll(/<a href=[^>]*>([^<]+)<\/a>/g)].map((m) => m[1]),
    ['글', '위키', '학습 기록', '소개', '프로젝트', 'RSS', 'GitHub', 'Email', 'LinkedIn'],
  )
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

test('home reads hero, then recommended cards, recent lines, wiki tiles and learning tiles in one column', () => {
  const home = source('src/pages/index.astro')
  const order = [
    '<section class="hero"',
    'id="recommended-title"',
    '<ul class="cards">',
    'id="recent-title"',
    '<ol class="nlist">',
    'id="wiki-title"',
    '<div class="bento">',
    '<ul class="elist"',
    'id="learn-title"',
  ].map((needle) => home.indexOf(needle))
  assert.ok(
    order.every((index, i) => index >= 0 && (i === 0 || index > order[i - 1])),
    String(order),
  )
  // 타일·주제·행의 건수는 컬렉션에서 센다(위키 상태, 주제별 건수, 노트 연도, 풀이 사이트별, 프로젝트)
  assert.match(home, /정리됨 \{wikiStats\.stable\} · 보완 중 \{wikiStats\.growing\}/)
  assert.match(home, /href=\{`\/wiki\/\?topic=\$\{topic\.id\}`\}/)
  assert.match(home, /\{topic\.name\} <span class="n">\{topic\.count\}<\/span>/)
  assert.match(home, /selectRecentWiki\(wiki, 5\)/)
  assert.match(home, /formatCompactDate\(revised\)\.slice\(5\)/)
  assert.match(home, /백준 \{boj\} · 프로그래머스 \{pgs\}/)
  assert.match(home, /개인 \{PROJECTS\.length\}건 진행 중 · 팀 \{TEAM_PROJECTS\.length\}건/)
  assert.doesNotMatch(home, /주제와 상태로 거르기|2021년 12월부터/)
  assert.deepEqual(
    [...home.matchAll(/<a class="tile" href="([^"]+)">/g)].map((m) => m[1]),
    ['/wiki/', '/notes/', '/algorithms/', '/projects/'],
  )
  assert.doesNotMatch(home, /@media|grid-template|reading-rail|archive-links/)
})

test('numbered lines are one global rule and the whole line is the link', () => {
  const css = source('src/styles/global.css')
  // 시안의 번호 줄: "01." 고정폭 번호, 18px 제목, 가리키면 › 화살표만 나타난다(움직이지 않는다)
  assert.match(css, /\.line \{[^}]*display: flex;[^}]*padding: 10px 0;[^}]*text-decoration: none;/)
  assert.match(css, /\.line-t \{[^}]*font-size: 1\.125rem;[^}]*font-weight: 500;/)
  assert.match(css, /\.chev \{[^}]*opacity: 0;[^}]*transition: opacity 0\.15s;/)
  assert.match(css, /\.line:hover \.chev,\s*\.line:focus-visible \.chev \{\s*opacity: 1;/)
  const row = source('src/components/PostRow.astro')
  const parts = [
    '<span class="line-n" aria-hidden="true">',
    '<span class="line-t"',
    '<span class="line-s">',
    '<time class="mono" datetime={date.toISOString()}',
    '<span class="line-c">',
  ]
  const at = parts.map((needle) => row.indexOf(needle))
  assert.ok(
    at.every((index, i) => index >= 0 && (i === 0 || index > at[i - 1])),
    String(at),
  )
})
