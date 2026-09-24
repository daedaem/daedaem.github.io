import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const s='spring-transactional-catch-swallows-rollback';
for (const [n,u] of [['new','http://127.0.0.1:8817/#wiki-'+s],['cur','http://127.0.0.1:8831/wiki/'+s+'/']]) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.screenshot({path:n+'-wikidoc-1280.png'});
console.log('==',n,(await p.evaluate(()=>{const m=[...document.querySelectorAll('main, article, section')].find(e=>e.getBoundingClientRect().height>200&&e.innerText.includes('@Transactional')); return m.innerText})).slice(0,900));
await p.close();}
await b.close();
