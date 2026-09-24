import { chromium } from '../../pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1280,height:900}});
await p.goto('http://127.0.0.1:8817/#wiki',{waitUntil:'networkidle'});
console.log(await p.evaluate(()=>{const v=document.querySelector('.view.on')||document.body;return [...v.querySelectorAll('*')].filter(e=>e.children.length===0&&/보완 중|정리됨/.test(e.textContent)&&e.textContent.length>8).map(e=>e.textContent.trim().slice(0,100)).slice(0,5).concat([...v.querySelectorAll('[title]')].map(e=>'title:'+e.title).slice(0,3))}));
await b.close();
