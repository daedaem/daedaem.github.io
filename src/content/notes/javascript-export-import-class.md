---
slug: 'javascript-export-import-class'
date: '2022-12-27T12:40:05Z'
updated: '2023-11-16T08:19:34Z'
title: 'JavaScript - Export & Import / Class'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'Export, Import / Class'
thumbnail: './javascript.png'
legacyPath: "/221227_js-Export & Import & Class/"
---

## Exports & Import (Modules)
```jsx
//person.js
//export 하나만 하는 파일
const person = {
    name: 'Joe'
}

export default person
```
```jsx
//utility.js
//여러변수와 메서드를 export하는 파일
export const clean = () => {...}

export const baseData = 10;
```
```jsx
//app.js

//default로 person 상수를 지정했기 때문에(하나만 불러오므로) 중괄호 사용 안 해도 됨
import person from './person.js'
//이름도 임의로 지정해서 사용해도 됨
import prs from './person.js'

// 정확하게 구분하기 위해 중괄호{}를 붙여줘야 함
// named export (이름으로 불러오기 때문)라고 함
import {clean} from './utility.js'
import {baseData} from './utility.js'

// 이름 지정을 위해선 AS키워드를 써서 별칭 할당
import {baseData as bd} from './utility.js'

//*를 통해 모든 것을 import 가능
import * as bundled from './utility.js'
bundled.baseData
bundled.clean
```
## Class

```jsx
class Person {
  constructor() { // 생성자 함수
    this.name = 'JOE'; //프로퍼티
  }
  printMyName(){ //메서드
    console.log(this.name);
  }
}

const person = new Person();
person.printMyName();
```
```jsx
//상속
//상속은 상위클래스의 프로퍼티와 메서드를 사용할 수 있다.
class Human{
	constructor(){
		this.gender = 'man';
	}
	printMyGender(){
		console.log(this.gender);
	}
}

class Person extends Human{
  constructor() { // 생성자 함수
	// 하지만 서브클래스에서 생성자함수 안에
  // super메서드를 먼저 호출해야함
		super(); 
    this.name = 'JOE'; //프로퍼티
		this.gender = 'female';
  }
  printMyName(){
    console.log(this.name);
  }
}

const person = new Person();
person.printMyName();
person.printMyGender();

```
<aside>
💡 ~~ES7부터는 생성자 함수 없이 프로퍼티와 메서드 사용가능~~

> **바로잡음(2026-08-30):** 생성자 없이 `gender = 'male'`처럼 쓰는 **클래스 필드**는 ES7(ES2016)이 아니라 **ES2022**에 표준이 됐다. 강의 당시에는 Babel 플러그인으로 미리 쓰던 문법이라 "ES7"이라고 잘못 불렸다.

> **바로잡음(2026-09-04):** 아래 주석처럼 메서드는 반드시 화살표 함수여야 하는 것도 아니다. 일반 클래스 메서드는 `obj.method()`로 호출하면 `this`가 인스턴스를 가리킨다. 콜백으로 메서드 참조만 넘겨 호출 주체를 잃을 때 화살표 필드나 `bind`가 필요하다.

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
