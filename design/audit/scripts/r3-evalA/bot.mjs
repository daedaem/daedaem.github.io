import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [s,u] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto(u,{waitUntil:'networkidle'});
await p.mouse.wheel(0,20000); await p.waitForTimeout(800);
await p.mouse.wheel(0,-150); await p.waitForTimeout(800);
await p.screenshot({path:`bot-${s}-m.png`});
console.log(s, await p.evaluate(()=>{const d=document.querySelector('nav.dock');const f=document.querySelector('footer');return {dock:d&&{cls:d.className,y:Math.round(d.getBoundingClientRect().y)},footer:f&&f.innerText.replace(/\s+/g,' ').slice(0,200),sy:Math.round(scrollY),max:document.documentElement.scrollHeight-innerHeight}}));
await p.close();}
await b.close();
