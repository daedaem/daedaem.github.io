/** Cover choices belong to the article, independently of its URL or home position. */
export const COVER_PRESETS = Object.freeze({
  null: 'NULL 비교',
  query: '주소 조회',
  legacy: 'Flash 연동 전환',
})

export const COVER_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif']

/**
 * Only public, local uploads are cover sources; no remote requests or ambiguous paths.
 * @param {unknown} value
 * @returns {value is string}
 */
export function isLocalCoverImage(value) {
  if (typeof value !== 'string' || !value.startsWith('/uploads/')) return false
  if (/[\s\\%?#\u0000-\u001f]/u.test(value)) return false
  const parts = value.slice('/uploads/'.length).split('/')
  return (
    parts.every((part) => part !== '' && part !== '.' && part !== '..') &&
    COVER_IMAGE_EXTENSIONS.includes(value.split('.').at(-1)?.toLowerCase())
  )
}

/** @typedef {{ kind: string, src?: string }} PostCoverData */

/**
 * @param {{cover?: string | null, coverImage?: string | null}} [data]
 * @returns {PostCoverData | undefined}
 */
export function resolvePostCover(data = {}) {
  if (isLocalCoverImage(data.coverImage)) return { kind: 'image', src: data.coverImage }
  if (typeof data.cover === 'string' && Object.hasOwn(COVER_PRESETS, data.cover)) {
    return { kind: data.cover }
  }
  return undefined
}

/** Presentation only: joining all three parts reproduces the original title exactly. */
export function splitEditorialTitle(title) {
  const index = title.indexOf(': ')
  return index < 0
    ? { main: title, separator: '', subtitle: '' }
    : { main: title.slice(0, index), separator: ': ', subtitle: title.slice(index + 2) }
}
