import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const res={};
const sites={new:'http://127.0.0.1:8817/',cur:'http://127.0.0.1:8831/'};
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) for (const s of ['new','cur']) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  await p.goto(sites[s],{waitUntil:'networkidle'});
  const r={};
  await p.locator('header button:visible').filter({hasText:/검색/}).or(p.locator('header button[aria-label*="검색"]:visible')).first().click();
  await p.waitForTimeout(700);
  r.focusAfterOpen=await p.evaluate(()=>{const a=document.activeElement;return a.tagName+' type='+a.type+' ph='+a.placeholder});
  await p.screenshot({path:`t3-${s}-${vp}-open.png`});
  const t0=Date.now();
  await p.keyboard.type('rollbackFor',{delay:30});
  // wait for results
  let found=false;
  for (let i=0;i<30;i++){ await p.waitForTimeout(200); const n=await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>{const r=a.getBoundingClientRect();return r.height>0 && /Transactional|롤백|rollback/i.test(a.innerText)}).length); if(n){found=true;break;} }
  r.ms=Date.now()-t0; r.found=found;
  await p.waitForTimeout(800);
  await p.screenshot({path:`t3-${s}-${vp}-results.png`});
  r.results=await p.evaluate(()=>{
    const dlg=document.querySelector('dialog[open]')||document.querySelector('[role=dialog]')||document.body;
    const as=[...dlg.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().height>0);
    return {n:as.length, items:as.slice(0,8).map(a=>({t:a.innerText.replace(/\s+/g,' ').slice(0,120),href:a.getAttribute('href')})), marks:[...dlg.querySelectorAll('mark')].map(m=>m.innerText).slice(0,5), live:[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>e.innerText.slice(0,60))};
  });
  // click first result
  const first=p.locator('dialog[open] a:visible, [role=dialog] a:visible, .pagefind-ui__result-link:visible').filter({hasText:/Transactional|rollback/i}).first();
  if (await first.count()){
    await first.click(); await p.waitForTimeout(1500);
    r.landing=await p.evaluate(()=>{
      const walker=document.createTreeWalker(document.querySelector('main')||document.body,NodeFilter.SHOW_TEXT);
      let n,hits=[]; while(n=walker.nextNode()){ if(n.textContent.includes('rollbackFor')){ const rg=document.createRange(); rg.selectNodeContents(n); const rr=rg.getBoundingClientRect(); if(rr.height>0) hits.push(Math.round(rr.top)); } }
      return {url:location.href, scrollY:Math.round(scrollY), vh:innerHeight, firstHitTop:hits[0], hitsInView:hits.filter(y=>y>=0&&y<innerHeight).length, totalHits:hits.length, marks:document.querySelectorAll('main mark, article mark').length, hl:!!document.querySelector('[data-pagefind-highlight],.pagefind-highlight, mark.hl')};
    });
    await p.screenshot({path:`t3-${s}-${vp}-landing.png`});
  }
  r.errs=errs; res[s+vp]=r; await ctx.close();
}
console.log(JSON.stringify(res,null,1));
await b.close();
