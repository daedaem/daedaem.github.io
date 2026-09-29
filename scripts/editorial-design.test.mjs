import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { load } from 'js-yaml'
import {
  COVER_PRESETS,
  isLocalCoverImage,
  resolvePostCover,
  splitEditorialTitle,
} from '../src/utils/editorial.mjs'
import { MARK_PATH } from '../src/utils/brand.mjs'
import { HOME_READING_PICKS } from '../src/utils/home-content.mjs'
import { isometricCoverForSlug, isometricCoverSources } from '../src/utils/isometric-covers.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('article-owned cover metadata stays valid and s4 figures resolve by article identity', () => {
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
  // s4 replaces positional recommendations with all published articles; each figure belongs to a slug.
  assert.match(home, /getCollection\('posts',\s*\(\{\s*data\s*\}\)\s*=>\s*!data\.draft\)/)
  assert.match(
    home,
    /<CaseRow[\s\S]*?title=\{post\.data\.title\}[\s\S]*?description=\{post\.data\.description\}/,
  )
  assert.doesNotMatch(home, /resolvePostCover|PostCover|selectHomeContent/)
  const expected = {
    'null-and-empty-string-sync-failure': 'nullsync',
    'address-search-9s-to-100ms': 'address',
    'retire-flash-module-by-integration': 'flash',
    'disk-99-percent-check-before-expanding': 'disk',
    'integer-overflow-negative-amount': 'overflow',
    'phantom-batch-after-was-migration': 'phantom',
  }
  for (const [slug, kind] of Object.entries(expected)) {
    assert.equal(isometricCoverForSlug(slug), kind)
    const sources = isometricCoverSources(kind)
    assert.equal(sources.width / sources.height, 1.5)
    for (const theme of ['light', 'dark']) {
      assert.match(sources[theme].src, new RegExp(`^/uploads/post-covers/cut-${kind}(?:-dark)?\\.webp$`))
      for (const width of [320, 768, 1440]) {
        const file = sources[theme].srcset.match(new RegExp(`(\\S+) ${width}w`))?.[1]
        assert.ok(file, `${kind} ${theme} ${width}w`)
        assert.ok(existsSync(new URL(`../public${file}`, import.meta.url)), `${file} exists`)
      }
    }
  }
  assert.equal(isometricCoverSources('hero'), undefined)
  for (const slug of ['new-article', 'toString', '__proto__', '', undefined, null]) {
    assert.equal(isometricCoverForSlug(slug), undefined)
  }
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

test('home and catalogs share one illustrated row while archive rows and legacy cover assets remain valid', () => {
  for (const path of [
    'src/pages/index.astro',
    'src/pages/posts/index.astro',
    'src/pages/categories/[category].astro',
  ]) {
    const text = source(path)
    assert.doesNotMatch(text, /resolvePostCover|PostCover|readingMinutes/)
    assert.match(text, /<CaseRow[\s\S]*?category=\{(?:post|p)\.data\.category\}/)
  }
  const row = source('src/components/CaseRow.astro')
  assert.match(
    row,
    /<li class="case-row">\s*<a class:list=\{\['reading-card',[\s\S]*?href=\{href\}>/,
  )
  assert.match(row, /isometricCoverForSlug\(href\.split\('\/'\)\.filter\(Boolean\)\.at\(-1\)\)/)
  assert.match(
    row,
    /kind && \(\s*<div class="cover">\s*<IsometricCover kind=\{kind\} \/>\s*<\/div>/,
  )
  assert.match(row, /'without-cover': !kind/)
  assert.doesNotMatch(row, /readingMinutes|분 읽기/)
  const archiveRow = source('src/components/PostRow.astro')
  assert.doesNotMatch(archiveRow, /PostCover|cover|readingMinutes/)
  assert.match(archiveRow, /<li class="row"[^>]*>\s*<a class="row-a" href=\{href\}>/)
  const illustration = source('src/components/IsometricCover.astro')
  assert.match(illustration, /aria-hidden="true"/)
  assert.match(illustration, /width:\s*100%;[\s\S]*?height:\s*100%/)
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /@container \(max-width: 220px\)/)
  assert.match(cover, /alt=""/)
  assert.doesNotMatch(cover, /0[123] \/ FIELD NOTES/)
  assert.doesNotMatch(source('src/layouts/PostLayout.astro'), /<PostCover/)
  assert.match(source('src/layouts/PostLayout.astro'), /<IsometricCover kind=\{coverKind\} \/>/)
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

test('s4 header identity and all preserved favicon sizes have their approved assets', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /aria-label=\{`\$\{SITE\.title\} 홈`\}/)
  assert.match(header, /<Mark size=\{20\} class="mark" \/>\{SITE\.title\}/)
  assert.doesNotMatch(header, /rotate\(45deg\)/)
  const mark = source('src/components/Mark.astro')
  assert.match(mark, /d=\{MARK_PATH\}/)
  assert.match(mark, /fill-rule="evenodd"/)
  assert.match(mark, /fill="var\(--mark-dot\)"/)
  assert.ok(source('public/favicon.svg').includes(`d="${MARK_PATH}"`))
  assert.ok(source('public/favicon.svg').includes('fill="#eca574"'))
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
  assert.match(
    header,
    /visibleNav\s*=\s*PRIMARY_NAV\.filter\(\(item\)\s*=>\s*item\.href\s*!==\s*'\/learn\/'\)/,
  )
  assert.match(header, /visibleNav\.map/)
  assert.match(source('src/utils/navigation.mjs'), /href: '\/learn\/', label: '학습 기록'/)
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

test('static s4 header keeps safe anchor landings and sticky article/wiki navigation', () => {
  const css = source('src/styles/global.css')
  // The new header scrolls away; the last declarations must override the old 61/96 px values.
  assert.equal([...css.matchAll(/--header-h:\s*([^;]+);/g)].at(-1)?.[1], '0px')
  assert.equal([...css.matchAll(/--header-clearance:\s*([^;]+);/g)].at(-1)?.[1], '24px')
  assert.doesNotMatch(source('src/components/Header.astro'), /position:\s*(?:sticky|fixed)/)
  assert.match(css, /scroll-padding-top: var\(--header-clearance\)/)
  assert.doesNotMatch(source('src/pages/wiki/index.astro'), /position: sticky|library-layout/)
  assert.match(css, /nav\.rail \{[^}]*top: calc\(var\(--header-clearance\) \+ 1\.5rem\);/)
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    assert.match(source(path), /<nav class="rail" aria-label="차례" data-pagefind-ignore>/)
  }
  const layout = source('src/layouts/PostLayout.astro')
  assert.match(layout, /nav\.case-rail\s*\{[^}]*position:\s*sticky;[^}]*top:\s*24px;/)
  assert.match(layout, /details\.case-toc\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/)
  assert.match(layout, /scroll-margin-top:\s*64px;/)
})

test('s4 home presents identity then every published article in one list with archives still reachable', () => {
  const home = source('src/pages/index.astro')
  const order = [
    '<section class="intro"',
    '<div class="kicker">',
    '<h1 id="home-title">',
    'id="posts-title"',
    '<ol class="case-list">',
  ].map((needle) => home.indexOf(needle))
  assert.ok(
    order.every((index, i) => index >= 0 && (i === 0 || index > order[i - 1])),
    String(order),
  )
  assert.match(home, /getCollection\('posts',\s*\(\{\s*data\s*\}\)\s*=>\s*!data\.draft\)/)
  assert.match(home, /b\.data\.date\.valueOf\(\)\s*-\s*a\.data\.date\.valueOf\(\)/)
  assert.match(home, /posts\.map\(/)
  assert.equal((home.match(/posts\.map\(/g) ?? []).length, 1)
  assert.match(home, /글 <span>\{posts\.length\}<\/span>/)
  assert.doesNotMatch(home, /recommended\.map|rest\.map|주제와 상태로 거르기|2021년 12월부터/)
  // Moving archive discovery to the footer must not remove any destination.
  const footer = source('src/components/Footer.astro')
  for (const href of ['/wiki/', '/learn/', '/projects/', '/rss.xml']) {
    assert.ok(footer.includes(`href="${href}"`), href)
  }
  const learning = source('src/pages/learn/index.astro')
  assert.match(learning, /getCollection\('notes'\)/)
  assert.match(learning, /getCollection\('solutions'\)/)
  assert.match(learning, /\{\s*solutions\.length\s*\}/)
  assert.match(learning, /\{noteYears\}년의 노트/)
  assert.match(source('src/pages/wiki/index.astro'), /\{entries\.length\}편/)
  const css = source('src/styles/global.css')
  assert.match(css, /\.case-page\s*\{[^}]*max-width:\s*904px;[^}]*padding-inline:\s*32px;/)
  assert.match(home, /href="\/about\/"/)
  assert.doesNotMatch(home, /reading-rail|archive-links|selectRecentWiki/)
})

test('case and archive rows keep separators and one whole-row link', () => {
  const css = source('src/styles/global.css')
  assert.match(
    css,
    /\.rows > li\s*\{[^}]*position: relative;[^}]*border-bottom: 1px solid var\(--line\);/,
  )
  assert.match(css, /\.row-a\s*\{[^}]*padding: 0\.95rem 0 1\.05rem;[^}]*text-decoration: none;/)
  const caseRow = source('src/components/CaseRow.astro')
  assert.match(caseRow, /\.case-row\s*\{[^}]*border-bottom:\s*1px solid var\(--line\);/)
  assert.match(caseRow, /\.case-row:last-child\s*\{[^}]*border-bottom:\s*0;/)
  assert.equal((caseRow.match(/<a\b/g) ?? []).length, 1)
  assert.match(caseRow, /href=\{href\}/)
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
