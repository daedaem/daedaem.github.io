import test from 'node:test'
import assert from 'node:assert/strict'
import { paginationWindow } from '../src/utils/pagination.mjs'

test('short lists do not show ellipses or invalid numbers', () => {
  assert.deepEqual(paginationWindow(0, 0), { numbers: [1], gapBefore: [] })
  assert.deepEqual(paginationWindow(3, 9), { numbers: [1, 2, 3], gapBefore: [] })
  assert.deepEqual(paginationWindow(5, 3), { numbers: [1, 2, 3, 4, 5], gapBefore: [] })
})

test('long lists retain boundaries and the current page, with explicit gaps', () => {
  assert.deepEqual(paginationWindow(13, 1), { numbers: [1, 2, 3, 13], gapBefore: [13] })
  assert.deepEqual(paginationWindow(13, 7), { numbers: [1, 6, 7, 8, 13], gapBefore: [6, 13] })
  assert.deepEqual(paginationWindow(13, 13), { numbers: [1, 11, 12, 13], gapBefore: [11] })
})

test('even a thousand pages keep at most five buttons and all immediate neighbors', () => {
  for (let current = 1; current <= 1000; current++) {
    const { numbers } = paginationWindow(1000, current)
    assert.ok(numbers.length <= 5)
    for (const expected of [
      1,
      1000,
      current,
      Math.max(1, current - 1),
      Math.min(1000, current + 1),
    ])
      assert.ok(numbers.includes(expected))
  }
})
