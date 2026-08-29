---
title: 'Oracle은 빈 문자열을 NULL로 저장한다'
description: "Oracle에서 ''와 NULL은 구분되지 않는다. SQL 표준과 다른 동작이라 다른 DBMS에서 옮겨 오면 반드시 걸린다."
topic: 'database'
tags: ['Oracle', 'NULL', 'SQL']
created: 2026-08-29
status: 'growing'
---

## 무슨 일이 일어나는가

Oracle은 길이 0인 문자열을 `NULL`로 취급해 저장한다.

```sql
INSERT INTO t (col) VALUES ('');   -- 실제로는 NULL이 들어간다
INSERT INTO t (col) VALUES (NULL); -- 위와 같은 결과

SELECT CASE WHEN '' IS NULL THEN 'NULL이다' ELSE '아니다' END FROM dual;
-- NULL이다
```

SQL 표준은 빈 문자열과 NULL을 다른 값으로 본다. PostgreSQL, MySQL, MSSQL은 구분한다. Oracle만 다르다.

## 왜 문제가 되는가

애플리케이션에서 `""`와 `null`을 구분해 다뤄도 DB를 한 번 거치면 둘이 합쳐진다. "빈 값으로 명시적으로 지웠다"와 "값이 없다"를 구분하려는 설계가 Oracle 위에서는 성립하지 않는다.

## NULL 비교

`=`나 `<>`로 NULL을 비교하면 참도 거짓도 아닌 UNKNOWN이 된다. WHERE 절에서 UNKNOWN은 거짓처럼 걸러지므로 해당 행이 빠진다.

```sql
-- 한쪽이 NULL이면 이 조건은 참이 되지 않는다
WHERE old_col <> new_col

-- 의도대로 동작하는 형태
WHERE (old_col IS NULL AND new_col IS NOT NULL)
   OR (old_col IS NOT NULL AND new_col IS NULL)
   OR old_col <> new_col
```

## 어떻게 다룰 것인가

구분하려 애쓰기보다 **값이 들어오는 경계에서 한쪽으로 정규화**하는 편이 유지하기 쉽다.

```java
private static String normalize(String v) {
    return (v == null || v.isEmpty()) ? null : v;
}

// Objects.equals는 양쪽 null이면 true, 한쪽만 null이면 false를 준다
boolean changed = !Objects.equals(normalize(a), normalize(b));
```

## 더 볼 것

- 이 문제로 실제 동기화 오류가 났던 사례: [NULL과 빈 문자열을 같게 취급한 대가](/posts/null-and-empty-string-sync-failure/)
- `NVL`, `COALESCE`, `NULLIF`의 차이는 아직 정리하지 않았다.
