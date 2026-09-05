import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
const luminance = (hex) =>
  hex
    .match(/[0-9a-f]{2}/gi)
    .map((c) => parseInt(c, 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)

test('small metadata retains 4.5:1 contrast on actual light and dark surfaces', () => {
  const palettes = [...css.matchAll(/[^{}]*\{([^{}]*--text-muted:\s*#[^{}]*)\}/g)]
  assert.equal(palettes.length, 3, 'light, system-dark and explicit-dark palettes')
  for (const [, block] of palettes) {
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]),
    )
    for (const foreground of ['text-muted', 'text-dim'])
      for (const background of ['bg', 'bg-subtle', 'bg-card']) {
        const values = [
          luminance(tokens[foreground].slice(1)),
          luminance(tokens[background].slice(1)),
        ].sort((a, b) => b - a)
        const contrast = (values[0] + 0.05) / (values[1] + 0.05)
        assert.ok(
          contrast >= 4.5,
          `${foreground} ${tokens[foreground]} on ${background} ${tokens[background]}: ${contrast}`,
        )
      }
  }
})
