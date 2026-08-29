# 대댐 로그

레거시 환경에서 구조를 개선해 온 백엔드 개발자의 기술 블로그이자 개인 지식 저장소입니다.

Astro 5 + 마크다운으로 만든 정적 사이트입니다.

## 구조

```
src/
├─ content/
│  ├─ posts/   실제로 맡아 해결한 문제의 사례 기록
│  ├─ wiki/    공부하면서 쌓는 지식. 주제별로 계속 갱신
│  └─ notes/   2022~2023년 학습 노트 아카이브 (수정하지 않음)
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

### iCloud 동기화 폴더에서 작업하지 않습니다

`~/Documents` 아래에 두면 iCloud가 `node_modules`를 dataless 플레이스홀더로 만들어 빌드가 멈추고 git 저장소가 깨집니다. 동기화 대상이 아닌 경로에 두세요.

## 글 쓰기

`CLAUDE.md`에 컬렉션별 프론트매터 형식과 글쓰기 원칙이 정리되어 있습니다.

## 배포

`master`에 푸시하면 GitHub Actions가 빌드해 GitHub Pages로 배포합니다(`.github/workflows/deploy.yml`). 주소는 https://daedaem.github.io 입니다. Node 버전은 `.nvmrc`를 따릅니다.

옛 Gatsby 시절의 한글 URL은 `src/legacy-redirects.json`을 통해 `/notes/` 아래 새 주소로 넘깁니다.
