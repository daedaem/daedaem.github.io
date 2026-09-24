import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
const c = await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const p = await c.newPage();
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
await p.locator('button:visible',{hasText:'검색'}).first().tap(); await p.waitForTimeout(600);
await p.keyboard.type('트랜잭션',{delay:30}); await p.waitForTimeout(1500);
await p.screenshot({path:n+'-m-search.png'});
const vis = await p.evaluate(()=>{const d=document.querySelector('dialog[open]'); const links=[...d.querySelectorAll('a')].filter(a=>{const r=a.getBoundingClientRect(); return r.height>0&&r.top>=0&&r.bottom<=innerHeight}); return links.length});
console.log(n,'result links fully visible in viewport:',vis);
await c.close();}
await b.close();
