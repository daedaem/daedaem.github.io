// 표지 한 장 = 장면(scenes/<kind>.glsl) + 라벨(labels/<kind>.json) + 카메라(아래).
// kind 이름은 src/utils/isometric-covers.mjs 의 값과 같다.
export const SIZE = { w: 1536, h: 1024 }
const base = { pos: [3.7, 3.4, 6.7], fov: 3.4, targetY: 0.5 }
export const CAMERAS = {
  phantom: base,
  disk: base,
  overflow: base,
  nullsync: { pos: [4.0, 3.7, 7.2], fov: 3.4, targetY: 0.5 },
  address: base,
  flash: base,
}
// 저장 크기와 이름: public/uploads/post-covers/cut-<kind>[-768|-320][-dark].webp
export const WIDTHS = [1440, 768, 320]
// 사물이 틀의 약 77%를 채우도록 여백(frame.cjs)
export const MARGIN = 1.3
// 틀 바깥을 채우는 배경색. 사이트 --cv-bg 와 같다
export const BG = { light: '#f7f8fa', dark: '#1a1f28' }
