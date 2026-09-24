import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
await p.goto('http://127.0.0.1:8831/posts/address-search-9s-to-100ms/', { waitUntil: 'networkidle' })
for (const y of [300, 800, 1500]) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120) } await p.waitForTimeout(300)
console.log('away', await p.evaluate(() => document.getElementById('site-header').className))
await p.evaluate(() => document.querySelector('#site-header .brand').focus()); await p.waitForTimeout(350)
console.log('after brand focus', await p.evaluate(() => [document.getElementById('site-header').className, Math.round(document.getElementById('site-header').getBoundingClientRect().top)]))
await b.close()
