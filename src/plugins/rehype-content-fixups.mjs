/**
 * 마크다운 렌더 결과를 손보는 작은 처리들.
 * - 표를 .table-scroll로 감싸 좁은 화면에서 표만 가로 스크롤되게 한다(행 사이 공백 노드도 정리)
 * - 외부 이미지에 지연 로딩을 붙이고, URL을 그대로 alt에 넣은 것은 빈 alt로 바꾼다
 */
function walk(node, parent, fn) {
  fn(node, parent)
  if (node.children) for (const c of [...node.children]) walk(c, node, fn)
}

export default function rehypeContentFixups() {
  return (tree) => {
    walk(tree, null, (node, parent) => {
      if (node.type !== 'element' || !parent) return

      if (
        node.tagName === 'table' &&
        !(parent.properties?.className ?? []).includes('table-scroll')
      ) {
        // 행 사이의 공백 텍스트는 rehype-raw가 표 밖으로 밀어내 빈 줄만 남기므로 미리 지운다
        walk(node, null, (n) => {
          if (n.children)
            n.children = n.children.filter((c) => !(c.type === 'text' && !c.value.trim()))
        })
        const i = parent.children.indexOf(node)
        parent.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        }
        return
      }

      if (node.tagName === 'img') {
        const p = node.properties ?? (node.properties = {})
        const src = String(p.src ?? '')
        if (!/^https?:\/\//.test(src)) return
        p.loading ??= 'lazy'
        p.decoding ??= 'async'
        if (p.alt === undefined || String(p.alt) === src) p.alt = ''
      }
    })
  }
}
