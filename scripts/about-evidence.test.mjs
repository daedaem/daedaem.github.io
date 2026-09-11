import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const about = read('src/pages/about.astro')
const highlights = about.match(/<ul class="work-highlights"[^>]*>([\s\S]*?)<\/ul>/)?.[1]
const rest = about.match(/<ul class="work">([\s\S]*?)<\/ul>/)?.[1]
const links = (html) => [...html.matchAll(/href="\/posts\/([^/]+)\/"/g)].map((m) => m[1])

test('home keeps factual identity and replaces duplicate topic keywords with a short context', () => {
  const home = read('src/pages/index.astro')
  assert.match(home, /<h1>\{SITE\.identityTitle\}<\/h1>/)
  assert.match(home, /<p class="identity-context">\{SITE\.motto\}<\/p>/)
  assert.doesNotMatch(home, /백엔드 · 레거시 시스템 · 문제 해결|남긴 기록입니다/)
})

test('about emphasizes three supported cases and retains four other unique public links', () => {
  assert.ok(highlights)
  assert.ok(rest)
  assert.deepEqual(links(highlights), [
    'null-and-empty-string-sync-failure',
    'address-search-9s-to-100ms',
    'retire-flash-module-by-integration',
  ])
  assert.equal(links(rest).length, 4)
  const all = [...links(highlights), ...links(rest)]
  assert.equal(new Set(all).size, 7)
  for (const id of all) assert.match(read(`src/content/posts/${id}.md`), /draft: false/)
  assert.equal((highlights.match(/<h3>/g) ?? []).length, 3)
  assert.equal((highlights.match(/<p>/g) ?? []).length, 3)
  for (const link of highlights.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/g))
    assert.doesNotMatch(link[1], /<p>/)
})

test('about summaries retain the external dependency limit and do not claim an API speedup', () => {
  assert.match(highlights, /9초에서 1초대로/)
  assert.match(highlights, /외부 서비스 의존은 남았습니다/)
  assert.doesNotMatch(highlights.replace(/<[^>]*>/g, ''), /100밀리|100ms|폴백|무중단/)
  const lead = about.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1]
  assert.doesNotMatch(lead, /화면의 요청|서버와 DB/)
  assert.match(about, /화면의 요청이 서버와 DB를 거쳐/)
})
