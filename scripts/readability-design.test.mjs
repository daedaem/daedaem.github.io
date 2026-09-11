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
  assert.equal(light['text-secondary'], '#384452')
  assert.equal(light.accent, '#294970')
  assert.equal(light['mark-bg'], '#223e60')
  assert.equal(light['mark-ink'], '#fcfaf5')
  assert.equal(systemDark.bg, '#161c24')
  assert.equal(systemDark.text, '#eff3f8')
  assert.deepEqual(systemDark, selectedDark)
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

test('home and list summaries keep body-size text instead of mobile-only shrinking', () => {
  assert.match(css, /--type-body:\s*1rem;/)
  assert.match(
    home,
    /\.reading-note\s*\{[^}]*font-size:\s*var\(--type-body\);[^}]*line-height:\s*1\.8;[^}]*color:\s*var\(--text-secondary\);/,
  )
  for (const match of home.matchAll(/\.lead-card \.reading-note\s*\{([^}]+)\}/g)) {
    assert.doesNotMatch(match[1], /font-size:|line-height:|color:/)
  }
  for (const selector of ['\\.notebook-description', '\\.wiki-list h3']) {
    assert.match(home, new RegExp(`${selector}\\s*\\{[^}]*font-size:\\s*var\\(--type-body\\);`))
  }
  assert.match(
    source('src/components/PostRow.astro'),
    /\.desc\s*\{[^}]*font-size:\s*var\(--type-body\);[^}]*line-height:\s*1\.75;[^}]*color:\s*var\(--text-secondary\);/,
  )
})

test('article cause stays body-size and medium-weight on mobile without rewriting its text', () => {
  assert.match(
    layout,
    /\.cause\s*\{[^}]*font-size:\s*var\(--type-body\);[^}]*font-weight:\s*500;[^}]*color:\s*var\(--text\);/,
  )
  const mobile = layout.split('@media (max-width: 640px)')[1]
  const cause = mobile.match(/\.cause\s*\{([^}]+)\}/)?.[1]
  assert.ok(cause)
  assert.doesNotMatch(cause, /font-size:|font-weight:|color:/)
  assert.match(layout, /<span class="cause-label">원인 한 줄<\/span>\s*\{cause\}/)
  assert.match(layout, /<slot\s*\/>/)
})

test('only mobile home covers are capped, with matching sizes and the full 3:2 artwork', () => {
  const [desktop, mobile] = home.split('@media (max-width: 640px)')
  assert.doesNotMatch(desktop, /width:\s*min\(100%, 18rem\)/)
  assert.match(mobile, /\.card-cover\s*\{\s*width:\s*min\(100%, 18rem\);\s*\}/)
  assert.match(mobile, /\.lead-card \.card-cover\s*\{[^}]*order:\s*-1;/)
  assert.match(css, /@media \(max-width: 640px\)\s*\{\s*\.wrap-wide\s*\{\s*padding-inline:\s*20px;/)
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
