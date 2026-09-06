/**
 * URL input is untrusted; only known facets/groups and positive integer pages survive.
 * @param {string} search
 * @param {{categories: string[], languages: string[], groups: Record<string, number>}} choices
 */
export function readAlgorithmState(search, { categories, languages, groups }) {
  const params = new URLSearchParams(search)
  /** @type {Record<string, number>} */
  const pages = {}
  const category = params.get('type') ?? ''
  const language = params.get('lang') ?? ''
  for (const [id, total] of Object.entries(groups)) {
    const value = Number(params.get(`page.${id}`))
    pages[id] = Number.isSafeInteger(value) && value > 0 ? Math.min(value, total) : 1
  }
  return {
    query: (params.get('q') ?? '').slice(0, 200),
    category: categories.includes(category) ? category : '',
    language: languages.includes(language) ? language : '',
    pages,
    expanded: params.has('open')
      ? [
          ...new Set(
            params
              .get('open')
              .split(',')
              .filter((id) => Object.hasOwn(groups, id)),
          ),
        ]
      : undefined,
  }
}

/** Replace our own keys only: tracking parameters and anchors belong to the visitor. */
export function writeAlgorithmState(href, { query, category, language, pages, expanded }) {
  const url = new URL(href)
  for (const key of [...url.searchParams.keys()])
    if (['q', 'type', 'lang', 'open'].includes(key) || key.startsWith('page.'))
      url.searchParams.delete(key)
  if (query.trim()) url.searchParams.set('q', query.trim())
  if (category) url.searchParams.set('type', category)
  if (language) url.searchParams.set('lang', language)
  for (const [id, page] of Object.entries(pages))
    if (page > 1) url.searchParams.set(`page.${id}`, String(page))
  if (expanded !== undefined) url.searchParams.set('open', expanded.join(','))
  return url
}
