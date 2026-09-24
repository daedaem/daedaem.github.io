import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage()
const fonts = []; p.on('request', (r) => /woff2/.test(r.url()) && fonts.push(r.url().split('/').pop()))
await p.goto('http://127.0.0.1:8831/', { waitUntil: 'networkidle' })
console.log('initial', fonts.join(' '))
await p.click('#search-open'); await p.waitForSelector('.pagefind-ui__search-input'); await p.fill('.pagefind-ui__search-input', '뷁쀍 똠방각하'); await p.waitForTimeout(1500)
console.log('after typing', fonts.join(' '))
console.log(await p.evaluate(() => document.fonts.check('16px "Pretendard Variable"', '뷁')))
await b.close()
