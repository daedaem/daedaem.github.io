---
slug: 'core-javascript-02-execution-context'
date: '2022-12-30T07:23:21Z'
updated: '2023-11-16T08:20:35Z'
title: '코어자바스크립트 ch2. 실행 컨텍스트'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'VariableEnvironment, LexicalEnvironment, ThisBinding'
thumbnail: './javascript.png'
legacyPath: "/230202_코어자바스크립트 ch 2. 실행컨텍스트/"
---

# 정리

### **컨텍스트(Context)?**

- 해당 코드의 배경이 되는 조건, 환경 정도를 뜻함

<br>

### **실행컨텍스트(Execution Context)?**

- 코드를 실행하는데 필요한 배경이 되는 조건, 환경

- 동일한 조건, 환경정보를 지니는 코드들이 있을 때, 그 조건, 환경 정보를 일컬어 실행 컨텍스트

동일한 조건/환경을 지니는 코드뭉치 4가지

- 전역공간, 함수, module, eval

~~eval은 논외고 전역 공간, 함수, module 모두 하나의 함수 공간으로 봐도 무방하다. 따라서 실행 컨텍스트는 함수를 실행할 때 필요한 환경 정보를 담은 객체라고 할 수 있다.~~

> **바로잡음(2026-09-04):** 전역 코드·함수 코드·`eval` 코드·모듈 코드는 명세에서 서로 다른 실행 컨텍스트를 만든다. 특히 ES 모듈은 함수 공간과 같지 않다. 실행 컨텍스트는 현재 코드를 평가·실행하는 데 필요한 상태를 담는 명세상의 기록이라고 이해한다.

<br>

### **콜스택 (call stack)**

- 현재 어떤 함수가 동작 중인지, 다음에 어떤 함수가 호출될 예정인지 등을 제어하는 자료구조

<br>

### **Execution Context**

- Variable Environment, Lexical Environment, this
- VariableEnvironment와 LexicalEnvironment에는 현재 환경과 관련된 식별자 정보들
- ~~VariableEnvironment는 식별자 정보를 수집하고, LexicalEnvironment는 각 식별자의 데이터를 추적한다. 실행 중 변수 값이 바뀌면 VariableEnvironment에는 반영되지 않고 LexicalEnvironment에만 반영된다.~~

> **바로잡음(2026-09-04):** 둘은 초기값과 변경값의 스냅샷을 나눠 보관하는 구조가 아니다. 현대 ECMAScript 명세에서 `LexicalEnvironment`와 `VariableEnvironment`는 각각 현재 어휘 선언과 `var` 선언에 쓰는 Environment Record를 가리키며, 코드 종류에 따라 같은 레코드일 수도 다를 수도 있다.

<br>

### **Lexical Environment**

- 어휘적/사전적 환경
- 실행컨텍스트를 구성하는 환경정보들을 모아 사전처럼 구성한 객체
- environmentRecord, outerEnvironmentReference
- environmentRecord
  - 현재 문맥의 식별자 정보를 수집하는 일 담당.
  - 실행컨텍스트가 처음 생성되는 순간에 제일 먼저 하는 일, **호이스팅**
  - 호이스팅 - 식별자 정보를 실행컨텍스트 맨 위로 끌어올리는 것
- outerEnvironmentReference
  - 현재 문맥에 관련 있는 외부 식별자 정보
  - 스코프 체인(scope chain)

# 세부내용

## 01 실행 컨텍스트란?

- 실행 컨텍스트 (execution context)는 실행할 코드에 제공할 환경 정보들을 모아놓은 객체
- 동일 환경에 있는 코드 실행 시, 환경 정보들을 모아 컨텍스트를 구성.
이를 콜 스택에 쌓았다가, 가장 Top에 있는 컨텍스트와 관련 있는 코드를 실행하는 식으로 전체 코드 환경과 순서를 보장함.
- 동일 환경, 즉 하나의 실행컨텍스트를 구성할 수 있는 방법으로 전역공간, eval() 함수, 함수 등이 있음.
- 자동으로 생성되는 전역공간과, eval을 제외하면, 흔히 실행컨텍스트를 구성하는 방법은 함수 실행

```jsx
// ----------------------------(1)
var a = 1; // 전역 컨텍스트
function outer () { // outer 컨텍스트
  function inner () { // inner 컨텍스트
    console.log(a); // undefined
    var a = 3;
  }
  inner(); // ----------------------(2)
  console.log(a); // 1
}
outer(); // ------------------------(3)
console.log(a); // 1
```

- 자바 스크립트 코드 실행 시
  - (1) 전역컨텍스트가 콜스택에 담김. 전역 컨텍스트관련 코드가 순차로 진행
  - (3) 에서 outer 함수를 호출하면 자바스크립트 엔진은 outer에 대한 환경 정보를 수집해서 outer 실행 컨텍스트를 생성 후 콜스택에 담는다.
  - 전역 컨텍스트 관련 코드 실행 일시 중단하고 outer 함수 내부 코드를 순차 실행
  - (2) 에서 inner 함수의 실행 컨텍스트가 콜스택의 가장 위에 담기면 outer 컨텍스트 관련 코드 실행 중단하고 inner 함수 내부 코드 순서대로 진행
  - inner 함수 실행 후 inner 실행 컨텍스트 콜스택에서 제거
  - 중단했던 (2)의 다음 줄부터 실행 - > (3)
  - 콜스택에 아무것도 남지 않으면 종료
  
> **이미지 안내(2026-09-04):** 외부 블로그 이미지 임베드는 제거했다. 위 실행 순서대로 전역 → `outer` → `inner` 컨텍스트가 스택에 쌓이고 역순으로 빠지는 그림이었다.

## 02 VariableEnvironment

- ~~VariableEnvironment에 담기는 내용은 LexicalEnvironment와 같지만 최초 실행 시의 스냅샷을 유지한다. 실행 컨텍스트를 만들 때 VariableEnvironment를 먼저 만들고 이를 복사해 LexicalEnvironment를 만든다.~~

> **바로잡음(2026-09-04):** 책의 학습용 비유다. 실제 명세에서는 두 필드가 Environment Record를 가리키며, 블록의 `let`·`const`와 함수·전역의 `var`가 서로 다른 환경에 기록될 수 있게 구분한다.
- LexicalEnvironment와 동일하게 **Environment Record**와 **Outer Environment Reference**로 구성

## 03 LexicalEnvironment

- **Environment Record**와 **Outer Environment Reference**로 구성
- environmentRecord와 호이스팅
  - 현재 컨텍스트 관련 코드 식별자 정보 저장.
  - 매개변수의 이름, 함수 선언, 변수명 등
  - 컨텍스트 내부 전체를 처음부터 끝까지 확인하며 순서대로 수집
    → 코드가 실행되기 전임에도 자바스크립트 엔진은 이미 해당 환경 속 코드 변수명을 알고 있음 → 호이스팅

    cf) 함수 선언문(function declaration)과 함수 표현식(function expression)

  - 함수 선언문은 function 정의부만 존재하고 별도 할당 명령 없는 것, 반드시 함수명 정의되어야함
  - 함수 표현식은 정의한 function을 별도의 변수에 할당하는것, 함수명 없어도 됨

    ```jsx
    function a() {} //함수 선언문. 함수명 a가 변수명
    a();//실행ok
    
    let b = function () {} //(익명)함수 표현식. 변수명 b가 함수명
    b();//실행ok
    
    let c = function d() {} //기명 함수 표현식. 변수명은 c 함수명은 d
    c();////실행ok
    d();//에러
    ```

    전역공간에 동명의 함수가 여러 존재하는 상황에서 함수 표현식으로 정의돼 있다면, 함수를 중복 선언하는 경우에 발생하는 문제 방지

- 스코프, 스코프 체인, outerEnvironmentReference
  - **스코프(scope),** 식별자에 대한 유효 범위
  - **스코프 체인(scope chain),** 식별자 유효범위를 안에서부터 바깥으로 차례로 검색해 나가는 것
  - 스코프 체인을 가능하게 하는 것은 LexicalEnvironment의 두 번째 수집 자료인 **outerEnvironmentReference.**

- 스코프체인
  - 여러 스코프에서 동일 식별자 선언시, **스코프 체인 상에서 가장 먼저 발견된 식별자에만 접근 가능**
  - **변수 은닉화(variable shadowing), 해당 스코프의** LexicalEnvironment에 해당 식별자가 존재하므로, 외부 공간에서 내부 공간의 동일한 이름의 변수에는 접근할 수 없는 것
- **전역 변수,** 전역공간에서 선언한 변수
- **지역변수,** 함수 내부에서 선언한 변수

## 04 this

- 실행 컨텍스트의 thisBinding에는 this로 지정된 객체가 저장됨.
- 실행 컨텍스트 활성화 당시에 this가 지정되지 않은 경우 this에는 전역객체가 저장 (비엄격 모드 기준. 엄격 모드와 ES 모듈에서는 undefined)

## 05. 정리

### 실행컨텍스트

- 실행할 코드에 제공할 환경 정보들을 모아놓은 객체
  - 전역 컨텍스트
  - 함수 실행에 의한 컨텍스트
- 객체 활성화되는 시점에 VariableEnvironment, LexicalEnvironment, ThisBinding 세가지 정보 수집

- 실행 컨텍스트 생성할 때는 VariableEnvironment와 LexicalEnvironment가 동일 내용으로 구성되지만 LexicalEnvironment는 함수 실행 도중에 변경되는 사항이 즉시 반영되는 반면, VariableEnvironment는 초기 상태를 유지

VariableEnvironment와 LexicalEnvironment는 식별자 바인딩을 담는 **Environment Record**와 바깥 어휘 환경을 가리키는 참조로 이어진다. 이 바깥 참조는 호출 스택의 바로 직전 함수가 아니라 **코드가 선언된 어휘적 위치**를 따른다.

### 호이스팅

- environmentRecord의 수집과정을 추상화한 개념
- 실행  컨텍스트가 관여하는 코드 집단의 최상단으로 이들을 ‘끌어올린다’고 해석하는 것
- 변수 선언과 값 할당이 동시에 이뤄진 문장은 ‘선언부’만을 호이스팅하고 할당 과정은 원래 자리에 남아있게 되는데, 여기서 함수 선언문과 함수표현식의 차이가 발생.

### 스코프

- 변수의 유효범위
- outerEnvironmentReference 는 해당 함수가 선언된 위치의 LexicalEnvironment를 참조
- 어떤 변수 접근하려고 하면 현재 컨텍스트의 LexicalEnvironment를 탐색해서 발견되면 그 값 반환
- 발견 못할 경우 다시 outerEnvironmentReference에 담긴 LexicalEnvironment를 탐색하는 과정을 거침
- ~~전역 컨텍스트의 LexicalEnvironment까지 탐색해도 해당 변수 못찾을 시, undefined를 반환~~

> **바로잡음(2026-08-30):** 끝까지 찾지 못하면 `undefined`가 아니라 **`ReferenceError`** 가 난다. `undefined`는 선언은 됐지만 값이 없을 때다. 둘을 구분하는 것이 이 장의 핵심이라 이 문장은 틀린 채로 두면 안 된다.

전역변수 - 전역 컨텍스트의 LexicalEnvironment에 담긴 변수

지역 변수 - 전역변수 외의 함수에 의해 생성된 실행 컨텍스트의 변수들

### **this**

- 실행 컨텍스트를 활성화하는 당시에 지정된 this가 저장됨
- 함수를 호출하는 방법에 따라 값이 달라지는데, 지정되지 않는 경우에는 전역 객체가 저장됨.

# 출처

- [정재남 - 코어 자바스크립트 인프런 강의](https://www.inflearn.com/course/%ED%95%B5%EC%8B%AC%EA%B0%9C%EB%85%90-javascript-flow)
- 정재남, 『코어 자바스크립트』, 위키북스(2019).
