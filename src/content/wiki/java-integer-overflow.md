---
title: 'Java 정수 오버플로는 예외를 던지지 않는다'
description: 'int 범위를 넘으면 조용히 부호가 뒤집힌다. 금액을 int로 두면 약 21억에서 음수가 된다.'
topic: 'java'
tags: ['Java', '오버플로', 'BigDecimal']
created: 2026-08-12
updated: 2026-08-29
status: 'growing'
---

## 범위

```
Integer.MIN_VALUE = -2,147,483,648
Integer.MAX_VALUE =  2,147,483,647   (약 21억)
Long.MIN_VALUE    = -9,223,372,036,854,775,808
Long.MAX_VALUE    =  9,223,372,036,854,775,807  (약 922경)
```

## 넘으면 어떻게 되는가

예외가 없다. 한 바퀴 돌아 음수가 된다.

```java
int max = Integer.MAX_VALUE;   //  2147483647
System.out.println(max + 1);   // -2147483648
```

2의 보수 표현에서 최상위 비트가 부호 비트다. 최댓값에 1을 더하면 부호 비트가 켜지면서 최솟값으로 넘어간다. 자릿수가 잘리는 게 아니라 **부호가 뒤집힌다.**

터지지 않으므로 로그에도 안 남고 값이 조용히 틀린 채로 흘러간다.

## 터지게 하려면

```java
Math.addExact(a, b);   // 넘치면 ArithmeticException
Math.multiplyExact(a, b);
Math.toIntExact(longValue);
```

조용히 틀리는 것보다 터지는 편이 나은 계산에는 이쪽을 쓴다.

## 금액에는 무엇을 쓰는가

`double`은 쓰지 않는다. 십진 소수를 이진으로 정확히 표현할 수 없어 오차가 쌓인다.

```java
System.out.println(0.1 + 0.2);        // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3); // false
```

`BigDecimal`을 쓰되 두 가지를 주의한다.

```java
new BigDecimal(0.1);      // 0.1000000000000000055511151231257827...  (오차를 그대로 받는다)
new BigDecimal("0.1");    // 0.1
BigDecimal.valueOf(0.1);  // 0.1

new BigDecimal("1.0").equals(new BigDecimal("1.00"));    // false — 스케일까지 본다
new BigDecimal("1.0").compareTo(new BigDecimal("1.00")); // 0 — 값 비교는 이쪽
```

DB 컬럼이 Oracle `NUMBER`라면 Java 쪽 대응 타입은 `BigDecimal`이다. 컬럼의 표현 범위에 타입을 맞춰야 "지금은 안 넘는다"는 조건에 기대지 않게 된다.

## 더 볼 것

- 실제로 금액이 음수로 찍혔던 사례: [VO 필드 타입 하나가 만든 정수 오버플로](/posts/integer-overflow-negative-amount/)
