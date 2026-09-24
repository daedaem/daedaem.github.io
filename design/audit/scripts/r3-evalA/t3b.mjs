import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const res={};
// CUR subresult
{ const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
  await p.keyboard.press('Control+k'); await p.waitForTimeout(500);
  res.curCtrlK=await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.placeholder);
  await p.keyboard.type('rollbackFor'); await p.waitForTimeout(1500);
  await p.locator('a:visible:has-text("고르지 않은 대안")').first().click(); await p.waitForTimeout(1200);
  res.curSub=await p.evaluate(()=>{const w=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);let n,h=[];while(n=w.nextNode()){if(n.textContent.includes('rollbackFor')){const g=document.createRange();g.selectNodeContents(n);h.push(Math.round(g.getBoundingClientRect().top))}}return {url:decodeURI(location.href),hits:h,vh:innerHeight}});
  await p.screenshot({path:'t3b-cur-sub.png'});
  // zero result search
  await p.keyboard.press('Control+k'); await p.waitForTimeout(500);
  await p.keyboard.press('Control+a'); await p.keyboard.type('zqxwvu'); await p.waitForTimeout(1500);
  res.curZero=await p.evaluate(()=>{const d=document.querySelector('dialog[open]')||document.body;return d.innerText.slice(0,400)});
  await p.screenshot({path:'t3b-cur-zero.png'});
  // Korean body-only word
  await p.keyboard.press('Control+a'); await p.keyboard.type('선행 와일드카드'); await p.waitForTimeout(1500);
  res.curKo=await p.evaluate(()=>{const d=document.querySelector('dialog[open]')||document.body;return d.innerText.slice(0,300)});
  await p.close(); }
{ const p=await b.newPage({viewport:{width:1280,height:900}});
  await p.goto('http://127.0.0.1:8817/',{waitUntil:'networkidle'});
  await p.keyboard.press('Control+k'); await p.waitForTimeout(500);
  res.newCtrlK=await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.placeholder);
  await p.keyboard.type('zqxwvu'); await p.waitForTimeout(1000);
  res.newZero=await p.evaluate(()=>{const d=document.querySelector('dialog[open]')||document.body;return d.innerText.slice(0,400)});
  await p.screenshot({path:'t3b-new-zero.png'});
  await p.keyboard.press('Control+a'); await p.keyboard.type('선행 와일드카드'); await p.waitForTimeout(1000);
  res.newKo=await p.evaluate(()=>{const d=document.querySelector('dialog[open]')||document.body;return d.innerText.slice(0,300)});
  await p.keyboard.press('Control+a'); await p.keyboard.type('rollbackFor'); await p.waitForTimeout(800);
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  res.newEnter=await p.evaluate(()=>({url:location.href,sy:scrollY,mark:(()=>{const m=document.querySelector('main mark, [class*=hit]');if(!m)return null;const s=getComputedStyle(m);return {bg:s.backgroundColor,c:s.color,txt:m.innerText}})()}));
  await p.close(); }
console.log(JSON.stringify(res,null,1));
await b.close();
