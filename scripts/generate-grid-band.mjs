/**
 * 머리줄 아래 점 격자 띠의 마스크(public/grid-band.png)를 만든다.
 * 시안(design2 final)의 캔버스 점 격자와 같은 규칙: 4px 칸마다 2px 점, 점마다 불투명도 0~0.3,
 * 위에서 아래로 옅어진다. 색은 CSS가 칠하고(--fg), 이 그림은 알파(마스크)만 갖는다.
 * 스크립트 없이 한 번 그린 그림이라 테마가 바뀌어도 다시 그릴 일이 없다.
 * 씨앗값이 고정이라 다시 만들어도 같은 파일이 나온다. 2배 해상도(점 하나 4×4px)로 저장한다.
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const CSS_W = 480
const CSS_H = 40
const SCALE = 2
const W = CSS_W * SCALE
const H = CSS_H * SCALE
// 띠 맨 위의 진하기. 시안에서 머리줄 바로 아래에 보이던 부분(캔버스 100px 중 60px 아래)과 같다
const TOP = 0.55

let seed = 20260924
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 2 ** 32
}

// 회색+알파(색 형식 4), 8비트. 회색은 0, 알파만 쓴다
const raw = Buffer.alloc((W * 2 + 1) * H)
const cells = []
for (let y = 0; y < CSS_H; y += 4) {
  const row = []
  for (let x = 0; x < CSS_W; x += 4) row.push(random() * 0.3)
  cells.push(row)
}
for (let py = 0; py < H; py++) {
  const offset = py * (W * 2 + 1)
  raw[offset] = 0
  const cy = Math.floor(py / SCALE)
  const fade = TOP * (1 - cy / CSS_H)
  for (let px = 0; px < W; px++) {
    const cx = Math.floor(px / SCALE)
    const inDot = cx % 4 < 2 && cy % 4 < 2
    const alpha = inDot ? cells[Math.floor(cy / 4)][Math.floor(cx / 4)] * fade : 0
    raw[offset + 1 + px * 2] = 0
    raw[offset + 2 + px * 2] = Math.round(alpha * 255)
  }
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0)
ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8
ihdr[9] = 4
const png = Buffer.concat([
  Buffer.from('89504e470d0a1a0a', 'hex'),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
])
writeFileSync(new URL('../public/grid-band.png', import.meta.url), png)
console.log('grid-band.png', png.length, 'bytes')
