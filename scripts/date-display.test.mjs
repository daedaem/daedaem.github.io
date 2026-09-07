import test from 'node:test'
import assert from 'node:assert/strict'
import { checkDateDisplay } from './check-site.mjs'

const created = '2023-01-13'
const updated = '2026-09-06'
const render = (dates) =>
  `<span class="content-dates">${dates
    .map((date) => `<time datetime="${new Date(date).toISOString()}">날짜 안내 ${date}</time>`)
    .join('')}</span>`

test('rendered dates retain both original and revision metadata in order', () => {
  assert.deepEqual(checkDateDisplay(render([created, updated]), created, updated), [])
})

test('showing only a revision is rejected even when it is the latest date', () => {
  assert.ok(checkDateDisplay(render([updated]), created, updated).length)
  assert.ok(checkDateDisplay(render([updated, created]), created, updated).length)
})

test('unrevised documents show only the original date', () => {
  assert.deepEqual(checkDateDisplay(render([created]), created), [])
  assert.ok(checkDateDisplay(render([created, updated]), created).length)
})

test('equal date instants are not shown twice', () => {
  assert.deepEqual(checkDateDisplay(render([created]), created, `${created}T00:00:00Z`), [])
  assert.ok(checkDateDisplay(render([created, created]), created, created).length)
})

test('dates need visible text, without fixing the author-editable wording', () => {
  assert.ok(checkDateDisplay('<span class="content-dates"></span>', created).length)
  assert.ok(checkDateDisplay(render([created]).replace(/>날짜 안내 [^<]+</, '><'), created).length)
})
