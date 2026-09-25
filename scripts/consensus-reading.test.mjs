import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import yaml from 'js-yaml'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const outlines = ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']

for (const path of outlines) {
  test(`${path}: outline is a closed native details before the body, replaced by a rail on wide screens`, () => {
    const source = read(path)
    // 4개 이상일 때만 차례를 두고, 접힌 채로 시작한다(JS 없이도 동작). 폭 분기 스크립트는 없다
    assert.match(source, /const hasToc = toc\.length >= 4/)
    const outline = source.match(
      /<details class="toc" data-pagefind-ignore>[\s\S]*?<\/details>/,
    )?.[0]
    assert.ok(outline)
    assert.doesNotMatch(outline, /<details[^>]*\sopen/)
    assert.match(
      outline,
      /<summary>\s*<span class="k">\s*차례 <span class="n">\{toc\.length\}<\/span>/,
    )
    assert.match(outline, /<ol>[\s\S]*<li class:list=\{\{ d3: h\.depth === 3 \}\}>/)
    assert.doesNotMatch(source, /<script is:inline>|matchMedia\('\((?:min|max)-width/)
    const body = source.search(/<(?:Content\s*\/>|div class="prose">)/)
    assert.ok(body > source.indexOf(outline), 'outline comes before article content')
    // 넓은 화면 레일: 차례 + 현재 절 + 맨 위로
    const rail = source.match(
      /<nav class="rail" aria-label="차례" data-pagefind-ignore>[\s\S]*?<\/nav>/,
    )?.[0]
    assert.ok(rail)
    assert.match(rail, /<button type="button" class="totop">\s*맨 위로\s*<\/button>/)
    assert.match(source, /\.rail \.totop/)
  })

  test(`${path}: module wires location tracking, the mid-article sheet and the back-to-top button once`, () => {
    const script = read(path)
      .match(/<script>([\s\S]*?)<\/script>/)[1]
      .replace(/^\s*import .+$/gm, '')
      .replace(/querySelector<[^>]+>/g, 'querySelector')
    let locationInitializations = 0
    let tocSheetInitializations = 0
    let handler
    const button = { addEventListener: (event, fn) => (event === 'click' ? (handler = fn) : null) }
    const scrolls = []
    const heading = { focus: (options) => scrolls.push(['focus', options]) }
    runInNewContext(script, {
      document: {
        querySelector: (selector) => (selector === '.rail .totop' ? button : heading),
      },
      matchMedia: () => ({ matches: true }),
      scrollTo: (options) => scrolls.push(['scroll', options]),
      initCurrentHeading: () => locationInitializations++,
      initTocSheet: () => tocSheetInitializations++,
    })
    assert.equal(locationInitializations, 1)
    assert.equal(tocSheetInitializations, 1)
    assert.equal(typeof handler, 'function')
    handler()
    // 동작 줄이기에서는 바로 올라가고, 초점은 제목으로 옮긴다
    // vm 컨텍스트의 객체는 프로토타입이 달라 값만 비교한다
    assert.equal(
      JSON.stringify(scrolls),
      JSON.stringify([
        ['scroll', { top: 0, behavior: 'auto' }],
        ['focus', { preventScroll: true }],
      ]),
    )
  })
}

test('global outline styles hide the inline contents on wide screens and show the sheet button elsewhere', () => {
  const css = read('src/styles/global.css')
  assert.match(css, /@media \(min-width: 75em\) \{\s*details\.toc \{\s*display: none;/)
  assert.match(
    css,
    /@media \(min-width: 75em\) \{\s*nav\.rail \{\s*display: block;\s*position: fixed;/,
  )
  assert.match(css, /@media \(min-width: 75em\) \{\s*\.fab \{\s*display: none !important;/)
  const sheet = read('src/utils/toc-sheet.mjs')
  assert.match(sheet, /querySelector\('details\.toc'\)/)
  assert.match(sheet, /button\.className = 'fab toc-fab'/)
  assert.match(sheet, /dialog\.className = 'sheet toc-sheet'/)
})

test('code blocks keep a separate top band with a language label and an always-visible copy button', () => {
  const css = read('src/styles/global.css')
  const button = css.match(/\.copy-code \{([^}]+)\}/)[1]
  assert.match(css, /--control-size: 2\.75rem;/)
  // 띠 높이 44px = 복사 버튼의 조작 크기
  assert.match(css, /--code-band: 44px;/)
  assert.match(button, /top: 0;/)
  assert.match(button, /min-height: var\(--code-band\);/)
  assert.doesNotMatch(button, /opacity: 0/)
  assert.match(
    css.match(/\npre \{([^}]+)\}/)[1],
    /padding: calc\(var\(--code-band\) \+ 0\.9rem\) 1\.1rem 0\.9rem;/,
  )
  assert.match(css.match(/\npre \{([^}]+)\}/)[1], /font-variant-ligatures: none;/)
  // 시안의 코드 상자: 14px 반경(좁은 화면에서 좌우로 넓힐 때만 반경 0)
  assert.match(css.match(/\npre \{([^}]+)\}/)[1], /border-radius: var\(--r-box\);/)
  assert.match(css, /--r-box: 14px;/)
  assert.match(css, /@media \(max-width: 40em\) \{\s*pre \{[^}]*border-radius: 0;/)
  const label = css.match(
    /pre\[data-language\]:not\(\[data-language='plaintext'\]\)::before \{([^}]+)\}/,
  )[1]
  assert.match(label, /font-size: 0\.75rem;/)
  assert.match(read('src/layouts/BaseLayout.astro'), /<span>복사<\/span>/)
  assert.match(css, /pre\.astro-code > code \{[^}]*overflow-x: auto;/)
  assert.match(css, /pre\.astro-code \{\s*overflow: visible !important;/)
})

test('agreed wording clarifies existing examples without inventing experience or changing titles', () => {
  const spring = read('src/content/wiki/spring-transactional-catch-swallows-rollback.md')
  const meta = yaml.load(spring.match(/^---\n([\s\S]*?)\n---/)[1])
  assert.equal(meta.title, '@Transactional 안에서 예외를 catch해 문자열을 돌려주면 롤백이 안 된다')
  assert.match(meta.description, /rollback-only로 표시되지 않은 상태/)
  assert.match(spring, /이미 롤백 전용으로 표시했다면/)
  assert.match(
    read('src/content/wiki/aspnet-webforms-basics.md'),
    /\| 비교 항목 \| Spring MVC \| Web Forms \|/,
  )
  const example = read('src/content/posts/null-and-empty-string-sync-failure.md')
  assert.match(example, /-- 결과: 'NULL' \(NULL 값이 아니라 문자열\)/)
  assert.match(example, /당시 운영 SQL이나 수정 전후의 코드를 재현한 것은 아니다/)
  assert.match(example, /updated: 2026-09-14/)
})
