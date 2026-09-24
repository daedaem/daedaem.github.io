import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [s,u,sel] of [['new','http://127.0.0.1:8817/#wiki','main a[href^="#wiki-"]'],['cur','http://127.0.0.1:8831/wiki/','main a[href^="/wiki/"][href$="/"]:not([href="/wiki/"])']]) {
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
await p.evaluate(()=>scrollTo(0,1200)); await p.waitForTimeout(500);
const target=await p.evaluate((sel)=>{const a=[...document.querySelectorAll(sel)].find(a=>{const r=a.getBoundingClientRect();return r.top>150&&r.bottom<700&&a.innerText.length>8});const r=a.getBoundingClientRect();return {t:a.innerText.slice(0,20),x:r.x+10,y:r.y+10}},sel);
const sy0=await p.evaluate(()=>scrollY);
await p.mouse.click(target.x,target.y); await p.waitForTimeout(1200);
const on=await p.evaluate(()=>({u:location.href,sy:scrollY,focus:document.activeElement.tagName}));
await p.goBack(); await p.waitForTimeout(1200);
const back=await p.evaluate(()=>({u:location.href,sy:Math.round(scrollY)}));
await p.goForward(); await p.waitForTimeout(1200);
const fw=await p.evaluate(()=>({u:location.href,sy:Math.round(scrollY)}));
console.log(s,'clicked',target.t,'from',sy0,'on',JSON.stringify(on),'back',JSON.stringify(back),'fwd',JSON.stringify(fw));
await p.close();}
await b.close();
