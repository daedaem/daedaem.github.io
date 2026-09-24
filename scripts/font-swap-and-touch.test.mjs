import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const css = source('src/styles/global.css')

/*
 * Pretendard 서브셋 폰트(head·hhea)에서 직접 읽은 값. 폰트를 올릴 때 함께 확인한다.
 * upm 2048, 한글 advance 1770, ascent 1950, descent 494, lineGap 0.
 */
const UPM = 2048
const HANGUL_ADVANCE = 1770
const ASCENT = 1950
const DESCENT = 494

test('대체 글꼴의 메트릭이 Pretendard에 맞춰져 있어 글꼴 교체가 본문을 밀지 않는다', () => {
  const face = css.match(/@font-face\s*\{[^}]*'Pretendard Fallback'[^}]*\}/)?.[0]
  assert.ok(face, "global.css에 'Pretendard Fallback' @font-face가 있어야 한다")

  const percent = (name) => {
    const m = face.match(new RegExp(`${name}:\\s*([\\d.]+)%`))
    assert.ok(m, `${name}가 필요하다`)
    return Number(m[1])
  }

  // 폭: 시스템 한국어 글꼴의 한글은 1.0em이므로 Pretendard의 advance 비율이 그대로 보정값이다
  const sizeAdjust = percent('size-adjust')
  assert.ok(
    Math.abs(sizeAdjust - (HANGUL_ADVANCE / UPM) * 100) < 0.2,
    `size-adjust ${sizeAdjust}%는 ${((HANGUL_ADVANCE / UPM) * 100).toFixed(1)}% 근처여야 한다`,
  )

  // 상하 메트릭: size-adjust가 나중에 다시 곱해지므로 미리 나눠 둔 값이어야 한다
  const scale = sizeAdjust / 100
  assert.ok(
    Math.abs(percent('ascent-override') * scale - (ASCENT / UPM) * 100) < 0.3,
    'ascent-override에 size-adjust를 곱하면 Pretendard의 ascent가 나와야 한다',
  )
  assert.ok(
    Math.abs(percent('descent-override') * scale - (DESCENT / UPM) * 100) < 0.3,
    'descent-override에 size-adjust를 곱하면 Pretendard의 descent가 나와야 한다',
  )
  assert.match(face, /line-gap-override:\s*0%/)

  // 한글이 없는 글꼴을 넣으면 라틴만 작아지고 한글은 보정 없이 다음 글꼴로 넘어간다
  assert.doesNotMatch(face, /local\('(Arial|Helvetica|DejaVu Sans|sans-serif)'\)/)
  for (const family of ['Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR']) {
    assert.ok(face.includes(`local('${family}')`), `${family}를 대체 후보에 둔다`)
  }

  // 한글 폭에 맞춘 축소가 영문·숫자에 번지지 않도록 한글 face는 한글 범위만 맡는다
  const range = face.match(/unicode-range:\s*([^;]+);/)?.[1]
  assert.ok(range, '한글 face에 unicode-range가 있어야 한다')
  assert.match(range, /U\+AC00-D7A3/)
  assert.doesNotMatch(range, /U\+0000/, '라틴 기본 범위는 한글 face가 맡지 않는다')

  // 영문·숫자는 별도 face가 Pretendard 폭에 맞춰 맡는다
  const faces = css.match(/@font-face\s*\{[^}]*'Pretendard Fallback'[^}]*\}/g) ?? []
  const latin = faces.find((f) => /U\+0000-00FF/.test(f))
  assert.ok(latin, '영문·숫자를 맡는 대체 face가 있어야 한다')
  assert.match(latin, /local\('Arial'\)/)
  const latinAdjust = Number(latin.match(/size-adjust:\s*([\d.]+)%/)?.[1])
  assert.ok(
    Math.abs(latinAdjust - 98.4) < 1,
    `라틴 size-adjust ${latinAdjust}%는 98% 근처여야 한다`,
  )

  // 웹폰트 바로 다음, 시스템 글꼴보다 앞에 있어야 교체 전 화면에 쓰인다
  const stack = css.match(/--font-sans:\s*([^;]+);/)?.[1].replace(/\s+/g, ' ')
  assert.ok(stack, '--font-sans가 필요하다')
  assert.ok(
    stack.indexOf('Pretendard Fallback') > stack.indexOf("'Pretendard Variable'"),
    '실제 웹폰트가 먼저 온다',
  )
  assert.ok(
    stack.indexOf('Pretendard Fallback') < stack.indexOf('-apple-system'),
    '시스템 글꼴 스택보다 앞에 온다',
  )
})

test('태그와 검색 결과 링크는 손가락으로 누를 수 있는 크기다', () => {
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const text = source(path)
    // 태그는 글자 링크(전역 a 밑줄)다. 링크·비링크 모두 44px 줄 높이를 가진다
    const rule = text.match(/p\.tags a,\s*p\.tags span:not\(\.k\) \{[^}]*\}/)?.[0]
    assert.ok(rule, `${path}에 p.tags a 규칙이 있어야 한다`)
    assert.match(rule, /min-height:\s*var\(--control-size\)/)
    assert.match(text, /p\.tags a:focus-visible \{[^}]*outline:/)
    assert.match(text, /<span class="k">태그<\/span>/)
  }

  const search = source('src/components/Search.astro')
  const link = search.match(/#search-mount \.pagefind-ui__result-link \{[^}]*\}/)?.[0]
  assert.ok(link, '검색 결과 링크 규칙이 있어야 한다')
  assert.match(link, /min-height:\s*var\(--control-size\)/)
  // 여백만큼 음수 바깥 여백을 줘서 결과 목록이 세로로 길어지지 않는다
  const pad = link.match(/padding-block:\s*([\d.]+)rem/)?.[1]
  const margin = link.match(/margin-block:\s*-([\d.]+)rem/)?.[1]
  assert.equal(pad, margin, '여백과 음수 바깥 여백이 같아야 한다')
})

test('사례 글은 수정일을 화면에 적지 않고, 갱신이 핵심인 위키 문서에서만 보여 준다', () => {
  const post = source('src/layouts/PostLayout.astro')
  const wiki = source('src/pages/wiki/[...slug].astro')
  // 사례 글·노트 상세: 화면에는 작성일과 사례 시점만 남는다
  const dates = post.match(/<ContentDates[^/]*\/>/)?.[0]
  assert.ok(dates, 'PostLayout에 ContentDates가 있어야 한다')
  assert.doesNotMatch(dates, /updated=/)
  // 검색엔진에 알리는 수정 시각은 유지한다
  assert.match(post, /updatedAt=\{updated\}/)
  // 위키 문서는 '마지막 수정'이 정렬 기준이자 읽는 사람이 보는 정보다
  assert.match(wiki, /<ContentDates[\s\S]{0,200}updated=\{entry\.data\.updated\}/)
})
