---
date: '2023-04-06'
title: '타입스크립트 - 4. Advanced Typing Concepts'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: '타입 가드, 식별된 공용체 ,함수 오버로드'
thumbnail: './Typescript_logo.png'
---

## Intersection Types

- 인터섹션 타입(Intersection Type)은 두 개 이상의 타입을 결합하여 하나의 타입으로 만드는 기능

```tsx
type Admin = {
  name: string;
  privileges: string[];
};

type Employee = {
  name: string;
  startDate: Date;
};

**// {name:string, privileges:string[], startData:Date}**
**type ElevatedEmployee = Admin & Employee;** 

const e1: ElevatedEmployee = {
  name: "Max",
  privileges: ["create-server"],
  startDate: new Date(),
};

type Combination = string | number;
type Numeric = number | boolean;
**type Universal = Combination & Numeric; // number**
```

## Type Guards

- 타입 가드(Type Guard)는 특정 코드 블록 내에서 변수의 타입을 좁히거나 확인하는데 사용되는 코드 패턴
- 타입 가드를 사용하면 런타임에 변수의 타입을 체크하여 컴파일 타임에 타입 안정성을 보장가능
- 유니온 타입(Union Type)이 제공하는 유연성을 활용하면서 런타임에 정확한 타입을 알아내고 코드가 올바르게 실행되도록 보장하는 기능

### **2가지 타입 가드 방법**

1. **사용자 정의 타입 가드 함수**
    - 사용자 정의 함수를 사용하여 타입 가드를 만들 수 있다. 이 함수는 인자를 받고, 그 인자의 타입을 확인하는 조건문을 포함하고 반환 값으로 boolean 타입을 사용한다.
    - 반환 타입으로 타입 프레디케이트(Type Predicate)를 사용한다. `animal(함수인자) is cat(검사하려는 타입`)

    ```tsx
    interface Cat {
      type: 'cat';
      meow(): void;
    }
    
    interface Dog {
      type: 'dog';
      bark(): void;
    }
    **function isCat(animal: Cat | Dog): animal is Cat {
      return animal.type === 'cat';
    }
    function makeSound(animal: Cat | Dog): void {
      if (isCat(animal)) {
        animal.meow(); // animal은 이 스코프에서 Cat 타입으로 간주됩니다.
      } else {
        animal.bark(); // animal은 이 스코프에서 Dog 타입으로 간주됩니다.
      }
    }**
    ```

2. **타입스크립트 내장 타입 가드 기능**
    - **typeof : 특정 변수의 타입 확인**

    ```tsx
    function doSomething(value: string | number) {
      if (typeof value === 'string') {
        // 여기에서 value의 타입은 string입니다.
        console.log(value.toUpperCase());
      } else {
        // 여기에서 value의 타입은 number입니다.
        console.log(value.toFixed(2));
      }
    }
    ```

    - **instanceof : 특정 객체가 특정 클래스 인스턴스인지 확인 가능**

    ```tsx
    class Dog {
      bark() {}
    }
    
    class Cat {
      meow() {}
    }
    
    function makeNoise(animal: Dog | Cat) {
      if (animal instanceof Dog) {
        // 여기에서 animal의 타입은 Dog입니다.
        animal.bark();
      } else {
        // 여기에서 animal의 타입은 Cat입니다.
        animal.meow();
      }
    }
    ```

## Discriminated Unions(식별된 공용체)

- 객체와 유니언 타입을 사용한 작업시 사용할 수 있는 유용한 패턴
- 인터페이스 또는 클래스와 같은 객체에 공통 속성을 추가하여 해당 객체를 더 쉽게 구분할 수 있게 함
- 타입 가드를 구현하기 더 쉽게 만들어 줍니다.
- interface는 JS로 컴파일 되지 않았기 때문에 instance of를  사용하면 작동하지 않는다.
- ‘데이터’ in ‘객체’로 속성의 존재 여부를 확인하거나 instanceof를 사용하는 대신, 존재하는 속성을 사용하여 작업 중인 객체의 유형을 확인
- **사용단계**
    1. 공통의 프로퍼티(일반적으로 **`kind`**, **`type`**, **`tag`** 등의 이름으로 사용됨)를 가진 여러 객체 타입을 정의한다. 이 프로퍼티의 값은 리터럴 타입을 사용하여 고유하게 설정한다.
    2. 해당 객체 타입들을 유니온 타입으로 결합한다.
    3. 타입 가드를 사용하여 공통 프로퍼티를 기반으로 각 타입을 구분하고 처리한다.

```tsx
// 각 도형 타입을 정의합니다.
interface Circle {
  **kind: 'circle';**
  radius: number;
}

interface Square {
  **kind: 'square';**
  sideLength: number;
}

interface Triangle {
  **kind: 'triangle';**
  base: number;
  height: number;
}

// 도형 유니온 타입을 생성합니다.
**type Shape = Circle | Square | Triangle;**

// 각 도형의 넓이를 계산하는 함수입니다.
function getArea(shape: Shape): number {
  switch **(shape.kind)** {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.sideLength ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
  }
}
```

## Type Casting

- `<input type="text" id="user-input">` 아이디가 "userInput"인 텍스트 입력 요소
- 개발자는 HTML 코드에서 이러한 요소들의 ID를 할당했지만, TypeScript는 HTML 파일을 분석하지 않기 때문에 이를 알지 못한다. 따라서 getElementById 메서드를 사용하여 요소를 선택하면, TypeScript는 그것이 단순히 HTML 요소 또는 null임을 추론한다. 이는 우리가 입력 요소의 value를 설정하려고 할 때 문제가 된다.
- 이 문제를 해결하기 위해 "typecasting"이라는 기능을 사용할 수 있음.
- **typecasting은 TypeScript에게 특정 요소의 타입을 명시적으로 알려주는 것.**
- **런타임에 영향을 주지 않고(실제로 타입 변환 x) 컴파일 시점 타입 체크만을 위한 것.**
- **2가지 typecasting 방법**
    1. **angle-bracket표기법** : 대상 앞에 꺾쇠 괄호로 묶은 타입을 추가(예: **`<HTMLInputElement>`**)
        1. 요소 뒤의 !를 사용하여 TypeScript에게 특정 표현식이 null이 아님을 알려주는 방법
    2. **as 키워드 :** 대상 뒤에 **`as`** 키워드를 사용하고 타입을 지정 (예: **`as HTMLInputElement`**)
        1. 만약 표현식이 null일 수도 있다면, 대신 if 문을 사용하여 null 여부를 확인하고 해당 요소를 사용할 수 있다. 이때, 괄호를 사용하여 표현식을 묶고 타입캐스팅을 적용한 후 속성에 접근해야됨.

```tsx
// index.html
// ...생략
  <body>
    **<input type="text" id="user-input" />**
  </body>
</html>

// app.ts
//1번방식
//const userInputElement = <HTMLInputElement>document.getElementById('user-input')!;
//2번방식
const userInputElement = document.getElementById('user-input');

if (userInputElement) {
  (userInputElement as HTMLInputElement).value = 'Hi there!';
}
```

## Index

- 인덱스 타입(Index Types)은 객체의 속성에 대한 유연성을 제공하는 타입스크립트의 기능
- 객체의 프로퍼티에 대한 타입을 정의할 때 사용하는 기능
- 인덱스 타입을 사용하면 속성 이름과 속성 수를 사전에 알지 못하는 객체를 생성할 수 있으며, 이를 통해 사용자 입력을 검증하는 애플리케이션에서 다양한 입력 필드에 따라 서로 다른 오류 메시지를 저장하고 표시하는 것이 가능하다.

    ```tsx
    // { email: 'Not a valid email', username: 'Must start with a character!' }
    interface ErrorContainer { 
      [prop: string]: string;
    }
    
    const errorBag: ErrorContainer = {
      email: 'Not a valid email!',
      username: 'Must start with a capital character!'
    };
    ```

    1. **인덱스 시그니처 (Index Signature)**
  - 인덱스 시그니처는 객체 타입의 인덱스 (프로퍼티 키)와 그에 해당하는 값을 정의한다. 인덱스 시그니처는 다음과 같이 정의할 수 있다.

        ```tsx
        interface StringDictionary {
          [key: string]: string;
        }
        
        let dict: StringDictionary = {
          hello: 'world',
          foo: 'bar',
        };
        ```

  - 인덱스 시그니처는 다른 타입의 키와 값으로 구성된 객체를 정의할 수도 있다. 예를 들어, 다음은 숫자 키와 문자열 값으로 구성된 객체를 나타낸다.

        ```tsx
        interface NumberDictionary {
          [key: number]: string;
        }
        ```

    1. **키 타입 (Key Type):** 타입스크립트에서는 **`keyof`** 연산자를 사용하여 객체의 키 타입을 얻을 수 있다.
  - **`PersonKeys`** 타입은 **`Person`** 객체의 키 타입을 나타내며, "name"과 "age" 중 하나를 가질 수 있다.

        ```tsx
        interface Person {
          name: string;
          age: number;
        }
        
        type PersonKeys = keyof Person; // "name" | "age"
        ```

    1. **인덱스 접근 (Indexed Access):** 타입스크립트에서는 인덱스 접근 연산자 **`[]`**를 사용하여 객체의 프로퍼티 값을 가져올 수 있다. 예를 들어, 다음과 같이 사용할 수 있다.
  - **`NameType`**은 **`Person`** 객체의 **`name`** 프로퍼티의 타입 (string)을 나타내며, **`AgeType`**은 **`age`** 프로퍼티의 타입 (number)을 나타낸다.

        ```tsx
        type NameType = Person['name']; // string
        type AgeType = Person['age']; // number
        ```

## Function Overloads

- 타입스크립트가 자체적으로 반환 타입을 정확히 추론하지 못하는 경우에 유용
- 함수 오버로드를 통해 인자가 4가지 조합을 들어올 때 반환 타입 유형 4가지를 지정했음

```tsx
**function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: string, b: number): string;
function add(a: number, b: string): string;
function add(a: Combinable, b: Combinable) {**
  if (typeof a === 'string' || typeof b === 'string') {
    return a.toString() + b.toString();
  }
  return a + b;
}

const result = add('Max', ' Schwarz');
result.split(' ');
```

### Optional Chaining(선택적 체이닝)

- 일반적으로 데이터를 가져올 때 중첩된 객체 내 값이 있는지 없는지 알 수 없을 때, 자바스크립트로 다음과 같이 사용하곤 한다.

```tsx
const fetchedUserData={
 id: 'u1',
 name: 'Max'
}
fetchedUserData.job && fetchedUserData.job.title
```

- 하지만, 타입스크립트에서 선택적 체이닝을 통해 정의되어 있는지 여부가 확실치 않은 요소 다음에 ?를 추가하면 된다(TS 3.7버전이상부터 지원). 이를 통해, 객체 데이터 중첩된 속성과 객체에 안접한게 접근 가능하다.
- ?는 if문으로 컴파일 된다.

```tsx
fetchedUserData?.job.title
```

### Nullish Coalescing(Null 병합 연산자)

- 데이터나 입력값이 있는데 그게 null인지 undefined인지, 유효한 값인지 알 수 없는 경우,
- 보통 논리적 연산자 OR로 구현할 수 있지만, 앞의 userInput값이 null, undefined가 아닌 빈 문자열이라도 거짓 값으로 처리되어 기본 fallback 값이 적용되는 문제가 있다(빈문자열 그대로 사용하고 싶을 때 문제가 됨).

```tsx
const userInput = '';

const storedData = userInput || 'Default';

console.log(storedData); // Default

// 빈문자열, 0이 아닌 경우, null이나 undefined 둘 중 하나라면 fallback 값(Default) 사용
//=> ?? (null 병합 연산자) 사용
const storedData = userInput ??  'Default';

```
