// 사용: node shade.mjs <buffers-dir> <kind> <out.png>   (DARK=1 이면 어두운 판)
// render.mjs 로 뽑은 <kind>-nrm.png·<kind>-gb.png·<kind>-sh.png 를 읽어 평면 그림으로 칠한다.
// '가벼운 단면': 몸체는 흰색·연회색 면 3단계, 코발트는 잘린 벽 단면(가는 띠)과 작은 포인트에만,
// 원인만 살구색. 선·해칭·종이 결·손 흔들림 없음. 바닥은 옅은 접지 그림자 하나.
import sharp from 'sharp'
const [D, scene, out] = process.argv.slice(2)
const DARK = process.env.DARK === '1'
const load = async (f) => { const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); return { d: data, w: info.width, h: info.height } }
const N = await load(`${D}/${scene}-nrm.png`), G = await load(`${D}/${scene}-gb.png`), S = await load(`${D}/${scene}-sh.png`)
const W = N.w, H = N.h

// 재질 번호: 1 흰 종이, 2 안쪽 면, 3 몸체(옛 코발트), 4 코발트 포인트, 5·8 원인, 7 먹(꺼진 것·옛 것), 10 받침
// 각 재질은 [밝은 면, 중간 면, 그늘 면]
const P = DARK
  ? {
      bg: [26, 31, 40], shadow: [18, 22, 29],
      1: [[222, 227, 235], [202, 209, 219], [184, 192, 204]],
      2: [[40, 54, 78], [34, 46, 67], [29, 40, 58]],
      3: [[62, 70, 84], [50, 57, 69], [41, 47, 58]],
      4: [[138, 180, 248], [118, 160, 232], [100, 142, 214]],
      5: [[240, 178, 135], [226, 160, 116], [210, 144, 100]],
      7: [[92, 103, 120], [78, 88, 104], [66, 75, 90]],
      cut3: [138, 180, 248], cutFill: [44, 60, 88], cut1: [212, 218, 227], layer: [170, 179, 193], cutOther: [120, 132, 150], edge: [12, 15, 20],
    }
  : {
      bg: [247, 248, 250], shadow: [226, 230, 237],
      1: [[255, 255, 255], [233, 237, 244], [213, 220, 231]],
      2: [[234, 241, 253], [221, 232, 250], [208, 222, 246]],
      3: [[255, 255, 255], [229, 234, 242], [210, 218, 230]],
      4: [[27, 100, 218], [24, 88, 196], [21, 78, 176]],
      5: [[236, 165, 116], [222, 148, 99], [205, 132, 84]],
      7: [[58, 67, 82], [47, 54, 67], [38, 44, 55]],
      cut3: [27, 100, 218], cutFill: [226, 235, 251], cut1: [248, 250, 252], layer: [214, 221, 232], cutOther: [200, 210, 224], edge: [196, 205, 218],
    }
P[8] = P[5]; P[6] = P[3]; P[9] = P[2]; P[10] = P[3]

const L = [-0.55, 0.95, 0.45]; const Ll = Math.hypot(...L); L[0] /= Ll; L[1] /= Ll; L[2] /= Ll
const outBuf = Buffer.alloc(W * H * 3)
const MAT = new Uint8Array(W * H), CUT3 = new Uint8Array(W * H)
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
for (let i = 0; i < W * H; i++) {
  const g = i * 4
  const depth = G.d[g] / 255 + G.d[g + 1] / 255 / 255
  const b = G.d[g + 2]; let mat = Math.floor(b / 16); const cut = (b % 16) >= 8
  if (depth > 0.995) mat = 255
  MAT[i] = mat
  if (cut && (mat === 3 || mat === 6 || mat === 10)) CUT3[i] = 1
  let c
  if (mat === 255) c = P.bg
  else if (mat === 0) {
    const ao = S.d[g + 1] / 255
    const t = Math.max(0, Math.min(1, (0.86 - ao) * 2.4))
    c = mix(P.bg, P.shadow, t)
  } else {
    const nx = N.d[g] / 127.5 - 1, ny = N.d[g + 1] / 127.5 - 1, nz = N.d[g + 2] / 127.5 - 1
    const ndl = nx * L[0] + ny * L[1] + nz * L[2]
    const lvl = ndl > 0.62 ? 0 : ndl > 0.15 ? 1 : 2
    if (cut) {
      if (mat === 3 || mat === 6 || mat === 10) c = P.cut3
      else if (mat === 1) c = (S.d[g + 2] / 255) < 0.14 ? P.layer : P.cut1
      else if (mat === 5 || mat === 8) c = P[5][0]
      else c = P.cutOther
    } else {
      c = (P[mat] || P[3])[lvl]
      // 원인의 위를 향한 넓은 면은 옅게: 원인은 단면 쪽에서 가장 진하게 보이게
      if ((mat === 5 || mat === 8) && ny > 0.85) c = mix(c, DARK ? P.bg : [255, 255, 255], 0.42)
    }
  }
  outBuf[i * 3] = c[0]; outBuf[i * 3 + 1] = c[1]; outBuf[i * 3 + 2] = c[2]
}
const R = 18
const put = (i, c) => { outBuf[i * 3] = c[0]; outBuf[i * 3 + 1] = c[1]; outBuf[i * 3 + 2] = c[2] }
for (let y = R; y < H - R; y++) for (let x = R; x < W - R; x++) {
  const i = y * W + x
  if (!CUT3[i]) continue
  let interior = true
  for (let dy = -R; dy <= R && interior; dy += 1) for (let dx = -R; dx <= R; dx += 1) { if (dx * dx + dy * dy > R * R) continue; if (!CUT3[i + dy * W + dx]) { interior = false; break } }
  if (interior) put(i, P.cutFill)
}
// 사물 둘레: 배경·바닥과 맞닿은 사물 픽셀에 2px 옅은 윤곽
const isBg = (k) => MAT[k] === 255 || MAT[k] === 0
for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
  const i = y * W + x
  if (isBg(i)) continue
  if (isBg(i - 1) || isBg(i + 1) || isBg(i - W) || isBg(i + W) || isBg(i - 2) || isBg(i + 2) || isBg(i - 2 * W) || isBg(i + 2 * W)) {
    if (CUT3[i]) continue
    const c = [outBuf[i * 3], outBuf[i * 3 + 1], outBuf[i * 3 + 2]]
    put(i, mix(c, P.edge, 0.85))
  }
}
await sharp(outBuf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out)
