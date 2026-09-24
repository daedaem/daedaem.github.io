import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#post-address-search-9s-to-100ms'],['cur','http://127.0.0.1:8831/posts/address-search-9s-to-100ms/']]) for (const w of [1024,1180,1440]) {
const p = await b.newPage({viewport:{width:w,height:800}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
const r = await p.evaluate(()=>{const t=[...document.querySelectorAll('nav')].find(n=>/toc/.test(n.className)&&n.getBoundingClientRect().width>0); const h1=[...document.querySelectorAll('h1')].find(h=>h.getBoundingClientRect().width>0).getBoundingClientRect(); const tr=t?t.getBoundingClientRect():null; return {toc: tr?Math.round(tr.left)+'-'+Math.round(tr.right):'none', h1:Math.round(h1.left)+'-'+Math.round(h1.right), overflowX: document.documentElement.scrollWidth>innerWidth, fab: !!([...document.querySelectorAll('button')].find(b=>/목차/.test(b.innerText)&&b.getBoundingClientRect().width>0))}});
console.log(n,w,JSON.stringify(r)); await p.close();}
await b.close();
