import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { writeFileSync } from 'fs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const PAGES = ['/', '/posts/disk-99-percent-check-before-expanding/', '/posts/address-search-9s-to-100ms/', '/wiki/', '/wiki/spring-transactional-catch-swallows-rollback/', '/notes/', '/about/', '/algorithms/']
const shot = async (port, path, w, dark) => {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: dark ? 'dark' : 'light' }); const p = await ctx.newPage()
  const fonts = []; p.on('response', async (r) => { if (/\.woff2/.test(r.url())) { let n = 0; try { n = (await r.body()).length } catch {} fonts.push([r.url().split('/').pop(), n]) } })
  await p.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300)
  const png = await p.screenshot({ fullPage: true })
  const fam = await p.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family).length)
  await ctx.close(); return { png, fonts, fam }
}
const rows = []
for (const path of PAGES) for (const w of [390, 1280]) {
  const o = await shot(8830, path, w), n = await shot(8831, path, w)
  const same = Buffer.compare(o.png, n.png) === 0
  let diffPx = null
  if (!same) { const pg = await (await b.newContext()).newPage(); diffPx = await pg.evaluate(async ([a, c]) => { const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s }); const [x, y] = await Promise.all([load(a), load(c)]); if (x.width !== y.width || x.height !== y.height) return 'size ' + x.width + 'x' + x.height + ' vs ' + y.width + 'x' + y.height; const cv = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data }; const d1 = cv(x), d2 = cv(y); let n = 0; for (let k = 0; k < d1.length; k += 4) if (Math.abs(d1[k] - d2[k]) + Math.abs(d1[k + 1] - d2[k + 1]) + Math.abs(d1[k + 2] - d2[k + 2]) > 30) n++; return n }, [o.png.toString('base64'), n.png.toString('base64')]); await pg.context().close(); writeFileSync(`old${path.replace(/\//g, '_')}${w}.png`, o.png); writeFileSync(`new${path.replace(/\//g, '_')}${w}.png`, n.png) }
  const sum = (f) => f.filter(([u]) => /Pretendard/.test(u)).reduce((s, [, n]) => s + n, 0)
  const cnt = (f) => f.filter(([u]) => /Pretendard/.test(u)).length
  const extra = n.fonts.filter(([u]) => /subset\.\d+/.test(u)).map(([u]) => u)
  rows.push(`${path} ${w}: old ${cnt(o.fonts)} files ${(sum(o.fonts) / 1024).toFixed(0)}KB → new ${cnt(n.fonts)} files ${(sum(n.fonts) / 1024).toFixed(0)}KB ${extra.length ? 'EXTRA ' + extra.join(',') : ''} | render ${same ? 'identical' : 'diff px ' + diffPx}`)
  console.log(rows.at(-1))
}
writeFileSync('cmp.txt', rows.join('\n')); await b.close()
