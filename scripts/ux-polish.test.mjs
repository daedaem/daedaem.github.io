import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import readableCodeColors, {
  readableLightColors,
  readableDarkComment,
} from '../src/plugins/shiki-readable-colors.mjs'
import { checkRenderedCodeContrast, contrastRatio } from './code-contrast.mjs'
import { selectHomeContent, HOME_READING_PICKS } from '../src/utils/home-content.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const background = source('src/styles/global.css').match(/--code-bg:\s*(#[\da-f]{6})/)?.[1]

test('all three low-contrast syntax colors have a readable light replacement', () => {
  for (const [before, after] of Object.entries(readableLightColors)) {
    assert.ok(contrastRatio(before, background) < 4.5)
    assert.ok(contrastRatio(after, background) >= 4.5)
  }
  assert.equal(contrastRatio('#fff', '#000'), 21)
})

test('Shiki transformer changes only the exact light color, preserving dark and backgrounds', () => {
  const node = {
    properties: { style: 'color:#D73A49;--shiki-dark:#F97583;background-color:#D73A49' },
  }
  readableCodeColors().span(node)
  assert.equal(node.properties.style, 'color:#bc3040;--shiki-dark:#F97583;background-color:#D73A49')
  const unchanged = { properties: { style: 'font-weight:bold;color:#24292e;--shiki-dark:#d73a49' } }
  readableCodeColors().span(unchanged)
  assert.equal(unchanged.properties.style, 'font-weight:bold;color:#24292e;--shiki-dark:#d73a49')
  assert.doesNotThrow(() => readableCodeColors().span({ properties: {} }))
})

test('dark comments meet contrast without changing the light comment color', () => {
  const node = { properties: { style: 'color:#6A737D;--shiki-dark:#6A737D' } }
  readableCodeColors().span(node)
  assert.equal(node.properties.style, `color:#6A737D;--shiki-dark:${readableDarkComment}`)
  assert.ok(contrastRatio(readableDarkComment, '#24292e') >= 4.5)
})

const code = (span) =>
  `<pre class="astro-code" style="background-color:#fff;--shiki-dark-bg:#24292e;color:#24292e;--shiki-dark:#e1e4e8"><code>${span}</code></pre>`

test('generated-code contrast check catches both themes and does not round up the threshold', () => {
  assert.deepEqual(
    checkRenderedCodeContrast(
      code('<span style="color:#bc3040;--shiki-dark:#f97583">if</span>'),
      background,
    ),
    [],
  )
  assert.equal(
    checkRenderedCodeContrast(
      code('<span style="color:#e36209;--shiki-dark:#444444">if</span>'),
      background,
    ).length,
    2,
  )
  assert.equal(
    checkRenderedCodeContrast(code('<span style="color:#D73A49">if</span>'), background).length,
    1,
  )
  assert.deepEqual(checkRenderedCodeContrast('<pre>plain text</pre>', background), [])
})

test('home summaries are separate from the actual article cause and reading order', () => {
  const data = { cause: '원문 원인', title: '원문 제목' }
  const { recommended } = selectHomeContent([{ id: HOME_READING_PICKS[0].id, data }])
  assert.equal(recommended[0].data, data)
  assert.equal(recommended[0].data.cause, '원문 원인')
  assert.ok(recommended[0].causeSummary.length < 80)
  assert.match(recommended[0].causeSummary, /Java와 SQL/)
  assert.match(recommended[0].causeSummary, /NULL과 빈 문자열/)
  assert.match(recommended[0].causeSummary, /상대가 관리/)
})

test('card and row links contain only titles while CSS preserves the whole click and focus target', () => {
  const home = source('src/pages/index.astro')
  assert.match(home, /<h2>\s*<a href=\{`\/posts\/\$\{post\.id\}\/`\}>/)
  assert.match(home, /heading\.main \+ heading\.separator/)
  assert.match(home, /heading\.subtitle && <span class="subtitle">\{heading\.subtitle\}<\/span>/)
  assert.match(home, /\.editorial-card a:focus-visible::after/)
  assert.match(home, /\.wiki-list a:focus-visible::after/)
  assert.match(home, /<nav class="archive-links" aria-label="학습 기록">/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<a class="title" href=\{href\}>\{title\}<\/a>/)
  assert.doesNotMatch(row, /aria-labelledby/)
  assert.match(row, /\.title:focus-visible::after/)
  assert.doesNotMatch(home, /post\.(causeSummary|data\.cause)/)
  assert.match(source('src/components/PostCover.astro'), /aria-hidden="true"/)
})

test('global motion preference and header targets remain explicit', () => {
  assert.match(source('src/styles/global.css'), /@media \(prefers-reduced-motion: reduce\)/)
  const header = source('src/components/Header.astro').match(/nav a \{([^}]+)\}/)?.[1]
  assert.match(header, /min-height: var\(--control-size\)/)
  assert.match(header, /min-width: var\(--control-size\)/)
})
