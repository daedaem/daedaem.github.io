export function selectDocuments(
  docs,
  { query = '', topic = '', status = '', sort = 'updated', page = 1, pageSize = 12 } = {},
) {
  const words = query.normalize('NFKC').toLocaleLowerCase('ko').trim().split(/\s+/).filter(Boolean)
  const matching = docs
    .filter((doc) => {
      const haystack = `${doc.title} ${doc.description} ${doc.tags.join(' ')}`
        .normalize('NFKC')
        .toLocaleLowerCase('ko')
      return (
        (!topic || doc.topic === topic) &&
        (!status || doc.status === status) &&
        words.every((word) => haystack.includes(word))
      )
    })
    .sort((a, b) =>
      sort === 'title'
        ? a.title.localeCompare(b.title, 'ko') || a.id.localeCompare(b.id)
        : b.updated - a.updated || a.title.localeCompare(b.title, 'ko'),
    )
  const pages = Math.max(1, Math.ceil(matching.length / pageSize))
  const current = Math.min(pages, Math.max(1, Math.floor(Number(page) || 1)))
  return {
    items: matching.slice((current - 1) * pageSize, current * pageSize),
    total: matching.length,
    pages,
    page: current,
  }
}
