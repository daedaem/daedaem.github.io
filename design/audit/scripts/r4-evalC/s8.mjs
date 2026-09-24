import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
import fs from 'fs';
const axe = fs.readFileSync('/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js','utf8');
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
const targets=[['new','home','http://127.0.0.1:8817/#home'],['new','post','http://127.0.0.1:8817/#post-'+slug],['new','wiki','http://127.0.0.1:8817/#wiki'],['new','posts','http://127.0.0.1:8817/#posts'],['cur','home','http://127.0.0.1:8831/'],['cur','post','http://127.0.0.1:8831/posts/'+slug+'/'],['cur','wiki','http://127.0.0.1:8831/wiki/'],['cur','posts','http://127.0.0.1:8831/posts/'],['cur','about','http://127.0.0.1:8831/about/']];
for (const scheme of ['light','dark']) for (const [site,pg,url] of targets) {
  const ctx = await b.newContext({viewport:{width:1280,height:900}, colorScheme:scheme});
  const p = await ctx.newPage();
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
  if (scheme=='dark' && (pg=='home'||pg=='post')) { await p.screenshot({path:`${site}-${pg}-dark-1280.png`}); }
  await p.addScriptTag({content:axe});
  const r = await p.evaluate(async()=>{const res = await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}); return res.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length, ex:v.nodes.slice(0,3).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||'').slice(0,110))}))});
  console.log(`== ${site} ${pg} ${scheme}:`, r.length? JSON.stringify(r):'no violations');
  await ctx.close();
}
await b.close();
