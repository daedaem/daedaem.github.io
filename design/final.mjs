// 1안(다듬은 B) 개정판. 표준 검사(WCAG 2.2 AA, 닐슨 10원칙)에서 확인된 문제를 고친 단일 시안이다.
// 이전 여러 후보용 코드(사이드 레일, 벤토 등)는 넣지 않는다. 실제 사이트 소스와 무관한 별도 페이지다.
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
// 이 폴더(design/)와 블로그 저장소(master를 받은 곳, npm ci를 마친 상태)의 위치.
// 블로그 저장소 경로는 BLOG_REPO로 넘긴다. 없으면 이 저장소를 받은 폴더 옆의 daedaem.github.io를 본다.
const S = fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '')
const REPO = resolve(process.env.BLOG_REPO ?? resolve(S, '../../daedaem.github.io'))
const require = createRequire(S + '/')
const { marked } = require('marked')
const yaml = require(REPO + '/node_modules/js-yaml/index.js')

// 코드 색: IDE(VS Code 기본 테마 Light+ / Dark+)처럼 변수·타입·함수·문자열·주석을 서로 다른 색으로 나눈다.
// Light+의 두 색은 밝은 코드 배경(#fafafa)에서 4.5:1에 조금 못 미쳐 같은 계열로 조금 어둡게 바꾼다.
const { createHighlighter } = await import(REPO + '/node_modules/shiki/dist/index.mjs')
const LANGS = ['java', 'sql', 'javascript', 'csharp', 'xml', 'bash', 'properties']
const hl = await createHighlighter({ themes: ['light-plus', 'dark-plus'], langs: LANGS })
const LIGHT_FIX = { '#267f99': '#1f6f86', '#098658': '#07774e' }
const readable = {
  name: 'readable-light-plus',
  span(node) {
    const st = node.properties.style
    if (typeof st !== 'string') return
    node.properties.style = st.replace(/(^|;)color:(#[\da-f]{6})/gi, (m, sep, c) => (LIGHT_FIX[c.toLowerCase()] ? `${sep}color:${LIGHT_FIX[c.toLowerCase()]}` : m))
  },
}
function colorize(text, lang) {
  const l = LANGS.includes(lang) ? lang : 'text'
  const out = hl.codeToHtml(text, { lang: l, themes: { light: 'light-plus', dark: 'dark-plus' }, transformers: [readable] })
  return out.match(/<code>([\s\S]*)<\/code>/)[1]
}

// B안 스타일을 그대로 가져와 기반으로 쓴다
const protoB = readFileSync(S + '/proto-b.mjs', 'utf8')
const BASE_CSS = protoB.slice(protoB.indexOf('const CSS = `') + 13, protoB.indexOf('`\n\n// ---------------------------------------------------------------- script'))

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ymd = (d) => new Date(d).toISOString().slice(0, 10).replace(/-/g, '.')
const iso = (d) => new Date(d).toISOString().slice(0, 10)
const CAT = { 'data-integrity': '데이터 정합성', performance: '성능', operations: '운영·장애 대응', legacy: '레거시 대응' }
const TOPIC = { java: 'Java', spring: 'Spring', database: '데이터베이스', dotnet: '.NET', web: '웹·프론트엔드', infra: '인프라·운영', cs: '기초 지식', etc: '그 밖에' }
const INTRO = '느린 조회와 어긋난 데이터처럼 운영 중 만난 문제를 화면에서 DB까지 로그와 데이터 흐름을 따라 추적합니다. 무엇을 확인했고 왜 그 방법을 골랐는지 기록합니다.'
const PICKS = [
  ['null-and-empty-string-sync-failure', 'NULL·빈 문자열 비교와 인터페이스 처리 구분값. 반복 결재를 만들던 두 오류를 각각 수정한 과정.'],
  ['address-search-9s-to-100ms', '조회 시간을 9초에서 1초대로 줄인 뒤에도, 주소 데이터의 관리 방식을 다시 선택한 이유.'],
  ['retire-flash-module-by-integration', '기존 API 연동에 맞춘 업무 로직 개발과 계약 상태 동기화, 적재 실패 복구 과정.'],
]
const TI = S + '/icons/'
const icon = (n, s = 18) => readFileSync(TI + n + '.svg', 'utf8')
  .replace(/<svg[\s\S]*?>/, `<svg class="ti ti-${n}" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`)
  .replace(/<path stroke="none"[^>]*\/>/, '').replace(/\n\s*/g, '')
const I = { home: icon('home', 20), doc: icon('file-text', 20), book: icon('book', 20), note: icon('notebook', 20), user: icon('user', 20), search: icon('search'), list: icon('list'), back: icon('arrow-left', 16), arrow: icon('arrow-right', 15), up: icon('arrow-up-right', 14), copy: icon('copy', 16), x: icon('x') }
const THEME = `<span class="i-moon">${icon('moon')}</span><span class="i-sun">${icon('sun')}</span>`
const MONO = 'M14.7 8v12.8a4.7 4.7 0 1 1-4.7-4.7h4.7M27 8v12.8a4.7 4.7 0 1 1-4.7-4.7H27'
const mark = (s) => `<svg width="${s}" height="${s}" viewBox="0 0 34 34" fill="none" aria-hidden="true"><rect width="34" height="34" rx="9" fill="var(--mark-bg)"></rect><path d="${MONO}" stroke="var(--mark-ink)" stroke-width="2.8" stroke-linejoin="round"></path></svg>`

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
const coverUri = {}
for (const p of posts) if (p.data.coverImage) coverUri[p.id] = `data:image/webp;base64,${readFileSync(`${REPO}/public${p.data.coverImage.replace('.webp', '-768.webp')}`).toString('base64')}`
const img = (id, cls, w = 768, h = 512) => (coverUri[id] ? `<img class="${cls}" src="${coverUri[id]}" alt="" width="${w}" height="${h}" loading="lazy">` : '')
const topicCounts = {}
for (const w of wiki) topicCounts[w.data.topic] = (topicCounts[w.data.topic] ?? 0) + 1
const topicOrder = Object.keys(topicCounts).sort((a, b) => topicCounts[b] - topicCounts[a])
const wdate = (w) => w.data.updated ?? w.data.created
const rest = posts.filter((p) => !PICKS.some(([i]) => i === p.id))
const ALGO = 494
const plain = (md) => md
  .replace(/```\w*\n/g, ' ')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크·그림은 글자만 남기고 주소는 뺀다
  .replace(/^#{1,6}\s+/gm, '') // 제목 표시
  .replace(/[>*`|\[\]!]+/g, ' ') // 식별자 안의 _와 #(AUTONOMOUS_TRANSACTION, serial#)는 남긴다
  .replace(/(^|\s)[#_]+(?=\s|$)/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

function render(body, prefix) {
  const headings = [], used = new Set(), r = new marked.Renderer()
  let nCode = 0, nTable = 0
  r.heading = ({ tokens, depth }) => {
    const text = marked.Parser.parseInline(tokens), plainText = text.replace(/<[^>]+>/g, '')
    let id = prefix + '-' + plainText.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-')
    while (used.has(id)) id += '-1'
    used.add(id)
    if (depth === 2 || depth === 3) headings.push({ depth, text: plainText, id })
    return `<h${depth} id="${id}" tabindex="-1">${text}</h${depth}>`
  }
  // 넘치는 코드·표에만 스크립트가 tabindex·역할·이름을 붙인다(키보드로 가로 스크롤)
  r.code = ({ text, lang }) => { const l = esc(lang || 'text'); const n = ++nCode; return `<figure class="code"><figcaption><span class="mono">${l}</span><button type="button" class="ghost copybtn" aria-label="코드 블록 ${n} 복사 (${l})">${I.copy}</button></figcaption><pre data-label="코드 블록 ${n} (${l})"><code>${colorize(text, lang)}</code></pre></figure>` }
  r.table = function (t) {
    return `<div class="table" data-label="표 ${++nTable}"><table><thead><tr>${t.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((row) => `<tr>${row.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
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
const CHEV = '<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
const line = (href, title, sub, n, desc = '') => `<li><a class="line" href="${href}"><span class="num mono" aria-hidden="true">${String(n).padStart(2, '0')}.</span><span class="line-t">${esc(title)}${CHEV}<span class="line-s">${sub}</span>${desc ? `<span class="line-d">${esc(desc)}</span>` : ''}</span></a></li>`
const section = (title, more, body) => `<section class="blk"><div class="blk-h"><h2>${title}</h2>${more ? `<a href="${more[1]}" class="more">${more[0]}${I.arrow}</a>` : ''}</div>${body}</section>`
const postCard = (p, text, big = false) => `<li${big ? ' class="c-big"' : ''}><a class="card${big ? ' big' : ''}" href="#post-${p.id}">
${big ? img(p.id, 'card-img') : ''}<div class="card-body"><div class="card-meta">${badge(CAT[p.data.category], 'cat')}<time datetime="${iso(p.data.date)}">작성 <span class="mono">${ymd(p.data.date)}</span></time><span>${minutes(p.body)}분 읽기</span></div>
<h3>${esc(p.data.title)}</h3><p>${esc(text)}</p></div></a></li>`
const erow = (w) => `<li><a class="erow" href="#wiki-${w.id}"><span class="erow-b"><span class="erow-t">${esc(w.data.title)}<span class="arr">${I.up}</span></span><span class="erow-s">${TOPIC[w.data.topic]}</span></span><span class="erow-r mono">${ymd(wdate(w)).slice(5)}</span></a></li>`
const pills = `<div class="chips"><a class="pill" href="#about">${icon('user', 15)}소개·경력</a><a class="pill" href="https://github.com/daedaem" target="_blank" rel="noopener">${icon('brand-github', 15)}GitHub</a><a class="pill" href="https://daedaem.github.io/rss.xml" target="_blank" rel="noopener">${icon('rss', 15)}RSS</a></div>`

// ---------------------------------------------------------------- pages
const pages = []
pages.push(['home', '대댐 로그 — 조해성 기술 블로그', `<header class="hero"><div class="hero-row"><div class="hero-l"><p class="role">조해성 · 백엔드 개발자</p><h1>증상이 아니라 <span class="grad">원인</span>을 고칩니다</h1><p class="lede">${esc(INTRO)}</p></div></div>${pills}</header>
${section('먼저 읽을 글', ['전체 글', '#posts'], `<ul class="cards">${postCard(byId[PICKS[1][0]], PICKS[1][1], true)}${postCard(byId[PICKS[0][0]], PICKS[0][1])}${postCard(byId[PICKS[2][0]], PICKS[2][1])}</ul>`)}
${section('최근 글', null, `<ol class="nlist">${rest.map((p, i) => line('#post-' + p.id, p.data.title, `${CAT[p.data.category]} · ${ymd(p.data.date)}`, i + 1)).join('')}</ol>`)}
${section('학습 위키', [`${wiki.length}편 전체`, '#wiki'], `<div class="bento"><a class="tile" href="#wiki"><p class="tile-n mono">${wiki.length}</p><p class="tile-t">문서</p><p class="tile-s">정리됨 ${wiki.filter((w) => w.data.status === 'stable').length} · 보완 중 ${wiki.filter((w) => w.data.status !== 'stable').length}</p></a><div class="tile tile-wide"><p class="tile-t">주제</p><div class="tags">${topicOrder.map((k) => `<a class="tagb" href="#wiki" data-topic-link="${k}">${TOPIC[k]} <span class="mono">${topicCounts[k]}</span></a>`).join('')}</div></div></div><ul class="elist">${wiki.slice(0, 5).map(erow).join('')}</ul>`)}
${section('학습 기록', ['학습 기록 전체', '#learn'], `<div class="bento"><a class="tile" href="#learn"><p class="tile-n mono">${notes.length}</p><p class="tile-t">학습 노트</p><p class="tile-s mono">2022-2023</p></a><a class="tile" href="#learn"><p class="tile-n mono">${ALGO}</p><p class="tile-t">알고리즘 풀이</p><p class="tile-s">백준 425 · 프로그래머스 69</p></a></div>`)}`])

pages.push(['posts', '글', `<header class="phead"><h1>글 <span class="count-b">${posts.length}편</span></h1><p class="lede sm">실무에서 만난 문제를, 무엇을 확인했고 왜 그 방법을 골랐는지까지 적었습니다. 각 글 머리의 '사례 시점'이 실제로 겪은 때이고, 목록의 작성일은 그 일을 블로그에 글로 정리한 날입니다.</p></header><ol class="nlist long">${posts.map((p, i) => line('#post-' + p.id, p.data.title, `${CAT[p.data.category]} · 작성 ${ymd(p.data.date)} · ${minutes(p.body)}분 읽기`, i + 1, p.data.description)).join('')}</ol>`])

pages.push(['wiki', '학습 위키', `
<header class="phead"><h1>학습 위키 <span class="count-b">${wiki.length}편</span></h1><p class="lede sm">Java, Spring, 데이터베이스부터 웹과 인프라까지. 주제와 키워드로 다시 찾아보는 학습 위키.</p></header>
<div class="wtools"><label class="input">${I.search}<span class="vh">위키 검색</span><input id="wq" type="search" placeholder="제목·설명·태그로 찾기" autocomplete="off"></label>
<p class="flabel" id="fl-topic">주제</p><div class="tabs" role="group" aria-labelledby="fl-topic"><button type="button" class="tab on" data-topic="" aria-pressed="true">전체 <span class="mono">${wiki.length}</span></button>${topicOrder.map((k) => `<button type="button" class="tab" data-topic="${k}" aria-pressed="false">${TOPIC[k]} <span class="mono">${topicCounts[k]}</span></button>`).join('')}</div>
<p class="flabel" id="fl-status">정리 상태</p><div class="seg" role="group" aria-labelledby="fl-status"><button type="button" class="on" data-status="" aria-pressed="true">전체</button><button type="button" data-status="stable" aria-pressed="false">정리됨</button><button type="button" data-status="growing" aria-pressed="false">보완 중</button></div><p class="legend">정리됨: 한 차례 정리 · 보완 중: 설명 추가 중</p></div>
<p class="count mono" id="wcount" role="status"></p>
<ul id="wlist" class="wlist">${wiki.map((w) => `<li><a class="wcard" href="#wiki-${w.id}" data-topic="${w.data.topic}" data-status="${w.data.status}" data-s="${esc((w.data.title + ' ' + w.data.description + ' ' + (w.data.tags ?? []).join(' ')).toLowerCase())}"><div class="wcard-top">${badge(TOPIC[w.data.topic], 'cat')}${status(w.data.status)}<span>수정 <span class="mono">${ymd(wdate(w))}</span></span></div><h2 class="wcard-t">${esc(w.data.title)}</h2><p>${esc(w.data.description)}</p></a></li>`).join('')}</ul>
<div class="empty" id="wempty" hidden><p>조건에 맞는 문서가 없습니다. 검색어를 줄이거나 주제를 바꿔 보세요.</p><div class="empty-acts"><button type="button" class="btn" id="wreset">조건 초기화</button><button type="button" class="btn" id="wglobal">본문까지 전체 검색</button></div></div>
<div class="pager"><button type="button" class="btn" id="wprev">이전</button><span class="mono" id="wpage"></span><button type="button" class="btn" id="wnext">다음</button></div>`])

function article(kind, e, headExtra, cover, top, end) {
  const { html, headings } = render(e.body, e.id)
  const isPost = kind === 'post'
  const toc = headings.length > 2 ? `<nav class="art-toc" aria-label="이 글의 목차"><p>목차</p><ol>${headings.map((h) => `<li><a href="#" data-target="${h.id}" class="${h.depth === 3 ? 'd3' : ''}">${esc(h.text)}</a></li>`).join('')}</ol><button type="button" class="toc-top" data-top>맨 위로</button></nav>` : ''
  return `<article class="art" data-toc='${esc(JSON.stringify(headings))}'>
<a class="backlink" href="${isPost ? '#posts' : '#wiki'}">${I.back}${isPost ? '글 목록' : '위키 목록'}</a>
<div class="art-top"><header class="art-head">${headExtra}${headings.length > 2 ? `<button type="button" class="toc-inline" data-toc-open aria-haspopup="dialog">${I.list}이 글의 목차</button>` : ''}</header>${cover}</div>
${top}${toc}
<div class="prose">${html}</div>
${end}
${isPost ? `<aside class="author" aria-label="글쓴이"><p><strong>조해성</strong> · 백엔드 개발자</p><a class="more" href="#about">소개·경력 보기${I.arrow}</a></aside>` : ''}
</article>`
}
for (const p of posts) {
  const i = posts.indexOf(p), prev = posts[i + 1], next = posts[i - 1]
  pages.push([`post-${p.id}`, p.data.title, article('post', p,
    `<div class="art-meta">${badge(CAT[p.data.category], 'cat')}<span>글쓴이 <a class="by" href="#about">조해성</a></span><time datetime="${iso(p.data.date)}">작성 <span class="mono">${ymd(p.data.date)}</span></time><span>${minutes(p.body)}분 읽기</span></div><h1>${esc(p.data.title)}</h1>${p.data.happened ? `<p class="happened">사례 시점 ${esc(p.data.happened)}</p>` : ''}`,
    img(p.id, 'art-cover'),
    p.data.cause ? `<aside class="callout" aria-label="원인 요약"><p class="callout-k">원인</p><p>${esc(p.data.cause)}</p></aside>` : '',
    `<p class="tags end">${(p.data.tags ?? []).map((t) => `<span class="tagb">#${esc(t)}</span>`).join('')}</p><nav class="pn" aria-label="이전·다음 글">${prev ? `<a class="card" href="#post-${prev.id}"><div class="card-body"><p class="k">이전 글</p><h3>${esc(prev.data.title)}</h3></div></a>` : ''}${next ? `<a class="card" href="#post-${next.id}"><div class="card-body"><p class="k">다음 글</p><h3>${esc(next.data.title)}</h3></div></a>` : ''}</nav>`)])
}
for (const w of wiki) pages.push([`wiki-${w.id}`, w.data.title, article('wiki', w,
  `<div class="art-meta">${badge(TOPIC[w.data.topic], 'cat')}${status(w.data.status)}<span>마지막 수정 <span class="mono">${ymd(wdate(w))}</span></span></div><h1>${esc(w.data.title)}</h1><p class="deck">${esc(w.data.description)}</p>`, '', '', '')])
pages.push(['learn', '학습 기록', `<header class="phead"><h1>학습 기록</h1><p class="lede sm">개발자로 전환하던 시기의 학습 노트와 알고리즘 풀이. 이 시안에는 목록만 담았습니다.</p></header>
${section('학습 노트 아카이브', null, `<ol class="nlist">${notes.map((n, i) => line('#learn', String(n.data.title).trim(), ymd(n.data.date).slice(0, 7), i + 1)).join('')}</ol>`)}
${section('알고리즘 풀이', null, '<p class="lede sm">백준 425문제, 프로그래머스 69문제(2021.12-2023.10). 실제 사이트에서 티어·유형·언어로 거를 수 있습니다.</p>')}`])
pages.push(['about', '소개', `<header class="phead"><h1>소개</h1><p class="lede sm">소개 문장은 사실관계를 확정해 둔 상태라 시안에 옮기지 않았습니다. 새 디자인을 적용해도 문장은 그대로 두고 조판만 바꿉니다.</p><div class="chips"><a class="pill" href="https://daedaem.github.io/about/" target="_blank" rel="noopener">지금 사이트의 소개 보기</a></div></header>`])
pages.push(['notfound', '페이지를 찾을 수 없습니다', `<header class="phead"><h1>페이지를 찾을 수 없습니다</h1><p class="lede sm">주소가 바뀌었거나 없는 글입니다. 2023년까지의 글은 주소 체계가 바뀌어 학습 노트 아카이브로 옮겼습니다. 아래에서 다시 찾아보세요.</p><div class="chips"><a class="pill" href="#posts">글 목록</a><a class="pill" href="#wiki">학습 위키</a><a class="pill" href="#learn">학습 노트 아카이브</a><button type="button" class="pill" data-search>검색</button></div></header>`])

// ---------------------------------------------------------------- chrome
// 도크: 아이콘과 글자 라벨을 함께 보여 준다(닐슨 H6). 항목 수와 폭이 페이지마다 같아 위치가 움직이지 않는다
const NAV = [['home', '홈', '홈', I.home], ['posts', '글', '글', I.doc], ['wiki', '위키', '위키', I.book], ['learn', '학습 기록', '학습 기록', I.note], ['about', '소개', '소개', I.user]]
const dock = `<nav class="dock" aria-label="주요 메뉴"><ul>${NAV.map(([k, t, name, ic]) => `<li><a class="di" href="#${k}" data-nav="${k}"${name !== t ? ` aria-label="${name}"` : ''}>${ic}<span class="dl">${t}</span></a></li>`).join('')}</ul></nav>`
const top = `<header class="top" id="top"><div class="top-in"><a class="brandmark" href="#home">${mark(24)}대댐 로그</a><div class="top-read" aria-hidden="true"><svg class="mh-ring" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="9" fill="none" stroke="var(--line)" stroke-width="2.5"></circle><circle id="mh-bar" cx="11" cy="11" r="9" fill="none" stroke="var(--accent-2)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="56.55" stroke-dashoffset="56.55" transform="rotate(-90 11 11)"></circle></svg><span class="mh-t" id="mh-t"></span></div><nav class="topnav" aria-label="주요 메뉴"><ul>${NAV.filter(([k]) => k !== 'home').map(([k, t]) => `<li><a href="#${k}" data-nav="${k}">${t}</a></li>`).join('')}</ul></nav><div class="top-tools"><button type="button" class="tb-search" data-search aria-haspopup="dialog" aria-keyshortcuts="Control+K">${I.search}<span class="tb-l">검색</span><kbd aria-hidden="true">Ctrl K</kbd></button><button type="button" class="ib" data-theme-toggle aria-label="다크 모드로 전환">${THEME}</button></div></div></header>`
const minihead = `<div class="minihead" id="minihead" aria-hidden="true"><svg class="mh-ring" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="9" fill="none" stroke="var(--line)" stroke-width="2.5"></circle><circle id="mh-bar" cx="11" cy="11" r="9" fill="none" stroke="var(--accent-2)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="56.55" stroke-dashoffset="56.55" transform="rotate(-90 11 11)"></circle></svg><span class="mh-t" id="mh-t"></span></div>`

// ---------------------------------------------------------------- style
const CSS = BASE_CSS + `
/* ===== 공통 ===== */
:root { --accent-soft: color-mix(in srgb, var(--accent-2) 12%, transparent); --muted: #6b6b6b; --line-strong: #8a8a8a; }
:root[data-theme="dark"] { --line-strong: #6e6e6e; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --line-strong: #6e6e6e; } }
html { scroll-padding-top: 72px; scroll-padding-bottom: 100px; }
.i-moon { display: contents; } .i-sun { display: none; }
:root[data-theme="dark"] .i-sun { display: contents; } :root[data-theme="dark"] .i-moon { display: none; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .i-sun { display: contents; } :root:not([data-theme="light"]) .i-moon { display: none; } }
.ti { flex-shrink: 0; }
ul, ol { list-style: none; margin: 0; padding: 0; }
.prose ul { list-style: disc; } .prose ol { list-style: decimal; }
.ib { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 0; border-radius: 10px; background: transparent; color: var(--muted); cursor: pointer; }
.ib:hover { background: var(--card-h); color: var(--fg); }
::placeholder { color: var(--muted); opacity: 1; }
.frame { position: relative; }
.flicker { position: absolute; top: 0; left: 0; }
.skip { position: absolute; left: 12px; top: -60px; z-index: 70; padding: 10px 14px; border-radius: 10px; background: var(--fg); color: var(--bg); font-weight: 650; }
.skip:focus { top: 12px; }
.ft { max-width: 1180px; margin: 0 auto; padding: 24px 24px 132px; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px 16px; font-size: 12.5px; color: var(--muted); }
.arr svg { display: inline; vertical-align: -1px; }
/* 움직임: 화면 전환 등장, 카드 떠오름, 화살표 미끄러짐은 없앤다. 알려 주는 움직임만 짧게 남긴다 */
.reveal { animation: none !important; }
.card:hover, .wcard:hover { transform: none; }
.card, .wcard { transition: background .15s, border-color .15s; }
.chev, .arr { transform: none !important; transition: opacity .15s; }
dialog.sheet[open] { animation-duration: .18s; }
@media (prefers-reduced-motion: reduce) { dialog.sheet[open] { animation: none; } .minihead { transition: none !important; } }

/* ===== 위 머리줄: 브랜드(왼쪽), 검색·테마(오른쪽). 배너 랜드마크 ===== */
.top { position: relative; z-index: 5; max-width: 1180px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px 0 20px; }
.brandmark { position: static; display: inline-flex; align-items: center; gap: 8px; min-height: 44px; margin: 0; font-size: 14px; font-weight: 650; }
.top-tools { display: flex; align-items: center; gap: 4px; }
.tb-search { display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 8px 0 12px; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--bg) 85%, transparent); color: var(--fg2); font: inherit; font-size: 13.5px; font-weight: 550; cursor: pointer; }
.tb-search:hover { background: var(--card-h); color: var(--fg); }
.tb-search kbd { margin: 0; }
@media (max-width: 640px) { .tb-search kbd { display: none; } .tb-search { padding: 0 14px 0 12px; } }
main { padding-top: 32px; }
@media (min-width: 640px) { main { padding-top: 56px; } }

/* ===== 도크: 아이콘 + 글자 라벨, 크기 고정 ===== */
.dock { height: auto; padding: 6px; gap: 0; align-items: stretch; border-radius: 22px; }
.dock ul { display: flex; gap: 2px; }
.dock .di { --s: auto; width: 56px; height: 52px; padding: 0; flex-direction: column; gap: 3px; border: 0; border-radius: 16px; background: transparent; color: var(--muted); font-size: 11.5px; font-weight: 600; letter-spacing: -0.01em; transition: background .15s, color .15s; }
.dock .di svg { width: 20px; height: 20px; }
.dock .di:hover { background: var(--card-h); color: var(--fg); }
.dock .di.on { background: var(--card-h); color: var(--fg); }
.dock .di.on .dl { font-weight: 700; }
.dock .di.on::after { display: none; }
@media (max-width: 380px) { .dock { padding: 5px; } .dock .di { width: 52px; height: 50px; font-size: 11px; } }
.fab { position: fixed; right: 12px; bottom: calc(86px + env(safe-area-inset-bottom, 0px)); z-index: 40; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 14px; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--fg); font: inherit; font-size: 14px; font-weight: 650; box-shadow: var(--shadow); cursor: pointer; }
@media (min-width: 1200px) { .fab { display: none !important; } }

/* ===== 글 읽는 중 작은 머리줄(1200px 미만) ===== */
.minihead { position: fixed; top: 12px; left: 50%; z-index: 45; display: flex; align-items: center; gap: 10px; width: max-content; max-width: min(560px, calc(100vw - 24px)); height: 44px; padding: 0 18px 0 14px; border: 1px solid var(--line); border-radius: 999px; background: color-mix(in srgb, var(--card) 92%, transparent); -webkit-backdrop-filter: blur(24px); backdrop-filter: blur(24px); box-shadow: var(--shadow); transform: translate(-50%, -72px); opacity: 0; transition: transform .18s ease-out, opacity .15s; pointer-events: none; }
.minihead.on { transform: translate(-50%, 0); opacity: 1; pointer-events: auto; }
.mh-ring { flex-shrink: 0; }
.mh-t { flex: 1; min-width: 0; font-size: 14.5px; font-weight: 650; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mh-toc { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; background: var(--bg); color: var(--fg); font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; }
.mh-toc[hidden] { display: none; }
@media (min-width: 1200px) { .minihead { display: none; } }
.progress { display: none; }

/* ===== 홈 ===== */
.cards > li:first-child { grid-column: 1 / -1; }
.cards > li { display: flex; } .cards > li > .card { flex: 1; }
.card.big { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0; }
.card.big .card-img { grid-column: 2; grid-row: 1; width: 240px; height: 160px; aspect-ratio: 3 / 2; margin: 20px 20px 20px 0; border: 1px solid var(--line); border-radius: 10px; }
.card.big .card-body { grid-column: 1; grid-row: 1; }
@media (max-width: 640px) { .card.big { display: flex; flex-direction: column; } .card.big .card-img { width: 100%; height: auto; margin: 0; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; } }
@media (max-width: 767px) { .avatar { display: none; } .hero .lede { font-size: 16.5px; } }
.nlist { display: flex; flex-direction: column; gap: 4px; }
.line-d { display: block; margin-top: 6px; font-size: 14.5px; font-weight: 400; line-height: 1.6; color: var(--fg2); letter-spacing: -0.01em; }
.nlist.long { gap: 14px; }
.elist .erow { padding: 12px 0; }
.tags.end .tagb { min-height: 0; padding: 0; border: 0; background: none; color: var(--muted); font-size: 13.5px; }
.tags.end { gap: 4px 12px; }

/* ===== 위키 목록 ===== */
.wlist > li { display: block; }
.wcard .wcard-t { margin-top: 10px; font-size: 17px; line-height: 1.45; font-weight: 700; letter-spacing: -0.025em; }
.tab, .seg button { color: var(--fg2); }
.tab.on, .seg button.on { background: var(--fg); color: var(--bg); box-shadow: none; font-weight: 700; }
.tab.on .mono { color: inherit; opacity: .85; }
.wtools { position: static; }
@media (min-width: 700px) and (min-height: 700px) { .wtools { position: sticky; } }
@media (max-width: 640px) { .tabs { flex-wrap: wrap; overflow: visible; } }
.input:focus-within { border-color: var(--accent-2); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-2) 25%, transparent); }
.empty { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }

/* ===== 글 ===== */
.art-top { display: block; }
.art-cover { display: none; }
@media (min-width: 900px) {
  .art-top { display: flex; align-items: flex-start; gap: 28px; }
  .art-top .art-head { flex: 1; min-width: 0; }
  .art-cover { display: block; flex-shrink: 0; width: 200px; height: auto; aspect-ratio: 3 / 2; margin-top: 16px; border-radius: 12px; }
}
.art-toc { display: none; }
.art-toc p { font-size: 12.5px; font-weight: 700; color: var(--muted); margin-bottom: 8px; }
.art-toc a { display: block; padding: 5px 0 5px 12px; border-left: 1px solid var(--line); line-height: 1.5; color: var(--muted); }
.art-toc a.d3 { padding-left: 24px; }
.art-toc a:hover { color: var(--fg); }
.art-toc a.on { border-left: 2px solid var(--accent-2); padding-left: 11px; color: var(--fg); font-weight: 600; }
.art-toc a.d3.on { padding-left: 23px; }
.art-toc .toc-top { display: inline-flex; align-items: center; min-height: 32px; margin-top: 10px; padding: 0; border: 0; background: none; font: inherit; font-size: 12.5px; color: var(--muted); cursor: pointer; }
.art-toc .toc-top:hover { color: var(--fg); }
@media (min-width: 1200px) {
  .art-toc { display: block; position: fixed; top: 112px; left: calc(50% + 336px + 40px); width: min(240px, calc(50vw - 336px - 64px)); max-height: calc(100vh - 224px); overflow-y: auto; padding: 2px 4px 2px 2px; font-size: 13.5px; scrollbar-width: thin; }
}
.code pre:focus-visible, .table:focus-visible { outline: 2px solid var(--accent-2); outline-offset: -3px; }

/* ===== 코드 색(IDE와 같은 VS Code Light+ / Dark+) ===== */
.code pre .line { display: inline; }
:root[data-theme="dark"] .code pre span { color: var(--shiki-dark) !important; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .code pre span { color: var(--shiki-dark) !important; } }

/* ===== 검색 대화상자 ===== */
.cmd-top:focus-within { box-shadow: inset 0 -2px 0 var(--accent-2); }
.cmd-top input:focus { outline: none; }
.cmd-x { flex-shrink: 0; margin-right: -6px; }
.cmd-count { padding: 8px 16px 0; font-size: 12.5px; color: var(--muted); }
.cmd-i[aria-selected="true"] { background: var(--card-h); box-shadow: inset 3px 0 0 var(--accent-2); }
.cmd-i .d { color: var(--fg2); }
.cmd-empty { padding: 4px 10px 8px; font-size: 14px; color: var(--fg2); }
@media (hover: none) { .cmd-foot { display: none; } }
/* ===== 목차 시트 ===== */
.sheet-h { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 20px; }
.sheet-h .sheet-t { padding: 0; }
.sheet a.on { background: var(--card-h); font-weight: 650; box-shadow: inset 3px 0 0 var(--accent-2); }
/* ===== 2차: 재검사 반영 ===== */
.top { position: sticky; top: 0; z-index: 30; max-width: none; display: block; padding: 0; background: color-mix(in srgb, var(--bg) 88%, transparent); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border-bottom: 1px solid transparent; }
.top.scrolled { border-bottom-color: var(--line); }
.top-in { max-width: 1180px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 60px; padding: 0 12px 0 20px; }
.top-read { display: none; flex: 1; min-width: 0; align-items: center; gap: 10px; }
.top.reading .top-read { display: flex; }
.top.reading .brandmark { font-size: 0; gap: 0; } .top.reading .brandmark svg { width: 24px; height: 24px; }
@media (min-width: 1200px) { .top.reading .top-read { display: none; } .top.reading .brandmark { display: inline-flex; font-size: 14px; gap: 8px; } }
.tb-search { min-height: 44px; }
main { padding-top: 24px; }
@media (min-width: 640px) { main { padding-top: 48px; } }
.cmd-top input { min-width: 0; }
.tabs { flex-wrap: wrap; overflow: visible; }
.tab, .seg button { min-height: 40px; }
.tagb { min-height: 36px; }
.input { border-color: var(--line-strong); }
.card p { display: block; -webkit-line-clamp: unset; overflow: visible; }
.art-toc { padding-left: 4px; }
.art-toc a:focus-visible, .copybtn:focus-visible, .art-toc .toc-top:focus-visible { outline-offset: -2px; }
.empty-acts { display: flex; flex-wrap: wrap; gap: 8px; }
.page h1, .prose :is(h2, h3, h4) { scroll-margin-top: 84px; }
.prose mark.hit { background: color-mix(in srgb, var(--accent-2) 30%, transparent); color: inherit; border-radius: 3px; padding: 0 2px; }

/* ===== 3차: 남은 문제 ===== */
/* 1024px 이상은 블로그 관례대로 위 머리줄에 메뉴를 두고 아래 도크를 없앤다 */
.topnav { display: none; }
.topnav ul { display: flex; gap: 2px; }
.topnav a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border-radius: 10px; color: var(--fg2); font-size: 14.5px; font-weight: 600; }
.topnav a:hover { background: var(--card-h); color: var(--fg); }
.topnav a.on { color: var(--fg); font-weight: 700; box-shadow: inset 0 -2px 0 var(--fg); border-radius: 0; }
@media (min-width: 1024px) { .topnav { display: block; margin-left: 12px; margin-right: auto; } .dock { display: none; } .fab { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); } }
/* 글 머리의 주제·상태는 누르는 것이 아니므로 버튼 모양을 없애고 글자로 둔다 */
.art-meta .badge { min-height: 0; padding: 0; border: 0; background: none; color: var(--fg); font-weight: 700; }
.art-meta .badge.wip { color: var(--fg2); }
/* 모바일 홈: 대표 그림을 글 아래로 내려 첫 글 제목이 먼저 보이게 한다 */
@media (max-width: 640px) { .card.big .card-img { order: 2; border-bottom: 0; border-top: 1px solid var(--line); } }
/* 모바일: 아래로 읽는 동안에는 도크를 내리고, 위로 올리거나 끝에 닿으면 다시 보인다 */
.dock { transition: translate .15s ease-out; }
.dock.away { translate: 0 calc(100% + 32px); }
.dock.away ~ .fab, body:has(.dock.away) .fab { bottom: calc(16px + env(safe-area-inset-bottom, 0px)); }
@media (prefers-reduced-motion: reduce) { .dock { transition: none; } }

/* ===== 4차 ===== */
/* 위키 필터는 붙박이로 두지 않는다(고정 머리줄 밑에서 검색창이 가려지고 화면 26%를 덮었다) */
.wtools { position: static !important; }
.flabel { margin: 12px 0 6px; font-size: 12.5px; font-weight: 700; color: var(--muted); }
.legend { margin-top: 8px; font-size: 13px; color: var(--muted); }
/* 검색창의 브라우저 기본 지우기(×)는 닫기(×)와 겹쳐 보여 숨긴다. 글자는 Esc·지우기 키로 지운다 */
#cq::-webkit-search-cancel-button, #wq::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; display: none; }
/* 모바일 글: 첫 화면에서는 목차 버튼을 숨겨 도크와 겹쳐 본문을 가리지 않게 한다 */
.fab.early { display: none; }
.ft nav { display: flex; flex-wrap: wrap; gap: 4px 16px; }
.ft nav a { display: inline-flex; align-items: center; min-height: 44px; min-width: 24px; color: var(--fg2); }
.ft { flex-wrap: wrap; gap: 12px 24px; }

/* ===== 5차 ===== */
/* 글 첫머리의 안내 인용(이름을 바꿨다는 등)은 카드가 아니라 작은 회색 글로 */
.prose > blockquote:first-child { margin: 0 0 20px; padding: 0 0 0 12px; border: 0; border-left: 2px solid var(--line); border-radius: 0; background: none; font-size: 13.5px; line-height: 1.65; color: var(--muted); }
.prose > blockquote:first-child p { margin: 0; }
.toc-inline { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; margin-top: 16px; padding: 0 14px; border: 1px solid var(--line-strong); border-radius: 999px; background: var(--bg); color: var(--fg); font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
.toc-inline[hidden] { display: none; }
@media (min-width: 1200px) { .toc-inline { display: none; } }
.art-meta .by { color: var(--fg); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
.author { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px; margin-top: 32px; padding: 16px 20px; border: 1px solid var(--line); border-radius: 14px; }
.author p { margin: 0; }
.ft { align-items: center; }
.top { background: color-mix(in srgb, var(--bg) 96%, transparent); }
.bento:has(> .tile-wide) { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
@media (max-width: 560px) { .bento:has(> .tile-wide) { grid-template-columns: minmax(0, 1fr); } }

`

// ---------------------------------------------------------------- script
const INDEX = [
  ...posts.map((p) => ({ g: '글', t: p.data.title, d: p.data.description, h: '#post-' + p.id, s: (p.data.title + ' ' + p.data.description + ' ' + (p.data.tags ?? []).join(' ')).toLowerCase(), b: plain(p.body) })),
  ...wiki.map((w) => ({ g: '위키', t: w.data.title, d: w.data.description, h: '#wiki-' + w.id, s: (w.data.title + ' ' + w.data.description + ' ' + (w.data.tags ?? []).join(' ')).toLowerCase(), b: plain(w.body) })),
  ...notes.map((n) => ({ g: '학습 기록', t: String(n.data.title).trim(), d: '학습 노트 · ' + ymd(n.data.date).slice(0, 7), h: '#learn', s: String(n.data.title).toLowerCase(), b: '' })),
]
const TITLES = Object.fromEntries(pages.map(([id, t]) => [id, t]))
const JS = `
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)]
const root = document.documentElement
let current = '', first = true, pendingHit = '', curKey = '', seq = 0
// 방문 기록 항목마다 열쇠를 달고, 그 항목에서 마지막으로 본 스크롤 위치를 기억한다(뒤로·앞으로 가기 때 복원)
const pos = {}
try { history.scrollRestoration = 'manual' } catch {}
const newKey = () => performance.timeOrigin + ':' + ++seq
function entryKey() { let k = history.state && history.state.k; if (!k) { k = newKey(); try { history.replaceState({ ...(history.state || {}), k }, '') } catch {} } return k }
try { const t = localStorage.getItem('dd6-theme'); if (t) root.dataset.theme = t } catch {}
const isDark = () => (root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches)
// 테마 버튼 이름에 지금 상태를 반영한다(4.1.2)
function themeLabel() { const l = isDark() ? '라이트 모드로 전환' : '다크 모드로 전환'; $$('[data-theme-toggle]').forEach((b) => { b.setAttribute('aria-label', l); b.title = l }) }
function toggleTheme() { root.dataset.theme = isDark() ? 'light' : 'dark'; try { localStorage.setItem('dd6-theme', root.dataset.theme) } catch {}; themeLabel() }
document.addEventListener('click', (e) => { if (e.target.closest('[data-theme-toggle]')) toggleTheme() })
const TITLES = ${JSON.stringify(TITLES)}
const isArt = () => current.startsWith('post-') || current.startsWith('wiki-')
function art() { return $('#p-' + current + ' [data-toc]') }
function heads() { const a = art(); return a ? JSON.parse(a.dataset.toc) : [] }
function h1() { return $('#p-' + current + ' h1') }
function focusH1() { const h = h1(); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }) } }
function show() {
  const id = (location.hash || '#home').slice(1) || 'home'
  const page = document.getElementById('p-' + id) ? id : 'notfound'
  if (page === current) return
  $$('.page').forEach((p) => (p.hidden = p.id !== 'p-' + page))
  current = page
  // 새로 들어온 항목이면 맨 위, 뒤로·앞으로 가기로 돌아온 항목이면 읽던 위치로
  curKey = entryKey()
  dockEl?.classList.remove('away')
  window.scrollTo(0, pos[curKey] ?? 0)
  $$('.prose mark.hit').forEach((m) => m.replaceWith(...m.childNodes))
  document.title = page === 'home' ? TITLES.home : TITLES[page] + ' · 대댐 로그'
  syncChrome(); progress(); scrollables()
  // 화면이 바뀌면 새 화면의 제목으로 초점을 옮겨 스크린리더가 바뀐 화면을 읽게 한다(첫 진입 제외)
  if (!first) focusH1()
  first = false
  if (pendingHit && isArt()) jumpTo(pendingHit)
  pendingHit = ''
}
// 본문에서만 찾은 낱말로 들어오면 그 자리로 옮기고 표시한다
function jumpTo(word) {
  const box = $('#p-' + current + ' .prose'); if (!box) return
  const tw = document.createTreeWalker(box, NodeFilter.SHOW_TEXT)
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const i = n.data.toLowerCase().indexOf(word)
    if (i < 0) continue
    const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + word.length)
    const m = document.createElement('mark'); m.className = 'hit'; r.surroundContents(m)
    m.scrollIntoView({ block: 'center' }); return
  }
}
addEventListener('hashchange', show)
// 같은 글 안에서 목차로 옮긴 기록을 되돌릴 때(주소 해시는 그대로라 hashchange가 오지 않음)
addEventListener('popstate', () => {
  const id = (location.hash || '#home').slice(1) || 'home'
  if ((document.getElementById('p-' + id) ? id : 'notfound') !== current) return
  curKey = entryKey(); window.scrollTo(0, pos[curKey] ?? 0)
})
document.addEventListener('click', (e) => { if (e.target.closest('[data-skip]')) { e.preventDefault(); focusH1(); h1()?.scrollIntoView({ block: 'start' }) } })
function syncChrome() {
  const sec = current.startsWith('post') ? 'posts' : current.startsWith('wiki') ? 'wiki' : current
  $$('[data-nav]').forEach((a) => { const on = a.dataset.nav === sec; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current') })
  const has = heads().length > 2
  $$('[data-toc-open]').forEach((b) => (b.hidden = !has))
  $('#fab').hidden = !has
  $('#fab').classList.toggle('early', scrollY < 200)
  $('#mh-t').textContent = isArt() ? TITLES[current] : ''
  watch(); markToc()
}
addEventListener('resize', () => { scrollables() })
// 넘치는 코드 블록과 표에만 초점·역할·이름을 준다(2.1.1). 넘치지 않으면 탭 정지점을 만들지 않는다
function scrollables() {
  $$('#p-' + current + ' .code pre, #p-' + current + ' .table').forEach((el) => {
    if (el.scrollWidth > el.clientWidth + 1) { el.tabIndex = 0; el.setAttribute('role', 'region'); el.setAttribute('aria-label', el.dataset.label) }
    else { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label') }
  })
}
let hio
function watch() {
  hio?.disconnect()
  const top = $('#top'); top.classList.remove('reading')
  if (!isArt()) return
  const t = $('#p-' + current + ' .art-head h1')
  if (t) { hio = new IntersectionObserver(([en]) => top.classList.toggle('reading', !en.isIntersecting && en.boundingClientRect.top < 0)); hio.observe(t) }
}
// 오른쪽 목차 강조는 스크롤마다 다시 계산한다(늦게 따라오지 않게)
function markToc() { if (!isArt()) return; const act = activeHead(); $$('#p-' + current + ' .art-toc a').forEach((l) => { const on = l.dataset.target === act?.id; l.classList.toggle('on', on); on ? l.setAttribute('aria-current', 'location') : l.removeAttribute('aria-current') }) }
function activeHead() { const hs = heads().map((h) => document.getElementById(h.id)).filter(Boolean); let act = hs[0]; for (const h of hs) if (h.getBoundingClientRect().top < innerHeight * 0.3) act = h; return act }
// 목차 시트: 지금 읽는 절을 표시하고 그 항목에 초점을 둔다
const sheet = $('#sheet')
document.addEventListener('click', (e) => {
  if (e.target.closest('[data-toc-open], #fab')) {
    const act = activeHead()
    $('#sheet-list').innerHTML = heads().map((h) => '<li><a href="#" data-target="' + h.id + '" class="' + (h.depth === 3 ? 'd3' : '') + (act && act.id === h.id ? ' on" aria-current="true' : '') + '">' + h.text.replace(/</g, '&lt;') + '</a></li>').join('')
    sheet.showModal(); ($('#sheet-list a.on') || $('#sheet-list a'))?.focus(); return
  }
  if (e.target.closest('[data-close-sheet]')) { sheet.close(); return }
  const a = e.target.closest('a[data-target]')
  if (a) { e.preventDefault(); if (sheet.open) sheet.close(); const h = document.getElementById(a.dataset.target); curKey = newKey(); try { history.pushState({ k: curKey, sec: a.dataset.target }, '') } catch {}; h?.scrollIntoView({ block: 'start' }); h?.focus({ preventScroll: true }); return }
  if (e.target === sheet) sheet.close()
  const tl = e.target.closest('[data-topic-link]'); if (tl) setTimeout(() => setTopic(tl.dataset.topicLink), 0)
  if (e.target.closest('[data-top]')) { window.scrollTo(0, 0); focusH1() }
})
// 고정 요소(아래 도크·목차 버튼, 위 작은 머리줄·고정 필터)에 초점이 가려지지 않게 한다(2.4.11)
document.addEventListener('focusin', (e) => {
  const el = e.target
  if (!(el instanceof Element) || el.closest('dialog, .dock, .top, #fab, .skip')) return
  // 스크립트가 제목에 옮긴 초점(tabindex=-1)은 스크롤을 건드리지 않는다. 가려짐은 scroll-margin-top이 막는다
  if (el.tabIndex < 0 && /^H[1-4]$/.test(el.tagName)) return
  requestAnimationFrame(() => {
    const r = el.getBoundingClientRect(); let dy = 0
    const overlaps = (o) => o.left < r.right && o.right > r.left
    for (const f of [$('.dock'), $('#fab')]) {
      if (!f || f.hidden || getComputedStyle(f).display === 'none') continue
      const o = f.getBoundingClientRect(); if (overlaps(o) && r.bottom > o.top - 8) dy = Math.max(dy, r.bottom - o.top + 16)
    }
    let topCover = $('#top').getBoundingClientRect().bottom
    const wt = $('#p-' + current + ' .wtools'); if (wt && getComputedStyle(wt).position === 'sticky') { const o = wt.getBoundingClientRect(); if (o.top <= 1) topCover = Math.max(topCover, o.bottom) }
    if (r.top < topCover + 8) dy = r.top - topCover - 16
    if (dy) window.scrollBy(0, dy)
  })
})
const mhb = $('#mh-bar')
function progress() { const h = document.documentElement.scrollHeight - innerHeight, k = h > 0 ? Math.min(1, scrollY / h) : 0; mhb.setAttribute('stroke-dashoffset', (56.55 * (1 - k)).toFixed(2)) }
let lastY = scrollY
const dockEl = $('.dock')
function dockAway(y) {
  const atEnd = y + innerHeight >= document.documentElement.scrollHeight - 8
  if (y < 200 || atEnd || y < lastY - 4 || dockEl.contains(document.activeElement)) dockEl.classList.remove('away')
  else if (y > lastY + 4) dockEl.classList.add('away')
  lastY = y
}
// 키보드로 도크에 들어오면 곧바로 보이게 한다(가려진 초점 방지)
dockEl.addEventListener('focusin', () => dockEl.classList.remove('away'))
addEventListener('scroll', () => { const k = curKey, y = scrollY; pos[k] = y; dockAway(y); $('#fab').classList.toggle('early', y < 200); requestAnimationFrame(() => { progress(); markToc(); $('#top').classList.toggle('scrolled', scrollY > 4) }) }, { passive: true })
// 복사 알림: live region을 미리 두고 글만 바꾼다(4.1.3)
const toastEl = $('#toast'); let tt
function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => { toastEl.classList.remove('show'); toastEl.textContent = '' }, 1800) }
document.addEventListener('click', async (e) => { const b = e.target.closest('.copybtn'); if (!b) return; try { await navigator.clipboard.writeText(b.closest('.code').querySelector('code').textContent); toast('복사했습니다') } catch { toast('복사하지 못했습니다') } })
// 위키 거르기
const W = { q: '', topic: '', status: '', page: 1 }, cards = $$('#wlist .wcard')
function setTopic(t) { W.topic = t || ''; W.page = 1; renderWiki() }
function renderWiki() {
  const q = W.q.trim().toLowerCase().split(/\\s+/).filter(Boolean)
  const list = cards.filter((c) => (!W.topic || c.dataset.topic === W.topic) && (!W.status || c.dataset.status === W.status) && q.every((w) => c.dataset.s.includes(w)))
  const pages = Math.max(1, Math.ceil(list.length / 10)); W.page = Math.min(W.page, pages)
  const shown = new Set(list.slice((W.page - 1) * 10, W.page * 10))
  cards.forEach((c) => (c.parentElement.hidden = !shown.has(c)))
  $('#wempty').hidden = list.length > 0
  $('#wcount').textContent = list.length + '개 문서' + (pages > 1 ? ' · ' + W.page + '/' + pages + '쪽' : '')
  $('#wpage').textContent = W.page + ' / ' + pages
  $('.pager').hidden = pages <= 1
  $('#wprev').disabled = W.page <= 1; $('#wnext').disabled = W.page >= pages
  $$('.tab').forEach((b) => { const on = b.dataset.topic === W.topic; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) })
  $$('.wtools .seg button').forEach((b) => { const on = b.dataset.status === W.status; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on) })
}
$('#wq').addEventListener('input', (e) => { W.q = e.target.value; W.page = 1; renderWiki() })
$$('.tab').forEach((b) => b.addEventListener('click', () => setTopic(b.dataset.topic)))
$$('.wtools .seg button').forEach((b) => b.addEventListener('click', () => { W.status = b.dataset.status; W.page = 1; renderWiki() }))
// 쪽을 넘기면 새 쪽의 첫 문서로 초점을 옮긴다(버튼이 비활성으로 바뀌어 초점이 사라지지 않게)
function turn(d) { W.page += d; renderWiki(); const f = cards.find((c) => !c.parentElement.hidden); $('.wtools').scrollIntoView({ block: 'start' }); f?.focus({ preventScroll: true }) }
$('#wprev').addEventListener('click', () => turn(-1))
$('#wnext').addEventListener('click', () => turn(1))
$('#wglobal').addEventListener('click', () => { open(); q.value = W.q; run() })
$('#wreset').addEventListener('click', () => { W.q = ''; W.topic = ''; W.status = ''; W.page = 1; $('#wq').value = ''; renderWiki(); $('#wq').focus() })
renderWiki()
// 검색: 제목·설명·태그에 더해 본문도 찾는다. 결과 수를 알려 준다(4.1.3)
const INDEX = ${JSON.stringify(INDEX)}
INDEX.forEach((i) => (i.bl = i.b.toLowerCase()))
const ACTS = [{ g: '바로 가기', t: '홈', h: '#home' }, { g: '바로 가기', t: '글 목록', h: '#posts' }, { g: '바로 가기', t: '학습 위키', h: '#wiki' }, { g: '바로 가기', t: '학습 기록', h: '#learn' }]
const ICON = { 글: ${JSON.stringify(icon('file-text', 18))}, 위키: ${JSON.stringify(icon('book', 18))}, '학습 기록': ${JSON.stringify(icon('notebook', 18))}, '바로 가기': ${JSON.stringify(I.arrow)} }
const dlg = $('#cmd'), q = $('#cq'), list = $('#cl'), cnt = $('#ccount')
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const hl = (s, ws) => { let o = '', i = 0; const l = s.toLowerCase(); while (i < s.length) { const w = ws.find((w) => l.startsWith(w, i)); if (w) { o += '<mark>' + esc(s.slice(i, i + w.length)) + '</mark>'; i += w.length } else { o += esc(s[i]); i++ } } return o }
function snippet(i, ws) { const w = ws.find((w) => !(i.t + ' ' + i.d).toLowerCase().includes(w) && i.bl.includes(w)); if (!w) return i.d; const at = i.bl.indexOf(w); const a = Math.max(0, at - 28); return (a > 0 ? '… ' : '') + i.b.slice(a, at + w.length + 40) + ' …' }
let sel = 0, ct
const GROUPS = ['글', '위키', '학습 기록']
function run() {
  const raw = q.value.trim(), ws = raw.toLowerCase().split(/\\s+/).filter(Boolean)
  const score = (i) => (ws.every((w) => i.t.toLowerCase().includes(w)) ? 3 : ws.every((w) => i.s.includes(w)) ? 2 : 1)
  const found = ws.length ? INDEX.filter((i) => ws.every((w) => i.s.includes(w) || i.bl.includes(w))) : []
  const best = {}; for (const i of found) best[i.g] = Math.max(best[i.g] ?? 0, score(i))
  const hits = ws.length ? found.sort((a, b) => best[b.g] - best[a.g] || GROUPS.indexOf(a.g) - GROUPS.indexOf(b.g) || score(b) - score(a)) : INDEX.slice(0, 4)
  const acts = ws.length ? ACTS.filter((a) => ws.every((w) => a.t.toLowerCase().includes(w))) : ACTS
  const shownActs = ws.length && !hits.length ? ACTS : acts
  let n = 0, last = ''
  const head = ws.length && !hits.length ? '<p class="cmd-empty">"' + esc(raw) + '"에 맞는 글·위키가 없습니다. 낱말을 줄이거나 아래에서 목록으로 찾아보세요.</p>' : ''
  list.innerHTML = head + [...hits, ...shownActs].map((i) => { const h = i.g !== last ? '<p class="cmd-g">' + i.g + '</p>' : ''; last = i.g; const d = i.b ? snippet(i, ws) : ''; return h + '<a class="cmd-i" role="option" tabindex="-1" id="co' + n++ + '" href="' + i.h + '">' + ICON[i.g] + '<span><span class="t">' + hl(i.t, ws) + '</span>' + (d ? '<span class="d">' + hl(d, ws) + '</span>' : '') + '</span></a>' }).join('')
  const opts = $$('.cmd-i', list)
  q.setAttribute('aria-expanded', opts.length > 0)
  if (!opts.length) q.removeAttribute('aria-activedescendant')
  pick(0)
  clearTimeout(ct); ct = setTimeout(() => (cnt.textContent = ws.length ? (hits.length ? '결과 ' + hits.length + '건' : '결과 없음') : '최근 글과 바로 가기'), 250)
}
function pick(i) { const o = $$('.cmd-i', list); if (!o.length) return; sel = (i + o.length) % o.length; o.forEach((x, j) => x.setAttribute('aria-selected', j === sel)); q.setAttribute('aria-activedescendant', o[sel].id); o[sel].scrollIntoView({ block: 'nearest' }) }
function go(a) {
  if (!a) return
  const ws = q.value.trim().toLowerCase().split(/\\s+/).filter(Boolean), it = INDEX.find((i) => i.h === a.getAttribute('href'))
  pendingHit = it && it.bl ? (ws.find((w) => !(it.t + ' ' + it.d).toLowerCase().includes(w) && it.bl.includes(w)) || '') : ''
  dlg.close(); location.hash = a.getAttribute('href')
}
function open() { if (!dlg.open) dlg.showModal(); q.value = ''; run(); q.focus() }
document.addEventListener('click', (e) => { if (e.target.closest('[data-search]')) open(); if (e.target.closest('[data-close-cmd]')) dlg.close() })
q.addEventListener('input', run)
q.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') { e.preventDefault(); pick(sel + 1) } else if (e.key === 'ArrowUp') { e.preventDefault(); pick(sel - 1) } else if (e.key === 'Enter') { e.preventDefault(); go($$('.cmd-i', list)[sel]) }
  else if (e.key === 'Escape') { e.preventDefault(); dlg.close() } // 글자가 있어도 Esc 한 번에 닫는다
})
list.addEventListener('click', (e) => { const a = e.target.closest('.cmd-i'); if (a) { e.preventDefault(); go(a) } })
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close() })
// 단축키는 수정 키가 있는 Ctrl/⌘+K 하나만 둔다(2.1.4)
document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : open() } })
// B안의 점 격자는 한 번만 그리고 움직이지 않는다
const cv = $('#flicker'), cx = cv.getContext('2d')
let cells = [], cw = 0
function sizeGrid() { const d = devicePixelRatio || 1; cw = cv.parentElement.clientWidth; cv.width = cw * d; cv.height = 100 * d; cv.style.width = cw + 'px'; cv.style.height = '100px'; cx.setTransform(d, 0, 0, d, 0, 0); cells = []; for (let x = 0; x < cw; x += 4) for (let y = 0; y < 100; y += 4) cells.push([x, y, Math.random() * 0.3]) }
function drawGrid() { const fg = getComputedStyle(root).getPropertyValue('--fg').trim() || '#000'; cx.clearRect(0, 0, cw, 100); cx.fillStyle = fg; for (const c of cells) { cx.globalAlpha = c[2]; cx.fillRect(c[0], c[1], 2, 2) } cx.globalAlpha = 1 }
sizeGrid(); drawGrid()
addEventListener('resize', () => { sizeGrid(); drawGrid() })
new MutationObserver(() => { drawGrid() }).observe(root, { attributes: true, attributeFilter: ['data-theme'] })
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { themeLabel(); drawGrid() })
$$('.page h1').forEach((h) => h.setAttribute('tabindex', '-1'))
themeLabel(); show()
`

const body = `<a class="skip" href="#main" data-skip>본문으로 건너뛰기</a>
<div class="frame"><canvas class="flicker" id="flicker" aria-hidden="true"></canvas>${top}
${dock}
<main id="main">
${pages.map(([id, , h]) => `<div class="page" id="p-${id}" hidden>${h}</div>`).join('\n')}
</main></div>
<footer class="ft"><span>© 2026 조해성 · 대댐 로그</span><nav aria-label="바닥글"><a href="#posts">글</a><a href="#wiki">위키</a><a href="#learn">학습 기록</a><a href="#about">소개</a><a href="https://github.com/daedaem" target="_blank" rel="noopener">GitHub</a><a href="https://daedaem.github.io/rss.xml" target="_blank" rel="noopener">RSS</a></nav><span>B안 1번을 다듬은 시안입니다. 실제 사이트가 아닙니다.</span></footer>
<button type="button" class="fab" id="fab" hidden aria-haspopup="dialog">${I.list}목차</button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<dialog class="cmd" id="cmd" aria-label="검색"><div class="cmd-top">${I.search}<label class="vh" for="cq">글·위키 검색</label><input id="cq" type="search" placeholder="글, 위키 본문까지 검색" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="cl"><button type="button" class="ib cmd-x" data-close-cmd aria-label="검색 닫기">${I.x}</button></div><p class="cmd-count" id="ccount" role="status" aria-live="polite"></p><div class="cmd-list" id="cl" role="listbox" aria-label="검색 결과" tabindex="-1"></div><div class="cmd-foot"><span><kbd>↑</kbd><kbd>↓</kbd>이동 <kbd>Enter</kbd>열기</span><span><kbd>Esc</kbd>닫기</span></div></dialog>
<dialog class="sheet" id="sheet" aria-label="목차"><div class="sheet-h"><p class="sheet-t">목차</p><button type="button" class="ib" data-close-sheet aria-label="목차 닫기">${I.x}</button></div><ol id="sheet-list"></ol></dialog>`

const extraText = ' 대댐 로그 이 글의 목차 복사했습니다 복사하지 못했습니다 에 맞는 글·위키가 없습니다. 낱말을 줄이거나 아래에서 목록으로 찾아보세요. 결과 건 결과 없음 최근 글과 바로 가기 개 문서 쪽 바로 가기 홈 글 목록 학습 위키 학습 기록 라이트 모드로 전환 다크 모드로 전환 … '
writeFileSync(S + '/final-chars.txt', [...new Set((body + JSON.stringify(INDEX.map((i) => [i.t, i.d, i.b])) + JSON.stringify(TITLES)).replace(/<[^>]+>/g, ' ') + extraText)].join(''))
if (process.argv[2]) {
  const f = (p) => `data:font/woff2;base64,${readFileSync(p).toString('base64')}`
  const html = `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="대댐 로그 1안 개정 시안"><title>대댐 로그 — 조해성 기술 블로그</title>
<link rel="icon" href="data:,">
<style>
@font-face { font-family: 'Pretendard Variable'; font-weight: 45 920; font-display: swap; src: url(${f(S + '/fonts/pre-final.woff2')}) format('woff2'); }
@font-face { font-family: 'JetBrains Mono'; font-weight: 100 800; font-display: swap; src: url(${f(S + '/fonts/jetbrains-mono-latin-wght-normal.woff2')}) format('woff2'); }
${CSS}
.toast { opacity: 0; pointer-events: none; } .toast.show { opacity: 1; }
</style>
${body}
<script>${JS}</script>
`
  mkdirSync(S + '/dist', { recursive: true })
  writeFileSync(S + '/dist/index.html', html)
  writeFileSync(S + '/b1-calm.html', html)
  console.log('written', (html.length / 1024).toFixed(0) + 'KB', pages.length)
} else console.log('chars', pages.length)
