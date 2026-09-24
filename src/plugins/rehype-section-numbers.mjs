/**
 * 사례 글(src/content/posts)의 h2마다 절 번호 라벨("01")을 붙인다.
 * 글쓴이가 "1. 제목"처럼 이미 번호를 붙였고 그 번호가 순서와 같으면, 번호를 라벨로 옮기고
 * 제목 글자에서는 지운다(같은 번호가 두 번 보이지 않게). 순서와 다른 번호는 글쓴이의 뜻으로 보고 둔다.
 *
 * 라벨은 raw 노드로 넣는다. Astro의 제목 id·목차 수집(rehypeHeadingIds)이 이 플러그인 뒤에 돌면서
 * 태그 하나로만 된 raw 노드는 제목 글자에서 빼기 때문에, id와 목차 글자에 "01"이 섞이지 않는다.
 * 다른 컬렉션(위키·노트·풀이)에는 번호를 붙이지 않는다.
 */
const OWN_NUMBER = /^\s*(\d+)\.\s+/

export const sectionLabel = (n) => String(n).padStart(2, '0')

function firstText(node) {
  for (const child of node.children ?? []) {
    if (child.type === 'text') return child
    if (child.type === 'element') return firstText(child)
  }
  return null
}

export default function rehypeSectionNumbers() {
  return (tree, file) => {
    const path = String(file.path ?? file.history?.[0] ?? '')
    if (!path.includes('/content/posts/')) return
    // MDX는 raw 노드를 다루지 못하므로 요소로 넣는다(사례 글은 모두 .md다).
    const asElement = path.endsWith('.mdx')
    let n = 0
    for (const node of tree.children) {
      if (node.type !== 'element' || node.tagName !== 'h2') continue
      n += 1
      const label = sectionLabel(n)
      const text = firstText(node)
      const own = text?.value.match(OWN_NUMBER)
      if (own && Number(own[1]) === n) text.value = text.value.slice(own[0].length)
      node.children.unshift(
        asElement
          ? {
              type: 'element',
              tagName: 'span',
              properties: { className: ['hn'], dataPagefindIgnore: '' },
              children: [{ type: 'text', value: label }],
            }
          : { type: 'raw', value: `<span class="hn" data-pagefind-ignore="">${label}</span>` },
      )
    }
  }
}
