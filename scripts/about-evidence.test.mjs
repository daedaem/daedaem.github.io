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

test('saved s4 home keeps the factual author identity, approved introduction and authored summaries', () => {
  const home = read('src/pages/index.astro')
  assert.match(home, /\{SITE\.author\} · \{SITE\.role\}/)
  assert.match(home, /href="\/about\/"\s*>소개 보기/)
  assert.match(home, /<h1 id="home-title">\{SITE\.title\}<\/h1>/)
  assert.match(home, /<p>\{SITE\.intro\}<\/p>/)
  assert.doesNotMatch(home, /레거시 시스템을 개발·운영합니다/)
  assert.match(home, /description=\{post\.data\.description\}/)
  assert.match(home, /title=\{post\.data\.title\}/)
  assert.doesNotMatch(home, /outcome=|causeSummary|성과|이력서/)
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
  // 첫 화면은 하는 일과 사례로 연결하고, 기술·학력·자격은 본문에서 설명한다.
  const profile = about.match(/<header class="profile">([\s\S]*?)<\/header>/)?.[1]
  assert.ok(profile)
  assert.match(
    profile.replace(/\s+/g, ' '),
    /사내 업무시스템의 기능과 시스템 간 연동을 개발·운영합니다\. 레거시 환경에서 반복되는 데이터 오류와 느린 조회의 원인을 추적해 개선합니다\./,
  )
  assert.doesNotMatch(profile, /<dt>(?:환경|학력|자격)<\/dt>|SITE\.environment|MyBatis/)
  const stack = about.split('id="stack"')[1].split('</section>')[0].replace(/\s+/g, ' ')
  assert.match(stack, /Java·Spring과 Oracle SQL·PL\/SQL을 주로 사용/)
  assert.match(stack, /C#\/\.NET·MSSQL 기반의 업무시스템도 함께 개발·운영/)
  assert.doesNotMatch(stack, /<dl|MyBatis|JSP|jQuery|IIS/)
  assert.match(
    read('src/content/posts/integer-overflow-negative-amount.md'),
    /MyBatis 조회 결과를 받는 VO/,
  )
  const background = about.split('id="background"')[1].split('</section>')[0]
  assert.match(
    background,
    /<dt>학력<\/dt>\s*<dd>서울대학교 대학원 운동생화학 석사 · 부산대학교 체육교육 학사<\/dd>/,
  )
  assert.match(background, /<dt>자격<\/dt>\s*<dd>정보처리기사 · SQLD · ADsP<\/dd>/)
  assert.equal((about.match(/<dt>학력<\/dt>/g) ?? []).length, 1)
  assert.equal((about.match(/<dt>자격<\/dt>/g) ?? []).length, 1)
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
  // 석사 연구는 기전을 '설명'했다고 쓰지 않고 '탐구'했다고 쓴다(사용자 판단 2026-09-29)
  assert.match(aboutText, /운동이 정신건강에 이로운 이유를 기전 수준에서 탐구하고 싶어/)
  assert.doesNotMatch(aboutText, /기전으로 설명하고 싶어/)
  // 실험 종류(세포·동물·사람)는 무섭게 읽힐 수 있어 쓰지 않는다
  assert.doesNotMatch(aboutText, /동물 실험|사람 실험|세포·동물·사람/)
  // 전환 계기 문단이 보호할 사실. 문장은 "연구실에서 본 일 → IT 기술에 처음 흥미"로만 짧게 쓴다는
  // 사용자 판단(2026-09-29)에 따라, 선배를 주어로 세우는 말투와 Python·진로 단서 문장은 요구하지 않는다.
  // 소제목을 '체육교육에서 운동생화학으로 → 운동생화학에서 프로그래밍으로 → 그리고 지금' 세 단계로 줄이면서(2026-09-29)
  // IT 흥미 문단은 프로그래밍 단계(#training) 첫 문단에 들어갔다
  const training = aboutText.match(/<h3 id="training">([\s\S]*?)<\/li>/)?.[1]
  const interest = training.split('</p>')[0]
  // 1. 발굴 기간을 줄인 것은 본인이 아니다. 본인을 주어로 쓰거나 직접 다룬 것처럼 쓰지 않는다
  // 2026-09-29: 도구 이름(IBM Watson)은 빼고 '소프트웨어로 몇 주 만에'라는 사실만 남긴다
  assert.match(interest, /소프트웨어로 몇 주 만에/)
  assert.doesNotMatch(interest, /제가[\s\S]*(줄였|단축했)/)
  assert.doesNotMatch(interest, /IBM Watson[^.]*(체험했|사용했|활용했|다뤘)/)
  // 2. 바이오인포매틱스를 배웠거나 연구한 것처럼 쓰지 않는다
  assert.doesNotMatch(interest, /바이오인포매틱스를 (배웠|연구|공부했)/)
  // 3. 그때 생긴 것은 흥미까지다. 진로를 정한 시점은 뒤의 교육 문단이 말한다
  assert.match(
    interest,
    /IT 기술의\s+힘을 처음 느꼈고, 처음에는 그 힘을 활용하는 쪽을 생각했습니다/,
  )
  assert.doesNotMatch(interest, /(익히기로|배우기로|진로를 정했|결심)/)
  assert.doesNotMatch(interest, /시간이 지난 뒤/)
  // 교육 문단이 보호할 사실: SSAFY가 첫 프로그래밍 학습, 팀 프로젝트 역할은 프로젝트 페이지 기록과 같게,
  // SCSA는 채용연계형 교육 과정, 삼성전자 입사 사실 없음.
  // 정확한 문구는 고정하지 않는다. 문장 사이의 모순은 편집 검토로 본다.
  assert.match(training, /SSAFY[\s\S]*프로그래밍[\s\S]*처음/)
  // 2026-09-29: 역할 설명은 프로젝트 페이지에 맡기고 소개는 링크만 둔다
  assert.match(training, /활용하는 것과\s+만들 수 있는 것은 다르다는 걸 알았습니다/)
  assert.match(training, /깨달을수록\s+흥미도 커졌고/)
  assert.match(training, /href="\/projects\/#team-projects">팀 프로젝트<\/a>/)
  assert.doesNotMatch(training, /팀장|스마트 컨트랙트|블록체인/)
  assert.match(training, /채용연계형[\s\S]*SCSA[\s\S]*6개월/)
  // 입사하지 못한 사실은 회고 글에 맡기되, 다음 문단이 '다른 회사에 입사'로 이어져 삼성전자 입사로 읽히지 않게 한다
  const now = aboutText.match(/<h3 id="now">([\s\S]*?)<\/li>/)?.[1]
  assert.match(now, /지금 회사에서 여러 업무 도메인의 레거시 시스템을 개발하고 운영합니다\./)
  // 관심사 두 가지: 원인까지 따라가 고치기(글이 기록), AI 이후 개발자의 일. 주인이 직접 말한 것만 쓴다
  assert.match(now, /AI가 들어온 뒤 개발자의 일이 어디로 옮겨/)
  assert.match(now, /AI와 함께 만들고/)
  // 자료에서 추론한 '꿈'이나 근거 없는 성향 문장은 쓰지 않는다
  assert.doesNotMatch(now, /되고 싶었|잘 맞습니다|잘하는 일/)
  assert.doesNotMatch(now, /SCSA를 마친 뒤/)
  assert.doesNotMatch(now, /삼성/)
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
  assert.match(summary, /동기화가 필요하지 않은데도 반복되던 결재를 없앴습니다/)
  assert.match(summary, /정상적인 결재 절차는 유지했습니다/)
  assert.match(summary, /외부 서비스와 연동해 대체하는 작업의 구현을 맡았습니다/)
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
  for (const id of ['research', 'training', 'now'])
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
  // 편집 지면의 행 문법: 기간 라벨(.k) → h3, 위 1px 선. 상자·채움·칩·배지는 없다
  assert.match(projects, /<p class="k">\{p\.period\}<\/p>\s*<h3>\{p\.name\}<\/h3>/)
  assert.match(
    projects,
    /<p class="k">\s*\{t\.period\}\s*\{t\.lead && ' · 팀장'\}\s*<\/p>\s*<h3>\{t\.name\}<\/h3>/,
  )
  assert.match(projects, /<dt>기술<\/dt>\s*<dd>\{p\.stack\.join\(', '\)\}<\/dd>/)
  assert.doesNotMatch(
    projects,
    /class="badge"|class="stack"|class="period"|\.featured \{|border-radius: var\(--radius\)/,
  )
  assert.match(projects, /\.project,\s*\.team-project \{[^}]*border-top: 1px solid var\(--line\);/)
})
