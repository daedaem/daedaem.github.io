---
date: '2023-04-03'
title: '타입스크립트 - 3.2 Interface'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: 'Interface, 추상 클래스, 상속'
thumbnail: './TypescriptStudy/Typescript_logo.png'
---

# Interface

- 인터페이스는 JavaScript와 같은 동적 타입 언어 환경에서는 다뤄지지 않지만 정적 타입 언어인 TypeScript에서는 타입 검사가 요구 되므로 인터페이스를 지원한다.
- **객체의 구체적 값이 아니라 구조를 정의하는데 사용,**
- 인터페이스는 interface 키워드를 사용해 다음과 같이 정의하여 사용 할 수 있음.

```tsx
**interface Person {
  name: string;
  age: number;

  greet(phrase: string): void;
}**

let user1: Person;

user1 = {
  name: "Haesung",
  age: 32,
  greet(phrase: string) {
    console.log(phrase + " " + this.name);
  },
};

user1.greet("Hi - I am"); //Hi - I am Haesung
```

## 클래스와 인터페이스 사용

- 구체적인 구현이 아닌 서로 다른 클래스 간의 기능을 공유하기 위해 주로 사용됨
- 인터페이스 내에 구현이나 값이 아니라 구조나 클래스가 가져야할 기능을 입력해야함.
- 인터페이스를 어떤 상수나 변수의 타입으로 사용하여 인터페이스 타입을 기반으로 하는 다른 타입의 다른 클래스를 저장할 수 있다.

```tsx
**interface Greetable {
  name: string;

  greet(phrase: string): void;
}**

**class Person implements Greetable {**
  name: string;
  age = 30;

  constructor(n: string) {
    this.name = n;
  }

  greet(phrase: string) {
    console.log(phrase + ' ' + this.name);
  }
}

**let user1: Greetable;**

user1 = new Person('Max');

user1.greet('Hi there - I am');
console.log(user1);
```

### 사용자 정의 타입과 차이점

- 인터페이스는 객체 구조를 설명하기 위해서만 사용한다.
- 인터페이스로 할 수 있는 것을 사용자 정의 타입으로도 할 수 있는 작업은 클래스 내에 인터페이스를 구현하는 것

### 상속과의 차이점

- 상속은 하나의 클래스로부터 상속 받지만, **Interface는 쉼표로 구분하여 여러 개를 구현할 수 있다.**

### 추상클래스와의 차이점

- 인터페이스는 구현 세부사항이 전혀 없는 반면, 추상 클래스는 덮어써야 했던 부분과 구체적인 구현 부분을 혼합할 수 있음

## 왜 인터페이스를 사용하는가?

- 클래스가 greet 메서드를 가지고 있고 다른 클래스도 이를 가지고 있는지 확인하고자 할 때, 메서드가 존재하는 인터페이스를 implement하면 된다. 그러면 클래스 간 기능을 쉽게 공유할 수 있다.
- interface를 사용하면 user1에서 객체나 클래스 내부에 무엇이 있든 상관없이 user1에 Greetable의 name 프로퍼티, greet라는 메서드가 있다는 것을 알 수 있다.

```tsx
interface Greetable {
  name: string;

  greet(phrase: string): void;
}

class Person implements Greetable {
  name: string;
  age = 30;

  constructor(n: string) {
    this.name = n;
  }

  greet(phrase: string) {
    console.log(phrase + " " + this.name);
  }
}

**let user1: Greetable;**

user1 = new Person("Max");

user1.greet("Hi there - I am");
console.log(user1);
```

## Interface의 readonly

- 인터페이스 내의 속성에 readonly를 붙여 객체 내 속성이 한번만 설정되고 읽기전용으로 설정하여 객체 초기화되면 변경할 수 없도록 할 수 있다.

```tsx
interface Named {
  **readonly** name: string;
}

class Person implements Greetable {
  name: string;
  age = 30;

  constructor(n: string) {
    this.name = n;
  }

  greet(phrase: string) {
    console.log(phrase + ' ' + this.name);
  }
}

let user1: Greetable;

user1 = new Person('Max');
// user1.name = 'Manu'; // readonly 이므로 에러
```

## Interface extends

- 클래스는 하나의 클래스로부터만 상속할 수 있다.
- 클래스와 달리 **인터페이스는 여러 인터페이스로부터 상속가능하다.**
- 어떤 객체, 클래스는 Named를 구현하고 다른 객체, 클래스는 Greetable을 구현하여 greet과 name 모두를 입력해야 할도록 할 수 있다. 이러한 경우에 인터페이스를 나누고 확장하는 것이 유용하다.

```tsx
interface Named {
  readonly name: string;
}

interface Greetable extends Named, /*AnotherInterface*/ {
  greet(phrase: string): void;
}

class Person implements Greetable {
  name: string;
  age = 30;

  constructor(n: string) {
    this.name = n;
  }

  greet(phrase: string) {
    console.log(phrase + " " + this.name);
  }
}

let user1: Greetable;

user1 = new Person("Max");

user1.greet("Hi there - I am");
console.log(user1);
```

## 함수 타입으로서 인터페이스

- 인터페이스는 함수의 구조를 정의하는데에도 사용 할 수 있다.
- 아래와 같이 이름 없는 익명함수로 인터페이스를 함수타입으로 사용할 수도 있다.

```tsx
// type AddFn = (a: number, b: number) => number;
//사용자 정의 함수
interface AddFn {
  (a: number, b: number): number;
}
let add: AddFn;

add = (n1: number, n2: number) => {
  return n1 + n2;
};
```

## 선택적 매개변수 & 속성

- 매개변수가 있을지 확실하지 않을 때 ?를 붙여 선택속성을 부여할 수 있다.
- 클래스와 인터페이스, 그리고 constructor 목록에서도 선택적 속성이 된다.

```tsx
// type AddFn = (a: number, b: number) => number;
interface AddFn {
  (a: number, b: number): number;
}

let add: AddFn;

add = (n1: number, n2: number) => {
  return n1 + n2;
};

interface Named {
  **readonly name?: string;**
  **outputName?: string;
// greet?(): void;**
}

interface Greetable extends Named {
  greet(phrase: string): void;
}

class Person implements Greetable {
  name?: string;
  age = 30;

  **constructor(n?: string) {**
    if (n) {
      this.name = n;
    }
  }

  greet(phrase: string) {
    if (this.name) {
      console.log(phrase + ' ' + this.name);
    } else {
      console.log('Hi!');
    }
  }
}

let user1: Greetable;

user1 = new Person();
// user1.name = 'Manu';

user1.greet('Hi there - I am');
console.log(user1);
```

## 자바스크립트로 인터페이스 컴파일

- 자바스크립트로 컴파일되고나면 인터페이스에 관련된 코드는 찾아볼 수 없다.
- 개발 및 컴파일 도중에만 사용할 수 있는 타입스크립트 전용 기능
- 명확하게 구조화된 코드를 작성하는데 도움이 되는 순수 개발 기능이다.

## Q&A

**Q. 클래스와 인터페이스의 차이점은?**

A. 인터페이스는 인스턴스화 할 수 없고 컴파일 되지 않는 반면, 클래스는 인스턴스화 할 수 있으며 컴파일 된다.

**Q. 다음 예시 중 인터페이스에 대한 유효한 사용 사례가 아닌 것은 무엇인가요?**

- 구현 클래스가 특정 메소드 또는 속성을 갖도록 강요하는 “계약”을 만들고자 합니다.
- 객체의 구조를 정의하고자 합니다.
- ~~유니온 타입을 저장하고자 합니다.~~
  - → 인터페이스는 객체(또는 함수 타입)을 서술하지만 유니온 타입과 같은 임의 타입을 저장하거나 서술하지는 않는다.
