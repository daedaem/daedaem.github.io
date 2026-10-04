import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
const source = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')

test('home alone uses compact text-first cards with an explicitly latest first item', () => {
  assert.match(source('src/pages/index.astro'), /components\/HomeCaseRow\.astro/)
  assert.match(source('src/pages/index.astro'), /featured=\{post\.id === posts\[0\]\?\.id\}/)
  const row = source('src/components/HomeCaseRow.astro')
  assert.match(row, /class="latest">최신 글/)
  assert.match(row, /grid-template-areas: 'title cover' 'detail detail'/)
  assert.doesNotMatch(row, /'title' 'detail' 'cover'/)
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro']) {
    assert.doesNotMatch(source(path), /HomeCaseRow/)
  }
  assert.match(
    source('src/components/CaseRow.astro'),
    /grid-template-areas: 'title' 'cover' 'detail'/,
  )
})

test('mobile navigation keeps its name visible and touch targets intact', () => {
  const header = source('src/components/Header.astro')
  assert.match(header, /grid-template-areas: 'brand brand' 'nav tools'/)
  assert.match(header, /min-height: 44px/)
  assert.doesNotMatch(header, /font-size: 0;/)
})

test('review-only routes and annotations do not ship', () => {
  assert.equal(existsSync(new URL('../src/pages/design-preview', import.meta.url)), false)
  assert.doesNotMatch(source('src/pages/index.astro'), /data-review-mark|review-outline|noindex/)
})
