import test from 'node:test'
import assert from 'node:assert/strict'
import { HOME_PROOFS, selectHomeContent } from '../src/utils/home-content.mjs'

const post = (id, data = {}) => ({ id, data })
const visibleIds = ({ featured, proofs, rest }) =>
  [featured?.id, ...proofs.map((p) => p.id), ...rest.map((p) => p.id)].filter(Boolean)

test('approved proofs remain and each published case appears once on home', () => {
  const posts = [
    post('newest'),
    ...HOME_PROOFS.map((p) => post(p.id)),
    post('address', { featured: true }),
    post('older'),
  ]
  const result = selectHomeContent(posts)
  assert.equal(result.featured.id, 'address')
  assert.deepEqual(result.proofs, HOME_PROOFS)
  assert.deepEqual(
    result.rest.map((p) => p.id),
    ['newest', 'older'],
  )
  assert.equal(visibleIds(result).length, new Set(visibleIds(result)).size)
  assert.deepEqual([...visibleIds(result)].sort(), posts.map((p) => p.id).sort())
})

test('draft and missing proof targets never leave dangling home links', () => {
  const result = selectHomeContent([
    post(HOME_PROOFS[0].id, { draft: true, featured: true }),
    post('published'),
  ])
  assert.equal(result.featured.id, 'published')
  assert.deepEqual(result.proofs, [])
  assert.deepEqual(visibleIds(result), ['published'])
})

test('moving a proof into the featured slot does not duplicate it', () => {
  const result = selectHomeContent(HOME_PROOFS.map((p, i) => post(p.id, { featured: i === 1 })))
  assert.equal(result.proofs.length, 2)
  assert.equal(visibleIds(result).length, 3)
  assert.equal(new Set(visibleIds(result)).size, 3)
  assert.deepEqual(result.rest, [])
})

test('empty content is safe and selection never mutates its input', () => {
  assert.deepEqual(selectHomeContent([]), { featured: undefined, proofs: [], rest: [] })
  const posts = Object.freeze([Object.freeze(post('first')), Object.freeze(post('second'))])
  assert.deepEqual(
    selectHomeContent(posts).rest.map((p) => p.id),
    ['second'],
  )
})
