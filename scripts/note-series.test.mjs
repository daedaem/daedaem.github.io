import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import yaml from 'js-yaml'
import {
  NOTE_SERIES,
  orderedNoteSeries,
  noteSeriesPosition,
  orderedNoteGroups,
  noteListTitle,
  noteSeriesAnchor,
} from '../src/utils/note-series.mjs'
const notes = readdirSync('src/content/notes')
  .filter((f) => /\.mdx?$/.test(f))
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
  assert.throws(
    () => orderedNoteSeries(notes.filter((note) => note.id !== 'typescript-00-overview')),
    /시리즈 문서가 없습니다/,
  )
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

test('shared archive groups cover all 26 unchanged documents exactly once and retain legacy hashes', () => {
  const groups = orderedNoteGroups(notes)
  const ids = groups.flatMap((group) => group.chapters.map(({ note }) => note.id))
  assert.equal(ids.length, 26)
  assert.equal(new Set(ids).size, 26)
  assert.deepEqual([...ids].sort(), notes.map((note) => note.id).sort())
  assert.deepEqual(
    groups.map((group) => group.id),
    ['ts', 'core-js', 'deep-dive', 'js', 'web', 'transition'],
  )
  assert.equal(noteSeriesAnchor('typescript'), 'ts')
  assert.equal(noteSeriesAnchor('core-javascript'), 'core-js')
  assert.equal(noteSeriesAnchor('modern-js-deep-dive'), 'deep-dive')
})
test('list titles remove only repeated display prefixes and keep source titles intact', () => {
  assert.equal(noteListTitle('타입스크립트 - 3.1 클래스', '3.1'), '3.1 클래스')
  assert.equal(noteListTitle('코어자바스크립트 ch3. This', '3'), '3 This')
  assert.equal(noteListTitle('모던 JS Deep Dive - 4. 변수', '4'), '4 변수')
  assert.equal(noteListTitle('JavaScript - 데이터타입', ''), '데이터타입')
  assert.equal(
    noteListTitle('삼성전자 DX SCSA 19기 합격, 6개월의 교육, 그리고 최종 탈락', ''),
    '삼성전자 DX SCSA 19기 합격, 6개월의 교육, 그리고 최종 탈락',
  )
})
