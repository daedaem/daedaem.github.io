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

test('the reading canvas is the approved achromatic palette while the navy brand is preserved', () => {
  assert.equal(palettes.length, 3)
  const [light, systemDark, selectedDark] = palettes
  // 시안(design2 final) 팔레트: 무채 회색 + 남색 강조. 로고 마크 색은 그대로다
  assert.equal(light.bg, '#ffffff')
  assert.equal(light.text, '#0a0a0a')
  assert.equal(light['text-secondary'], '#404040')
  assert.equal(light.muted, '#6b6b6b')
  assert.equal(light.accent, '#294970')
  assert.equal(light['accent-2'], '#4f7cb8')
  assert.equal(light['mark-bg'], '#223e60')
  assert.equal(light['mark-ink'], '#fcfaf5')
  assert.equal(systemDark.bg, '#0a0a0a')
  assert.equal(systemDark.text, '#fafafa')
  assert.equal(systemDark['mark-bg'], '#a8c1e2')
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
  // 반경 체계(시안): 카드 12, 상자 14, 단추 8, 배지 6, 알약 999. 값은 토큰 한 곳에서 온다
  assert.match(css, /--radius: 10px;/)
  assert.match(css, /--r-card: 12px;/)
  assert.match(css, /--r-box: 14px;/)
  assert.match(css, /--r-btn: 8px;/)
  assert.match(css, /--r-badge: 6px;/)
  assert.match(css, /--r-pill: 999px;/)
  assert.doesNotMatch(css, /border-radius: 4px/)
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

test('home and list summaries share one line grammar at one size on every width', () => {
  assert.match(css, /--type-body:\s*1rem;/)
  // 줄 요약(.line-d)과 원인·결과 줄(.line-c)은 전역 한 규칙이다(15px, 카드 문장과 같은 크기).
  // 모바일에서 따로 줄이지 않는다
  assert.match(
    css,
    /\.line-d\s*\{[^}]*font-size:\s*0\.9375rem;[^}]*line-height:\s*1\.6;[^}]*color:\s*var\(--fg2\);/,
  )
  assert.match(css, /\.line-c \.ck\s*\{[^}]*color:\s*var\(--accent\);/)
  assert.doesNotMatch(css, /@media[^{]*\{[^}]*\.line-d\s*\{/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /<span class="line-d">\{description\}<\/span>/)
  assert.match(row, /<span class="line-c">\s*<span class="ck">원인<\/span>\s*\{cause\}/)
  assert.doesNotMatch(row, /<style>/)
  // 홈 추천 카드의 원인·결과 줄은 자르지 않고(줄 수 제한 없음) 15px 전역 규칙(.card p)을 쓴다
  assert.match(css, /\.card p \{[^}]*font-size: 0\.9375rem;/)
  assert.doesNotMatch(css, /line-clamp/)
  assert.match(home, /<p class="card-line">\s*<span class="ck">원인<\/span>\s*\{c\.cause\}/)
  assert.doesNotMatch(home, /font-size:/)
})

test('article cause stays body-size and medium-weight on mobile without rewriting its text', () => {
  // 원인 한 줄: 라벨(.k, 강조색) + 문장. 본문 크기 그대로, 굵기 500. 문장은 frontmatter의 cause 그대로
  assert.match(layout, /<aside class="cause">\s*<p class="k">원인 한 줄<\/p>\s*<p>\{cause\}<\/p>/)
  const cause = css.match(/aside\.cause p \+ p\s*\{([^}]+)\}/)?.[1]
  assert.ok(cause)
  assert.match(cause, /font-weight:\s*600;/)
  assert.doesNotMatch(cause, /font-size:/)
  // 시안의 둥근 callout: 1px 선, 14px 반경. 글자 크기는 두지 않아 본문 크기를 물려받는다
  const box = css.match(/aside\.cause\s*\{([^}]+)\}/)?.[1]
  assert.doesNotMatch(box, /font-size:/)
  assert.match(box, /border: 1px solid var\(--line\);[^}]*border-radius: var\(--r-box\);/)
  assert.match(css, /aside\.cause \.k\s*\{[^}]*color: var\(--accent\);/)
  // 본문은 슬롯을 문자열로 받아 첫머리 고지를 원인 한 줄 아래로 옮긴다
  assert.match(layout, /Astro\.slots\.render\('default'\)/)
  assert.match(layout, /<div class="prose">/)
})

test('lists carry no cover thumbnails; only the home lead card and wide article heads show 3:2 covers', () => {
  // 목록 줄에는 표지가 없다. 홈은 큰 카드 한 장만 등록된 표지 파일(CoverImage)을 쓴다
  assert.doesNotMatch(home, /<PostCover|<img|resolvePostCover/)
  assert.equal([...home.matchAll(/<CoverImage/g)].length, 1)
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
