import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const B = 'http://127.0.0.1:8820'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const lum = (rgb) => { const [r, g, bl] = rgb.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((c) => c / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * bl }
const cr = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((p, q) => q - p); return ((x + 0.05) / (y + 0.05)).toFixed(2) }
const errs = []
for (const scheme of ['light', 'dark']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme }); const p = await ctx.newPage()
  p.on('pageerror', (e) => errs.push(e.message))
  // 1. 검색창 안내 글자
  await p.goto(B + '/'); await p.click('#search-open'); await p.waitForSelector('.pagefind-ui__search-input', { timeout: 8000 })
  const ph = await p.evaluate(() => { const i = document.querySelector('.pagefind-ui__search-input'); const s = getComputedStyle(i, '::placeholder'); let bg = getComputedStyle(i).backgroundColor, e = i; while (/rgba\(0, 0, 0, 0\)|transparent/.test(bg) && e.parentElement) { e = e.parentElement; bg = getComputedStyle(e).backgroundColor } return { color: s.color, opacity: s.opacity, bg, text: i.placeholder } })
  console.log(scheme, 'placeholder', ph.text, ph.color, 'opacity', ph.opacity, 'on', ph.bg, '→', cr(ph.color, ph.bg) + ':1')
  await p.screenshot({ path: `search-${scheme}.png` })
  // 2. 사례 글 코드 초점 테두리
  await p.goto(B + '/posts/disk-99-percent-check-before-expanding/'); await p.waitForTimeout(300)
  const fr = await p.evaluate(() => { const c = [...document.querySelectorAll('pre.astro-code[data-scrollable] > code')][0]; if (!c) return null; c.focus(); const s = getComputedStyle(c); return { outline: s.outlineColor, style: s.outlineStyle, bg: getComputedStyle(c.parentElement).backgroundColor } })
  // focus()로는 :focus-visible이 안 걸릴 수 있어 키보드로 다시 확인
  await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab')
  const fr2 = await p.evaluate(() => { const c = document.activeElement; if (c.tagName !== 'CODE') return 'active=' + c.tagName; const s = getComputedStyle(c); return { outline: s.outlineColor, style: s.outlineStyle, bg: getComputedStyle(c.parentElement).backgroundColor } })
  console.log(scheme, 'post code focus', JSON.stringify(fr2), typeof fr2 === 'object' ? cr(fr2.outline, fr2.bg) + ':1' : '')
  // 3. 코드 색 구별: 문자열·키워드·일반 글자
  for (const url of ['/posts/address-search-9s-to-100ms/', '/wiki/spring-transactional-catch-swallows-rollback/']) {
    await p.goto(B + url); await p.waitForTimeout(300)
    const cs = await p.evaluate(() => { const pre = document.querySelector('pre.astro-code'); const bg = getComputedStyle(pre).backgroundColor; const m = new Map(); for (const s of pre.querySelectorAll('span span, .line > span')) { const c = getComputedStyle(s).color; m.set(c, (m.get(c) || 0) + 1) } return { bg, lang: pre.dataset.language, colors: [...m].sort((a, b) => b[1] - a[1]).slice(0, 8) } })
    console.log(scheme, url.split('/')[1], cs.lang, 'bg', cs.bg, cs.colors.map(([c, n]) => c.replace(/rgb|\s/g, '') + '×' + n + '(' + cr(c, cs.bg) + ')').join(' '))
    const el = await p.$('pre.astro-code'); await el.screenshot({ path: `code-${scheme}-${url.split('/')[1]}.png` })
  }
  await ctx.close()
}
console.log('errors', errs.length ? errs : 'none'); await b.close()
