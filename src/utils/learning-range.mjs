// 학습 기록의 기간 표기. 학습 기록 페이지와 홈 '더 보기' 행이 같은 값을 쓴다.
const seoulYear = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', timeZone: 'Asia/Seoul' })
const seoulMonth = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  timeZone: 'Asia/Seoul',
})

/** 날짜의 연도(서울 기준). */
export const year = (date) => seoulYear.formatToParts(date).find((p) => p.type === 'year').value

/**
 * 노트의 연도 범위. '2022–2023'처럼 en dash로 잇고, 한 해뿐이면 그 해만 쓴다.
 * @param {{data: {date: Date}}[]} notes
 */
export function noteYearRange(notes) {
  const years = [...new Set(notes.map((n) => year(n.data.date)))].sort()
  return years.length > 1 ? `${years[0]}–${years.at(-1)}` : (years[0] ?? '')
}

/** 'YYYY년 M월'. Intl ko-KR의 '2023년 1월' 표기를 그대로 쓴다. */
export const yearMonth = (date) => seoulMonth.format(date)

/**
 * 위키의 상태별 건수와 만듦·갱신 기간.
 * @param {{data: {status?: string, created: Date, updated?: Date}}[]} wiki
 */
export function wikiRange(wiki) {
  const stable = wiki.filter((w) => w.data.status === 'stable').length
  const times = wiki.map((w) => w.data.created.valueOf())
  const revised = wiki.map((w) => (w.data.updated ?? w.data.created).valueOf())
  return {
    total: wiki.length,
    stable,
    growing: wiki.length - stable,
    from: wiki.length ? yearMonth(new Date(Math.min(...times))) : '',
    to: wiki.length ? yearMonth(new Date(Math.max(...revised))) : '',
  }
}
