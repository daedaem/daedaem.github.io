/**
 * 번호 순서가 명시된 시리즈만 장 순으로 정렬한다. 원본과 날짜는 바꾸지 않는다.
 * @template {{id: string}} T
 * @param {T[]} entries
 * @param {{prefix?: string, chapterOrder?: boolean}} series
 * @returns {T[]}
 */
export function orderNoteSeries(entries, series) {
  if (!series.chapterOrder || !series.prefix) return [...entries]
  const chapter = (entry) => {
    if (!entry.id.startsWith(series.prefix)) return Infinity
    const number = entry.id.slice(series.prefix.length).match(/^(\d+)-/)
    return number ? Number(number[1]) : Infinity
  }
  // 번호가 없는 부록이나 같은 장 번호는 입력의 시간순을 그대로 유지한다.
  return [...entries].sort((a, b) => chapter(a) - chapter(b) || 0)
}
