import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [name,url] of [['new','http://127.0.0.1:8817/'],['cur','http://127.0.0.1:8831/']]) {
  const p = await b.newPage({viewport:{width:1280,height:900}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text())});
  await p.goto(url,{waitUntil:'networkidle'});
  await p.screenshot({path:`${name}-home-d.png`});
  const info = await p.evaluate(()=>({
    title:document.title,
    h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),
    nav:[...document.querySelectorAll('header a, header button, nav a')].slice(0,40).map(e=>({t:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,40),h:e.getAttribute('href'),vis:e.offsetParent!==null})),
    bodyH:document.body.scrollHeight
  }));
  console.log(name, JSON.stringify(info,null,1), errs);
}
await b.close();
