---
slug: 'javascript-spread-rest-operators'
date: '2022-12-27T13:43:44Z'
updated: '2023-11-16T08:19:39Z'
title: 'JavaScript - Spread & Rest Operators'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'Spread & Rest Operators'
thumbnail: './javascript.png'
legacyPath: "/221230_js-Spread & RestOperators/"
---

# Spread & Rest Operators
- 사용처에 따라 스프레드 또는 레스트

### 1. 스프레드
- 배열의 원소나 객체의 프로퍼티를 펼치는 데 사용
```jsx
// 배열
const numbers = [1, 2, 3];
const newNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]

//객체
const person = {
  'name': 'haesung',
}
const newPerson = { 
	...person, 
	age:32
};
//{ age: 32,  name: "haesung" }
```

### 2. 레스트
- 함수의 인수 목록을 배열로 모으는 데 사용
```jsx
//인자가 몇 개든 ...args로 사용
const filter = (...args) => { 
//filter 메서드는 주어진 함수의 테스트를 통과하는 모든 요소를 모아 새로운 배열로 반환합니다.
  return args.filter(el => el === 1);
}

console.log(filter(1, 2, 3)); // [1]
```

> 아래 클래스 예제는 Spread·Rest와 무관하다. Export·Import·Class 노트의 내용이 옮겨 붙은 것인데, 당시 노트 그대로 둔다.

> **바로잡음(2026-09-04):** 아래 주석처럼 메서드는 반드시 화살표 함수여야 하는 것이 아니다. 일반 클래스 메서드는 `obj.method()`로 호출하면 `this`가 인스턴스를 가리키고, 콜백으로 메서드 참조만 넘길 때는 화살표 필드나 `bind`를 검토한다.

```jsx
class Human{
  gender = 'male';
  //화살표 함수를 써야 this에 대한 문제 방지
  printMyGender = () =>{
    console.log(this.gender);
  }
}

class Person extends Human{
  name = 'JOE'; //프로퍼티
	gender = 'female';
  printMyName = () => {
    console.log(this.name);
  }
}

const person = new Person();
person.printMyName();
person.printMyGender();
```

# Source

https://www.udemy.com/course/best-react/
