// 처음 읽을 글의 순서와 읽을거리 안내. 경험의 근거는 작성자가 확인한 사실이며, 원문도 정정 대상이다.
export const HOME_READING_PICKS = [
  {
    id: 'null-and-empty-string-sync-failure',
    readingNote:
      'NULL·빈 문자열 비교와 인터페이스 처리 구분값. 반복 결재를 만들던 두 오류를 각각 수정한 과정.',
    causeSummary: '빈 값 비교와 처리 구분값의 규약이 맞지 않아 수신값이 정상 반영되지 않았다.',
  },
  {
    id: 'address-search-9s-to-100ms',
    readingNote:
      '조회 시간을 9초에서 1초대로 줄인 뒤에도, 주소 데이터의 관리 방식을 다시 선택한 이유.',
  },
  {
    id: 'retire-flash-module-by-integration',
    readingNote: '기존 API 연동에 맞춘 업무 로직 개발과 계약 상태 동기화, 적재 실패 복구 과정.',
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
