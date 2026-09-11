import { MONOGRAM_PATH } from './brand.mjs'

/**
 * 어절 단위로 나누고 긴 단일 어절만 잘라낸다. 상세 글의 기존 세 줄 한도를 유지한다.
 * @param {string} text
 * @param {number} [max]
 * @param {number} [lines]
 */
export function wrapOgTitle(text, max = 17, lines = 3) {
  const out = []
  let cur = ''
  const push = () => {
    if (cur) out.push(cur)
    cur = ''
  }
  for (const word of text.split(/\s+/)) {
    if (word.length > max) {
      push()
      for (let i = 0; i < word.length; i += max) out.push(word.slice(i, i + max))
      continue
    }
    const next = cur ? `${cur} ${word}` : word
    if (next.length > max) push()
    cur = cur ? `${cur} ${word}` : word
  }
  push()
  if (out.length > lines) {
    const kept = out.slice(0, lines)
    kept[lines - 1] = kept[lines - 1].slice(0, max - 1).trimEnd() + '…'
    return kept
  }
  return out
}

/** @param {string} text */
const esc = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** @param {{title: string, kicker: string, siteTitle: string, identityTitle: string, subtitle: string}} content */
export function renderOgCard({ title, kicker, siteTitle, identityTitle, subtitle }) {
  // 짧은 사이트 정체성은 한 줄, 긴 글 제목은 기존 어절 단위 세 줄로 표시한다.
  const lines = wrapOgTitle(title, title === identityTitle ? 22 : 17)
  const rows = lines
    .map((line, index) => `<tspan x="80" dy="${index === 0 ? 0 : 74}">${esc(line)}</tspan>`)
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="8" fill="#294970"/>
  <text x="80" y="120" font-family="Pretendard" font-size="26" font-weight="600" fill="#294970">${esc(kicker)}</text>
  <text y="250" font-family="Pretendard" font-size="60" font-weight="700" fill="#191f28" letter-spacing="-2">${rows}</text>
  <g transform="translate(80 520) scale(2)">
    <rect width="34" height="34" rx="9" fill="#223e60"/>
    <path d="${MONOGRAM_PATH}" fill="none" stroke="#fcfaf5" stroke-width="2.8" stroke-linejoin="round"/>
  </g>
  <text x="170" y="550" font-family="Pretendard" font-size="28" font-weight="600" fill="#191f28">${esc(siteTitle)}</text>
  <text x="170" y="589" font-family="Pretendard" font-size="22" fill="#384452">${esc(subtitle)}</text>
</svg>`
}
