/** 목록용 날짜. 연도와 서울 기준 날짜를 보존하고 표시 폭만 줄인다. */
export function formatCompactDate(date) {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).formatToParts(date)
  return ['year', 'month', 'day'].map((key) => parts.find((p) => p.type === key).value).join('.')
}
