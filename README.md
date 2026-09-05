# 대댐 로그

오래 운영된 시스템에서 만난 문제를 증상이 아니라 원인까지 파서 고친 기록. 백엔드 개발자의 기술 블로그이자 개인 지식 저장소입니다.

Astro 7 + 마크다운으로 만든 정적 사이트입니다. 읽기는 GitHub Pages, 웹 편집은 Pages CMS, 검색은 Pagefind가 맡습니다. 블로그 콘텐츠를 위한 별도 DB는 두지 않습니다.

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

카테고리와 위키 주제는 `src/consts.ts`에서 정의합니다. 항목을 추가하면 내비게이션과 목록에 반영됩니다. 편집기의 선택지도 `.pages.yml`에서 함께 갱신하고 `npm test`로 확인합니다.

## 개발

**Node 22.12 이상인 Node 22를 씁니다.** Node 22.23.2에서 검증했습니다. Node 24에서 있었던 이전 CLI 문제 때문에 이번에도 Node 22를 유지합니다.

```bash
nvm use
npm install
npm run dev
```

| 명령                                        | 설명                                           |
| ------------------------------------------- | ---------------------------------------------- |
| `npm run dev`                               | 개발 서버 (검색 미동작 — 색인은 빌드 시 생성)  |
| `npm run build`                             | 정적 빌드 + Pagefind 검색 색인                 |
| `npm run preview`                           | 빌드 결과 미리보기                             |
| `npm run check`                             | 타입 검사                                      |
| `npm test`                                  | 내부 참조 검사기·위키 탐색·CMS 설정 테스트     |
| `npm run check:site`                        | 빌드 결과의 내부 링크·필수 파일·초안 제외 확인 |
| `npm run format`                            | Prettier                                       |
| `npm run new post <slug> "제목" [category]` | 글 파일 생성 (`draft: true`)                   |
| `npm run new wiki <slug> "제목" [topic]`    | 위키 파일 생성 (`status: seed`)                |

### iCloud 동기화 폴더에서 작업하지 않습니다

`~/Documents` 아래에 두면 iCloud가 `node_modules`를 dataless 플레이스홀더로 만들어 빌드가 멈추고 git 저장소가 깨집니다. 동기화 대상이 아닌 경로에 두세요.

## 글 쓰기

브라우저 편집은 [글쓰기·문서 관리](https://daedaem.github.io/admin/)에서 시작합니다. Pages CMS에 본인의 GitHub 계정으로 로그인하고 **이 저장소만** 연결합니다. 편집은 외부 CMS에서 이루어지며, 실제 연결·권한 승인은 소유자가 해야 합니다. 설정 파일은 `.pages.yml`입니다.

새 글과 위키는 CMS에서 `draft: true`로 시작합니다. **이 값은 사이트에서 숨길 뿐, 공개 GitHub 원문을 비공개로 만들지 않습니다.** 민감 자료는 입력하거나 업로드하지 않습니다. 발행 전 본인이 검토한 뒤 해제합니다. 파일명 변경은 막고, 옛 노트의 생성·삭제도 막았습니다. 기존 HTML이 포함된 문서는 Source 편집을 권합니다.

노션 원문 전체를 자동 동기화하지 않습니다. 공개 가능한 학습 내용만 한 문서씩 검토하고, 중복 문서는 기존 위키에 흡수합니다. 이미지와 내부 링크는 직접 옮겨 확인합니다. 원본 노션은 검증 전 삭제하지 않습니다.

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
