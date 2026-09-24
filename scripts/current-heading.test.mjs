import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { currentHeadingIndex, initCurrentHeading } from '../src/utils/current-heading.mjs'

test('reading location follows heading boundaries, long sections and the last section', () => {
  assert.equal(currentHeadingIndex([], 180), -1)
  assert.equal(currentHeadingIndex([], 180, true), -1)
  assert.equal(currentHeadingIndex([300, 1500, 3000], 180), -1)
  assert.equal(currentHeadingIndex([180, 1500, 3000], 180), 0)
  assert.equal(currentHeadingIndex([-1000, 300, 1700], 180), 0)
  assert.equal(currentHeadingIndex([-1000, -50, 1700], 180), 1)
  assert.equal(currentHeadingIndex([-1000, -50, 1700], 180, true), 2)
})

test('scroll, anchor and history updates share one scheduled update and one current link', () => {
  const positions = [500, 1800, 2800]
  const frames = []
  const events = new Map()
  const links = positions.map((_, index) => ({
    hash: '#section-' + index,
    attrs: new Map(),
    setAttribute(key, value) {
      this.attrs.set(key, value)
    },
    removeAttribute(key) {
      this.attrs.delete(key)
    },
  }))
  const root = {
    querySelectorAll: () => links,
    querySelector: () => null,
    getElementById: (id) => ({
      getBoundingClientRect: () => ({ top: positions[Number(id.slice(-1))] }),
    }),
    documentElement: { scrollHeight: 4000 },
  }
  const view = {
    scrollY: 0,
    innerHeight: 900,
    addEventListener: (name, handler) => events.set(name, handler),
    requestAnimationFrame: (handler) => frames.push(handler),
  }
  const current = () => links.map((link) => link.attrs.get('aria-current'))
  initCurrentHeading(root, view)
  assert.deepEqual(current(), [undefined, undefined, undefined])
  positions.splice(0, 3, -1000, 120, 1300)
  events.get('scroll')()
  events.get('resize')()
  events.get('hashchange')()
  assert.equal(frames.length, 1)
  frames.shift()()
  assert.deepEqual(current(), [undefined, 'location', undefined])
  view.scrollY = 3100
  events.get('pageshow')()
  frames.shift()()
  assert.deepEqual(current(), [undefined, undefined, 'location'])
  view.scrollY = 0
  positions.splice(0, 3, 500, 1800, 2800)
  events.get('hashchange')()
  frames.shift()()
  assert.deepEqual(current(), [undefined, undefined, undefined])
})

test('documents without a usable outline install no scroll handlers', () => {
  let listeners = 0
  initCurrentHeading({ querySelectorAll: () => [] }, { addEventListener: () => listeners++ })
  assert.equal(listeners, 0)
})

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
test('wiki and case outlines share location behavior without replacing native anchors', () => {
  for (const path of ['src/layouts/PostLayout.astro', 'src/pages/wiki/[...slug].astro']) {
    const source = read(path)
    assert.match(source, /initCurrentHeading\(\)/)
    assert.match(source, /href=\{`#\$\{h.slug\}`\}/)
    // 본문 위 차례와 넓은 화면 레일이 같은 앵커를 쓴다
    assert.match(source, /<details class="toc" data-pagefind-ignore>/)
    assert.match(source, /<nav class="rail" aria-label="차례" data-pagefind-ignore>/)
  }
  // 현재 절 표시는 두 목록에 함께 붙고, 모양은 전역 CSS가 정한다
  const module = read('src/utils/current-heading.mjs')
  assert.match(module, /details\.toc a\[href\^="#"\], nav\.rail a\[href\^="#"\]/)
  assert.match(module, /setAttribute\('aria-current', 'location'\)/)
  const css = read('src/styles/global.css')
  assert.match(css, /nav\.rail a\[aria-current\] \{/)
  assert.match(css, /details\.toc a,\s*nav\.rail a \{[^}]*min-height: 2\.25rem;/)
})

test('wiki title precedes dates and navigation is separate from publication metadata', () => {
  const source = read('src/pages/wiki/[...slug].astro')
  // 메타 줄(위키 › 주제 · 상태 · 만듦 · 갱신)이 제목 위에 온다. 검색 색인에서는 뺀다
  assert.match(source, /<p class="meta" data-pagefind-ignore>/)
  assert.ok(source.indexOf('<p class="meta"') < source.indexOf('<h1 tabindex="-1">'))
  assert.ok(source.indexOf('<ContentDates') < source.indexOf('<h1 tabindex="-1">'))
  assert.match(source, /date=\{entry.data.created\}/)
  assert.match(source, /updated=\{entry.data.updated\}/)
  assert.match(source, /dateLabel="만듦"/)
  assert.match(source, /updatedLabel="갱신"/)
  assert.match(source, /<p class="deck">\{entry.data.description\}<\/p>/)
  assert.match(source, /<Content\s*\/>/)
})

test('wiki document and related-reading links use visible focus and existing 44px controls', () => {
  // 왼쪽 트리(WikiTree)는 없앴다. 역링크·같은 주제·이어 읽기 목록의 링크가 44px 높이를 가진다
  assert.equal(existsSync(new URL('../src/components/WikiTree.astro', import.meta.url)), false)
  for (const path of ['src/pages/wiki/[...slug].astro', 'src/components/RelatedReading.astro']) {
    const source = read(path)
    assert.match(source, /min-height: var\(--control-size\)/)
    assert.match(source, /:focus-visible/)
    assert.match(source, /outline: 2px solid var\(--accent\)/)
  }
  const wiki = read('src/pages/wiki/[...slug].astro')
  assert.match(wiki, /selectWikiReferences\(pool, entry\)/)
  assert.match(wiki, /<h2 class="k">이 문서를 참고하는 글<\/h2>/)
  assert.match(wiki, /<h2 class="k">같은 주제의 문서<\/h2>/)
  assert.match(wiki, /\.slice\(0, 8\)/)
  assert.match(wiki, /<RelatedReading current=\{entry\.id\} \/>/)
})
