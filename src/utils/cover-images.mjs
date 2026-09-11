import imageAssets from '../data/post-cover-images.json' with { type: 'json' }

/** @typedef {{ src: string, width: number, height: number }} CoverVariant */
/** @type {Record<string, { width: number, height: number, variants: CoverVariant[] }>} */
const coverImages = imageAssets

/**
 * Only registered, generated files get responsive variants. A CMS upload keeps
 * its original URL; we never guess that a smaller sibling file exists.
 * @param {string} src
 * @param {boolean} [thumbnail]
 */
export function getCoverImageAttributes(src, thumbnail = false) {
  const asset = Object.hasOwn(coverImages, src) ? coverImages[src] : undefined
  if (!asset) return { width: 1480, height: 1000 }
  return {
    width: asset.width,
    height: asset.height,
    srcset: asset.variants.map((variant) => `${variant.src} ${variant.width}w`).join(', '),
    sizes: thumbnail
      ? '(max-width: 640px) 88px, 144px'
      : '(max-width: 640px) min(calc(100vw - 40px), 18rem), (max-width: 1100px) 46vw, 500px',
  }
}
