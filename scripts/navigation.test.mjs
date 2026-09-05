import test from 'node:test'
import assert from 'node:assert/strict'
import { PRIMARY_NAV, activeNavigation } from '../src/utils/navigation.mjs'

test('four reader-oriented entries keep their existing destinations', () => {
  assert.deepEqual(
    PRIMARY_NAV.map((n) => n.label),
    ['글', '위키', '학습 기록', '소개'],
  )
  assert.equal(new Set(PRIMARY_NAV.map((n) => n.href)).size, 4)
})
test('legacy content URLs remain in the correct navigation section', () => {
  for (const [path, expected] of [
    ['/posts/disk-99-percent-check-before-expanding/', '/posts/'],
    ['/categories/performance/', '/posts/'],
    ['/wiki/sql-join-types/', '/wiki/'],
    ['/learn/', '/learn/'],
    ['/algorithms/boj-1620/', '/learn/'],
    ['/notes/scsa/', '/learn/'],
    ['/projects/', '/about/'],
    ['/about/', '/about/'],
    ['/', undefined],
    ['/notes-other/', undefined],
  ])
    assert.equal(activeNavigation(path), expected, path)
})
