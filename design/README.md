# 대댐 로그 새 디자인 시안 (1안 개정)

실제 사이트(master)와 별개인 디자인 시안과 검사 기록을 보관하는 브랜치입니다.
이 브랜치는 배포되지 않습니다. 사이트 배포는 master에 push될 때만 일어납니다.

- 보기: `b1-calm.html`을 브라우저로 열면 됩니다(글꼴·그림이 모두 파일 안에 들어 있는 한 장짜리 페이지).
- 게시본: https://claude.ai/artifact/DWFPNpsZanJF7nwJix3aia (비공개, 소유자만 열림)

## 다시 만들기

시안은 블로그 저장소의 글(`src/content`)과 표지 그림, 코드 강조(shiki)를 그대로 읽어 만듭니다.
그래서 master를 받아 `npm ci`까지 마친 폴더가 필요합니다.

```bash
# 1) 블로그 저장소(master)
git clone https://github.com/daedaem/daedaem.github.io.git
(cd daedaem.github.io && npm ci)

# 2) 이 브랜치
git clone -b design-prototype https://github.com/daedaem/daedaem.github.io.git design-prototype
cd design-prototype/design
npm install

# 3) 만들기 (BLOG_REPO를 생략하면 이 저장소 옆의 daedaem.github.io를 찾는다)
BLOG_REPO=../../daedaem.github.io node final.mjs        # 쓰인 글자 목록(final-chars.txt)만 만든다
BLOG_REPO=../../daedaem.github.io node final.mjs build  # dist/index.html, b1-calm.html
```

글이 늘어 새 글자가 생기면 글꼴 서브셋을 다시 만들어야 합니다.
`final-chars.txt`와 `fonts/chars-final.txt`를 비교해 빠진 글자가 있으면, 원본
PretendardVariable.woff2(npm `pretendard@1.3.9`)에서 두 목록을 합쳐 서브셋합니다.

```bash
pyftsubset PretendardVariable.woff2 --text-file=fonts/chars-final.txt \
  --flavor=woff2 --layout-features='*' --output-file=fonts/pre-final.woff2
```

## 파일

| 경로 | 내용 |
|---|---|
| `final.mjs` | 시안 생성기. 화면·스타일·스크립트가 모두 여기 있다 |
| `proto-b.mjs` | B안 기반 스타일. `final.mjs`가 이 파일의 CSS 부분만 읽는다 |
| `icons/` | Tabler Icons(MIT) 중 쓰는 16개 |
| `fonts/` | Pretendard 서브셋, JetBrains Mono(둘 다 SIL OFL 1.1) |
| `audit/` | 검사 기록. 요약 문서와 검사에 쓴 스크립트 |

`audit/scripts/`의 스크립트는 작업 세션의 임시 경로와 로컬 서버 주소(127.0.0.1)를 그대로
담고 있습니다. 기록용이며, 다시 돌리려면 경로와 서버 주소를 바꿔야 합니다.

## 검사 방법 요약

- 자동 검사: axe-core 4.13(WCAG 2.2 AA 태그), Lighthouse 12.8
- 스크립트 검사: 키보드만으로 조작, 320~1280px 화면 측정, 초점 가림, 대비 계산
- 휴리스틱: Nielsen 10원칙, 서로 다른 관점의 평가자 3명(과제 수행, 원칙별 측정, 채용 담당자)
- 못 한 것: 실제 스크린리더(NVDA·VoiceOver), 실제 기기(iOS Safari 등), 실사용자 테스트,
  실제 방문자 데이터로 재는 Core Web Vitals

결과는 `audit/EVALUATIONS.md`에 있습니다.
