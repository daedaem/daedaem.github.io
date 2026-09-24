import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
for (const [n,u] of [['new','http://127.0.0.1:8817/#post-'+slug],['cur','http://127.0.0.1:8831/posts/'+slug+'/']]) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
const t = await p.evaluate(()=>{const h=[...document.querySelectorAll('h2')].find(h=>h.innerText.trim()=='정리'&&h.getBoundingClientRect().height>0); h.scrollIntoView(); let out=''; let e=h; const all=document.body.innerText; const i=all.indexOf('\n정리\n'); return all.slice(i, i+2600)});
console.log('==',n,t);
await p.waitForTimeout(300);
await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(1500);
await p.screenshot({path:n+'-post-end.png'});
await p.close();}
await b.close();
