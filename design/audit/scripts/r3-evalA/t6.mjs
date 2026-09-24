import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const focusInfo=()=>{const a=document.activeElement; if(!a||a===document.body) return {tag:'BODY'}; const s=getComputedStyle(a); const r=a.getBoundingClientRect(); const hdr=document.querySelector('header'); const hb=hdr?hdr.getBoundingClientRect().bottom:0; const inHeader=hdr&&hdr.contains(a);
 const ring=(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)?('outline '+s.outlineWidth+' '+s.outlineColor):(s.boxShadow!=='none'?'shadow':'NONE');
 return {tag:a.tagName,t:(a.innerText||a.getAttribute('aria-label')||a.placeholder||'').replace(/\s+/g,' ').trim().slice(0,28),href:a.getAttribute('href'),ring,y:Math.round(r.y),h:Math.round(r.height),obscured:!inHeader&&r.y<hb&&r.bottom>0?'UNDER-HEADER':(r.bottom<0||r.y>innerHeight?'OFFSCREEN':'')}};
const sites={new:{home:'http://127.0.0.1:8817/',post:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms'},cur:{home:'http://127.0.0.1:8831/',post:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'}};
for (const s of ['new','cur']) {
  const p=await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(sites[s].home,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
  const seq=[];
  for(let i=0;i<10;i++){ await p.keyboard.press('Tab'); seq.push(await p.evaluate(focusInfo)); if(i===0) await p.screenshot({path:`t6-${s}-skip.png`,clip:{x:0,y:0,width:1280,height:200}}); }
  console.log('\n==',s,'home tab seq'); seq.forEach((x,i)=>console.log(i+1,JSON.stringify(x)));
  // skip link activation
  await p.goto(sites[s].home,{waitUntil:'networkidle'}); await p.keyboard.press('Tab'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  const afterSkip=await p.evaluate(focusInfo); await p.keyboard.press('Tab'); const nextAfterSkip=await p.evaluate(focusInfo);
  console.log('after skip Enter:',JSON.stringify(afterSkip),'url',p.url(),' next tab:',JSON.stringify(nextAfterSkip));
  // open search via keyboard: tab to search button
  await p.goto(sites[s].home,{waitUntil:'networkidle'});
  let k=0; for(;k<15;k++){ await p.keyboard.press('Tab'); const f=await p.evaluate(focusInfo); if(/검색/.test(f.t)) break; }
  console.log('tabs to search button:',k+1);
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  console.log('focus after open:',JSON.stringify(await p.evaluate(focusInfo)));
  // tab trap check
  const trap=[]; for(let i=0;i<8;i++){ await p.keyboard.press('Tab'); const f=await p.evaluate(()=>{const a=document.activeElement;const d=a.closest('dialog,[role=dialog]');return (d?'IN':'OUT')+':'+a.tagName+':'+(a.innerText||a.getAttribute('aria-label')||a.placeholder||'').replace(/\s+/g,' ').slice(0,20)}); trap.push(f);} console.log('tab in dialog:',trap.join(' | '));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  console.log('after Esc: dialogOpen=',await p.evaluate(()=>!!document.querySelector('dialog[open]')),'focus=',JSON.stringify(await p.evaluate(focusInfo)));
  // Esc with text typed: does Esc clear first or close?
  await p.keyboard.press('Control+k'); await p.waitForTimeout(400); await p.keyboard.type('spring'); await p.waitForTimeout(600); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  console.log('Esc with query: dialogOpen=',await p.evaluate(()=>!!document.querySelector('dialog[open]')));
  if (await p.evaluate(()=>!!document.querySelector('dialog[open]'))) { await p.keyboard.press('Escape'); await p.waitForTimeout(300); }
  // post: tab through
  await p.goto(sites[s].post,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  const pseq=[]; for(let i=0;i<45;i++){ await p.keyboard.press('Tab'); pseq.push(await p.evaluate(focusInfo)); }
  console.log('post tab seq:'); pseq.forEach((x,i)=>console.log(' ',i+1,x.tag,x.t,x.href?('['+x.href.slice(0,30)+']'):'',x.ring,x.y,x.obscured));
  console.log('errs',errs);
  await p.close();
}
await b.close();
