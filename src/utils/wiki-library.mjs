/**
 * 칩에 보일 건수. 한 축의 건수는 검색어와 다른 축의 조건 아래에서 센다(자기 축은 무시).
 * 그래야 Spring을 고른 뒤 상태 칩이 "정리됨 2 · 보완 중 0"처럼 실제로 나올 편수를 보인다.
 * @returns {{ topic: Record<string, number>, status: Record<string, number> }}
 *   빈 문자열 키('')는 그 축의 '전체' 건수다.
 */
export function facetCounts(docs, { query = '', topic = '', status = '' } = {}) {
  const words = query.normalize('NFKC').toLocaleLowerCase('ko').trim().split(/\s+/).filter(Boolean)
  const searched = docs.filter((doc) => {
    const haystack = `${doc.title} ${doc.description} ${doc.tags.join(' ')}`
      .normalize('NFKC')
      .toLocaleLowerCase('ko')
    return words.every((word) => haystack.includes(word))
  })
  const tally = (list, key) => {
    const counts = { '': list.length }
    for (const doc of list) counts[doc[key]] = (counts[doc[key]] ?? 0) + 1
    return counts
  }
  return {
    topic: tally(
      searched.filter((doc) => !status || doc.status === status),
      'topic',
    ),
    status: tally(
      searched.filter((doc) => !topic || doc.topic === topic),
      'status',
    ),
  }
}

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
