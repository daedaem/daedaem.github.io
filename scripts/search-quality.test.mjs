import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const search = readFileSync(new URL('../src/components/Search.astro', import.meta.url), 'utf8')

test('long case articles are not buried under short pages that mention the same word', () => {
  assert.match(search, /ranking: \{ pageLength: 0\.3 \}/)
})

test('a prefix fallback that matched less than half of a word is reported as no result', () => {
  assert.match(search, /id="search-weak"/)
  assert.match(search, /weakestPrefix\(term, marks\) < Math\.ceil\(term\.length \/ 2\)/)
  assert.match(search, /#search-mount\.is-weak \.pagefind-ui__drawer \{\s*display: none;/)
})

test('results can be reached and opened from the keyboard without breaking Korean input', () => {
  assert.match(search, /event\.isComposing/)
  assert.match(search, /event\.key === 'ArrowDown'/)
  assert.match(search, /event\.key === 'ArrowUp'/)
  assert.match(search, /event\.key === 'Enter' && event\.target === input/)
})

test('other pages can open search with a term', () => {
  assert.match(search, /addEventListener\('site-search'/)
  assert.match(search, /searchUI\.triggerSearch\(term\)/)
})
