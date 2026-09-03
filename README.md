# 대댐 로그

레거시 환경에서 구조를 개선해 온 백엔드 개발자의 기술 블로그이자 개인 지식 저장소입니다.

Astro 5 + 마크다운으로 만든 정적 사이트입니다.

## 구조

```
src/
├─ content/
│  ├─ posts/   실제로 맡아 해결한 문제의 사례 기록
│  ├─ wiki/    공부하면서 쌓는 지식. 주제별로 계속 갱신
│  ├─ solutions/ 백준·프로그래머스 풀이 (본인 코드만, 지문은 링크)
│  └─ notes/   2022~2023년 학습 노트 아카이브 (오탈자만 교정, 틀린 내용은 취소선+바로잡음)
├─ pages/      라우팅
├─ layouts/    페이지 골격
├─ components/ 재사용 컴포넌트
├─ consts.ts   사이트 메타·카테고리·위키 주제 정의
└─ content.config.ts  컬렉션 스키마
```

카테고리와 위키 주제는 `src/consts.ts` 한 곳에서 정의합니다. 항목을 추가하면 내비게이션과 목록에 함께 반영됩니다.

## 개발

**Node 22가 필요합니다.** Node 24에서는 Astro CLI가 멈춥니다.

```bash
nvm use
npm install
npm run dev
```

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 (검색 미동작 — 색인은 빌드 시 생성) |
| `npm run build` | 정적 빌드 + Pagefind 검색 색인 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run check` | 타입 검사 |
| `npm run format` | Prettier |
| `npm run new post <slug> "제목" [category]` | 글 파일 생성 (`draft: true`) |
| `npm run new wiki <slug> "제목" [topic]` | 위키 파일 생성 (`status: seed`) |

### iCloud 동기화 폴더에서 작업하지 않습니다

`~/Documents` 아래에 두면 iCloud가 `node_modules`를 dataless 플레이스홀더로 만들어 빌드가 멈추고 git 저장소가 깨집니다. 동기화 대상이 아닌 경로에 두세요.

## 글 쓰기

초안은 `src/content/_drafts/` 에서 쓰고, 공개할 때 `src/content/posts/` 또는 `wiki/` 로 옮깁니다. `_drafts/` 는 git에 올라가지 않습니다.

글(posts) 프론트매터:

```yaml
title: '...'
description: '한 문장 요약'
date: 2026-01-01
happened: '2025년 5월' # 일이 실제로 있었던 시기(선택). 발행일과 따로 보여 준다
featured: false # true면 홈 히어로에 고정(선택). 없으면 최신 글이 올라간다
category: 'performance' # data-integrity | performance | operations | legacy | auth-security
tags: []
draft: true
```

위키(wiki) 프론트매터:

```yaml
title: '...'
description: '한 문장으로'
topic: 'database' # java | spring | database | dotnet | web | infra | cs | etc
tags: []
created: 2026-01-01
status: 'seed' # seed | growing | stable
```

## 배포

`master`에 푸시하면 GitHub Actions가 빌드해 GitHub Pages로 배포합니다(`.github/workflows/deploy.yml`). 주소는 https://daedaem.github.io 입니다. Node 버전은 `.nvmrc`를 따릅니다.

옛 Gatsby 시절의 한글 URL은 `astro.config.mjs`의 `redirects`를 통해 `/notes/` 아래 새 주소로 넘깁니다.
