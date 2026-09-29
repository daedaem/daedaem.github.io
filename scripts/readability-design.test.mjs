import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contrastRatio } from './code-contrast.mjs'
import assets from '../src/data/post-cover-images.json' with { type: 'json' }
import { getCoverImageAttributes } from '../src/utils/cover-images.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const css = source('src/styles/global.css')
const home = source('src/pages/index.astro')
const layout = source('src/layouts/PostLayout.astro')
const palettes = [...css.matchAll(/[^{}]*\{([^{}]*--text-muted:\s*#[^{}]*)\}/g)].map(([, block]) =>
  Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
  ),
)

test('s4 uses a neutral reading canvas with blue controls and preserved legacy identity assets', () => {
  assert.equal(palettes.length, 3)
  const [light, systemDark, selectedDark] = palettes
  assert.equal(light.bg, '#ffffff')
  assert.equal(light.text, '#191f28')
  assert.equal(light['text-secondary'], '#3d4552')
  assert.equal(light.accent, '#1b64da')
  assert.equal(light['mark-bg'], '#223e60')
  assert.equal(light['mark-ink'], '#fcfaf5')
  assert.equal(systemDark.bg, '#14181f')
  assert.equal(systemDark.text, '#e4e9f0')
  assert.equal(systemDark.accent, '#8ab4f8')
  assert.deepEqual(systemDark, selectedDark)
  // 새 이름(--fg/--fg2/--muted/--line/--soft/--code)과 옛 이름은 같은 값이다
  for (const palette of palettes) {
    assert.equal(palette.text, palette.fg)
    assert.equal(palette['text-secondary'], palette.fg2)
    assert.equal(palette['text-muted'], palette.muted)
    assert.equal(palette.border, palette.line)
    assert.equal(palette['border-strong'], palette.line2)
    assert.equal(palette['bg-subtle'], palette.soft)
    assert.equal(palette['code-bg'], palette.code)
  }
  // 기존 지식 문서의 기본 반경은 유지하고, s4 표지와 코드 블록만 승인된 반경을 쓴다.
  assert.match(css, /--radius: 4px;/)
  assert.doesNotMatch(css, /border-radius: (?:6|8|10)px/)
  assert.match(source('src/components/IsometricCover.astro'), /border-radius:\s*10px;/)
  assert.match(layout, /\.case-article \.prose :global\(pre\)\s*\{[^}]*border-radius:\s*8px;/)
  assert.match(css, /body \{[^}]*font-size: 1\.125rem;[^}]*line-height: 1\.8;/)
  assert.match(
    css,
    /text-wrap: pretty;[^}]*hanging-punctuation: first;[^}]*text-spacing-trim: space-first;/,
  )
  assert.match(css, /\nem \{\s*font-style: normal;\s*font-weight: 600;/)
})

test('body and summary tokens exceed 7:1 on each reading surface in both themes', () => {
  for (const palette of palettes) {
    for (const foreground of ['text', 'text-secondary']) {
      for (const background of ['bg', 'bg-subtle', 'bg-card']) {
        const ratio = contrastRatio(palette[foreground], palette[background])
        assert.ok(ratio >= 7, `${foreground} on ${background}: ${ratio}`)
      }
    }
  }
})

test('case summaries share the s4 row and archive summaries retain their original typography', () => {
  assert.match(css, /--type-body:\s*1rem;/)
  // 행 요약(.row-d)과 원인 한 줄(.row-c)은 전역 한 규칙이다. 모바일에서 따로 줄이지 않는다
  assert.match(
    css,
    /\.row-d\s*\{[^}]*font-size:\s*0\.9375rem;[^}]*line-height:\s*1\.6;[^}]*color:\s*var\(--fg2\);/,
  )
  assert.match(css, /\.row-c\s*\{[^}]*border-left:\s*2px solid var\(--accent\);/)
  assert.doesNotMatch(css, /@media[^{]*\{[^}]*\.row-d\s*\{/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<span class="row-d">\{description\}<\/span>/)
  assert.match(row, /<span class="row-c">\s*<span class="row-ck">원인<\/span>\s*\{cause\}/)
  assert.doesNotMatch(row, /<style>/)
  // 사례 목록은 동일한 CaseRow를 쓰고 16/26 요약을 모바일에서도 유지한다.
  const caseRow = source('src/components/CaseRow.astro')
  for (const path of [
    'src/pages/index.astro',
    'src/pages/posts/index.astro',
    'src/pages/categories/[category].astro',
  ]) {
    const page = source(path)
    assert.match(page, /<CaseRow[\s\S]*?description=\{(?:post|p)\.data\.description\}/)
    assert.doesNotMatch(page, /\.reading-excerpt\s*\{/)
  }
  assert.match(caseRow, /<p class="reading-excerpt">\{description\}<\/p>/)
  assert.match(
    caseRow,
    /\.reading-excerpt\s*\{[^}]*color:\s*var\(--fg2\);[^}]*font-size:\s*16px;[^}]*line-height:\s*26px;/,
  )
  assert.equal((caseRow.match(/\.reading-excerpt\s*\{/g) ?? []).length, 1)
  assert.match(caseRow, /\.reading-title\s*\{[^}]*font-size:\s*22px;[^}]*line-height:\s*30px;/)
  assert.match(
    caseRow,
    /@media \(max-width: 760px\)[\s\S]*?\.reading-title\s*\{[^}]*font-size:\s*21px;[^}]*line-height:\s*29px;/,
  )
})

test('article cause stays body-size in the s4 reading surface without rewriting its text', () => {
  assert.match(layout, /<aside class="cause">\s*<p class="k">원인 한 줄<\/p>\s*<p>\{cause\}<\/p>/)
  const cause = layout.match(/\.case-article \.cause\s*\{([^}]+)\}/)?.[1]
  assert.ok(cause)
  assert.match(cause, /font-size:\s*18px;/)
  assert.match(cause, /line-height:\s*30px;/)
  assert.match(cause, /border:\s*1px solid var\(--line\);/)
  assert.match(
    layout,
    /\.case-article \.cause p \+ p\s*\{[^}]*font-weight:\s*400;[^}]*line-height:\s*30px;/,
  )
  assert.match(
    layout,
    /\.case-article \.cause \.k\s*\{[^}]*color:\s*var\(--fg\);[^}]*font-size:\s*15px;/,
  )
  assert.match(
    layout,
    /\.case-article \.prose\s*\{[^}]*font-size:\s*18px;[^}]*line-height:\s*32px;/,
  )
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /<div class="prose">/)
})

test('s4 lists use contained local illustrations while full 3:2 legacy image assets remain valid', () => {
  // 홈은 공통 단면도 행을 사용한다. 옛 이미지 자산과 아카이브 행은 그대로 유지한다.
  assert.doesNotMatch(home, /<PostCover|<img|resolvePostCover/)
  assert.doesNotMatch(source('src/components/PostRow.astro'), /<PostCover|<img|cover/)
  // 옛 목록 폭(.wrap*)과 홈 판 토큰은 사라졌다. 새 화면은 .page 한 열이다
  assert.doesNotMatch(css, /\.wrap(?:-list|-wide)?\s*\{|--hero-bg|--hero-ink|--cover-navy/)
  assert.match(home, /<div class="page case-page home">/)
  assert.match(home, /<CaseRow/)
  const illustration = source('src/components/IsometricCover.astro')
  assert.match(illustration, /isometricCoverSources\(kind\)/)
  assert.match(illustration, /class="cover-light"[\s\S]*?class="cover-dark"/)
  assert.match(illustration, /:root\[data-theme='dark'\]\) \.cover-light \{\s*display: none;/)
  assert.match(illustration, /aria-hidden="true"/)
  assert.match(illustration, /object-fit:\s*contain;/)
  assert.doesNotMatch(illustration, /<script|https?:\/\//)
  const caseRow = source('src/components/CaseRow.astro')
  assert.match(caseRow, /\.cover\s*\{[^}]*width:\s*220px;[^}]*height:\s*160px;/)
  assert.match(
    caseRow,
    /@media \(max-width: 760px\)[\s\S]*?\.cover\s*\{[^}]*width:\s*100%;[^}]*height:\s*176px;/,
  )
  for (const src of Object.keys(assets)) {
    const card = getCoverImageAttributes(src)
    assert.equal(card.width / card.height, 3 / 2)
    assert.equal(
      card.sizes,
      '(max-width: 640px) min(calc(100vw - 40px), 18rem), (max-width: 1100px) 46vw, 500px',
    )
    assert.equal(getCoverImageAttributes(src, true).sizes, '(max-width: 640px) 88px, 144px')
  }
  assert.match(
    source('src/components/PostCover.astro'),
    /aspect-ratio: \$\{imageAttributes\.width\} \/ \$\{imageAttributes\.height\}/,
  )
})
