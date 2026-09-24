import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const sites={new:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms',cur:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'};
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) for (const s of ['new','cur']) {
  const p=await b.newPage({viewport:{width:w,height:h}});
  await p.goto(sites[s],{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
  await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(1500);
  const m=async()=>p.evaluate(()=>{const el=document.elementFromPoint(innerWidth/2-(innerWidth>800?150:0),300);return [Math.round(scrollY),document.documentElement.scrollHeight,el&&el.textContent.trim().slice(0,20)]});
  const a=await m();
  // keyboard/JS click, no playwright scrolling
  await p.evaluate(()=>{const b=[...document.querySelectorAll('header button')].find(b=>/모드/.test(b.getAttribute('aria-label')||'')&&b.getBoundingClientRect().height>0); b.click();});
  const t=[]; for (const d of [50,300,1000]) { await p.waitForTimeout(d); t.push(await m()); }
  console.log(s,vp,'before',JSON.stringify(a),'after',JSON.stringify(t));
  // toggle back
  await p.evaluate(()=>{const b=[...document.querySelectorAll('header button')].find(b=>/모드/.test(b.getAttribute('aria-label')||'')&&b.getBoundingClientRect().height>0); b.click();});
  await p.waitForTimeout(1000); console.log('   back to light', JSON.stringify(await m()));
  await p.close();
}
await b.close();
