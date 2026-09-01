import { Resvg } from '@resvg/resvg-js'
import path from 'node:path'
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { SITE } from '@/consts'

/** 한 줄에 들어갈 대략적인 글자 수. 한글 기준으로 잡는다. */
const PER_LINE = 17

/** 어절 단위로 줄을 나눈다. 한 어절이 한 줄을 넘으면 그때만 글자 단위로 자른다. */
function wrap(text: string, max = PER_LINE, lines = 3): string[] {
  const out: string[] = []
  let cur = ''
  const push = () => {
    if (cur) out.push(cur)
    cur = ''
  }
  for (const word of text.split(/\s+/)) {
    if (word.length > max) {
      push()
      for (let i = 0; i < word.length; i += max) out.push(word.slice(i, i + max))
      continue
    }
    const next = cur ? `${cur} ${word}` : word
    if (next.length > max) push()
    cur = cur ? `${cur} ${word}` : word
  }
  push()
  if (out.length > lines) {
    const kept = out.slice(0, lines)
    kept[lines - 1] = kept[lines - 1].slice(0, max - 1).trimEnd() + '…'
    return kept
  }
  return out
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function card(title: string, kicker: string) {
  const lines = wrap(title)
  const rows = lines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 74}">${esc(l)}</tspan>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect x="0" y="0" width="1200" height="8" fill="#1f5fd0"/>
  <text x="80" y="120" font-family="Pretendard" font-size="26" font-weight="600" fill="#1f5fd0">${esc(kicker)}</text>
  <text y="250" font-family="Pretendard" font-size="60" font-weight="700" fill="#191f28" letter-spacing="-2">${rows}</text>
  <!-- 사이트 마크: 쌓인 층을 지나 바닥의 점에 닿는다 (src/components/Mark.astro와 같은 형태) -->
  <g transform="translate(80 520) scale(2.4)" fill="none" stroke="#191f28" stroke-width="2.4" stroke-linecap="round">
    <path d="M4 6h9M4 12h7M4 18h5"/>
    <path d="M18 3v14"/>
    <circle cx="18" cy="20.2" r="1.9" fill="#1f5fd0" stroke="none"/>
  </g>
  <text x="150" y="558" font-family="Pretendard" font-size="28" font-weight="600" fill="#191f28">${esc(SITE.title)}</text>
  <text x="150" y="592" font-family="Pretendard" font-size="22" fill="#6b7583">${esc(SITE.tagline)}</text>
</svg>`
}

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft)
  const wiki = await getCollection('wiki', ({ data }) => !data.draft)
  return [
    { params: { slug: 'site' }, props: { title: SITE.tagline, kicker: SITE.title } },
    ...posts.map(p => ({ params: { slug: `posts/${p.id}` }, props: { title: p.data.title, kicker: '글' } })),
    ...wiki.map(w => ({ params: { slug: `wiki/${w.id}` }, props: { title: w.data.title, kicker: '위키' } })),
  ]
}

/**
 * 링크 미리보기 크롤러(카카오톡·페이스북 등)는 SVG를 렌더하지 못하므로 PNG로 래스터화한다.
 * 빌드 환경에 한글 폰트가 없을 수 있어 Pretendard를 저장소에 두고 직접 싣는다.
 */
// 빌드 시 이 모듈은 번들로 옮겨져 import.meta.url 기준 상대 경로가 어긋난다. 프로젝트 루트 기준으로 잡는다.
const font = (w: string) => path.join(process.cwd(), 'src/assets/og-fonts', `Pretendard-${w}.ttf`)

export const GET: APIRoute = ({ props }) => {
  const svg = card(props.title as string, props.kicker as string)
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: 'Pretendard',
      fontFiles: [font('Regular'), font('SemiBold'), font('Bold')],
    },
  })
    .render()
    .asPng()
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
