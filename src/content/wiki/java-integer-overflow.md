---
title: 'Java 정수 오버플로는 예외를 던지지 않는다'
description: 'int 범위를 넘으면 예외 없이 32비트 값이 순환한다. 금액과 카운트의 범위에 맞는 타입을 고르는 법.'
topic: 'java'
tags: ['Java', '오버플로', 'BigDecimal']
created: 2026-08-12
updated: 2026-09-04
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

예외가 없다. 결과의 하위 32비트만 남아 값이 순환한다.

```java
int max = Integer.MAX_VALUE;   //  2147483647
System.out.println(max + 1);   // -2147483648
```

2의 보수 표현에서 최상위 비트가 부호 비트다. 최댓값에 1을 더하면 최솟값으로 넘어간다. 다만 임의의 오버플로 결과가 항상 음수가 되거나 부호만 뒤집히는 것은 아니다. **2³²를 법으로 한 나머지처럼 순환한다**고 이해하는 편이 정확하다.

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

Oracle `NUMBER`를 Java로 받을 때는 precision과 scale, 실제 업무 범위를 먼저 확인한다. 소수나 큰 정밀도가 필요한 금액은 보통 `BigDecimal`, scale이 0이고 `long` 범위가 보장되는 정수 카운트는 `long`을 쓸 수 있다. 컬럼의 표현 범위에 타입을 맞춰야 "지금은 안 넘는다"는 조건에 기대지 않게 된다.

## 더 볼 것

- 실제로 금액이 음수로 찍혔던 사례: [VO 필드 타입 하나가 만든 정수 오버플로](/posts/integer-overflow-negative-amount/)
