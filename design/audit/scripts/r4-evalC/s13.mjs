import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [n,u] of [['new','http://127.0.0.1:8817/#home'],['cur','http://127.0.0.1:8831/']]) {
const c = await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
const p = await c.newPage();
await p.goto(u,{waitUntil:'networkidle'}); await p.waitForTimeout(400);
await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)); await p.waitForTimeout(400);
await p.mouse.wheel(0,-50); await p.waitForTimeout(500);
await p.screenshot({path:n+'-m-bottom.png'});
// theme toggle on mobile
const btn = p.locator('button[aria-label*="테마"], button[aria-label*="모드"], button[aria-label*="theme" i], button[title*="테마"]').first();
console.log(n,'theme btn', await btn.count(), await btn.getAttribute('aria-label').catch(()=>null), JSON.stringify(await btn.boundingBox()));
const before = await p.evaluate(()=>getComputedStyle(document.body).backgroundColor);
await btn.tap(); await p.waitForTimeout(500);
const after = await p.evaluate(()=>[getComputedStyle(document.body).backgroundColor, document.documentElement.dataset.theme, (()=>{try{return localStorage.getItem('theme')}catch(e){return 'x'}})(), scrollY]);
console.log(n,'bg before',before,'after',after, 'aria-label now', await btn.getAttribute('aria-label'), 'pressed', await btn.getAttribute('aria-pressed'));
await p.screenshot({path:n+'-m-bottom-dark.png'});
// navigate to posts and check persistence
if(n=='new') await p.goto('http://127.0.0.1:8817/#posts'); else await p.goto('http://127.0.0.1:8831/posts/');
await p.waitForTimeout(400);
console.log(n,'after nav bg', await p.evaluate(()=>getComputedStyle(document.body).backgroundColor));
await c.close();}
await b.close();
