/**
 * 학습 노트(src/content/notes)는 velog 시절 글이라 본문 안에 h1이 여러 개다.
 * 페이지 제목이 이미 h1이므로, 본문에 h1이 있는 노트는 제목 단계를 하나씩 내려
 * 문서당 h1이 하나가 되게 한다. 원문 .md는 건드리지 않는다.
 */
function walk(node, fn) {
  fn(node)
  if (node.children) for (const c of node.children) walk(c, fn)
}

export default function remarkNoteHeadings() {
  return (tree, file) => {
    const path = String(file.path ?? file.history?.[0] ?? '')
    if (!path.includes('/content/notes/')) return

    const headings = []
    walk(tree, (n) => {
      if (n.type === 'heading') headings.push(n)
      // 원문에 직접 쓴 <img>에는 지연 로딩 속성만 붙인다(rehype-raw가 뒤에 돌아 hast에서는 못 본다)
      if (n.type === 'html' && /<img\b/i.test(n.value)) {
        n.value = n.value.replace(
          /<img\b(?![^>]*\bloading=)/gi,
          '<img loading="lazy" decoding="async"',
        )
      }
    })
    if (!headings.some((h) => h.depth === 1)) return
    for (const h of headings) h.depth = Math.min(6, h.depth + 1)
  }
}
