import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
const pg = async (w, h, url, dark) => { const p = await (await b.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8831' + url, { waitUntil: 'networkidle' }); return p }
const axe = async (p) => { await p.addScriptTag({ content: AXE }); return (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id))).join(',') || 0 }
// 모바일 머리줄
{ const p = await pg(390, 844, '/posts/address-search-9s-to-100ms/')
  const h = async () => p.evaluate(() => { const r = document.getElementById('site-header').getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom)] })
  const s0 = await h(); for (const y of [300, 800, 1500]) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(120) } await p.waitForTimeout(300); const down = await h()
  await p.evaluate(() => scrollTo(0, 1300)); await p.waitForTimeout(400); const up = await h()
  await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(120); await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(400)
  await p.keyboard.press('Shift+Tab'); await p.waitForTimeout(400); const kb = await h()
  console.log('mobile header top', JSON.stringify(s0), 'down', JSON.stringify(down), 'up', JSON.stringify(up), 'after focus', JSON.stringify(kb), 'search label', await p.evaluate(() => getComputedStyle(document.querySelector('#search-open span')).display))
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300); await p.screenshot({ path: 'm-header.png', clip: { x: 0, y: 0, width: 390, height: 140 } }) }
// 위키 빈 결과
{ const p = await pg(390, 844, '/wiki/'); await p.fill('#wiki-query', 'rollbackFor'); await p.waitForTimeout(400)
  console.log('wiki empty', JSON.stringify(await p.evaluate(() => ({ count: document.getElementById('wiki-count').textContent.trim(), clearY: Math.round(document.getElementById('wiki-clear').getBoundingClientRect().top), clearHidden: document.getElementById('wiki-clear').hidden, countY: Math.round(document.getElementById('wiki-count').getBoundingClientRect().top) }))))
  await p.screenshot({ path: 'm-wiki-empty.png' })
  await p.click('#wiki-global'); await p.waitForTimeout(1500); console.log('wiki→search', await p.evaluate(() => [document.getElementById('search-dialog').open, document.querySelector('.pagefind-ui__search-input')?.value, document.getElementById('search-status').textContent]))
  await p.keyboard.press('Escape'); await p.click('#wiki-clear'); await p.waitForTimeout(300); console.log('after clear', await p.evaluate(() => [document.getElementById('wiki-count').textContent.trim(), document.activeElement.id])) }
// 404 (파이썬 서버라 /404.html 직접)
{ const p = await pg(1280, 900, '/404.html'); console.log('404 h1', await p.textContent('h1')); await p.click('#notfound-search'); await p.waitForTimeout(1200); console.log('404 search open', await p.evaluate(() => document.getElementById('search-dialog').open)); await p.keyboard.press('Escape'); console.log('axe 404', await axe(p)) }
// 초점 표시
{ const p = await pg(1280, 900, '/'); const rings = []; for (let i = 0; i < 6; i++) { await p.keyboard.press('Tab'); rings.push(await p.evaluate(() => { const s = getComputedStyle(document.activeElement); return document.activeElement.tagName + ':' + s.outlineStyle + ' ' + s.outlineWidth })) } console.log('focus rings', rings.join(' | ')); console.log('axe home', await axe(p)) }
for (const [u, w, d] of [['/wiki/', 390, false], ['/posts/address-search-9s-to-100ms/', 390, true], ['/wiki/', 1280, true]]) { const p = await pg(w, 900, u, d); console.log('axe', u, w, d ? 'dark' : 'light', await axe(p)) }
console.log('errors', errs.length ? errs : 'none'); await b.close()
