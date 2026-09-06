import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { searchScope, SEARCH_SCOPES } from '../src/utils/search-scope.mjs'

test('all indexed collections have a visible search scope', () => {
  for (const [path, expected] of [
    ['/posts/example/', '글'],
    ['/wiki/example/', '위키'],
    ['/notes/scsa/', '학습 노트'],
    ['/algorithms/boj-1/', '알고리즘'],
    ['/about/', '소개·프로젝트'],
    ['/projects/', '소개·프로젝트'],
  ]) {
    assert.equal(searchScope(path), expected)
    assert.ok(SEARCH_SCOPES.includes(expected))
  }
})

test('search keeps code indexed and exposes an all-content default', () => {
  const source = readFileSync(new URL('../src/components/Search.astro', import.meta.url), 'utf8')
  assert.match(source, /<option value="">전체<\/option>/)
  assert.match(source, /triggerFilters/)
  assert.match(source, /검색 범위/)
  const algorithm = readFileSync(
    new URL('../src/pages/algorithms/[...slug].astro', import.meta.url),
    'utf8',
  )
  assert.match(algorithm, /<div class="body code-fold" id="code-fold">/)
})
