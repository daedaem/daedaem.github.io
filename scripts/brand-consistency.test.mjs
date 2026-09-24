import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { MONOGRAM_PATH } from '../src/utils/brand.mjs'
import { renderOgCard, wrapOgTitle } from '../src/utils/og-card.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const identityTitle = '조해성의 기술 블로그'
const motto = '증상이 아니라 원인을 고칩니다'
const content = {
  title: identityTitle,
  kicker: '대댐 로그',
  siteTitle: '대댐 로그',
  identityTitle,
  subtitle: motto,
}

test('home identity is the author name under a role label while the social preview keeps the short title and motto', () => {
  const home = source('src/pages/index.astro')
  const og = source('src/pages/og/[...slug].png.ts')
  assert.match(source('src/consts.ts'), new RegExp(`identityTitle: '${identityTitle}'`))
  assert.match(source('src/consts.ts'), new RegExp(`motto: '${motto}'`))
  // 홈 첫 화면: 라벨 "백엔드 개발자" → h1 이름 → 소개 한 문장 → 소개 보기. 히어로 판·카드·표지는 없다
  assert.match(
    home,
    /<section class="ident"[^>]*>\s*<p class="k">백엔드 개발자<\/p>\s*<h1[^>]*>\{SITE\.author\}<\/h1>\s*<p class="lede">\{SITE\.intro\}<\/p>/,
  )
  assert.equal([...home.matchAll(/<h1(?:\s|>)/g)].length, 1)
  assert.match(home, /<h2 class="k" id="recommended-title">\s*먼저 읽을 글\s*<\/h2>/)
  assert.doesNotMatch(home, /byline|hero|card-title|PostCover|identity-context/)
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
  assert.match(svg, /증상이 아니라 원인을 고칩니다/)
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

test('the one-row header stays within 64px on desktop and two rows (52 + 40) on mobile', () => {
  const header = source('src/components/Header.astro')
  // 위 3px 로고색 선, 로고 마크 + 이름, 메뉴, 검색·테마
  assert.match(header, /border-top: 3px solid var\(--mark-bg\);/)
  assert.match(header, /<Mark size=\{22\} class="brand-mark" \/>/)
  assert.match(header, /\.brand\s*\{[^}]*min-height:\s*52px;/)
  assert.match(header, /\.nav\s*\{[^}]*height:\s*40px;/)
  assert.match(header, /grid-template-areas:\s*'brand tools'\s*'nav nav';/)
  const desktop = header.split('@media (min-width: 46em)')[1]
  assert.match(desktop, /\.top-in\s*\{[^}]*min-height:\s*57px;/)
  assert.match(desktop, /grid-template-areas:\s*'brand nav tools';/)
  assert.match(header, /min-width:\s*var\(--control-size\)/)
  // 단축키 표시는 넓은 화면에서만 보인다
  const search = source('src/components/Search.astro')
  assert.match(search, /#search-open kbd \{\s*display: none;/)
  assert.match(
    search,
    /@media \(min-width: 46em\) \{\s*#search-open kbd \{\s*display: inline-block;/,
  )
  assert.match(search, /shortcut\.textContent[\s\S]*\? '⌘K'\s*: 'Ctrl K'/)
})
