import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pages={new:{home:'http://127.0.0.1:8817/#home',post:'http://127.0.0.1:8817/#post-address-search-9s-to-100ms',wiki:'http://127.0.0.1:8817/#wiki',posts:'http://127.0.0.1:8817/#posts'},cur:{home:'http://127.0.0.1:8831/',post:'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/',wiki:'http://127.0.0.1:8831/wiki/',posts:'http://127.0.0.1:8831/posts/'}};
const fn=()=>{
  const cv=document.createElement('canvas').getContext('2d');
  const parse=c=>{cv.fillStyle='#000';cv.fillStyle=c; let s=cv.fillStyle; if(s[0]==='#'){return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),1]} const m=s.match(/[\d.]+/g).map(Number); return [m[0],m[1],m[2],m[3]??1]};
  const lum=([r,g,b])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
  const comp=(fg,bg)=>[fg[0]*fg[3]+bg[0]*(1-fg[3]),fg[1]*fg[3]+bg[1]*(1-fg[3]),fg[2]*fg[3]+bg[2]*(1-fg[3]),1];
  const bgOf=el=>{const stack=[];let e=el;while(e){const s=getComputedStyle(e);const c=parse(s.backgroundColor);if(s.backgroundImage!=='none'&&!/gradient/.test(s.backgroundImage)) return null; if(c[3]>0) stack.push(c); if(c[3]>=1)break; e=e.parentElement;} let bg=[255,255,255,1]; if(!e){const hb=parse(getComputedStyle(document.documentElement).backgroundColor); if(hb[3]>0) bg=hb;} for(let i=stack.length-1;i>=0;i--) bg=comp(stack[i],bg); return bg;};
  const out=[];
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;const seen=new Set();
  while(n=walker.nextNode()){ if(!n.textContent.trim())continue; const el=n.parentElement; if(seen.has(el))continue; seen.add(el);
    const r=el.getBoundingClientRect(); if(r.width===0||r.height===0)continue; const s=getComputedStyle(el); if(s.visibility==='hidden'||parseFloat(s.opacity)===0)continue;
    if(el.closest('[aria-hidden=true],pre,svg'))continue;
    let op=1; let e=el; while(e){op*=parseFloat(getComputedStyle(e).opacity); e=e.parentElement;}
    const bg=bgOf(el); if(!bg)continue; let fg=parse(s.color); fg=[fg[0],fg[1],fg[2],fg[3]*op]; const f=comp(fg,bg);
    const L1=lum(f),L2=lum(bg); const cr=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
    const fs=parseFloat(s.fontSize), fw=parseInt(s.fontWeight); const large=fs>=24||(fs>=18.66&&fw>=700);
    out.push({t:n.textContent.trim().slice(0,28),cr:Math.round(cr*100)/100,fs,large,tag:el.tagName,cls:(el.className||'').toString().slice(0,25)});
  }
  return out;
};
const res={};
for (const s of ['new','cur']) for (const theme of ['light','dark']) for (const [pg,u] of Object.entries(pages[s])) {
  const ctx=await b.newContext({viewport:{width:1280,height:900},colorScheme:theme}); const p=await ctx.newPage();
  await p.addInitScript(t=>{try{localStorage.setItem('theme',t);localStorage.setItem('dd6-theme',t)}catch(e){}},theme);
  await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
  const all=await p.evaluate(fn);
  const fails=all.filter(x=>x.cr<(x.large?3:4.5));
  const min=all.reduce((a,x)=>x.cr<a.cr?x:a,{cr:99});
  res[`${s}-${theme}-${pg}`]={n:all.length,fails:fails.length,min,sample:fails.slice(0,6)};
  await ctx.close();
}
for (const [k,v] of Object.entries(res)) console.log(k,'n='+v.n,'fails='+v.fails,'min='+JSON.stringify(v.min),'\n   ',JSON.stringify(v.sample));
await b.close();
