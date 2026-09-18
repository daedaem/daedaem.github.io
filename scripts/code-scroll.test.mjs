import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { markScrollableCode } from '../src/utils/code-scroll.mjs'

function fakePre({ scrollWidth, clientWidth, scrollLeft = 0 }) {
  const attrs = new Set()
  const listeners = {}
  return {
    scrollWidth,
    clientWidth,
    scrollLeft,
    attrs,
    toggleAttribute(name, force) {
      force ? attrs.add(name) : attrs.delete(name)
    },
    addEventListener(type, fn) {
      listeners[type] = fn
    },
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
  wide.scrollLeft = 500
  wide.fire('scroll')
  assert.deepEqual([...wide.attrs].sort(), ['data-scroll-end', 'data-scrollable'])
  wide.scrollLeft = 100
  wide.fire('scroll')
  assert.deepEqual([...wide.attrs].sort(), ['data-scrollable'])
})

test('the fade keeps the label strip visible and is wired to the same attributes', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
  assert.match(css, /pre\.astro-code\[data-scrollable\]:not\(\[data-scroll-end\]\)\s*\{/)
  assert.match(css, /mask-composite: add/)
  assert.match(css, /linear-gradient\(#000 3rem, transparent 3rem\)/)
  const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8')
  assert.match(layout, /markScrollableCode\(pre\)/)
})

test('home rows keep authoring dates and topic counts stay hidden below three posts', () => {
  const home = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8')
  assert.doesNotMatch(home, /사례 시점/)
  assert.match(home, /\(counts\.get\(category\.id\) \?\? 0\) >= 3 &&/)
  const row = readFileSync(new URL('../src/components/PostRow.astro', import.meta.url), 'utf8')
  assert.match(row, /<ContentDates date=\{date\} updated=\{updated\} compact \/>/)
})
