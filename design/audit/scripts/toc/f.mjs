import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto('http://127.0.0.1:8831/posts/address-search-9s-to-100ms/', { waitUntil: 'networkidle' }); await p.evaluate(() => scrollTo(0, 5000)); await p.waitForTimeout(300)
await p.click('.toc-fab'); await p.waitForTimeout(200); await (await p.$$('.toc-sheet a'))[1].click(); await p.waitForTimeout(400)
console.log(await p.evaluate(() => ({ active: document.activeElement.tagName + ' ' + document.activeElement.textContent.slice(0, 20), top: Math.round(document.activeElement.getBoundingClientRect().top), hash: decodeURIComponent(location.hash).slice(0, 20) })))
await p.keyboard.press('Tab'); console.log('next tab', await p.evaluate(() => document.activeElement.tagName + ' ' + Math.round(document.activeElement.getBoundingClientRect().top)))
console.log('errors', errs.length); await b.close()
