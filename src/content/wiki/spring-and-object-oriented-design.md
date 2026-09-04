---
title: '스프링은 왜 만들어졌나 — 객체 지향과의 관계'
description: 'EJB의 겨울에서 스프링이 나온 배경부터 다형성·SOLID까지. 스프링을 "웹 만드는 도구"가 아니라 "좋은 객체 지향 설계를 돕는 프레임워크"로 이해하기 위한 정리.'
topic: 'spring'
tags: ['Spring', '객체지향', 'SOLID', '다형성', 'DI']
created: 2023-05-21
updated: 2026-08-29
status: 'stable'
---

> 인프런 「스프링 핵심 원리 - 기본편」(김영한)을 들으며 정리한 노트를 하나로 묶었다.

## 스프링이 나온 배경

2000년대 초반 자바 엔터프라이즈 개발의 표준은 **EJB(Enterprise JavaBeans)** 였다. 대규모 시스템을 다루기 위한 스펙이었지만 무거웠다. 간단한 작업 하나에도 복잡한 절차를 요구했고, 코드가 EJB 컨테이너에 강하게 묶였다.

2000년 9월, 마틴 파울러·레베카 파슨스·조시 맥킨지가 **POJO**(Plain Old Java Object)라는 말을 만들었다. 컨퍼런스 발표를 준비하며 "왜 사람들이 평범한 객체를 쓰기 싫어할까" 고민하다, 이름이 없어서 그렇다는 결론에 이르러 이름을 붙인 것이다. 그대로 옮기면 "순수하고 오래된 자바 객체"인데, **특정 프레임워크에 종속되지 않은 자바 본래의 모습으로 돌아가자**는 메시지였다.

여기서 두 가지가 갈라져 나왔다.

**하이버네이트 → JPA.** 게빈 킹은 EJB의 Entity Bean에 문제가 많다고 보고 하이버네이트를 만들었다. 점유율이 오르자 자바 표준 논의 기관이 그를 영입해 **JPA(Java Persistence API)** 를 표준으로 삼았다. JPA는 하이버네이트의 영향을 크게 받아 만든 ORM 표준이다. SQL을 직접 쓰는 대신 자바 객체와 테이블을 매핑해 다룬다.

**로드 존슨의 3만 줄 → 스프링.** 로드 존슨은 저서에서 "EJB 없이 순수 자바만으로도 좋은 객체 지향 애플리케이션을 만들 수 있다"는 것을 3만여 줄의 코드로 보여줬다. 이 코드가 스프링의 모체가 됐다. 이름은 **J2EE라는 겨울을 넘어선 새로운 봄**이라는 뜻이다.

## 스프링의 진짜 핵심

스프링을 이렇게 설명하는 경우가 많다.

- 웹 애플리케이션을 만들고 DB 접근을 편하게 해주는 기술
- 웹 서버도 자동으로 띄워주고
- 클라우드, 마이크로서비스

**전부 결과물이지 핵심이 아니다.** 핵심은 하나다.

> 스프링은 **좋은 객체 지향 애플리케이션을 개발할 수 있게 도와주는 프레임워크**다.

자바의 가장 큰 특징이 객체 지향이고, 스프링은 그 특징을 살려내기 위한 도구다. IoC와 DI도 그 자체가 목적이 아니라 **다형성을 편하게 쓰기 위한 장치**다.

## 다형성 — 역할과 구현의 분리

객체 지향의 특징으로 추상화·캡슐화·상속·다형성을 꼽지만, 실질적으로 가장 중요한 건 **다형성**이다.

세상을 **역할**과 **구현**으로 나눠 보면 이해가 쉽다.

- 운전자는 **자동차라는 역할**만 알면 된다
- 자동차의 구현은 K3든 아반떼든 테슬라든 상관없다
- 새 차가 나와도 운전자는 새로 배울 게 없다

자바에서는 이렇게 대응된다.

| 개념 | 자바 |
|---|---|
| 역할 | 인터페이스 |
| 구현 | 인터페이스를 구현한 클래스 |

역할과 구현을 나누면 이런 게 가능해진다.

- 클라이언트는 인터페이스만 알면 된다
- 구현 내부 구조를 몰라도 되고, 그게 바뀌어도 영향받지 않는다
- 구현 대상 자체를 갈아 끼워도 영향받지 않는다

```java
interface MemberRepository {
    void save(String memberId);
}

class MemoryMemberRepository implements MemberRepository {
    public void save(String memberId) {
        System.out.println("Memory에 저장: " + memberId);
    }
}

class JdbcMemberRepository implements MemberRepository {
    public void save(String memberId) {
        System.out.println("JDBC를 통해 저장: " + memberId);
    }
}

class MemberService {
    private final MemberRepository memberRepository;

    MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;   // 역할에 의존
    }

    void save(String memberId) {
        memberRepository.save(memberId);
    }
}
```

`MemberService`는 어떤 저장소를 쓰는지 모른다. 실행 시점에 무엇을 넣어주느냐로 동작이 바뀐다. **이게 다형성의 본질이다 — 클라이언트를 바꾸지 않고 서버 구현을 바꾼다.**

### 다형성의 한계

역할(인터페이스) 자체가 바뀌면 클라이언트와 서버 양쪽에 큰 변경이 생긴다. 자동차를 비행기로 바꾸라는 요구가 오면 방법이 없다. 그래서 **인터페이스를 안정적으로 설계하는 것**이 결국 관건이다.

## SOLID — 좋은 객체 지향 설계의 5원칙

로버트 마틴이 정리한 다섯 가지다.

### SRP · 단일 책임 원칙

한 클래스는 하나의 책임만 가진다. "하나의 책임"이 모호한데, **판단 기준은 변경이다.** 변경했을 때 파급 효과가 작으면 잘 지킨 것이다.

### OCP · 개방-폐쇄 원칙

확장에는 열려 있고 변경에는 닫혀 있어야 한다. 다형성으로 달성한다.

```java
// 위반 — 언어를 추가하려면 이 클래스를 고쳐야 한다
class Greeting {
    void greet(String type) {
        if ("English".equals(type)) System.out.println("Hello!");
        else if ("Spanish".equals(type)) System.out.println("Hola!");
    }
}
```

```java
// 준수 — 새 언어는 새 클래스를 추가하면 되고, Greeting은 그대로다
interface Language { void greet(); }

class English implements Language {
    public void greet() { System.out.println("Hello!"); }
}

class Greeting {
    void greet(Language language) { language.greet(); }
}
```

### LSP · 리스코프 치환 원칙

자식 클래스는 부모의 규약을 지켜야 한다. **컴파일이 되는 것과는 다른 얘기다.**

```java
class Car {
    protected int speed;
    void accelerate() { this.speed += 100; }
}

class SuperCar extends Car {
    @Override
    void accelerate() { this.speed -= 100; }   // 컴파일은 되지만 LSP 위반
}
```

액셀은 앞으로 가라는 기능인데 뒤로 가게 구현했다. 컴파일러는 잡아주지 않는다.

### ISP · 인터페이스 분리 원칙

범용 인터페이스 하나보다 특정 클라이언트용 인터페이스 여럿이 낫다. 자동차 인터페이스를 **운전 인터페이스**와 **정비 인터페이스**로 나누면, 정비 쪽이 바뀌어도 운전자 클라이언트는 영향받지 않는다.

### DIP · 의존관계 역전 원칙

**추상화에 의존하고 구체화에 의존하지 않는다.** 구현 클래스가 아니라 인터페이스에 의존하라는 뜻이다.

```java
public class MemberService {
    // DIP 위반 — 인터페이스에 의존하는 것 같지만 구현 클래스도 직접 고르고 있다
    private MemberRepository memberRepository = new MemoryMemberRepository();
}
```

`MemberRepository`라는 역할에 의존하는 것처럼 보이지만, `new MemoryMemberRepository()`로 구현체를 직접 선택하고 있다. 저장소를 바꾸려면 이 코드를 고쳐야 한다.

## 그래서 왜 스프링이 필요한가

여기가 이 노트의 결론이다.

- 객체 지향의 핵심은 다형성이다
- 그런데 **다형성만으로는 부품 갈아 끼우듯 개발할 수 없다**
- 구현 객체를 바꾸면 클라이언트 코드도 같이 바뀐다 (위 DIP 위반 예시)
- 즉 **다형성만으로는 OCP와 DIP를 지킬 수 없다**

무언가 더 필요하다. 객체를 만들고 연결하는 조립 책임을 클라이언트 밖으로 빼면 되는데, 순수 자바로도 `AppConfig` 같은 조립 클래스를 두면 지킬 수 있다. 스프링의 **DI 컨테이너**는 그 조립을 대신 해주는 것이다. 클라이언트는 인터페이스만 알면 되고 구현체 선택은 바깥에서 결정된다.

## 스프링 생태계

스프링은 하나의 기술이 아니라 여러 기술의 묶음이다.

| | |
|---|---|
| 스프링 프레임워크 | 핵심. DI 컨테이너, AOP, MVC, 트랜잭션, JDBC/ORM 지원 |
| 스프링 부트 | 위 기술들을 편하게 쓰게 해줌. 톰캣 내장, starter 의존성, 자동 구성 |
| 스프링 데이터 | CRUD를 편하게 |
| 스프링 시큐리티 | 인증·인가 |
| 스프링 배치 / 세션 / 클라우드 / REST Docs | 각 영역 지원 |

"스프링"이라는 단어는 문맥에 따라 DI 컨테이너를 뜻하기도, 프레임워크를 뜻하기도, 생태계 전체를 뜻하기도 한다.

## 더 볼 것

- [웹 서버와 WAS, 그리고 서블릿](/wiki/web-server-was-and-servlet/)
- [MVC 패턴](/wiki/mvc-pattern/)
