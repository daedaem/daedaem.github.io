import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const sites={new:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms',cur:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/'};
for (const s of ['new','cur']) {
  const p=await b.newPage({viewport:{width:390,height:844}});
  await p.goto(sites[s],{waitUntil:'networkidle'}); await p.waitForTimeout(400);
  console.log('\n==',s,'initial active:',await p.evaluate(()=>document.activeElement.tagName+':'+(document.activeElement.innerText||'').slice(0,20)));
  console.log('footer:',await p.evaluate(()=>{const f=document.querySelector('footer'); if(!f) return 'none'; const r=f.getBoundingClientRect(); return {vis:r.height>0,h:Math.round(r.height),links:[...f.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().height>0).map(a=>a.innerText.trim()).join(',')}}));
  await p.evaluate(()=>scrollTo(0,3000)); await p.waitForTimeout(500);
  // focus FAB via keyboard: find tab count from somewhere
  await p.evaluate(()=>{document.activeElement.blur()});
  let n=0,f;
  for(;n<80;n++){ await p.keyboard.press('Tab'); f=await p.evaluate(()=>(document.activeElement.innerText||'').trim()); if(f==='목차'&&(await p.evaluate(()=>document.activeElement.tagName))==='BUTTON') break; }
  console.log('tabs to TOC FAB from blur at y=3000:',n+1, 'sy now', await p.evaluate(()=>Math.round(scrollY)));
  await p.keyboard.press('Enter'); await p.waitForTimeout(500);
  console.log('focus in sheet:',await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.innerText.slice(0,25)+' inDialog='+!!document.activeElement.closest('dialog')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  console.log('after Esc: open=',await p.evaluate(()=>!!document.querySelector('dialog[open]')),'focus=',await p.evaluate(()=>document.activeElement.tagName+':'+(document.activeElement.innerText||'').slice(0,15)));
  // backdrop click closes?
  await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  await p.mouse.click(195,100); await p.waitForTimeout(400);
  console.log('after backdrop click: open=',await p.evaluate(()=>!!document.querySelector('dialog[open]')), 'sy',await p.evaluate(()=>Math.round(scrollY)));
  // FAB threshold: when does FAB appear
  const thr=await p.evaluate(async()=>{const vis=()=>{const b=[...document.querySelectorAll('button')].find(b=>b.innerText.trim()==='목차');if(!b)return false;const r=b.getBoundingClientRect();const s=getComputedStyle(b);return r.height>0&&s.visibility!=='hidden'&&parseFloat(s.opacity)>0.5&&r.y<innerHeight};const out=[];for(const y of [0,300,600,900,1200,1500,2000,9000]){scrollTo(0,y);await new Promise(r=>setTimeout(r,350));out.push(y+':'+vis());}return out.join(' ')});
  console.log('FAB visible at scrollY:',thr);
  await p.close();
}
await b.close();
