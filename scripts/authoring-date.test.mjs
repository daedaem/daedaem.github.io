import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { formatCompactDate } from '../src/utils/compact-date.mjs'
test('new draft date follows Seoul, including the UTC day boundary', () => {
  assert.equal(formatCompactDate(new Date('2026-09-11T15:00:00Z')).replaceAll('.', '-'), '2026-09-12')
  assert.equal(formatCompactDate(new Date('2026-09-11T14:59:59Z')).replaceAll('.', '-'), '2026-09-11')
  const source = readFileSync(new URL('./new.mjs', import.meta.url), 'utf8')
  assert.match(source, /formatCompactDate\(new Date\(\)\)/)
  assert.doesNotMatch(source, /toISOString\(\)/)
})
