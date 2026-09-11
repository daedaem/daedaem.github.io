import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { loadWhenVisible } from '../src/utils/visible-module.mjs'

test('below-the-fold modules wait for visibility and start only once', () => {
  let notify, observed, options, disconnects = 0, loads = 0
  class Observer {
    constructor(callback, config) { notify = callback; options = config }
    observe(target) { observed = target }
    disconnect() { disconnects++ }
  }
  const host = {}
  loadWhenVisible(host, () => loads++, Observer)
  assert.equal(observed, host)
  assert.equal(options.rootMargin, '300px 0px')
  assert.equal(loads, 0)
  notify([{ isIntersecting: false }])
  assert.equal(loads, 0)
  notify([{ isIntersecting: true }])
  notify([{ isIntersecting: true }])
  assert.equal(loads, 1)
  assert.equal(disconnects, 1)
})
test('browsers without IntersectionObserver can still load comments', () => {
  let loads = 0
  loadWhenVisible({}, () => loads++, null)
  assert.equal(loads, 1)
})
test('comment loader defers client creation and keeps theme wiring inside the deferred callback', () => {
  const source = readFileSync(new URL('../src/components/Comments.astro', import.meta.url), 'utf8')
  const start = source.indexOf('loadWhenVisible(host, () => {')
  assert.ok(start > 0)
  assert.ok(source.indexOf("document.createElement('script')") > start)
  assert.ok(source.indexOf('connectCommentTheme({') > start)
  assert.ok(source.indexOf('theme: effective()') > start)
})
