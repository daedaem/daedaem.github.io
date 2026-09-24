import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const w of [1024,1199,1440]) for (const [s,u] of [['new','http://127.0.0.1:8817/#post-address-search-9s-to-100ms'],['cur','http://127.0.0.1:8831/posts/address-search-9s-to-100ms/']]) {
const p=await b.newPage({viewport:{width:w,height:800}});
await p.goto(u,{waitUntil:'networkidle'}); await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.height>0&&s.visibility!=='hidden'&&parseFloat(s.opacity)>0.5&&r.y<innerHeight&&r.bottom>0};
 const toc=[...document.querySelectorAll('nav')].find(n=>/목차/.test(n.getAttribute('aria-label')||'')&&vis(n)); const fab=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='목차'&&vis(b));
 const art=document.querySelector('article')||document.querySelector('main'); const ar=art.getBoundingClientRect();
 return {toc:toc&&[Math.round(toc.getBoundingClientRect().x),Math.round(toc.getBoundingClientRect().right)],fab:!!fab,hscroll:document.documentElement.scrollWidth>innerWidth, article:[Math.round(ar.x),Math.round(ar.width)]}});
console.log(w,s,JSON.stringify(r));
await p.close();}
await b.close();
