import { Resvg } from '@resvg/resvg-js'
import path from 'node:path'
import type { APIRoute, GetStaticPaths } from 'astro'
import { getCollection } from 'astro:content'
import { SITE } from '@/consts'
import { renderOgCard } from '@/utils/og-card.mjs'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('posts', ({ data }) => !data.draft)
  const wiki = await getCollection('wiki', ({ data }) => !data.draft)
  return [
    { params: { slug: 'site' }, props: { title: SITE.identityTitle, kicker: SITE.title } },
    ...posts.map((p) => ({
      params: { slug: `posts/${p.id}` },
      props: { title: p.data.title, kicker: '글' },
    })),
    ...wiki.map((w) => ({
      params: { slug: `wiki/${w.id}` },
      props: { title: w.data.title, kicker: '위키' },
    })),
  ]
}

/**
 * 링크 미리보기 크롤러(카카오톡·페이스북 등)는 SVG를 렌더하지 못하므로 PNG로 래스터화한다.
 * 빌드 환경에 한글 폰트가 없을 수 있어 Pretendard를 저장소에 두고 직접 싣는다.
 */
// 빌드 시 이 모듈은 번들로 옮겨져 import.meta.url 기준 상대 경로가 어긋난다. 프로젝트 루트 기준으로 잡는다.
const font = (w: string) => path.join(process.cwd(), 'src/assets/og-fonts', `Pretendard-${w}.ttf`)

export const GET: APIRoute = ({ props }) => {
  const svg = renderOgCard({
    title: props.title as string,
    kicker: props.kicker as string,
    siteTitle: SITE.title,
    identityTitle: SITE.identityTitle,
    subtitle: SITE.motto,
  })
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
