import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const w of [1280,1440,390]) {
const p = await b.newPage({viewport:{width:w,height:900}});
await p.goto('http://127.0.0.1:8831/wiki/spring-transactional-catch-swallows-rollback/',{waitUntil:'networkidle'});
await p.evaluate(()=>scrollTo(0,2200)); await p.waitForTimeout(600);
console.log(w, await p.evaluate(()=>[...document.querySelectorAll('button,a,summary')].filter(b=>/목차/.test(b.innerText)).map(b=>{const r=b.getBoundingClientRect(); const s=getComputedStyle(b); return b.tagName+'.'+b.className+' vis='+(r.width>0&&s.visibility!='hidden'&&s.opacity!='0')+' top='+Math.round(r.top)})));
await p.close();}
await b.close();
