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
      <section aria-label="이어 읽을 글" data-pagefind-ignore>연관 사례 제목</section>
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
      <nav aria-label="학습 기록 탐색">학습 기록 전체</nav>
      <section aria-label="이어 읽을 글">연관 사례 제목</section>`,
  })
  assert.equal(checkSite(root, site).errors.length, 5)
  assert.ok(checkSite(root, site).errors.every((error) => error.includes('excluded from search')))
})

test('card links name one existing unique title', (t) => {
  const valid = fixture(t, {
    'index.html': '<a aria-labelledby="case-title"><h2 id="case-title">사례 제목</h2></a>',
  })
  assert.deepEqual(checkSite(valid, site).errors, [])
  const invalid = fixture(t, {
    'index.html':
      '<a aria-labelledby="missing">제목</a><a aria-labelledby="duplicate">제목</a><h2 id="duplicate">하나</h2><h2 id="duplicate">둘</h2>',
  })
  assert.equal(checkSite(invalid, site).errors.length, 2)
})

test('algorithm boilerplate, related links, archive banners and TOCs stay out of search', (t) => {
  const blocks = {
    'algorithms/example/index.html':
      '<p class="notice muted">안내</p><section class="related">추천</section>',
    'notes/example/index.html': '<aside class="archived">아카이브 공통 문구</aside>',
    'wiki/example/index.html': '<nav class="toc" aria-label="목차">목차</nav>',
  }
  const broken = fixture(t, blocks)
  assert.equal(checkSite(broken, site).errors.length, 4)
  const fixed = fixture(
    t,
    Object.fromEntries(
      Object.entries(blocks).map(([file, html]) => [
        file,
        html.replace(/<(p|section|aside|nav)\b/g, '<$1 data-pagefind-ignore'),
      ]),
    ),
  )
  assert.deepEqual(checkSite(fixed, site).errors, [])
})
