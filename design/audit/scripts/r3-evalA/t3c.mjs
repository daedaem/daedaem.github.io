import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [s,u] of [['new','http://127.0.0.1:8817/'],['cur','http://127.0.0.1:8831/']]) {
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'});
for (const q of ['주사위 쌓기','SQLD','트리거']) {
await p.keyboard.press('Control+k'); await p.waitForTimeout(400); await p.keyboard.press('Control+a'); await p.keyboard.type(q); await p.waitForTimeout(1500);
console.log(s,q,JSON.stringify(await p.evaluate(()=>{const d=document.querySelector('dialog[open]');return d.innerText.replace(/\s+/g,' ').slice(0,220)})));
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
}
await p.goto(u.replace(/\/$/,'')+(s==='new'?'/#learn':'/learn/'),{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.screenshot({path:`learn-${s}.png`});
console.log(s,'learn:',await p.evaluate(()=>{const m=document.querySelector('.view.on')||document.querySelector('main');return m.innerText.replace(/\s+/g,' ').slice(0,400)}));
await p.close();}
await b.close();
