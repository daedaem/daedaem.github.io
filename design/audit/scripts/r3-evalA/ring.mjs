import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const lum=([r,g,bb])=>{const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(r)+0.7152*f(g)+0.0722*f(bb)};
const cr=(a,c)=>{const x=lum(a),y=lum(c);return ((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05)).toFixed(2)};
for (const [s,u] of [['new','http://127.0.0.1:8817/'],['cur','http://127.0.0.1:8831/']]) for (const theme of ['light','dark']) {
const ctx=await b.newContext({viewport:{width:1280,height:900},colorScheme:theme}); const p=await ctx.newPage();
await p.addInitScript(t=>{try{localStorage.setItem('theme',t);localStorage.setItem('dd6-theme',t)}catch(e){}},theme);
await p.goto(u,{waitUntil:'networkidle'});
const rows=[];
for(let i=0;i<10;i++){ await p.keyboard.press('Tab'); rows.push(await p.evaluate(()=>{const a=document.activeElement;const s=getComputedStyle(a);const m=s.outlineColor.match(/[\d.]+/g).map(Number);return {t:(a.innerText||a.getAttribute('aria-label')||'').trim().slice(0,10),style:s.outlineStyle,w:s.outlineWidth,c:m.slice(0,3),bg:getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number).slice(0,3)}})); }
console.log(s,theme,rows.map(r=>`${r.t}:${r.style}/${r.w}/${r.style==='auto'?'auto':cr(r.c,r.bg)}`).join(' | '));
await p.screenshot({path:`ring-${s}-${theme}.png`,clip:{x:0,y:0,width:1280,height:120}});
await ctx.close();}
await b.close();
