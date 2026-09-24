import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { markScrollableCode, markScrollableTable } from '../src/utils/code-scroll.mjs'

function fakeScroller({ scrollWidth, clientWidth, scrollLeft = 0 }) {
  const listeners = {}
  return {
    scrollWidth,
    clientWidth,
    scrollLeft,
    attributes: {},
    setAttribute(name, value) {
      this.attributes[name] = value
    },
    removeAttribute(name) {
      delete this.attributes[name]
    },
    getAttribute(name) {
      return this.attributes[name] ?? null
    },
    addEventListener(type, fn) {
      listeners[type] = fn
    },
    fire(type) {
      listeners[type]()
    },
  }
}

function fakePre({ scrollWidth, clientWidth, scrollLeft = 0, label = '코드: sql' }) {
  const attrs = new Set()
  const code = fakeScroller({ scrollWidth, clientWidth, scrollLeft })
  return {
    attrs,
    code,
    removed: [],
    attributes: { tabindex: '0', 'aria-label': label },
    querySelector: () => code,
    getAttribute(name) {
      return this.attributes[name] ?? null
    },
    removeAttribute(name) {
      this.removed.push(name)
      delete this.attributes[name]
    },
    toggleAttribute(name, force) {
      force ? attrs.add(name) : attrs.delete(name)
    },
    addEventListener() {},
    fire(type) {
      code.fire(type)
    },
  }
}
const win = { addEventListener() {} }

test('only overflowing code blocks are marked and the mark clears at the end of the scroll', () => {
  const fits = fakePre({ scrollWidth: 300, clientWidth: 300 })
  markScrollableCode(fits, win)
  assert.deepEqual([...fits.attrs], ['data-scroll-end'])

  const wide = fakePre({ scrollWidth: 800, clientWidth: 300 })
  markScrollableCode(wide, win)
  assert.deepEqual([...wide.attrs].sort(), ['data-scrollable'])
  wide.code.scrollLeft = 500
  wide.fire('scroll')
  assert.deepEqual([...wide.attrs].sort(), ['data-scroll-end', 'data-scrollable'])
  wide.code.scrollLeft = 100
  wide.fire('scroll')
  assert.deepEqual([...wide.attrs].sort(), ['data-scrollable'])
})

test('focus, role and name move together from pre to the inner code that actually scrolls', () => {
  const pre = fakePre({ scrollWidth: 800, clientWidth: 300 })
  markScrollableCode(pre, win)
  // 초점을 받는 code가 이름을 갖고, 초점 없는 pre에는 금지 속성(aria-label)이 남지 않는다
  assert.deepEqual(pre.code.attributes, { tabindex: '0', role: 'group', 'aria-label': '코드: sql' })
  assert.deepEqual(pre.removed, ['tabindex', 'aria-label'])
  assert.deepEqual(pre.attributes, {})

  // 넘길 것이 없는 블록은 탭 정지도 이름도 갖지 않고, 창이 좁아져 넘치게 되면 그때 셋을 받는다
  const fits = fakePre({ scrollWidth: 300, clientWidth: 300 })
  const update = markScrollableCode(fits, win)
  assert.deepEqual(fits.code.attributes, {})
  fits.code.clientWidth = 200
  update()
  assert.deepEqual(fits.code.attributes, {
    tabindex: '0',
    role: 'group',
    'aria-label': '코드: sql',
  })
  fits.code.clientWidth = 300
  update()
  assert.deepEqual(fits.code.attributes, {})

  // 언어 라벨이 없던 블록은 '코드'로 부른다
  const plain = fakePre({ scrollWidth: 800, clientWidth: 300, label: '' })
  markScrollableCode(plain, win)
  assert.equal(plain.code.attributes['aria-label'], '코드')
})

test('table wrappers scroll themselves, so they are a tab stop with a name only while overflowing', () => {
  const table = fakeScroller({ scrollWidth: 900, clientWidth: 360 })
  const marks = new Set()
  table.attributes = { tabindex: '0', 'aria-label': '표 2' }
  table.toggleAttribute = (name, force) => (force ? marks.add(name) : marks.delete(name))
  const update = markScrollableTable(table, win)
  assert.deepEqual(table.attributes, { tabindex: '0', role: 'group', 'aria-label': '표 2' })
  assert.deepEqual([...marks], ['data-scrollable'])
  table.clientWidth = 900
  update()
  assert.deepEqual(table.attributes, {})
  assert.deepEqual([...marks], ['data-scroll-end'])
})

test('the inner code scrolls so the label and copy button stay put, and the fade uses the same attributes', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
  assert.match(css, /pre\.astro-code\[data-scrollable\]:not\(\[data-scroll-end\]\) > code\s*\{/)
  assert.match(css, /pre\.astro-code\s*\{\s*overflow: visible !important;/)
  assert.match(css, /pre\.astro-code > code\s*\{[^}]*overflow-x: auto;/)
  // 초점 테두리가 페이드 마스크에 지워지지 않는다
  assert.match(
    css,
    /pre\.astro-code\[data-scrollable\] > code:focus-visible\s*\{[^}]*mask-image: none;/,
  )
  // 넘치는 표는 첫 열을 붙여 둔다(B13). 표시는 같은 data-scrollable이다
  assert.match(
    css,
    /\.table\[data-scrollable\] th:first-child,\s*\.table\[data-scrollable\] td:first-child,[^{]*\{[^}]*position: sticky;[^}]*left: 0;/,
  )
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
  assert.match(layout, /markScrollableCode\(pre\)/)
  assert.match(layout, /markScrollableTable\(table\)/)
})

test('list rows show only the authoring date, and the home links onward with collection counts', () => {
  const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8')
  // 사례 시점은 글 목록(/posts/)의 행이 그린다. 홈 행은 원인·결과 줄이 이미 있어 첫 화면 예산(첫 글 제목 y ≤480)을 지키려고 넘기지 않는다
  assert.doesNotMatch(home, /사례 시점/)
  assert.doesNotMatch(home, /happened=\{post\.data\.happened\}/)
  const posts = readFileSync(new URL('../src/pages/posts/index.astro', import.meta.url), 'utf8')
  assert.match(posts, /happened=\{p\.data\.happened\}/)
  // 주제별 글 레일 대신 '더 보기' 행: 위키 건수·상태·기간, 노트 건수·연도, 풀이 건수는 컬렉션에서 센다
  assert.match(home, /\{wiki\.length\}편/)
  assert.match(
    home,
    /\{notes\.length\}편 \(\{noteYears\}\) · 알고리즘 풀이 \{solutions\.length\}건/,
  )
  const row = readFileSync(new URL('../src/components/PostRow.astro', import.meta.url), 'utf8')
  assert.match(
    row,
    /<time datetime=\{date\.toISOString\(\)\}>\{formatCompactDate\(date\)\}<\/time>/,
  )
  assert.doesNotMatch(row, /updated/)
  for (const path of ['src/pages/notes/index.astro', 'src/pages/tags/[tag].astro']) {
    assert.doesNotMatch(
      readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'),
      /<ContentDates[^>]*updated=/,
    )
  }
})
