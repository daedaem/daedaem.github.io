import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
for (const [name,url] of [['new','http://127.0.0.1:8817/#post-'+slug],['cur','http://127.0.0.1:8831/posts/'+slug+'/']]) {
 for (const vw of [1280,390]) {
  const p = await b.newPage({viewport:{width:vw,height:vw==1280?900:844}});
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(600);
  await p.screenshot({path:`${name}-post-${vw}.png`});
  await p.screenshot({path:`${name}-post-${vw}-full.png`,fullPage:true});
  const info = await p.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!='hidden'&&s.display!='none'};
    const hs=[...document.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.tagName+' y='+Math.round(h.getBoundingClientRect().top+scrollY)+' '+h.innerText.trim().slice(0,70));
    const navs=[...document.querySelectorAll('nav,aside,details')].filter(vis).map(n=>n.tagName+'.'+n.className+' aria='+n.getAttribute('aria-label')+' y='+Math.round(n.getBoundingClientRect().top+scrollY)+' x='+Math.round(n.getBoundingClientRect().left)+' w='+Math.round(n.getBoundingClientRect().width)+' :: '+n.innerText.trim().replace(/\n/g,' | ').slice(0,200));
    const imgs=[...document.images].filter(vis).map(i=>({src:i.getAttribute('src').slice(0,60),alt:i.alt, nat:i.naturalWidth+'x'+i.naturalHeight, disp:Math.round(i.getBoundingClientRect().width)+'x'+Math.round(i.getBoundingClientRect().height), fit:getComputedStyle(i).objectFit, y:Math.round(i.getBoundingClientRect().top+scrollY)}));
    const art=document.querySelector('article:not([hidden])')||document.querySelector('main');
    const body=[...document.querySelectorAll('article p, .prose p, main p')].filter(vis)[3];
    const cs=body?getComputedStyle(body):null;
    return {h:document.documentElement.scrollHeight, hs, navs, imgs, bodyFont: cs&&(cs.fontSize+' / '+cs.lineHeight+' '+cs.fontFamily.slice(0,60)+' color '+cs.color+' width '+Math.round(body.getBoundingClientRect().width)), top: document.body.innerText.slice(0,1200)};
  });
  console.log('=====',name,vw,JSON.stringify(info,null,1));
  await p.close();
 }
}
await b.close();
