import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
for (const scheme of ['light','dark']) {
 const ctx = await b.newContext({viewport:{width:1280,height:900}, colorScheme:scheme});
 const p = await ctx.newPage();
 await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
 console.log(scheme,'cur hero', await p.evaluate(()=>{const h=[...document.querySelectorAll('section,div,header')].find(e=>e.innerText?.startsWith('조해성의 기술 블로그')); const s=getComputedStyle(h); return s.backgroundColor+' '+s.backgroundImage.slice(0,80)+' body:'+getComputedStyle(document.body).backgroundColor}));
 for (const [site,url] of [['new','http://127.0.0.1:8817/#post-'+slug],['cur','http://127.0.0.1:8831/posts/'+slug+'/']]) {
   await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
   const y = await p.evaluate(()=>{const pre=[...document.querySelectorAll('pre')].find(e=>e.getBoundingClientRect().height>0); const y=pre.getBoundingClientRect().top+scrollY-150; window.scrollTo(0,y); const s=getComputedStyle(pre); const code=pre.querySelector('span')||pre; return {bg:s.backgroundColor, color:getComputedStyle(pre).color, fs:s.fontSize, lh:s.lineHeight, ox:s.overflowX, sw:pre.scrollWidth, cw:pre.clientWidth, n: document.querySelectorAll('pre').length, tables:document.querySelectorAll('article table, .prose table, main table').length, figs:[...document.querySelectorAll('figure, img, svg')].filter(e=>e.getBoundingClientRect().width>100).length}});
   await p.waitForTimeout(300);
   await p.screenshot({path:`${site}-post-code-${scheme}.png`});
   console.log(scheme, site, JSON.stringify(y));
 }
 await ctx.close();
}
await b.close();
