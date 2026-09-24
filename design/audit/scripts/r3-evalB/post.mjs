import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
const D = '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/audit/r3-evalB'
const U = { NEW: 'http://127.0.0.1:8817/#post-address-search-9s-to-100ms', CUR: 'http://127.0.0.1:8831/posts/address-search-9s-to-100ms/' }
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const log = (...a) => console.log(...a)
for (const [w, h] of [[1280, 900], [1024, 768], [390, 844]]) for (const site of ['NEW', 'CUR']) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 500 })
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)))
  // start from a list page so Back can be tested
  await p.goto(site === 'NEW' ? 'http://127.0.0.1:8817/#posts' : 'http://127.0.0.1:8831/posts/', { waitUntil: 'networkidle' })
  await p.goto(U[site], { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  const info = await p.evaluate(() => {
    const box = document.querySelector('.prose') || document.querySelector('article .content, article')
    const ps = [...box.querySelectorAll('p')].filter((x) => x.offsetParent && x.textContent.trim().length > 60 && !x.closest('aside, blockquote, .callout, .note, figure, header'))
    const first = ps[0]
    const links = [...box.querySelectorAll('p a[href]')].filter((a) => a.offsetParent && !a.closest('nav'))
    return { firstParaY: first ? Math.round(first.getBoundingClientRect().top + scrollY) : null, firstParaT: first?.textContent.slice(0, 30), bodyLinks: links.length, underlined: links.filter((a) => getComputedStyle(a).textDecorationLine.includes('underline')).length, linkSample: links.slice(0, 3).map((a) => a.textContent.slice(0, 20) + '|' + getComputedStyle(a).textDecorationLine + '|' + getComputedStyle(a).color), h2: document.querySelectorAll('.prose h2, article h2').length }
  })
  log(`\n=== ${site} ${w} `, JSON.stringify(info))
  // scroll to 50%
  await p.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.5)); await p.waitForTimeout(250)
  await p.evaluate(() => window.scrollBy(0, 40)); await p.waitForTimeout(600)
  const mid = await p.evaluate(() => {
    const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && r.bottom > 0 && r.top < innerHeight && !el.closest('[hidden]') && parseFloat(s.opacity) > 0.1 }
    const hdr = document.querySelector('header.top, body > header, header')
    const sb = [...document.querySelectorAll('button')].filter((b) => /검색/.test(b.textContent + b.getAttribute('aria-label')))
    const toc = [...document.querySelectorAll('button, a, summary')].filter((b) => /목차/.test(b.textContent + (b.getAttribute('aria-label') || '')) && vis(b))
    const act = [...document.querySelectorAll('[aria-current="location"], [aria-current="true"]')].filter(vis).map((a) => a.textContent.trim().slice(0, 25))
    const dock = document.querySelector('.dock')
    const hr = hdr?.getBoundingClientRect()
    const prog = document.querySelector('#mh-bar')?.getAttribute('stroke-dashoffset')
    const mht = document.querySelector('#mh-t')
    return { y: Math.round(scrollY), hdrTop: hr && Math.round(hr.top), hdrH: hr && Math.round(hr.height), searchVisible: sb.some(vis), tocCtl: toc.map((b) => `${b.tagName}:${b.textContent.trim().slice(0, 10)} ${Math.round(b.getBoundingClientRect().left)},${Math.round(b.getBoundingClientRect().top)} ${Math.round(b.getBoundingClientRect().width)}x${Math.round(b.getBoundingClientRect().height)}`), active: act, dock: dock ? (vis(dock) ? 'visible ' + dock.className : 'hidden ' + dock.className + ' top' + Math.round(dock.getBoundingClientRect().top)) : null, prog, mht: mht && vis(mht) ? mht.textContent.slice(0, 30) : null }
  })
  log('mid', JSON.stringify(mid))
  await p.screenshot({ path: `${D}/shots/${site}-post-mid-${w}.png` })
  // Ctrl+K mid-page
  const before = await p.evaluate(() => scrollY)
  await p.keyboard.press('Control+k'); await p.waitForTimeout(600)
  const dlgOpen = await p.evaluate(() => { const d = document.querySelector('dialog[open]'); return d ? { l: d.getAttribute('aria-label'), focus: document.activeElement?.tagName + '#' + document.activeElement?.id } : null })
  await p.keyboard.press('Escape'); await p.waitForTimeout(400)
  const after = await p.evaluate(() => ({ open: !!document.querySelector('dialog[open]'), y: Math.round(scrollY), focus: document.activeElement?.tagName + '.' + (document.activeElement?.className || '').toString().slice(0, 20) + '#' + document.activeElement?.id }))
  log('ctrlK', JSON.stringify(dlgOpen), 'after esc', JSON.stringify(after), 'scroll kept', after.y === Math.round(before))
  // '/' key
  await p.keyboard.press('/'); await p.waitForTimeout(400)
  log('slash opens search', await p.evaluate(() => !!document.querySelector('dialog[open]')))
  await p.keyboard.press('Escape'); await p.waitForTimeout(300)
  // TOC control click (mobile / narrow)
  const tocBtn = p.locator('button:visible', { hasText: '목차' }).first()
  if (await tocBtn.count()) {
    await tocBtn.click(); await p.waitForTimeout(500)
    const st = await p.evaluate(() => { const d = document.querySelector('dialog[open]'); const on = d?.querySelector('[aria-current], .on'); return { dialog: !!d, focus: document.activeElement?.textContent.trim().slice(0, 30), current: on?.textContent.trim().slice(0, 30), items: d ? d.querySelectorAll('a').length : 0 } })
    log('tocBtn open', JSON.stringify(st))
    await p.screenshot({ path: `${D}/shots/${site}-post-tocsheet-${w}.png` })
    await p.keyboard.press('Escape'); await p.waitForTimeout(300)
    log('tocBtn after esc', await p.evaluate(() => ({ open: !!document.querySelector('dialog[open]'), focus: document.activeElement?.textContent.trim().slice(0, 20) })))
    // click an item then back
    await tocBtn.click(); await p.waitForTimeout(400)
    const items = p.locator('dialog[open] a')
    const n = await items.count()
    if (n > 3) {
      const y0 = await p.evaluate(() => scrollY)
      await items.nth(n - 2).click(); await p.waitForTimeout(700)
      const y1 = await p.evaluate(() => ({ y: scrollY, url: location.href.slice(-40), focus: document.activeElement?.textContent.trim().slice(0, 30) }))
      await p.goBack(); await p.waitForTimeout(800)
      const y2 = await p.evaluate(() => ({ y: scrollY, url: location.href.slice(-40) }))
      log('toc jump', Math.round(y0), '->', JSON.stringify(y1), 'back->', JSON.stringify(y2))
    }
  } else log('no visible 목차 button')
  // desktop toc link click and back
  if (w >= 1200) {
    const l = p.locator('nav[aria-label*="목차"] a:visible').nth(6)
    if (await l.count()) {
      const y0 = await p.evaluate(() => scrollY)
      await l.click(); await p.waitForTimeout(700)
      const y1 = await p.evaluate(() => ({ y: Math.round(scrollY), url: location.href.slice(-50) }))
      await p.goBack(); await p.waitForTimeout(800)
      const y2 = await p.evaluate(() => ({ y: Math.round(scrollY), url: location.href.slice(-50) }))
      log('desk toc jump', Math.round(y0), JSON.stringify(y1), 'back', JSON.stringify(y2))
      await p.goBack(); await p.waitForTimeout(800)
      log('back again ->', await p.evaluate(() => location.href.slice(-50) + ' title=' + document.title))
    }
  }
  if (errs.length) log('ERRS', errs)
  await ctx.close()
}
await browser.close()
