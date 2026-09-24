import test from 'node:test'
import assert from 'node:assert/strict'
import { selectDocuments, facetCounts } from '../src/utils/wiki-library.mjs'
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
test('chip counts follow the query and the other axis, so a chosen topic recounts the status chips', () => {
  const small = [
    {
      id: 'a',
      title: 'Spring 트랜잭션',
      description: '',
      tags: [],
      topic: 'spring',
      status: 'stable',
    },
    { id: 'b', title: 'Spring Bean', description: '', tags: [], topic: 'spring', status: 'stable' },
    { id: 'c', title: 'JOIN', description: 'SQL', tags: [], topic: 'database', status: 'growing' },
    { id: 'd', title: 'NULL', description: 'SQL', tags: [], topic: 'database', status: 'stable' },
  ]
  // 아무것도 고르지 않으면 목록 전체의 건수다
  assert.deepEqual(facetCounts(small), {
    topic: { '': 4, spring: 2, database: 2 },
    status: { '': 4, stable: 3, growing: 1 },
  })
  // Spring을 고르면 상태 칩은 Spring 안에서 세고(정리됨 2 · 보완 중 없음), 주제 칩은 그대로다
  const spring = facetCounts(small, { topic: 'spring' })
  assert.deepEqual(spring.status, { '': 2, stable: 2 })
  assert.deepEqual(spring.topic, { '': 4, spring: 2, database: 2 })
  // 상태를 고르면 주제 칩이 그 상태 안에서 센다. 검색어는 두 축 모두에 걸린다
  assert.deepEqual(facetCounts(small, { status: 'growing' }).topic, { '': 1, database: 1 })
  assert.deepEqual(facetCounts(small, { query: 'sql', topic: 'spring' }).status, { '': 0 })
  assert.deepEqual(facetCounts(small, { query: 'sql' }).topic, { '': 2, database: 2 })
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
