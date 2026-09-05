import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, relative, join, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  )

// Astro가 생성한 HTML의 따옴표로 감싼 href/src만 검사한다. 범용 HTML 파서는 아니다.
export function checkSite(root, site) {
  root = resolve(root)
  const errors = []
  let references = 0
  const pages = walk(root).filter((file) => file.endsWith('.html'))
  for (const file of pages) {
    const name = relative(root, file).split(sep).join('/')
    const base = new URL(name.replace(/index\.html$/, ''), site)
    const html = readFileSync(file, 'utf8')
    // 본문 아래 탐색 목록·댓글 안내가 검색어에 걸려 무관한 글이 노출되지 않게 한다.
    for (const tag of html.matchAll(/<(?:section|aside)\b[^>]*>/gi)) {
      if (!/\baria-label=(["'])(?:다른 글|연결된 문서|댓글)\1/.test(tag[0])) continue
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
      if (!frontmatter || !/^draft:\s*true\s*(?:#.*)?$/m.test(frontmatter[1])) continue
      const slug = relative(resolve('src/content', collection), file).replace(/\.mdx?$/, '')
      if (existsSync(join(root, collection, slug, 'index.html'))) {
        result.errors.push(`Draft was generated: ${collection}/${slug}`)
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
