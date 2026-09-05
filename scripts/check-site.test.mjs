import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { checkSite } from './check-site.mjs'

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'blog-site-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  for (const [name, content] of Object.entries(files)) {
    const file = join(root, name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
  }
  return root
}
const site = 'https://example.test/'

test('internal routes, relative assets, Korean paths and external URLs', (t) => {
  const root = fixture(t, {
    'index.html':
      '<a href="/글/?q=a&amp;b=b#heading">글</a><a href="https://external.test/no">외부</a>',
    '글/index.html': '<img src="../image.png"><a href="mailto:hello@example.test">메일</a>',
    'image.png': '',
  })
  assert.deepEqual(checkSite(root, site).errors, [])
})
test('missing page and asset are failures', (t) => {
  const root = fixture(t, { 'index.html': '<a href="/gone/">gone</a><img src="/gone.png">' })
  assert.equal(checkSite(root, site).errors.length, 2)
})
test('directory without index is not a page', (t) => {
  const root = fixture(t, { 'index.html': '<a href="/files/">files</a>', 'files/a.txt': '' })
  assert.equal(checkSite(root, site).errors.length, 1)
})
test('404 canonical exception does not hide broken navigation', (t) => {
  const root = fixture(t, {
    '404.html': '<link rel="canonical" href="/404/"><a href="/gone/">gone</a>',
  })
  assert.equal(checkSite(root, site).errors.length, 1)
})
test('invalid escaping is reported instead of crashing', (t) => {
  const root = fixture(t, { 'index.html': '<a href="/%invalid/">bad</a>' })
  assert.equal(checkSite(root, site).errors.length, 1)
})
