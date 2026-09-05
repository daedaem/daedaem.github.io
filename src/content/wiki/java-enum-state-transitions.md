---
draft: false
title: 'enum은 값의 종류를 제한하지만 상태 전이를 보장하지 않는다'
description: '허용하는 상태 목록과 상태 사이의 이동 규칙을 구분하고, 한 메서드에서 전이를 검사하는 Java 예제.'
topic: 'java'
tags: ['Java', 'enum', '상태 머신', '테스트']
created: 2026-09-05
status: 'growing'
---

문자열로 상태를 다루면 오타도 정상적인 문자열이다. `enum`으로 바꾸면 정의하지 않은 상수를 코드에서 참조하는 실수는 컴파일러가 잡을 수 있다. 하지만 `DONE`에서 `READY`로 돌아가도 되는지는 타입만으로 알 수 없다. 값의 집합과 전이의 규칙은 별개다.

이 문서는 학습용 예제다. 특정 프로젝트에서 구현한 결과나 운영 성과를 설명하지 않는다.

## 상태 목록과 전이 규칙

할 일의 상태를 `READY`, `RUNNING`, `DONE`으로 정해도 다음 코드는 컴파일된다.

```java
State state = State.DONE;
state = State.READY;
```

업무 규칙상 완료를 되돌릴 수 없다면, 허용하는 이동을 검사하는 곳이 필요하다. 아래 예제는 `READY → RUNNING → DONE`만 허용한다. 같은 상태로 다시 바꾸는 요청도 거부한다. 같은 요청을 성공으로 처리할지는 별도의 정책이다.

```java
public class EnumStateExample {
    enum State {
        READY, RUNNING, DONE;

        boolean canMoveTo(State next) {
            if (next == null) return false;
            return switch (this) {
                case READY -> next == RUNNING;
                case RUNNING -> next == DONE;
                case DONE -> false;
            };
        }
    }

    static final class Task {
        private State state = State.READY;

        void moveTo(State next) {
            if (!state.canMoveTo(next)) {
                throw new IllegalStateException(state + " -> " + next);
            }
            state = next;
        }
    }

    public static void main(String[] args) {
        Task task = new Task();
        task.moveTo(State.RUNNING);
        task.moveTo(State.DONE);
        try {
            task.moveTo(State.READY);
            throw new AssertionError("완료 상태를 되돌리면 안 된다.");
        } catch (IllegalStateException expected) {
            System.out.println("잘못된 전이 차단");
        }
    }
}
```

예제는 Java 17 이상을 기준으로 한다. 외부에서 상태 필드를 직접 바꾸는 setter를 열어 두면 이 검사를 우회할 수 있으므로, 상태 변경이 `moveTo`를 거치도록 해야 한다.

## 고르지 않은 방법

서비스 메서드마다 `if`를 둘 수도 있다. 한 경로만 있으면 단순하지만, 경로가 늘 때 검사를 빠뜨리기 쉽다. 예제에서는 전이 규칙을 enum에 두고 객체의 변경 메서드가 검사하도록 했다.

상태마다 행동이 크게 다르면 상태별 클래스로 분리하는 방법도 있다. 상태 세 개와 간단한 규칙만 있는 예제에서는 그 구조까지 만들 필요가 없다. 규칙이 자주 바뀌거나 사용자 설정으로 달라진다면 enum에 고정하는 선택부터 다시 검토해야 한다.

## 타입이 해결하지 않는 것

- `enum` 참조에도 `null`이 들어갈 수 있다. 외부 입력과 필수 값 검증은 여전히 필요하다.
- 위 예제의 `switch`는 모든 경우를 다뤄야 하는 **표현식**이다. 모든 기존 `switch` 문에서 `default`만 빼면 누락이 컴파일 오류가 된다고 일반화하면 안 된다.
- DB와 API가 어떤 문자열·숫자로 상태를 저장하고 전달하는지는 별도의 계약이다. enum으로 바꿨다는 이유만으로 데이터 이전이 불필요하다고 단정할 수 없다.
- 두 요청이 동시에 같은 상태를 읽는 문제는 이 Java 객체의 검사만으로 해결되지 않는다. 영속화 단계의 동시성 제어도 별도로 설계해야 한다.

다음 보완에서는 각 상태 쌍의 허용 여부를 표 기반 테스트로 확인하고, 저장 값과 API 표현을 바꿀 때의 호환성을 정리한다.

## 참고

- [Oracle Java Tutorials — Enum Types](https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html)
- [Oracle — Switch Expressions](https://docs.oracle.com/en/java/javase/17/language/switch-expressions-and-statements.html)
