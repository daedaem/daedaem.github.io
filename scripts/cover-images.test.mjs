import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { load } from 'js-yaml'
import assets from '../src/data/post-cover-images.json' with { type: 'json' }
import { getCoverImageAttributes } from '../src/utils/cover-images.mjs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('ordinary uploads do not get invented responsive image URLs', () => {
  for (const src of ['/uploads/my-cover.webp', '/uploads/표지.png', 'toString', '__proto__']) {
    assert.deepEqual(getCoverImageAttributes(src), { width: 1480, height: 1000 })
  }
})

test('generated article covers retain their own subject, three local sizes and bounded weight', () => {
  assert.equal(Object.keys(assets).length, 7)
  const fullHashes = new Set()
  for (const [src, asset] of Object.entries(assets)) {
    assert.match(src, /^\/uploads\/post-covers\/[a-z0-9-]+-v[1-9]\d*\.webp$/)
    const slug = src
      .split('/')
      .at(-1)
      .replace(/-v[1-9]\d*\.webp$/, '')
    const post = load(source(`src/content/posts/${slug}.md`).match(/^---\n([\s\S]*?)\n---/)[1])
    assert.equal(post.draft, false)
    assert.equal(post.coverImage, src)
    assert.deepEqual(
      asset.variants.map((v) => v.width),
      [320, 768, 1440],
    )
    assert.deepEqual(
      asset.variants.map((v) => v.src),
      [src.replace(/\.webp$/, '-320.webp'), src.replace(/\.webp$/, '-768.webp'), src],
      'all sizes must use the same article and artwork revision',
    )
    assert.equal(asset.width, 1440)
    assert.ok(asset.height >= 900 && asset.height <= 1024)
    assert.equal(asset.variants.at(-1).src, src)
    for (const variant of asset.variants) {
      assert.ok(variant.src.startsWith('/uploads/post-covers/'))
      assert.ok(variant.height > 0)
      assert.ok(Math.abs(variant.width / variant.height - asset.width / asset.height) < 0.01)
      const data = readFileSync(new URL(`../public${variant.src}`, import.meta.url))
      assert.equal(data.toString('ascii', 0, 4), 'RIFF')
      assert.equal(data.toString('ascii', 8, 12), 'WEBP')
      const budget = { 320: 35000, 768: 100000, 1440: 220000 }[variant.width]
      assert.ok(data.length <= budget, `${variant.src}: ${data.length} > ${budget}`)
      if (variant.src === src) fullHashes.add(createHash('sha256').update(data).digest('hex'))
    }
    const card = getCoverImageAttributes(src)
    const thumbnail = getCoverImageAttributes(src, true)
    assert.equal(card.width, asset.width)
    assert.equal(card.height, asset.height)
    assert.equal(card.srcset, asset.variants.map((v) => `${v.src} ${v.width}w`).join(', '))
    assert.equal(card.srcset, thumbnail.srcset)
    assert.equal(thumbnail.sizes, '(max-width: 640px) 88px, 144px')
    assert.match(card.sizes, /500px$/)
  }
  assert.equal(fullHashes.size, 7, 'each article needs its own artwork')
})

test('cover loading preserves a prioritized hero and lazy decorative thumbnails', () => {
  const cover = source('src/components/PostCover.astro')
  assert.match(cover, /getCoverImageAttributes\(src, thumbnail\)/)
  assert.match(cover, /aspect-ratio: \$\{imageAttributes\.width\} \/ \$\{imageAttributes\.height\}/)
  assert.match(cover, /loading=\{lead \? 'eager' : 'lazy'\}/)
  assert.match(cover, /fetchpriority=\{lead \? 'high' : undefined\}/)
  assert.match(cover, /aria-hidden="true"/)
  assert.match(cover, /alt=""/)
  assert.match(source('src/components/PostRow.astro'), /<PostCover[^>]* thumbnail\s*\/>/)
  assert.doesNotMatch(source('src/layouts/PostLayout.astro'), /<PostCover/)
})
