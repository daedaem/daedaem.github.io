export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Seoul',
  }).format(date)
}

/**
 * 읽는 데 걸리는 시간(분). 한글은 분당 500자를 기준으로 잡는다.
 * 코드 블록은 눈으로 훑는 속도가 달라 별도로 세지 않고 본문에 포함해 계산한다.
 */
export function readingMinutes(body: string): number {
  const chars = body.replace(/\s/g, '').length
  return Math.max(1, Math.round(chars / 500))
}
