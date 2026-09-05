---
title: 'NOT IN의 NULL 함정과 NOT EXISTS'
description: '서브쿼리가 메인 쿼리의 컬럼을 참조하면 무엇이 달라지는가. NOT IN의 NULL 의미론과 실행 계획을 함께 보는 방법.'
topic: 'database'
tags: ['SQL', '서브쿼리', 'NOT EXISTS', 'NULL', '성능']
created: 2025-12-22
updated: 2026-09-05
status: 'growing'
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
| 논리적 평가 | 독립된 결과와 비교 | 메인 쿼리의 현재 행마다 조건을 평가 |
| 실제 실행 | 옵티마이저가 조인·캐시 등으로 바꿀 수 있음 | 옵티마이저가 세미/안티 조인 등으로 바꿀 수 있음 |
| 예 | `WHERE id IN (SELECT id FROM ...)` | `WHERE EXISTS (SELECT 1 FROM ... WHERE a.id = t.id)` |

논리적 평가 방식만으로 속도를 판단할 수는 없다. 아래 사례도 비교 조건이 함께 바뀌었으므로, 문법 차이만의 성능 비교로 볼 수 없다.

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

## 무엇이 달라졌는가

| | `NOT IN` | `NOT EXISTS` |
|---|---|---|
| 논리 | 값이 집합에 없는지 비교 | 조건을 만족하는 행이 존재하지 않는지 검사 |
| NULL 처리 | **서브쿼리 결과에 NULL이 하나라도 있으면 UNKNOWN이 될 수 있다** | 비교식이 TRUE인 행이 없으면 통과. NULL을 같은 값으로 볼지는 별도 정의 필요 |
| 실제 성능 | 실행 계획에 따라 안티 조인 등으로 처리 | 실행 계획에 따라 같은 안티 조인 등으로 처리 |
| 다중 컬럼 비교 | 번거롭다 | 자연스럽다 |
| 맞는 상황 | 비교 컬럼이 `NOT NULL`임이 보장되고 값 목록과 비교할 때 | NULL 가능성이 있거나 다중 컬럼 조건으로 존재 여부를 표현할 때 |

실제 DBMS는 두 표현을 안티 조인으로 바꿀 수 있으므로 문법만 보고 어느 쪽이 빠르다고 단정할 수 없다. Oracle에는 NULL 의미론을 보존하면서도 변환하는 null-aware anti join도 있다. 인덱스·통계·DB 버전·조건에 따라 계획이 달라지므로 성능 원인은 실행 계획과 측정값으로 확인해야 한다.

한 가지 더 솔직하게 적으면, 위 개선 전 쿼리는 `address_id`를 비교하고 개선 후는 `city`와 `street`를 비교한다. **조건과 비교 컬럼이 함께 바뀌었고 당시 실행 계획도 보관하지 않았다.** 따라서 체감한 속도 개선을 `NOT IN`과 `NOT EXISTS` 문법 차이로 귀속할 근거는 없다. 이 사례에서 확실히 남길 수 있는 결론은 NULL 함정을 제거하고 실제 중복 판단 기준을 명시했다는 점이다.

### NULL이 더 무서운 문제다

성능보다 이쪽이 위험하다. `NOT IN`의 서브쿼리 결과에 `NULL`이 하나라도 섞이면 **결과가 통째로 비어버린다.**

```sql
-- address_id에 NULL이 하나라도 있으면
SELECT * FROM temp_address WHERE address_id NOT IN (SELECT address_id FROM address);
-- 결과: 0건
```

`x NOT IN (1, 2, NULL)`은 `x <> 1 AND x <> 2 AND x <> NULL`과 같은 의미다. 마지막 비교는 **UNKNOWN**이다. `x`가 1이나 2라면 전체는 FALSE이고, 다른 값이면 UNKNOWN이므로 어느 경우에도 TRUE가 되지 않아 행이 통과하지 못한다.

**오류가 나지 않고 그냥 0건이 나오기 때문에** 눈치채기 어렵다. `NOT EXISTS`는 같은 형태의 함정을 피하지만, 양쪽 비교값이 NULL일 때 그것을 같은 값으로 취급해야 한다면 `IS NOT DISTINCT FROM` 또는 DBMS에 맞는 NULL-safe 비교를 별도로 설계해야 한다.

## 정리

- 상관 서브쿼리는 메인 쿼리의 현재 행을 기준으로 평가하지만, 실제 실행은 옵티마이저가 조인 형태로 바꿀 수 있다.
- "없는 것만 넣기"에는 `NOT EXISTS`가 의도를 명확하게 드러내지만, 성능은 실행 계획으로 확인한다.
- `NOT IN`은 서브쿼리에 `NULL`이 섞이면 결과가 통째로 비는데, **오류 없이 조용히 그렇게 된다.**

## 더 볼 것

- [주소 조회가 9초 걸렸다](/posts/address-search-9s-to-100ms/) — 같은 주소 데이터를 두고 조회 쪽을 다룬 사례
- [Oracle은 빈 문자열을 NULL로 저장한다](/wiki/oracle-empty-string-is-null/) — NULL 비교가 UNKNOWN이 되는 문제
- [JOIN 다섯 가지](/wiki/sql-join-types/)
