import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8817/#posts',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{const f=[...document.querySelectorAll('footer')].find(f=>f.getBoundingClientRect().height>0); return [...f.querySelectorAll('a,small,p,span,div')].filter(e=>e.children.length==0&&e.innerText.trim()).map(e=>{const r=e.getBoundingClientRect(); return e.innerText.trim().slice(0,20)+' x='+Math.round(r.x)+' y='+Math.round(r.y)+' w='+Math.round(r.width)+' h='+Math.round(r.height)})}));
// home wiki stat card layout
await p.goto('http://127.0.0.1:8817/#home',{waitUntil:'networkidle'}); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{const e=[...document.querySelectorAll('a')].find(a=>a.innerText.includes('정리됨 17')&&a.getBoundingClientRect().height>0); const r=e.getBoundingClientRect(); const pr=e.parentElement.getBoundingClientRect(); return 'wiki stat card x='+Math.round(r.x)+' w='+Math.round(r.width)+' parent x='+Math.round(pr.x)+' w='+Math.round(pr.width)}));
// featured card 3 meta wrap
console.log(await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>a.getAttribute('href')?.startsWith('#post-')&&a.getBoundingClientRect().height>150&&a.getBoundingClientRect().top<1000).map(a=>{const r=a.getBoundingClientRect(); const img=a.querySelector('img'); const ir=img?.getBoundingClientRect(); return a.getAttribute('href').slice(0,30)+' card '+Math.round(r.width)+'x'+Math.round(r.height)+' img '+(img?Math.round(ir.width)+'x'+Math.round(ir.height)+' nat '+img.naturalWidth+'x'+img.naturalHeight:'none')})));
await b.close();
