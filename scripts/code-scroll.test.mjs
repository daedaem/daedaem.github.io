import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { markScrollableCode } from '../src/utils/code-scroll.mjs'

function fakePre({ scrollWidth, clientWidth, scrollLeft = 0 }) {
  const attrs = new Set()
  const listeners = {}
  const code = {
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
    addEventListener(type, fn) {
      listeners[type] = fn
    },
  }
  return {
    attrs,
    code,
    removed: [],
    querySelector: () => code,
    removeAttribute(name) {
      this.removed.push(name)
    },
    toggleAttribute(name, force) {
      force ? attrs.add(name) : attrs.delete(name)
    },
    addEventListener() {},
    fire(type) {
      listeners[type]()
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

test('keyboard focus moves from pre to the inner code that actually scrolls', () => {
  const pre = fakePre({ scrollWidth: 800, clientWidth: 300 })
  markScrollableCode(pre, win)
  assert.equal(pre.code.attributes.tabindex, '0')
  assert.deepEqual(pre.removed, ['tabindex'])

  // 넘길 것이 없는 블록은 탭 정지가 되지 않고, 창이 좁아져 넘치게 되면 그때 초점을 받는다
  const fits = fakePre({ scrollWidth: 300, clientWidth: 300 })
  const update = markScrollableCode(fits, win)
  assert.equal(fits.code.attributes.tabindex, undefined)
  fits.code.clientWidth = 200
  update()
  assert.equal(fits.code.attributes.tabindex, '0')
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
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
  assert.match(layout, /markScrollableCode\(pre\)/)
})

test('list rows show only the authoring date, and the home links onward with collection counts', () => {
  const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8')
  assert.doesNotMatch(home, /사례 시점/)
  // 주제별 글 레일 대신 '더 보기' 행: 위키 건수와 노트·풀이 건수는 컬렉션에서 센다
  assert.match(home, /\{wiki\.length\}편/)
  assert.match(home, /\{notes\.length\}편 · 알고리즘 풀이 \{solutions\.length\}건/)
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
