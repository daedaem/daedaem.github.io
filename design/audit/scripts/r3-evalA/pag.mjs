import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [s,u,sel] of [['new','http://127.0.0.1:8817/#wiki','main a[href^="#wiki-"]'],['cur','http://127.0.0.1:8831/wiki/','main a[href^="/wiki/"][href$="/"]:not([href="/wiki/"])']]) {
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'});
await p.locator('main button:visible').filter({hasText:'다음'}).first().click(); await p.waitForTimeout(600);
const st=await p.evaluate(()=>({u:location.href,sy:Math.round(scrollY),focus:document.activeElement.tagName+':'+(document.activeElement.innerText||'').slice(0,15)}));
const cnt=async()=>p.evaluate(()=>{const e=[...document.querySelectorAll('main *')].find(e=>e.children.length===0&&/개 문서/.test(e.textContent)&&e.getBoundingClientRect().height>0);return e&&e.textContent.trim()});
const c1=await cnt();
await p.locator(sel+':visible').filter({hasText:/.{8,}/}).first().click(); await p.waitForTimeout(900);
await p.goBack(); await p.waitForTimeout(1000);
console.log(s,'after next:',JSON.stringify(st),c1,'| after back:',await cnt(),p.url());
await p.close();}
await b.close();
