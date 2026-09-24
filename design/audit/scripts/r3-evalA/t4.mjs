import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) for (const [s,u] of [['new','http://127.0.0.1:8817/#wiki'],['cur','http://127.0.0.1:8831/wiki/']]) {
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  await p.screenshot({path:`t4-${s}-${vp}.png`, fullPage: vp==='d'});
  const ctr=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.height>0&&getComputedStyle(e).visibility!=='hidden'};
    return [...document.querySelectorAll('main button, main select, main input, main [role=tab], main [role=radio], main a[aria-pressed], main label')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,type:e.type,t:(e.innerText||e.value||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,30),pressed:e.getAttribute('aria-pressed'),checked:e.checked,sel:e.getAttribute('aria-selected'),y:Math.round(r.y+scrollY),x:Math.round(r.x),h:Math.round(r.height)}}).slice(0,60)});
  console.log(s,vp,JSON.stringify(ctr));
  await p.close();
}
await b.close();
