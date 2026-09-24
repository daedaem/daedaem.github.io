import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [name,url] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
 for (const q of ['Oracle','트랜잭션','오라클','롤백 안됨','transactional']) {
  const p = await b.newPage({viewport:{width:1280,height:900}});
  await p.goto(url,{waitUntil:'networkidle'}); await p.waitForTimeout(300);
  await p.keyboard.press('Control+k'); await p.waitForTimeout(700);
  const foc = await p.evaluate(()=>document.activeElement.tagName+' '+document.activeElement.type+' ph='+document.activeElement.placeholder);
  await p.keyboard.type(q,{delay:30}); await p.waitForTimeout(1800);
  const res = await p.evaluate(()=>{
    const dlg=document.querySelector('dialog[open]')||document.querySelector('[role=dialog]:not([hidden])')||document.body;
    return dlg.innerText.slice(0,1500).replace(/\n+/g,' | ');
  });
  console.log('==',name,JSON.stringify(q),'focus:',foc,'\n',res);
  await p.screenshot({path:`${name}-search-${q.replace(/\W/g,'_')||'ko'+q.length}.png`});
  await p.close();
 }
}
await b.close();
