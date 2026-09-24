import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const scheme of ['light','dark']){
const ctx = await b.newContext({viewport:{width:1280,height:900}, colorScheme:scheme});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
console.log(scheme, await p.evaluate(()=>{let e=document.elementFromPoint(900,280); const out=[]; while(e&&e!=document.documentElement){const s=getComputedStyle(e); if(s.backgroundColor!='rgba(0, 0, 0, 0)'||s.backgroundImage!='none') out.push(e.tagName+'.'+e.className+' bg='+s.backgroundColor+' img='+s.backgroundImage.slice(0,60)); e=e.parentElement;} const t=[...document.querySelectorAll('h1,p')].find(x=>x.innerText.includes('증상이')); return out.concat(['h1 color '+getComputedStyle(t).color])}));
await ctx.close();}
await b.close();
