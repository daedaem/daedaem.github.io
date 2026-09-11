import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { EDITORIAL_COVERS, editorialCover, splitEditorialTitle } from '../src/utils/editorial.mjs'
import { MONOGRAM_PATH } from '../src/utils/brand.mjs'
import { HOME_READING_PICKS } from '../src/utils/home-content.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('approved covers follow the real selected articles and never label an unknown one', () => {
  assert.deepEqual(
    Object.keys(EDITORIAL_COVERS),
    HOME_READING_PICKS.map(({ id }) => id),
  )
  assert.deepEqual(
    HOME_READING_PICKS.map(({ id }) => editorialCover(id)),
    ['null', 'query', 'legacy'],
  )
  for (const id of ['new-article', 'toString', '__proto__', '', undefined]) {
    assert.equal(editorialCover(id), undefined)
  }
  const home = source('src/pages/index.astro')
  assert.match(home, /selectHomeContent\(posts\)/)
  assert.match(home, /editorialCover\(post\.id\)/)
  assert.match(home, /'without-cover': !cover/)
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
