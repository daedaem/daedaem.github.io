/** Regenerate only the public favicon derivatives from the approved vector. */
import { readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'
import { MONOGRAM_PATH } from '../src/utils/brand.mjs'

const publicDir = new URL('../public/', import.meta.url)
const svg = readFileSync(new URL('favicon.svg', publicDir), 'utf8')
if (!svg.includes(`d="${MONOGRAM_PATH}"`)) throw new Error('Header and favicon paths differ')
const png = (size) => new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng()
for (const [name, size] of [
  ['favicon-96x96.png', 96],
  ['apple-touch-icon.png', 180],
]) {
  writeFileSync(new URL(name, publicDir), png(size))
}

// ICO supports embedded PNGs. Include native small sizes instead of resizing one large bitmap.
const sizes = [16, 32, 48]
const images = sizes.map(png)
const header = Buffer.alloc(6 + 16 * sizes.length)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = header.length
sizes.forEach((size, index) => {
  const entry = 6 + index * 16
  header[entry] = size
  header[entry + 1] = size
  header.writeUInt16LE(1, entry + 4)
  header.writeUInt16LE(32, entry + 6)
  header.writeUInt32LE(images[index].length, entry + 8)
  header.writeUInt32LE(offset, entry + 12)
  offset += images[index].length
})
writeFileSync(new URL('favicon.ico', publicDir), Buffer.concat([header, ...images]))
console.log('Updated favicon.ico (16/32/48), favicon-96x96.png and apple-touch-icon.png')
