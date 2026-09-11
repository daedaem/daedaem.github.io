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
featured: false # 이전 홈 구성의 호환 필드. 현재 홈 추천을 바꾸지는 않는다
category: 'performance' # data-integrity | performance | operations | legacy | auth-security
tags: []
draft: true
```

### 글 표지

표지는 홈의 카드 번호나 글 URL이 아니라 각 글의 프론트매터에서 관리합니다. 홈 추천 글을 바꾸거나 목록 순서가 달라져도 같은 글에는 같은 표지가 붙습니다. 현재 홈 추천 3편과 순서는 `src/utils/home-content.mjs`의 `HOME_READING_PICKS`에서 별도로 관리하며, 표지가 있는 글을 자동 추천하지는 않습니다.

- 기존 디자인: `cover: 'null'`(NULL 비교), `cover: 'query'`(주소 조회), `cover: 'legacy'`(Flash 연동 전환). 실제 글 주제에 맞을 때만 지정합니다. `'null'`은 YAML의 빈 값과 구분하도록 따옴표를 유지합니다.
- 직접 만든 표지: 공개 가능한 JPG·PNG·WebP·AVIF를 `public/uploads/`에 두고 `coverImage: '/uploads/my-cover.webp'`로 지정합니다. CMS의 ‘직접 올린 표지’에서도 선택할 수 있도록 [이미지 필드](https://pagescms.org/docs/configuration/fields/image/)를 설정했습니다. CMS 실제 로그인·저장 왕복은 별도 확인이 필요합니다.
- 두 값이 모두 있으면 `coverImage`가 우선합니다. 둘 다 없거나 비어 있으면 빈 이미지 칸 없이 텍스트로 표시합니다. 외부 URL이나 `../` 경로는 받지 않으며, 없는 파일은 배포 전 내부 참조 검사에서 걸러집니다.
- 홈에는 큰 표지, 글·카테고리 목록에는 작은 썸네일을 씁니다. 제목·요약·날짜는 이미지와 분리해 읽을 수 있습니다. 상세 본문에 큰 표지를 반복하지 않습니다.
- 이미지는 약 3:2 가로 비율로 준비하고, 중요한 내용은 가장자리를 피합니다. 표지는 장식용이므로 독자가 알아야 할 정보는 제목·설명·본문에도 적습니다. 회사 자료나 비공개 원본 이미지를 업로드하지 않습니다.

현재 공개 사례의 생성 표지는 기술 원리를 표현한 개념 이미지이며 실제 시스템 구성도가 아닙니다. WebP 320·768·1440px 파생 파일은 `src/data/post-cover-images.json`에 등록하고 홈과 썸네일에서 알맞은 크기를 선택합니다. 일반 CMS 업로드에는 없는 파생 파일을 임의로 추정하지 않습니다. 표지 교체만으로 글의 작성일이나 수정일을 바꾸지 않습니다.

각 이미지의 의미·최종 파일·생성 프롬프트는 [제작 기록](docs/post-cover-art.md)에 있습니다.

### 위키 문서

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
