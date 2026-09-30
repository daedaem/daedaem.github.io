# 글 표지 만들기

글 목록·글 본문 옆·소개 사례에 쓰는 '가벼운 단면' 표지 여섯 장을 다시 만드는 도구입니다.

## 규칙

- 사물 하나를 잘라 안을 보여 준다. 원인은 살구색 한 곳에만 쓴다.
- 몸체는 흰색·연회색 면, 코발트는 잘린 벽의 가는 테두리와 작은 표시에만 쓴다.
- 먹선·해칭·종이 결은 쓰지 않는다. 목록 크기(220×160)에서 모서리가 깨끗해야 한다.
- 사물이 틀의 약 4분의 3을 채운다(`config.mjs`의 `MARGIN`).
- 밝은 판과 어두운 판을 같은 장면에서 함께 뽑는다.

## 실행

```sh
npm i --no-save playwright-core     # 처음 한 번
node tools/covers/build.mjs          # 여섯 장 전부
node tools/covers/build.mjs disk     # 한 장만
```

결과는 `public/uploads/post-covers/cut-<kind>[-768|-320][-dark].webp`에 덮어씁니다.
중간 그림은 `tools/covers/out/`에 남고 저장소에는 올라가지 않습니다.

## 파일

| 파일 | 역할 |
| --- | --- |
| `scenes/<kind>.glsl` | 사물 모양(SDF). `solid`는 잘리는 몸체, `loose`는 안에 놓인 것, `cutSDF`는 잘라 낼 영역 |
| `labels/<kind>.json` | 3D 면에 얹는 글자(OFF, 99%, int, API, Flash, IP) |
| `config.mjs` | 카메라, 크기, 여백, 배경색 |
| `common.glsl` | 레이마칭, 재질 번호, 절단면 판정 |
| `shade.mjs` | 면 3단계 칠하기, 단면 테두리, 윤곽. 색은 여기서 바꾼다 |
| `compose.mjs` | 라벨을 원근에 맞춰 얹기 |
| `frame.cjs` | 사물 크기에 맞춰 3:2 틀 잡기 |

kind 이름과 글의 연결은 `src/utils/isometric-covers.mjs`에 있습니다.
