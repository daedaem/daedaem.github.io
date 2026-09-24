// 빌드 뒤에 사이트 전체에서 쓰는 글자만 모아 Pretendard 가변 글꼴 파일 하나를 만든다.
// 동적 서브셋(92조각)을 그대로 쓰면 글 한 편에 20개 넘는 조각을 받는다. 사이트 글자는
// 1,100자 남짓이라 한 파일로 모으면 요청 수와 전송량이 모두 준다.
//
// 동작
// 1. dist의 HTML·JS에 나오는 모든 글자를 모은다(검색 UI처럼 스크립트가 쓰는 문구 포함).
// 2. 원본 PretendardVariable.woff2에서 그 글자만 남긴 가변 글꼴을 만든다(굵기 축은 그대로).
// 3. 동적 서브셋 CSS 끝에 같은 이름의 @font-face를 unicode-range와 함께 덧붙인다.
//    같은 글자를 여러 면이 덮으면 나중에 선언한 면이 이기므로 사이트 글자는 새 파일로 그리고,
//    검색창에 새로 입력한 글자처럼 목록에 없는 글자만 기존 조각을 받아 그린다.
// 4. HTML의 preload 주소를 내용 해시가 붙은 새 파일 이름으로 바꾼다.
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, relative } from 'node:path'
import subsetFont from 'subset-font'

const require = createRequire(import.meta.url)
const DIST = new URL('../dist/', import.meta.url).pathname
const CSS = join(DIST, 'fonts/pretendard/pretendardvariable-dynamic-subset.min.css')
export const PRELOAD_PLACEHOLDER = '/fonts/pretendard/woff2/PretendardVariable.site.woff2'

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)],
  )

// 원본 글꼴의 문자표(cmap)는 동적 서브셋 CSS의 unicode-range를 모두 합친 것과 같다.
export function coveredCodePoints(css) {
  const set = new Set()
  for (const [, list] of css.matchAll(/unicode-range:([^;}]+)/g))
    for (const part of list.split(',')) {
      const [a, b] = part.trim().replace(/^U\+/i, '').split('-')
      const start = parseInt(a, 16)
      const end = b ? parseInt(b, 16) : start
      for (let c = start; c <= end; c++) set.add(c)
    }
  return set
}

export function toUnicodeRange(codePoints) {
  const sorted = [...codePoints].sort((a, b) => a - b)
  const out = []
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i]
    while (sorted[i + 1] === sorted[i] + 1) i++
    const hex = (n) => n.toString(16)
    out.push(start === sorted[i] ? `U+${hex(start)}` : `U+${hex(start)}-${hex(sorted[i])}`)
  }
  return out.join(',')
}

export function collectCodePoints(texts) {
  const set = new Set()
  // 영문·숫자·기본 문장부호는 페이지에 없어도 입력창 등에서 쓰이므로 늘 넣는다.
  for (let c = 0x20; c <= 0x7e; c++) set.add(c)
  for (const text of texts) for (const ch of text) set.add(ch.codePointAt(0))
  return set
}

async function main() {
  const files = walk(DIST)
  const pages = files.filter((f) => f.endsWith('.html'))
  const texts = files
    // CSS의 content: '▸' 같은 글자도 화면에 그려지므로 함께 센다(동적 서브셋 CSS 자신은 뺀다).
    .filter((f) => /\.(html|js|mjs|css)$/.test(f) && f !== CSS)
    .map((f) => {
      const raw = readFileSync(f, 'utf8')
      // HTML 문자 참조(&#x...;)와 CSS 이스케이프(\2192)를 실제 글자로 바꿔 함께 센다.
      const char = (n) => (n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '')
      const text = raw
        .replace(/&#x([\da-f]+);/gi, (_, h) => char(parseInt(h, 16)))
        .replace(/&#(\d+);/g, (_, d) => char(Number(d)))
      return f.endsWith('.css')
        ? text.replace(/\\([\da-f]{2,6})\s?/gi, (_, h) => char(parseInt(h, 16)))
        : text
    })

  const css = readFileSync(CSS, 'utf8')
  const covered = coveredCodePoints(css)
  const used = [...collectCodePoints(texts)].filter((c) => covered.has(c))

  const source = readFileSync(
    require.resolve('pretendard/dist/web/variable/woff2/PretendardVariable.woff2'),
  )
  const font = await subsetFont(source, String.fromCodePoint(...used), { targetFormat: 'woff2' })
  const hash = createHash('sha256').update(font).digest('hex').slice(0, 10)
  const name = `PretendardVariable.site.${hash}.woff2`
  writeFileSync(join(DIST, 'fonts/pretendard/woff2', name), font)

  const face =
    `@font-face{font-family:'Pretendard Variable';font-style:normal;font-display:swap;` +
    `font-weight:45 920;src:url(./woff2/${name}) format('woff2-variations');` +
    `unicode-range:${toUnicodeRange(used)}}`
  writeFileSync(CSS, css + face)

  const href = `/fonts/pretendard/woff2/${name}`
  let rewritten = 0
  for (const page of pages) {
    const html = readFileSync(page, 'utf8')
    if (!html.includes(PRELOAD_PLACEHOLDER)) continue
    writeFileSync(page, html.replaceAll(PRELOAD_PLACEHOLDER, href))
    rewritten++
  }
  console.log(
    `[subset-fonts] ${used.length} glyphs → ${relative(DIST, join(DIST, 'fonts/pretendard/woff2', name))} ` +
      `(${(font.length / 1024).toFixed(0)}KB), preload in ${rewritten}/${pages.length} pages`,
  )
}

if (import.meta.url === `file://${process.argv[1]}`) await main()
