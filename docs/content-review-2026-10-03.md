# 콘텐츠 검토 기록 — 2026-10-03

사례 6편·위키 26편·학습노트 26편, 총 58편의 본문과 예제를 검토했다. 40편을 수정하고 18편은 기존 내용과 예제를 유지했다. 알고리즘 풀이 모음은 이번 본문 검토 범위에 포함하지 않았다.

## 편집 기준

- 실제 수행한 일, 학습 예시, 검토만 한 대안을 구분했다. 확인되지 않은 수치·구현·운영 결과는 추가하지 않았다.
- 학습노트의 최초 날짜와 학습 맥락을 유지하고 보충·정정을 날짜와 함께 표시했다.
- 순서·분기·포함 관계를 설명하는 곳에 SVG 6개를 추가했다. 표나 코드가 충분한 곳에는 그림을 추가하지 않았다.
- 자체 작성한 SVG에는 대체 텍스트와 캡션을 붙였다. 한글 글리프를 내장한 BlogDiagram 폰트 서브셋은 Pretendard에서 파생했으며 원래 라이선스는 `public/uploads/diagrams/OFL.txt`에 보관했다.

## 검증

- Node 22.23.3에서 `npm run check`: 오류 0, 경고 0 (기존 hint 3개).
- `npm test`: 226개 중 225개 통과, 1개 기존 skip, 실패 0.
- `npm run build` 및 `npm run check:site`: 618 HTML 페이지와 21,295개 내부 참조 검사 통과.
- 추가한 Python 메서드: 난이도 1·2에서 정상 체인, 오래된 해시, 데이터 변조, 난이도 미달, 이전 해시 연결, 제네시스 해시 검사를 실행했다.
- TypeScript 학습 예제: strict 컴파일과 문자열/숫자 입력 실행을 확인했다. 기존 unknown 대입 예제의 컴파일 오류도 확인해 올바른 기존 설명을 유지했다.

- Chromium에서 그림이 있는 6개 페이지를 390px 뷰포트로 확인했다. 그림 로딩 실패와 문서 가로 넘침이 없었고 캡션·글리프·연결선을 육안 검토했다. MDM 그림은 1440px 화면에서도 확인했다.

## 문서별 결과

| 구분 | 문서 | 결과 | 검토·수정 내용 |
|---|---|---|---|
| 사례 | [600만 건 주소 검색을 튜닝하고도 도로명주소 API로 옮긴 이유](../src/content/posts/address-search-9s-to-100ms.md) | 수정 | 인덱스·팝업 실패 감지의 단정 완화; 실측 구분과 미구현 범위 유지 |
| 사례 | [디스크 99% 알람, 증설하지 않아도 되는 경우](../src/content/posts/disk-99-percent-check-before-expanding.md) | 수정 | 파일 크기·세그먼트 할당·행 데이터 구분과 축소 제약 보완; 설명 흐름도 추가 |
| 사례 | [금액이 마이너스로 찍혔다: VO의 int를 무엇으로 바꿀 것인가](../src/content/posts/integer-overflow-negative-amount.md) | 수정 | BigDecimal 수치 동등성과 스케일 동등성 구분 |
| 사례 | [바꾼 적 없는데 결재가 또 올라온다: 빈 값 비교와 인터페이스 규약](../src/content/posts/null-and-empty-string-sync-failure.md) | 수정 | 본문의 실제 구현 범위 유지; 설명 흐름도 추가 |
| 사례 | [분명히 껐는데 배치가 돌고 있었다: 트리거로 접속 IP 남기기](../src/content/posts/phantom-batch-after-was-migration.md) | 수정 | 배치 추정과 확인을 구분하고 조사 결과를 구체적으로 정리 |
| 사례 | [지원이 끝난 Flash 계약 모듈을 외부 서비스 연동으로 대체하기](../src/content/posts/retire-flash-module-by-integration.md) | 수정 | 본문의 실제 구현 범위 유지; 설명 흐름도 추가 |
| 위키 | [ASP.NET Web Forms — PostBack, ViewState, 페이지 생명주기](../src/content/wiki/aspnet-webforms-basics.md) | 수정 | Load 이전 상태 복원 단계 추가; 재바인딩 설명 보완 |
| 위키 | [브라우저는 주소창에 URL을 넣으면 무엇을 하나](../src/content/wiki/browser-rendering.md) | 수정 | DOM과 CSSOM 역할 구분 및 렌더링 합류 흐름도; 설명 흐름도 추가 |
| 위키 | [데이터 모델링 기초 — 개념·논리·물리와 데이터 독립성](../src/content/wiki/data-modeling-basics.md) | 수정 | 모델 단계·독립성의 의미와 관계 필수성 제약 범위 보완 |
| 위키 | [자료구조와 복잡도](../src/content/wiki/data-structures-and-complexity.md) | 수정 | 복잡도와 실측 구분; 연결리스트 O(1)의 조건 및 트리 정의 교정 |
| 위키 | [정규화 1NF~BCNF와 반정규화](../src/content/wiki/database-normalization.md) | 수정 | BCNF 분해의 종속성 보존 한계와 고차 정규형 적용 조건 |
| 위키 | [디자인 패턴 — 생성·구조·행동](../src/content/wiki/design-patterns.md) | 수정 | DI/DIP와 팩토리 메서드·MVVM의 구분 |
| 위키 | [FTP·FTPS·SFTP의 차이와 방화벽 영향](../src/content/wiki/ftp-ftps-sftp.md) | 수정 | FTPS 데이터 채널 보호 협상과 SFTP 연결·채널 구분 |
| 위키 | [enum은 값의 종류를 제한하지만 상태 전이를 보장하지 않는다](../src/content/wiki/java-enum-state-transitions.md) | 유지 | 상태 전이 표와 완결된 Java 예제가 이미 있어 유지 |
| 위키 | [Java 정수 오버플로는 예외를 던지지 않는다](../src/content/wiki/java-integer-overflow.md) | 수정 | Exact API 버전과 정수 금액·십진 정밀도 조건 보완 |
| 위키 | [MVC 패턴](../src/content/wiki/mvc-pattern.md) | 수정 | Model의 역할과 변경 영향 설명; 의존 방향을 표로 정리 |
| 위키 | [네트워크 기초와 TCP/IP](../src/content/wiki/network-basics-and-tcp-ip.md) | 수정 | TCP ACK와 업무 성공 구분; 네트워크 분류·종료·계층의 과도한 단정 교정 |
| 위키 | [Oracle은 빈 문자열을 NULL로 저장한다](../src/content/wiki/oracle-empty-string-is-null.md) | 수정 | Oracle 문자열/빈 LOB 구분; Java 예시 버전과 실제 사례 분리 |
| 위키 | [Oracle 트리거](../src/content/wiki/oracle-trigger.md) | 유지 | UPDATE OF의 발동 조건·행 단위 동작·진단 시 주의사항과 SQL 유지 |
| 위키 | [React Context와 Redux](../src/content/wiki/react-context-and-redux.md) | 수정 | 리듀서의 동일 상태 반환과 불변 업데이트 구분 |
| 위키 | [커스텀 훅은 상태가 아니라 로직을 공유한다](../src/content/wiki/react-custom-hooks.md) | 수정 | 훅의 로컬 상태와 공유 저장소 구분; useCallback 설명 교정 |
| 위키 | [React 상태 업데이트 배칭과 setState](../src/content/wiki/react-state-and-rendering.md) | 유지 | 함수형 업데이트와 배칭의 기존 교정·예제 유지 |
| 위키 | [관계형 데이터베이스는 무엇을 해결했나](../src/content/wiki/relational-database-and-sql.md) | 수정 | 정규화 예시의 누락된 사원 복원; 파일 관계와 DB 역사 단정 정리 |
| 위키 | [MPA·SPA·CSR·SSR·SSG](../src/content/wiki/rendering-strategies.md) | 수정 | 이동 방식·렌더링 위치·생성 시점 구분; hydration과 라우팅 구분 |
| 위키 | [세션과 쿠키는 어떻게 로그인을 유지하나](../src/content/wiki/session-and-cookie.md) | 수정 | 유효 세션 확인과 서버 측 저장소·인증 조건 명확화 |
| 위키 | [스프링은 왜 만들어졌나 — 객체 지향과의 관계](../src/content/wiki/spring-and-object-oriented-design.md) | 수정 | 검증되지 않은 인물 영입 서술 제거; 학습 관점 명시 |
| 위키 | [@Transactional 안에서 예외를 catch해 문자열을 돌려주면 롤백이 안 된다](../src/content/wiki/spring-transactional-catch-swallows-rollback.md) | 수정 | 파싱 이전 DB 수정이 있는 예제로 커밋/롤백 차이 설명; 경계 흐름도; 설명 흐름도 추가 |
| 위키 | [NOT IN의 NULL 함정과 NOT EXISTS](../src/content/wiki/sql-correlated-subquery.md) | 유지 | NULL 함정과 비교 조건 변경을 이미 구분하고 있어 SQL·측정 한계 유지 |
| 위키 | [JOIN 다섯 가지 — INNER, CROSS, LEFT/RIGHT/FULL OUTER](../src/content/wiki/sql-join-types.md) | 유지 | 기존 데이터 표·JOIN 예제와 NULL·곱집합 설명 유지 |
| 위키 | [테스트 DB와 실제 DB가 다를 때 확인할 것](../src/content/wiki/test-with-production-database-engine.md) | 유지 | 운영 엔진과 테스트 환경의 차이를 구분한 예제 유지 |
| 위키 | [구버전 JDK에서 TLS 핸드셰이크가 실패하는 이유](../src/content/wiki/tls-handshake-and-jdk-version.md) | 유지 | JDK 공급자·업데이트·프로토콜/암호군 조건을 구분한 설명 유지 |
| 위키 | [웹 서버와 WAS는 무엇이 다른가](../src/content/wiki/web-server-was-and-servlet.md) | 수정 | 장애 분리 조건 및 서블릿 공유 상태의 동시성 설명 교정 |
| 노트 | [프론트엔드에서 컴포넌트 구성](../src/content/notes/atomic-design.md) | 유지 | 기존 화면 이미지와 단계별 예시가 있어 그림을 더하지 않음 |
| 노트 | [블록체인(Blockchain) 기본 개념 구현 및 해시의 이해](../src/content/notes/blockchain.md) | 수정 | 역사 자료의 비용·보안 단정 정정; stale hash/작업증명 검증 누락 교정 코드와 연결 그림 |
| 노트 | [코어자바스크립트 ch1. 데이터 타입](../src/content/notes/core-javascript-01-data-types.md) | 수정 | undefined 관례와 배열 빈 슬롯 구분 |
| 노트 | [코어자바스크립트 ch2. 실행 컨텍스트](../src/content/notes/core-javascript-02-execution-context.md) | 수정 | 일반 함수·엄격 모드·화살표 함수의 this 구분 |
| 노트 | [코어자바스크립트 ch3. This](../src/content/notes/core-javascript-03-this.md) | 수정 | this 호출 규칙의 적용 범위 보완 |
| 노트 | [코어자바스크립트 ch4. 콜백함수](../src/content/notes/core-javascript-04-callback.md) | 수정 | 콜백과 비동기 구분 및 타이머 지연 조건 |
| 노트 | [코어자바스크립트 ch5. 클로저](../src/content/notes/core-javascript-05-closure.md) | 수정 | 클로저의 정의와 대표 활용 조건 구분 |
| 노트 | [코어자바스크립트 ch6. 프로토타입](../src/content/notes/core-javascript-06-prototype.md) | 수정 | 레거시 __proto__ 표기를 실행 문법과 구분하고 중복된 오개념 정정 |
| 노트 | [코어자바스크립트 ch7. 클래스](../src/content/notes/core-javascript-07-class.md) | 유지 | 기존 클래스·상속 그림과 교정 예제가 있어 유지 |
| 노트 | [블로그를 시작하는 글](../src/content/notes/first-post.mdx) | 유지 | 개인 학습 이력 원문 보존 |
| 노트 | [JavaScript - 데이터타입](../src/content/notes/javascript-data-types.md) | 수정 | 설명이 섞인 코드 문법·문자열 결과·TDZ 오류 위치 교정; const와 Worker 설명 정정 |
| 노트 | [JavaScript - Export & Import / Class](../src/content/notes/javascript-export-import-class.md) | 유지 | 기존 모듈·클래스 예제와 교정 유지 |
| 노트 | [JavaScript - 참조형 & 원시형 데이터 타입](../src/content/notes/javascript-primitive-and-reference-types.md) | 유지 | 기본형·참조형 비교 예제 유지 |
| 노트 | [JavaScript - Spread & Rest Operators](../src/content/notes/javascript-spread-rest-operators.md) | 유지 | spread/rest 비교 예제 유지 |
| 노트 | [모던 JS Deep Dive - 1. 프로그래밍](../src/content/notes/modern-js-deep-dive-01-programming.md) | 유지 | 개념·학습 맥락 원문 유지 |
| 노트 | [모던 JS Deep Dive - 2. 자바스크립트란](../src/content/notes/modern-js-deep-dive-02-what-is-javascript.md) | 수정 | Web API 표준 주체와 엔진 구현 설명 보완 |
| 노트 | [모던 JS Deep Dive - 4. 변수](../src/content/notes/modern-js-deep-dive-04-variables.md) | 수정 | 메모리 모형의 범위와 let/const TDZ 보완 |
| 노트 | [모던 JS Deep Dive - 5. 표현식과 문](../src/content/notes/modern-js-deep-dive-05-expressions-and-statements.md) | 유지 | 기존 표현식·문 예제와 정정 유지 |
| 노트 | [삼성전자 DX SCSA 19기 합격, 6개월의 교육, 그리고 최종 탈락](../src/content/notes/scsa.md) | 유지 | 개인 합격·학습 이력 원문 보존 |
| 노트 | [시멘틱 태그](../src/content/notes/semantic-html.md) | 유지 | 기존 의미 구조 이미지·예제 유지 |
| 노트 | [타입스크립트 - 0.Overview](../src/content/notes/typescript-00-overview.md) | 수정 | DOM null 검사와 타입 단언의 한계 보완 |
| 노트 | [타입스크립트 - 1.Types](../src/content/notes/typescript-01-types.md) | 수정 | unknown의 제어 흐름 좁히기 예제 및 never·튜플 정정 |
| 노트 | [타입스크립트 - 2.컴파일러 및 구성](../src/content/notes/typescript-02-compiler-and-config.md) | 수정 | 컴파일러 설정·런타임 지원 및 프로젝트 검사 명령 구분 |
| 노트 | [타입스크립트 - 3.1 클래스](../src/content/notes/typescript-03-classes.md) | 수정 | readonly의 얕은 제약과 추상 클래스 상속 조건 |
| 노트 | [타입스크립트 - 3.2 Interface](../src/content/notes/typescript-04-interfaces.md) | 유지 | 기존 인터페이스·type 비교와 교정 유지 |
| 노트 | [타입스크립트 - 4. Advanced Typing Concepts](../src/content/notes/typescript-05-advanced-types.md) | 수정 | 타입 가드의 런타임 검증 책임과 독립 예제 범위 |
