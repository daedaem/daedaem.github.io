import { getCollection } from 'astro:content'
import { tagSlug } from './format'

/**
 * 문서가 2건 이상 모인 태그의 슬러그 집합.
 * 1건짜리 태그는 페이지를 만들지 않는다 — 목록이 한 줄뿐인 페이지는 읽을 것도 없고
 * 검색엔진에는 소음이라, 본문에서는 링크 없는 텍스트로 둔다.
 */
let cached: Promise<Set<string>> | undefined

export function linkableTagSlugs(): Promise<Set<string>> {
  cached ??= (async () => {
    const posts = await getCollection('posts', ({ data }) => !data.draft)
    const wiki = await getCollection('wiki', ({ data }) => !data.draft)
    const count = new Map<string, number>()
    for (const doc of [...posts, ...wiki])
      for (const t of doc.data.tags ?? []) {
        const k = tagSlug(t)
        if (k) count.set(k, (count.get(k) ?? 0) + 1)
      }
    return new Set([...count.entries()].filter(([, n]) => n >= 2).map(([k]) => k))
  })()
  return cached
}
