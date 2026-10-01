import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import yaml from 'js-yaml'
import { NOTE_SERIES, orderedNoteSeries, noteSeriesPosition } from '../src/utils/note-series.mjs'
const notes = readdirSync('src/content/notes')
  .filter((f) => f.endsWith('.md'))
  .map((file) => {
    const data = yaml.load(readFileSync(`src/content/notes/${file}`, 'utf8').split('---')[1])
    return { id: data.slug, data }
  })
test('all series members exist, are unique and agree with original title chapter numbers', () => {
  const groups = orderedNoteSeries(notes)
  const ids = groups.flatMap((g) => g.chapters.map((c) => c.note.id))
  assert.equal(new Set(ids).size, 17)
  for (const group of groups)
    for (const { chapter, note } of group.chapters) {
      const match = note.data.title.match(/(?:ch| - )(\d+(?:\.\d+)?)/)
      assert.equal(match?.[1], chapter, note.id)
    }
  assert.throws(() => orderedNoteSeries(notes.filter((note) => note.id !== 'typescript-00-overview')), /시리즈 문서가 없습니다/)
})
test('chapter navigation stays within the same series, is reciprocal and stops at boundaries', () => {
  for (const series of NOTE_SERIES) {
    const ids = series.chapters.map(([, id]) => id)
    for (const [index, id] of ids.entries()) {
      const position = noteSeriesPosition(id)
      assert.equal(position.previous, ids[index - 1])
      assert.equal(position.next, ids[index + 1])
      if (position.next) assert.equal(noteSeriesPosition(position.next).previous, id)
    }
  }
  assert.equal(noteSeriesPosition('scsa'), undefined)
})
test('actual chapter order wins over publication date and missing chapters are not invented', () => {
  const groups = orderedNoteSeries([...notes].reverse())
  assert.deepEqual(
    groups[0].chapters.map((c) => c.chapter),
    ['0', '1', '2', '3.1', '3.2', '4'],
  )
  assert.deepEqual(
    groups[1].chapters.map((c) => c.chapter),
    ['1', '2', '3', '4', '5', '6', '7'],
  )
  assert.deepEqual(
    groups[2].chapters.map((c) => c.chapter),
    ['1', '2', '4', '5'],
  )
})
