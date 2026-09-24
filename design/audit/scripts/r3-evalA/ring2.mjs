import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const theme of ['light','dark']) {
const ctx=await b.newContext({viewport:{width:1280,height:900},colorScheme:theme,deviceScaleFactor:2}); const p=await ctx.newPage();
await p.addInitScript(t=>{try{localStorage.setItem('theme',t)}catch(e){}},theme);
await p.goto('http://127.0.0.1:8831/',{waitUntil:'networkidle'});
for(let i=0;i<3;i++) await p.keyboard.press('Tab');
await p.screenshot({path:`ring2-cur-${theme}.png`,clip:{x:680,y:0,width:320,height:80}});
await ctx.close();}
await b.close();
