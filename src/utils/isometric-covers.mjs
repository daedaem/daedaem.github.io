// Approved s4 illustrations. Metadata and article bodies stay in the content collection.
const covers = {
  'retire-flash-module-by-integration': 'flash',
  'disk-99-percent-check-before-expanding': 'disk',
  'phantom-batch-after-was-migration': 'phantom',
  'null-and-empty-string-sync-failure': 'nullsync',
  'integer-overflow-negative-amount': 'overflow',
  'address-search-9s-to-100ms': 'address',
}
export function isometricCoverForSlug(slug) {
  return Object.hasOwn(covers, slug) ? covers[slug] : undefined
}
