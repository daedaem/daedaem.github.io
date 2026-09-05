---
draft: false
title: 'MVC 패턴'
description: 'Model·View·Controller를 나누는 이유와, 셋 사이의 의존 방향 규칙. 코드로 지키는 방법까지.'
topic: 'cs'
tags: ['MVC', '디자인패턴', 'Java', '아키텍처']
created: 2023-06-11
updated: 2026-09-04
status: 'stable'
---

## MVC란

애플리케이션을 세 영역으로 나누고 각각에 고유한 역할을 주는 설계 방식이다.

| | 역할 |
|---|---|
| **Model** | 데이터와 그것을 다루는 로직. DB 연결, 쿼리 실행 |
| **View** | 사용자가 보는 결과 화면 |
| **Controller** | Model과 View를 잇는다. 입력을 받아 Model에 요청하고, 결과를 View에 전달 |

핵심 효과는 **도메인(비즈니스 로직) 영역과 UI 영역이 분리된다**는 것이다. 서로 영향을 주지 않으니 따로 고칠 수 있다.

## 왜 쓰는가

**관심사 분리.** 각 부분이 독립적으로 동작하므로 자기 역할에만 집중해 개발할 수 있다.

**재사용성과 유지보수성.** 독립적으로 개발·변경되니 코드를 재사용하기 쉽다.

**유연성.** 하나의 변경이 전체로 번지지 않는다. UI를 바꿔도 비즈니스 로직이나 데이터 접근 코드는 그대로다.

## 이 글에서 사용하는 의존 방향

MVC는 Smalltalk, 데스크톱 GUI, 서버 사이드 웹 프레임워크에서 서로 다른 형태로 발전했다. 따라서 모든 MVC에 통용되는 의존 방향 하나가 있는 것은 아니다. 여기서는 콘솔 애플리케이션과 서버 사이드 MVC를 설명할 때 쓰기 쉬운 다음 구조를 기준으로 한다.

```
Controller ──▶ Model
    │            ▲
    │            │
    └──────▶ View
```

**1. Model은 독립적이어야 한다.** Controller와 View에 의존하면 안 된다. Model 안에 화면이나 컨트롤러 관련 코드가 있으면 안 된다.

```java
public class Student {
    private final String name;
    private final int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}
```

데이터와 그걸 꺼내는 방법만 있다. 출력도 요청 처리도 없다.

**2. View는 화면 표현에 집중한다.** 이 예제에서는 Model 형태의 데이터를 받아 출력하고 Controller를 직접 호출하지 않는다.

```java
public class OutputView {
    public void printProfile(Student student) {
        System.out.println("내 이름은 " + student.getName() + "입니다.");
        System.out.println("내 나이는 " + student.getAge() + "입니다.");
    }
}
```

**3. 고정 문구와 표시 형식은 View에 두고, 요청마다 달라지는 데이터는 바깥에서 받는다.** 쇼핑몰이라면 고객 이름·주소는 전달받지만, 고객과 무관하게 고정된 문구까지 Model에 넣어 전달하지 않는다.

**4. Controller는 Model과 View 양쪽에 의존해도 된다.** 잇는 게 역할이니 당연하다.

**5. 이 예제에서는 Controller가 Model을 만들고 View에 전달한다.** 프레임워크에 따라 View가 Model의 변경을 관찰하는 고전 MVC처럼 흐름이 달라질 수 있다.

```java
public class Controller {
    public static void main(String[] args) {
        Student student = new Student("기철", 25);
        new OutputView().printProfile(student);
    }
}
```

## 스프링에서는

Spring MVC에서는 `@Controller`가 요청을 받고, `Model`에 담은 표시 데이터와 템플릿이 View를 구성한다. 여기서 Spring의 `Model`은 앞에서 말한 도메인 객체 하나와 같은 뜻이 아니라 **View에 전달할 속성 모음**이다. `@RestController`는 View 템플릿 대신 반환 객체를 메시지 컨버터로 응답 바디에 내보낸다.

```java
@RestController
public class ProductController {
    private final Product model;

    public ProductController() {
        this.model = new Product("Coffee", 5.99);
    }

    @GetMapping("/api/product")
    public Product getProduct() {
        return model;
    }
}
```

## 더 볼 것

- [스프링은 왜 만들어졌고, 객체 지향과 무슨 관계인가](/wiki/spring-and-object-oriented-design/)
- [웹 서버와 WAS, 그리고 서블릿](/wiki/web-server-was-and-servlet/)
