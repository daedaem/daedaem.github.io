import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const u of ['http://127.0.0.1:8817/#posts','http://127.0.0.1:8831/posts/']) {
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
console.log(u, JSON.stringify(await p.evaluate(()=>{const h=document.querySelector('header');const a=[...h.querySelectorAll('nav a')][1]; const chain=[];let e=a;while(e){const s=getComputedStyle(e);chain.push(e.tagName+'.'+e.className+' bg='+s.backgroundColor+' op='+s.opacity+' filter='+s.backdropFilter+' mix='+s.mixBlendMode);e=e.parentElement;} return {color:getComputedStyle(a).color, chain, disabledPrev:[...document.querySelectorAll('main button')].filter(b=>/이전/.test(b.innerText)).map(b=>({dis:b.disabled,aria:b.getAttribute('aria-disabled')}))}}),null,1));
await p.close();}
await b.close();
