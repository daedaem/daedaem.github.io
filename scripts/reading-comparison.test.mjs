import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('category enhancement opens desktop, preserves mobile native disclosure and follows resize', () => {
  const nav = source('src/components/ReadingCategories.astro')
  const script = nav.match(/<script is:inline>([\s\S]*?)<\/script>/)[1]
  for (const initialDesktop of [false, true]) {
    class Details {
      open = false
      dataset = {}
    }
    const details = new Details()
    let resize
    const media = {
      matches: initialDesktop,
      addEventListener: (event, fn) => {
        assert.equal(event, 'change')
        resize = fn
      },
    }
    runInNewContext(script, {
      document: { querySelector: () => details },
      HTMLDetailsElement: Details,
      matchMedia: (query) => {
        assert.equal(query, '(min-width: 901px)')
        return media
      },
    })
    assert.equal(details.open, initialDesktop)
    assert.equal(details.dataset.enhanced, 'true')
    details.open = !details.open // native summary interaction
    assert.equal(details.open, !initialDesktop)
    media.matches = !initialDesktop
    resize()
    assert.equal(details.open, !initialDesktop)
  }
})

test('enlarged home illustration is explicit while ordinary reading thumbnails retain established sizes', () => {
  const home = source('src/pages/index.astro')
  assert.match(home, /\.lead-card:not\(\.without-cover\)\s*\{[^}]*50%/)
  assert.match(home, /sizes=\{\s*index === 0/)
  const row = source('src/components/PostRow.astro')
  assert.match(row, /\.reading\.with-cover \.row-content\s*\{[^}]*9rem;/)
  assert.match(
    row,
    /@media \(max-width: 640px\)[\s\S]*\.reading\.with-cover \.row-content\s*\{[^}]*5\.5rem;/,
  )
  assert.match(
    source('src/components/PostCover.astro'),
    /sizes=\{sizes \?\? imageAttributes\?\.sizes\}/,
  )
})

test('both catalog routes use the same reading rows and real category navigation', () => {
  for (const path of ['src/pages/posts/index.astro', 'src/pages/categories/[category].astro']) {
    const text = source(path)
    assert.match(text, /<ReadingCatalog counts=\{counts\}/)
    assert.match(text, /<PostRow[\s\S]*?editorial\s+reading/)
    assert.match(text, /updated=\{p\.data\.updated\}/)
  }
  const nav = source('src/components/ReadingCategories.astro')
  assert.match(nav, /<details[^>]*data-reading-categories>/)
  assert.doesNotMatch(nav, /<details[^>]*\sopen[\s>]/)
  assert.match(nav, /주제 고르기 <strong>현재: \{current\}/)
  assert.match(nav, /categoryDetails\.dataset\.enhanced = 'true'/)
  assert.match(nav, /\.reading-categories\[data-enhanced\] summary\s*\{\s*display: none/)
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
  assert.match(layout, /\.subtitle\s*\{[^}]*display:\s*block;/)
  assert.doesNotMatch(
    layout,
    /\.post\[data-code-theme='dark'\] \.subtitle\s*\{[^}]*display:\s*inline;/,
  )
  assert.match(layout, /heading\.main \+ heading\.separator/)
  assert.match(layout, /<span class="subtitle">\{heading\.subtitle\}<\/span>/)
  assert.match(layout, /<slot\s*\/>/)
  assert.match(layout, /<Comments\s*\/>/)
  assert.match(layout, /\{cause\}/)
})
