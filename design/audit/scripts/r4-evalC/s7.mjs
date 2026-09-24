import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [name,url] of [['new','http://127.0.0.1:8817/#wiki'],['cur','http://127.0.0.1:8831/wiki/']]) {
  const p = await b.newPage({viewport:{width:1280,height:900}});
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  await p.screenshot({path:`${name}-wiki-1280.png`});
  // click database chip
  const chip = p.locator(':is(button,a,label):visible', {hasText:/^데이터베이스\s*8$/}).first();
  console.log(name,'chip count', await p.locator(':is(button,a,label):visible', {hasText:/^데이터베이스\s*8$/}).count());
  await chip.click(); await p.waitForTimeout(700);
  const r1 = await p.evaluate(()=>({url:location.href, titles:[...document.querySelectorAll('h2,h3')].filter(h=>h.getBoundingClientRect().height>0).map(h=>h.innerText.trim()).slice(0,12)}));
  console.log(name,'after DB chip', JSON.stringify(r1));
  // wiki local search
  const inp = p.locator('input:visible').first();
  await inp.fill('oracle'); await p.waitForTimeout(1200);
  const r2 = await p.evaluate(()=>({titles:[...document.querySelectorAll('h2,h3')].filter(h=>h.getBoundingClientRect().height>0).map(h=>h.innerText.trim()).slice(0,12), status:[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>e.innerText.trim()).filter(Boolean)}));
  console.log(name,'after oracle filter', JSON.stringify(r2));
  await p.screenshot({path:`${name}-wiki-filter.png`});
  await p.close();
}
await b.close();
