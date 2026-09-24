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

test('the reading canvas is neutral white while the approved navy brand is preserved', () => {
  assert.equal(palettes.length, 3)
  const [light, systemDark, selectedDark] = palettes
  assert.equal(light.bg, '#ffffff')
  assert.equal(light.text, '#191f28')
  assert.equal(light['text-secondary'], '#3d4552')
  assert.equal(light.accent, '#223e60')
  assert.equal(light['mark-bg'], '#223e60')
  assert.equal(light['mark-ink'], '#fcfaf5')
  assert.equal(systemDark.bg, '#14181f')
  assert.equal(systemDark.text, '#e4e9f0')
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
  // 반경은 하나. 알약(999px)과 12px 시트는 목차 시트·FAB에만 남는다
  assert.match(css, /--radius: 4px;/)
  assert.doesNotMatch(css, /border-radius: (?:6|8|10)px/)
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

test('home and list summaries share one row grammar at one size on every width', () => {
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
  // 홈은 같은 PostRow를 쓰고 자기만의 요약 글자 크기를 두지 않는다
  assert.match(home, /<PostRow[\s\S]*?cause=\{post\.data\.cause \?\? post\.causeSummary\}/)
  assert.doesNotMatch(home, /font-size:/)
})

test('article cause stays body-size and medium-weight on mobile without rewriting its text', () => {
  // 원인 한 줄: 라벨(.k, 강조색) + 문장. 본문 크기 그대로, 굵기 500. 문장은 frontmatter의 cause 그대로
  assert.match(layout, /<aside class="cause">\s*<p class="k">원인 한 줄<\/p>\s*<p>\{cause\}<\/p>/)
  const cause = css.match(/aside\.cause p \+ p\s*\{([^}]+)\}/)?.[1]
  assert.ok(cause)
  assert.match(cause, /font-weight:\s*500;/)
  assert.doesNotMatch(cause, /font-size:/)
  assert.doesNotMatch(css.match(/aside\.cause\s*\{([^}]+)\}/)?.[1], /font-size:/)
  assert.match(css, /aside\.cause \.k\s*\{\s*color: var\(--accent\);/)
  // 본문은 슬롯을 문자열로 받아 첫머리 고지를 원인 한 줄 아래로 옮긴다
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /<div class="prose">/)
})

test('lists carry no cover thumbnails while the OG cover component retains full 3:2 assets', () => {
  // 홈·목록 행에 표지가 없다. 표지 부품은 OG용으로만 남는다
  assert.doesNotMatch(home, /<PostCover|<img|resolvePostCover/)
  assert.doesNotMatch(source('src/components/PostRow.astro'), /<PostCover|<img|cover/)
  // 옛 목록 폭(.wrap*)과 홈 판 토큰은 사라졌다. 새 화면은 .page 한 열이다
  assert.doesNotMatch(css, /\.wrap(?:-list|-wide)?\s*\{|--hero-bg|--hero-ink|--cover-navy/)
  assert.match(home, /<div class="page">/)
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
