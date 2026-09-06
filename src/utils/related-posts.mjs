/**
 * Static recommendations: category, shared tags, then publication date.
 * @template {{id: string, data: {tags: string[], category: string, date: Date, draft?: boolean}}} T
 * @param {T[]} posts
 * @param {T} current
 * @param {(string | undefined)[]} excludedIds
 */
export function selectRelatedPosts(posts, current, excludedIds = [], limit = 3) {
  const excluded = new Set([current.id, ...excludedIds])
  const tags = new Set(current.data.tags.map((tag) => tag.toLowerCase()))
  return posts
    .filter((post) => !post.data.draft && !excluded.has(post.id))
    .map((post) => ({
      post,
      category: Number(post.data.category === current.data.category),
      shared: post.data.tags.filter((tag) => tags.has(tag.toLowerCase())).length,
    }))
    .sort(
      (a, b) =>
        b.category - a.category ||
        b.shared - a.shared ||
        b.post.data.date.valueOf() - a.post.data.date.valueOf() ||
        a.post.id.localeCompare(b.post.id),
    )
    .slice(0, limit)
    .map(({ post }) => post)
}
