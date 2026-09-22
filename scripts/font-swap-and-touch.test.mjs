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
    const rule = text.match(/\.tags a \{[^}]*\}/)?.[0]
    assert.ok(rule, `${path}에 .tags a 규칙이 있어야 한다`)
    assert.match(rule, /min-height:\s*var\(--control-size\)/)
    // 누를 수 있는 태그만 테두리를 가져 링크가 아닌 태그와 구분된다
    assert.match(rule, /border:\s*1px solid/)
    assert.match(text, /\.tags a:focus-visible \{[^}]*outline:/)
    const item = text.match(/\.tags li \{[^}]*\}/)?.[0]
    assert.ok(item, `${path}에 .tags li 규칙이 있어야 한다`)
    assert.match(item, /min-height:\s*var\(--control-size\)/)
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
