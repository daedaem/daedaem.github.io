---
date: '2022-12-30'
title: 'JavaScript - Spread & Rest Operators'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'Spread & Rest Operators'
thumbnail: './javascript.png'
---

# Spread & Rest Operators
- 사용처에 따라 스프레드 또는 레스트
<br>

### 1. 스프레드
- 배열의 원소나 객체의 프로퍼티를 나누는데 사용
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
-  함수의 인수 목록을 배열로 합치는데 사용
```jsx
//인자가 몇개든 ...args로 사용
const filter = (...args) => { 
//filter 메서드는 주어진 함수의 테스트를 통과하는 모든 요소를 모아 새로운 배열로 반환합니다.
  return args.filter(el => el === 1);
}

console.log(filter(1, 2, 3)); // [1]
```

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