import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const out={};
for (const [name,url] of [['new','http://127.0.0.1:8817/'],['cur','http://127.0.0.1:8831/']]) {
 for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) {
  const p = await b.newPage({viewport:{width:w,height:h}, deviceScaleFactor:1});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  await p.goto(url,{waitUntil:'networkidle'});
  await p.screenshot({path:`t1-${name}-${vp}-full.png`, fullPage:true});
  await p.screenshot({path:`t1-${name}-${vp}-fold.png`});
  out[name+vp]=await p.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
    const hdr=document.querySelector('header');
    const links=[...document.querySelectorAll('header a, header button')].filter(vis).map(e=>{const r=e.getBoundingClientRect();return {t:(e.innerText||e.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim().slice(0,30),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}});
    const author=[...document.querySelectorAll('body *')].find(e=>vis(e)&&e.children.length===0&&/조해성/.test(e.textContent));
    const ar=author&&author.getBoundingClientRect();
    return {headerH:hdr&&Math.round(hdr.getBoundingClientRect().height), links, author: author&&{t:author.textContent.trim().slice(0,40),y:Math.round(ar.y)}, docH:document.documentElement.scrollHeight,
      sections:[...document.querySelectorAll('main h2, main h3')].filter(vis).map(e=>({t:e.innerText.slice(0,30),y:Math.round(e.getBoundingClientRect().y+scrollY)})).slice(0,15)};
  });
  out[name+vp].errs=errs;
  await p.close();
 }
}
console.log(JSON.stringify(out,null,1));
await b.close();
