import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const D='/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/audit/r3-evalB/shots'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w,h] of [[1280,900],[390,844]]) for (const [s,u,inp] of [['NEW','http://127.0.0.1:8817/#wiki','#wq'],['CUR','http://127.0.0.1:8831/wiki/','input[type=search], main input']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(500)
  const cover = await p.evaluate(() => { let bottom = 0; const list=[]; for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); if ((s.position === 'sticky' || s.position === 'fixed') && e.getClientRects().length) { const r = e.getBoundingClientRect(); if (r.top <= 1 + bottom && r.bottom > 0 && r.width > innerWidth * 0.4 && r.top < 200) { bottom = Math.max(bottom, r.bottom); list.push(e.className.toString().slice(0,20)+':'+Math.round(r.top)+'-'+Math.round(r.bottom)) } } } return { bottom: Math.round(bottom), list } })
  console.log(s, w, 'top-covered after scroll 900:', JSON.stringify(cover), 'of', h)
  await p.screenshot({ path: `${D}/${s}-wiki-scrolled-${w}.png` })
  await p.evaluate(() => window.scrollTo(0, 0))
  const i = p.locator(inp).first()
  await i.fill('zzqqxx'); await p.waitForTimeout(700)
  const empty = await p.evaluate(() => { const m = document.querySelector('main') || document.body; return m.innerText.split('\n').filter((l) => /없|0개|찾지|결과/.test(l)).slice(0, 5) })
  console.log(s, w, 'empty state lines:', JSON.stringify(empty))
  const btns = await p.evaluate(() => [...document.querySelectorAll('main button, main a')].filter(e=>e.getClientRects().length && /초기화|지우|전체 보기|다시|reset|모두/i.test(e.textContent)).map(e=>e.textContent.trim().slice(0,30)))
  console.log(s, w, 'recovery controls:', JSON.stringify(btns))
  await p.screenshot({ path: `${D}/${s}-wiki-empty-${w}.png` })
  // live region announces count?
  const live = await p.evaluate(() => [...document.querySelectorAll('[aria-live],[role=status]')].map(e=>e.id+':'+e.textContent.trim().slice(0,40)))
  console.log(s, w, 'live:', JSON.stringify(live))
  await p.close()
}
await b.close()
