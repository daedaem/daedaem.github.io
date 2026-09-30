// 사용: node shade-soft.mjs <buffers-dir> <kind> <out.png>   (DARK=1 이면 어두운 판)
// '부드러운 입체'(토스 기술 블로그 썸네일 참고): 옅은 푸른 배경, 계단 없는 부드러운 명암, 윤곽선 없음,
// 반질한 하이라이트와 가장자리 빛. 색 역할은 그대로(원인만 살구색, 포인트는 코발트).
import sharp from 'sharp'
const [D, scene, out] = process.argv.slice(2)
const DARK = process.env.DARK === '1'
const load = async (f) => { const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { d: data, w: info.width, h: info.height } }
const N = await load(`${D}/${scene}-nrm.png`), G = await load(`${D}/${scene}-gb.png`), S = await load(`${D}/${scene}-sh.png`)
const W = N.w, H = N.h

// 재질 번호: 1 흰 종이, 2 안쪽 면, 3 몸체, 4 코발트 포인트, 5·8 원인, 7 먹, 10 받침
const P = DARK
  ? { bg: [26, 31, 40], 1: [218, 224, 234], 2: [52, 66, 92], 3: [74, 84, 102], 4: [118, 162, 246], 5: [236, 160, 112], 7: [96, 106, 124] }
  : { bg: [236, 241, 250], 1: [250, 251, 254], 2: [212, 225, 249], 3: [244, 247, 252], 4: [46, 116, 238], 5: [242, 158, 102], 7: [58, 67, 84] }
P[8] = P[5]; P[6] = P[3]; P[9] = P[2]; P[10] = P[3]
// 광택: 플라스틱처럼 반질한 재질
const GLOSS = { 3: 0.22, 4: 0.4, 5: 0.3, 10: 0.22, 1: 0.12 }

const norm = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l) }
const L = norm([-0.55, 0.95, 0.45])
const V = norm([3.7, 2.7, 6.7])
const Hh = norm([L[0] + V[0], L[1] + V[1], L[2] + V[2]])
const cool = DARK ? [0.92, 0.95, 1.08] : [0.9, 0.94, 1.03]
const outBuf = Buffer.alloc(W * H * 3)
for (let i = 0; i < W * H; i++) {
  const g = i * 4
  const depth = G.d[g] / 255 + G.d[g + 1] / 255 / 255
  const b = G.d[g + 2]; let mat = Math.floor(b / 16); const cut = (b % 16) >= 8
  if (depth > 0.995) mat = 255
  const sh = S.d[g] / 255, ao = S.d[g + 1] / 255
  let c
  if (mat === 255) c = P.bg
  else if (mat === 0) {
    // 바닥: 배경색 그대로, 넓고 옅은 푸른 그림자
    const t = Math.min(1, (1 - sh) * 0.28 + Math.max(0, 0.95 - ao) * 0.9)
    const s = DARK ? [14, 17, 23] : [205, 214, 232]
    c = P.bg.map((x, k) => x + (s[k] - x) * t)
  } else {
    const n = norm([N.d[g] / 127.5 - 1, N.d[g + 1] / 127.5 - 1, N.d[g + 2] / 127.5 - 1])
    const ndl = n[0] * L[0] + n[1] * L[1] + n[2] * L[2]
    const ndv = Math.max(0, n[0] * V[0] + n[1] * V[1] + n[2] * V[2])
    const ndh = Math.max(0, n[0] * Hh[0] + n[1] * Hh[1] + n[2] * Hh[2])
    const alb = cut && (mat === 3 || mat === 6 || mat === 10) ? P[4] : (P[mat] || P[3])
    const wrap = Math.max(0, Math.min(1, (ndl + 0.4) / 1.4))
    const lit = 0.8 + 0.26 * wrap * (0.55 + 0.45 * sh)
    const occ = 0.88 + 0.12 * ao
    const shade = 1 - wrap
    c = alb.map((x, k) => x * lit * occ * (1 + (cool[k] - 1) * shade))
    const spec = Math.pow(ndh, 48) * (GLOSS[mat] || 0.1) * 255 * sh
    const rim = Math.pow(1 - ndv, 3) * 0.1 * 255
    c = c.map((x) => x + spec + rim)
  }
  for (let k = 0; k < 3; k++) outBuf[i * 3 + k] = Math.max(0, Math.min(255, Math.round(c[k])))
}
await sharp(outBuf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out)
