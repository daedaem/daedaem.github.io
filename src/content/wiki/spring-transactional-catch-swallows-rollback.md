---
draft: false
title: '@Transactional 안에서 예외를 catch해 문자열을 돌려주면 롤백이 안 된다'
description: '서비스가 업무 결과를 문자열로 반환하는 구조에서 checked 예외를 catch해 "SERVER_ERROR"를 돌려주면 프록시는 정상 종료로 보고 commit한다. 업무 결과와 시스템 오류를 갈라 롤백을 살리는 방법, 그리고 self-invocation 함정.'
topic: 'spring'
tags: ['Spring', '트랜잭션', '예외', '롤백', 'AOP']
created: 2026-08-26
updated: 2026-09-06
status: 'stable'
---

## 현상

서비스 메서드에 `@Transactional`이 붙어 있고, 성공·대기·초과 같은 **업무 결과를 문자열로 반환**하는 구조다. 같은 메서드 안에서 DB 수정과 날짜 문자열 파싱을 하는데, 파싱 메서드가 checked 예외를 던져 `try-catch`가 강제된다. 이때 catch 블록에서 `"SERVER_ERROR"` 같은 문자열을 반환하면 **예외가 서비스 안에서 먹혀 롤백이 일어나지 않는다.**

## 원인

아래 설명은 트랜잭션이 아직 `rollback-only`로 표시되지 않은 경우를 전제로 한다. 다른 빈의 내부 트랜잭션이나 영속성 계층에서 이미 롤백 전용으로 표시했다면, 바깥에서 예외를 잡아 정상 반환해도 커밋되지 않는다. `REQUIRED`로 공유한 내부 트랜잭션의 실패라면 바깥 커밋 시 `UnexpectedRollbackException`이 발생할 수 있다. [Spring 트랜잭션 전파 문서](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)

- 기본 프록시 방식에서는 프록시가 정상 반환 여부, 밖으로 나온 예외의 롤백 규칙, rollback-only 상태를 보고 트랜잭션을 마무리한다. 모든 예외가 자동으로 롤백되는 것은 아니다.
- 서비스 안에서 catch해 문자열을 반환하면 프록시 입장에서는 "정상 종료"다. 중간까지 실행된 DB 수정이 그대로 commit된다.
- 함정이 하나 더 있다. 기본 설정에서는 **RuntimeException과 Error만 롤백**하고 checked 예외는 롤백하지 않는다. catch를 빼더라도 checked 예외가 그대로 나가면 롤백이 안 된다.

## 결정 — 업무 결과와 시스템 오류를 가른다

구조를 크게 바꾸지 않는 선에서 이렇게 정했다. **업무 결과는 서비스가 문자열로 반환하고, 시스템 오류는 예외로 던져 컨트롤러가 catch해 분기한다.**

1. 서비스: 업무 판단(성공/대기/초과)은 그대로 문자열 반환. 이건 "정상 흐름"이라 commit되는 것이 맞다.
2. 서비스: checked 예외(파싱 실패 등)는 삼키지 말고 **unchecked로 감싸 다시 던진다.** 원인 예외를 cause로 넘기는 것이 핵심이다.
3. 컨트롤러: `RuntimeException`을 catch해 로그를 남기고 `"SERVER_ERROR"`를 만든다. 응답 포맷은 유지되고 롤백은 이미 끝난 상태다.

```java
// Service (Spring 3.x)
@Transactional
public String process(String dateStr) {
    Date d;
    try {
        d = parse(dateStr);              // checked 예외
    } catch (ParseException e) {
        throw new IllegalStateException("날짜 파싱 실패: " + dateStr, e);
    }
    dao.update(d);
    return isOver(d) ? "OVER" : "OK";     // 업무 결과는 그대로 문자열
}

// Controller
try {
    result = service.process(dateStr);
} catch (RuntimeException e) {
    log.error("process failed", e);
    result = "SERVER_ERROR";
}
```

### 고르지 않은 대안

catch를 서비스 안에 유지해야만 한다면 catch 블록에서 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()`를 호출하는 방법이 있다. `rollbackFor`는 예외가 프록시 밖으로 나갈 때만 의미가 있어서, 안에서 잡아 정상 반환하는 이 경우에는 붙여도 아무 역할을 하지 않는다. 그리고 이 방법은 서비스가 트랜잭션 API에 직접 의존하게 되어 차선이다.

## 추가 주의 — 같은 빈 안에서 직접 호출 (self-invocation)

- 기본 프록시 방식에서 `this.otherTxMethod()`처럼 같은 클래스 안에서 호출하면 **프록시를 거치지 않아** 안쪽 메서드의 `@Transactional` 설정(`REQUIRES_NEW`, `rollbackFor` 등)이 적용되지 않는다. 바깥 메서드에 트랜잭션이 있으면 그 안에서 계속 실행되고, 바깥에도 없다면 새 트랜잭션은 시작되지 않는다.
- 특히 "이 부분만 별도 트랜잭션으로 커밋하고 싶다"고 `REQUIRES_NEW`를 붙여도 안 먹힌다.
- 해결은 별도 빈으로 분리해 주입받거나, 자기 자신의 프록시를 주입받아 호출하는 것이다.

## 확인 방법

실제로 사용하는 트랜잭션 매니저의 로거를 DEBUG로 설정한다. 공통 상위 클래스도 `getClass()`를 기준으로 로거를 만들기 때문에, `org.springframework.transaction`만 켜서는 다른 패키지의 JDBC/JPA 매니저 로그까지 보장되지 않는다. [Spring AbstractPlatformTransactionManager 소스](https://github.com/spring-projects/spring-framework/blob/main/spring-tx/src/main/java/org/springframework/transaction/support/AbstractPlatformTransactionManager.java)

예를 들어 Log4j 1.x 설정을 사용하는 레거시 애플리케이션이라면 다음 중 실제 사용하는 매니저의 줄을 적용한다. 로깅 프레임워크가 다르면 같은 로거 이름을 해당 설정 형식으로 옮긴다.

```properties
# JDBC: 실제 클래스가 DataSourceTransactionManager일 때
log4j.logger.org.springframework.jdbc.datasource.DataSourceTransactionManager=DEBUG
# JPA: 실제 클래스가 JpaTransactionManager일 때
log4j.logger.org.springframework.orm.jpa.JpaTransactionManager=DEBUG
```

다른 구현체나 하위 클래스를 쓰면 그 클래스 이름을 확인한다. JTA 매니저처럼 `org.springframework.transaction` 아래에 있는 구현은 기존 패키지 설정으로도 보일 수 있다. rollback-only가 아닌 상태에서 문자열을 정상 반환하는 경로와, 예외가 프록시 밖으로 나가는 경로를 비교해 commit/rollback 로그를 확인한다. Log4j 1.x는 구형 환경을 읽기 위한 설정 예시이지 신규 도입 권장이 아니다.

## 정리

- 프록시는 예외와 롤백 규칙, 트랜잭션의 rollback-only 상태를 함께 본다. 파싱 예외를 안에서 삼키고 롤백 표시도 하지 않으면 commit될 수 있다.
- 기본값은 RuntimeException과 Error만 롤백한다. checked 예외는 감싸서 던지거나 `rollbackFor`를 명시한다.
- 업무 결과와 시스템 오류는 다른 채널로 나가야 한다. 전자는 반환값, 후자는 예외.
- 같은 빈 안에서의 직접 호출은 프록시를 타지 않는다.
