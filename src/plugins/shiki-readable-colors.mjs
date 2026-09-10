// github-light의 세 토큰은 사이트의 #f7f8fa 배경에서 4.5:1에 못 미친다.
// 문법별 색 구분은 유지한다. 다크 주석도 실제 #24292e 배경에 맞춰 밝힌다.
export const readableLightColors = {
  '#d73a49': '#bc3040',
  '#22863a': '#1a7530',
  '#e36209': '#b34c00',
}
export const readableDarkComment = '#9aa4b0'

export default function readableCodeColors() {
  return {
    name: 'daedaem-readable-code-colors',
    span(node) {
      const style = node.properties.style
      if (typeof style !== 'string') return
      node.properties.style = style
        .replace(/(^|;)color:(#[\da-f]{6})(?=;|$)/gi, (match, separator, color) =>
          readableLightColors[color.toLowerCase()]
            ? `${separator}color:${readableLightColors[color.toLowerCase()]}`
            : match,
        )
        .replace(/--shiki-dark:#6a737d(?=;|$)/gi, `--shiki-dark:${readableDarkComment}`)
    },
  }
}
