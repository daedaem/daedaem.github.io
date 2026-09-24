import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import yaml from 'js-yaml'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('a withdrawn article is not shipped as a public source or linked from reader pages', () => {
  const slug = 'staged-auth-and-password-migration'
  assert.equal(existsSync(new URL(`../src/content/posts/${slug}.md`, import.meta.url)), false)
  for (const file of ['src/pages/about.astro', 'src/content/wiki/session-and-cookie.md'])
    assert.ok(!read(file).includes(`/posts/${slug}/`))
  assert.match(read('.gitignore'), /src\/content\/_drafts/)
})
test('the synchronization account preserves confirmed causes without inventing a repair from example code', () => {
  const body = read('src/content/posts/null-and-empty-string-sync-failure.md')
  const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.match(data.cause, /NULL·빈 문자열 비교 오류/)
  assert.match(data.cause, /처리 구분값의 규약 불일치/)
  assert.match(body, /송신 측 데이터 규격에 맞게 NULL·빈 문자열 비교 로직을 수정/)
  assert.match(body, /송수신 데이터 형식을 협의해 맞추고, 인터페이스·프로시저의 반영 로직을 수정/)
  assert.match(body, /당시 운영 SQL이나 수정 전후의 코드를 재현한 것은 아니다/)
  assert.match(body, /이 오류로 월 34건 반복되던 불필요한 결재를 없앴다/)
  assert.match(body, /정정\(2026-09-14\)/)
  assert.doesNotMatch(
    body,
    /소유권|대표값|비교 지점|SQL 쪽 비교를 걷어|한 메서드|Objects\.equals|NullPointerException/,
  )
  for (const path of ['src/pages/about.astro', 'src/utils/home-content.mjs']) {
    assert.doesNotMatch(read(path), /소유권|대표값|판정을 한곳|NULL과 실제 값|SQL이 NULL/)
  }
})
test('contract integration distinguishes the reused API from authored business logic and team decisions', () => {
  const body = read('src/content/posts/retire-flash-module-by-integration.md')
  assert.match(body, /회의에서[\s\S]*방안이 제안됐고, 그 방안의 구현을 맡았다/)
  assert.match(body, /기존 계약 시스템의 API를 활용/)
  assert.match(body, /전후 업무 로직을 새로 개발/)
  assert.match(body, /적재에 실패한 건은 초기 상태로 되돌리도록 설계/)
  assert.match(body, /계약 작성 버튼은 기존 결재 상태에 연동/)
  assert.match(body, /API가 제공하지 않는 값/)
  assert.doesNotMatch(
    body,
    /API 방식으로 고도화될 예정|고도화를 기다리면|소유권|1분 주기|갱신 순번|석 달|상태를 하나 다시 추가|API 자체를 새로 개발했다\./,
  )
})
test('address work retains observed evidence and contribution without claiming a confirmed heap cause', () => {
  const body = read('src/content/posts/address-search-9s-to-100ms.md')
  assert.match(body, /메모리 분석 도구도 사용했지만/)
  assert.match(body, /원인이라고 확정한 것은 아니었다/)
  assert.match(body, /전체 조회 경로를 막았다/)
  assert.match(body, /9초에서 1초대까지는 자체 DB 조회/)
  assert.match(body, /100밀리초대는 팝업으로 전환한 뒤/)
  assert.match(body, /연동해 수기 적재를 없앤 것도 이 작업의 성과/)
  assert.doesNotMatch(body, /절반은 남의 성과|힙 덤프로.*확정|OOM 재발 차단/)
})
test('numeric incident summaries distinguish a successful fix from an unverified conversion point', () => {
  const body = read('src/content/posts/integer-overflow-negative-amount.md')
  const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.match(data.description, /특정하지 못한 변환·연산 지점/)
  assert.match(
    read('src/content/posts/retire-flash-module-by-integration.md'),
    /정확한 변환·연산 지점까지 특정하지는 못했다/,
  )
})
test('public content dates are valid and revisions do not predate creation', () => {
  for (const collection of ['posts', 'wiki', 'notes']) {
    for (const file of readdirSync(
      new URL(`../src/content/${collection}/`, import.meta.url),
    ).filter((f) => /\.mdx?$/.test(f))) {
      const body = read(`src/content/${collection}/${file}`)
      const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
      const first = new Date(data.date ?? data.created)
      assert.ok(Number.isFinite(first.valueOf()), file)
      if (data.updated) assert.ok(new Date(data.updated) >= first, file)
    }
  }
})
test('project evidence text uses readable body size and repository links have 44px targets', () => {
  const page = read('src/pages/projects.astro')
  // 본문 크기(전역 body 18px)를 그대로 쓴다. 작은 글자로 줄이지 않는다
  assert.match(page, /<div class="prose">/)
  for (const selector of ['what', 'team-lead', 'team-desc', 'meta dd']) {
    const css = page.split(`.${selector} {`)[1]?.split('}')[0]
    assert.ok(css, `${selector} 규칙이 있어야 한다`)
    assert.doesNotMatch(css, /font-size:/)
  }
  assert.match(page.split('.repo {')[1]?.split('}')[0], /min-height: var\(--control-size\)/)
})
