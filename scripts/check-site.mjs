import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import yaml from 'js-yaml'
import { checkRenderedCodeContrast } from './code-contrast.mjs'

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )

// 공통 날짜 컴포넌트가 원문 날짜를 수정일로 덮어 숨기지 않는지 생성 HTML에서 확인한다.
export function checkDateDisplay(html, date, updated) {
  const dates = html.match(
    /<span\b[^>]*class="[^"]*\bcontent-dates\b[^"]*"[^>]*>([\s\S]*?)<\/span>/,
  )?.[1]
  if (!dates) return ['content dates missing']
  const actual = [...dates.matchAll(/<time\b[^>]*datetime="([^"]+)"[^>]*>([\s\S]*?)<\/time>/g)]
  const first = new Date(date).toISOString()
  const revised = updated ? new Date(updated).toISOString() : undefined
  const expected = revised && revised !== first ? [first, revised] : [first]
  const errors = []
  if (actual.length !== expected.length) errors.push('unexpected number of content dates')
  expected.forEach((value, index) => {
    if (actual[index]?.[1] !== value) errors.push(`content date ${index + 1} differs from metadata`)
    if (!actual[index]?.[2].replace(/<[^>]*>/g, '').trim())
      errors.push(`content date ${index + 1} has no visible text`)
  })
  return errors
}

// Astro가 생성한 HTML의 따옴표로 감싼 href/src만 검사한다. 범용 HTML 파서는 아니다.
export function checkSite(root, site) {
  root = resolve(root)
  const errors = []
  let references = 0
  const pages = walk(root).filter((file) => file.endsWith('.html'))
  const readerCss = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8')
  const lightCodeBackground = readerCss.match(/--code-bg:\s*(#[\da-f]{6})/i)?.[1]
  for (const file of pages) {
    const name = relative(root, file).split(sep).join('/')
    const base = new URL(name.replace(/index\.html$/, ''), site)
    const html = readFileSync(file, 'utf8')
    errors.push(
      ...checkRenderedCodeContrast(html, lightCodeBackground).map((error) => `${name}: ${error}`),
    )
    const ids = [...html.matchAll(/\sid=(["'])(.*?)\1/g)].map((match) => match[2])
    for (const tag of html.matchAll(/<a\b[^>]*>/gi)) {
      const labels = tag[0].match(/\baria-labelledby=(["'])(.*?)\1/)?.[2]
      if (!labels) continue
      for (const id of labels.split(/\s+/)) {
        if (ids.filter((value) => value === id).length !== 1)
          errors.push(`${name}: link label must reference one unique element: ${id}`)
      }
    }
    // 본문 아래 탐색 목록·댓글 안내가 검색어에 걸려 무관한 글이 노출되지 않게 한다.
    for (const tag of html.matchAll(/<(?:section|aside|nav|p)\b[^>]*>/gi)) {
      const classes = (tag[0].match(/\bclass=(["'])(.*?)\1/)?.[2] ?? '').split(/\s+/)
      const readingChrome =
        /\baria-label=(["'])(?:다른 글|이어 읽을 사례|이어 읽을 글|연결된 문서|댓글|학습 기록 탐색|같은 유형의 다른 문제|목차)\1/.test(
          tag[0],
        ) ||
        classes.includes('archived') ||
        (name.startsWith('algorithms/') && classes.some((c) => c === 'notice' || c === 'related'))
      if (!readingChrome) continue
      if (!/\sdata-pagefind-ignore(?=[\s=>])/.test(tag[0])) {
        errors.push(`${name}: reading navigation/comments must be excluded from search`)
      }
    }
    for (const tag of html.matchAll(/<(?:a|img|script|link|source|video|audio)\b[^>]*>/gi)) {
      // GitHub Pages의 404.html은 /404/ canonical과 물리 경로가 다르다.
      if (name === '404.html' && /\brel=["']canonical["']/i.test(tag[0])) continue
      for (const attr of tag[0].matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gi)) {
        const raw = attr[2].replaceAll('&amp;', '&')
        let url
        try {
          url = new URL(raw, base)
        } catch {
          errors.push(`${name}: invalid URL ${raw}`)
          continue
        }
        if (url.origin !== new URL(site).origin) continue
        references++
        let target
        try {
          target = resolve(root, '.' + decodeURIComponent(url.pathname))
        } catch {
          errors.push(`${name}: invalid encoded URL ${raw}`)
          continue
        }
        if (target !== root && !target.startsWith(root + sep)) {
          errors.push(`${name}: path escapes build directory`)
          continue
        }
        if (existsSync(target) && statSync(target).isDirectory())
          target = join(target, 'index.html')
        if (!existsSync(target)) errors.push(`${name}: missing ${url.pathname}`)
      }
    }
  }
  return { pages: pages.length, references, errors }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = resolve('dist')
  if (!existsSync(root)) throw new Error('Run npm run build before check:site')
  // Node 22의 타입 제거로 기존 site 설정을 읽어 URL을 중복 관리하지 않는다.
  const { SITE } = await import('../src/consts.ts')
  const result = checkSite(root, SITE.url)
  for (const asset of [
    'index.html',
    'posts/index.html',
    'wiki/index.html',
    'learn/index.html',
    'admin/index.html',
    'about/index.html',
    'pagefind/pagefind.js',
    'pagefind/pagefind-ui.js',
    'pagefind/pagefind-ui.css',
    'rss.xml',
    'sitemap-index.xml',
    'robots.txt',
  ]) {
    if (!existsSync(join(root, asset))) result.errors.push(`Required output missing: ${asset}`)
  }
  for (const collection of ['posts', 'wiki']) {
    for (const file of walk(resolve('src/content', collection)).filter((f) => /\.mdx?$/.test(f))) {
      const content = readFileSync(file, 'utf8')
      const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      if (!frontmatter) continue
      const slug = relative(resolve('src/content', collection), file).replace(/\.mdx?$/, '')
      const output = join(root, collection, slug, 'index.html')
      const data = yaml.load(frontmatter[1])
      if (data.draft && existsSync(output)) {
        result.errors.push(`Draft was generated: ${collection}/${slug}`)
      }
      if (collection === 'wiki' && !data.draft) {
        if (!existsSync(output)) result.errors.push(`Published wiki missing: ${slug}`)
        else
          result.errors.push(
            ...checkDateDisplay(readFileSync(output, 'utf8'), data.created, data.updated).map(
              (error) => `wiki/${slug}: ${error}`,
            ),
          )
      }
    }
  }
  if (result.errors.length) {
    console.error(result.errors.join('\n'))
    process.exitCode = 1
  } else {
    console.log(
      `Site check passed: ${result.pages} HTML pages, ${result.references} internal references`,
    )
  }
}
