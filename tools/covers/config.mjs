// 표지 한 장 = 장면(scenes/<kind>.glsl) + 라벨(labels/<kind>.json) + 카메라(아래).
// kind 이름은 src/utils/isometric-covers.mjs 의 값과 같다.
export const SIZE = { w: 1536, h: 1024 }
const base = { pos: [3.7, 3.4, 6.7], fov: 3.4, targetY: 0.5 }
export const CAMERAS = {
  phantom: base,
  disk: { pos: [3.7, 3.4, 6.7], fov: 2.9, targetY: 1.0 },
  overflow: { pos: [3.7, 3.4, 6.7], fov: 3.1, targetY: 0.85 },
  nullsync: { pos: [4.0, 3.7, 7.2], fov: 3.4, targetY: 0.5 },
  address: { pos: [3.7, 3.4, 6.7], fov: 2.6, targetY: 0.65 },
  flash: base,
}
// 저장 크기와 이름: public/uploads/post-covers/cut-<kind>[-768|-320][-dark].webp
export const WIDTHS = [1440, 768, 320]
// 사물이 틀의 약 77%를 채우도록 여백(frame.cjs)
export const MARGIN = 1.3
// 틀 바깥을 채우는 배경색. shade-soft.mjs 의 bg 와 같다
export const BG = { light: '#ecf1fa', dark: '#1a1f28' }
// 명암 방식: 'soft'(부드러운 입체, 토스 썸네일 참고) 또는 'flat'(평면 3단)
export const SHADE = 'soft'
