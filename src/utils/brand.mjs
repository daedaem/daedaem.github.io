// 표식 '절개': 겉을 잘라 안의 원인(점)을 보는 D. 표지 그림(단면)과 같은 말을 한다.
// 헤더의 맨 마크, 파비콘, OG 카드가 같은 경로를 쓴다. viewBox 0 0 32 32.
export const MARK_VIEWBOX = '0 0 32 32'
// D 몸체에서 왼쪽 가운데를 가로로 잘라낸 형태(evenodd로 틈을 비운다).
// 틈 높이 7과 점 반지름 2.8은 헤더 20px·파비콘 16px에서도 점이 보이도록 잡은 값이다.
export const MARK_PATH = 'M5 4h10.5a12 12 0 0 1 0 24H5Zm0 8.5v7h12.5a3.5 3.5 0 0 0 0-7Z'
// 잘린 틈 끝에 놓인 원인 점
export const MARK_DOT = { cx: 17.5, cy: 16, r: 2.8 }
// 타일(파비콘·OG)에서는 몸체를 조금 줄여 여백을 둔다
export const MARK_TILE_TRANSFORM = 'translate(16 16) scale(0.74) translate(-16 -16)'
