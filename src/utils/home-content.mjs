// 처음 읽을 글의 순서와 읽을거리 안내. 글의 사실·공개 여부는 원문이 결정한다.
export const HOME_READING_PICKS = [
  {
    id: 'null-and-empty-string-sync-failure',
    readingNote:
      'Java와 SQL의 변경 판정, 항목별 데이터 소유권. 같은 증상으로 보이던 두 원인을 분리한 과정.',
    causeSummary:
      'SQL이 NULL과 실제 값 사이의 변경을 놓쳤고, 상대가 관리하는 항목까지 변경 감지에 들어가 있었다.',
  },
  {
    id: 'address-search-9s-to-100ms',
    readingNote:
      '조회 시간을 9초에서 1초대로 줄인 뒤에도, 주소 데이터의 관리 방식을 다시 선택한 이유.',
  },
  {
    id: 'retire-flash-module-by-integration',
    readingNote: '재개발 대신 기존 연동을 선택하며, 계약 상태와 실패 시 되돌림을 설계한 과정.',
  },
]

/**
 * 추천 3편과 그 외 글은 겹치지 않는다. 입력의 발행일 정렬을 그대로 보존한다.
 * @template {{id: string, data: {draft?: boolean}}} T
 * @param {T[]} posts
 */
export function selectHomeContent(posts) {
  const published = posts.filter((post) => !post.data.draft)
  const byId = new Map(published.map((post) => [post.id, post]))
  const recommended = HOME_READING_PICKS.flatMap((pick) => {
    const post = byId.get(pick.id)
    return post ? [{ ...post, readingNote: pick.readingNote, causeSummary: pick.causeSummary }] : []
  })
  const ids = new Set(recommended.map((post) => post.id))
  return { recommended, rest: published.filter((post) => !ids.has(post.id)) }
}

/**
 * 날짜가 같은 문서도 제목·ID로 순서가 고정된다. 원본 배열은 변경하지 않는다.
 * @template {{id: string, data: {draft?: boolean, title: string, created: Date, updated?: Date}}} T
 * @param {T[]} entries
 * @param {number} limit
 */
export function selectRecentWiki(entries, limit = 3) {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort(
      (a, b) =>
        (b.data.updated ?? b.data.created).valueOf() -
          (a.data.updated ?? a.data.created).valueOf() ||
        a.data.title.localeCompare(b.data.title, 'ko') ||
        a.id.localeCompare(b.id),
    )
    .slice(0, limit)
}
