---
title: 'JOIN 다섯 가지 — INNER, CROSS, LEFT/RIGHT/FULL OUTER'
description: '오라클 고유 문법과 ANSI 조인의 차이, 그리고 다섯 가지 JOIN이 각각 무엇을 남기고 무엇을 버리는지 샘플 테이블로 확인하기.'
topic: 'database'
tags: ['SQL', 'JOIN', 'Oracle', 'ANSI']
created: 2023-12-03
updated: 2026-09-05
status: 'stable'
---

## JOIN이란

`SELECT`로 데이터를 가져올 때 **두 개 이상의 테이블에서 조인 조건을 만족하는 행을 반환하는** 구문이다. 요약하면 여러 테이블을 하나로 만드는 것이다.

오라클은 **9i부터 ANSI 조인**을 함께 쓸 수 있다. 그 이전에는 오라클 고유 문법(`(+)` 표기)만 썼다.

> **ANSI 조인**은 DBMS마다 다르던 SQL을 미국 표준 협회(ANSI)가 표준화한 문법이다.

실무에서 압도적으로 많이 쓰는 건 `INNER JOIN`과 `LEFT OUTER JOIN` 둘이다. 이 둘은 오라클 문법과 ANSI 문법을 모두 알아두는 편이 좋다.

## 샘플 테이블

```sql
CREATE TABLE usertable (
    user_id     INT NOT NULL PRIMARY KEY,
    company_id  INT NOT NULL,
    name        VARCHAR2(20)
);

INSERT INTO usertable VALUES (1001, 1, '카리나');
INSERT INTO usertable VALUES (1002, 1, '윈터');
INSERT INTO usertable VALUES (1003, 2, '쯔위');
INSERT INTO usertable VALUES (1004, 2, '사나');
INSERT INTO usertable VALUES (1005, 2, '트와이스');
INSERT INTO usertable VALUES (1006, 6, '홍길동');   -- 소속사 없음

CREATE TABLE company (
    company_id    INT NOT NULL PRIMARY KEY,
    company_name  VARCHAR2(20)
);

INSERT INTO company VALUES (1, 'SM');
INSERT INTO company VALUES (2, 'JYP');
INSERT INTO company VALUES (3, '네이버');   -- 소속 인원 없음
INSERT INTO company VALUES (4, '카카오');   -- 소속 인원 없음

COMMIT;
```

**양쪽에 짝이 없는 행을 하나씩 심어둔 게 요점이다.** `홍길동`은 `company_id = 6`이라 회사가 없고, `네이버`·`카카오`는 소속 인원이 없다. 이 셋이 JOIN마다 어떻게 되는지 보면 차이가 한눈에 들어온다.

## INNER JOIN

조인 조건이 참인 **행의 쌍을 결합**한다. 같은 키의 행이 여러 개면 조합 수만큼 결과가 나오므로, 중복을 제거하는 집합의 교집합과는 다르다.

```sql
-- ANSI
SELECT a.name, b.company_name
  FROM usertable a
 INNER JOIN company b ON a.company_id = b.company_id;

-- 오라클
SELECT a.name, b.company_name
  FROM usertable a, company b
 WHERE a.company_id = b.company_id;
```

조인 컬럼 값이 **양쪽 모두에 존재해야** 조회된다. 따라서 `홍길동`(회사 없음)도, `네이버`·`카카오`(인원 없음)도 결과에서 빠진다. 5행이 남는다.

## CROSS JOIN

조인 조건 없이 **모든 경우의 수를 조합한다.** 카테시안 곱(Cartesian product) 또는 카테시안 조인이라고도 부른다.

```sql
SELECT a.name, b.company_name
  FROM usertable a
 CROSS JOIN company b;
```

`usertable` 6행 × `company` 4행 = **24행**이 나온다. 모든 가수가 모든 소속사에 속한 것처럼 보이는 데이터다.

실수로 조인 조건을 빠뜨리면 이게 발생한다. 수만 행짜리 테이블 둘이면 결과가 억 단위가 되므로, **의도한 게 아니라면 조인 조건이 빠졌는지 먼저 의심한다.**

## LEFT OUTER JOIN

**기준 테이블의 행은 전부 남기고**, 짝이 없으면 상대 컬럼을 `NULL`로 채운다. 아우터 조인 중 가장 많이 쓴다.

```sql
-- ANSI
SELECT a.name, b.company_name
  FROM usertable a
  LEFT OUTER JOIN company b ON a.company_id = b.company_id;

-- 오라클 (짝이 없을 수 있는 쪽에 (+))
SELECT a.name, b.company_name
  FROM usertable a, company b
 WHERE a.company_id = b.company_id(+);
```

`LEFT`는 **왼쪽 테이블을 기준으로 삼는다**는 뜻이다. `홍길동`도 결과에 나오고, `company_name`만 `NULL`이 된다. 6행이 남는다.

`OUTER` 키워드는 생략하고 `LEFT JOIN`으로 써도 결과는 같다. 다만 **의도를 드러내려면 붙이는 편이 좋다.**

## RIGHT OUTER JOIN

기준이 오른쪽 테이블로 바뀐다.

```sql
SELECT a.name, b.company_name
  FROM usertable a
 RIGHT OUTER JOIN company b ON a.company_id = b.company_id;
```

`company`의 모든 행이 나오므로 소속 가수가 없는 `네이버`·`카카오`도 조회되고, `name`이 `NULL`이 된다. 반대로 `홍길동`은 빠진다.

## FULL OUTER JOIN

`LEFT`와 `RIGHT`를 합친 것이다. **양쪽 모두 짝이 없어도 전부 나온다.**

```sql
SELECT a.name, b.company_name
  FROM usertable a
  FULL OUTER JOIN company b ON a.company_id = b.company_id;
```

`홍길동`도 `네이버`·`카카오`도 결과에 나온다. `(+)` 문법으로 FULL OUTER JOIN을 직접 표현할 수는 없다. 우회한다면 왼쪽 외부 조인 결과에 **오른쪽에서 짝이 없는 행만** `UNION ALL`로 더해야 중복 행을 보존할 수 있다. 양쪽 외부 조인을 단순 `UNION`하면 실제로 존재하는 중복까지 제거할 수 있다.

```sql
SELECT a.name, b.company_name
  FROM usertable a
  LEFT JOIN company b ON a.company_id = b.company_id
UNION ALL
SELECT a.name, b.company_name
  FROM usertable a
 RIGHT JOIN company b ON a.company_id = b.company_id
 WHERE a.user_id IS NULL; -- 왼쪽 PK는 NOT NULL: 짝 없는 행만 선택
```

## 한눈에

| | 왼쪽 짝 없는 행 | 오른쪽 짝 없는 행 |
|---|---|---|
| `INNER JOIN` | 버림 | 버림 |
| `LEFT OUTER JOIN` | **남김** | 버림 |
| `RIGHT OUTER JOIN` | 버림 | **남김** |
| `FULL OUTER JOIN` | **남김** | **남김** |
| `CROSS JOIN` | 조건 없이 전부 조합 | |

## 더 볼 것

- [정규화 — 이상현상을 없애는 과정과, 그 대가](/wiki/database-normalization/) — JOIN이 늘어나는 이유
- [Oracle은 빈 문자열을 NULL로 저장한다](/wiki/oracle-empty-string-is-null/) — 아우터 조인 결과의 NULL을 비교할 때
