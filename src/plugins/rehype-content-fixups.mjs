/**
 * 마크다운 렌더 결과를 손보는 작은 처리들.
 * - 표를 .table 래퍼(tabindex=0, aria-label "표 n")로 감싸 좁은 화면에서 표만 가로 스크롤되게 하고
 *   키보드로도 넘길 수 있게 한다. 머리 칸에는 scope를 붙인다(행 사이 공백 노드도 정리)
 * - 코드 블록(pre.astro-code)에 tabindex=0과 aria-label "코드: 언어"를 붙여 키보드로 넘길 수 있게 한다.
 *   role은 붙이지 않는다(랜드마크 중복 방지). 복사 버튼은 BaseLayout의 스크립트가 pre에 붙인다
 * - 외부 이미지에 지연 로딩을 붙이고, URL을 그대로 alt에 넣은 것은 빈 alt로 바꾼다
 */
function walk(node, parent, fn) {
  fn(node, parent)
  if (node.children) for (const c of [...node.children]) walk(c, node, fn)
}

const STRUCTURAL = ['table', 'thead', 'tbody', 'tfoot', 'tr', 'colgroup']

export default function rehypeContentFixups() {
  return (tree) => {
    let tables = 0
    walk(tree, null, (node, parent) => {
      if (node.type !== 'element' || !parent) return

      if (node.tagName === 'table' && !(parent.properties?.className ?? []).includes('table')) {
        tables += 1
        // 행 사이의 공백 텍스트는 rehype-raw가 표 밖으로 밀어내 빈 줄만 남기므로 미리 지운다
        walk(node, null, (n) => {
          if (n.children && STRUCTURAL.includes(n.tagName))
            n.children = n.children.filter((c) => !(c.type === 'text' && !c.value.trim()))
        })
        // 머리 행(thead)의 th는 열 머리, 몸통 행의 th는 행 머리다
        for (const section of node.children) {
          if (!STRUCTURAL.includes(section.tagName)) continue
          const rows = section.tagName === 'tr' ? [section] : (section.children ?? [])
          for (const row of rows) {
            for (const cell of row.children ?? []) {
              if (cell.tagName !== 'th' || cell.properties?.scope) continue
              cell.properties = {
                ...(cell.properties ?? {}),
                scope: section.tagName === 'thead' ? 'col' : 'row',
              }
            }
          }
        }
        const i = parent.children.indexOf(node)
        parent.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: {
            className: ['table', 'table-scroll'],
            tabIndex: 0,
            ariaLabel: `표 ${tables}`,
          },
          children: [node],
        }
        return
      }

      // Shiki는 class·tabindex를 속성 이름 그대로 둔다
      if (node.tagName === 'pre') {
        const p = node.properties ?? (node.properties = {})
        const classes = [p.className, p.class].flat().filter(Boolean).join(' ')
        if (!/\bastro-code\b/.test(classes)) return
        const lang = String(p.dataLanguage ?? p['data-language'] ?? '')
        if (p.tabindex === undefined && p.tabIndex === undefined) p.tabindex = '0'
        p.ariaLabel ??= lang && lang !== 'plaintext' ? `코드: ${lang}` : '코드'
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
