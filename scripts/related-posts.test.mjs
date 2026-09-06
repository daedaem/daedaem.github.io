import test from 'node:test'
import assert from 'node:assert/strict'
import { selectRelatedPosts } from '../src/utils/related-posts.mjs'

const post = (id, category = 'operations', tags = [], date = '2026-08-01', draft = false) => ({
  id,
  data: { category, tags, date: new Date(date), draft },
})

test('related posts prefer category, then shared tags, then recent fallback', () => {
  const current = post('current', 'operations', ['Oracle'])
  const pool = [
    current,
    post('recent', 'legacy', [], '2026-09-01'),
    post('tag', 'database', ['ORACLE']),
    post('category'),
    post('older', 'legacy'),
  ]
  assert.deepEqual(
    selectRelatedPosts(pool, current).map((p) => p.id),
    ['category', 'tag', 'recent'],
  )
  assert.equal(pool[0], current, 'does not mutate the input')
})

test('current, adjacent and unpublished posts never repeat in recommendations', () => {
  const current = post('current')
  const pool = [
    current,
    post('prev'),
    post('next'),
    post('draft', 'operations', [], undefined, true),
    post('only'),
  ]
  assert.deepEqual(
    selectRelatedPosts(pool, current, ['prev', 'next']).map((p) => p.id),
    ['only'],
  )
  assert.deepEqual(selectRelatedPosts([current], current), [])
})
