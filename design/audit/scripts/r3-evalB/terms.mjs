import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1280, height: 900 } })
const pages = { NEW: ['#home','#posts','#post-address-search-9s-to-100ms','#wiki','#wiki-oracle-empty-string-is-null','#learn','#nope'].map(x=>'http://127.0.0.1:8817/'+x), CUR: ['','posts/','posts/address-search-9s-to-100ms/','wiki/','wiki/oracle-empty-string-is-null/','learn/','404.html','notes/'].map(x=>'http://127.0.0.1:8831/'+x) }
for (const [s, us] of Object.entries(pages)) for (const u of us) {
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  await p.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true))
  const r = await p.evaluate(() => {
    const vis = (x) => x.getClientRects().length && !x.closest('[hidden]')
    const main = [...document.querySelectorAll('main')].find(vis)
    const t = main.innerText
    const dates = [...new Set((t.match(/[^\n]{0,14}(\d{4}\.\d{2}(\.\d{2})?|\d{4}년 \d{1,2}월( \d{1,2}일)?)[^\n]{0,8}/g) || []))].slice(0, 8)
    const help = t.split('\n').filter(l => /사례 시점|작성일|갱신|정리됨|보완 중|날짜|기록/.test(l) && l.length > 25).slice(0, 4).map(l=>l.slice(0,160))
    const moreLinks = [...main.querySelectorAll('a')].filter(vis).map(a => a.textContent.trim()).filter(x => /전체|목록|보기|→|아카이브/.test(x) && x.length < 20)
    return { dates, help, moreLinks: [...new Set(moreLinks)].slice(0, 8), h2: [...main.querySelectorAll('h2')].filter(vis).map(h=>h.textContent.trim().slice(0,20)).slice(0,8) }
  })
  console.log('\n'+s, u.replace(/http:\/\/127.0.0.1:88\d\d\//,'/'), JSON.stringify(r))
}
await b.close()
