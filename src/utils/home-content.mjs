// 사용자가 확인한 성과 문구. 본문이나 공개 여부를 대신 결정하지 않는다.
export const HOME_PROOFS = [
  {
    id: 'null-and-empty-string-sync-failure',
    text: '5년 넘게 남아 있던 시스템 간 동기화 오류의 원인 두 가지를 규명',
  },
  {
    id: 'retire-flash-module-by-integration',
    text: '지원이 끝난 Flash 계약 모듈을 다시 만들지 않고 기존 시스템 연동으로 대체',
  },
  {
    id: 'staged-auth-and-password-migration',
    text: '로그인 인증을 단계로 재설계하고 비밀번호 저장 방식을 이행',
  },
]

/**
 * 최신순 글을 받아 홈의 각 영역에 중복 없이 배치한다.
 * @template {{id: string, data: {draft?: boolean, featured?: boolean}}} T
 * @param {T[]} posts
 */
export function selectHomeContent(posts) {
  const published = posts.filter((post) => !post.data.draft)
  const featured = published.find((post) => post.data.featured) ?? published[0]
  const ids = new Set(published.map((post) => post.id))
  const proofs = HOME_PROOFS.filter((proof) => ids.has(proof.id) && proof.id !== featured?.id)
  const used = new Set([featured?.id, ...proofs.map((proof) => proof.id)])
  return { featured, proofs, rest: published.filter((post) => !used.has(post.id)) }
}
