import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
const pg = async (w, h, url, dark) => { const p = await (await b.newContext({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' })).newPage(); p.on('pageerror', (e) => errs.push(e.message)); await p.goto('http://127.0.0.1:8831' + url, { waitUntil: 'networkidle' }); return p }
const axe = async (p) => { await p.addScriptTag({ content: AXE }); return (await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id))).join(',') || 0 }
{ const p = await pg(1280, 900, '/', true); console.log('dark hero bg', await p.evaluate(() => getComputedStyle(document.querySelector('.byline')).backgroundColor), 'picks dates', await p.$$eval('.reading-list time', (e) => e.map((x) => x.textContent.trim()).join(' / ')), 'axe', await axe(p)); await p.screenshot({ path: 'dark-home.png', clip: { x: 0, y: 0, width: 1280, height: 520 } }) }
{ const p = await pg(390, 844, '/'); await p.click('#search-open'); await p.waitForSelector('.pagefind-ui__search-input'); await p.fill('.pagefind-ui__search-input', 'Oracle'); await p.waitForTimeout(1500)
  console.log('titles', await p.$$eval('.pagefind-ui__result-title', (e) => e.slice(0, 5).map((x) => x.textContent.trim().slice(0, 30)).join(' | ')))
  console.log('results fully in view', await p.evaluate(() => [...document.querySelectorAll('.pagefind-ui__result')].filter((r) => r.getBoundingClientRect().bottom <= innerHeight).length))
  await p.screenshot({ path: 'm-search.png' })
  console.log('snippet has 문서 목록', await p.evaluate(() => [...document.querySelectorAll('.pagefind-ui__result-excerpt')].some((e) => e.textContent.includes('문서 목록'))))
  await p.fill('.pagefind-ui__search-input', 'qwxzv'); await p.waitForTimeout(1500); console.log('weak help', await p.evaluate(() => !document.getElementById('search-help').hidden))
  await p.fill('.pagefind-ui__search-input', '뷁뷁뷁'); await p.waitForTimeout(1500); console.log('zero help', await p.evaluate(() => [!document.getElementById('search-help').hidden, document.querySelector('.pagefind-ui__message')?.textContent])) }
{ const p = await pg(1280, 900, '/wiki/spring-transactional-catch-swallows-rollback/'); await p.evaluate(() => scrollTo(0, 2200)); await p.waitForTimeout(500); console.log('wide wiki fab', await p.evaluate(() => !document.querySelector('.toc-fab').hidden))
  await p.click('.toc-fab'); await p.waitForTimeout(200); console.log('sheet open', await p.evaluate(() => document.querySelector('.toc-sheet').open)); await p.screenshot({ path: 'wide-wiki-sheet.png' }) }
{ const p = await pg(1280, 900, '/posts/address-search-9s-to-100ms/'); await p.evaluate(() => scrollTo(0, 2500)); await p.waitForTimeout(500); console.log('wide post fab hidden (sticky toc)', await p.evaluate(() => document.querySelector('.toc-fab').hidden)) }
console.log('errors', errs.length ? errs : 'none'); await b.close()
