import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  PRELOAD_PLACEHOLDER,
  collectCodePoints,
  coveredCodePoints,
  toUnicodeRange,
} from './subset-fonts.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('unicode ranges round-trip through the dynamic subset CSS parser', () => {
  const covered = coveredCodePoints(
    '@font-face{unicode-range:U+ac00-ac02,U+20}@font-face{unicode-range:U+d7a3}',
  )
  assert.deepEqual(
    [...covered].sort((a, b) => a - b),
    [0x20, 0xac00, 0xac01, 0xac02, 0xd7a3],
  )
  assert.equal(toUnicodeRange(covered), 'U+20,U+ac00-ac02,U+d7a3')
})

test('collected glyphs always include printable ASCII and every character of the pages', () => {
  const set = collectCodePoints(['대댐 로그 ▸'])
  for (let c = 0x20; c <= 0x7e; c++) assert.ok(set.has(c))
  for (const ch of '대댐로그▸') assert.ok(set.has(ch.codePointAt(0)))
})

test('the site font keeps the dynamic subsets as fallback and preloads only the site file', () => {
  const head = source('src/components/BaseHead.astro')
  assert.ok(head.includes(`href="${PRELOAD_PLACEHOLDER}"`))
  assert.match(head, /pretendardvariable-dynamic-subset\.min\.css/)
  assert.doesNotMatch(head, /PretendardVariable\.subset\.\$\{n\}/)
  assert.match(source('package.json'), /pagefind --site dist && node scripts\/subset-fonts\.mjs/)
})
