import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const res={};
const sites={new:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms',cur:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'};
const target='4. 조회 방식을 바꾸다';
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) for (const s of ['new','cur']) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(sites[s],{waitUntil:'networkidle'}); await p.waitForTimeout(300);
  const histStart=await p.evaluate(()=>history.length);
  const r={};
  // scroll to mid
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.3)); await p.waitForTimeout(500);
  if (vp==='m') {
    const fab=p.locator('button:has-text("목차"):visible').last();
    r.fabCount=await p.locator('button:has-text("목차"):visible').count();
    r.fabAttrs=await fab.evaluate(e=>({aria:e.getAttribute('aria-label'),exp:e.getAttribute('aria-expanded'),controls:e.getAttribute('aria-controls'),haspopup:e.getAttribute('aria-haspopup')}));
    await fab.click(); await p.waitForTimeout(500);
    await p.screenshot({path:`t2b-${s}-m-tocopen.png`});
    r.sheet=await p.evaluate(()=>{const d=document.activeElement; return {active:d.tagName+'.'+d.className+':'+(d.innerText||'').slice(0,20), dialogs:[...document.querySelectorAll('dialog[open],[role=dialog]')].map(x=>{const rr=x.getBoundingClientRect();return {tag:x.tagName,y:Math.round(rr.y),h:Math.round(rr.height),modal:x.getAttribute('aria-modal'),label:x.getAttribute('aria-label')}})}});
    // highlighted current?
    r.currentInSheet=await p.evaluate(()=>[...document.querySelectorAll('[aria-current],.active,.is-active,.current')].filter(e=>e.getBoundingClientRect().height>0).map(e=>e.innerText.slice(0,30)));
  }
  const link=p.locator(`a:visible:has-text("${target}")`).first();
  r.linkHref=await link.getAttribute('href');
  const sy0=await p.evaluate(()=>scrollY);
  await link.click(); await p.waitForTimeout(1200);
  r.after=await p.evaluate((t)=>{const hh=[...document.querySelectorAll('h2,h3')].find(e=>e.innerText.trim()===t&&e.getBoundingClientRect().height>0); const hdr=document.querySelector('header'); return {url:location.href, scrollY:Math.round(scrollY), headingTop:hh&&Math.round(hh.getBoundingClientRect().top), headerBottom:Math.round(hdr.getBoundingClientRect().bottom), histLen:history.length, focus:document.activeElement.tagName+':'+(document.activeElement.innerText||'').slice(0,20), openDialogs:document.querySelectorAll('dialog[open]').length}},target);
  r.histStart=histStart; r.sy0=sy0;
  r.currentToc=await p.evaluate(()=>[...document.querySelectorAll('nav a[aria-current], nav a.active, nav a.is-active')].map(e=>e.innerText.slice(0,30)));
  await p.screenshot({path:`t2b-${s}-${vp}-jump.png`});
  // back behaviour
  await p.goBack({timeout:3000}).catch(e=>r.backErr=e.message.slice(0,60)); await p.waitForTimeout(800);
  r.afterBack=await p.evaluate(()=>({url:location.href,scrollY:Math.round(scrollY),title:document.title}));
  r.errs=errs;
  res[s+vp]=r; await ctx.close();
}
console.log(JSON.stringify(res,null,1));
await b.close();
