import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
const pg = async (w, h = 900) => { const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8817/'); await p.waitForTimeout(300); return p }
{ const p = await pg(1280); const post = await p.evaluate(() => [...document.querySelectorAll('.page')].find((x) => x.id.startsWith('p-post-')).id.slice(2))
  console.log('1280 nav', JSON.stringify(await p.evaluate(() => ({ topnav: getComputedStyle(document.querySelector('.topnav')).display, dock: getComputedStyle(document.querySelector('.dock')).display, links: [...document.querySelectorAll('.topnav a')].map((a) => a.textContent) }))))
  await p.evaluate((id) => (location.hash = id), post); await p.waitForTimeout(400)
  console.log('1280 post nav on', await p.evaluate(() => document.querySelector('.topnav a.on')?.textContent + ' ' + document.querySelector('.topnav a.on')?.getAttribute('aria-current')))
  console.log('badges', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.page:not([hidden]) .art-meta .badge, .page:not([hidden]) .tagb')].map((e) => e.textContent + ':' + getComputedStyle(e).borderTopWidth + '/' + getComputedStyle(e).backgroundColor))))
  await p.addScriptTag({ content: AXE }); console.log('axe 1280 post', (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id))).join(',') || 0)
  await p.evaluate(() => scrollTo(0, 3000)); await p.waitForTimeout(300); await p.screenshot({ path: 'r3-1280-post.png' })
  await p.evaluate(() => (location.hash = 'home')); await p.waitForTimeout(300); await p.screenshot({ path: 'r3-1280-home.png' })
  for (const w of [1024, 1100]) { await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(200); console.log(w, 'topnav overflow', await p.evaluate(() => { const t = document.querySelector('.top-in'); return [t.scrollWidth, t.clientWidth] })) } }
{ const p = await pg(390, 844); console.log('390 first card title y', await p.evaluate(() => Math.round(document.querySelector('.cards .card h3, .cards .card .card-t, .cards .card [class*=title]')?.getBoundingClientRect().top ?? -1)))
  await p.screenshot({ path: 'r3-390-home.png' })
  const post = await p.evaluate(() => [...document.querySelectorAll('.page')].find((x) => x.id.startsWith('p-post-') && x.querySelector('.art-toc')).id.slice(2)); await p.evaluate((id) => (location.hash = id), post); await p.waitForTimeout(400)
  for (const y of [400, 900, 1500]) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(80) }
  await p.waitForTimeout(300); const down = await p.evaluate(() => ({ away: document.querySelector('.dock').classList.contains('away'), dockTop: Math.round(document.querySelector('.dock').getBoundingClientRect().top), fab: Math.round(document.querySelector('#fab').getBoundingClientRect().bottom) }))
  await p.screenshot({ path: 'r3-390-reading.png' })
  await p.evaluate(() => scrollTo(0, 1300)); await p.waitForTimeout(300); const up = await p.evaluate(() => document.querySelector('.dock').classList.contains('away'))
  console.log('390 reading dock', JSON.stringify(down), 'after scroll up away=', up)
  await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(80); await p.evaluate(() => scrollTo(0, 2600)); await p.waitForTimeout(300)
  await p.evaluate(() => document.querySelector('.dock a').focus()); await p.waitForTimeout(250); console.log('focus shows dock', !(await p.evaluate(() => document.querySelector('.dock').classList.contains('away'))))
  await p.addScriptTag({ content: AXE }); console.log('axe 390 post', (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id))).join(',') || 0) }
console.log('errors', errs.length ? errs : 'none'); await b.close()
