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

test('about emphasizes three supported cases and links only to currently public cases', () => {
  assert.ok(highlights)
  assert.ok(rest)
  assert.deepEqual(links(highlights), [
    'null-and-empty-string-sync-failure',
    'address-search-9s-to-100ms',
    'retire-flash-module-by-integration',
  ])
  assert.equal(links(rest).length, 3)
  const all = [...links(highlights), ...links(rest)]
  assert.equal(new Set(all).size, 6)
  for (const id of all) assert.match(read(`src/content/posts/${id}.md`), /draft: false/)
  assert.equal((highlights.match(/<h3>/g) ?? []).length, 3)
  assert.equal((highlights.match(/<dl class="case-summary">/g) ?? []).length, 3)
  assert.equal((highlights.match(/<dt>판단<\/dt>/g) ?? []).length, 3)
  assert.equal((highlights.match(/<dt>변경·결과<\/dt>/g) ?? []).length, 3)
  for (const link of highlights.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/g))
    assert.doesNotMatch(link[1], /<(?:p|dl)>/)
})

test('about identifies the author and shows evidence before general work philosophy', () => {
  assert.match(about, /<h1>\{SITE.author\}<\/h1>/)
  assert.match(about, /<span>백엔드 개발자<\/span>/)
  assert.match(about, /<dl class="at-a-glance">/)
  assert.ok(about.indexOf('class="work-highlights"') < about.indexOf('id="approach"'))
  assert.match(about, /최종 SW 역량테스트는 넘지/)
  assert.match(about, /AI로 생성한 개념 일러스트/)
})

test('each about section has its own search destination rather than inheriting the previous anchor', () => {
  const headings = [...about.matchAll(/<h2\b([^>]*)>/g)]
  assert.equal(headings.length, 7)
  const ids = headings.map(([, attrs]) => {
    assert.match(attrs, /tabindex="-1"/)
    return attrs.match(/id="([^"]+)"/)?.[1]
  })
  assert.ok(ids.every(Boolean))
  assert.equal(new Set(ids).size, ids.length)
  assert.match(about, /<h2 id="background" tabindex="-1">어떻게 여기까지 왔는지<\/h2>/)
})

test('about summaries retain the external dependency limit and do not claim an API speedup', () => {
  assert.match(highlights, /9초에서 1초대로/)
  assert.match(highlights, /외부 서비스 의존은 남았습니다/)
  assert.doesNotMatch(highlights.replace(/<[^>]*>/g, ''), /100밀리|100ms|폴백|무중단/)
  const lead = about.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1]
  assert.doesNotMatch(lead, /화면의 요청|서버와 DB/)
  assert.match(about, /화면의 요청이 서버와 DB를 거쳐/)
})

test('project navigation separates ongoing work from education and prioritizes individual contribution', () => {
  const projects = read('src/pages/projects.astro')
  const nav = projects.match(/<nav class="project-nav"[^>]*data-pagefind-ignore>([\s\S]*?)<\/nav>/)?.[1]
  assert.ok(nav)
  for (const id of ['personal-projects', 'team-projects']) {
    assert.ok(nav.includes(`href="#${id}"`))
    assert.ok(projects.includes(`<h2 id="${id}" tabindex="-1">`))
  }
  assert.match(projects, /<h3>\{p.name\}<\/h3>/)
  assert.match(projects, /p.status &&/)
  assert.match(projects, /<dt>내가 맡은 일<\/dt>/)
  assert.ok(projects.indexOf('<dl class="meta">') < projects.indexOf('<figure class="shot">'))
  assert.match(projects, /alt=\{t.image.alt\}/)
  assert.match(projects, /\{t.period.slice\(0, 4\)\}년 당시 화면/)
})
