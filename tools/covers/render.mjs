// 사용: node render.mjs <kind> <mode> <out.png>
// mode 1 = 법선, 2 = 깊이·재질·절단면, 3 = 그림자·AO·결.  (0 = 3D 확인용 컬러 렌더)
// WebGL2 SDF 레이마칭을 헤드리스 크로미움(SwiftShader)에서 128px 타일로 나눠 그린다.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, launchOpts } from './_browser.mjs'
import { CAMERAS, SIZE } from './config.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const [kind, mode = '0', out] = process.argv.slice(2)
const cam = CAMERAS[kind]
if (!cam || !out) throw new Error('사용: node render.mjs <kind> <mode> <out.png>')
const frag = readFileSync(join(HERE, 'common.glsl'), 'utf8') + '\n' + readFileSync(join(HERE, 'scenes', `${kind}.glsl`), 'utf8')
const html = `<!doctype html><canvas id="c" width="${SIZE.w}" height="${SIZE.h}"></canvas><script>
window.run = async (frag, cam, fov, ty, mode) => {
  const cv = document.getElementById('c'); const gl = cv.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false })
  const vs = '#version 300 es\\nin vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'
  const P = gl.createProgram()
  for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, frag]]) { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); gl.attachShader(P, sh) }
  gl.linkProgram(P); if (!gl.getProgramParameter(P, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(P)); gl.useProgram(P)
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const l = gl.getAttribLocation(P, 'p'); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, 2, gl.FLOAT, false, 0, 0)
  const W = cv.width, H = cv.height, T = 128
  gl.uniform2f(gl.getUniformLocation(P, 'uRes'), W, H)
  gl.uniform3f(gl.getUniformLocation(P, 'uCamPos'), cam[0], cam[1], cam[2])
  gl.uniform3f(gl.getUniformLocation(P, 'uCamTarget'), 0, ty, 0)
  gl.uniform1f(gl.getUniformLocation(P, 'uFov'), fov)
  gl.uniform1i(gl.getUniformLocation(P, 'uMode'), mode)
  gl.enable(gl.SCISSOR_TEST)
  for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) {
    gl.viewport(x, y, T, T); gl.scissor(x, y, T, T)
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish()
    await new Promise((r) => setTimeout(r, 0))
  }
  return cv.toDataURL('image/png')
}
</script>`
mkdirSync(dirname(out), { recursive: true })
const page = join(dirname(out), `_render-${kind}.html`)
writeFileSync(page, html)
const o = launchOpts({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })
const b = await chromium.launch(o)
const p = await b.newPage()
p.on('console', (m) => console.log('[page]', m.text()))
await p.goto(`file://${page}`)
const url = await p.evaluate(
  ({ frag, cam, mode }) => window.run(frag, cam.pos, cam.fov, cam.targetY, mode),
  { frag, cam, mode: +mode },
)
writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'))
await b.close()
