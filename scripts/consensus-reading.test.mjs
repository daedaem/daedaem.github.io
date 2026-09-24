import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import yaml from 'js-yaml'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const outlines = [
  ['src/layouts/PostLayout.astro', '(min-width: 1200px)', false],
  ['src/pages/wiki/[...slug].astro', '(max-width: 60rem)', true],
]

for (const [path, query, narrowMatch] of outlines) {
  test(`${path}: outline initializes while parsing, before the body, with a no-JS fallback`, () => {
    const source = read(path)
    const outline = source.match(/<nav class="toc"[\s\S]*?<\/nav>/)?.[0]
    assert.ok(outline)
    assert.match(outline, /<details open>\s*<summary>/)
    assert.match(outline, /<\/details>\s*<script is:inline>/)
    const body = source.search(/<(?:Content|slot)\s*\/>/)
    assert.ok(body > source.indexOf(outline), 'initialize before article content is parsed')
    const initial = outline.match(/<script is:inline>([\s\S]*?)<\/script>/)?.[1]
    assert.ok(initial)
    for (const isNarrow of [true, false]) {
      class Details {
        open = true
      }
      const details = new Details()
      runInNewContext(initial, {
        document: { currentScript: { previousElementSibling: details } },
        HTMLDetailsElement: Details,
        matchMedia: (actual) => {
          assert.equal(actual, query)
          return { matches: isNarrow ? narrowMatch : !narrowMatch }
        },
      })
      assert.equal(details.open, !isNarrow)
    }
  })

  test(`${path}: delayed module preserves a manual toggle and only breakpoint changes resync it`, () => {
    const script = read(path)
      .match(/<script>([\s\S]*?)<\/script>/)[1]
      .replace(/^\s*import .+$/gm, '')
      .replace(/querySelector<HTMLDetailsElement>/g, 'querySelector')
    for (const isNarrow of [true, false]) {
      let change
      let locationInitializations = 0
      let tocSheetInitializations = 0
      // The reader toggled the native summary after the inline initializer.
      const details = { open: isNarrow }
      const media = {
        matches: isNarrow ? narrowMatch : !narrowMatch,
        addEventListener: (event, handler) => {
          assert.equal(event, 'change')
          change = handler
        },
      }
      runInNewContext(script, {
        document: { querySelector: () => details },
        matchMedia: (actual) => {
          assert.equal(actual, query)
          return media
        },
        initCurrentHeading: () => locationInitializations++,
        initTocSheet: () => tocSheetInitializations++,
      })
      assert.equal(details.open, isNarrow, 'module must not overwrite a user toggle')
      assert.equal(locationInitializations, 1)
      assert.equal(tocSheetInitializations, 1)
      assert.equal(typeof change, 'function')
      media.matches = !media.matches
      details.open = !isNarrow
      change()
      assert.equal(details.open, isNarrow, 'new breakpoint state must still apply')
    }
    runInNewContext(script, {
      document: { querySelector: () => null },
      matchMedia: () => ({}),
      initCurrentHeading() {},
      initTocSheet() {},
    })
  })
}

test('code blocks keep a separate top band with a language label and an always-visible copy button', () => {
  const css = read('src/styles/global.css')
  const button = css.match(/\.copy-code \{([^}]+)\}/)[1]
  assert.match(css, /--control-size: 2\.75rem;/)
  assert.match(css, /--code-band: 40px;/)
  assert.match(button, /top: 0;/)
  assert.match(button, /min-height: var\(--code-band\);/)
  assert.doesNotMatch(button, /opacity: 0/)
  assert.match(
    css.match(/\npre \{([^}]+)\}/)[1],
    /padding: calc\(var\(--code-band\) \+ 0\.9rem\) 1rem 0\.9rem;/,
  )
  assert.match(css.match(/\npre \{([^}]+)\}/)[1], /font-variant-ligatures: none;/)
  assert.match(css.match(/\npre \{([^}]+)\}/)[1], /border-radius: 0;/)
  const label = css.match(
    /pre\[data-language\]:not\(\[data-language='plaintext'\]\)::before \{([^}]+)\}/,
  )[1]
  assert.match(label, /font-size: 0\.8125rem;/)
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
