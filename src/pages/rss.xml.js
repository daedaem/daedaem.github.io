import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '@/consts'
import { formatDate } from '@/utils/format'

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft)
  const wiki = await getCollection('wiki', ({ data }) => !data.draft)

  const items = [
    ...posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/posts/${p.id}/`,
    })),
    ...wiki.map((w) => ({
      title: `[위키] ${w.data.title}`,
      // 위키는 갱신 알림도 전한다. created를 검증 없이 블로그 최초 공개일로 취급하지 않는다.
      description: `${w.data.description} (최초 작성 ${formatDate(w.data.created)}${w.data.updated ? ` · 최근 갱신 ${formatDate(w.data.updated)}` : ''})`,
      pubDate: w.data.updated ?? w.data.created,
      link: `/wiki/${w.id}/`,
    })),
  ].sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    customData: '<language>ko</language>',
    items,
  })
}
