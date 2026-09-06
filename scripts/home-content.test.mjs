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

test('ranked proofs take priority over featured and are safe without another case', () => {
  const result = selectHomeContent(HOME_PROOFS.map((p, i) => post(p.id, { featured: i === 1 })))
  assert.equal(result.featured, undefined)
  assert.deepEqual(result.proofs, HOME_PROOFS)
  assert.equal(visibleIds(result).length, 3)
  assert.equal(new Set(visibleIds(result)).size, 3)
  assert.deepEqual(result.rest, [])
})

test('application highlights follow the requested priority, not publication order', () => {
  const result = selectHomeContent(HOME_PROOFS.map((p) => post(p.id)).reverse())
  assert.deepEqual(
    result.proofs.map((p) => p.id),
    [
      'null-and-empty-string-sync-failure',
      'address-search-9s-to-100ms',
      'retire-flash-module-by-integration',
    ],
  )
  assert.match(result.proofs[1].text, /9초에서 1초대/)
  assert.doesNotMatch(result.proofs[1].text, /100\s*(ms|밀리초)/)
})

test('the former featured address case stays second and the next case is shown once', () => {
  const posts = [
    post('disk'),
    post('auth'),
    ...HOME_PROOFS.map((p, index) => post(p.id, { featured: index === 1 })),
    post('older'),
  ]
  const result = selectHomeContent(posts)
  assert.equal(result.featured.id, 'disk')
  assert.deepEqual(result.proofs, HOME_PROOFS)
  assert.deepEqual(
    result.rest.map((p) => p.id),
    ['auth', 'older'],
  )
  assert.equal(visibleIds(result).length, new Set(visibleIds(result)).size)
  assert.deepEqual([...visibleIds(result)].sort(), posts.map((p) => p.id).sort())
})

test('empty content is safe and selection never mutates its input', () => {
  assert.deepEqual(selectHomeContent([]), { featured: undefined, proofs: [], rest: [] })
  const posts = Object.freeze([Object.freeze(post('first')), Object.freeze(post('second'))])
  assert.deepEqual(
    selectHomeContent(posts).rest.map((p) => p.id),
    ['second'],
  )
})

test('the authentication case is the featured card without changing proof priority', () => {
  const posts = [
    post('disk'),
    post('staged-auth-and-password-migration', { featured: true }),
    ...HOME_PROOFS.map((p) => post(p.id)),
    post('overflow'),
    post('batch'),
  ]
  const result = selectHomeContent(posts)
  assert.equal(result.featured.id, 'staged-auth-and-password-migration')
  assert.deepEqual(result.proofs, HOME_PROOFS)
  assert.deepEqual(
    result.rest.map((p) => p.id),
    ['disk', 'overflow', 'batch'],
  )
  assert.equal(new Set(visibleIds(result)).size, 7)
})
