import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('case articles, notes and wiki pages open the table of contents mid-article below 1200px', () => {
  for (const page of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const text = source(page)
    assert.match(text, /import \{ initTocSheet \} from '@\/utils\/toc-sheet\.mjs'/, page)
    assert.match(text, /initCurrentHeading\(\)\s*\n\s*initTocSheet\(\)/, page)
  }
  const sheet = source('src/utils/toc-sheet.mjs')
  // 본문 목차와 같은 #앵커를 복제해 주소·방문 기록이 남고, 지금 절 표시를 옮겨 온다.
  assert.match(sheet, /list\.cloneNode\(true\)/)
  assert.match(sheet, /aria-current/)
  assert.match(sheet, /showModal\(\)/)
  assert.match(sheet, /\(min-width: 1200px\)/)
  const css = source('src/styles/global.css')
  assert.match(css, /\.toc-fab\s*\{[^}]*position: fixed;[^}]*min-height: var\(--control-size\);/)
  assert.match(css, /\.toc-sheet a\s*\{[^}]*min-height: var\(--control-size\);/)
  assert.match(
    css,
    /@media \(min-width: 1200px\)\s*\{\s*\.toc-fab,\s*\.toc-sheet\s*\{\s*display: none;/,
  )
})
