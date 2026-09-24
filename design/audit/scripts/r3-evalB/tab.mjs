import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w,h] of [[1280,900],[390,844]]) for (const [s,u] of [['NEW','http://127.0.0.1:8817/#post-address-search-9s-to-100ms'],['CUR','http://127.0.0.1:8831/posts/address-search-9s-to-100ms/']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  const stops = []
  for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); stops.push(await p.evaluate(() => { const a = document.activeElement; const st = getComputedStyle(a); const r = a.getBoundingClientRect(); return `${(a.getAttribute('aria-label') || a.textContent).trim().replace(/\s+/g,' ').slice(0, 14)}[${st.outlineStyle !== 'none' ? st.outlineWidth + ' ' + st.outlineColor : (st.boxShadow !== 'none' ? 'shadow' : 'NONE')}]${r.bottom < 0 || r.top > innerHeight ? '(offscreen)' : ''}` })) }
  // count total tab stops to reach main content first paragraph area
  console.log(s, w, stops.join(' > '))
  await p.close()
}
await b.close()
