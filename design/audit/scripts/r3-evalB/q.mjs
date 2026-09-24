import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
for (const [w,h] of [[1280,900],[390,844]]) for (const [s,u] of [['NEW','http://127.0.0.1:8817/#post-address-search-9s-to-100ms'],['CUR','http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'],['NEW','http://127.0.0.1:8817/#wiki-oracle-empty-string-is-null'],['CUR','http://127.0.0.1:8831/wiki/oracle-empty-string-is-null/']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
  const r = await p.evaluate(() => {
    const vis = (x) => x.getClientRects().length > 0 && !x.closest('[hidden]')
    const box = [...document.querySelectorAll('.prose, article')].find(vis)
    const ps = [...box.querySelectorAll('p')].filter(vis).filter((x) => x.textContent.trim().length > 60 && !x.closest('aside, blockquote, .callout, .note, .lead, figure, header, [class*=cause], [class*=disc]'))
    const links = [...box.querySelectorAll('p a[href], li a[href], td a[href]')].filter(vis).filter((a) => !a.closest('nav'))
    const h1 = [...document.querySelectorAll('h1')].find(vis)
    return { firstParaY: Math.round(ps[0].getBoundingClientRect().top + scrollY), fp: ps[0].textContent.trim().slice(0, 20), h1y: Math.round(h1.getBoundingClientRect().top), h1fs: getComputedStyle(h1).fontSize, bodyfs: getComputedStyle(ps[0]).fontSize, lh: getComputedStyle(ps[0]).lineHeight, measure: Math.round(ps[0].getBoundingClientRect().width), links: links.length, underl: links.filter((a) => getComputedStyle(a).textDecorationLine.includes('underline')).length, samples: links.slice(0, 4).map((a) => a.textContent.trim().slice(0, 18) + '|' + getComputedStyle(a).textDecorationLine + '|' + a.getAttribute('href').slice(0, 30)), meta: [...document.querySelectorAll('time')].filter(vis).map(t=>t.parentElement.textContent.trim().replace(/\s+/g,' ').slice(0,60)).slice(0,3) }
  })
  console.log(s, w, u.slice(-30), JSON.stringify(r))
  await p.close()
}
await b.close()
