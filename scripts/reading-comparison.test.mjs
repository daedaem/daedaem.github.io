import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('both catalog routes use the same reading rows and real category navigation', () => {
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro']) {
    const text = source(path)
    assert.match(text, /<ReadingCatalog counts=\{counts\}/)
    assert.match(text, /<PostRow[\s\S]*?editorial\s+reading/)
    assert.match(text, /updated=\{p\.data\.updated\}/)
  }
  const nav = source('src/components/ReadingCategories.astro')
  assert.match(nav, /<details[^>]*data-reading-categories open>/)
  assert.match(nav, /categoryDetails\.open = desktop\.matches/)
  assert.match(nav, /counts\.get\(category\.id\) \?\? 0\) > 0/)
  assert.match(nav, /href=\{`\/categories\/\$\{category\.id\}\/`\}/)
  assert.match(nav, /aria-current=/)
})

test('catalog explanations are disclosed, not deleted, and original date meaning is retained', () => {
  const posts = source('src/pages/posts/index.astro')
  assert.match(posts, /실제로 맡아 고친 문제를 남깁니다\./)
  assert.match(posts, /<details class="criteria">/)
  assert.match(posts.replace(/\s+/g, ' '), /작성일은 그 일을 블로그에 글로 정리한 날입니다\./)
  assert.match(posts, /min-height:\s*var\(--control-size\)/)
})

test('reader changes are scoped to cases and preserve full title, cause, content and comments', () => {
  const layout = source('src/layouts/PostLayout.astro')
  assert.match(layout, /\.post\[data-code-theme='dark'\] \.body\s*\{[^}]*font-size:\s*1\.0625rem;/)
  assert.match(layout, /\.post\[data-code-theme='dark'\] \.subtitle\s*\{[^}]*display:\s*inline;/)
  assert.match(layout, /heading\.main \+ heading\.separator/)
  assert.match(layout, /<span class="subtitle">\{heading\.subtitle\}<\/span>/)
  assert.match(layout, /<slot\s*\/>/)
  assert.match(layout, /<Comments\s*\/>/)
  assert.match(layout, /\{cause\}/)
})
