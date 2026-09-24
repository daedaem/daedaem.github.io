import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const D='/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/audit/r3-evalB/shots'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const ae = (p) => p.evaluate(() => { const a = document.activeElement; return a.tagName + '|' + (a.getAttribute('aria-label') || a.textContent.trim()).slice(0, 25) })
for (const [w,h] of [[1280,900],[390,844]]) for (const [s,u,trig] of [['NEW','http://127.0.0.1:8817/#posts','.tb-search'],['CUR','http://127.0.0.1:8831/posts/','#search-open']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w<500 })
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
  await p.click(trig); await p.waitForTimeout(700)
  const open0 = await p.evaluate(() => { const d=document.querySelector('dialog[open]'); return d? d.innerText.slice(0,300).replace(/\n+/g,' / '):null })
  console.log(`\n== ${s} ${w} empty-query dialog:`, open0, 'focus', await ae(p))
  await p.screenshot({ path: `${D}/${s}-search-empty-${w}.png` })
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  console.log('esc closes', !(await p.evaluate(()=>!!document.querySelector('dialog[open]'))), 'focus back', await ae(p))
  // backdrop click
  await p.click(trig); await p.waitForTimeout(500)
  await p.mouse.click(5, h - 5); await p.waitForTimeout(400)
  console.log('backdrop click closes', !(await p.evaluate(()=>!!document.querySelector('dialog[open]'))))
  if (await p.evaluate(()=>!!document.querySelector('dialog[open]'))) { await p.keyboard.press('Escape') }
  // typo / no results
  await p.click(trig); await p.waitForTimeout(500)
  await p.keyboard.type('qwxzv', { delay: 30 }); await p.waitForTimeout(1500)
  console.log('no-result text:', await p.evaluate(() => document.querySelector('dialog[open]').innerText.slice(0, 300).replace(/\n+/g, ' / ')))
  await p.screenshot({ path: `${D}/${s}-search-none-${w}.png` })
  // query then arrow + enter
  await p.keyboard.press('Control+a'); await p.keyboard.type('트리거', { delay: 30 }); await p.waitForTimeout(1500)
  const cnt = await p.evaluate(() => document.querySelector('dialog[open]').innerText.match(/(결과[^\n]*)/g))
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200)
  const afterDown = await ae(p)
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500)
  console.log('트리거 count', JSON.stringify(cnt), 'after ArrowDown focus', afterDown, '-> url', p.url().slice(-50), 'dialog open', await p.evaluate(()=>!!document.querySelector('dialog[open]')), 'mark', await p.evaluate(() => document.querySelectorAll('mark').length))
  await p.goBack(); await p.waitForTimeout(800)
  console.log('back ->', p.url().slice(-40), 'dialog open', await p.evaluate(()=>!!document.querySelector('dialog[open]')))
  await p.close()
}
await b.close()
