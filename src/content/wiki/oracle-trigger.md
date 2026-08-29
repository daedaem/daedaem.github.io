---
title: 'Oracle 트리거 — 언제 쓰고, 무엇을 조심해야 하나'
description: 'DML/DDL/SYSTEM 트리거의 구분, BEFORE와 AFTER의 차이, :NEW와 :OLD의 의미. 그리고 트리거가 공짜가 아닌 이유.'
topic: 'database'
tags: ['Oracle', '트리거', 'PL/SQL', 'DML']
created: 2023-09-10
updated: 2026-08-29
status: 'stable'
---

## 트리거란

특정 이벤트가 발생할 때 **자동으로 실행되는 저장 프로시저**다. 데이터 무결성 유지, 변경 사항 추적, 작업 자동화에 쓴다.

세 종류로 나뉜다.

| 종류 | 언제 실행되나 |
|---|---|
| **DML 트리거** | `INSERT` `UPDATE` `DELETE` |
| **DDL 트리거** | `CREATE` `ALTER` `DROP` |
| **SYSTEM 트리거** | 데이터베이스의 특정 시스템 이벤트 |

## 기본 형태

```sql
CREATE OR REPLACE TRIGGER after_employee_update
AFTER UPDATE OF salary
ON employees
FOR EACH ROW
BEGIN
   INSERT INTO employee_audits
       (employee_id, audit_action, update_date, new_salary)
   VALUES
       (:new.employee_id, 'UPDATE', SYSDATE, :new.salary);
END;
```

`employees`의 `salary`가 바뀔 때마다 실행되고, 각 행마다 감사 테이블에 기록을 남긴다.

## 알아야 할 네 가지

### 1. BEFORE / AFTER — 실행 시점

- **`BEFORE`** — DML 작업이 실행되기 **전**. 데이터 검증이나 값 변환에 쓴다
- **`AFTER`** — DML 작업이 실행된 **후**. 완료 후 추가 작업(감사 로그 등)에 쓴다

값을 바꾸려면 `BEFORE`여야 한다. `AFTER`에서는 이미 반영된 뒤라 늦다.

### 2. FOR EACH ROW / 문 단위

- **`FOR EACH ROW`** — 영향받는 **행마다** 실행 (행 트리거)
- **생략하면** DML 문 하나당 **한 번만** 실행 (문 트리거)

이 선택이 로그 양을 결정한다. 배치가 수만 건을 갱신하는 테이블에 행 트리거를 걸면 로그도 수만 건이 쌓인다. **"누가 바꿨는가"만 알고 싶다면 문 단위로 충분하다.**

### 3. :NEW / :OLD — 행 트리거 안에서만

트리거 안에서 쓰는 특별한 변수다.

- **`:OLD`** — DML 작업 **전**의 행 값
- **`:NEW`** — DML 작업 **후**의 행 값

`UPDATE`면 `:OLD`가 변경 전, `:NEW`가 변경 후다. `INSERT`에는 `:OLD`가 없고, `DELETE`에는 `:NEW`가 없다.

```sql
CREATE OR REPLACE TRIGGER before_employee_update
BEFORE UPDATE OF salary
ON employees
FOR EACH ROW
BEGIN
   :new.salary := :old.salary * 1.10;   -- 이전 값의 10% 인상으로 덮어씀
END;
```

`:new`에 대입이 가능한 건 **`BEFORE` 행 트리거**에서뿐이다.

### 4. 권한이 필요하다

```sql
GRANT ALTER ANY TRIGGER, CREATE ANY TRIGGER TO <계정>;
```

DBA 권한 계정에서 부여해야 한다.

## 직접 해본 예제

성적이 7로 바뀌면 지도교수 번호를 자동으로 지정하는 트리거다.

```sql
CREATE OR REPLACE TRIGGER update_profno_trigger
BEFORE UPDATE OF grade ON student
FOR EACH ROW
WHEN ( new.grade = 7 )
BEGIN
    :new.profno := 9901;
END;
/
```

```sql
UPDATE student SET grade = 7 WHERE studno = 10101;
```

`WHEN` 절을 쓰면 조건에 맞는 행에서만 트리거 본문이 실행된다. **`WHEN` 안에서는 콜론 없이 `new.grade`로 쓴다**는 게 헷갈리는 지점이다. 본문 안에서는 `:new.profno`처럼 콜론을 붙인다.

## 조심할 것

트리거는 편하지만 공짜가 아니다. **해당 테이블의 모든 DML에 따라붙는 코드**다.

**보이지 않는다.** 애플리케이션 코드를 아무리 읽어도 트리거는 안 보인다. 값이 이상하게 바뀌는데 원인을 못 찾을 때 트리거를 의심해야 하는 이유다. 반대로 내가 트리거를 걸어두면 **다음 사람이 같은 함정에 빠진다.**

**실패가 원래 작업을 막는다.** 트리거 안에서 예외가 나면 그걸 유발한 `UPDATE`까지 실패한다. 진단 목적으로 걸 때는 로그 INSERT 실패가 본 작업에 영향을 주지 않게 해야 한다.

**진단용이면 걷어낸다.** 원인을 확인한 뒤에도 남겨두면, 다음 사람에게는 "왜 있는지 모르는 코드"가 된다.

애플리케이션 경로가 하나라고 확실하면 트리거보다 **코드에 로그를 넣는 게 빠르다.** 트리거가 맞는 상황은 변경 주체가 애플리케이션 밖에 있을 가능성이 있을 때다.

## 더 볼 것

- [내린 서버에서 배치가 돌고 있었다](/posts/phantom-batch-after-was-migration/) — 트리거로 접속 IP를 남겨 원인을 찾은 사례
- [관계형 데이터베이스는 무엇을 해결했나](/wiki/relational-database-and-sql/)
