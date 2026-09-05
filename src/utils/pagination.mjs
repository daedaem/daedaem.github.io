/**
 * 처음·끝과 현재 쪽 주변만 남긴다. 최대 다섯 번호라 좁은 화면에서도 터치 크기를 유지한다.
 * @param {number} total
 * @param {number} current
 */
export function paginationWindow(total, current) {
  const last = Math.max(1, Math.floor(total))
  const active = Math.max(1, Math.min(last, Math.floor(current)))
  const start = Math.max(1, Math.min(active - 1, last - 2))
  const numbers = [
    ...new Set([1, start, Math.min(start + 1, last), Math.min(start + 2, last), last]),
  ].sort((a, b) => a - b)
  const gapBefore = numbers.filter((number, index) => index > 0 && number > numbers[index - 1] + 1)
  return { numbers, gapBefore }
}
