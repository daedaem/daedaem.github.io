import { chromium } from '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/pw/node_modules/playwright-core/index.mjs'
import fs from 'fs'
const D = '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/audit/r3-evalB'
const AXE = '/tmp/claude-0/-home-user-daedaem-github-io/8d13e338-9c80-5048-8800-bff18af5dcf7/scratchpad/lh/node_modules/axe-core/axe.min.js'
fs.mkdirSync(D + '/shots', { recursive: true })
const N = 'http://127.0.0.1:8817/', C = 'http://127.0.0.1:8831/'
const PAGES = {
  NEW: { home: N + '#home', posts: N + '#posts', post: N + '#post-address-search-9s-to-100ms', wiki: N + '#wiki', wikipage: N + '#wiki-oracle-empty-string-is-null', learn: N + '#learn', notfound: N + '#does-not-exist', search: N + '#home' },
  CUR: { home: C, posts: C + 'posts/', post: C + 'posts/address-search-9s-to-100ms/', wiki: C + 'wiki/', wikipage: C + 'wiki/oracle-empty-string-is-null/', learn: C + 'learn/', notfound: C + '404.html', search: C },
}
const VPS = [[1280, 900], [390, 844], [320, 800]]
const only = process.argv[2]
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const out = {}
for (const site of Object.keys(PAGES)) {
  for (const [pt, url] of Object.entries(PAGES[site])) {
    if (only && only !== pt) continue
    for (const [w, h] of VPS) for (const scheme of ['light', 'dark']) {
      if (w === 320 && scheme === 'dark') continue
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, deviceScaleFactor: 1, hasTouch: w < 500, isMobile: false })
      const page = await ctx.newPage()
      const errs = []
      page.on('pageerror', (e) => errs.push(String(e)))
      page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
      await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => errs.push('goto ' + e))
      await page.waitForTimeout(600)
      if (pt === 'search') {
        if (site === 'NEW') { await page.click('[data-search]:visible').catch(async () => { await page.keyboard.press('Control+k') }) }
        else { await page.click('#search-open').catch((e) => errs.push('click ' + e)) }
        await page.waitForTimeout(800)
        await page.keyboard.type('주소', { delay: 50 })
        await page.waitForTimeout(1500)
      }
      const key = `${site}|${pt}|${w}|${scheme}`
      await page.screenshot({ path: `${D}/shots/${site}-${pt}-${w}-${scheme}.png` })
      const m = await page.evaluate(() => {
        const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !el.closest('[hidden]') && !el.closest('dialog:not([open])') }
        const de = document.documentElement
        const res = { title: document.title, scrollW: de.scrollWidth, clientW: de.clientWidth, docH: de.scrollHeight }
        const h1s = [...document.querySelectorAll('h1')].filter(vis)
        res.h1 = h1s.map((h) => ({ t: h.textContent.trim().slice(0, 60), y: Math.round(h.getBoundingClientRect().top + scrollY) }))
        // header
        const hdr = [...document.querySelectorAll('header')].filter(vis).find((x) => x.getBoundingClientRect().top < 5)
        res.headerH = hdr ? Math.round(hdr.getBoundingClientRect().height) : null
        // navs
        res.navs = [...document.querySelectorAll('nav')].filter(vis).map((n) => { const r = n.getBoundingClientRect(); return { label: n.getAttribute('aria-label'), y: Math.round(r.top), h: Math.round(r.height), pos: getComputedStyle(n).position, links: [...n.querySelectorAll('a')].filter(vis).length } })
        res.current = [...document.querySelectorAll('[aria-current]')].filter(vis).map((a) => ({ t: a.textContent.trim().slice(0, 30), v: a.getAttribute('aria-current'), fw: getComputedStyle(a).fontWeight, c: getComputedStyle(a).color, bg: getComputedStyle(a).backgroundColor, td: getComputedStyle(a).textDecorationLine, bb: getComputedStyle(a).borderBottomWidth + ' ' + getComputedStyle(a).borderBottomColor }))
        // targets
        const ints = [...document.querySelectorAll('a[href], button, input, select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])')].filter(vis)
        const inlineLink = (el) => { if (el.tagName !== 'A') return false; const p = el.parentElement; if (!p) return false; const pt = p.textContent.trim().length, t = el.textContent.trim().length; return getComputedStyle(el).display.startsWith('inline') && pt > t + 3 && /^(P|LI|TD|DD|SPAN|EM|STRONG|BLOCKQUOTE)$/.test(p.tagName) }
        const small24 = [], small44 = []
        let nonInline = 0
        for (const el of ints) {
          if (inlineLink(el)) continue
          nonInline++
          const r = el.getBoundingClientRect()
          const d = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 30) + ` ${Math.round(r.width)}x${Math.round(r.height)}`
          if (r.width < 24 || r.height < 24) small24.push(d)
          if (r.width < 44 || r.height < 44) small44.push(d)
        }
        res.targets = { total: ints.length, nonInline, lt24: small24.length, lt44: small44.length, lt24s: small24.slice(0, 12), lt44s: small44.slice(0, 25) }
        // first content: first h1 or main first child position
        const main = document.querySelector('main')
        res.mainY = main ? Math.round(main.getBoundingClientRect().top + scrollY) : null
        // above the fold content: count list items/links visible in viewport inside main
        if (main) {
          const links = [...main.querySelectorAll('a[href]')].filter(vis).filter((a) => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
          res.aboveFoldLinks = links.length
          const txt = [...main.querySelectorAll('p,li,h1,h2,h3')].filter(vis).filter((a) => { const r = a.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight })
          res.aboveFoldBlocks = txt.length
        }
        // fixed/sticky elements area
        res.fixed = [...document.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return (p === 'fixed' || p === 'sticky') && vis(e) }).map((e) => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}.${(e.className && e.className.baseVal === undefined ? e.className : '').toString().split(' ')[0]} ${getComputedStyle(e).position} y${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` }).slice(0, 10)
        // prose link affordance
        const prose = document.querySelector('.prose, article .content, article, .post-body')
        if (prose) {
          const pl = [...prose.querySelectorAll('p a[href], li a[href]')].filter(vis)
          res.proseLinks = { n: pl.length, underlined: pl.filter((a) => getComputedStyle(a).textDecorationLine.includes('underline') || parseFloat(getComputedStyle(a).borderBottomWidth) > 0).length }
        }
        // chip-like non-interactive elements
        const chips = [...document.querySelectorAll('main span, main div, main li, main small, main p, main time')].filter(vis).filter((e) => {
          if (e.closest('a,button,label,pre,code,table,dialog')) return false
          const s = getComputedStyle(e), r = e.getBoundingClientRect()
          const hasBox = (parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none' && parseFloat(s.borderBottomWidth) > 0) || (s.backgroundColor !== 'rgba(0, 0, 0, 0)' && s.backgroundColor !== getComputedStyle(document.body).backgroundColor)
          return hasBox && parseFloat(s.borderRadius) >= 6 && r.height < 40 && r.width < 220 && e.children.length <= 2 && e.textContent.trim().length > 0 && e.textContent.trim().length < 30
        })
        res.chipLikeNonInteractive = chips.length
        res.chipSamples = chips.slice(0, 8).map((e) => e.textContent.trim().slice(0, 20))
        // interactive chips (links styled as pills)
        res.dates = [...document.querySelectorAll('time')].filter(vis).length
        res.timeSamples = [...document.querySelectorAll('time')].filter(vis).slice(0, 4).map((t) => (t.textContent.trim() + ' [' + (t.getAttribute('datetime') || '') + ']').slice(0, 50))
        // progress indicator
        res.progress = !!document.querySelector('[role=progressbar], progress, #mh-bar, .progress, .reading-progress')
        // toc
        res.toc = [...document.querySelectorAll('nav')].filter(vis).filter((n) => /목차|contents|toc/i.test((n.getAttribute('aria-label') || '') + n.className + (n.querySelector('h2,h3,p')?.textContent || ''))).length
        res.tocBtn = [...document.querySelectorAll('button, a')].filter(vis).filter((b) => /목차/.test(b.textContent + (b.getAttribute('aria-label') || ''))).map((b) => { const r = b.getBoundingClientRect(); return `${b.textContent.trim().slice(0, 12)} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)} ${getComputedStyle(b).position}` })
        // search button
        res.searchBtn = [...document.querySelectorAll('button, a')].filter(vis).filter((b) => /검색/.test(b.textContent + (b.getAttribute('aria-label') || ''))).map((b) => { const r = b.getBoundingClientRect(); return `${(b.getAttribute('aria-label') || b.textContent).trim().slice(0, 14)} ${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` })
        const dlg = document.querySelector('dialog[open]')
        if (dlg) { const r = dlg.getBoundingClientRect(); res.dialog = { label: dlg.getAttribute('aria-label'), box: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}`, text: dlg.innerText.slice(0, 600) } }
        res.bodyBg = getComputedStyle(document.body).backgroundColor
        res.fontFamily = getComputedStyle(document.body).fontFamily.slice(0, 60)
        return res
      })
      m.errs = errs
      // axe
      if (w !== 320) {
        await page.addScriptTag({ path: AXE })
        m.axe = await page.evaluate(async () => {
          const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations', 'incomplete'] })
          return { v: r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, s: v.nodes.slice(0, 3).map((n) => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n').slice(1, 2).join('').slice(0, 140)) })), inc: r.incomplete.map((v) => v.id + ':' + v.nodes.length) }
        })
      }
      out[key] = m
      console.error(key, 'done', m.axe ? m.axe.v.length : '-')
      await ctx.close()
    }
  }
}
fs.writeFileSync(`${D}/measure${only ? '-' + only : ''}.json`, JSON.stringify(out, null, 1))
await browser.close()
