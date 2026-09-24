import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
for (const w of [1280, 390]) { const p = await (await b.newContext({ viewport: { width: w, height: 860 } })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8817/'); await p.waitForTimeout(400); await p.screenshot({ path: `home-${w}.png` }); console.log(w, await p.evaluate(() => [document.querySelectorAll('.avatar').length, Math.round(document.querySelector('.hero-l').getBoundingClientRect().width), Math.round(document.querySelector('.cards .card').getBoundingClientRect().top)])) }
console.log('errors', errs.length); await b.close()
