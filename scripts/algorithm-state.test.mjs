import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readAlgorithmState, writeAlgorithmState } from '../src/utils/algorithm-state.mjs'

const choices = {
  categories: ['구현', '그래프 이론'],
  languages: ['C++', 'JavaScript'],
  groups: { 'boj-gold': 13, 'boj-silver': 18, 'pgs-lv2': 3 },
}

test('algorithm filters, pages and expanded groups survive a URL round trip', () => {
  const state = {
    query: '상어',
    category: '구현',
    language: 'C++',
    pages: { 'boj-gold': 2, 'boj-silver': 1, 'pgs-lv2': 1 },
    expanded: ['boj-gold'],
  }
  const url = writeAlgorithmState('https://example.com/algorithms/?utm_source=resume#list', state)
  assert.deepEqual(readAlgorithmState(url.search, choices), state)
  assert.equal(url.searchParams.get('utm_source'), 'resume')
  assert.equal(url.hash, '#list')
  assert.equal(url.searchParams.has('page.boj-silver'), false)
})

test('unknown facets/groups and malformed page numbers are not trusted', () => {
  const state = readAlgorithmState(
    '?type=unknown&lang=evil&page.boj-gold=999&page.boj-silver=-2&page.pgs-lv2=1.5&open=unknown,boj-gold,boj-gold',
    choices,
  )
  assert.equal(state.category, '')
  assert.equal(state.language, '')
  assert.deepEqual(state.pages, { 'boj-gold': 13, 'boj-silver': 1, 'pgs-lv2': 1 })
  assert.deepEqual(state.expanded, ['boj-gold'])
  assert.equal(readAlgorithmState('?page.boj-gold=Infinity', choices).pages['boj-gold'], 1)
})

test('default state and explicitly collapsed groups remain distinct', () => {
  assert.equal(readAlgorithmState('', choices).expanded, undefined)
  assert.deepEqual(readAlgorithmState('?open=', choices).expanded, [])
  assert.equal(readAlgorithmState(`?q=${'x'.repeat(500)}`, choices).query.length, 200)
})

test('clearing filters removes stale keys without creating a new history entry', () => {
  const state = readAlgorithmState('', choices)
  const url = writeAlgorithmState(
    'https://example.com/algorithms/?q=old&type=old&lang=old&page.old=9&open=old',
    state,
  )
  assert.equal(url.search, '')
})

test('page selection persists synchronously instead of waiting for the typing debounce', () => {
  const source = readFileSync(
    new URL('../src/pages/algorithms/index.astro', import.meta.url),
    'utf8',
  )
  const clickHandler = source
    .split("g.querySelector('.pager')?.addEventListener('click'")[1]
    ?.split("g.addEventListener('toggle'")[0]
  assert.ok(clickHandler)
  assert.match(clickHandler, /renderGroup\([\s\S]*?persistURL\(\)/)
  assert.doesNotMatch(clickHandler, /scheduleURL\(\)/)
})
