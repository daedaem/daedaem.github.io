import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const about = read('src/pages/about.astro')
const aboutText = about.replace(/\s+/g, ' ')
const highlights = about.match(/<ul class="work-highlights"[^>]*>([\s\S]*?)<\/ul>/)?.[1]
const rest = about.match(/<ul class="work">([\s\S]*?)<\/ul>/)?.[1]
const links = (html) => [...html.matchAll(/href="\/posts\/([^/]+)\/"/g)].map((m) => m[1])

test('home keeps factual identity and replaces duplicate topic keywords with a short context', () => {
  const home = read('src/pages/index.astro')
  assert.match(home, /<h1>\{SITE\.identityTitle\}<\/h1>/)
  assert.match(home, /<p class="identity-context">\{SITE\.motto\}<\/p>/)
  assert.doesNotMatch(home, /백엔드 · 레거시 시스템 · 문제 해결|남긴 기록입니다/)
})

test('AI disclosure distinguishes author records from editing help without claiming full verification', () => {
  const source = about.replace(/\s+/g, ' ')
  assert.match(
    source,
    /사례 글은 직접 작성한 업무 기록을 바탕으로, AI의 도움을 받아 재구성하고 문장을 다듬었습니다/,
  )
  assert.match(source, /학습 내용을 정리하는 데에도 AI를 활용합니다/)
  assert.doesNotMatch(source, /모든 (?:글|내용).*검증(?:했습니다|을 마쳤습니다)|오탈자 교정에만 AI/)
  const section = about.split('id="writing"')[1].split('</section>')[0]
  assert.match(section, /AI의 도움/)
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
  assert.match(aboutText, /역량테스트를 통과하지 못해 입사로 이어지지 않았습니다/)
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
})

test('author background uses the stated research motivation without implying AI work or employment', () => {
  assert.match(aboutText, /운동이 정신건강에 이로운 이유를 기전으로 설명하고 싶어/)
  assert.match(aboutText, /IBM Watson AI 플랫폼을 간단히 체험/)
  assert.match(aboutText, /채용연계형 교육 과정인 SCSA에 선발되어 6개월간\s*교육을 받았습니다/)
  assert.match(aboutText, /교육 수료와 SW 역량테스트 통과를 조건으로 입사가 확정되는 과정/)
  assert.match(aboutText, /역량테스트를 통과하지 못해 입사로 이어지지 않았습니다/)
  assert.doesNotMatch(aboutText, /공채 전형에 합격/)
  assert.doesNotMatch(about, /늦게 시작한 만큼|남들이 그냥 지나가는|최종 SW 역량테스트는 넘지/)
  assert.match(about, /개발 환경의 WAS 전환 중 잔존 배치 프로세스/)
  const training = aboutText.match(/<h3 id="training">([\s\S]*?)<\/li>/)?.[1]
  assert.match(training, /SSAFY[\s\S]*팀 프로젝트[\s\S]*화면 구현과 API 연동/)
  assert.doesNotMatch(about, /JEUS|WebtoB|WebLogic|AIX|HP-UX|Windows Server/)
})

test('case summaries expose supported implementation and collaboration without inventing outcomes', () => {
  const summary = highlights.replace(/\s+/g, ' ')
  assert.match(summary, /NULL·빈 문자열 비교 오류/)
  assert.match(summary, /처리 구분값의 규약 불일치/)
  assert.match(summary, /송수신 규약을 맞추고 비교·반영 로직을 수정/)
  assert.match(summary, /해당 오류로 월 34건 반복되던 불필요한 결재를 없앴습니다/)
  assert.match(summary, /회의에서 제안된 기존 계약 시스템 API 활용 방안의 구현/)
  assert.match(summary, /연동 전후 업무 로직을 새로 개발/)
  assert.match(summary, /상태 동기화·적재 실패 복구/)
  assert.match(summary, /Flash 기반 계약 모듈을 대체/)
  assert.doesNotMatch(summary, /소유권|대표값|판정을 한곳|옛 계약 조회/)
  assert.doesNotMatch(summary, /재발 0|100%|단독|총괄|무중단|비용 \d+%/)
})

test('address summary distinguishes the choice from measured DB results and later popup integration', () => {
  const item = highlights.split('<li>')[2]
  const fields = [...item.matchAll(/<dt>([^<]+)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g)]
  const summary = Object.fromEntries(
    fields.map(([, label, value]) => [label, value.replace(/\s+/g, ' ')]),
  )
  assert.match(summary['판단'], /주소 갱신 문제가 남아, 외부 주소 검색을 선택/)
  assert.doesNotMatch(summary['판단'], /9초|1초대/)
  assert.match(summary['변경·결과'], /DB 조회를 9초에서 1초대로 줄인 뒤/)
  assert.match(summary['변경·결과'], /외부 검색 팝업과 콜백을 연동해 수기 적재를 없앴습니다/)
  assert.match(summary['변경·결과'], /외부 서비스 의존은 남았습니다/)
})

test('work approach stays concise and private ongoing company projects remain withheld', () => {
  const approach = aboutText.match(/<h2 id="approach"[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>/)?.[1]
  assert.ok(approach)
  assert.ok(approach.trim().length < 100)
  assert.match(approach, /영향 범위를 확인[\s\S]*고친 뒤에는/)
  assert.doesNotMatch(approach, /교육 과정|팀 프로젝트|API 연동/)
  const stack = aboutText.match(/<h2 id="stack"[^>]*>([\s\S]*?)<\/section>/)?.[1]
  assert.ok(stack)
  assert.doesNotMatch(stack, /신규 구축|Spring Boot|JPA|React/)
})

test('background stages and contact navigation remain readable and keyboard accessible', () => {
  assert.match(about, /href="#background"/)
  for (const id of ['research', 'interest', 'training'])
    assert.match(about, new RegExp(`<h3 id="${id}">`))
  assert.match(about, /href="\/projects\/#team-projects"/)
  assert.match(about, /\.contact a \{[^}]*min-height: var\(--control-size\)/)
  assert.match(about, /\.contact a:focus-visible/)
})

test('project navigation separates ongoing work from education and prioritizes individual contribution', () => {
  const projects = read('src/pages/projects.astro')
  const nav = projects.match(
    /<nav class="project-nav"[^>]*data-pagefind-ignore>([\s\S]*?)<\/nav>/,
  )?.[1]
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
