// 표지 도구 공통: Playwright(크로미움) 불러오기.
// 저장소 의존성에는 넣지 않았다. 처음 한 번 `npm i --no-save playwright-core` 로 설치하고,
// 브라우저 실행 파일은 CHROMIUM 환경 변수(없으면 /opt/pw-browsers/chromium, 그것도 없으면 Playwright 기본값)로 찾는다.
import { existsSync } from 'node:fs'

let mod = null
for (const name of [process.env.PW_CORE, 'playwright-core', 'playwright'].filter(Boolean)) {
  try {
    mod = await import(name)
    break
  } catch {
    // 다음 후보
  }
}
if (!mod) throw new Error('playwright-core가 없습니다. `npm i --no-save playwright-core` 후 다시 실행하세요.')

export const chromium = mod.chromium
const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium'
export const launchOpts = (extra = {}) => ({ ...(existsSync(exe) ? { executablePath: exe } : {}), ...extra })
