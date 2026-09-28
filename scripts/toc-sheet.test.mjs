import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('cases use native sticky contents while notes and wiki retain the mid-article sheet', () => {
  for (const page of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const text = source(page)
    assert.match(text, /import \{ initTocSheet \} from '@\/utils\/toc-sheet\.mjs'/, page)
    assert.match(text, /initCurrentHeading\(\)/, page)
    if (page.endsWith('PostLayout.astro')) {
      assert.match(text, /if \(document.querySelector\('\.is-archived'\)\) initTocSheet\(\)/)
      assert.match(text, /querySelector<HTMLDetailsElement>\('details\.case-toc'\)/)
      assert.match(text, /if \(link\) caseToc.open = false/)
      assert.match(text, /details.case-toc\s*\{[^}]*position:\s*sticky/)
    } else assert.match(text, /initTocSheet\(\)/, page)
  }
  const sheet = source('src/utils/toc-sheet.mjs')
  // 본문 목차와 같은 #앵커를 복제해 주소·방문 기록이 남고, 지금 절 표시를 옮겨 온다.
  assert.match(sheet, /list\.cloneNode\(true\)/)
  assert.match(sheet, /aria-current/)
  assert.match(sheet, /showModal\(\)/)
  // 너비가 아니라 본문 목차가 화면에서 사라졌는지로 정해, 넓은 화면의 위키 문서에서도 뜬다.
  assert.doesNotMatch(sheet, /min-width: 1200px/)
  assert.match(sheet, /entry\.isIntersecting/)
  const css = source('src/styles/global.css')
  assert.match(css, /\.toc-fab\s*\{[^}]*position: fixed;[^}]*min-height: var\(--control-size\);/)
  assert.match(css, /\.toc-sheet a\s*\{[^}]*min-height: var\(--control-size\);/)
})

for (const [path, kind, list] of [
  ['src/layouts/PostLayout.astro', 'case', 'ol'],
  ['src/pages/about.astro', 'about', 'nav'],
]) {
  test(`mobile ${kind} contents remain sticky when reopened mid-page`, () => {
    const text = source(path).split('@media (max-width: 1023px)')[1]?.split('@media')[0]
    assert.ok(text, 'mobile contents rules exist')
    const base = text.match(new RegExp(`details\\.${kind}-toc\\s*\\{([^}]+)\\}`))?.[1]
    const open = text.match(new RegExp(`details\\.${kind}-toc\\[open\\]\\s*\\{([^}]+)\\}`))?.[1]
    assert.match(base, /position:\s*sticky/)
    assert.match(base, /top:\s*0/)
    assert.match(base, /z-index:\s*5/)
    // An open-state static/relative override sends the expanded contents back above
    // the viewport after the reader has already navigated to a later heading.
    assert.match(open, /position:\s*sticky/)
    assert.doesNotMatch(open, /position:\s*(?:static|relative)|z-index:\s*[0-4]\b/)
    const scroller = text.match(
      new RegExp(`(?:details\\.)?${kind}-toc ${list}\\s*\\{([^}]+)\\}`),
    )?.[1]
    assert.match(scroller, /max-height:[^;]*dvh/)
    assert.match(scroller, /overflow-y:\s*auto/)
  })
}
