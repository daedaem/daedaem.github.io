// 같은 전환 작업을 나눠 적은 글의 묶음. frontmatter series 필드가 없어(콘텐츠 수정 금지) 코드에 둔다.
// 두 글 본문이 서로를 링크한다(retire-flash-module-by-integration 56행 · integer-overflow-negative-amount 18행).
export const RELATED_RECORDS = [
  ['retire-flash-module-by-integration', 'integer-overflow-negative-amount'],
]

/**
 * 같은 묶음의 다른 글 id. 묶음에 없으면 빈 배열.
 * @param {string} id
 * @returns {string[]}
 */
export function relatedRecordIds(id) {
  return RELATED_RECORDS.filter((group) => group.includes(id)).flatMap((group) =>
    group.filter((other) => other !== id),
  )
}
