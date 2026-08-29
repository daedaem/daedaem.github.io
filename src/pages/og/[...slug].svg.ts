import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { SITE } from '@/consts'

/** 한 줄에 들어갈 대략적인 글자 수. 한글 기준으로 잡는다. */
const PER_LINE = 17

function wrap(text: string, max = PER_LINE, lines = 3): string[] {
  const out: string[] = []
  let cur = ''
  for (const ch of text) {
    if (cur.length >= max) {
      out.push(cur)
      cur = ''
      if (out.length === lines) break
    }
    cur += ch
  }
  if (cur && out.length < lines) out.push(cur)
  if (out.length === lines && text.length > lines * max) {
    out[lines - 1] = out[lines - 1].slice(0, max - 1) + '…'
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
  <text x="80" y="120" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="26" font-weight="600" fill="#1f5fd0">${esc(kicker)}</text>
  <text y="250" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="60" font-weight="700" fill="#191f28" letter-spacing="-2">${rows}</text>
  <text x="80" y="558" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="28" font-weight="600" fill="#191f28">${esc(SITE.title)}</text>
  <text x="80" y="592" font-family="'Apple SD Gothic Neo','Noto Sans KR',sans-serif" font-size="22" fill="#8b95a1">${esc(SITE.tagline)}</text>
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

export const GET: APIRoute = ({ props }) =>
  new Response(card(props.title as string, props.kicker as string), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
