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

test('related reading and comments are explicitly excluded from search', (t) => {
  const root = fixture(t, {
    'index.html': `<main data-pagefind-body>
      <h1>실제 글 제목</h1><p>본문은 검색에 남는다.</p>
      <section aria-label="다른 글" data-pagefind-ignore>별개의 글 제목</section>
      <aside data-pagefind-ignore="all" aria-label="연결된 문서">연결된 문서 제목</aside>
      <section aria-label="댓글" data-pagefind-ignore>댓글 안내</section>
      <nav aria-label="학습 기록 탐색" data-pagefind-ignore>학습 기록 전체</nav>
    </main>`,
  })
  assert.deepEqual(checkSite(root, site).errors, [])
})

test('missing search exclusions fail the build check', (t) => {
  const root = fixture(t, {
    'index.html': `<section aria-label="다른 글">다른 글 제목</section>
      <aside aria-label="연결된 문서">연결된 문서 제목</aside>
      <section aria-label="댓글" data-pagefind-ignore-disabled>댓글 안내</section>
      <nav aria-label="학습 기록 탐색">학습 기록 전체</nav>`,
  })
  assert.equal(checkSite(root, site).errors.length, 4)
  assert.ok(checkSite(root, site).errors.every((error) => error.includes('excluded from search')))
})
