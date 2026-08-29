import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { SITE } from '@/consts'

export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft)
  const wiki = await getCollection('wiki', ({ data }) => !data.draft)

  const items = [
    ...posts.map(p => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/posts/${p.id}/`,
    })),
    ...wiki.map(w => ({
      title: `[위키] ${w.data.title}`,
      description: w.data.description,
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
