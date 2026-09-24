import { chromium } from './../../pw/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage()
await p.goto('http://127.0.0.1:8831/', { waitUntil: 'networkidle' })
const configs = [{ pageLength: 0.3 }, { pageLength: 0.5 }]
for (const q of ['주소', '인덱스', '트랜잭션', '배치', '캐시', '레거시', 'Oracle', '스프링']) {
  for (const ranking of configs) {
    const r = await p.evaluate(async ([q, ranking]) => {
      const pf = window.__pf ?? (window.__pf = await import('/pagefind/pagefind.js'))
      await pf.options(ranking ? { ranking } : { ranking: {} })
      const res = await pf.search(q); const top = await Promise.all(res.results.slice(0, 4).map((x) => x.data()))
      return { n: res.results.length, unf: res.unfilteredResultCount, top: top.map((d) => d.url.slice(0, 40) + ' |' + (d.excerpt.match(/<mark>(.*?)<\/mark>/)?.[1] ?? '')) }
    }, [q, ranking])
    console.log(q, JSON.stringify(ranking), r.n, JSON.stringify(r.top))
  }
}
await b.close()
