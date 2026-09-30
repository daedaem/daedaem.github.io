// 단면(cutaway) 표지. 글 하나에 그림 하나, 밝은 판과 어두운 판을 같은 장면에서 뽑았다.
// 파일은 public/uploads/post-covers/cut-<kind>[-768|-320][-dark].webp. 글 본문과 메타데이터는 콘텐츠 컬렉션에 그대로 둔다.
const covers = {
  'retire-flash-module-by-integration': 'flash',
  'disk-99-percent-check-before-expanding': 'disk',
  'phantom-batch-after-was-migration': 'phantom',
  'null-and-empty-string-sync-failure': 'nullsync',
  'integer-overflow-negative-amount': 'overflow',
  'address-search-9s-to-100ms': 'address',
}
const kinds = new Set(Object.values(covers))
const WIDTHS = [320, 768, 1440]

export function isometricCoverForSlug(slug) {
  return Object.hasOwn(covers, slug) ? covers[slug] : undefined
}

function variant(kind, width, dark) {
  const size = width === 1440 ? '' : `-${width}`
  return `/uploads/post-covers/cut-${kind}${size}${dark ? '-dark' : ''}.webp`
}

/** @param {string | undefined} kind */
export function isometricCoverSources(kind) {
  if (!kind || !kinds.has(kind)) return undefined
  const set = (dark) => ({
    src: variant(kind, 1440, dark),
    srcset: WIDTHS.map((w) => `${variant(kind, w, dark)} ${w}w`).join(', '),
  })
  return { width: 1440, height: 960, light: set(false), dark: set(true) }
}
