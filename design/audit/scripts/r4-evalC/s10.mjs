import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
const ctx = await b.newContext({viewport:{width:1280,height:900}, colorScheme:'dark'});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
console.log('cur dark hero', await p.evaluate(()=>{let e=[...document.querySelectorAll('*')].find(e=>e.innerText?.trim().startsWith('조해성의 기술 블로그')&&e.children.length>1); const out=[]; while(e&&e!=document.body){out.push(e.tagName+'.'+e.className+' '+getComputedStyle(e).backgroundColor+' color '+getComputedStyle(e).color); e=e.parentElement;} return out.slice(0,4)}));
await ctx.close();
for (const [site,url] of [['new','http://127.0.0.1:8817/#post-'+slug],['cur','http://127.0.0.1:8831/posts/'+slug+'/']]) for (const vw of [1280,390]) {
  const c = await b.newContext({viewport:{width:vw,height:vw==1280?900:844}});
  const q = await c.newPage(); await q.goto(url,{waitUntil:'networkidle'}); await q.waitForTimeout(400);
  const r = await q.evaluate(()=>{
    const ps=[...document.querySelectorAll('p')].filter(e=>e.getBoundingClientRect().height>0 && e.innerText.startsWith('사내 시스템에서'));
    const pp=ps[0]; const s=getComputedStyle(pp);
    const cpl = Math.round(pp.getBoundingClientRect().width / parseFloat(s.fontSize));
    const small=[...document.querySelectorAll('a,button,input,summary')].filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&getComputedStyle(e).visibility!='hidden'&&(r.height<24||r.width<24)}).map(e=>(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,20)+' '+Math.round(e.getBoundingClientRect().width)+'x'+Math.round(e.getBoundingClientRect().height));
    const meta=[...document.querySelectorAll('time')].filter(e=>e.getBoundingClientRect().height>0).map(t=>t.getAttribute('datetime')+'|'+t.innerText);
    return {font:s.fontSize+'/'+s.lineHeight+' '+s.color+' w='+Math.round(pp.getBoundingClientRect().width)+' ~chars/line '+cpl, smallTargets: small.length, smallEx: small.slice(0,8), times:meta.slice(0,5), hasAuthor: /조해성/.test(document.querySelector('main')?.innerText.slice(0,600)||'')};
  });
  console.log(site,vw,JSON.stringify(r));
  await c.close();
}
await b.close();
