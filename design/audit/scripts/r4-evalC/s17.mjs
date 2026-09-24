import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p = await b.newPage({viewport:{width:1280,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{if(m.type()=='error')errs.push('console:'+m.text())});
for (const h of ['#post-nope','#wiki-nope','#foo','']) {
 await p.goto('http://127.0.0.1:8817/'+h,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
 console.log(JSON.stringify(h), await p.title(), '|', (await p.evaluate(()=>{const m=[...document.querySelectorAll('main > *, main section, [data-view]')].find(e=>e.getBoundingClientRect().height>50); return (m?m.innerText:document.body.innerText).slice(0,200).replace(/\n/g,' / ')})));
 await p.screenshot({path:'new-hash'+h.replace(/\W/g,'_')+'.png'});
}
// check nav ordering: home 'recent' vs posts; skip-link
console.log('errors', errs);
// check document title changes per post
await p.goto('http://127.0.0.1:8817/#post-address-search-9s-to-100ms',{waitUntil:'networkidle'}); await p.waitForTimeout(300);
console.log('post title', await p.title());
await b.close();
