// 플랫폼·언어 이름만 같다는 이유로 개념이 다른 문서를 추천하지 않는다.
// 빈도에 따라 의미가 달라지는 집합이 아니다. 태그 어휘를 늘릴 때 검토한다.
export const BROAD_READING_TAGS = new Set(['java', 'oracle', 'sql', 'spring', 'react', '레거시'])

const pathOf = (entry) => `/${entry.collection}/${entry.id}/`
const normalizedTags = (entry) => new Set(entry.data.tags.map((tag) => tag.trim().toLowerCase()))

/** 현재 콘텐츠에서 쓰는 Markdown 인라인 내부 링크를 본문 순서대로 읽는다. */
export function internalReadingLinks(body = '') {
  const prose = body
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*(?:\n|$)/gm, '')
    .replace(/(`+)[\s\S]*?\1/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  return [
    ...new Set(
      [
        ...prose.matchAll(
          /(?<!!)\[[^\]\n]*\]\((\/(?:wiki|posts)\/[a-z0-9-]+)\/?(?:[?#][^\s)]*)?(?:\s+"[^"]*")?\)/g,
        ),
      ].map((match) => `${match[1]}/`),
    ),
  ]
}

/**
 * 역링크는 보존하고, 명시 링크와 구체 개념이 겹치는 문서만 이어 읽기로 고른다.
 * @template {{collection: string, id: string, body?: string, data: {title: string, tags: string[], draft?: boolean, topic?: string}}} T
 * @param {T[]} pool
 * @param {T} current
 * @param {number} limit
 */
export function selectWikiReading(pool, current, limit = 3) {
  const currentURL = pathOf(current)
  const candidates = pool.filter((entry) => !entry.data.draft && pathOf(entry) !== currentURL)
  // 기존의 실제 본문 참조 목록과 순서는 변경하지 않는다.
  const references = candidates.filter((entry) => entry.body?.includes(currentURL))
  const referencePaths = new Set(references.map(pathOf))
  const eligible = candidates.filter((entry) => !referencePaths.has(pathOf(entry)))
  const byPath = new Map(eligible.map((entry) => [pathOf(entry), entry]))
  const forward = internalReadingLinks(current.body).flatMap((path) => {
    const entry = byPath.get(path)
    return entry ? [entry] : []
  })
  const forwardPaths = new Set(forward.map(pathOf))
  const currentTags = normalizedTags(current)
  const automatic = eligible
    .filter((entry) => !forwardPaths.has(pathOf(entry)))
    .map((entry) => {
      const shared = [...normalizedTags(entry)].filter((tag) => currentTags.has(tag))
      return {
        entry,
        specific: shared.filter((tag) => !BROAD_READING_TAGS.has(tag)).length,
        broad: shared.filter((tag) => BROAD_READING_TAGS.has(tag)).length,
        sameTopic: Number(Boolean(current.data.topic) && entry.data.topic === current.data.topic),
      }
    })
    .filter(({ specific }) => specific > 0)
    .sort(
      (a, b) =>
        b.specific - a.specific ||
        b.broad - a.broad ||
        b.sameTopic - a.sameTopic ||
        a.entry.data.title.localeCompare(b.entry.data.title, 'ko') ||
        pathOf(a.entry).localeCompare(pathOf(b.entry)),
    )
    .map(({ entry }) => entry)
  return { references, related: [...forward, ...automatic].slice(0, Math.max(0, limit)) }
}
