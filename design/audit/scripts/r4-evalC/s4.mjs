import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const slug='address-search-9s-to-100ms';
for (const [name,url] of [['new','http://127.0.0.1:8817/#post-'+slug],['cur','http://127.0.0.1:8831/posts/'+slug+'/']]) {
  const ctx = await b.newContext({viewport:{width:390,height:844}, hasTouch:true, isMobile:true, deviceScaleFactor:2});
  const p = await ctx.newPage();
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
  await p.evaluate(()=>window.scrollTo(0, document.documentElement.scrollHeight*0.45)); await p.waitForTimeout(700);
  await p.screenshot({path:`${name}-m-mid.png`});
  const fixed = await p.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>{const s=getComputedStyle(e);return (s.position=='fixed'||s.position=='sticky') && e.getBoundingClientRect().height>0 && s.display!='none' && s.visibility!='hidden'}).map(e=>e.tagName+'.'+(e.className||'')+' '+JSON.stringify(e.getBoundingClientRect().toJSON?{x:Math.round(e.getBoundingClientRect().x),y:Math.round(e.getBoundingClientRect().y),w:Math.round(e.getBoundingClientRect().width),h:Math.round(e.getBoundingClientRect().height)}:0)+' op='+getComputedStyle(e).opacity+' "'+e.innerText.trim().replace(/\n/g,'|').slice(0,60)+'"'));
  console.log('==',name,'fixed/sticky at mid:',fixed.join('\n  '));
  // scroll up a bit to see if header reappears
  await p.mouse.wheel(0,-300); await p.waitForTimeout(600);
  await p.screenshot({path:`${name}-m-mid-up.png`});
  await ctx.close();
}
await b.close();
