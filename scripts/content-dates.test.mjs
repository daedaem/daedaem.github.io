import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import yaml from 'js-yaml'

const root = new URL('../src/content/', import.meta.url)
function read(relative) {
  const text = readFileSync(new URL(relative, root), 'utf8')
  const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  assert.ok(header, relative)
  return { data: yaml.load(header[1]), body: text.slice(header[0].length) }
}

test('note metadata includes the latest explicitly dated correction, including after body dividers', () => {
  let checked = 0
  for (const file of readdirSync(new URL('notes/', root)).filter((f) => /\.mdx?$/.test(f))) {
    const { data, body } = read(`notes/${file}`)
    const dates = [
      ...body.matchAll(/(?:바로잡음|보충|덧붙임|이미지 안내)\s*[（(](\d{4}-\d{2}-\d{2})[）)]/g),
    ]
      .map((m) => m[1])
      .sort()
    if (!dates.length) continue
    checked++
    assert.ok(data.updated, `${file}: updated missing`)
    assert.ok(
      new Date(data.updated) >= new Date(dates.at(-1)),
      `${file}: updated predates its correction`,
    )
  }
  assert.ok(checked >= 19)
  const first = read('notes/core-javascript-01-data-types.md')
  assert.match(first.body, /---[\s\S]*바로잡음\(2026-09-04\)/)
})

test('publication dates and SCSA original record are not replaced by revision dates', () => {
  const expected = {
    'address-search-9s-to-100ms': '2026-08-12',
    'null-and-empty-string-sync-failure': '2026-08-12',
    'phantom-batch-after-was-migration': '2026-08-12',
    'integer-overflow-negative-amount': '2026-08-12',
    'disk-99-percent-check-before-expanding': '2026-09-03',
    'retire-flash-module-by-integration': '2026-09-05',
  }
  for (const [slug, date] of Object.entries(expected)) {
    const { data } = read(`posts/${slug}.md`)
    assert.equal(new Date(data.date).toISOString().slice(0, 10), date)
    assert.equal(data.draft, false)
  }
  const { data, body } = read('notes/scsa.md')
  assert.equal(new Date(data.date).toISOString().slice(0, 10), '2022-12-21')
  assert.equal(data.slug, 'scsa')
  assert.equal(data.legacyPath, '/SCSA/')
  // 제목은 사용자가 정한 문구. 합격이 앞에 오고 결과가 뒤에 오는 형태만 검사한다
  assert.match(data.title, /^삼성전자 DX SCSA 19기 합격/)
  // 교육 과정 선발을 최종 채용 합격으로 읽히게 쓰지 않는다
  assert.doesNotMatch(data.title, /공채/)
  assert.match(data.title, /최종 탈락$/)
  assert.match(data.summary, /역량테스트를 통과하지 못해/)
  assert.match(body, /세 번째 시험까지 치렀지만/)
  assert.doesNotMatch(body, /^### 삼성전자/m)
})

test('SCSA pressure is a dated personal recollection, not a claim about repayment or exam rules', () => {
  const { data, body } = read('notes/scsa.md')
  const addition = body.match(/^> \*\*덧붙임\(2026-09-14\):\*\*[^\n]+/m)?.[0]
  assert.ok(addition)
  assert.equal(new Date(data.date).toISOString().slice(0, 10), '2022-12-21')
  assert.ok(new Date(data.updated) >= new Date('2026-09-14'))
  assert.match(addition, /나는 시험에서 탈락하면 교육비를 반환해야 할 수도 있다고 알고 있었다/)
  assert.match(addition, /SW 역량테스트 기회도 한 번뿐인 줄 알았고/)
  assert.match(addition, /두 번째와 세 번째[\s\S]*매번 이번이 마지막 기회라고 생각했다/)
  assert.match(addition, /압박감 때문에 차분하게 시험에 임하기 어려웠다/)
  assert.doesNotMatch(addition, /반환해야 했다|반환했다|규정상|기회는 한 번뿐이었다/)
  assert.match(body, /하지만 결국 준비가 부족했던 것이라는 사실을 인정/)
  assert.ok(body.indexOf(addition) < body.indexOf('하루는 아무것도 못 하고 보냈다'))
})

test('header controls use the existing 44px control-size token', () => {
  for (const file of ['Search', 'ThemeToggle']) {
    const source = readFileSync(new URL(`../src/components/${file}.astro`, import.meta.url), 'utf8')
    assert.match(source, /height:\s*var\(--control-size\)/)
    assert.match(source, /width:\s*var\(--control-size\)/)
    assert.doesNotMatch(source, /(?:width|height):\s*34px/)
  }
})
