import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage()
await p.goto('http://127.0.0.1:8817/'); await p.waitForTimeout(300); await p.click('.tb-search'); await p.fill('#cq', '주소'); await p.waitForTimeout(300)
const r = await p.evaluate(() => document.querySelector('.cmd-top').getBoundingClientRect()); await p.screenshot({ path: 'x.png', clip: { x: r.x, y: r.y, width: r.width, height: r.height } }); await b.close()
