import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { persistURL } from '../src/utils/url-state.mjs'

test('wiki page/topic/query choices persist before refresh can cancel timers', () => {
  const calls = []
  for (const url of ['?page=2', '?q=NULL', '?q=NULL&topic=database']) {
    assert.equal(persistURL(url, (value) => calls.push(value)), true)
    assert.equal(calls.at(-1), url)
  }
})
test('history rejection cannot stop document filtering', () => {
  assert.equal(persistURL('?page=2', () => { throw new Error('history unavailable') }), false)
})
test('wiki input and paging have no deferred URL writes', () => {
  const source = readFileSync(new URL('../src/pages/wiki/index.astro', import.meta.url), 'utf8')
  assert.match(source, /query.addEventListener\('input',[\s\S]*?show\(\)/)
  // 쪽 넘김은 turnPage를 거쳐 바로 show()를 부른다(초점 이동만 더한다)
  assert.match(source, /next.addEventListener\('click', \(\) => turnPage\(1\)\)/)
  assert.match(source, /function turnPage\([^)]*\) \{[\s\S]*?show\(\)/)
  assert.match(source, /persistURL\(url\)/)
  assert.doesNotMatch(source, /setTimeout|pagehide|urlTimer/)
})
