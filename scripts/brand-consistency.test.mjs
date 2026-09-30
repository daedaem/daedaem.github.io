import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { MARK_PATH } from '../src/utils/brand.mjs'
import { renderOgCard, wrapOgTitle } from '../src/utils/og-card.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const identityTitle = '조해성의 기술 블로그'
const motto = '운영에서 만난 문제를 원인까지 따라간 기록'
const content = {
  title: '대댐 로그',
  kicker: identityTitle,
  siteTitle: '조해성 · 백엔드 개발자',
  identityTitle: '대댐 로그',
  subtitle: motto,
}

test('saved s4 identity and illustrated list preserve factual bindings and existing social identity', () => {
  const home = source('src/pages/index.astro')
  const og = source('src/pages/og/[...slug].png.ts')
  assert.match(source('src/consts.ts'), new RegExp(`identityTitle: '${identityTitle}'`))
  assert.match(source('src/consts.ts'), new RegExp(`motto: '${motto}'`))
  // Saved s4 replaces the previous identity/recommendation layout; factual bindings remain.
  assert.match(home, /\{SITE\.author\} · \{SITE\.role\}/)
  assert.match(home, /<section class="intro" aria-labelledby="home-title">/)
  assert.match(home, /<h1 id="home-title">운영에서 만난 문제를/)
  assert.match(home, /확인한 것, 판단한 이유, 바뀐 결과를 함께 적습니다\./)
  assert.equal((home.match(/href="\/about\/"/g) ?? []).length, 1)
  assert.match(home, /href="\/about\/"\s*>소개 보기/)
  assert.match(home, /getCollection\('posts',[\s\S]*?!data\.draft/)
  assert.match(home, /b\.data\.date\.valueOf\(\)\s*-\s*a\.data\.date\.valueOf\(\)/)
  assert.match(home, /posts\.map\(\(?post\)?\s*=>\s*\(?\s*<CaseRow/)
  assert.match(home, /href=\{`\/posts\/\$\{post\.id\}\/`\}/)
  assert.match(home, /title=\{post\.data\.title\}/)
  assert.match(home, /description=\{post\.data\.description\}/)
  assert.match(home, /date=\{post\.data\.date\}/)
  assert.match(home, /\{posts.length\}/)
  assert.match(source('src/components/CaseRow.astro'), /<IsometricCover kind=\{kind\}/)
  assert.match(source('src/components/IsometricCover.astro'), /aria-hidden="true"/)
  assert.equal([...home.matchAll(/<h1(?:\s|>)/g)].length, 1)
  assert.doesNotMatch(home, /mailto:|readingMinutes|causeSummary|outcome=/)
  // 직무 낱말은 consts의 SITE.role 한 곳에만 있다
  assert.match(source('src/consts.ts'), /role: '백엔드 개발자'/)
  for (const path of [
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/layouts/PostLayout.astro',
    'src/components/AuthorCard.astro',
    'src/components/BaseHead.astro',
  ]) {
    assert.doesNotMatch(source(path).replace(/description="[^"]*"/, ''), /백엔드 개발자/, path)
  }
  // 공유 카드: 큰 제목은 블로그 이름, kicker는 누구의 블로그인지, 아래 줄은 이름·직무
  assert.match(og, /title: SITE\.title,\s*kicker: SITE\.identityTitle/)
  assert.match(og, /siteTitle: `\$\{SITE\.author\} · \$\{SITE\.role\}`/)
  assert.match(og, /identityTitle: SITE\.title/)
  assert.match(og, /subtitle: SITE\.motto/)
  assert.doesNotMatch(home + og, /SITE\.tagline/)
})

test('OG renderer reuses the approved mark and current light palette', () => {
  const svg = renderOgCard(content)
  const css = source('src/styles/global.css')
  assert.ok(svg.includes(`d="${MARK_PATH}"`))
  for (const name of ['bg', 'accent', 'mark-bg', 'mark-ink', 'text', 'text-secondary']) {
    const value = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`))[1]
    assert.ok(svg.includes(`"${value}"`), `${name} missing from shared preview`)
  }
  assert.doesNotMatch(svg, /#1f5fd0|M4 6h9M4 12h7M4 18h5/)
  assert.match(svg, /<tspan x="80" dy="0">대댐 로그<\/tspan>/)
  assert.match(svg, />조해성의 기술 블로그</)
  assert.match(svg, />조해성 · 백엔드 개발자</)
  assert.match(svg, /운영에서 만난 문제를 원인까지 따라간 기록/)
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

test('saved s4 keeps a 64px single-row header with 44px real controls and knowledge navigation', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /\.top-in\s*\{[^}]*min-height:\s*64px/)
  assert.match(
    header,
    /<a href="\/" class="brand" aria-label=\{`\$\{SITE.title\} 홈`\}/,
  )
  assert.match(header, /<Mark size=\{20\} class="mark" \/>\{SITE.title\}/)
  assert.doesNotMatch(header, /\{SITE.author\}/)
  assert.match(header, /visibleNav = PRIMARY_NAV\n/)
  assert.match(header, /visibleNav\.map/)
  assert.match(header, /href=\{item.href\}/)
  assert.match(header, /aria-current=\{\s*active !== item.href/)
  const links = header.match(/\.nav a\s*\{([^}]+)\}/)?.[1]
  assert.match(links, /min-height:\s*(?:44px|var\(--control-size\))/)
  assert.match(links, /min-width:\s*(?:44px|var\(--control-size\))/)
  assert.match(header, /<Search\s*\/>/)
  assert.match(header, /<ThemeToggle\s*\/>/)
  assert.doesNotMatch(header, /position:\s*(?:fixed|sticky)|<script/)
  for (const href of ['/wiki/', '/learn/', '/projects/'])
    assert.ok(source('src/components/Footer.astro').includes(`href="${href}"`))
  const search = source('src/components/Search.astro')
  assert.match(search, /id="search-open"/)
  assert.match(search, /shortcut\.textContent[\s\S]*\? '⌘K'\s*: 'Ctrl K'/)
  assert.match(search, /aria-label="검색/)
})
