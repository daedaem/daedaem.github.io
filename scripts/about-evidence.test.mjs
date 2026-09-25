import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const about = read('src/pages/about.astro')
const aboutText = about.replace(/\s+/g, ' ')
const highlights = about.match(/<ul class="work-highlights"[^>]*>([\s\S]*?)<\/ul>/)?.[1]
const rest = about.match(/<ul class="work">([\s\S]*?)<\/ul>/)?.[1]
const links = (html) => [...html.matchAll(/href="\/posts\/([^/]+)\/"/g)].map((m) => m[1])
// 대표 사례의 문장은 src/data/cases.ts 한 곳에 있다. 배열 리터럴만 떼어 읽는다
const casesSource = read('src/data/cases.ts')
const CASES = [
  ...runInNewContext(
    `(${casesSource.slice(casesSource.indexOf('= [') + 2, casesSource.lastIndexOf(']') + 1)})`,
  ),
]
const caseText = CASES.map((c) => `${c.title} ${c.judgement} ${c.outcome}`).join(' ')

test('home keeps factual identity: role label, motto headline and the one intro sentence', () => {
  const home = read('src/pages/index.astro')
  // 첫 화면(시안): 작은 줄 '조해성 · 백엔드 개발자' → h1 좌우명 → 소개 문장 → 주력 기술 한 줄.
  // 낱말은 consts의 SITE 한 곳에서 온다(이름·직무·좌우명·소개·환경)
  assert.match(home, /<p class="role">\{SITE\.author\} · \{SITE\.role\}<\/p>/)
  assert.match(home, /<h1 id="hero-title">[\s\S]*?motto\.before[\s\S]*?class="grad"[\s\S]*?<\/h1>/)
  assert.match(home, /SITE\.motto\.indexOf\(SITE\.mottoAccent\)/)
  assert.match(home, /<p class="env">\{SITE\.environment\}<\/p>/)
  assert.match(home, /<p class="lede">\{SITE\.intro\}<\/p>/)
  assert.ok(home.indexOf('{SITE.intro}') < home.indexOf('{SITE.environment}'))
  assert.doesNotMatch(home, /백엔드 · 레거시 시스템 · 문제 해결|남긴 기록입니다/)
  // 추천 카드의 결과 줄은 cases.ts의 outcomePlain(한다체). 원인 한 줄(frontmatter, 한다체)과 말투를 맞춘다
  assert.match(home, /outcome: CASES\.find\(\(c\) => c\.id === post\.id\)\?\.outcomePlain/)
  // 연락은 소개의 연락 절로 모은다. 홈에 메일 주소를 직접 드러내지 않는다
  assert.match(home, /href="\/about\/#contact"/)
  assert.doesNotMatch(home, /mailto:/)
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
  // 소개는 cases.ts를 그대로 그린다: h3 > a[href=/posts/{id}/] → dl.case-summary(판단 / 변경·결과)
  assert.match(highlights, /CASES\.map\(\(c\) => \(/)
  assert.match(highlights, /<h3>\s*<a href=\{`\/posts\/\$\{c\.id\}\/`\}>\{c\.title\}<\/a>\s*<\/h3>/)
  assert.match(highlights, /<dl class="case-summary">/)
  assert.match(highlights, /<dt>판단<\/dt>\s*<dd>\{c\.judgement\}<\/dd>/)
  assert.match(highlights, /<dt>변경·결과<\/dt>\s*<dd>\{c\.outcome\}<\/dd>/)
  assert.deepEqual(
    CASES.map((c) => c.id),
    [
      'null-and-empty-string-sync-failure',
      'address-search-9s-to-100ms',
      'retire-flash-module-by-integration',
    ],
  )
  for (const c of CASES) {
    for (const key of ['title', 'judgement', 'outcome', 'outcomePlain'])
      assert.ok(typeof c[key] === 'string' && c[key].trim().length > 0, `${c.id}.${key}`)
    // 한다체 문장은 어미만 다르고 사실·수치는 합니다체와 같다
    const strip = (t) =>
      t.replace(/(습니다|했습니다|었습니다|았습니다|다)\./g, '.').replace(/\s+/g, ' ')
    const plain = c.outcomePlain.replace(/(없앴|남았|대체했|줄였|맞췄|했)다\./g, '$1.')
    const polite = c.outcome.replace(/(없앴|남았|대체했|줄였|맞췄|했)습니다\./g, '$1.')
    assert.equal(strip(plain), strip(polite), `${c.id}.outcomePlain`)
    assert.doesNotMatch(c.outcomePlain, /습니다/)
  }
  assert.equal(links(rest).length, 3)
  const all = [...CASES.map((c) => c.id), ...links(rest)]
  assert.equal(new Set(all).size, 6)
  for (const id of all) assert.match(read(`src/content/posts/${id}.md`), /draft: false/)
  assert.doesNotMatch(casesSource, /<[a-z]+>/)
})

test('about identifies the author and shows evidence before general work philosophy', () => {
  assert.match(about, /<h1>\{SITE.author\}<\/h1>/)
  assert.match(about, /<span>\{SITE\.role\}<\/span>/)
  assert.match(about, /<dl class="at-a-glance">/)
  // 머리 요약: 환경(consts) · 업무 · 학력 · 자격. 학력·자격은 배경 절이 아니라 머리에 있다
  const glance = about.match(/<dl class="at-a-glance">([\s\S]*?)<\/dl>/)?.[1]
  assert.ok(glance)
  assert.match(glance, /<dt>환경<\/dt><dd>\{SITE\.environment\}<\/dd>/)
  assert.deepEqual(
    [...glance.matchAll(/<dt>([^<]+)<\/dt>/g)].map((m) => m[1]),
    ['환경', '업무', '학력', '자격'],
  )
  assert.match(glance, /서울대학교 대학원 운동생화학 석사 · 부산대학교 체육교육 학사/)
  assert.match(glance, /정보처리기사 · SQLD · ADsP/)
  assert.equal((about.match(/<dt>학력<\/dt>/g) ?? []).length, 1)
  assert.ok(about.indexOf('class="work-highlights"') < about.indexOf('id="approach"'))
  assert.match(about, /AI로 생성한 개념 일러스트/)
  // 구조화 데이터는 ProfilePage(BaseHead의 profile 분기)
  assert.match(about, /<BaseLayout\s+title="소개"\s+type="profile"/)
  const head = read('src/components/BaseHead.astro')
  assert.match(head, /'@type': 'ProfilePage'/)
  assert.match(head, /mainEntity: \{ \.\.\.person, email: SITE\.email, description \}/)
  assert.match(head, /jobTitle: \[SITE\.role, 'Software Engineer'\]/)
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
  assert.match(caseText, /9초에서 1초대로/)
  assert.match(caseText, /외부 서비스 의존은 남았습니다/)
  assert.doesNotMatch(caseText, /100밀리|100ms|폴백|무중단/)
  const lead = about.match(/<p class="lead">([\s\S]*?)<\/p>/)?.[1]
  assert.doesNotMatch(lead, /화면의 요청|서버와 DB/)
})

test('author background uses the stated research motivation without implying AI work or employment', () => {
  assert.match(aboutText, /운동이 정신건강에 이로운 이유를 기전으로 설명하고 싶어/)
  // 전환 계기 문단이 보호할 사실 세 가지.
  const interest = aboutText.match(/<h3 id="interest">([\s\S]*?)<\/li>/)?.[1]
  // 1. 발굴 기간을 줄인 것은 본인이 아니라 연구실의 다른 사람이다. 주체를 지우지 않는다
  assert.match(interest, /(선배|동료)가[\s\S]*(줄이는|단축하는) 것을 (봤|보았)/)
  assert.doesNotMatch(interest, /제가[\s\S]*(줄였|단축했)/)
  // 2. 본인이 직접 다룬 범위는 제한적이었다는 단서를 남긴다
  assert.match(interest, /Python[\s\S]*(잠깐|간단히|조금)/)
  assert.doesNotMatch(interest, /IBM Watson[^.]*체험했습니다/)
  // 3. 바이오인포매틱스를 배웠거나 연구한 것처럼 쓰지 않는다
  assert.doesNotMatch(interest, /바이오인포매틱스를 (배웠|연구|공부했)/)
  // 4. 그때 느낀 것은 흥미까지다. 진로를 정한 시점은 뒤의 교육 문단이 말한다
  assert.doesNotMatch(interest, /(익히기로|배우기로|진로를 정했|결심)/)
  // 5. 흥미가 생긴 순간 진로를 바꾼 것처럼 쓰지 않는다. 공백 기간을 따로 설명하는 문장은
  //    어색하다는 사용자 판단에 따라 넣지 않는다
  assert.match(interest, /(바로|그때)[^.]*(아닙니다|않았습니다)/)
  assert.doesNotMatch(interest, /시간이 지난 뒤/)
  // 교육 문단이 보호할 사실: SSAFY가 첫 프로그래밍 학습, SCSA는 채용연계형 교육 과정, 삼성전자 입사 사실 없음.
  // 정확한 문구는 고정하지 않는다. 문장 사이의 모순은 편집 검토로 본다.
  const training = aboutText.match(/<h3 id="training">([\s\S]*?)<\/li>/)?.[1]
  assert.match(training, /SSAFY[\s\S]*프로그래밍[\s\S]*처음/)
  assert.match(training, /SSAFY[\s\S]*팀 프로젝트[\s\S]*화면 구현과 API 연동/)
  assert.match(training, /채용연계형[\s\S]*SCSA[\s\S]*6개월/)
  assert.match(training, /최종 입사(하지는 못했|는 불발|로 이어지지)/)
  assert.match(training, /href="\/notes\/scsa\/"/)
  // 삼성전자 공채 합격이나 근무 경력처럼 읽히는 표현은 금지한다
  assert.doesNotMatch(
    training,
    /공채 전형에 합격|합격해|삼성전자에서 근무|삼성전자 입사|신입사원으로/,
  )
  assert.doesNotMatch(about, /늦게 시작한 만큼|남들이 그냥 지나가는|최종 SW 역량테스트는 넘지/)
  assert.match(about, /개발 환경의 WAS 전환 중 잔존 배치 프로세스/)
  assert.doesNotMatch(about, /JEUS|WebtoB|WebLogic|AIX|HP-UX|Windows Server/)
})

test('case summaries expose supported implementation and collaboration without inventing outcomes', () => {
  const summary = caseText
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
  // 숫자·문장은 각 글 본문이 출처다. 새 사실을 더하지 않는다(D6)
  assert.match(casesSource, /숫자·문장은 각 글 본문이 출처/)
})

test('address summary distinguishes the choice from measured DB results and later popup integration', () => {
  const address = CASES.find((c) => c.id === 'address-search-9s-to-100ms')
  assert.ok(address)
  assert.match(address.judgement, /주소 갱신 문제가 남아, 외부 주소 검색을 선택/)
  assert.doesNotMatch(address.judgement, /9초|1초대/)
  assert.match(address.outcome, /DB 조회를 9초에서 1초대로 줄인 뒤/)
  assert.match(address.outcome, /외부 검색 팝업과 콜백을 연동해 수기 적재를 없앴습니다/)
  assert.match(address.outcome, /외부 서비스 의존은 남았습니다/)
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
  // 카드 문법(시안): 기간 라벨(.k) → h3. 카드는 12px 반경 1px 선이고 배지·기술 칩은 없다
  assert.match(projects, /<p class="k">\{p\.period\}<\/p>\s*<h3>\{p\.name\}<\/h3>/)
  assert.match(
    projects,
    /<p class="k">\s*\{t\.period\}\s*\{t\.lead && ' · 팀장'\}\s*<\/p>\s*<h3>\{t\.name\}<\/h3>/,
  )
  assert.match(projects, /<dt>기술<\/dt>\s*<dd>\{p\.stack\.join\(', '\)\}<\/dd>/)
  assert.doesNotMatch(projects, /class="badge"|class="stack"|class="period"|\.featured \{/)
  assert.match(
    projects,
    /\.project,\s*\.team-project \{[^}]*border: 1px solid var\(--line\);[^}]*border-radius: var\(--r-card\);/,
  )
})
