// Shiki가 생성한 정적 16진수 색을 검사한다. 실제 브라우저 접근성 검사를 대체하지 않는다.
export function contrastRatio(first, second) {
  const luminance = (hex) => {
    let digits = hex.slice(1)
    if (digits.length === 3) digits = [...digits].map((c) => c + c).join('')
    return digits
      .match(/../g)
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
      .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
  }
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

export function checkRenderedCodeContrast(html, lightBackground) {
  const errors = new Set()
  const color = (style, property) =>
    style.match(
      new RegExp(`(?:^|;)\\s*${property}:\\s*(#[\\da-f]{6}|#[\\da-f]{3})(?=;|$)`, 'i'),
    )?.[1]
  for (const block of html.matchAll(
    /<pre\b[^>]*class="[^"]*\bastro-code\b[^"]*"[^>]*>[\s\S]*?<\/pre>/g,
  )) {
    const styles = [...block[0].matchAll(/\bstyle="([^"]*)"/g)].map((m) => m[1])
    const darkBackground = color(styles[0] ?? '', '--shiki-dark-bg')
    for (const style of styles) {
      for (const [theme, foreground, background] of [
        ['light', color(style, 'color'), color(style, 'background-color') ?? lightBackground],
        ['dark', color(style, '--shiki-dark'), color(style, '--shiki-dark-bg') ?? darkBackground],
      ]) {
        // pre의 라이트 배경만 전역 --code-bg가 Shiki의 인라인 색을 덮어쓴다.
        const surface = theme === 'light' && style === styles[0] ? lightBackground : background
        if (!foreground || !surface) continue
        const ratio = contrastRatio(foreground, surface)
        if (ratio < 4.5)
          errors.add(`${theme} code ${foreground} on ${surface}: ${ratio.toFixed(3)}:1`)
      }
    }
  }
  return [...errors]
}
