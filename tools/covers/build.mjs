// 사용: node tools/covers/build.mjs [kind ...]
// 장면을 렌더하고(render) 평면으로 칠하고(shade) 라벨을 얹고(compose) 틀을 잡아(frame)
// public/uploads/post-covers/cut-<kind>[-768|-320][-dark].webp 로 저장한다. kind를 안 주면 여섯 장 전부.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { BG, CAMERAS, MARGIN, SHADE, WIDTHS } from './config.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out') // 중간 결과(.gitignore)
const DEST = resolve(HERE, '../../public/uploads/post-covers')
const frame = createRequire(import.meta.url)('./frame.cjs')
const node = (script, args, env = {}) =>
  execFileSync(process.execPath, [join(HERE, script), ...args], { stdio: 'inherit', env: { ...process.env, ...env } })

const kinds = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CAMERAS)
mkdirSync(OUT, { recursive: true })
for (const kind of kinds) {
  if (!CAMERAS[kind]) throw new Error(`모르는 kind: ${kind}`)
  console.log(`— ${kind}`)
  node('render.mjs', [kind, '1', join(OUT, `${kind}-nrm.png`)])
  node('render.mjs', [kind, '2', join(OUT, `${kind}-gb.png`)])
  node('render.mjs', [kind, '3', join(OUT, `${kind}-sh.png`)])
  for (const [theme, suffix] of [['light', ''], ['dark', '-dark']]) {
    const flat = join(OUT, `${kind}${suffix}-flat.png`)
    const labeled = join(OUT, `${kind}${suffix}.png`)
    node(SHADE === 'soft' ? 'shade-soft.mjs' : 'shade.mjs', [OUT, kind, flat], theme === 'dark' ? { DARK: '1' } : {})
    node('compose.mjs', [kind, flat, labeled], theme === 'dark' ? { DARK: '1' } : {})
    // 부드러운 명암은 바닥 그림자가 넓어, 그림자는 빼고 사물만으로 틀을 잡는다
    const img = await (await frame(labeled, BG[theme], MARGIN, SHADE === 'soft' ? 40 : 18)).png().toBuffer()
    for (const w of WIDTHS) {
      const size = w === 1440 ? '' : `-${w}`
      await sharp(img)
        .resize(w, Math.round((w * 2) / 3))
        .webp({ quality: w > 1000 ? 86 : 82 })
        .toFile(join(DEST, `cut-${kind}${size}${suffix}.webp`))
    }
  }
}
console.log('완료:', kinds.join(', '))
