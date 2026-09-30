// 사용: node compose.mjs <kind> <in.png> <out.png>
// 렌더된 그림 위에 글자 라벨을 3D 면에 맞춰 얹는다. labels.json: [{text, font, size, color, origin:[x,y,z], u:[dx,dy,dz], v:[dx,dy,dz], w, h}]
// origin = 라벨 사각형의 왼쪽 위 3D 점, u = 가로 방향(길이 w), v = 세로 방향(길이 h, 아래로).
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, launchOpts } from './_browser.mjs'
import { CAMERAS } from './config.mjs'
const HERE = dirname(fileURLToPath(import.meta.url))
const FONTS = resolve(HERE, '../../public/fonts')
const [kind, inp0, out0] = process.argv.slice(2)
const inp = resolve(inp0), out = resolve(out0)
const labels = JSON.parse(readFileSync(join(HERE, 'labels', `${kind}.json`), 'utf8'))
const { pos: [cx, cy, cz], fov, targetY: ty } = CAMERAS[kind]
const png = readFileSync(inp); const W = png.readUInt32BE(16), H = png.readUInt32BE(20)
// 셰이더와 같은 카메라
const ro = [+cx, +cy, +cz], ta = [0, +ty, 0]
const sub = (a, b) => a.map((x, i) => x - b[i]), dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0)
const norm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l) }
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const ww = norm(sub(ta, ro)), uu = norm(cross(ww, [0, 1, 0])), vv = cross(uu, ww)
const project = (P) => { const d = sub(P, ro); const z = dot(d, ww), x = dot(d, uu), y = dot(d, vv); const ux = (x / z) * +fov, uy = (y / z) * +fov; return [ux * H + W / 2, H / 2 - uy * H] }
// 4점 호모그래피 → CSS matrix3d (단위 사각형 w×h → 화면 4점)
function matrix3d(w, h, pts) {
  const [p0, p1, p2, p3] = pts // TL, TR, BR, BL
  const solve = (src, dst) => { // 8×8 선형계 풀이(가우스)
    const A = [], b = []
    for (let i = 0; i < 4; i++) { const [x, y] = src[i], [X, Y] = dst[i]
      A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); b.push(X)
      A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); b.push(Y) }
    const n = 8; for (let i = 0; i < n; i++) { let m = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k; [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]]
      for (let k = i + 1; k < n; k++) { const f = A[k][i] / A[i][i]; for (let j = i; j < n; j++) A[k][j] -= f * A[i][j]; b[k] -= f * b[i] } }
    const x = Array(n).fill(0); for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j]; x[i] = s / A[i][i] }
    return x }
  const hm = solve([[0, 0], [w, 0], [w, h], [0, h]], [p0, p1, p2, p3])
  const [a, b, c, d, e, f, g, hh] = hm
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${hh},0,0,1,0,${c},${f},0,1)`
}
let divs = ''
for (const L of labels) {
  const o = L.origin, u = L.u, v = L.v
  const corners = [o, o.map((x, i) => x + u[i] * L.w), o.map((x, i) => x + u[i] * L.w + v[i] * L.h), o.map((x, i) => x + v[i] * L.h)].map(project)
  const pw = 400, ph = Math.round(400 * L.h / L.w)
  divs += `<div class="lb" style="width:${pw}px;height:${ph}px;transform:${matrix3d(pw, ph, corners)};font:${L.weight || 700} ${Math.round(ph * (L.size || 0.62))}px/${ph}px ${L.font === 'mono' ? "'JetBrains Mono',monospace" : "'Pretendard Variable',Pretendard,sans-serif"};color:${(process.env.DARK === '1' && L.colorDark) || L.color || '#2f3643'};letter-spacing:${L.tracking || '-0.02em'}">${L.text}</div>`
}
// 사이트 글꼴 CSS는 /fonts/... 절대 경로라 저장소 폴더로 바꿔 끼운다
const fontCss = ['pretendard/pretendardvariable-dynamic-subset.min.css', 'jetbrains-mono.css']
  .map((f) => readFileSync(join(FONTS, f), 'utf8').replaceAll('url(/fonts/', `url(file://${FONTS}/`).replace(/url\(\.\/woff2\//g, `url(file://${FONTS}/pretendard/woff2/`))
  .join('\n')
const html = `<!doctype html><meta charset="utf-8"><style>${fontCss}</style>
<style>body{margin:0;width:${W}px;height:${H}px;position:relative;overflow:hidden;background:url(file://${inp}) 0 0/100% 100% no-repeat}
.lb{position:absolute;left:0;top:0;transform-origin:0 0;text-align:center;white-space:nowrap;-webkit-font-smoothing:antialiased}</style>${divs}`
const tmp = out + '.html'; writeFileSync(tmp, html)
const b = await chromium.launch(launchOpts()); const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage()
await p.goto('file://' + tmp); await p.waitForTimeout(700)
await p.screenshot({ path: out }); await b.close()
