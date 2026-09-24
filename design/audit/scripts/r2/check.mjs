import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
import { readFileSync, writeFileSync } from 'fs'
const S = '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad'
const AXE = readFileSync(S + '/lh/node_modules/axe-core/axe.min.js', 'utf8')
const URL = 'http://127.0.0.1:8817/'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = []; const log = (...a) => { out.push(a.join(' ')); console.log(...a) }
const errs = []
async function pg(w, h = 900) { const c = await b.newContext({ viewport: { width: w, height: h } }); const p = await c.newPage(); p.on('pageerror', (e) => errs.push(w + ' ' + e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(w + ' console ' + m.text())); await p.goto(URL); await p.waitForTimeout(300); return p }
async function axe(p, tag) { await p.addScriptTag({ content: AXE }); const r = await p.evaluate(async () => (await axe.run(document, { resultTypes: ['violations'] })).violations.map((v) => v.id + '(' + v.nodes.length + ')')); log('axe', tag, r.length ? r.join(', ') : '0 violations') }
const firstPost = async (p) => p.evaluate(() => [...document.querySelectorAll('.page')].find((x) => x.id.startsWith('p-post-') && x.querySelector('.code')).id.slice(2))

// 1. 검색 닫기 버튼
for (const w of [320, 360, 390]) {
  const p = await pg(w); await p.click('.tb-search'); await p.waitForTimeout(250)
  const r = await p.evaluate(() => { const d = document.querySelector('#cmd').getBoundingClientRect(), x = document.querySelector('.cmd-x').getBoundingClientRect(); return { dlgR: Math.round(d.right), btn: [Math.round(x.left), Math.round(x.right)], visible: Math.max(0, Math.min(d.right, x.right) - Math.max(d.left, x.left)) / x.width } })
  log('close-btn', w, JSON.stringify(r)); await p.close()
}
// 2~4. axe, 건너뛰기 링크, 목록 탭 순서
for (const w of [390, 1280]) {
  const p = await pg(w); const id = await firstPost(p); await p.evaluate((id) => (location.hash = id), id); await p.waitForTimeout(400)
  await axe(p, w + ' ' + id)
  log('code labels', w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.page:not([hidden]) [role=region]')].map((e) => e.getAttribute('aria-label')))))
  await p.evaluate(() => (location.hash = 'home')); await p.waitForTimeout(300); await axe(p, w + ' home')
  await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300); await axe(p, w + ' wiki')
  await p.close()
}
{ const p = await pg(390); log('skip href', await p.getAttribute('.skip', 'href'), 'cl tabindex', await p.getAttribute('#cl', 'tabindex'))
  await p.click('.tb-search'); await p.fill('#cq', 'a'); await p.waitForTimeout(300)
  const seq = []; for (let i = 0; i < 3; i++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => document.activeElement.tagName + '#' + document.activeElement.id + '.' + document.activeElement.className)) }
  log('tab in search', JSON.stringify(seq)); await p.close() }
// 5. 스크롤 복원: 위키 목록 → 문서 → 뒤로 / 글 → 뒤로 → 앞으로
{ const p = await pg(1280)
  await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300)
  await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(200)
  const y0 = await p.evaluate(() => scrollY)
  const card = await p.evaluate(() => { const r = [...document.querySelectorAll('#wlist .wcard')].filter((c) => !c.parentElement.hidden); const c = r.find((c) => c.getBoundingClientRect().top > 100 && c.getBoundingClientRect().top < 700); return c.getAttribute('href') })
  await p.click(`a.wcard[href="${card}"]`); await p.waitForTimeout(300)
  const yA = await p.evaluate(() => scrollY)
  await p.evaluate(() => window.scrollTo(0, 1500)); await p.waitForTimeout(200)
  await p.goBack(); await p.waitForTimeout(400); const yB = await p.evaluate(() => [location.hash, scrollY])
  await p.goForward(); await p.waitForTimeout(400); const yF = await p.evaluate(() => [location.hash, scrollY])
  log('scroll-restore wiki list', y0, '→ open', card, 'top', yA, '→ back', JSON.stringify(yB), '→ fwd', JSON.stringify(yF))
  // 6. 읽는 중 머리줄
  const top = await p.evaluate(() => { const t = document.querySelector('#top'), r = t.getBoundingClientRect(), s = document.querySelector('.tb-search').getBoundingClientRect(); return { top: r.top, h: r.height, search: s.top >= 0 && s.bottom <= innerHeight, reading: t.classList.contains('reading') } })
  log('header mid-article 1280', JSON.stringify(top))
  // 7. 목차 이동 기록
  const id = await firstPost(p); await p.evaluate((id) => (location.hash = id), id); await p.waitForTimeout(400)
  await p.evaluate(() => window.scrollTo(0, 400)); await p.waitForTimeout(200)
  const hl0 = await p.evaluate(() => history.length)
  const links = await p.$$('.page:not([hidden]) .art-toc a[data-target]'); await links[Math.min(3, links.length - 1)].click(); await p.waitForTimeout(300)
  const after = await p.evaluate(() => ({ y: scrollY, hl: history.length, cur: document.querySelector('.page:not([hidden]) .art-toc a[aria-current]')?.textContent }))
  await p.goBack(); await p.waitForTimeout(300); const back = await p.evaluate(() => [location.hash, scrollY])
  log('toc history', 'len', hl0, '→', after.hl, 'y', after.y, 'current', after.cur, '→ back', JSON.stringify(back))
  // 오른쪽 목차 강조가 스크롤 즉시 따라오는지
  const lag = await p.evaluate(async () => { const hs = [...document.querySelectorAll('.page:not([hidden]) .prose h2')]; const h = hs[Math.floor(hs.length / 2)]; window.scrollTo(0, h.getBoundingClientRect().top + scrollY - 100); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); return [h.id, document.querySelector('.page:not([hidden]) .art-toc a.on')?.dataset.target] })
  log('toc sync', JSON.stringify(lag))
  // 12. 위키 칩 넘침
  await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300)
  log('wiki tabs overflow 1280', JSON.stringify(await p.evaluate(() => { const t = document.querySelector('.tabs'); return [t.scrollWidth, t.clientWidth, t.getBoundingClientRect().height] })))
  await p.close() }
// 6b. 모바일 읽는 중 머리줄
{ const p = await pg(390, 844); const id = await firstPost(p); await p.evaluate((id) => (location.hash = id), id); await p.waitForTimeout(400)
  await p.evaluate(() => window.scrollTo(0, 2500)); await p.waitForTimeout(300)
  log('header mid-article 390', JSON.stringify(await p.evaluate(() => { const t = document.querySelector('#top'); return { h: t.getBoundingClientRect().height, reading: t.classList.contains('reading'), title: document.querySelector('#mh-t').textContent.slice(0, 30), searchVisible: document.querySelector('.tb-search').getBoundingClientRect().width > 0 } })))
  await p.screenshot({ path: S + '/audit/r2/m390-reading.png' })
  await p.close() }
// 8~10. 학습 기록 검색, 위키 빈 결과 → 전체 검색, 본문 위치로 이동
{ const p = await pg(1280)
  await p.click('.tb-search'); await p.fill('#cq', '타입스크립트'); await p.waitForTimeout(400)
  log('search 타입스크립트', await p.textContent('#ccount'), JSON.stringify(await p.$$eval('.cmd-i .t', (e) => e.slice(0, 3).map((x) => x.textContent))))
  await p.fill('#cq', 'rollbackFor'); await p.waitForTimeout(400)
  log('search rollbackFor', await p.textContent('#ccount'), JSON.stringify(await p.$$eval('.cmd-i', (e) => e.slice(0, 2).map((x) => x.getAttribute('href')))))
  await p.keyboard.press('Enter'); await p.waitForTimeout(500)
  log('deep jump', JSON.stringify(await p.evaluate(() => { const m = document.querySelector('.prose mark.hit'); if (!m) return 'no mark'; const r = m.getBoundingClientRect(); return { hash: location.hash, text: m.textContent, top: Math.round(r.top), inView: r.top > 60 && r.bottom < innerHeight } })))
  await p.screenshot({ path: S + '/audit/r2/d1280-deepjump.png' })
  await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300); await p.fill('#wq', 'rollbackFor'); await p.waitForTimeout(200)
  log('wiki empty visible', await p.isVisible('#wempty'))
  await p.click('#wglobal'); await p.waitForTimeout(400); log('wglobal →', await p.inputValue('#cq'), await p.textContent('#ccount'))
  await p.keyboard.press('Escape')
  await p.evaluate(() => (location.hash = 'nope')); await p.waitForTimeout(300); log('404', (await p.textContent('#p-notfound .lede')).slice(0, 60))
  await p.evaluate(() => (location.hash = 'posts')); await p.waitForTimeout(300); log('posts meta', await p.textContent('#p-posts .nlist li:first-child'))
  await p.close() }
// 입력칸 테두리 대비
{ const p = await pg(1280); await p.evaluate(() => (location.hash = 'wiki')); await p.waitForTimeout(300)
  log('input border', await p.evaluate(() => getComputedStyle(document.querySelector('.input')).borderTopColor), 'bg', await p.evaluate(() => getComputedStyle(document.body).backgroundColor))
  for (const w of [1280]) { await p.evaluate(() => (location.hash = 'home')); await p.waitForTimeout(300); await p.screenshot({ path: S + '/audit/r2/d1280-home.png' }) }
  await p.close() }
log('errors', errs.length ? errs.join(' | ') : 'none')
writeFileSync(S + '/audit/r2/check.txt', out.join('\n'))
await b.close()
