import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import readableCodeColors, {
  readableLightColors,
  readableDarkColors,
} from '../src/plugins/shiki-readable-colors.mjs'
import { checkRenderedCodeContrast, contrastRatio } from './code-contrast.mjs'
import { selectHomeContent, HOME_READING_PICKS } from '../src/utils/home-content.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const background = source('src/styles/global.css').match(/--code-bg:\s*(#[\da-f]{6})/)?.[1]
// VS Code Dark+ 배경과 사이트 다크 코드 면(--code) 둘 다 통과해야 한다
const darkBackgrounds = ['#1e1e1e', '#1a1f28']

test('low-contrast Light+ syntax colors have a readable light replacement', () => {
  for (const [before, after] of Object.entries(readableLightColors)) {
    assert.ok(contrastRatio(before, background) < 4.5)
    assert.ok(contrastRatio(after, background) >= 4.5)
  }
  assert.equal(contrastRatio('#fff', '#000'), 21)
})

test('low-contrast Dark+ syntax colors have a readable dark replacement', () => {
  for (const [before, after] of Object.entries(readableDarkColors)) {
    assert.ok(darkBackgrounds.some((bg) => contrastRatio(before, bg) < 4.5))
    for (const bg of darkBackgrounds) assert.ok(contrastRatio(after, bg) >= 4.5)
  }
})

test('Shiki transformer changes only the exact mapped colors, preserving backgrounds', () => {
  const node = {
    properties: { style: 'color:#267F99;--shiki-dark:#808080;background-color:#267F99' },
  }
  readableCodeColors().span(node)
  assert.equal(node.properties.style, 'color:#1f6f86;--shiki-dark:#8c8c8c;background-color:#267F99')
  const unchanged = { properties: { style: 'font-weight:bold;color:#000000;--shiki-dark:#267f99' } }
  readableCodeColors().span(unchanged)
  assert.equal(unchanged.properties.style, 'font-weight:bold;color:#000000;--shiki-dark:#267f99')
  assert.doesNotThrow(() => readableCodeColors().span({ properties: {} }))
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
  assert.match(recommended[0].causeSummary, /빈 값 비교/)
  assert.match(recommended[0].causeSummary, /처리 구분값의 규약/)
  assert.match(recommended[0].causeSummary, /수신값이 정상 반영되지 않았다/)
})

test('each s4 row is one link with full title and summary and a decorative cover', () => {
  const home = source('src/pages/index.astro')
  assert.match(home, /href=\{`\/posts\/\$\{post\.id\}\/`\}/)
  const row = source('src/components/CaseRow.astro')
  assert.equal((row.match(/<a(?:\s|>)/g) ?? []).length, 1)
  assert.match(row, /href=\{href\}/)
  assert.doesNotMatch(row, /aria-labelledby|stretched-link|line-clamp/)
  assert.match(row, /<Heading class="reading-title"><TitleText title=\{title\} \/><\/Heading>/)
  assert.match(row, /const Heading = headingLevel === 3 \? 'h3' : 'h2'/)
  assert.match(home, /headingLevel=\{3\}/)
  const title = row.indexOf('<Heading class="reading-title">'),
    summary = row.indexOf('<p class="reading-excerpt">')
  assert.ok(title >= 0 && summary > title)
  assert.match(source('src/components/IsometricCover.astro'), /aria-hidden="true"/)
})

test('global motion preference and 44px s4 header targets remain explicit', () => {
  assert.match(source('src/styles/global.css'), /@media \(prefers-reduced-motion: reduce\)/)
  const header = source('src/components/Header.astro')
  const links = header.match(/\.nav a\s*\{([^}]+)\}/)?.[1]
  assert.match(links, /min-height:\s*(?:44px|var\(--control-size\))/)
  assert.match(links, /min-width:\s*(?:44px|var\(--control-size\))/)
  const mobile = header.split(/@media\s*\(max-width:\s*760px\)/)[1]
  assert.ok(mobile)
  assert.doesNotMatch(mobile, /\.nav a\s*\{[^}]*(?:height|width):\s*(?:[0-3]?\d)px/)
})
