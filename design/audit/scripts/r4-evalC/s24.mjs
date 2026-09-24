import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8817/#home',{waitUntil:'networkidle'});
await p.click('button[aria-label="다크 모드로 전환"]'); await p.waitForTimeout(300);
console.log('after toggle', await p.evaluate(()=>getComputedStyle(document.body).backgroundColor), await p.evaluate(()=>JSON.stringify(Object.assign({},localStorage))));
await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(300);
console.log('after reload', await p.evaluate(()=>getComputedStyle(document.body).backgroundColor));
await b.close();
