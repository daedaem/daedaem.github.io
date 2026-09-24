import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const sites={new:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms',cur:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'};
const out={};
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) for (const s of ['new','cur']) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(sites[s],{waitUntil:'networkidle'}); await p.waitForTimeout(300);
  const r={};
  await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(600);
  const anchor=async()=>p.evaluate(()=>{const el=document.elementFromPoint(innerWidth/2 - (innerWidth>800?150:0), 300); return {sy:Math.round(scrollY), el:el&&el.textContent.trim().slice(0,30), theme:document.documentElement.getAttribute('data-theme')||document.documentElement.className, bg:getComputedStyle(document.body).backgroundColor}});
  r.before=await anchor();
  const tbtn=p.locator('header button[aria-label*="모드"]:visible, header button[aria-label*="테마"]:visible').first();
  r.tbtnLabel=await tbtn.getAttribute('aria-label'); r.tbtnPressed=await tbtn.getAttribute('aria-pressed');
  await tbtn.click(); await p.waitForTimeout(700);
  r.after=await anchor();
  r.tbtnLabelAfter=await tbtn.getAttribute('aria-label');
  await p.screenshot({path:`t5-${s}-${vp}-dark.png`});
  r.ls=await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(localStorage))).slice(0,200));
  // navigate to next post via prev/next nav
  await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(300);
  const nextLink=p.locator('nav[aria-label="이전·다음 글"] a:visible').first();
  r.nextHref=await nextLink.getAttribute('href');
  await nextLink.click(); await p.waitForTimeout(1200);
  r.onNext=await anchor(); r.nextUrl=p.url();
  await p.evaluate(()=>scrollTo(0,1500)); await p.waitForTimeout(400);
  await p.goBack(); await p.waitForTimeout(1200);
  r.back=await anchor(); r.backUrl=p.url();
  await p.goForward(); await p.waitForTimeout(1200);
  r.fwd=await anchor(); r.fwdUrl=p.url();
  // reload persists theme?
  await p.reload({waitUntil:'networkidle'}); await p.waitForTimeout(400);
  r.reload=await anchor();
  r.errs=errs; out[s+vp]=r; await ctx.close();
}
console.log(JSON.stringify(out,null,1));
await b.close();
