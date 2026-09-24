import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w,h] of [[1280,900],[390,844]]) for (const [s,home,wiki,postSel] of [['NEW','http://127.0.0.1:8817/#home','http://127.0.0.1:8817/#wiki','#p-wiki a.wcard, #p-wiki .wcard a, #p-wiki a[href^="#wiki-"]'],['CUR','http://127.0.0.1:8831/','http://127.0.0.1:8831/wiki/','main a[href^="/wiki/"]:not([href="/wiki/"])']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: w<500 })
  await p.goto(home, { waitUntil: 'networkidle' })
  await p.goto(wiki, { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.scrollTo(0, 700)); await p.waitForTimeout(400)
  const links = p.locator(postSel)
  let target = null
  for (let i = 0; i < await links.count(); i++) { const bb = await links.nth(i).boundingBox(); if (bb && bb.y > 150 && bb.y < h - 150) { target = links.nth(i); break } }
  const txt = (await target.textContent()).trim().slice(0, 25)
  await target.click(); await p.waitForTimeout(900)
  const at = await p.evaluate(() => ({ url: location.href.slice(-45), y: scrollY, title: document.title.slice(0, 30), focus: document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0, 20) }))
  await p.goBack(); await p.waitForTimeout(900)
  const back = await p.evaluate(() => ({ url: location.href.slice(-30), y: Math.round(scrollY) }))
  await p.goForward(); await p.waitForTimeout(900)
  const fwd = await p.evaluate(() => ({ url: location.href.slice(-30), y: Math.round(scrollY) }))
  console.log(s, w, 'clicked', txt, JSON.stringify(at), 'BACK', JSON.stringify(back), 'FWD', JSON.stringify(fwd))
  // theme toggle
  const tb = p.locator('[data-theme-toggle]:visible, button[aria-label*="모드"]:visible, #theme-toggle:visible').first()
  const l0 = await tb.getAttribute('aria-label'); const pressed0 = await tb.getAttribute('aria-pressed')
  await tb.click(); await p.waitForTimeout(300)
  const l1 = await tb.getAttribute('aria-label'); const th = await p.evaluate(() => document.documentElement.dataset.theme || document.documentElement.getAttribute('data-theme'))
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  const th2 = await p.evaluate(() => document.documentElement.dataset.theme)
  console.log('  theme', l0, pressed0, '->', l1, th, 'persist', th2)
  await p.close()
}
await b.close()
