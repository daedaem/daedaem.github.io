import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
const pg = async (w, h = 900, dark) => { const p = await (await b.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8817/'); await p.waitForTimeout(300); return p }
const axe = async (p) => { await p.addScriptTag({ content: AXE }); return (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id + v.nodes.length))).join(',') || 0 }
{ const p = await pg(1280); console.log('title', await p.title())
  await p.keyboard.press('Control+k')
  for (const q of ['AUTONOMOUS_TRANSACTION', 'serial#', 'Oracle']) { await p.fill('#cq', q); await p.waitForTimeout(300); console.log(q, await p.textContent('#ccount'), JSON.stringify(await p.$$eval('#cl .cmd-i', (e) => e.slice(0, 4).map((x) => x.querySelector('.t').textContent.slice(0, 22) + ' | ' + (x.querySelector('.d')?.textContent.slice(0, 50) ?? ''))))) }
  console.log('snippet has url', await p.evaluate(() => [...document.querySelectorAll('#cl .d')].some((d) => /\/wiki\/|\/posts\//.test(d.textContent))))
  await p.keyboard.press('Escape'); console.log('axe home', await axe(p)); await p.screenshot({ path: 'r5-1280-home.png', fullPage: false }) }
for (const w of [390, 1024]) { const p = await pg(w, 844); await p.evaluate(() => (location.hash = 'post-address-search-9s-to-100ms')); await p.waitForTimeout(400)
  console.log(w, 'inline toc btn', await p.evaluate(() => { const b = document.querySelector('.page:not([hidden]) .toc-inline'); return b ? [getComputedStyle(b).display, Math.round(b.getBoundingClientRect().top)] : 'none' }), 'by', await p.evaluate(() => document.querySelector('.page:not([hidden]) .art-meta .by')?.textContent), 'quote', await p.evaluate(() => { const q = document.querySelector('.page:not([hidden]) .prose > blockquote:first-child'); return q ? [getComputedStyle(q).fontSize, Math.round(q.getBoundingClientRect().height)] : null }))
  await p.click('.page:not([hidden]) .toc-inline'); await p.waitForTimeout(200); console.log(w, 'sheet', await p.evaluate(() => document.getElementById('sheet').open)); await p.keyboard.press('Escape')
  if (w === 390) await p.screenshot({ path: 'r5-390-post.png' })
  console.log(w, 'axe post', await axe(p)) }
{ const p = await pg(390, 844, true); await p.evaluate(() => (location.hash = 'posts')); await p.waitForTimeout(300); await p.evaluate(() => scrollTo(0, 99999)); await p.waitForTimeout(300); console.log('footer', await p.evaluate(() => { const f = document.querySelector('.ft'); return [...f.children].map((c) => Math.round(c.getBoundingClientRect().top + c.getBoundingClientRect().height / 2)) })) }
console.log('errors', errs.length ? errs : 'none'); await b.close()
