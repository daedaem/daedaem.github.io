# 모바일 읽기·위키 연결 개선 — 2026-09-20

기준 공개본: `88a9fd3`. 선행 읽기 UI·표기 수정: `ce6bb47`.
사용자는 기술 블로그·학습 기록의 정체성을 유지하고, Codex와 Claude가 동의한 수정만 적용하도록 요청했다.

## 실제 협의

Claude 앱의 기존 「기술블로그 이력서 포함 검토」 대화(Fable 5.1, Extra)에서 공개 소스와 검토 의견을 주고받았다. 공개 자료만 다뤘으며 비공개 Notion·제출 문서를 열거나 전송하지 않았다.

- Claude는 `ce6bb47`을 별도로 체크아웃·빌드하고 목차·복사 버튼·세 문서 표기를 확인한 뒤 배포에 동의했다. 원래 체크아웃으로 복귀했고 저장소 수정·푸시는 하지 않았다고 보고했다.
- 선행 수정의 Claude 로컬 초기 1.5초 CLS 보고: 정수 사례 모바일 0.148→0.0095, NULL 사례 0.045→0, Web Forms 0.095→0.0011. 이는 Claude의 로컬 측정이며 공개 사이트 PSI·실사용자 수치나 모든 환경에서 0이라는 보장이 아니다.
- 모바일 대표 카드: 큰 이미지를 별도 행에 두는 안과 55% 이미지 안은 카드가 길어져 기각했다. 제목 전체 폭 + 요약 옆 88px 보조 표지 안에 양쪽이 동의했다. PC 구성은 유지한다.
- 위키 추천: 태그 두 개 이상이라는 단순 기준은 유효한 연결도 잃어 기각했다. 같은 주제만으로 자격을 부여하거나 태그 빈도로 의미를 판단하는 안도 반론 후 기각했다. 일반 태그 두 개를 공유하면 허용하자는 안 역시 현재 근거가 없어 제외했다.
- 소개의 기존 ‘판단 → 변경·결과’ 순서는 기술 블로그의 판단 과정을 보여 주므로 유지한다. 성과를 앞으로 보내는 재편은 적용하지 않는다.
- 실제 경험의 증명이 없는 문장은 만들지 않는다. 기술 검사와 원문 대조를 과거 수행 사실의 증명으로 삼지 않는다.

## 구현한 두 가지

### 모바일 홈

640px 이하 대표 카드만 제목을 전체 폭에 놓고, 아래 행에서 요약과 88×약59px 표지를 나란히 둔다. 이미지 `sizes`도 실제 88px에 맞춘다. 전체 제목·글자 크기·대표 순서·슬로건·브랜드·PC 표지 크기는 유지한다. 모바일의 표지 존재감이 작아지는 절충을 수용한다.

같은 로컬 브라우저에서 측정한 문서 좌표(px, 반올림):

| 화면 폭 | 제목 높이 전→후 | 카드 높이 전→후 | 다음 글 제목 Y 전→후 |
| --- | --- | --- | --- |
| 320 | 194→101 | 388→295 | 978→886 |
| 390 | 163→70 | 301→236 | 834→769 |
| 640 | 101→70 | 302→211 | 783→691 |
| 768 | 132→132 | 312→312 | 791→791 |
| 1440 | 132→132 | 321→321 | 788→788 |

390px에서 제목·부제가 합계 5줄→2줄, 320px에서 6줄→3줄이다. 측정 때 스크롤바 폭은15px이며 다른 브라우저의 줄 수까지 보장하지 않는다. 다섯 폭에서 가로 넘침이 없었다. 390px 라이트·320px 다크 화면과 대표 제목 Enter 이동을 확인했다.

### 위키 이어 읽기

1. 공개 글만 대상이며 현재 문서·역링크와 중복하지 않는다. 기존 역링크 목록과 순서는 보존한다.
2. 본문에 명시된 내부 Markdown 링크를 문서 순서대로 먼저 고른다.
3. 자동 추천은 구체 태그 하나 이상이 겹쳐야 자격을 얻는다. 일반 태그 집합은 `Java / Oracle / SQL / Spring / React / 레거시`이며 빈도에 따라 변하지 않는다.
4. 자동 후보 순서는 구체 태그 수 → 일반 태그 수 → 같은 위키 주제 → 제목 → 경로다. 같은 주제는 자격 조건이 아니다.
5. 최대3개이며 관련 문서가 모자라면 억지로 채우지 않는다. 본문·태그 자체는 변경하지 않는다.

현재 콘텐츠의 인라인 상대 링크 문법만 파싱한다. 코드 블록·인라인 코드·이미지·HTML 주석은 제외한다. Markdown 전체 문법을 구현한 파서는 아니므로 참조형 링크 등 새로운 형식을 사용하면 확장 검토가 필요하다. 역링크 판정은 이번 범위 밖으로 기존 문자열 포함 방식 그대로다.

26개 위키의 이어 읽기 합계는42→28개다. 실제 참조 문서(역링크)는 모두 동일하다. NULL 문서는 억지 추천 없이 기존 참조5개를 유지하고, 세션–WAS의 HTTP 연결은 남긴다.

| 위키 ID | 기존 이어 읽기 | 변경 후 이어 읽기 | 보존된 역링크 수 |
| --- | --- | --- | --- |
| aspnet-webforms-basics | tls-handshake-and-jdk-version<br>retire-flash-module-by-integration | — | 0 |
| browser-rendering | — | — | 3 |
| data-modeling-basics | relational-database-and-sql<br>test-with-production-database-engine | database-normalization<br>relational-database-and-sql<br>test-with-production-database-engine | 0 |
| data-structures-and-complexity | — | — | 0 |
| database-normalization | — | — | 3 |
| design-patterns | mvc-pattern<br>spring-and-object-oriented-design | spring-and-object-oriented-design<br>mvc-pattern | 1 |
| ftp-ftps-sftp | — | network-basics-and-tcp-ip<br>web-server-was-and-servlet | 0 |
| java-enum-state-transitions | tls-handshake-and-jdk-version<br>integer-overflow-negative-amount<br>null-and-empty-string-sync-failure | — | 2 |
| java-integer-overflow | integer-overflow-negative-amount<br>tls-handshake-and-jdk-version<br>null-and-empty-string-sync-failure | integer-overflow-negative-amount | 0 |
| mvc-pattern | tls-handshake-and-jdk-version<br>integer-overflow-negative-amount<br>null-and-empty-string-sync-failure | — | 3 |
| network-basics-and-tcp-ip | — | web-server-was-and-servlet | 2 |
| oracle-empty-string-is-null | address-search-9s-to-100ms<br>disk-99-percent-check-before-expanding<br>phantom-batch-after-was-migration | — | 5 |
| oracle-trigger | phantom-batch-after-was-migration<br>address-search-9s-to-100ms<br>relational-database-and-sql | phantom-batch-after-was-migration<br>relational-database-and-sql | 0 |
| react-context-and-redux | — | design-patterns | 2 |
| react-custom-hooks | react-context-and-redux | react-context-and-redux | 1 |
| react-state-and-rendering | browser-rendering | browser-rendering | 2 |
| relational-database-and-sql | sql-join-types<br>oracle-empty-string-is-null<br>address-search-9s-to-100ms | sql-join-types<br>oracle-empty-string-is-null | 3 |
| rendering-strategies | — | web-server-was-and-servlet | 1 |
| session-and-cookie | web-server-was-and-servlet | java-enum-state-transitions<br>web-server-was-and-servlet | 0 |
| spring-and-object-oriented-design | spring-transactional-catch-swallows-rollback | — | 3 |
| spring-transactional-catch-swallows-rollback | spring-and-object-oriented-design | — | 0 |
| sql-correlated-subquery | oracle-empty-string-is-null<br>relational-database-and-sql<br>null-and-empty-string-sync-failure | address-search-9s-to-100ms<br>oracle-empty-string-is-null<br>sql-join-types | 0 |
| sql-join-types | oracle-empty-string-is-null<br>address-search-9s-to-100ms<br>disk-99-percent-check-before-expanding | oracle-empty-string-is-null | 3 |
| test-with-production-database-engine | data-modeling-basics<br>java-enum-state-transitions | oracle-empty-string-is-null<br>java-enum-state-transitions<br>data-modeling-basics | 0 |
| tls-handshake-and-jdk-version | integer-overflow-negative-amount<br>null-and-empty-string-sync-failure<br>retire-flash-module-by-integration | — | 0 |
| web-server-was-and-servlet | phantom-batch-after-was-migration<br>session-and-cookie | phantom-batch-after-was-migration<br>session-and-cookie | 5 |

## Codex 검증

- 최종 구현 `f32ea85`에서 172테스트 통과, 실패·건너뜀0. 포맷 정리 후 전체 검사를 다시 실행했다.
- Astro107파일 오류·경고·힌트0. 빌드 성공, Pagefind554페이지.
- 사이트 검사619HTML /21,736참조 통과. `git diff --check` 통과.
- 새 회귀9개: 모바일 카드1개, 추천/현재26개 출력/역링크 불변8개.
- NULL 위키320px: 추천 제목 없이 참조5개 유지, 링크 높이44px 이상·가로 넘침0.
- 세션 위키1440px: 기대한2개 연결·44px 링크·가로 넘침0, WAS 링크 Enter 이동 확인.
- TLS 위키: 빈 추천 영역이 렌더링되지 않음.
- 생성 HTML26편도 추출해 비교: 이어 읽기28개·역링크39개가 기대 목록과 모두 일치. SCSA 검색2건·Escape 후 검색 버튼 초점 복귀 확인.
- 두 개선은 콘텐츠·날짜·발행·소개·브랜드·패키지·호스팅을 변경하지 않는다. 선행 `ce6bb47`의 합의한 세 문서 표기 수정은 별도 범위다.

## 최종 변경본 확인

Claude는 정확한 `f32ea8517902a050878d072e00bf2c615b3b7cfd`를 별도 체크아웃·빌드하고 선행5개와 새2개를 함께 재검증했다. 이후 선행 `ce6bb47`의 동의를 유지하고 새 `f32ea85` 구현의 배포에도 명시적으로 동의했다. 소스 수정·푸시 없이 기존 체크아웃으로 복귀했다고 보고했다.

- Claude가 별도로 구현한 추천 시뮬레이션과 실제26HTML이 전부 일치하며 총28연결·기존 역링크 보존을 확인했다. 현재 문서의 링크 문법도 파서 지원 범위 안이라고 확인했다.
- 320다크·390라이트와 다섯 폭에서 가로 넘침이 없고 C안 배치를 확인했다. 320/390/640/1440 수치는 Codex와 같다. 768은 카드317px·다음 제목812px로 Codex의312px·791px와 차이가 있다. 배치와50%표지 유지에는 동의했으며 환경 차이의 구체 원인은 확정하지 않았다.
- 모바일 목차 닫힘·실제JS비활성시 열림, 정수 사례7개·Web Forms10개 복사 버튼44px/겹침0을 재확인했다. 로컬 CLS는 각각0.0095/0.0016으로 보고했다. 공개 사이트 실측은 아니다.
- Claude 환경은171테스트 통과·기존 clang 런타임 부재1실패, Codex 환경은172개 모두 통과다. Claude 검색은SCSA3건으로 Codex2건과 차이가 있어 두 보고를 합치지 않는다. 양쪽 모두 검색 동작과Escape초점복귀는 정상이며 불일치 원인은 미확정이다.

배포는 이 합의를 근거로 진행한다. 공개 응답·실화면 결과는 후속 배포 기록에서 구분한다.

## 별도 기록한 비차단 항목

- 현재 대표 NULL 표지는 CSS형이라 `sizes`의 직접 적용 대상이 아니다. 이번 값은 향후 이미지형 대표를 위한88px설정이며 실제 현재 표지 폭도88px다.
- 기존 `PostCover`의 기본 속성 스프레드와 명시 속성이 겹쳐 이미지 `sizes`가 HTML에 두 번 출력된다. Codex도 실제 홈5개 이미지에서 같은 값이 중복된 것을 확인했다. 현 이미지 표시 변화는 없으며 이번 승인된 구현과 분리해 후속 검토한다. 미래 대표 이미지의 명시값 재정의까지 정상이라고 단정하지 않는다.
- 26편 기대 목록 검사는 새 콘텐츠 추가 시 관련 기대값 갱신을 요구할 수 있다. 새 글을 제한하는 규칙이 아니며 향후 테스트를 고정 fixture로 분리할지 검토할 수 있다.

## 배포·공개 확인

합의 기록만 추가한 `84c8a33`을 master에 반영했고 [배포35490661302](https://github.com/daedaem/daedaem.github.io/actions/runs/35490661302)가 성공했다. 애플리케이션 코드는 Claude가 승인한 `f32ea85`와 동일하다.

- 공개 홈·소개·글 목록·NULL/세션/TLS/Web Forms/Spring위키·NULL/정수사례 총10경로와 홈CSS3개가 HTTP200이며 로컬 검증본과SHA-256일치.
- 공개 홈390px: 카드236px·제목 전체 폭/요약 옆 표지·가로 넘침0 확인.
- 공개 NULL 위키: 추천0·실제 참조5 유지. 세션 위키: enum/WAS2개·WAS링크Enter이동 확인.
- 공개 SCSA검색2건·Escape닫힘/검색버튼초점복귀 확인. Claude 로컬3건과의 차이는 이 공개 확인과 별개로 기록한다.

이후 이 결과를 남기는 문서 변경은 사이트 코드·콘텐츠를 변경하지 않는다.

이번 검사는 실제 독자 조사, 전 콘텐츠 사실 전수 검증, 실기기·실스크린리더 검증이나 UX100점·채용 효과 보장이 아니다.
