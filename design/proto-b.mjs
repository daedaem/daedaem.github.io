// B안: 21st.dev 계열 개인 블로그 템플릿(가운데 좁은 열, 하단 도크 내비, 무채색 shadcn 토큰, 카드·배지, 흐림-페이드 등장)을
// 이 블로그의 실제 글·위키 본문에 맞춰 옮긴 동작 시안. 실제 사이트 소스와 무관한 별도 페이지다.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
const S = new URL('.', import.meta.url).pathname.replace(/\/$/, '')
const REPO = process.env.BLOG_REPO ?? '../daedaem.github.io'
const require = createRequire(S + '/')
const { marked } = require('marked')
const yaml = require(REPO + '/node_modules/js-yaml/index.js')

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ymd = (d) => new Date(d).toISOString().slice(0, 10).replace(/-/g, '.')
const CAT = { 'data-integrity': '데이터 정합성', performance: '성능', operations: '운영·장애 대응', legacy: '레거시 대응' }
const TOPIC = { java: 'Java', spring: 'Spring', database: '데이터베이스', dotnet: '.NET', web: '웹·프론트엔드', infra: '인프라·운영', cs: '기초 지식', etc: '그 밖에' }
const INTRO = '느린 조회와 어긋난 데이터처럼 운영 중 만난 문제를 화면에서 DB까지 로그와 데이터 흐름을 따라 추적합니다. 무엇을 확인했고 왜 그 방법을 골랐는지 기록합니다.'
const PICKS = [
  ['null-and-empty-string-sync-failure', 'NULL·빈 문자열 비교와 인터페이스 처리 구분값. 반복 결재를 만들던 두 오류를 각각 수정한 과정.'],
  ['address-search-9s-to-100ms', '조회 시간을 9초에서 1초대로 줄인 뒤에도, 주소 데이터의 관리 방식을 다시 선택한 이유.'],
  ['retire-flash-module-by-integration', '기존 API 연동에 맞춘 업무 로직 개발과 계약 상태 동기화, 적재 실패 복구 과정.'],
]
const MONO = 'M14.7 8v12.8a4.7 4.7 0 1 1-4.7-4.7h4.7M27 8v12.8a4.7 4.7 0 1 1-4.7-4.7H27'
const mark = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="9" fill="var(--mark-bg)"></rect><path d="${MONO}" stroke="var(--mark-ink)" stroke-width="2.8" stroke-linejoin="round"></path></svg>`
const svg = (d, w = 18) => `<svg width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`
const I = {
  home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>'),
  pen: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>'),
  stack: svg('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>').replace('<svg', '<svg class="i-moon"'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>').replace('<svg', '<svg class="i-sun"'),
  list: svg('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>'),
  copy: svg('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>', 15),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 16),
  back: svg('<path d="M19 12H5M11 18l-6-6 6-6"/>', 16),
}

// ---------------------------------------------------------------- content
function load(dir) {
  return readdirSync(`${REPO}/src/content/${dir}`).filter((f) => /\.mdx?$/.test(f)).map((f) => {
    const m = readFileSync(`${REPO}/src/content/${dir}/${f}`, 'utf8').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
    return { id: f.replace(/\.mdx?$/, ''), data: yaml.load(m[1]), body: m[2] }
  })
}
const minutes = (b) => Math.max(1, Math.round(b.replace(/\s/g, '').length / 500))
const posts = load('posts').filter((p) => !p.data.draft).sort((a, b) => new Date(b.data.date) - new Date(a.data.date) || a.data.title.localeCompare(b.data.title, 'ko'))
const wiki = load('wiki').filter((w) => !w.data.draft).sort((a, b) => new Date(b.data.updated ?? b.data.created) - new Date(a.data.updated ?? a.data.created) || a.data.title.localeCompare(b.data.title, 'ko'))
const notes = load('notes').sort((a, b) => new Date(b.data.date) - new Date(a.data.date))
const byId = Object.fromEntries(posts.map((p) => [p.id, p]))
const cover = (p) => p.data.coverImage ? `data:image/webp;base64,${readFileSync(`${REPO}/public${p.data.coverImage.replace('.webp', '-768.webp')}`).toString('base64')}` : null
const topicCounts = {}
for (const w of wiki) topicCounts[w.data.topic] = (topicCounts[w.data.topic] ?? 0) + 1
const topicOrder = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a])

function render(body, prefix) {
  const headings = [], used = new Set(), r = new marked.Renderer()
  r.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens), plain = text.replace(/<[^>]+>/g, '')
    let id = prefix + '-' + plain.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
    while (used.has(id)) id += '-1'
    used.add(id)
    if (depth === 2 || depth === 3) headings.push({ depth, text: plain, id })
    return `<h${depth} id="${id}" tabindex="-1">${text}</h${depth}>`
  }
  r.code = ({ text, lang }) => `<figure class="code"><figcaption><span class="mono">${esc(lang || 'text')}</span><button type="button" class="ghost copybtn" aria-label="코드 복사">${I.copy}</button></figcaption><pre><code>${esc(text)}</code></pre></figure>`
  r.table = function (t) {
    return `<div class="table" tabindex="0"><table><thead><tr>${t.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((row) => `<tr>${row.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
  }
  r.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens)
    let m
    if ((m = href.match(/^\/posts\/([^/#]+)/)) && byId[m[1]]) return `<a href="#post-${m[1]}">${text}</a>`
    if ((m = href.match(/^\/wiki\/([^/#]+)/))) return `<a href="#wiki-${m[1]}">${text}</a>`
    return `<a href="${esc(href.startsWith('/') ? 'https://daedaem.github.io' + href : href)}" target="_blank" rel="noopener">${text}</a>`
  }
  r.codespan = ({ text }) => `<code class="ic">${text}</code>`
  return { html: marked.parse(body, { renderer: r, gfm: true }), headings }
}

// ---------------------------------------------------------------- parts
const badge = (t, cls = '') => `<span class="badge ${cls}">${t}</span>`
const status = (s) => badge(s === 'stable' ? '정리됨' : '보완 중', s === 'stable' ? 'ok' : 'wip')
const postCard = (p, note, big = false) => {
  const c = cover(p)
  return `<a class="card${big ? ' big' : ''} reveal" href="#post-${p.id}">
${c && big ? `<img class="card-img" src="${c}" alt="" width="768" height="512">` : ''}
<div class="card-body"><div class="card-meta">${badge(CAT[p.data.category], 'cat')}<span class="mono">${ymd(p.data.date)}</span><span>${minutes(p.body)}분</span></div>
<h3>${esc(p.data.title)}</h3><p>${esc(note)}</p></div>
${c && !big ? `<img class="card-thumb" src="${c}" alt="" width="96" height="64">` : ''}</a>`
}
const CHEV = '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
const line = (href, title, right, sub = '', n = 0) => `<a class="line reveal" href="${href}">${n ? `<span class="num mono">${String(n).padStart(2, '0')}.</span>` : ''}<span class="line-t">${esc(title)}${CHEV}${sub || right ? `<span class="line-s">${[sub, right].filter(Boolean).join(' · ')}</span>` : ''}</span></a>`
const section = (title, more, body) => `<section class="blk reveal"><div class="blk-h"><h2>${title}</h2>${more ? `<a href="${more[1]}" class="more">${more[0]}${I.arrow}</a>` : ''}</div>${body}</section>`

// ---------------------------------------------------------------- pages
const pages = []
pages.push(['home', '대댐 로그', `
<header class="hero reveal">
<div class="hero-row"><div class="hero-l"><p class="role">조해성 · 백엔드 개발자</p>
<h1>증상이 아니라 <span class="grad">원인</span>을 고칩니다</h1>
<p class="lede">${esc(INTRO)}</p></div><div class="avatar">${mark(128)}</div></div>
<div class="chips"><a class="pill" href="#about">${I.user}소개·경력</a><a class="pill" href="https://github.com/daedaem" target="_blank" rel="noopener">GitHub</a><a class="pill" href="https://daedaem.github.io/rss.xml" target="_blank" rel="noopener">RSS</a></div>
</header>
${section('먼저 읽을 글', ['전체 글', '#posts'], `<div class="cards">${postCard(byId[PICKS[0][0]], PICKS[0][1], true)}${postCard(byId[PICKS[1][0]], PICKS[1][1])}${postCard(byId[PICKS[2][0]], PICKS[2][1])}</div>`)}
${section('최근 글', null, posts.filter((p) => !PICKS.some(([i]) => i === p.id)).map((p, i) => line('#post-' + p.id, p.data.title, ymd(p.data.date), CAT[p.data.category], i + 1)).join(''))}
${section('학습 위키', ['26편 전체', '#wiki'], `<div class="bento">
<a class="tile reveal" href="#wiki"><p class="tile-n mono">${wiki.length}</p><p class="tile-t">문서</p><p class="tile-s">정리됨 ${wiki.filter((w) => w.data.status === 'stable').length} · 보완 중 ${wiki.filter((w) => w.data.status !== 'stable').length}</p></a>
<div class="tile tile-wide reveal"><p class="tile-t">주제</p><div class="tags">${topicOrder.map((k) => `<a class="tagb" href="#wiki" data-topic-link="${k}">${TOPIC[k]} <span class="mono">${topicCounts[k]}</span></a>`).join('')}</div></div>
</div>${wiki.slice(0, 5).map((w) => `<a class="erow reveal" href="#wiki-${w.id}"><span class="logo">${TOPIC[w.data.topic].slice(0, 1)}</span><span class="erow-b"><span class="erow-t">${esc(w.data.title)}<svg class="arr" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg></span><span class="erow-s">${TOPIC[w.data.topic]}</span></span><span class="erow-r mono">${ymd(w.data.updated ?? w.data.created).slice(5)}</span></a>`).join('')}`)}
${section('학습 기록', ['보기', '#learn'], `<div class="bento">
<a class="tile reveal" href="#learn"><p class="tile-n mono">${notes.length}</p><p class="tile-t">학습 노트</p><p class="tile-s mono">2022.06 – 2023.03</p></a>
<a class="tile reveal" href="#learn"><p class="tile-n mono">494</p><p class="tile-t">알고리즘 풀이</p><p class="tile-s">백준 425 · 프로그래머스 69</p></a>
</div>`)}`])

pages.push(['posts', '글', `
<header class="phead reveal"><h1>글 <span class="count-b">${posts.length}편</span></h1><p class="lede sm">실무에서 만난 문제를, 무엇을 확인했고 왜 그 방법을 골랐는지까지 적었습니다.</p></header>
<div class="nlist">${posts.map((p, i) => line('#post-' + p.id, p.data.title, ymd(p.data.date), CAT[p.data.category], i + 1)).join('')}</div>`])

for (const p of posts) {
  const { html, headings } = render(p.body, p.id)
  const c = cover(p)
  const i = posts.indexOf(p), prev = posts[i + 1], next = posts[i - 1]
  pages.push([`post-${p.id}`, p.data.title, `
<article class="art" data-toc='${esc(JSON.stringify(headings))}'>
<a class="backlink" href="#posts">${I.back}글 목록</a>
<div class="art-meta reveal">${badge(CAT[p.data.category], 'cat')}<span class="mono">${ymd(p.data.date)}</span><span>${minutes(p.body)}분 읽기</span></div>
<h1 class="reveal">${esc(p.data.title)}</h1>
${p.data.happened ? `<p class="happened reveal">사례 시점 · ${esc(p.data.happened)}</p>` : ''}
${c ? `<img class="art-cover reveal" src="${c}" alt="" width="768" height="512">` : ''}
${p.data.cause ? `<div class="callout reveal"><p class="callout-k">원인</p><p>${esc(p.data.cause)}</p></div>` : ''}
<div class="prose">${html}</div>
<div class="tags end">${(p.data.tags ?? []).map((t) => `<span class="tagb">#${esc(t)}</span>`).join('')}</div>
<nav class="pn">${prev ? `<a class="card" href="#post-${prev.id}"><div class="card-body"><p class="k">이전 글</p><h3>${esc(prev.data.title)}</h3></div></a>` : ''}${next ? `<a class="card" href="#post-${next.id}"><div class="card-body"><p class="k">다음 글</p><h3>${esc(next.data.title)}</h3></div></a>` : ''}</nav>
</article>`])
}

pages.push(['wiki', '학습 위키', `
<header class="phead reveal"><h1>학습 위키 <span class="count-b">${wiki.length}편</span></h1><p class="lede sm">Java, Spring, 데이터베이스부터 웹과 인프라까지. 주제와 키워드로 다시 찾아보는 학습 위키.</p></header>
<div class="wtools">
<label class="input">${I.search}<span class="vh">위키 검색</span><input id="wq" type="search" placeholder="제목·설명·태그로 찾기" autocomplete="off"></label>
<div class="tabs" role="group" aria-label="주제"><button type="button" class="tab on" data-topic="">전체 <span class="mono">${wiki.length}</span></button>${topicOrder.map((k) => `<button type="button" class="tab" data-topic="${k}">${TOPIC[k]} <span class="mono">${topicCounts[k]}</span></button>`).join('')}</div>
<div class="seg" role="group" aria-label="정리 상태"><button type="button" class="on" data-status="">전체</button><button type="button" data-status="stable">정리됨</button><button type="button" data-status="growing">보완 중</button></div>
</div>
<p class="count mono" id="wcount" role="status"></p>
<div id="wlist" class="wlist">${wiki.map((w) => `<a class="wcard" href="#wiki-${w.id}" data-topic="${w.data.topic}" data-status="${w.data.status}" data-s="${esc((w.data.title + ' ' + w.data.description + ' ' + (w.data.tags ?? []).join(' ')).toLowerCase())}">
<div class="wcard-top">${badge(TOPIC[w.data.topic], 'cat')}${status(w.data.status)}<span class="mono">${ymd(w.data.updated ?? w.data.created)}</span></div>
<h3>${esc(w.data.title)}</h3><p>${esc(w.data.description)}</p></a>`).join('')}</div>
<p class="empty" id="wempty" hidden>조건에 맞는 문서가 없습니다.</p>
<div class="pager"><button type="button" class="btn" id="wprev">이전</button><span class="mono" id="wpage"></span><button type="button" class="btn" id="wnext">다음</button></div>`])

for (const w of wiki) {
  const { html, headings } = render(w.body, w.id)
  pages.push([`wiki-${w.id}`, w.data.title, `
<article class="art" data-toc='${esc(JSON.stringify(headings))}'>
<a class="backlink" href="#wiki">${I.back}위키 목록</a>
<div class="art-meta reveal">${badge(TOPIC[w.data.topic], 'cat')}${status(w.data.status)}<span>마지막 수정 <span class="mono">${ymd(w.data.updated ?? w.data.created)}</span></span></div>
<h1 class="reveal">${esc(w.data.title)}</h1>
<p class="deck reveal">${esc(w.data.description)}</p>
<div class="prose">${html}</div>
</article>`])
}

pages.push(['learn', '학습 기록', `
<header class="phead reveal"><h1>학습 기록</h1><p class="lede">개발자로 전환하던 시기의 학습 노트와 알고리즘 풀이. 이 시안에는 목록만 담았습니다.</p></header>
${section('학습 노트 아카이브', null, notes.map((n, i) => line('#learn', String(n.data.title).trim(), ymd(n.data.date).slice(0, 7), (n.data.categories ?? []).slice(0, 2).join(' · '), i + 1)).join(''))}
${section('알고리즘 풀이', null, '<p class="lede">백준 425문제, 프로그래머스 69문제(2021.12 – 2023.10). 실제 사이트에서 티어·유형·언어로 거를 수 있습니다.</p>')}`])
pages.push(['about', '소개', `
<header class="phead reveal"><h1>소개</h1><p class="lede">소개 문장은 사실관계를 확정해 둔 상태라 시안에 옮기지 않았습니다. 새 디자인을 적용해도 문장은 그대로 두고 조판만 바꿉니다.</p>
<div class="chips"><a class="pill" href="https://daedaem.github.io/about/" target="_blank" rel="noopener">지금 사이트의 소개 보기</a></div></header>`])

// ---------------------------------------------------------------- style
const CSS = `
:root { --bg: #ffffff; --fg: #09090b; --fg2: #3f3f46; --muted: #71717a; --line: #e4e4e7; --card: #fafafa; --card-h: #f4f4f5;
  --accent: #294970; --accent-2: #4f7cb8; --ok: #15803d; --ok-bg: #f0fdf4; --wip: #b45309; --wip-bg: #fffbeb; --mark-bg: #223e60; --mark-ink: #fcfaf5;
  --glass: rgb(255 255 255 / 0.72); --shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.08); --code: #fafafa; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; --bg: #09090b; --fg: #fafafa; --fg2: #d4d4d8; --muted: #a1a1aa; --line: #27272a; --card: #111113; --card-h: #18181b;
  --accent: #a9c4ea; --accent-2: #7aa7e6; --ok: #4ade80; --ok-bg: #052e16; --wip: #fbbf24; --wip-bg: #2a1a05; --mark-bg: #a8c1e2; --mark-ink: #192b43; --glass: rgb(24 24 27 / 0.72); --shadow: 0 8px 24px rgb(0 0 0 / 0.5); --code: #111113; } }
:root[data-theme="dark"] { color-scheme: dark; --bg: #09090b; --fg: #fafafa; --fg2: #d4d4d8; --muted: #a1a1aa; --line: #27272a; --card: #111113; --card-h: #18181b;
  --accent: #a9c4ea; --accent-2: #7aa7e6; --ok: #4ade80; --ok-bg: #052e16; --wip: #fbbf24; --wip-bg: #2a1a05; --mark-bg: #a8c1e2; --mark-ink: #192b43; --glass: rgb(24 24 27 / 0.72); --shadow: 0 8px 24px rgb(0 0 0 / 0.5); --code: #111113; }
* { box-sizing: border-box; }
[hidden] { display: none !important; }
body { margin: 0; background: var(--bg); color: var(--fg); font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', system-ui, sans-serif;
  font-size: 16px; line-height: 1.65; letter-spacing: -0.011em; word-break: keep-all; overflow-wrap: break-word; -webkit-font-smoothing: antialiased; }
a { color: inherit; text-decoration: none; }
h1, h2, h3, p { margin: 0; }
.mono { font-family: 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0; font-variant-numeric: tabular-nums; }
.vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
:focus-visible { outline: 2px solid var(--accent-2); outline-offset: 2px; border-radius: 6px; }
main { max-width: 680px; margin: 0 auto; padding: 72px 20px 140px; }
.i-sun { display: none; }
:root[data-theme="dark"] .i-sun { display: block; } :root[data-theme="dark"] .i-moon { display: none; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .i-sun { display: block; } :root:not([data-theme="light"]) .i-moon { display: none; } }

/* 등장: 흐림이 걷히며 떠오른다. 정지 상태는 늘 보이는 상태다 */
.reveal { animation: bf .6s cubic-bezier(.2,.7,.2,1) both; animation-delay: calc(var(--i, 0) * 60ms); }
@keyframes bf { from { opacity: 0; filter: blur(6px); transform: translateY(8px); } to { opacity: 1; filter: none; transform: none; } }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; } * { transition: none !important; } }

/* 하단 도크 */
.dock { position: fixed; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); z-index: 40;
  display: flex; align-items: center; gap: 2px; padding: 6px; border: 1px solid var(--line); border-radius: 18px; background: var(--glass);
  -webkit-backdrop-filter: blur(14px) saturate(1.4); backdrop-filter: blur(14px) saturate(1.4); box-shadow: var(--shadow); }
.dock a, .dock button { position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 0; border-radius: 12px;
  background: transparent; color: var(--muted); cursor: pointer; transition: transform .15s, background .15s, color .15s; }
.dock a:hover, .dock button:hover { background: var(--card-h); color: var(--fg); transform: translateY(-2px); }
.dock a.on { color: var(--fg); background: var(--card-h); }
.dock a.on::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: var(--accent-2); }
.dock .sep { width: 1px; height: 24px; margin: 0 4px; background: var(--line); }
.dock [data-tip]:hover::before { content: attr(data-tip); position: absolute; bottom: 54px; padding: 4px 8px; border-radius: 6px; background: var(--fg); color: var(--bg);
  font-size: 12px; white-space: nowrap; pointer-events: none; }
.brandmark { position: fixed; top: 18px; left: 20px; z-index: 30; display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 650; color: var(--fg); }
@media (max-width: 900px) { .brandmark { position: static; margin: 16px 20px 0; } main { padding-top: 32px; } }
.progress { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 50; background: var(--accent-2); transform-origin: 0 50%; transform: scaleX(0); }

/* 홈 */
.hero { padding-bottom: 8px; }
.hero-top { display: flex; align-items: center; gap: 14px; }
.hero-top svg { border-radius: 16px; box-shadow: var(--shadow); }
.name { font-size: 17px; font-weight: 700; }
.role { font-size: 14px; color: var(--muted); }
.hero h1 { margin-top: 36px; font-size: clamp(34px, 7vw, 52px); line-height: 1.12; font-weight: 800; letter-spacing: -0.05em; text-wrap: balance; }
.grad { background: linear-gradient(90deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { margin-top: 16px; font-size: 17px; line-height: 1.75; color: var(--fg2); text-wrap: pretty; }
.chips { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 8px; }
.pill { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; font-size: 14px; font-weight: 550; background: var(--bg); transition: background .15s; }
.pill:hover { background: var(--card-h); }
.pill svg { width: 15px; height: 15px; }
.blk { margin-top: 64px; }
.blk-h { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; }
.blk-h h2 { font-size: 13px; font-weight: 650; letter-spacing: 0.02em; color: var(--muted); }
.more { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; margin-block: -14px; font-size: 14px; font-weight: 550; color: var(--muted); }
.more:hover { color: var(--fg); }
.cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.card { display: flex; gap: 14px; padding: 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); transition: background .15s, border-color .15s, transform .2s; }
.card:hover { background: var(--card-h); transform: translateY(-2px); }
.card.big { grid-column: 1 / -1; flex-direction: column; padding: 0; overflow: hidden; }
.card.big .card-body { padding: 20px 22px 22px; }
.card-img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 7; object-fit: cover; border-bottom: 1px solid var(--line); }
:root[data-theme="dark"] .card-img, :root[data-theme="dark"] .card-thumb, :root[data-theme="dark"] .art-cover { filter: brightness(.85); }
.card-body { min-width: 0; flex: 1; }
.card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; font-size: 12.5px; color: var(--muted); }
.card h3 { margin-top: 10px; font-size: 17px; line-height: 1.45; font-weight: 700; letter-spacing: -0.025em; text-wrap: balance; }
.card.big h3 { font-size: 23px; }
.card p { margin-top: 6px; font-size: 14.5px; line-height: 1.65; color: var(--fg2); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.card-thumb { width: 72px; height: 48px; flex-shrink: 0; object-fit: cover; border-radius: 8px; border: 1px solid var(--line); }
.badge { display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border: 1px solid var(--line); border-radius: 6px; font-size: 12px; font-weight: 550; color: var(--fg2); background: var(--bg); }
.badge.ok { color: var(--ok); background: var(--ok-bg); border-color: transparent; }
.badge.wip { color: var(--wip); background: var(--wip-bg); border-color: transparent; }
.line { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 12px 10px; margin-inline: -10px; border-radius: 10px; transition: background .15s; }
.line:hover { background: var(--card-h); }
.line-t { font-size: 15.5px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.5; }
.line-s { display: block; margin-top: 2px; font-size: 12.5px; font-weight: 400; color: var(--muted); }
.line-r { flex-shrink: 0; font-size: 12.5px; color: var(--muted); }
.bento { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-bottom: 12px; }
.bento:has(> :nth-child(2):last-child) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.tile { display: block; padding: 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); transition: background .15s; }
a.tile:hover { background: var(--card-h); }
.tile-wide { grid-column: span 2; }
.tile-n { font-size: 30px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.1; }
.tile-t { margin-top: 6px; font-size: 14px; font-weight: 650; }
.tile-s { margin-top: 2px; font-size: 12.5px; color: var(--muted); }
.tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.tags.end { margin-top: 48px; }
.tagb { display: inline-flex; align-items: center; gap: 5px; min-height: 30px; padding: 0 10px; border: 1px solid var(--line); border-radius: 8px; font-size: 13px; background: var(--bg); color: var(--fg2); }
a.tagb:hover { background: var(--card-h); }
.tagb .mono { font-size: 11.5px; color: var(--muted); }
@media (max-width: 560px) { .cards { grid-template-columns: minmax(0, 1fr); } .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); } .tile-wide { grid-column: 1 / -1; } .card.big h3 { font-size: 20px; } }

/* 목록·위키 */
.phead h1 { font-size: 40px; line-height: 1.15; font-weight: 800; letter-spacing: -0.045em; }
.phead { margin-bottom: 32px; }
.wtools { display: flex; flex-direction: column; gap: 12px; position: sticky; top: 0; z-index: 10; padding: 12px 0; background: var(--bg); }
.input { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 14px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); color: var(--muted); }
.input:focus-within { border-color: var(--accent-2); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-2) 20%, transparent); }
.input input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font: inherit; font-size: 15.5px; color: var(--fg); }
.tabs { display: flex; gap: 4px; overflow-x: auto; padding: 4px; border-radius: 12px; background: var(--card-h); scrollbar-width: none; }
.tab, .seg button { flex-shrink: 0; min-height: 36px; padding: 0 12px; border: 0; border-radius: 9px; background: transparent; font: inherit; font-size: 13.5px; font-weight: 550; color: var(--muted); cursor: pointer; }
.tab .mono { font-size: 11.5px; }
.tab.on, .seg button.on { background: var(--bg); color: var(--fg); box-shadow: 0 1px 3px rgb(0 0 0 / 0.12); }
.seg { display: inline-flex; align-self: flex-start; gap: 4px; padding: 4px; border-radius: 12px; background: var(--card-h); }
.count { margin: 8px 0 12px; font-size: 12.5px; color: var(--muted); }
.wlist { display: grid; gap: 10px; }
.wcard { display: block; padding: 18px; border: 1px solid var(--line); border-radius: 16px; background: var(--card); transition: background .15s, transform .2s; }
.wcard:hover { background: var(--card-h); transform: translateY(-2px); }
.wcard-top { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; font-size: 12.5px; color: var(--muted); }
.wcard-top .mono { margin-left: auto; }
.wcard h3 { margin-top: 10px; font-size: 17px; line-height: 1.45; font-weight: 700; letter-spacing: -0.025em; }
.wcard p { margin-top: 6px; font-size: 14.5px; line-height: 1.65; color: var(--fg2); }
.pager { margin-top: 20px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--muted); }
.btn { min-height: 44px; padding: 0 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--bg); font: inherit; font-size: 14px; font-weight: 600; color: var(--fg); cursor: pointer; }
.btn:disabled { color: var(--line); cursor: default; }
.empty { padding: 40px 0; color: var(--muted); }

/* 글 */
.backlink { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 14px; font-weight: 550; color: var(--muted); }
.backlink:hover { color: var(--fg); }
.art-meta { margin-top: 16px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; font-size: 13px; color: var(--muted); }
.art h1 { margin-top: 14px; font-size: clamp(28px, 5.4vw, 40px); line-height: 1.22; font-weight: 800; letter-spacing: -0.045em; text-wrap: balance; }
.happened { margin-top: 10px; font-size: 14px; color: var(--muted); }
.deck { margin-top: 14px; font-size: 17px; line-height: 1.75; color: var(--fg2); }
.art-cover { display: block; width: 100%; height: auto; margin-top: 28px; border-radius: 16px; border: 1px solid var(--line); aspect-ratio: 16 / 8; object-fit: cover; }
.callout { margin-top: 24px; padding: 16px 18px; border: 1px solid var(--line); border-radius: 14px; background: var(--card); }
.callout-k { font-size: 12.5px; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
.callout p:last-child { font-size: 16px; line-height: 1.7; font-weight: 550; }
.prose { margin-top: 36px; }
.prose p, .prose li { font-size: 17px; line-height: 1.85; color: var(--fg2); }
.prose p { margin: 0 0 1.25em; }
.prose strong { color: var(--fg); }
.prose a { color: var(--accent); text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 0.25em; }
.prose h2 { margin: 56px 0 16px; font-size: 25px; line-height: 1.4; font-weight: 750; letter-spacing: -0.035em; scroll-margin-top: 24px; }
.prose h3 { margin: 36px 0 12px; font-size: 19px; line-height: 1.45; font-weight: 700; letter-spacing: -0.03em; scroll-margin-top: 24px; }
.prose ul, .prose ol { margin: 0 0 1.25em; padding-left: 1.3em; }
.prose blockquote { margin: 0 0 1.4em; padding: 14px 18px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
.prose blockquote p { font-size: 15.5px; margin-bottom: .6em; } .prose blockquote p:last-child { margin-bottom: 0; }
.prose hr { border: 0; border-top: 1px solid var(--line); margin: 40px 0; }
.ic { padding: 2px 6px; border-radius: 6px; background: var(--card-h); font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: .86em; color: var(--fg); }
.code { margin: 24px 0 28px; border: 1px solid var(--line); border-radius: 14px; background: var(--code); overflow: hidden; }
.code figcaption { display: flex; align-items: center; justify-content: space-between; height: 44px; padding: 0 4px 0 16px; border-bottom: 1px solid var(--line); font-size: 12px; color: var(--muted); }
.ghost { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); cursor: pointer; }
.ghost:hover { background: var(--card-h); color: var(--fg); }
.code pre { margin: 0; padding: 16px 18px; overflow-x: auto; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13.5px; line-height: 1.75; color: var(--fg); }
.table { overflow-x: auto; margin: 0 0 1.6em; border: 1px solid var(--line); border-radius: 12px; }
.prose table { border-collapse: collapse; width: 100%; font-size: 14.5px; }
.prose th, .prose td { padding: 10px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; color: var(--fg2); }
.prose th { background: var(--card-h); color: var(--fg); font-weight: 650; white-space: nowrap; }
.prose tr:last-child td { border-bottom: 0; }
.pn { margin-top: 32px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.pn .k { font-size: 12.5px; color: var(--muted); }
.pn h3 { margin-top: 4px; font-size: 15px; }
@media (max-width: 560px) { .pn { grid-template-columns: minmax(0, 1fr); } .prose p, .prose li { font-size: 16.5px; } }

/* 검색 팔레트·목차 시트 */
dialog { color: var(--fg); }
dialog.cmd { width: min(40rem, calc(100vw - 24px)); margin-top: 12vh; padding: 0; border: 1px solid var(--line); border-radius: 16px; background: var(--bg); box-shadow: var(--shadow); overflow: hidden; }
dialog::backdrop { background: rgb(0 0 0 / 0.4); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); }
.cmd-top { display: flex; align-items: center; gap: 10px; padding: 0 14px; border-bottom: 1px solid var(--line); color: var(--muted); }
.cmd-top input { flex: 1; height: 54px; border: 0; outline: 0; background: transparent; font: inherit; font-size: 16px; color: var(--fg); }
.cmd-list { max-height: min(56vh, 460px); overflow-y: auto; padding: 6px; }
.cmd-g { padding: 10px 10px 4px; font-size: 12px; font-weight: 600; color: var(--muted); }
.cmd-i { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; }
.cmd-i[aria-selected="true"] { background: var(--card-h); }
.cmd-i .t { font-size: 14.5px; font-weight: 600; letter-spacing: -0.02em; }
.cmd-i .d { font-size: 12.5px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.cmd-i svg { flex-shrink: 0; color: var(--muted); }
.cmd-foot { display: flex; justify-content: space-between; padding: 8px 14px; border-top: 1px solid var(--line); font-size: 12px; color: var(--muted); }
kbd { display: inline-flex; align-items: center; min-width: 20px; height: 20px; padding: 0 5px; margin-right: 3px; border: 1px solid var(--line); border-radius: 5px; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; }
mark { background: color-mix(in srgb, var(--accent-2) 22%, transparent); color: inherit; border-radius: 3px; padding: 0 1px; }
dialog.sheet { position: fixed; inset: auto 0 0 0; width: 100%; max-width: 560px; max-height: 70dvh; margin: 0 auto; padding: 8px 0 env(safe-area-inset-bottom, 0px); border: 1px solid var(--line); border-bottom: 0; border-radius: 20px 20px 0 0; background: var(--bg); overflow: auto; }
dialog.sheet[open] { animation: rise .25s cubic-bezier(.2,.7,.2,1); }
@keyframes rise { from { transform: translateY(40px); } to { transform: none; } }
.grip { width: 36px; height: 4px; margin: 4px auto 8px; border-radius: 4px; background: var(--line); }
.sheet-t { padding: 0 20px 6px; font-size: 13px; font-weight: 650; color: var(--muted); }
.sheet ol { margin: 0; padding: 0 12px 16px; list-style: none; }
.sheet a { display: flex; align-items: center; min-height: 44px; padding: 0 8px; border-radius: 10px; font-size: 15px; }
.sheet a:hover { background: var(--card-h); }
.sheet a.d3 { padding-left: 24px; color: var(--fg2); font-size: 14.5px; }
.toast { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); padding: 8px 14px; border-radius: 10px; background: var(--fg); color: var(--bg); font-size: 13.5px; z-index: 60; }

/* ---- Magic UI Portfolio 소스에서 읽은 값으로 덧씌움 ---- */
:root { --bg: #ffffff; --fg: #0a0a0a; --fg2: #404040; --muted: #737373; --line: #e5e5e5; --card: #ffffff; --card-h: #f5f5f5; --radius: 10px; --primary: #171717; --primary-fg: #fafafa; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #0a0a0a; --fg: #fafafa; --fg2: #d4d4d4; --muted: #a3a3a3; --line: #262626; --card: #0a0a0a; --card-h: #171717; --primary: #e5e5e5; --primary-fg: #171717; } }
:root[data-theme="dark"] { --bg: #0a0a0a; --fg: #fafafa; --fg2: #d4d4d4; --muted: #a3a3a3; --line: #262626; --card: #0a0a0a; --card-h: #171717; --primary: #e5e5e5; --primary-fg: #171717; }
main { max-width: 672px; padding: 48px 24px 120px; position: relative; z-index: 1; }
@media (min-width: 640px) { main { padding-top: 96px; } }
.flicker { position: absolute; top: 0; left: 0; height: 100px; z-index: 0; pointer-events: none; -webkit-mask-image: linear-gradient(to bottom, #000, transparent); mask-image: linear-gradient(to bottom, #000, transparent); }
.brandmark { z-index: 5; }
.reveal { animation: bf .4s ease-out both; animation-delay: calc(40ms + var(--i, 0) * 40ms); }
@keyframes bf { from { opacity: 0; filter: blur(6px); transform: translateY(-6px); } to { opacity: 1; filter: none; transform: none; } }
.hero-row { display: flex; justify-content: space-between; gap: 24px 32px; }
.hero-l { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.role { font-size: 14px; color: var(--muted); }
.hero h1 { margin-top: 0; font-size: clamp(30px, 6vw, 48px); font-weight: 600; letter-spacing: -0.05em; line-height: 1.15; }
.hero .lede { margin-top: 8px; font-size: 18px; color: var(--muted); max-width: 600px; }
.avatar { flex-shrink: 0; width: 128px; height: 128px; border-radius: 50%; overflow: hidden; box-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 0 0 4px var(--card-h); border: 1px solid var(--line); }
.avatar svg { display: block; width: 100%; height: 100%; }
.avatar rect { rx: 0; }
@media (max-width: 767px) { .hero-row { flex-direction: column-reverse; } .avatar { width: 96px; height: 96px; } }
.pill { border-radius: 999px; }
.blk { margin-top: 56px; }
.blk-h h2 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; color: var(--fg); }
.card, .tile, .wcard { border-radius: 12px; background: var(--card); }
.card.big .card-img { aspect-ratio: auto; height: 192px; }
.line { align-items: flex-start; justify-content: flex-start; gap: 8px; padding: 10px 0; margin: 0; border-radius: 0; }
.line:hover { background: transparent; }
.nlist { display: flex; flex-direction: column; gap: 8px; }
.num { flex-shrink: 0; margin-top: 6px; font-size: 12px; font-weight: 500; color: var(--fg); }
.line-t { font-size: 18px; font-weight: 500; letter-spacing: -0.025em; line-height: 1.5; }
.line-s { margin-top: 6px; font-size: 12px; }
.chev { display: inline-block; margin-left: 4px; vertical-align: -2px; color: var(--muted); opacity: 0; transform: translateX(-8px); transition: opacity .2s, transform .2s; }
.line:hover .chev, .line:focus-visible .chev { opacity: 1; transform: none; }
.erow { display: flex; align-items: center; gap: 12px; padding: 12px 0; }
.logo { flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: 50%; background: var(--card-h); box-shadow: 0 0 0 2px var(--line); font-size: 14px; font-weight: 700; color: var(--fg2); }
.erow-b { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.erow-t { font-size: 15.5px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.4; }
.erow-s { font-size: 13.5px; color: var(--muted); }
.erow-r { flex-shrink: 0; font-size: 12px; color: var(--muted); }
.arr { display: inline-block; margin-left: 6px; vertical-align: -1px; color: var(--muted); opacity: 0; transform: translateX(-8px); transition: opacity .2s, transform .2s; }
.erow:hover .arr { opacity: 1; transform: none; }
.phead h1 { font-size: 24px; font-weight: 600; letter-spacing: -0.03em; }
.count-b { margin-left: 4px; padding: 3px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--card); font-size: 13px; font-weight: 400; color: var(--muted); vertical-align: 3px; }
.lede.sm { margin-top: 6px; font-size: 14px; color: var(--muted); }
.phead { margin-bottom: 28px; }
/* 도크: 높이 56px, 둥근 알약, 아이콘 40px(마우스 근처 60px까지), 위에 뜨는 검은 말풍선 */
.dock { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); height: 56px; padding: 8px; gap: 8px; align-items: flex-end; border-radius: 999px; background: color-mix(in srgb, var(--card) 90%, transparent);
  -webkit-backdrop-filter: blur(40px); backdrop-filter: blur(40px); box-shadow: 0 0 10px 3px color-mix(in srgb, var(--primary) 5%, transparent); overflow: visible; }
.dock .di { --s: 40px; width: var(--s); height: var(--s); padding: 0; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--muted); transition: width .12s ease-out, height .12s ease-out, background .15s, color .15s; transform: none; }
.dock .di:hover { transform: none; background: var(--card-h); color: var(--fg); }
.dock .di svg { width: calc(var(--s) * .5); height: calc(var(--s) * .5); }
.dock .di.on { color: var(--fg); }
.dock .di.on::after { bottom: -6px; background: var(--fg); }
.dock .sep { height: 26px; align-self: center; }
.dock [data-tip]:hover::before { bottom: calc(100% + 10px); padding: 8px 16px; border-radius: 12px; background: var(--primary); color: var(--primary-fg); font-size: 14px; box-shadow: 0 10px 40px -10px rgb(0 0 0 / .3); }
@media (max-width: 400px) { .dock { gap: 4px; padding: 8px 6px; } .dock .di { --s: 36px; } }
.btn { min-height: 44px; border-radius: 8px; }
`

// ---------------------------------------------------------------- script
const INDEX = [
  ...posts.map((p) => ({ g: '글', t: p.data.title, d: p.data.description, h: '#post-' + p.id, s: (p.data.title + ' ' + p.data.description + ' ' + (p.data.tags ?? []).join(' ')).toLowerCase() })),
  ...wiki.map((w) => ({ g: '위키', t: w.data.title, d: w.data.description, h: '#wiki-' + w.id, s: (w.data.title + ' ' + w.data.description + ' ' + (w.data.tags ?? []).join(' ')).toLowerCase() })),
]
const JS = `
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)]
const root = document.documentElement
try { const t = localStorage.getItem('dd-b-theme'); if (t) root.dataset.theme = t } catch {}
function toggleTheme() {
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  root.dataset.theme = dark ? 'light' : 'dark'
  try { localStorage.setItem('dd-b-theme', root.dataset.theme) } catch {}
}
$('#theme').addEventListener('click', toggleTheme)
const TITLES = ${JSON.stringify(Object.fromEntries(pages.map(([id, t]) => [id, t])))}
let current = ''
function show() {
  const id = (location.hash || '#home').slice(1)
  const page = document.getElementById('p-' + id) ? id : 'home'
  if (page === current) return
  $$('.page').forEach((p) => (p.hidden = p.id !== 'p-' + page))
  current = page
  window.scrollTo(0, 0)
  document.title = page === 'home' ? '대댐 로그' : TITLES[page] + ' · 대댐 로그'
  const sec = page.startsWith('post') ? 'posts' : page.startsWith('wiki') ? 'wiki' : page
  $$('.dock a[data-nav]').forEach((a) => { const on = a.dataset.nav === sec; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current') })
  $$('#p-' + page + ' .reveal').forEach((el, i) => { el.style.setProperty('--i', Math.min(i, 8)); el.style.animation = 'none'; el.offsetWidth; el.style.animation = '' })
  $('#tocbtn').hidden = !$('#p-' + page + ' [data-toc]')
  progress()
}
addEventListener('hashchange', show)
document.addEventListener('click', (e) => { const t = e.target.closest('[data-topic-link]'); if (t) setTimeout(() => setTopic(t.dataset.topicLink), 0) })
const bar = $('#progress')
function progress() {
  const art = current.startsWith('post-') || current.startsWith('wiki-')
  bar.hidden = !art
  const h = document.documentElement.scrollHeight - innerHeight
  bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'
}
addEventListener('scroll', progress, { passive: true })
// 목차 시트
const sheet = $('#sheet')
$('#tocbtn').addEventListener('click', () => {
  const heads = JSON.parse($('#p-' + current + ' [data-toc]').dataset.toc)
  $('#sheet-list').innerHTML = heads.length ? heads.map((h) => '<li><a href="#" data-target="' + h.id + '" class="' + (h.depth === 3 ? 'd3' : '') + '">' + h.text.replace(/</g, '&lt;') + '</a></li>').join('') : '<li class="sheet-t">목차가 없는 글입니다.</li>'
  sheet.showModal()
})
sheet.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-target]')
  if (a) { e.preventDefault(); sheet.close(); const h = document.getElementById(a.dataset.target); h?.scrollIntoView({ block: 'start' }); h?.focus({ preventScroll: true }) }
  else if (e.target === sheet) sheet.close()
})
// 코드 복사
let tt
function toast(m) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t) } t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => (t.hidden = true), 1600) }
document.addEventListener('click', async (e) => { const b = e.target.closest('.copybtn'); if (!b) return; try { await navigator.clipboard.writeText(b.closest('.code').querySelector('code').textContent); toast('복사했습니다') } catch { toast('복사하지 못했습니다') } })
// 위키 거르기
const W = { q: '', topic: '', status: '', page: 1 }, cards = $$('#wlist .wcard')
function setTopic(t) { W.topic = t || ''; W.page = 1; renderWiki() }
function renderWiki() {
  const q = W.q.trim().toLowerCase().split(/\\s+/).filter(Boolean)
  const list = cards.filter((c) => (!W.topic || c.dataset.topic === W.topic) && (!W.status || c.dataset.status === W.status) && q.every((w) => c.dataset.s.includes(w)))
  const pages = Math.max(1, Math.ceil(list.length / 10)); W.page = Math.min(W.page, pages)
  const shown = new Set(list.slice((W.page - 1) * 10, W.page * 10))
  cards.forEach((c) => (c.hidden = !shown.has(c)))
  $('#wempty').hidden = list.length > 0
  $('#wcount').textContent = list.length + '개 문서'
  $('#wpage').textContent = W.page + ' / ' + pages
  $('#wprev').disabled = W.page <= 1; $('#wnext').disabled = W.page >= pages
  $$('.tab').forEach((b) => { const on = b.dataset.topic === W.topic; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) })
  $$('.seg button').forEach((b) => { const on = b.dataset.status === W.status; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) })
}
$('#wq').addEventListener('input', (e) => { W.q = e.target.value; W.page = 1; renderWiki() })
$$('.tab').forEach((b) => b.addEventListener('click', () => setTopic(b.dataset.topic)))
$$('.seg button').forEach((b) => b.addEventListener('click', () => { W.status = b.dataset.status; W.page = 1; renderWiki() }))
$('#wprev').addEventListener('click', () => { W.page--; renderWiki(); $('.wtools').scrollIntoView({ block: 'start' }) })
$('#wnext').addEventListener('click', () => { W.page++; renderWiki(); $('.wtools').scrollIntoView({ block: 'start' }) })
renderWiki()
// 명령 팔레트
const INDEX = ${JSON.stringify(INDEX)}
const ACTS = [{ g: '바로 가기', t: '홈', h: '#home' }, { g: '바로 가기', t: '글 목록', h: '#posts' }, { g: '바로 가기', t: '학습 위키', h: '#wiki' }, { g: '바로 가기', t: '테마 바꾸기', act: 1 }]
const dlg = $('#cmd'), q = $('#cq'), list = $('#cl')
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const hl = (s, ws) => { let o = '', i = 0; const l = s.toLowerCase(); while (i < s.length) { const w = ws.find((w) => l.startsWith(w, i)); if (w) { o += '<mark>' + esc(s.slice(i, i + w.length)) + '</mark>'; i += w.length } else { o += esc(s[i]); i++ } } return o }
let sel = 0
const ICON = { 글: ${JSON.stringify(I.pen)}, 위키: ${JSON.stringify(I.book)}, '바로 가기': ${JSON.stringify(I.arrow)} }
function run() {
  const ws = q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean)
  const hits = ws.length ? INDEX.filter((i) => ws.every((w) => i.s.includes(w))) : INDEX.slice(0, 4)
  const acts = ws.length ? ACTS.filter((a) => ws.every((w) => a.t.toLowerCase().includes(w))) : ACTS
  const all = [...hits, ...acts]
  let n = 0, last = ''
  list.innerHTML = all.map((i) => { const head = i.g !== last ? '<p class="cmd-g">' + i.g + '</p>' : ''; last = i.g; return head + '<a class="cmd-i" role="option" id="co' + n++ + '" href="' + (i.h || '#') + '"' + (i.act ? ' data-act="1"' : '') + '>' + ICON[i.g] + '<span><span class="t">' + hl(i.t, ws) + '</span>' + (i.d ? '<span class="d">' + hl(i.d, ws) + '</span>' : '') + '</span></a>' }).join('') || '<p class="cmd-g">일치하는 글·위키가 없습니다.</p>'
  pick(0)
}
function pick(i) { const o = $$('.cmd-i', list); if (!o.length) return; sel = (i + o.length) % o.length; o.forEach((x, j) => x.setAttribute('aria-selected', j === sel)); q.setAttribute('aria-activedescendant', o[sel].id); o[sel].scrollIntoView({ block: 'nearest' }) }
function go(a) { if (!a) return; dlg.close(); if (a.dataset.act) toggleTheme(); else location.hash = a.getAttribute('href') }
function open() { if (!dlg.open) dlg.showModal(); q.value = ''; run(); q.focus() }
$('#searchbtn').addEventListener('click', open)
q.addEventListener('input', run)
q.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); pick(sel + 1) } else if (e.key === 'ArrowUp') { e.preventDefault(); pick(sel - 1) } else if (e.key === 'Enter') { e.preventDefault(); go($$('.cmd-i', list)[sel]) } })
list.addEventListener('click', (e) => { const a = e.target.closest('.cmd-i'); if (a) { e.preventDefault(); go(a) } })
list.addEventListener('mousemove', (e) => { const a = e.target.closest('.cmd-i'); if (a) { const i = $$('.cmd-i', list).indexOf(a); if (i !== sel) pick(i) } })
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open() } })
// 상단 깜빡이는 격자(2px 사각형, 2px 간격, 아래로 흐려짐). 움직임 줄이기 설정이면 멈춘 격자만 그린다
const cv = $('#flicker'), cx = cv.getContext('2d')
let cells = [], cw = 0
function sizeGrid() { const d = devicePixelRatio || 1; cw = innerWidth; cv.width = cw * d; cv.height = 100 * d; cv.style.width = cw + 'px'; cx.setTransform(d, 0, 0, d, 0, 0); cells = []; for (let x = 0; x < cw; x += 4) for (let y = 0; y < 100; y += 4) cells.push([x, y, Math.random() * 0.3]) }
function drawGrid() { const fg = getComputedStyle(root).getPropertyValue('--fg').trim() || '#000'; cx.clearRect(0, 0, cw, 100); cx.fillStyle = fg; for (const c of cells) { cx.globalAlpha = c[2]; cx.fillRect(c[0], c[1], 2, 2) } cx.globalAlpha = 1 }
sizeGrid(); drawGrid()
addEventListener('resize', () => { sizeGrid(); drawGrid() })
new MutationObserver(drawGrid).observe(root, { attributes: true, attributeFilter: ['data-theme'] })
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { for (const c of cells) if (Math.random() < 0.02) c[2] = Math.random() * 0.3; drawGrid() }, 120)
// 도크: 마우스가 가까운 아이콘일수록 커진다(40 → 60px). 터치 기기와 움직임 줄이기에서는 끈다
const dockItems = $$('.dock .di')
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
if (canHover) {
  $('.dock').addEventListener('mousemove', (e) => { for (const it of dockItems) { const r = it.getBoundingClientRect(); const d = Math.abs(e.clientX - (r.left + r.width / 2)); const k = Math.max(0, 1 - d / 100); it.style.setProperty('--s', 40 + 20 * k + 'px') } })
  $('.dock').addEventListener('mouseleave', () => dockItems.forEach((it) => it.style.setProperty('--s', '40px')))
}
show()
`

const allText = pages.map(([, , h]) => h).join(' ').replace(/<[^>]+>/g, ' ') + JSON.stringify(INDEX) + ' 홈 글 목록 학습 위키 테마 바꾸기 바로 가기 일치하는 글·위키가 없습니다 복사했습니다 복사하지 못했습니다 목차가 없는 글입니다 검색 이동 열기 닫기 개 문서 이전 다음'
writeFileSync(S + '/protob-chars.txt', [...new Set(allText)].join(''))
const [font, mono] = process.argv.slice(2)
if (font) {
  const f = (p) => `data:font/woff2;base64,${readFileSync(p).toString('base64')}`
  const dock = `<nav class="dock" aria-label="주요 메뉴">
<a class="di" href="#home" data-nav="home" aria-label="홈" data-tip="홈">${I.home}</a>
<a class="di" href="#posts" data-nav="posts" aria-label="글" data-tip="글">${I.pen}</a>
<a class="di" href="#wiki" data-nav="wiki" aria-label="위키" data-tip="위키">${I.book}</a>
<a class="di" href="#learn" data-nav="learn" aria-label="학습 기록" data-tip="학습 기록">${I.stack}</a>
<a class="di" href="#about" data-nav="about" aria-label="소개" data-tip="소개">${I.user}</a>
<span class="sep" aria-hidden="true"></span>
<button type="button" class="di" id="tocbtn" aria-label="목차" data-tip="목차" hidden>${I.list}</button>
<button type="button" class="di" id="searchbtn" aria-label="검색 (Ctrl K)" data-tip="검색 ⌘K">${I.search}</button>
<button type="button" class="di" id="theme" aria-label="테마 바꾸기" data-tip="테마">${I.moon}${I.sun}</button>
</nav>`
  const html = `<title>대댐 로그 B안</title>
<style>
@font-face { font-family: 'Pretendard Variable'; font-weight: 45 920; font-display: swap; src: url(${f(font)}) format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 400; font-display: swap; src: url(${f(mono)}) format('woff2'); }
${CSS}
</style>
<canvas class="flicker" id="flicker" aria-hidden="true"></canvas>
<div class="progress" id="progress" hidden></div>
<a class="brandmark" href="#home">${mark(24)}대댐 로그</a>
<main>
${pages.map(([id, , h]) => `<div class="page" id="p-${id}" hidden>${h}</div>`).join('\n')}
</main>
${dock}
<dialog class="cmd" id="cmd" aria-label="검색">
<div class="cmd-top">${I.search}<label class="vh" for="cq">글·위키 검색</label><input id="cq" type="search" placeholder="글, 위키, 바로 가기 검색…" autocomplete="off" role="combobox" aria-expanded="true" aria-controls="cl"></div>
<div class="cmd-list" id="cl" role="listbox" aria-label="검색 결과"></div>
<div class="cmd-foot"><span><kbd>↑</kbd><kbd>↓</kbd>이동 <kbd>Enter</kbd>열기</span><span><kbd>Esc</kbd>닫기</span></div>
</dialog>
<dialog class="sheet" id="sheet" aria-label="목차"><div class="grip" aria-hidden="true"></div><p class="sheet-t">목차</p><ol id="sheet-list"></ol></dialog>
<script>${JS}</script>
`
  mkdirSync(S + '/protob', { recursive: true })
  writeFileSync(S + '/protob/index.html', html)
  console.log('written', (html.length / 1024).toFixed(0) + 'KB', pages.length)
} else console.log('chars', pages.length)
