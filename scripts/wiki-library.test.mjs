import test from 'node:test'
import assert from 'node:assert/strict'
import { selectDocuments } from '../src/utils/wiki-library.mjs'
const docs = Array.from({ length: 1000 }, (_, i) => ({
  id: 'doc-' + i,
  title: '문서 ' + i,
  description: 'NULL 비교',
  tags: ['Java'],
  topic: i % 2 ? 'java' : 'database',
  status: i % 3 ? 'growing' : 'seed',
  updated: i,
}))
test('1000 documents are bounded to 12 and sorted newest first', () => {
  const result = selectDocuments(docs)
  assert.equal(result.items.length, 12)
  assert.equal(result.pages, 84)
  assert.equal(result.items[0].id, 'doc-999')
})
test('topic, status and case-insensitive multiword search intersect', () => {
  const result = selectDocuments(docs, { topic: 'java', status: 'seed', query: 'java null' })
  assert.ok(result.total > 0)
  assert.ok(result.items.every((d) => d.topic === 'java' && d.status === 'seed'))
})
test('unknown query is empty and pagination remains valid', () => {
  assert.deepEqual(selectDocuments(docs, { query: 'missing', page: 88 }), {
    items: [],
    total: 0,
    pages: 1,
    page: 1,
  })
})
test('page clamps after filtering and preserves deterministic ordering', () => {
  assert.equal(selectDocuments(docs, { page: 999 }).page, 84)
  assert.equal(selectDocuments(docs, { page: -5 }).page, 1)
  const first = selectDocuments(docs, { sort: 'title' }).items
  assert.deepEqual(
    first,
    [...first].sort((a, b) => a.title.localeCompare(b.title, 'ko')),
  )
})
