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

test('card and row links contain only titles while CSS preserves the whole click and focus target', () => {
  const home = source('src/pages/index.astro')
  assert.match(home, /<h3 class="card-title">\s*<a href=\{`\/posts\/\$\{post\.id\}\/`\}>/)
  assert.match(home, /\{\s*\[\s*heading\.main,/)
  // 구분자는 화면에서만 숨기고 링크의 읽기 순서에는 남긴다
  assert.match(home, /<span class="visually-hidden">\{heading\.separator\}<\/span>/)
  assert.match(
    home,
    /heading\.subtitle &&\s*\(?\s*<span class="subtitle">\{heading\.subtitle\}<\/span>/,
  )
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
  const header = source('src/components/Header.astro')
  // 모바일 메뉴줄은 40px, 넓은 화면의 메뉴 링크는 44px
  const mobile = header.match(/\.nav a \{([^}]+)\}/)?.[1]
  assert.match(mobile, /min-height: 40px/)
  assert.match(mobile, /min-width: var\(--control-size\)/)
  const desktop = header.split('@media (min-width: 46em)')[1].match(/\.nav a \{([^}]+)\}/)?.[1]
  assert.match(desktop, /min-height: var\(--control-size\)/)
})
