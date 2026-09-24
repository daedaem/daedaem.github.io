import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
await p.goto('http://127.0.0.1:8831/posts/address-search-9s-to-100ms/', { waitUntil: 'networkidle' }); await p.evaluate(() => scrollTo(0, 5000)); await p.waitForTimeout(300); await p.click('.toc-fab'); await p.waitForTimeout(300)
console.log(await p.evaluate(() => { const d = document.querySelector('.toc-sheet'); const s = getComputedStyle(d, '::backdrop'); return [s.backgroundColor, s.display, getComputedStyle(d).display, d.matches(':modal')] }))
const px = await p.screenshot({ clip: { x: 5, y: 150, width: 10, height: 10 } }); console.log(px.length)
await p.screenshot({ path: 'bd.png' }); await b.close()
