import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const s='spring-transactional-catch-swallows-rollback';
for (const [n,u] of [['new','http://127.0.0.1:8817/#wiki-'+s],['cur','http://127.0.0.1:8831/wiki/'+s+'/']]) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.evaluate(()=>scrollTo(0,2500)); await p.waitForTimeout(500);
const fx = await p.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return (s.position=='fixed'||s.position=='sticky')&&e.getBoundingClientRect().height>0&&e.getBoundingClientRect().bottom>0&&s.visibility!='hidden'&&s.display!='none'&&s.opacity!='0'}).map(e=>e.tagName+'.'+e.className+' y='+Math.round(e.getBoundingClientRect().y)+' "'+e.innerText.trim().slice(0,30).replace(/\n/g,'|')+'"'));
console.log(n, fx);
await p.screenshot({path:n+'-wikidoc-scrolled.png'});
await p.close();}
await b.close();
