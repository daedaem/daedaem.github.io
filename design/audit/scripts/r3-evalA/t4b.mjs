import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const out={};
for (const [vp,w,h] of [['d',1280,900],['m',390,844]]) {
// NEW
{ const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8817/#wiki',{waitUntil:'networkidle'});
  const r={};
  const count=async()=>p.evaluate(()=>{const s=[...document.querySelectorAll('main *')].find(e=>e.children.length===0&&/개 문서|결과|없/.test(e.textContent)&&e.getBoundingClientRect().height>0);return s&&s.textContent.trim().slice(0,80)});
  await p.locator('button:visible',{hasText:'.NET'}).first().click(); await p.waitForTimeout(300); r.net=await count();
  await p.locator('button:visible',{hasText:'보완 중'}).first().click(); await p.waitForTimeout(300); r.netWip=await count();
  r.hist=await p.evaluate(()=>({url:location.href,len:history.length}));
  await p.screenshot({path:`t4b-new-${vp}-combo.png`});
  // zero via text
  await p.locator('main input[type=search]:visible').fill('kubernetes'); await p.waitForTimeout(500);
  r.zeroTxt=await p.evaluate(()=>{const m=document.querySelector('.view.on, main');return [...m.querySelectorAll('*')].filter(e=>e.children.length<=1&&/없|찾|초기화|해제|지우/.test(e.textContent)&&e.getBoundingClientRect().height>0).map(e=>e.tagName+':'+e.textContent.trim().slice(0,80)).slice(0,10)});
  r.buttons=await p.evaluate(()=>[...document.querySelectorAll('main button, main a')].filter(e=>e.getBoundingClientRect().height>0&&/초기화|해제|지우|전체|모두|검색/.test(e.innerText)).map(e=>e.innerText.trim().slice(0,30)));
  r.live=await p.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>e.getAttribute('aria-live')+':'+e.innerText.slice(0,60)));
  await p.screenshot({path:`t4b-new-${vp}-zero.png`});
  // recover: click reset-like button
  const rec=p.locator('main button:visible').filter({hasText:/초기화|해제|모두|지우/}).first();
  r.recCount=await rec.count();
  if (r.recCount){ r.recText=await rec.innerText(); await rec.click(); await p.waitForTimeout(400); r.afterRec=await count(); r.afterRecInput=await p.locator('main input[type=search]:visible').inputValue(); r.afterRecPressed=await p.evaluate(()=>[...document.querySelectorAll('main button[aria-pressed=true]')].map(b=>b.innerText.trim()));}
  // go to an item then back: are filters preserved?
  await p.locator('button:visible',{hasText:'데이터베이스'}).first().click(); await p.waitForTimeout(300);
  await p.locator('main a[href^="#wiki-"]:visible').first().click(); await p.waitForTimeout(500);
  await p.goBack(); await p.waitForTimeout(600);
  r.afterBackPressed=await p.evaluate(()=>[...document.querySelectorAll('main button[aria-pressed=true]')].filter(b=>b.getBoundingClientRect().height>0).map(b=>b.innerText.trim()));
  r.errs=errs; out['new'+vp]=r; await p.close(); }
// CUR
{ const p=await b.newPage({viewport:{width:w,height:h}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://127.0.0.1:8831/wiki/',{waitUntil:'networkidle'});
  const r={};
  r.topicLinks=await p.evaluate(()=>[...document.querySelectorAll('main a')].filter(a=>/\.NET|Java|Spring/.test(a.innerText)&&a.innerText.length<20).map(a=>a.innerText.trim()+' -> '+a.getAttribute('href')+' pressed='+a.getAttribute('aria-pressed')+' current='+a.getAttribute('aria-current')).slice(0,5));
  const count=async()=>p.evaluate(()=>{const s=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&/개 문서|결과|없습니다/.test(e.textContent)&&e.getBoundingClientRect().height>0).map(e=>e.textContent.trim().slice(0,80));return s});
  await p.locator('main a[data-topic=dotnet]:visible').first().click(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
  r.netUrl=p.url(); r.net=await count();
  // open status disclosure
  const sum=p.locator('summary:visible',{hasText:'상태'}); if(await sum.count()) {await sum.first().click(); await p.waitForTimeout(200);}
  r.selects=await p.evaluate(()=>[...document.querySelectorAll('main select')].map(s=>({name:s.name,label:s.labels[0]&&s.labels[0].innerText.trim(),opts:[...s.options].map(o=>o.value+'='+o.text)})));
  const st=p.locator('main select').first();
  const opts=await st.evaluate(s=>[...s.options].map(o=>o.value));
  for (const v of opts.slice(1)) { await st.selectOption(v); await p.waitForTimeout(400); const c=await count(); if (c.join(' ').match(/0개|없/)) {r.zeroVia=v;break;} }
  r.netStatus=await count(); r.urlAfterStatus=p.url();
  await p.screenshot({path:`t4b-cur-${vp}-combo.png`, fullPage:false});
  await p.locator('main input[type=search]:visible').fill('kubernetes'); await p.waitForTimeout(600);
  r.zeroTxt=await p.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>e.children.length<=1&&/없|찾|초기화|해제|지우/.test(e.textContent)&&e.getBoundingClientRect().height>0).map(e=>e.tagName+':'+e.textContent.trim().slice(0,80)).slice(0,10));
  r.live=await p.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status]')].map(e=>e.getAttribute('aria-live')+':'+e.innerText.slice(0,60)));
  r.urlAfterText=p.url();
  await p.screenshot({path:`t4b-cur-${vp}-zero.png`});
  const rec=p.locator('main button:visible, main a:visible').filter({hasText:/초기화|해제|모두|지우|전체 보기/}).first();
  r.recCount=await rec.count();
  if (r.recCount){ r.recText=await rec.innerText(); await rec.click(); await p.waitForTimeout(600); r.afterRec=await count(); r.afterRecUrl=p.url(); r.afterRecInput=await p.locator('main input[type=search]').first().inputValue();}
  r.resetBtn=await p.evaluate(()=>{const b=document.querySelector('main button[type=reset]');return b&&{t:b.innerText,aria:b.getAttribute('aria-label'),vis:b.getBoundingClientRect().height>0, disabled:b.disabled}});
  // back preserves?
  await p.locator('main a[data-topic=database]:visible').first().click(); await p.waitForLoadState('networkidle');
  const u1=p.url();
  await p.locator('main a[href^="/wiki/"]:visible').filter({hasText:/.{12,}/}).first().click(); await p.waitForLoadState('networkidle');
  await p.goBack(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(500);
  r.backUrl=[u1,p.url()];
  r.errs=errs; out['cur'+vp]=r; await p.close(); }
}
console.log(JSON.stringify(out,null,1));
await b.close();
