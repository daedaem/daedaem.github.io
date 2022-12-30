---
date: '2022-12-27'
title: 'JavaScript - Export & Import / Class'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'Export, Import / Class'
thumbnail: './javascript.png'
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

//default로 person 상수를 지정했기 때문에(하나만 불러오므로) 중괄호 사용안해도됨
import person from './person.js'
//이름도 임의로 지정해서 사용해도 됨
import prs from './person.js'

// 정확하게 구분기 위해 중괄호{}를 붙여줘야함
// named export (이름으로 불러오기 때문)라고함
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
💡 ES7부터는 생성자 함수 없이 프로퍼티와 메서드 사용가능

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