/** Approved cover concepts; an unlisted article never borrows another article's cover. */
export const EDITORIAL_COVERS = Object.freeze({
  'null-and-empty-string-sync-failure': 'null',
  'address-search-9s-to-100ms': 'query',
  'retire-flash-module-by-integration': 'legacy',
})

export function editorialCover(id) {
  return Object.hasOwn(EDITORIAL_COVERS, id) ? EDITORIAL_COVERS[id] : undefined
}

/** Presentation only: joining all three parts reproduces the original title exactly. */
export function splitEditorialTitle(title) {
  const index = title.indexOf(': ')
  return index < 0
    ? { main: title, separator: '', subtitle: '' }
    : { main: title.slice(0, index), separator: ': ', subtitle: title.slice(index + 2) }
}
