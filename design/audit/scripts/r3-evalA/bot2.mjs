import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:390,height:844}});
for (const u of ['http://127.0.0.1:8817/#home','http://127.0.0.1:8817/#post-address-search-9s-to-100ms','http://127.0.0.1:8817/#wiki']) {
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
await p.mouse.wheel(0,30000); await p.waitForTimeout(900);
await p.mouse.wheel(0,-5); await p.waitForTimeout(900);
const r=await p.evaluate(()=>{const d=document.querySelector('nav.dock').getBoundingClientRect();const items=[...document.querySelectorAll('footer *, main a, main button, .pn a')].filter(e=>{const r=e.getBoundingClientRect();return r.height>0&&e.children.length===0&&r.bottom>d.top&&r.top<d.bottom&&r.right>d.left&&r.left<d.right}).map(e=>e.tagName+':'+e.textContent.trim().slice(0,30));return {sy:Math.round(scrollY),max:document.documentElement.scrollHeight-innerHeight,dockTop:Math.round(d.top),dockCls:document.querySelector('nav.dock').className,covered:items}});
console.log(u,JSON.stringify(r));
await p.screenshot({path:'bot2-'+u.split('#')[1].slice(0,10)+'.png'});
}
await b.close();
