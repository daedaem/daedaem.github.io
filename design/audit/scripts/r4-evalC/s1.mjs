import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const out={};
for (const [name,url] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
 for (const [vw,vh] of [[1280,900],[390,844]]) {
  const p = await b.newPage({viewport:{width:vw,height:vh}});
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(600);
  await p.screenshot({path:`${name}-home-${vw}.png`});
  await p.screenshot({path:`${name}-home-${vw}-full.png`,fullPage:true});
  const info = await p.evaluate(()=>({title:document.title, h: document.documentElement.scrollHeight, text: document.body.innerText.slice(0,3000), links:[...document.querySelectorAll('a')].slice(0,80).map(a=>a.innerText.trim().slice(0,40)+' -> '+a.getAttribute('href'))}));
  out[`${name}-${vw}`]=info;
  await p.close();
 }
}
console.log(JSON.stringify(out,null,1));
await b.close();
