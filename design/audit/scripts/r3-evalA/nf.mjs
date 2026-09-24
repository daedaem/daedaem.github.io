import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const u of ['http://127.0.0.1:8817/#post-does-not-exist','http://127.0.0.1:8831/posts/does-not-exist/']) {
const p=await b.newPage({viewport:{width:390,height:844}});
const r=await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
console.log(u,r.status(),JSON.stringify(await p.evaluate(()=>({title:document.title,txt:(document.querySelector('.view.on')||document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,250)}))));
await p.screenshot({path:'nf-'+(u.includes('8817')?'new':'cur')+'.png'});
await p.close();}
await b.close();
