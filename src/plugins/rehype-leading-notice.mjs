/**
 * 사례 글(src/content/posts) 첫머리의 인용문(blockquote)은 본문이 아니라 고지다
 * (예시 표기·정정 안내). 본문 첫 문단이나 첫 제목보다 앞에 오는 인용문을 <aside class="notice">로
 * 바꿔 글 머리(원인 한 줄 아래)에서 본문 크기로 보이게 한다. 본문 중간의 인용문은 그대로 둔다.
 * 다른 컬렉션에는 적용하지 않는다.
 */
export default function rehypeLeadingNotice() {
  return (tree, file) => {
    const path = String(file.path ?? file.history?.[0] ?? '')
    if (!path.includes('/content/posts/')) return
    for (const node of tree.children) {
      if (node.type === 'text' && !node.value.trim()) continue
      if (node.type !== 'element' || node.tagName !== 'blockquote') break
      node.tagName = 'aside'
      node.properties = { ...(node.properties ?? {}), className: ['notice'] }
    }
  }
}
