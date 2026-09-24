import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
const pg = async (w, h = 900) => { const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8817/'); await p.waitForTimeout(300); return p }
const axe = async (p) => { await p.addScriptTag({ content: AXE }); return (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id + v.nodes.length))).join(',') || 0 }
{ const p = await pg(1280); await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300); await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(200)
  console.log('wiki sticky', await p.evaluate(() => [getComputedStyle(document.querySelector('.wtools')).position, Math.round(document.querySelector('.wtools').getBoundingClientRect().top)]))
  console.log('legend', await p.textContent('#p-wiki .legend'), '| card date', await p.evaluate(() => document.querySelector('.wcard-top').textContent))
  console.log('axe wiki', await axe(p))
  await p.keyboard.press('Control+k'); await p.fill('#cq', '주소'); await p.waitForTimeout(300)
  console.log('groups', await p.$$eval('#cl .cmd-g', (e) => e.map((x) => x.textContent).join(',')), 'native clear', await p.evaluate(() => getComputedStyle(document.querySelector('#cq'), '::-webkit-search-cancel-button').display))
  await p.keyboard.press('Escape'); await p.evaluate(() => (location.hash = 'home')); await p.waitForTimeout(300); console.log('footer links', await p.$$eval('.ft a', (e) => e.length), 'axe home', await axe(p)) }
{ const p = await pg(390, 844); const post = await p.evaluate(() => [...document.querySelectorAll('.page')].find((x) => x.id.startsWith('p-post-') && x.querySelector('.art-toc')).id.slice(2)); await p.evaluate((id) => (location.hash = id), post); await p.waitForTimeout(400)
  console.log('fab at top visible', await p.evaluate(() => getComputedStyle(document.querySelector('#fab')).display))
  await p.screenshot({ path: 'r4-390-post-top.png' })
  for (const y of [300, 800, 1500]) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(100) } await p.waitForTimeout(300)
  console.log('fab mid', await p.evaluate(() => getComputedStyle(document.querySelector('#fab')).display), 'brand in reading', await p.evaluate(() => { const b = document.querySelector('.brandmark'); return [getComputedStyle(b).display, Math.round(b.getBoundingClientRect().width), document.querySelector('#top').classList.contains('reading')] }))
  await p.screenshot({ path: 'r4-390-post-mid.png', clip: { x: 0, y: 0, width: 390, height: 120 } })
  console.log('axe post 390', await axe(p)) }
{ const p = await pg(1280); const post = await p.evaluate(() => [...document.querySelectorAll('.page')].find((x) => x.id.startsWith('p-post-')).id.slice(2)); await p.evaluate((id) => (location.hash = id), post); await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(300); console.log('1280 reading brand', await p.evaluate(() => { const b = document.querySelector('.brandmark'); return [getComputedStyle(b).fontSize, Math.round(b.getBoundingClientRect().width)] })) }
console.log('errors', errs.length ? errs : 'none'); await b.close()
