---
title: 'MVC 패턴 — 무엇을 나누고, 무엇에 의존하면 안 되는가'
description: 'Model·View·Controller를 나누는 이유와, 셋 사이의 의존 방향 규칙. 코드로 지키는 방법까지.'
topic: 'cs'
tags: ['MVC', '디자인패턴', 'Java', '아키텍처']
created: 2023-06-11
updated: 2026-08-29
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

## 의존 방향 — 여기가 진짜 규칙이다

MVC를 "세 개로 나눈다"로만 이해하면 금방 무너진다. 실제로 지켜야 하는 건 **누가 누구에게 의존해도 되는가**다.

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

**2. View는 Model에만 의존한다.** Controller에는 의존하면 안 된다.

```java
public class OutputView {
    public void printProfile(Student student) {
        System.out.println("내 이름은 " + student.getName() + "입니다.");
        System.out.println("내 나이는 " + student.getAge() + "입니다.");
    }
}
```

**3. View가 Model에서 받는 데이터는 "사용자마다 달라지는 것"만이다.** 쇼핑몰이라면 고객 이름·주소는 Model에서 받지만, 고객과 무관하게 고정된 문구는 받지 않는다.

**4. Controller는 Model과 View 양쪽에 의존해도 된다.** 잇는 게 역할이니 당연하다.

**5. View가 Model의 데이터를 받을 때는 반드시 Controller를 거친다.**

```java
public class Controller {
    public static void main(String[] args) {
        Student student = new Student("기철", 25);
        OutputView.printProfile(student);
    }
}
```

## 스프링에서는

`@RestController`가 Controller, 반환하는 객체가 Model에 해당한다.

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
