import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['cur-admin','http://127.0.0.1:8831/admin/'],['cur-projects','http://127.0.0.1:8831/projects/'],['cur-about','http://127.0.0.1:8831/about/']]) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.screenshot({path:n+'-1280.png'});
console.log('==',n, (await p.evaluate(()=>document.querySelector('main')?.innerText||document.body.innerText)).slice(0,1500));
await p.close();}
await b.close();
