import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8831/wiki/',{waitUntil:'networkidle'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('main button.control-button')].map(b=>b.innerText+' disabled='+b.disabled+' aria='+b.getAttribute('aria-disabled'))));
await b.close();
