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
  assert.match(data.cause, /빈 값의 표현 차이를 변경으로 판단하는 비교 오류/)
  assert.match(data.cause, /MDM 수신 데이터의 구분값 및 처리 대상 선택 기준 문제/)
  assert.match(body, /송신 측 데이터 규격에 맞게 NULL·빈 문자열 비교 로직을 수정/)
  assert.match(body, /SAP 담당자에게 어떤 행을 처리해야 하는지와 이를 구분하는 기준을 확인/)
  assert.match(body, /실제로 내려오는 플래그 값이 코드에 하드코딩된 기존 값과 다르다는 것을 확인/)
  assert.match(body, /SAP 측 데이터와 업무 시스템 측 처리에 각각 필요한 수정을 반영/)
  assert.match(body, /당시 운영 SQL이나 수정 전후의 코드를 재현한 것은 아니다/)
  assert.match(body, /동기화가 필요하지 않은데도 반복되던 결재를 없앴다/)
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
  assert.match(body, /외부 서비스와 연동해 대체하기로 했고, 그 구현을 맡았다/)
  assert.match(body, /계약 작성만 외부 서비스의 API를 활용/)
  assert.doesNotMatch(body, /기존 계약 시스템의 API|기존 계약 시스템 API/)
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
test('numeric incident reflects the author-confirmed fix without invented claims about unperformed checks', () => {
  const body = read('src/content/posts/integer-overflow-negative-amount.md')
  const related = read('src/content/posts/retire-flash-module-by-integration.md')
  const data = yaml.load(body.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.match(data.description, /DB 값과 VO 값을 대조하고 int 필드를 long으로 넓혀 해결/)
  assert.match(data.cause, /long으로 변경한 뒤 정상값이 표시되는 것을 확인/)
  assert.match(body, /VO의 금액 필드를 `int`에서 `long`으로 변경한 뒤 정상값이 표시되는 것을 확인/)
  assert.match(related, /VO의 금액 필드를 int에서 long으로 변경해 정상화한 과정/)
  for (const text of [body, related]) {
    assert.doesNotMatch(
      text,
      /미확정|특정하지 못한 변환|정확한 발생 지점은 확정하지|정확한 변환·연산 지점까지 특정하지는 못했다|그때 갈라 보지 않았다|재현 테스트로 확정할 수 있는 문제지만 아직 하지 않았다/,
    )
  }
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
