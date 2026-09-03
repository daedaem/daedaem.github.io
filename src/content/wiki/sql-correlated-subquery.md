---
title: '상관 서브쿼리와 NOT EXISTS — NOT IN이 느리고 위험한 이유'
description: '서브쿼리가 메인 쿼리의 컬럼을 참조하면 무엇이 달라지는가. 수백만 건 적재에서 NOT IN을 NOT EXISTS로 바꿔 속도를 되찾은 기록.'
topic: 'database'
tags: ['SQL', '서브쿼리', 'NOT EXISTS', 'NULL', '성능']
created: 2025-12-22
updated: 2026-08-30
status: 'stable'
---

## 상관 서브쿼리란

서브쿼리가 **메인 쿼리의 컬럼을 참조해서** 실행되는 형태를 말한다.

```sql
SELECT t.city, t.street
  FROM temp_address t
 WHERE NOT EXISTS (
       SELECT 1
         FROM address a
        WHERE a.city = t.city   -- 메인 쿼리(t)의 컬럼을 서브쿼리 안에서 참조
       );
```

`t.city`는 서브쿼리 바깥의 값이다. 서브쿼리 혼자서는 실행될 수 없고 **메인 쿼리의 '현재 행'이 무엇이냐에 따라 결과가 달라진다.** 그래서 "상관(관계가 있다)"이라고 부른다.

| | 일반 서브쿼리 | 상관 서브쿼리 |
|---|---|---|
| 의존성 | 메인 쿼리와 독립 | 메인 쿼리에 의존 |
| 실행 횟수 | 한 번 실행해 결과를 넘김 | **메인 쿼리의 행 수만큼 반복** |
| 실행 순서 | 서브쿼리 → 메인 쿼리 | 메인 한 행 읽기 → 서브쿼리 → 반복 |
| 예 | `WHERE id IN (SELECT id FROM ...)` | `WHERE EXISTS (SELECT 1 FROM ... WHERE a.id = t.id)` |

행마다 반복 실행된다니 느릴 것 같지만, 실제로는 반대인 경우가 많다. 아래가 그 경우다.

## 겪은 문제 — 수백만 건 적재가 끝나지 않음

주소 데이터를 운영 테이블에 채워 넣어야 했다. 엑셀 파일을 받아 임시 테이블로 적재한 뒤, **운영 테이블에 없는 것만 넣는** 작업이다.

처음에는 `NOT IN`으로 짰다.

```sql
INSERT INTO address (address_id, city, street, zip_code)
SELECT t.address_id, t.city, t.street, t.zip_code
  FROM temp_address t
 WHERE t.address_id NOT IN (
       SELECT a.address_id FROM address a
       );
```

읽을 대상이 수백만 건이라 `INSERT`가 굉장히 오래 걸렸다.

`NOT EXISTS`로 바꾸니 **속도가 눈에 띄게 개선됐다.**

```sql
INSERT INTO address (city, street, zip_code)
SELECT t.city, t.street, t.zip_code
  FROM temp_address t
 WHERE NOT EXISTS (
       SELECT 1
         FROM address a
        WHERE a.city   = t.city
          AND a.street = t.street
       );
```

## 왜 달라지는가

| | `NOT IN` | `NOT EXISTS` |
|---|---|---|
| 작동 방식 | 서브쿼리 결과값 **리스트를 먼저 만들고** 하나씩 비교 | 메인 쿼리의 행마다 조건 충족 여부만 확인 |
| NULL 처리 | **NULL이 하나라도 있으면 결과가 안 나올 수 있다** | NULL과 무관하게 논리적으로 정확 |
| 조기 종료 | 리스트 전체를 만들어야 함 | 한 건 찾으면 **바로 멈춘다** |
| 다중 컬럼 비교 | 번거롭다 | 자연스럽다 |
| 맞는 상황 | 비교 대상이 적고 명확한 리스트 | **대용량, 다중 컬럼 비교** |

위 표는 논리적인 실행 모델이다. 실제로는 옵티마이저가 둘 다 안티 조인(예: `HASH JOIN ANTI`)으로 바꾸려 하고, 그러면 속도 차이가 없다. `NOT IN`이 느려지는 진짜 이유는 **비교 컬럼이 NULL 허용일 때** NULL 의미론 때문에 그 변환이 제한되어(Oracle 11g의 null-aware anti join 이전에는 행마다 FILTER로) 처리되기 때문이다. 컬럼을 NOT NULL로 잡거나 `NOT EXISTS`로 쓰면 변환이 풀린다. 이 이유는 실행 계획에서 확인해야 하고, 위 사례에서도 실행 계획을 떠서 확인한 것은 아니라 추론으로 남긴다.

한 가지 더 솔직하게 적으면, 위 개선 전 쿼리는 `address_id`를 비교하고 개선 후는 `city`와 `street`를 비교한다. 조건 자체가 바뀌었으므로 속도 차이 전부를 `NOT IN`과 `NOT EXISTS`의 차이로 돌릴 수는 없다.

### NULL이 더 무서운 문제다

성능보다 이쪽이 위험하다. `NOT IN`의 서브쿼리 결과에 `NULL`이 하나라도 섞이면 **결과가 통째로 비어버린다.**

```sql
-- address_id에 NULL이 하나라도 있으면
SELECT * FROM temp_address WHERE address_id NOT IN (SELECT address_id FROM address);
-- 결과: 0건
```

`x NOT IN (1, 2, NULL)`은 내부적으로 `x <> 1 AND x <> 2 AND x <> NULL`이 된다. 마지막 조건이 참도 거짓도 아닌 **UNKNOWN**이 되고, `AND`로 묶인 전체가 UNKNOWN이 되어 아무 행도 통과하지 못한다.

**오류가 나지 않고 그냥 0건이 나오기 때문에** 눈치채기 어렵다. `NOT EXISTS`는 이 함정이 없다.

## 정리

- 상관 서브쿼리는 논리적으로는 메인 쿼리의 행마다 반복 실행되지만, 옵티마이저가 보통 안티 조인으로 바꾼다. `NOT IN`은 비교 컬럼이 NULL 허용이면 그 변환이 막혀 느려진다.
- 대용량 데이터에서 "없는 것만 넣기"는 `NOT EXISTS`로 짠다.
- `NOT IN`은 서브쿼리에 `NULL`이 섞이면 결과가 통째로 비는데, **오류 없이 조용히 그렇게 된다.**

## 더 볼 것

- [주소 조회가 9초 걸렸다](/posts/address-search-9s-to-100ms/) — 같은 주소 데이터를 두고 조회 쪽을 다룬 사례
- [Oracle은 빈 문자열을 NULL로 저장한다](/wiki/oracle-empty-string-is-null/) — NULL 비교가 UNKNOWN이 되는 문제
- [JOIN 다섯 가지](/wiki/sql-join-types/)
