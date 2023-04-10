---
date: '2023-03-21'
title: '타입스크립트 - 0.Overview'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: 'Javascript superset'
thumbnail: './TypescriptStudy/Typescript_logo.png'
---

# TypeScript란

## 자바스크립트 superset

- 자바스크립트를 사용해 새로운 기능과 장점을 추가한 언어
- 장점
  - **타입**을 이용하면서 작동방식에 대해 명시적이어야하며 예상치 못한 에러를 피할 수 있음
  - 타입스크립트는 컴파일 과정에서 에러를 잡아내기 때문에, 기존에 런타임에서 발생하던 에러를 개발단계에서 핸들링 할 수 있게 된다.
  - 구형 브라우저에서 사용가능한 자바스크립트 코드로 컴파일되므로 next-generation 자바스크립트 기능도 사용할 수 있다.
  - Interfaces or Generics와 같은 자바스크립트에는 없는 기능 추가
  - Decorator 같은 메타 프로그래밍 기능 제공
- 단점
  - 자바스크립트를 실행할 수 있는 환경에서는 타입스크립트가 지원되지 않는다. 브라우저는 타입스크립트를 실행할 수 없다. 당연히 node js 또한 실행 불가.

- 타입스크립트는 브라우저에서 실행할 수 없기 때문에 항상 js파일을 가져와야한다.

```bash
//index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Understanding TypeScript</title>
    <**script src="using-ts.js"** defer></script>
  </head>
  <body>
    <input type="number" id="num1" placeholder="Number 1" />
    <input type="number" id="num2" placeholder="Number 2" />
    <button>Add!</button>
  </body>
</html>
```

## 왜 타입스크립트를 쓰는가

- 아래 2,3이 문자열이기 때문에 원하는 5가 아닌 ‘23’이 된다. 이는 기능적 오류가 아니라 오류가 발생하지 않는다. 논리적 오류다.

```jsx
function add(num1, num2){
 return num1+num2;
}

console.log(add('2', '3'));
```

- cf) tsc 파일명으로 실행하면 에러를 알려주고 컴파일.

```bash
tsc filename.ts
```

- ex) 간단한 타입스크립트 사용 예시

```jsx
//js버젼
var button = document.querySelector("button");
var input1 = document.getElementById("num1");
var input2 = document.getElementById("num2");
function add(num1, num2) {
    return num1 + num2;
}
button.addEventListener("click", function () {
    console.log(add(+input1.value, +input2.value));
});
```

- !를 붙여줌으로써 결코 null을 야기하지 않을 것임을 ts에게 알려줌
- as HTMLInputElement로  어떤 유형의 요소인지 알려줌
- 변수**: 타입**

```tsx
//ts버젼
const button = document.querySelector("button");
const input1 = document.getElementById("num1")**! as HTMLInputElement;**
const input2 = document.getElementById("num2")**! as HTMLInputElement;**

function add(num1**: number**, num2**: number**) {
  return num1 + num2;
}

button.addEventListener("click", function() {
  console.log(add(+input1.value, +input2.value));
});
```

## cf)오류 종류, 컴파일 에러 vs 런타임 에러

### 컴파일 에러(Compile Error)

- 문법 오류(Syntax error) 등 컴파일러가 이해하지 못하는 코드 발견시 발생하는 에러
- 컴파일 시에 에러 메시지로 오류의 위치를 알려주기 때문에 찾기 쉬운 에레
- 수정되지 않으면 프로그램은 컴파일 되지않음
- ex) 선언되지 않은 변수 사용, 타입 불일치 등

### 런타임 에러(Runtime Error)

- 컴파일 후 프로그램이 실행되는 동안에 발생
- 프로그램 설계 미숙, 기계적 결험 등으로 발생
- ex)무한루프,  존재하지 않는 메모리 위치 접근 등

### 논리 오류(Logical Error)

- 컴파일 및 실행은 되지만, 사용자가 의도한 적업을 수행하지 못하는 에러
- 프로그래머가 논리적으로 추적해서 문제 있는 부분을 찾아야 함
- ex) 덧셈을 하려고 했으나 뺄셈을 한 경우

# **출처**

- Udemy【한글자막】 Typescript :기초부터 실전형 프로젝트까지 with React + NodeJS
