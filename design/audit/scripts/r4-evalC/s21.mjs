import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) for (const q of ['AUTONOMOUS_TRANSACTION','rollbackFor','NVL','B-tree','9초']) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.keyboard.press('Control+k'); await p.waitForTimeout(500);
await p.keyboard.type(q,{delay:20}); await p.waitForTimeout(1500);
const t = await p.evaluate(()=>{const d=document.querySelector('dialog[open]'); const m=d.innerText.match(/결과 (\d+)건|결과가 없습니다|결과 없음/); return m?m[0]:'?'});
console.log(n,q,t); await p.close();}
await b.close();
