import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8831/posts/address-search-9s-to-100ms/',{waitUntil:'networkidle'});
for(let i=0;i<34;i++) await p.keyboard.press('Tab');
await p.waitForTimeout(400);
const info=await p.evaluate(()=>{const a=document.activeElement;const s=getComputedStyle(a);const r=a.getBoundingClientRect();return {t:a.innerText.slice(0,30),outline:s.outline,shadow:s.boxShadow,td:s.textDecorationLine,bg:s.backgroundColor,r:[r.x,r.y,r.width,r.height].map(Math.round), parentOutline:getComputedStyle(a.parentElement).outline}});
console.log(info);
await p.screenshot({path:'t6b-cur-related-focus.png',clip:{x:Math.max(0,info.r[0]-40),y:Math.max(0,info.r[1]-60),width:760,height:260}});
// NEW home focus on card
const q=await b.newPage({viewport:{width:1280,height:900}});
await q.goto('http://127.0.0.1:8817/',{waitUntil:'networkidle'});
for(let i=0;i<13;i++) await q.keyboard.press('Tab');
await q.waitForTimeout(400);
const i2=await q.evaluate(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();return {t:a.innerText.slice(0,30),r:[r.x,r.y,r.width,r.height].map(Math.round)}});
console.log(i2);
await q.screenshot({path:'t6b-new-card-focus.png'});
await b.close();
