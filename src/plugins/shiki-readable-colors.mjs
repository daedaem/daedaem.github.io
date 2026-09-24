// 코드 색은 VS Code 기본 테마(Light+ / Dark+)를 쓴다. IDE에서 보던 색 구분을 그대로 가져온다.
// 그중 사이트 배경에서 4.5:1에 못 미치는 색만 같은 계열의 더 짙은(다크는 더 밝은) 색으로 바꾼다.
// 라이트는 #f7f8fa, 다크는 Dark+ 배경 #1e1e1e와 사이트 다크 코드 면 #1d2025를 기준으로 계산했다.
export const readableLightColors = {
  '#267f99': '#1f6f86', // 타입·클래스 이름
  '#098658': '#07774e', // 숫자
  '#ee0000': '#d00000', // 정규식 이스케이프 등
}
export const readableDarkColors = {
  '#808080': '#8c8c8c', // 구두점·태그 괄호
}

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
        .replace(/--shiki-dark:(#[\da-f]{6})(?=;|$)/gi, (match, color) =>
          readableDarkColors[color.toLowerCase()]
            ? `--shiki-dark:${readableDarkColors[color.toLowerCase()]}`
            : match,
        )
    },
  }
}
