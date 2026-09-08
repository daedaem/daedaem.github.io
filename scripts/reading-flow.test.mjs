import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { formatCompactDate } from '../src/utils/compact-date.mjs'
import { orderNoteSeries } from '../src/utils/note-series.mjs'

test('compact dates retain year, zero padding and the Seoul calendar date', () => {
  assert.equal(formatCompactDate(new Date('2026-09-08')), '2026.09.08')
  assert.equal(formatCompactDate(new Date('2022-12-21')), '2022.12.21')
  assert.equal(formatCompactDate(new Date('2025-12-31T15:00:00Z')), '2026.01.01')
  assert.equal(formatCompactDate(new Date('2026-01-01T00:00:00+09:00')), '2026.01.01')
})

const series = { prefix: 'book-', chapterOrder: true }
const entries = (ids) => ids.map((id) => Object.freeze({ id }))
const ids = (notes) => notes.map((n) => n.id)

test('numbered series read in chapter order, not publication or lexical order', () => {
  const notes = Object.freeze(
    entries(['book-2-second', 'book-01-first', 'book-10-tenth', 'book-00-intro']),
  )
  const sorted = orderNoteSeries(notes, series)
  assert.deepEqual(ids(sorted), [
    'book-00-intro',
    'book-01-first',
    'book-2-second',
    'book-10-tenth',
  ])
  assert.equal(sorted[1], notes[1], 'original entry and metadata retained')
  assert.deepEqual(ids(notes), ['book-2-second', 'book-01-first', 'book-10-tenth', 'book-00-intro'])
})

test('missing chapters are not invented and unnumbered appendices stay stable at the end', () => {
  const notes = entries(['book-appendix', 'book-04-fourth', 'book-01-first', 'book-links'])
  assert.deepEqual(ids(orderNoteSeries(notes, series)), [
    'book-01-first',
    'book-04-fourth',
    'book-appendix',
    'book-links',
  ])
})

test('personal records and unordered series retain input chronology, even for numeric IDs', () => {
  const notes = entries(['book-02-second', 'book-01-first'])
  for (const options of [{}, { prefix: 'book-' }, { chapterOrder: true }]) {
    assert.deepEqual(orderNoteSeries(notes, options), notes)
  }
  assert.deepEqual(orderNoteSeries([], series), [])
})

test('equal chapter numbers and IDs outside the configured prefix are stable', () => {
  const notes = entries(['other-01', 'book-01-b', 'book-01-a', 'other-00'])
  assert.deepEqual(ids(orderNoteSeries(notes, series)), [
    'book-01-b',
    'book-01-a',
    'other-01',
    'other-00',
  ])
})

test('real numbered note series are explicitly opted into chapter ordering', () => {
  const source = readFileSync(new URL('../src/pages/notes/index.astro', import.meta.url), 'utf8')
  for (const prefix of ['core-javascript-', 'modern-js-deep-dive-', 'typescript-']) {
    assert.match(source, new RegExp(`prefix: '${prefix}',\\s*chapterOrder: true`))
  }
  assert.match(source, /items:\s*orderNoteSeries\(/)
})

test('wiki contents progressively enhance open native details without changing the document tree', () => {
  const source = readFileSync(new URL('../src/pages/wiki/[...slug].astro', import.meta.url), 'utf8')
  assert.match(source, /<nav class="toc"[^>]*data-pagefind-ignore>\s*<details open>\s*<summary>/)
  assert.match(source, /querySelector<HTMLDetailsElement>\('\.post > \.toc details'\)/)
  assert.match(source, /contents\.open = !narrow\.matches/)
  assert.match(source, /<details class="side-mobile">/)
})

test('about shortcuts have focusable heading targets and are excluded from article search', () => {
  const source = readFileSync(new URL('../src/pages/about.astro', import.meta.url), 'utf8')
  const nav = source.match(/<nav class="about-nav"[^>]*data-pagefind-ignore>([\s\S]*?)<\/nav>/)?.[1]
  assert.ok(nav)
  const targets = [...nav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1])
  assert.equal(targets.length, 4)
  for (const target of targets)
    assert.match(source, new RegExp(`<h2 id="${target}" tabindex="-1">`))
})
