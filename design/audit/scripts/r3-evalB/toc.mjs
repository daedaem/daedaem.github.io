import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const w of [1200, 1220, 1280, 1366, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } })
  await p.goto('http://127.0.0.1:8817/#post-address-search-9s-to-100ms', { waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  const r = await p.evaluate(() => { const n = [...document.querySelectorAll('.art-toc')].find(x => x.getClientRects().length && !x.closest('[hidden]')); if (!n) return 'no toc'; const nr = n.getBoundingClientRect(); const links = [...n.querySelectorAll('a')]; const maxR = Math.max(...links.map(a => { const rg = document.createRange(); rg.selectNodeContents(a); return rg.getBoundingClientRect().right })); return { display: getComputedStyle(n).display, navL: Math.round(nr.left), navR: Math.round(nr.right), maxTextRight: Math.round(maxR), vw: innerWidth, clipped: links.filter(a => a.scrollWidth > a.clientWidth + 1).length, fab: !document.querySelector('#fab').hidden && getComputedStyle(document.querySelector('#fab')).display!=='none', ring: getComputedStyle(document.querySelector('.top-read')).display } })
  console.log(w, JSON.stringify(r))
  await p.close()
}
await b.close()
