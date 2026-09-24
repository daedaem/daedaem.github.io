import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const pages = { NEW: ['#home','#posts','#post-address-search-9s-to-100ms','#wiki','#wiki-oracle-empty-string-is-null','#learn'].map(x=>'http://127.0.0.1:8817/'+x), CUR: ['','posts/','posts/address-search-9s-to-100ms/','wiki/','wiki/oracle-empty-string-is-null/','learn/'].map(x=>'http://127.0.0.1:8831/'+x) }
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
for (const [s, us] of Object.entries(pages)) for (const u of us) {
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  const r = await p.evaluate(() => {
    const vis = (x) => x.getClientRects().length && !x.closest('[hidden]')
    const main = [...document.querySelectorAll('main')].find(vis)
    const bodyBg = getComputedStyle(document.body).backgroundColor
    const pillish = (e) => { const st = getComputedStyle(e), r = e.getBoundingClientRect(); const border = parseFloat(st.borderTopWidth) > 0 && st.borderTopStyle !== 'none' && parseFloat(st.borderLeftWidth) > 0; const bg = st.backgroundColor !== 'rgba(0, 0, 0, 0)' && st.backgroundColor !== bodyBg; return (border || bg) && parseFloat(st.borderRadius) >= 4 && r.height >= 16 && r.height < 40 && r.width < 200 && e.textContent.trim().length > 0 && e.textContent.trim().length < 25 }
    const all = [...main.querySelectorAll('span, small, em, b, strong, div, p, li, time, mark')].filter(vis).filter(e => !e.closest('pre, code, table, .code'))
    const nonInt = all.filter(e => !e.closest('a, button, label, summary, input')).filter(pillish)
    const inLink = all.filter(e => e.closest('a') && !e.matches('a')).filter(pillish)
    const links = [...main.querySelectorAll('a[href]')].filter(vis)
    const ambig = links.map(a => (a.getAttribute('aria-label') || a.textContent).trim()).filter(t => /^(보기|더 보기|전체|여기|→)$/.test(t))
    const selfLinks = links.filter(a => a.getAttribute('href') === location.hash && location.hash).length
    return { pillsNonInteractive: nonInt.length, pillsNonIntSample: nonInt.slice(0,4).map(e=>e.textContent.trim().slice(0,12)), pillsInsideLinks: inLink.length, pillsInLinkSample: [...new Set(inLink.map(e=>e.textContent.trim().slice(0,10)))].slice(0,5), ambiguousLinkText: ambig, linksToSelf: selfLinks }
  })
  console.log(s, u.replace(/http:\/\/127.0.0.1:88\d\d\//,'/'), JSON.stringify(r))
}
await b.close()
