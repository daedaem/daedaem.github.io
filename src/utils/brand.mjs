// 표식 '두 레인': 두 트랙이 돌아 나오고 끝에 원인 점. viewBox 0 0 32 32.
// 헤더의 맨 마크, 파비콘, OG 카드가 같은 경로를 쓴다.
// 안쪽 트랙을 짧게, 점을 크게 둬서 헤더 20px에서 수학 기호 '∈'처럼 읽히지 않게 한다.
export const MARK_VIEWBOX = '0 0 32 32'
// 바깥 트랙(굵은 선). 헤더에서는 강조색, 타일에서는 흰색
export const MARK_PATH = 'M24 8H14a8 8 0 0 0 0 16h8'
// 안쪽 트랙(연한 선)
export const MARK_LANE = 'M20 16H14'
export const MARK_STROKE = 4
// 트랙 끝의 원인 점
export const MARK_DOT = { cx: 26, cy: 24, r: 3.4 }
// 타일(파비콘·OG)에서는 조금 줄여 여백을 둔다
export const MARK_TILE_TRANSFORM = 'translate(16 16) scale(0.72) translate(-16 -16)'
