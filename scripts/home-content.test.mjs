import test from 'node:test'
import assert from 'node:assert/strict'
import {
  HOME_READING_PICKS,
  selectHomeContent,
  selectRecentWiki,
} from '../src/utils/home-content.mjs'

const post = (id, data = {}) => ({ id, data })
const visibleIds = ({ recommended, rest }) => [...recommended, ...rest].map((p) => p.id)
const pickIds = HOME_READING_PICKS.map((p) => p.id)

test('three recommended reads and other posts show all seven posts without duplicates', () => {
  const posts = [
    post('disk'),
    post('staged-auth-and-password-migration', { featured: true }),
    ...pickIds.map((id) => post(id)),
    post('overflow'),
    post('batch'),
  ]
  const result = selectHomeContent(posts)
  assert.deepEqual(
    result.recommended.map((p) => p.id),
    pickIds,
  )
  assert.deepEqual(
    result.rest.map((p) => p.id),
    ['disk', 'staged-auth-and-password-migration', 'overflow', 'batch'],
  )
  assert.equal(new Set(visibleIds(result)).size, 7)
  assert.deepEqual([...visibleIds(result)].sort(), posts.map((p) => p.id).sort())
})

test('draft and missing recommended targets never leave dangling links', () => {
  const result = selectHomeContent([
    post(pickIds[0], { draft: true, featured: true }),
    post(pickIds[1]),
    post('published'),
    post('hidden', { draft: true }),
  ])
  assert.deepEqual(
    result.recommended.map((p) => p.id),
    [pickIds[1]],
  )
  assert.deepEqual(visibleIds(result), [pickIds[1], 'published'])
})

test('recommendation priority is independent of publication order and featured flags', () => {
  const result = selectHomeContent(
    pickIds.map((id, i) => post(id, { featured: i === 2 })).reverse(),
  )
  assert.deepEqual(
    result.recommended.map((p) => p.id),
    [
      'null-and-empty-string-sync-failure',
      'address-search-9s-to-100ms',
      'retire-flash-module-by-integration',
    ],
  )
  assert.deepEqual(result.rest, [])
  assert.match(result.recommended[1].readingNote, /9초에서 1초대/)
  assert.doesNotMatch(result.recommended[1].readingNote, /100\s*(ms|밀리초)/)
})

test('selection preserves original metadata and body without mutating posts', () => {
  const data = Object.freeze({ title: '원래 제목', date: new Date('2026-08-12'), featured: true })
  const original = Object.freeze({ id: pickIds[0], data, body: '원래 본문' })
  const posts = Object.freeze([
    Object.freeze(post('newer')),
    original,
    Object.freeze(post('older')),
  ])
  const result = selectHomeContent(posts)
  assert.equal(result.recommended[0].data, data)
  assert.equal(result.recommended[0].body, original.body)
  assert.equal(original.readingNote, undefined)
  assert.deepEqual(
    result.rest.map((p) => p.id),
    ['newer', 'older'],
  )
  assert.deepEqual(
    posts.map((p) => p.id),
    ['newer', pickIds[0], 'older'],
  )
})

test('empty content and a home without recommendations remain safe', () => {
  assert.deepEqual(selectHomeContent([]), { recommended: [], rest: [] })
  assert.deepEqual(visibleIds(selectHomeContent([post('only')])), ['only'])
})

const wiki = (id, created, overrides = {}) => ({
  id,
  data: { title: id, created: new Date(created), ...overrides },
})

test('recent wiki uses updated or created dates and excludes drafts before limiting', () => {
  const entries = [
    wiki('old', '2026-08-01'),
    wiki('updated', '2026-08-01', { updated: new Date('2026-09-06') }),
    wiki('hidden', '2026-09-07', { draft: true }),
    wiki('new', '2026-09-07'),
    wiki('third', '2026-09-05'),
  ]
  assert.deepEqual(
    selectRecentWiki(entries).map((p) => p.id),
    ['new', 'updated', 'third'],
  )
  assert.deepEqual(
    selectRecentWiki(entries, 1).map((p) => p.id),
    ['new'],
  )
})

test('wiki date ties use title then id consistently without mutating input', () => {
  const entries = Object.freeze([
    Object.freeze(wiki('z', '2026-09-06', { title: '나' })),
    Object.freeze(wiki('b', '2026-09-06', { title: '가' })),
    Object.freeze(wiki('a', '2026-09-06', { title: '가' })),
  ])
  assert.deepEqual(
    selectRecentWiki(entries).map((p) => p.id),
    ['a', 'b', 'z'],
  )
  assert.deepEqual(
    selectRecentWiki([...entries].reverse()).map((p) => p.id),
    ['a', 'b', 'z'],
  )
  assert.deepEqual(
    entries.map((p) => p.id),
    ['z', 'b', 'a'],
  )
  assert.deepEqual(selectRecentWiki([]), [])
  assert.deepEqual(selectRecentWiki(entries, 0), [])
})
