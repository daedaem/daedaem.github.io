import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
for (const [name,start,url,fab] of [['new','http://127.0.0.1:8817/#posts','http://127.0.0.1:8817/#post-'+slug,'button.fab'],['cur','http://127.0.0.1:8831/posts/','http://127.0.0.1:8831/posts/'+slug+'/','button.toc-fab']]) {
  const ctx = await b.newContext({viewport:{width:390,height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2});
  const p = await ctx.newPage();
  await p.goto(start,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
  await p.evaluate(()=>window.scrollTo(0,400)); await p.waitForTimeout(300);
  // click post link
  await p.click(`a[href*="${slug}"]:visible`); await p.waitForTimeout(900);
  console.log('==',name,'after click url',p.url(),'scrollY',await p.evaluate(()=>scrollY));
  await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight*0.45)); await p.waitForTimeout(500);
  await p.tap(fab); await p.waitForTimeout(600);
  await p.screenshot({path:`${name}-m-tocopen.png`});
  const tocInfo = await p.evaluate(()=>{const d=document.querySelector('dialog[open], [role=dialog]:not([hidden]), .sheet.open, .toc-sheet, details[open]'); return d? d.tagName+'.'+d.className+' '+d.innerText.slice(0,300).replace(/\n/g,'|'):'none'});
  console.log('toc container',tocInfo, 'focus', await p.evaluate(()=>document.activeElement.tagName+' '+document.activeElement.className+' '+document.activeElement.innerText?.slice(0,30)));
  // tap "4. 조회 방식을 바꾸다"
  const link = p.locator('a:visible', {hasText:'4. 조회 방식을 바꾸다'}).last();
  await link.tap(); await p.waitForTimeout(1200);
  const pos = await p.evaluate(()=>{const h=[...document.querySelectorAll('h2')].find(h=>h.innerText.includes('4. 조회 방식을 바꾸다')&&h.getBoundingClientRect().height>0); const hd=document.querySelector('header'); return {hTop:Math.round(h.getBoundingClientRect().top), headerBottom:Math.round(hd.getBoundingClientRect().bottom), url:location.href, focus:document.activeElement.tagName}});
  console.log('after toc jump', JSON.stringify(pos));
  await p.screenshot({path:`${name}-m-afterjump.png`});
  await p.goBack(); await p.waitForTimeout(1000);
  console.log('after back url', p.url(), 'scrollY', await p.evaluate(()=>scrollY));
  await p.goBack(); await p.waitForTimeout(1000);
  console.log('after 2nd back url', p.url(), 'scrollY', await p.evaluate(()=>scrollY));
  await p.screenshot({path:`${name}-m-back2.png`});
  await ctx.close();
}
await b.close();
