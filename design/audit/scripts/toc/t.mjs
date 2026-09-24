import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'fs'
const AXE = readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js', 'utf8')
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = []
for (const [path, w, scheme] of [['/posts/address-search-9s-to-100ms/', 390, 'light'], ['/wiki/spring-transactional-catch-swallows-rollback/', 360, 'dark'], ['/notes/', 390, 'light'], ['/posts/address-search-9s-to-100ms/', 1280, 'light']]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 844 }, colorScheme: scheme })).newPage(); p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('http://127.0.0.1:8831' + path, { waitUntil: 'networkidle' })
  const has = await p.$('.toc-fab'); if (!has) { console.log(path, w, 'no fab (ok for pages without toc)'); continue }
  const top = await p.evaluate(() => document.querySelector('.toc-fab').hidden)
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight * 0.55)); await p.waitForTimeout(400)
  const mid = await p.evaluate(() => { const f = document.querySelector('.toc-fab'); return { hidden: f.hidden, visible: f.getBoundingClientRect().width > 0 } })
  const y0 = await p.evaluate(() => scrollY)
  if (w >= 1200) { console.log(path, w, 'fab hidden at top', top, 'mid', JSON.stringify(mid)); continue }
  await p.click('.toc-fab'); await p.waitForTimeout(200)
  const open = await p.evaluate(() => ({ open: document.querySelector('.toc-sheet').open, focus: document.activeElement.textContent.slice(0, 20), current: document.activeElement.getAttribute('aria-current') }))
  await p.screenshot({ path: `sheet-${w}-${scheme}.png` })
  await p.addScriptTag({ content: AXE }); const ax = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] })).violations.map((v) => v.id + '(' + v.nodes.length + ')'))
  const hl = await p.evaluate(() => history.length)
  const links = await p.$$('.toc-sheet a'); await links[1].click(); await p.waitForTimeout(400)
  const after = await p.evaluate(() => ({ hash: decodeURIComponent(location.hash).slice(0, 25), closed: !document.querySelector('.toc-sheet').open, hl: history.length, top: Math.round(document.getElementById(decodeURIComponent(location.hash.slice(1))).getBoundingClientRect().top), hdr: Math.round(document.querySelector('header').getBoundingClientRect().bottom) }))
  await p.goBack(); await p.waitForTimeout(400); const back = await p.evaluate(() => scrollY)
  await p.click('.toc-fab').catch(() => {}); await p.keyboard.press('Escape'); const esc = await p.evaluate(() => !document.querySelector('.toc-sheet').open)
  console.log(path, w, scheme, 'fab hidden at top', top, 'mid', JSON.stringify(mid), 'open', JSON.stringify(open), 'axe', ax.join(',') || 0, 'jump', JSON.stringify(after), 'hist', hl, '→', after.hl, 'back y', y0, '→', back, 'esc closes', esc)
}
console.log('errors', errs.length ? errs : 'none'); await b.close()
