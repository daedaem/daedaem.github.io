import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
const p = await b.newPage({viewport:{width:1280,height:900}});
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
const seq=[];
for (let i=0;i<9;i++){ await p.keyboard.press('Tab'); seq.push(await p.evaluate(()=>{const e=document.activeElement; const s=getComputedStyle(e); return (e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,14).replace(/\n/g,' ')+' [outline '+s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor+' / shadow '+(s.boxShadow!='none')+']'}));}
console.log(n,seq.join('\n   '));
// search open by click, esc, focus return
const sb = p.locator('button:visible', {hasText:'검색'}).first();
await sb.click(); await p.waitForTimeout(500);
await p.keyboard.press('Escape'); await p.waitForTimeout(400);
console.log(n,'focus after esc:', await p.evaluate(()=>document.activeElement.tagName+' '+(document.activeElement.innerText||'').trim().slice(0,10)), 'dialog open?', await p.evaluate(()=>!!document.querySelector('dialog[open]')));
await p.close();}
await b.close();
