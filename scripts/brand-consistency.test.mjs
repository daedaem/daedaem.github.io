import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { MONOGRAM_PATH } from '../src/utils/brand.mjs'
import { renderOgCard, wrapOgTitle } from '../src/utils/og-card.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const identityTitle = '조해성의 기술 블로그'
const motto = '문제가 시작된 곳을 찾습니다.'
const content = { title: identityTitle, kicker: '대댐 로그', siteTitle: '대댐 로그', identityTitle, subtitle: motto }

test('home identity and social preview share one short title and one motto', () => {
  const home = source('src/pages/index.astro')
  const og = source('src/pages/og/[...slug].png.ts')
  assert.match(source('src/consts.ts'), new RegExp(`identityTitle: '${identityTitle}'`))
  assert.match(source('src/consts.ts'), new RegExp(`motto: '${motto}'`))
  assert.match(home, /<h1>\{SITE\.identityTitle\}<\/h1>/)
  assert.match(home, /<p class="identity-context">\{SITE\.motto\}<\/p>/)
  assert.equal([...home.matchAll(/<h1(?:\s|>)/g)].length, 1)
  assert.match(home, /<h2 id="recommended-title">먼저 읽을 글<\/h2>/)
  assert.match(home, /<h3 class="card-title">/)
  assert.match(home, /\.byline h1\s*\{[^}]*font-size:\s*1\.5rem;[^}]*font-weight:\s*700;/)
  assert.match(
    home.split('@media (max-width: 640px)')[1],
    /\.byline h1\s*\{[^}]*font-size:\s*1\.375rem;/,
  )
  assert.match(og, /title: SITE\.identityTitle/)
  assert.match(og, /identityTitle: SITE\.identityTitle/)
  assert.match(og, /subtitle: SITE\.motto/)
  assert.doesNotMatch(home + og, /SITE\.tagline/)
})

test('OG renderer reuses the approved mark and current light palette', () => {
  const svg = renderOgCard(content)
  const css = source('src/styles/global.css')
  assert.ok(svg.includes(`d="${MONOGRAM_PATH}"`))
  for (const name of ['bg', 'accent', 'mark-bg', 'mark-ink', 'text', 'text-secondary']) {
    const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`))[1]
    assert.ok(svg.includes(`"${value}"`), `${name} missing from shared preview`)
  }
  assert.doesNotMatch(svg, /#1f5fd0|M4 6h9M4 12h7M4 18h5/)
  assert.match(svg, /<tspan x="80" dy="0">조해성의 기술 블로그<\/tspan>/)
  assert.match(svg, /문제가 시작된 곳을 찾습니다\./)
  const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng()
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a')
  assert.equal(png.readUInt32BE(16), 1200)
  assert.equal(png.readUInt32BE(20), 630)
})

test('OG titles retain bounded wrapping and escape authored XML characters', () => {
  assert.deepEqual(wrapOgTitle('짧은 글 제목'), ['짧은 글 제목'])
  const long = wrapOgTitle('가'.repeat(80))
  assert.equal(long.length, 3)
  assert.ok(long.every((line) => line.length <= 17))
  assert.ok(long.at(-1).endsWith('…'))
  const svg = renderOgCard({ ...content, title: '<b>&"</b>', kicker: '<script>', siteTitle: 'A&B' })
  assert.match(svg, /&lt;b&gt;&amp;&quot;&lt;\/b&gt;/)
  assert.match(svg, /&lt;script&gt;/)
  assert.match(svg, /A&amp;B/)
  assert.doesNotMatch(svg, /<script>|<b>/)
  const route = source('src/pages/og/[...slug].png.ts')
  assert.match(route, /title: p\.data\.title/)
  assert.match(route, /title: w\.data\.title/)
  assert.match(route, /fontFiles: \[font\('Regular'\), font\('SemiBold'\), font\('Bold'\)\]/)
})

test('cover disclosure belongs with reader-facing writing principles, not the editor', () => {
  const about = source('src/pages/about.astro')
  assert.match(
    about,
    /글을 쓸 때 지키는 것[\s\S]*글 표지는 AI로 생성한 개념 일러스트이며, 실제 화면이나 시스템 구성도가 아닙니다\./,
  )
  assert.doesNotMatch(source('src/pages/admin/index.astro'), /글 표지는 AI로 생성/)
})

test('compact desktop header restores readable shortcuts only where space and hover allow', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /\.bar\s*\{[^}]*min-height:\s*80px;/)
  assert.match(header, /@media \(min-width: 1024px\) and \(hover: hover\)/)
  const desktop = header
    .split('@media (min-width: 1024px) and (hover: hover)')[1]
    .split('@media (max-width: 640px)')[0]
  assert.match(desktop, /#search-open kbd\)[^}]*display:\s*inline;/)
  assert.match(desktop, /font-size:\s*0\.75rem;\s*opacity:\s*1;/)
  assert.match(header, /min-width:\s*var\(--control-size\)/)
  assert.match(header.split('@media (max-width: 640px)')[1], /grid-template-columns:\s*1fr auto;/)
  assert.match(
    source('src/components/Search.astro'),
    /shortcut\.textContent[\s\S]*\? '⌘K'\s*: 'Ctrl K'/,
  )
})
