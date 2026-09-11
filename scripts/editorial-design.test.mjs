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
  assert.match(home, /resolvePostCover\(post\.data\)/)
  assert.match(home, /'without-cover': !cover/)
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

test('home, all-post and category lists share cover resolution without changing reading pages', () => {
  for (const path of [
    'src/pages/index.astro',
    'src/pages/posts/index.astro',
    'src/pages/categories/[category].astro',
  ]) {
    assert.match(source(path), /cover=\{resolvePostCover\((?:post|p)\.data\)\}/)
  }
  const row = source('src/components/PostRow.astro')
  assert.match(row, /'with-cover': !!cover/)
  assert.match(row, /<PostCover kind=\{cover\.kind\} src=\{cover\.src\}/)
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /@container \(max-width: 220px\)/)
  assert.match(cover, /alt=""/)
  assert.doesNotMatch(cover, /0[123] \/ FIELD NOTES/)
  assert.doesNotMatch(source('src/layouts/PostLayout.astro'), /<PostCover/)
  assert.deepEqual(Object.keys(COVER_PRESETS), ['null', 'query', 'legacy'])
})

test('title styling preserves every character and only splits the first colon-space', () => {
  const titles = [
    '바꾼 적 없는데 결재가 또 올라온다: NULL과 항목의 주인',
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
  assert.match(layout, /<slot\s*\/>/)
  assert.match(layout, /original=\{archived\}/)
  assert.match(layout, /publishedAt=\{date\}/)
  assert.match(layout, /updatedAt=\{updated\}/)
  assert.match(layout, /사례 시점: \{happened\}/)
  assert.match(layout, /<span class="cause-label">원인 한 줄<\/span>/)
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

test('anchor landings and sticky article/wiki navigation share the taller header clearance', () => {
  const css = source('src/styles/global.css')
  assert.match(css, /--header-clearance: 7rem/)
  assert.match(css, /--header-clearance: 7\.5rem/)
  assert.match(css, /scroll-padding-top: var\(--header-clearance\)/)
  for (const path of [
    'src/layouts/PostLayout.astro',
    'src/pages/wiki/index.astro',
    'src/pages/wiki/[...slug].astro',
  ]) {
    assert.match(source(path), /top: var\(--header-clearance\)/)
  }
})

test('reading comparison keeps the title before a secondary thumbnail on mobile', () => {
  const home = source('src/pages/index.astro')
  const mobile = home.split('@media (max-width: 640px)')[1]
  assert.ok(mobile)
  assert.match(home, /grid-template-areas:\s*'copy cover' 'note note';/)
  assert.match(mobile, /grid-template-columns:\s*minmax\(0, 1fr\) 5\.5rem;/)
  assert.ok(home.indexOf('<h3 class="card-title">') < home.indexOf('<div class="card-cover">'))
  assert.doesNotMatch(home, /order:\s*-1/)
})

test('article separators distinguish rows without expanding the link into the gap', () => {
  const home = source('src/pages/index.astro')
  assert.match(
    home,
    /\.editorial-card\s*\{[^}]*padding:\s*1\.5rem 0;[^}]*border-bottom:\s*1px solid var\(--border\);/,
  )
  assert.doesNotMatch(home, /\.editorial-card::before/)
  assert.match(home, /\.editorial-card a::after\s*\{[^}]*inset:\s*0;/)
})
