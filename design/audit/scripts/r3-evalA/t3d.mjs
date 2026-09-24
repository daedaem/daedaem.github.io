import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
for (const q of ['트리거','주소 검색','롤백']) {
await p.keyboard.press('Control+k'); await p.waitForTimeout(400); await p.keyboard.press('Control+a'); await p.keyboard.type(q); await p.waitForTimeout(1800);
console.log(q, JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('dialog[open] a')].filter(a=>a.getBoundingClientRect().height>0).map(a=>a.innerText.trim().slice(0,40)+' -> '+decodeURI(a.getAttribute('href')).slice(0,50)))));
await p.keyboard.press('Escape'); await p.waitForTimeout(300);
}
const q=await b.newPage({viewport:{width:1280,height:900}});
await q.goto('http://127.0.0.1:8817/',{waitUntil:'networkidle'});
for (const s of ['주소 검색','롤백']) { await q.keyboard.press('Control+k'); await q.waitForTimeout(300); await q.keyboard.press('Control+a'); await q.keyboard.type(s); await q.waitForTimeout(800);
console.log('new',s, JSON.stringify(await q.evaluate(()=>[...document.querySelectorAll('dialog[open] a, dialog[open] [role=option]')].filter(a=>a.getBoundingClientRect().height>0).map(a=>a.innerText.trim().replace(/\s+/g,' ').slice(0,40))))); await q.keyboard.press('Escape'); await q.waitForTimeout(200);}
await b.close();
