---
draft: false
title: '테스트 DB와 실제 DB가 다를 때 확인할 것'
description: '인메모리 DB 테스트가 검증하는 범위를 구분하고, 실제 DB 엔진·스키마로 확인해야 하는 제약 조건을 정리한다.'
topic: 'database'
tags: ['테스트', 'SQL Server', 'H2', '스키마']
created: 2026-09-05
status: 'growing'
---

테스트가 통과했다는 것은 그 테스트가 사용한 코드·설정·데이터에서 기대한 결과가 나왔다는 뜻이다. 다른 DB 엔진과 다른 스키마에서도 같은 동작을 보장한다는 뜻은 아니다.

학습 노트에서 DB별 차이를 다시 정리한 문서다. 특정 서비스의 구성이나 결함, 테스트 성과를 옮긴 것은 아니다. 아래 SQL은 분리된 테스트 DB에서 확인할 예제이며 실제 운영 DB에서 실행하는 절차가 아니다.

## 무엇을 검증했는지 나눈다

| 검사                  | 확인하는 것                            | 그것만으로 부족한 것              |
| --------------------- | -------------------------------------- | --------------------------------- |
| 순수 단위 테스트      | 분기·계산·도메인 규칙                  | 실제 DB 제약과 SQL 동작           |
| 인메모리 DB 테스트    | 해당 DB와 스키마에서의 저장·조회       | 다른 엔진의 문법·비교·잠금        |
| 실제 엔진 통합 테스트 | 선택한 버전·설정에서 SQL과 제약의 동작 | 운영 데이터 규모와 모든 실행 조건 |
| 스키마 변경 테스트    | 빈 DB와 이전 스키마에서의 변경 적용    | 모든 과거 데이터 형태             |

H2가 쓸모없다는 뜻이 아니다. 빠른 피드백을 얻는 테스트로 쓰되, 그 결과가 보장하는 범위를 넓혀 해석하지 않는 것이 핵심이다. 호환 모드도 다른 엔진의 모든 동작을 재현한다는 보장은 아니다.

## 예: NULL과 UNIQUE

SQL Server에서 단일 컬럼의 일반 `UNIQUE` 제약은 `NULL`도 한 번만 허용한다. 이 규칙을 다른 DB에서 실행한 테스트만으로 확인할 수는 없다. [Microsoft 문서](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)

```sql
-- 분리된 SQL Server 테스트 세션에서만 실행한다.
CREATE TABLE #sample_unique (
    id INT NOT NULL PRIMARY KEY,
    optional_code VARCHAR(30) NULL UNIQUE
);

INSERT INTO #sample_unique (id, optional_code) VALUES (1, NULL);
-- 두 번째 NULL은 UNIQUE 제약 위반이 예상된다.
INSERT INTO #sample_unique (id, optional_code) VALUES (2, NULL);
```

이 예제는 단일 컬럼의 일반 제약이다. 복합 키, 필터드 인덱스, 다른 DB의 옵션까지 같은 문장으로 설명하지 않는다. 또한 동시 요청이 언제 대기하고 언제 실패하는지는 트랜잭션과 실행 순서를 포함해 따로 재현해야 한다.

## 엔진만 같아도 충분하지 않다

테스트가 엔티티에서 스키마를 새로 생성한다면, 실제 배포에 사용하는 마이그레이션 파일을 검증하지 않은 셈이다. 엔티티에 표현하지 않은 인덱스나 제약이 있는지도 확인해야 한다.

문자열 비교는 collation 설정의 영향을 받는다. 'SQL Server는 무조건 대소문자를 무시한다'고 외우기보다 DB·컬럼·쿼리에 적용된 비교 규칙을 확인한다. 타입과 길이, 시간 정밀도도 테스트할 경계값을 정해 두는 편이 좋다.

## 테스트 구성의 선택

빠른 단위 테스트를 유지하면서, 실제 사용하는 DB 엔진에 배포용 마이그레이션을 적용하는 통합 테스트를 추가하는 구성을 우선 고려한다. 테스트 컨테이너는 매번 격리된 DB를 준비하는 한 방법이다. [Testcontainers 문서](https://java.testcontainers.org/modules/databases/)

모든 테스트를 실제 엔진에서 실행하는 방법도 있지만 시작 시간과 자원이 더 든다. 반대로 인메모리 테스트만 두면 엔진·DDL 차이를 확인할 구간이 없다. 경계값 저장, 제약 위반, 실제 조회, 커밋·롤백처럼 위험이 큰 구간부터 통합 테스트로 옮긴다.

컨테이너 도입 자체가 품질 보증은 아니다. 엔진 버전, 초기 스키마, 테스트 데이터, 트랜잭션 경계와 정리 순서를 함께 관리해야 재현 가능한 검사가 된다.

## 다음에 보완할 것

이 글에서는 SQL Server 컨테이너를 실제 실행한 결과를 제시하지 않는다. 다음 보완에서는 엔진 버전과 설정을 고정한 재현 코드, 빈 DB·이전 스키마 각각의 마이그레이션 검사, 실패 로그를 추가한다.

관련 개념은 [Oracle의 빈 문자열과 NULL](/wiki/oracle-empty-string-is-null/)과 [Java 상태 전이 검사](/wiki/java-enum-state-transitions/)를 함께 볼 수 있다.

## 참고

- [Microsoft — UNIQUE와 CHECK 제약](https://learn.microsoft.com/en-us/sql/relational-databases/tables/unique-constraints-and-check-constraints?view=sql-server-ver17)
- [Microsoft — Collation and Unicode support](https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support?view=sql-server-ver17)
- [Testcontainers for Java — Database containers](https://java.testcontainers.org/modules/databases/)
