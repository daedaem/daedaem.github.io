import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const pages = [['new-about','http://127.0.0.1:8817/#about'],['cur-about','http://127.0.0.1:8831/about/'],['new-posts','http://127.0.0.1:8817/#posts'],['cur-posts','http://127.0.0.1:8831/posts/'],['new-wiki','http://127.0.0.1:8817/#wiki'],['cur-wiki','http://127.0.0.1:8831/wiki/'],['new-learn','http://127.0.0.1:8817/#learn'],['cur-learn','http://127.0.0.1:8831/learn/'],['cur-404','http://127.0.0.1:8831/404.html']];
for (const [name,url] of pages) {
  const p = await b.newPage({viewport:{width:1280,height:900}});
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(500);
  await p.screenshot({path:`${name}-1280-full.png`,fullPage:true});
  const info = await p.evaluate(()=>{const vis=[...document.querySelectorAll('main, [role=main], body')].find(e=>e.offsetParent!==null||e.tagName=='BODY'); return {title:document.title, h:document.documentElement.scrollHeight, text: document.body.innerText.slice(0,2500)}});
  console.log('=====',name,info.title,info.h); console.log(info.text);
  await p.close();
}
await b.close();
