import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const res={};
const tocInfo = async (p)=>p.evaluate(()=>{
  const vis=e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'};
  const navs=[...document.querySelectorAll('nav, aside, details')].filter(vis).map(n=>{const r=n.getBoundingClientRect();return {tag:n.tagName,cls:n.className.toString().slice(0,50),label:n.getAttribute('aria-label'),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),pos:getComputedStyle(n).position,links:n.querySelectorAll('a').length}});
  const fixed=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&['fixed','sticky'].includes(getComputedStyle(e).position)).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,cls:e.className.toString().slice(0,50),aria:e.getAttribute('aria-label'),txt:e.innerText.slice(0,30).replace(/\s+/g,' '),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),pos:getComputedStyle(e).position}});
  const h2=[...document.querySelectorAll('article h2, article h3, main h2, main h3')].filter(vis).map(e=>({t:e.innerText.slice(0,25),id:e.id,y:Math.round(e.getBoundingClientRect().y+scrollY)}));
  return {url:location.href,title:document.title,docH:document.documentElement.scrollHeight,navs,fixed,h2count:h2.length,h2:h2.slice(0,20)};
});
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) {
 // NEW
 {
  const p = await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8817/',{waitUntil:'networkidle'});
  // path: nav 글 -> find post
  const navGl = vp==='d' ? p.locator('header a[href="#posts"]') : p.locator('a[href="#posts"]:visible').last();
  await navGl.first().click(); await p.waitForTimeout(400);
  await p.screenshot({path:`t2-new-${vp}-posts.png`});
  const link=p.locator('a[href="#post-address-search-9s-to-100ms"]:visible').first();
  const bb=await link.boundingBox(); 
  res['new'+vp+'_listpos']=bb;
  await link.click(); await p.waitForTimeout(500);
  res['new'+vp+'_post']=await tocInfo(p);
  await p.screenshot({path:`t2-new-${vp}-post.png`});
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.45)); await p.waitForTimeout(400);
  res['new'+vp+'_mid']=(await tocInfo(p)).fixed;
  await p.screenshot({path:`t2-new-${vp}-mid.png`});
  res['new'+vp+'_errs']=errs;
  await p.close();
 }
 {
  const p = await b.newPage({viewport:{width:w,height:h}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
  await p.locator('header a[href="/posts/"]').first().click(); await p.waitForLoadState('networkidle');
  await p.screenshot({path:`t2-cur-${vp}-posts.png`});
  const link=p.locator('main a[href="/posts/address-search-9s-to-100ms/"]:visible').first();
  res['cur'+vp+'_listpos']=await link.boundingBox();
  await link.click(); await p.waitForLoadState('networkidle');
  res['cur'+vp+'_post']=await tocInfo(p);
  await p.screenshot({path:`t2-cur-${vp}-post.png`});
  await p.evaluate(()=>scrollTo(0,document.documentElement.scrollHeight*0.45)); await p.waitForTimeout(400);
  res['cur'+vp+'_mid']=(await tocInfo(p)).fixed;
  await p.screenshot({path:`t2-cur-${vp}-mid.png`});
  res['cur'+vp+'_errs']=errs;
  await p.close();
 }
}
console.log(JSON.stringify(res,null,1));
await b.close();
