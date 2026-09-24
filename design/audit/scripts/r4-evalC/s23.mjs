import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#post-address-search-9s-to-100ms'],['cur','http://127.0.0.1:8831/posts/address-search-9s-to-100ms/']]) for (const w of [1024,1180]) {
const p = await b.newPage({viewport:{width:w,height:800}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(600);
const r = await p.evaluate(()=>{const f=[...document.querySelectorAll('button, nav')].filter(b=>/목차/.test(b.innerText)&&b.getBoundingClientRect().width>0&&getComputedStyle(b).opacity!='0'&&b.getBoundingClientRect().top<innerHeight&&b.getBoundingClientRect().bottom>0).map(b=>b.tagName+'.'+b.className+' '+Math.round(b.getBoundingClientRect().left)+','+Math.round(b.getBoundingClientRect().top)); return f});
console.log(n,w,JSON.stringify(r));
await p.screenshot({path:`${n}-post-${w}-scrolled.png`}); await p.close();}
await b.close();
