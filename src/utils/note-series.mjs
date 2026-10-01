/** 원문 제목의 장 번호를 보존한다. 작성일/파일명 순서로 추측하지 않는다. */
export const NOTE_SERIES = [
  {
    id: 'typescript',
    title: 'TypeScript',
    chapters: [
      ['0', 'typescript-00-overview'],
      ['1', 'typescript-01-types'],
      ['2', 'typescript-02-compiler-and-config'],
      ['3.1', 'typescript-03-classes'],
      ['3.2', 'typescript-04-interfaces'],
      ['4', 'typescript-05-advanced-types'],
    ],
  },
  {
    id: 'core-javascript',
    title: '코어 자바스크립트',
    chapters: [
      ['1', 'core-javascript-01-data-types'],
      ['2', 'core-javascript-02-execution-context'],
      ['3', 'core-javascript-03-this'],
      ['4', 'core-javascript-04-callback'],
      ['5', 'core-javascript-05-closure'],
      ['6', 'core-javascript-06-prototype'],
      ['7', 'core-javascript-07-class'],
    ],
  },
  {
    id: 'modern-js-deep-dive',
    title: '모던 JS Deep Dive',
    chapters: [
      ['1', 'modern-js-deep-dive-01-programming'],
      ['2', 'modern-js-deep-dive-02-what-is-javascript'],
      ['4', 'modern-js-deep-dive-04-variables'],
      ['5', 'modern-js-deep-dive-05-expressions-and-statements'],
    ],
  },
]

/** @template {{ id: string }} T @param {T[]} notes */
export function orderedNoteSeries(notes) {
  const byId = new Map(notes.map((note) => [note.id, note]))
  return NOTE_SERIES.map((series) => ({
    id: series.id,
    title: series.title,
    chapters: series.chapters.map(([chapter, id]) => {
      const note = byId.get(id)
      if (!note) throw new Error(`시리즈 문서가 없습니다: ${id}`)
      return { chapter, note }
    }),
  }))
}

/** @param {string} id */
export function noteSeriesPosition(id) {
  for (const series of NOTE_SERIES) {
    const index = series.chapters.findIndex(([, slug]) => slug === id)
    if (index < 0) continue
    return {
      id: series.id,
      title: series.title,
      chapter: series.chapters[index][0],
      index,
      total: series.chapters.length,
      previous: series.chapters[index - 1]?.[1],
      next: series.chapters[index + 1]?.[1],
    }
  }
  return undefined
}

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
