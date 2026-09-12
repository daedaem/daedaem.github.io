import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { currentHeadingIndex, initCurrentHeading } from '../src/utils/current-heading.mjs'

test('reading location follows heading boundaries, long sections and the last section', () => {
  assert.equal(currentHeadingIndex([], 180), -1)
  assert.equal(currentHeadingIndex([], 180, true), -1)
  assert.equal(currentHeadingIndex([300, 1500, 3000], 180), -1)
  assert.equal(currentHeadingIndex([180, 1500, 3000], 180), 0)
  assert.equal(currentHeadingIndex([-1000, 300, 1700], 180), 0)
  assert.equal(currentHeadingIndex([-1000, -50, 1700], 180), 1)
  assert.equal(currentHeadingIndex([-1000, -50, 1700], 180, true), 2)
})

test('scroll, anchor and history updates share one scheduled update and one current link', () => {
  const positions = [500, 1800, 2800]
  const frames = []
  const events = new Map()
  const links = positions.map((_, index) => ({
    hash: '#section-' + index,
    attrs: new Map(),
    setAttribute(key, value) {
      this.attrs.set(key, value)
    },
    removeAttribute(key) {
      this.attrs.delete(key)
    },
  }))
  const root = {
    querySelectorAll: () => links,
    querySelector: () => null,
    getElementById: (id) => ({
      getBoundingClientRect: () => ({ top: positions[Number(id.slice(-1))] }),
    }),
    documentElement: { scrollHeight: 4000 },
  }
  const view = {
    scrollY: 0,
    innerHeight: 900,
    addEventListener: (name, handler) => events.set(name, handler),
    requestAnimationFrame: (handler) => frames.push(handler),
  }
  const current = () => links.map((link) => link.attrs.get('aria-current'))
  initCurrentHeading(root, view)
  assert.deepEqual(current(), [undefined, undefined, undefined])
  positions.splice(0, 3, -1000, 120, 1300)
  events.get('scroll')()
  events.get('resize')()
  events.get('hashchange')()
  assert.equal(frames.length, 1)
  frames.shift()()
  assert.deepEqual(current(), [undefined, 'location', undefined])
  view.scrollY = 3100
  events.get('pageshow')()
  frames.shift()()
  assert.deepEqual(current(), [undefined, undefined, 'location'])
  view.scrollY = 0
  positions.splice(0, 3, 500, 1800, 2800)
  events.get('hashchange')()
  frames.shift()()
  assert.deepEqual(current(), [undefined, undefined, undefined])
})

test('documents without a usable outline install no scroll handlers', () => {
  let listeners = 0
  initCurrentHeading({ querySelectorAll: () => [] }, { addEventListener: () => listeners++ })
  assert.equal(listeners, 0)
})

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('wiki and case outlines share location behavior without replacing native anchors', () => {
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const source = read(path)
    assert.match(source, /initCurrentHeading\(\)/)
    assert.match(source, /href=\{`#\$\{h.slug\}`\}/)
    assert.match(source, /aria-current='location'/)
    assert.match(source, /\(pointer: coarse\)/)
  }
})

test('wiki title precedes dates and navigation is separate from publication metadata', () => {
  const source = read('src/pages/wiki/[...slug].astro')
  assert.ok(source.indexOf('<h1>') < source.indexOf('<ContentDates'))
  assert.match(source, /<nav class="breadcrumbs" aria-label="문서 위치" data-pagefind-ignore>/)
  assert.match(source, /date=\{entry.data.created\}/)
  assert.match(source, /updated=\{entry.data.updated\}/)
  assert.match(source, /dateLabel="처음 작성"/)
  assert.match(source, /updatedLabel="마지막 수정"/)
  assert.match(source, /<Content\s*\/>/)
})

test('wiki document and related-reading links use visible focus and existing 44px controls', () => {
  for (const path of ['src/components/WikiTree.astro', 'src/components/RelatedReading.astro']) {
    const source = read(path)
    assert.match(source, /min-height: var\(--control-size\)/)
    assert.match(source, /:focus-visible/)
    assert.match(source, /outline: 2px solid var\(--accent\)/)
  }
})
