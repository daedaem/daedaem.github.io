import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage()
const errs = []; p.on('pageerror', (e) => errs.push(e.message))
await p.goto('http://127.0.0.1:8831/', { waitUntil: 'networkidle' }); await p.click('#search-open'); await p.waitForSelector('.pagefind-ui__search-input')
for (const q of ['qwxzv', 'kafka', '트랜잭션을', '주소', 'rollbackFor']) {
  await p.fill('.pagefind-ui__search-input', q); await p.waitForTimeout(1200)
  console.log(q, JSON.stringify(await p.evaluate(() => ({ weak: !document.getElementById('search-weak').hidden, partial: !document.getElementById('search-partial').hidden, status: document.getElementById('search-status').textContent, first: document.querySelector('#search-mount:not(.is-weak) a.pagefind-ui__result-link')?.getAttribute('href') }))))
}
await p.fill('.pagefind-ui__search-input', '인덱스'); await p.waitForTimeout(1200)
await p.focus('.pagefind-ui__search-input'); await p.keyboard.press('ArrowDown'); const a1 = await p.evaluate(() => document.activeElement.getAttribute('href'))
await p.keyboard.press('ArrowDown'); const a2 = await p.evaluate(() => document.activeElement.getAttribute('href'))
await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); const back = await p.evaluate(() => document.activeElement.className)
console.log('arrows', a1, a2, 'back to', back)
await p.keyboard.press('Enter'); await p.waitForTimeout(800); console.log('enter →', p.url())
console.log('errors', errs); await b.close()
