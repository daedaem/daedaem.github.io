import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'

// JetBrains Mono 조각 파일과 unicode-range의 짝이 어긋나면 코드가 시스템 고정폭 글꼴로 그려진다.
// 짝은 각 파일의 cmap(fontTools)으로 확인한 값이다: latin 글자(a–z, |)는 jb-3에만 있다.
const css = readFileSync(new URL('../public/fonts/jetbrains-mono.css', import.meta.url), 'utf8')
const EXPECTED = { 'cyrillic-ext': 'jb-1', cyrillic: 'jb-5', greek: 'jb-4', vietnamese: 'jb-6', 'latin-ext': 'jb-2', latin: 'jb-3' }
const blocks = [...css.matchAll(/\/\* ([a-z-]+) \*\/\s*@font-face\s*{[^}]*?src: url\(\/fonts\/jetbrains\/(jb-\d)\.woff2\)/g)]

test('코드 글꼴: 모든 굵기에서 글자 범위마다 그 글자를 담은 파일을 쓴다', () => {
  assert.equal(blocks.length, 12)
  for (const [, subset, file] of blocks) assert.equal(file, EXPECTED[subset], `${subset}은 ${EXPECTED[subset]}여야 한다`)
})

test('코드 글꼴: latin 범위는 가장 큰 파일(기본 라틴 글자 전체)이다', () => {
  const size = (f) => statSync(new URL(`../public/fonts/jetbrains/${f}.woff2`, import.meta.url)).size
  const files = ['jb-1', 'jb-2', 'jb-3', 'jb-4', 'jb-5', 'jb-6']
  const largest = files.reduce((a, b) => (size(a) >= size(b) ? a : b))
  assert.equal(EXPECTED.latin, largest)
})
