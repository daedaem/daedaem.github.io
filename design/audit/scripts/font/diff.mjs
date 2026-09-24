import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync, writeFileSync } from 'fs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage()
for (const n of process.argv.slice(2)) {
  const r = await p.evaluate(async ([a, c]) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s }); const [x, y] = await Promise.all([load(a), load(c)])
    const cv = (i) => { const k = document.createElement('canvas'); k.width = i.width; k.height = i.height; const g = k.getContext('2d'); g.drawImage(i, 0, 0); return [k, g.getImageData(0, 0, i.width, i.height).data] }
    const [k1, d1] = cv(x), [k2, d2] = cv(y); const W = x.width; const rows = {}; let box = [1e9, 1e9, 0, 0]; const pts = []
    for (let q = 0; q < d1.length; q += 4) if (Math.abs(d1[q] - d2[q]) + Math.abs(d1[q + 1] - d2[q + 1]) + Math.abs(d1[q + 2] - d2[q + 2]) > 30) { const px = (q / 4) % W, py = Math.floor(q / 4 / W); rows[Math.floor(py / 20) * 20] = (rows[Math.floor(py / 20) * 20] || 0) + 1; if (pts.length < 400) pts.push([px, py]); box = [Math.min(box[0], px), Math.min(box[1], py), Math.max(box[2], px), Math.max(box[3], py)] }
    const ys = Object.keys(rows).map(Number); const y0 = ys[0] ?? 0
    const out = document.createElement('canvas'); out.width = W; out.height = 160; const g = out.getContext('2d'); g.drawImage(k1, 0, y0 - 20, W, 80, 0, 0, W, 80); g.drawImage(k2, 0, y0 - 20, W, 80, 0, 80, W, 80)
    const cl = {}; for (const [a, b2] of pts) { const k = Math.floor(a / 30) * 30 + ":" + Math.floor(b2 / 20) * 20; cl[k] = (cl[k] || 0) + 1 } return { rows: Object.entries(cl).slice(0, 20), box, img: out.toDataURL() }
  }, [readFileSync(`old${n}.png`).toString('base64'), readFileSync(`new${n}.png`).toString('base64')])
  console.log(n, JSON.stringify(r.rows), r.box); writeFileSync(`diff${n}.png`, Buffer.from(r.img.split(',')[1], 'base64'))
}
await b.close()
