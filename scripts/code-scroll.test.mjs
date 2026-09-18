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
})

test('the inner code scrolls so the label and copy button stay put, and the fade uses the same attributes', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
  assert.match(css, /pre\.astro-code\[data-scrollable\]:not\(\[data-scroll-end\]\) > code\s*\{/)
  assert.match(css, /pre\.astro-code\s*\{\s*overflow: visible !important;/)
  assert.match(css, /pre\.astro-code > code\s*\{[^}]*overflow-x: auto;/)
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
  assert.match(layout, /markScrollableCode\(pre\)/)
})

test('list rows show only the authoring date and topic counts stay hidden below three posts', () => {
  const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8')
  assert.doesNotMatch(home, /사례 시점/)
  assert.match(home, /\(counts\.get\(category\.id\) \?\? 0\) >= 3 &&/)
  const row = readFileSync(new URL('../src/components/PostRow.astro', import.meta.url), 'utf8')
  assert.match(row, /<ContentDates date=\{date\} compact \/>/)
  assert.doesNotMatch(row, /updated/)
  for (const path of ['src/pages/notes/index.astro', 'src/pages/tags/[tag].astro']) {
    assert.doesNotMatch(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'), /<ContentDates[^>]*updated=/)
  }
})
