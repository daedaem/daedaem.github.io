// 사물 bbox 기준으로 3:2 틀을 잡는다. MARGIN = 사물 대비 틀 크기(1.30이면 사물이 틀의 약 77%).
const sharp = require('sharp')
module.exports = async function frame(inp, bgHex, margin = 1.3, threshold = 18) {
  const bg = [parseInt(bgHex.slice(1, 3), 16), parseInt(bgHex.slice(3, 5), 16), parseInt(bgHex.slice(5, 7), 16)]
  const { data, info } = await sharp(inp).raw().toBuffer({ resolveWithObject: true })
  let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels
    if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > threshold) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y }
  }
  let w = (x1 - x0) * margin, h = (y1 - y0) * margin
  if (w / h < 1.5) w = h * 1.5; else h = w / 1.5
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2
  // 틀이 원본을 넘으면 배경색으로 채운다
  const pad = Math.ceil(Math.max(0, w / 2 - cx, cx + w / 2 - info.width, h / 2 - cy, cy + h / 2 - info.height)) + 2
  const padded = await sharp(inp).extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: bg[0], g: bg[1], b: bg[2] } }).toBuffer()
  return sharp(padded).extract({ left: Math.round(cx - w / 2 + pad), top: Math.round(cy - h / 2 + pad), width: Math.round(w), height: Math.round(h) })
}
