import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const AXE = '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const pages = { NEW: ['#home','#posts','#post-address-search-9s-to-100ms','#wiki','#wiki-oracle-empty-string-is-null','#learn','#nope'].map(x=>'http://127.0.0.1:8817/'+x), CUR: ['','posts/','posts/address-search-9s-to-100ms/','wiki/','wiki/oracle-empty-string-is-null/','learn/','404.html'].map(x=>'http://127.0.0.1:8831/'+x) }
for (const [w,h] of [[1280,900],[390,844]]) for (const [s, us] of Object.entries(pages)) for (const u of us) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(300)
  await p.addScriptTag({ path: AXE })
  const r = await p.evaluate(async () => {
    const a = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice'] }, resultTypes: ['violations','incomplete'] })
    return { v: a.violations.map(v => `${v.id}(${v.impact}):${v.nodes.length} ${v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' ; ')}`), inc: a.incomplete.filter(i=>i.id!=='color-contrast').map(i => `${i.id}:${i.nodes.length} ${i.nodes.slice(0,1).map(n=>n.target.join(' ')+' '+(n.any[0]?.message||'')).join('')}`.slice(0,200)) }
  })
  console.log(s, w, u.replace(/http:\/\/127.0.0.1:88\d\d\//,'/'), JSON.stringify(r))
  await p.close()
}
await b.close()
