---
draft: false
title: 'Oracle은 빈 문자열을 NULL로 저장한다'
description: 'Oracle VARCHAR2의 빈 문자열 처리와 Java의 null·빈 문자열 비교는 다르다. 저장 방식, SQL의 NULL 비교, 업무상 값의 의미를 구분한다.'
topic: 'database'
tags: ['Oracle', 'NULL', 'SQL']
created: 2026-08-12
updated: 2026-10-26
status: 'growing'
---

## 무슨 일이 일어나는가

`NULL`은 Oracle만의 개념이 아니다. 여기서 Oracle의 특징은 일반적인 `VARCHAR2` 컬럼에 길이 0인 문자열을 넣으면 `NULL`로 취급한다는 점이다. 공백 한 칸이 있는 `' '`는 길이 0인 문자열이 아니다.

```sql
CREATE TABLE t (col VARCHAR2(20));

INSERT INTO t (col) VALUES ('');   -- 실제로는 NULL이 들어간다
INSERT INTO t (col) VALUES (NULL); -- 위와 같은 결과

SELECT CASE WHEN '' IS NULL THEN 'NULL이다' ELSE '아니다' END FROM dual;
-- NULL이다
```

SQL 표준은 빈 문자열과 NULL을 다른 값으로 본다. PostgreSQL, MySQL, SQL Server는 빈 문자열과 NULL을 구분한다. Oracle과의 차이를 이관·연동 시 확인해야 한다. `EMPTY_CLOB()`으로 만든 비어 있는 LOB는 NULL과 다르므로, 문자열의 규칙을 모든 타입에 일반화하지 않는다. [Oracle NULL 문서](https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/Nulls.html)

## 왜 문제가 되는가

Java에서는 빈 문자열 `""`과 객체 참조가 없는 `null`을 구분한다. 그런데 이 둘을 Oracle의 일반적인 `VARCHAR2` 컬럼에 저장하면 DB에서는 구분할 수 없다.

다음은 수신한 빈 문자열과 DB에서 읽은 NULL을 비교하는 상황을 가정한 학습 예시다. 연결된 사례 글의 실제 데이터나 수정 코드를 재현한 것은 아니다.

```java
String received = "";
String stored = null;

boolean changed = !java.util.Objects.equals(received, stored);
System.out.println(changed); // true: Java에서는 서로 다른 값이다
```

이 결과를 그대로 변경 판단에 사용하면, 업무상 둘 다 '값 없음'을 뜻하는 경우에도 변경으로 잡힐 수 있다. `Objects.equals`는 null을 안전하게 비교할 뿐, 빈 문자열을 null과 같은 값으로 바꿔 주지는 않는다. [Java Objects.equals 문서](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Objects.html#equals(java.lang.Object,java.lang.Object))

반대로 수신 데이터에서 `null`은 '변경하지 않음', `""`는 '지우기'처럼 서로 다른 명령을 뜻한다면 둘을 합쳐서는 안 된다. 구분이 필요한 의미는 별도 상태 컬럼이나 변경 명령으로 표현해야 한다.

## NULL 비교

SQL의 NULL 비교는 위 Java 비교와 다르다. `=`나 `<>`로 NULL을 비교하면 참도 거짓도 아닌 UNKNOWN이 된다. WHERE 절은 TRUE인 행만 남기므로 UNKNOWN인 행은 빠진다. 따라서 `old_col <> new_col`에 한쪽 NULL이 들어갔다고 해서 자동으로 '변경됨'으로 판정되는 것은 아니다.

```sql
-- 한쪽이 NULL이면 이 조건은 참이 되지 않는다
WHERE old_col <> new_col

-- 양쪽 NULL은 같게, 한쪽만 NULL이면 다르게 보아 변경된 행을 고르는 조건
WHERE (old_col IS NULL AND new_col IS NOT NULL)
   OR (old_col IS NOT NULL AND new_col IS NULL)
   OR old_col <> new_col
```

Java에서도 비교 방식에 따라 결과가 다르다. `"".equals(null)`은 `false`지만, `null`인 참조에 `.equals(...)`를 호출하면 `NullPointerException`이 난다. Java의 비교 결과, 예외 발생, SQL의 UNKNOWN을 같은 현상으로 설명하면 안 된다.

## 어떻게 다룰 것인가

업무상 두 값이 같은 의미라면 **값이 들어오는 경계에서 한쪽으로 정규화**할 수 있다. 둘이 다른 명령이나 상태를 뜻한다면 정규화하면 안 된다.

아래는 null과 빈 문자열을 같은 의미로 다루기로 한 경우에만 사용하는 학습 예시다.

```java
private static String normalize(String v) {
    return (v == null || v.isEmpty()) ? null : v;
}

// Objects.equals는 양쪽 null이면 true, 한쪽만 null이면 false를 준다
boolean changed = !Objects.equals(normalize(a), normalize(b));
```

위 코드는 `java.util.Objects`를 사용하는 Java 7 이상 예시다. `Objects`가 없는 구버전이라면 같은 null 비교 규칙을 직접 구현한다.

예를 들어 `a = ""`, `b = null`이면 정규화 후 둘 다 null이 되어 `changed`는 `false`다. `a = "A"`, `b = null`이면 `true`다. 이 함수는 공백 문자열이나 대소문자는 바꾸지 않는다. 그런 값도 같게 볼지는 항목별 업무 규칙으로 따로 정해야 한다.

## 더 볼 것

- [바꾼 적 없는데 결재가 또 올라온다](/posts/null-and-empty-string-sync-failure/) — 빈 값 비교가 변경으로 잡히던 사례

## 아직 정리 못 한 것

- `NVL`, `COALESCE`, `NULLIF`의 차이

**보충(2026-10-26):** Oracle의 저장 규칙, Java의 비교 결과, SQL의 UNKNOWN을 구분하고 빈 값 정규화의 적용 조건과 예시를 보완했다.
