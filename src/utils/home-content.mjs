// 지원서에서 먼저 보여 줄 우선순위. 본문이나 공개 여부를 대신 결정하지 않는다.
export const HOME_PROOFS = [
  {
    id: 'null-and-empty-string-sync-failure',
    text: '5년 넘게 남아 있던 시스템 간 동기화 오류의 원인 두 가지를 규명',
  },
  {
    id: 'address-search-9s-to-100ms',
    text: '600만 건 주소 조회를 9초에서 1초대로 개선하고, 수기 데이터 적재를 외부 조회로 대체',
  },
  {
    id: 'retire-flash-module-by-integration',
    text: '지원이 끝난 Flash 계약 모듈을 다시 만들지 않고 기존 시스템 연동으로 대체',
  },
]

/**
 * 성과는 지정한 우선순위를 지킨다. 대표 카드는 성과에 없는 글 중 featured 또는 최신 글.
 * @template {{id: string, data: {draft?: boolean, featured?: boolean}}} T
 * @param {T[]} posts
 */
export function selectHomeContent(posts) {
  const published = posts.filter((post) => !post.data.draft)
  const ids = new Set(published.map((post) => post.id))
  const proofs = HOME_PROOFS.filter((proof) => ids.has(proof.id))
  const proofIds = new Set(proofs.map((proof) => proof.id))
  const remaining = published.filter((post) => !proofIds.has(post.id))
  const featured = remaining.find((post) => post.data.featured) ?? remaining[0]
  return { featured, proofs, rest: remaining.filter((post) => post.id !== featured?.id) }
}
