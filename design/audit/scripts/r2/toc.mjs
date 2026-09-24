import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const w of [390, 1280]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 860 } })).newPage(); await p.goto('http://127.0.0.1:8817/#post-disk-99-percent-check-before-expanding'); await p.waitForTimeout(400)
  if (w < 1200) { await p.click('#fab'); await p.waitForTimeout(250); await p.click('#sheet-list li:nth-child(4) a') } else await p.click('.page:not([hidden]) .art-toc li:nth-child(4) a')
  await p.waitForTimeout(300)
  console.log(w, await p.evaluate(() => { const h = document.activeElement; return [h.tagName, Math.round(h.getBoundingClientRect().top), Math.round(document.querySelector('#top').getBoundingClientRect().bottom)] }))
  await p.screenshot({ path: `toc-${w}.png` })
}
await b.close()
