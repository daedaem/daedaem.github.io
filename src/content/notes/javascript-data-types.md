---
slug: 'javascript-data-types'
date: '2022-12-23'
title: 'JavaScript - 데이터타입 '
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'let, const, var'
thumbnail: './javascript.png'
legacyPath: "/221223_Javascript-데이터 타입/"
---

# 데이터 타입
## 1. Variable
- ex) **let,  var**
- **Mutable**(변경가능한) 특징 (바이러스가 Mutation(변이)를 일으키는 것을 생각하면 이해)
    ```jsx
    let name = "해성" // 선언 및 초기화
    console.log(name)  //해성
    name = "조해성" //할당
    console.log(name) //조해성
    
    name이라는 변수가 가리키는 메모리에 내용 할당
    ```
### let
- ES6에서 추가
- 자바스크립트에서 변수선언 가능한 유일한 하나
- 이전까지는 var를 사용했으나, **hoisting** 문제
  
    <aside>
    💡 Hoisting (끌어올리다는 뜻): 선언을 아래에서 위로 끌어올려주는 것
    
    </aside>
    
- **var를 쓰면 안되는 이유**
    ```jsx
    //호이스팅
    console.log(age); // undefined
    age = 4;
    console.log(age); //4
    var age
    
    name = 4;
    let name; 
    console.log(name); //ReferenceError
    ```
    
    ```jsx
    //block scope가 없음
    {
    	age = 4;
    	var age;
    }
    console.log(age); // 4
    ```
#### cf. **스코프의 차이**
```jsx
let globalName= "global name";
{
	//블록 스코프
	let name = "해성" // 선언 및 초기화
	console.log(name)  //해성
	name = "조해성" //할당
	console.log(name) //조해성
	console.log(name) //global name
}
	console.log(name) //
	console.log(name) //global name
```
## 2. Constant
ex) **const**
```jsx
const myNumber = 7;
myNumber = 2 // TypeError: Assignment to constant variable.
```
- 변수를 이용하면 포인터를 이용해서 메모리 값을 변경가능했으나, const를 사용하면 잠겨있다고 생각하면 됨

- **Immutable(변경가능한)**
    - security (해커들이 값 변경하는 것 등을 방지)
    - thread safety (다양한 쓰레드들이 동시 변수에 접근하여 값을 변경가능한 것을 방지)
    - reduce human mistake

## 3. Variable types
### primitive
### single item
  - number
    ```jsx
    const num = 7;
    
    // special numeric values
    const infinity = 1 / 0; //Infinity
    const negativeInfinity = -1 / 0;  //-Infinity
    const nAn = 'not a number' / 2;  // NaN
    
    // BigInt 최근 추가됨
    const bigInt = 1234567890123456789012345678901234567890n; // over 
    //-> (-2**54) ~ 2**53
    ```
    
  - string
    ```jsx
    const char = 'c';
    const name = 'haesung';
    const hello = 'hello'+ name // hello haesung
    
    //template literals(string) 백틱을 이용해 변수값 이용가능
    const hellohaesung = `hi ${name}!`; // hi haesung
    
    ```
    
  - boolean
    ```jsx
    //false:0,null,undefined, NaN, ''
    //true: 다른 값들
    const test = 1 > 100 // false
    ```
    
  - null
    ```jsx
    let nothing = null // null
    ```
    
  - undefined
    ```jsx
    let x; // undefined
    let y = undefined; //undefined
    ```
    
  - symbol
    ```jsx
    //고유한 식별자를 만들때, 시동일한 문자열을 사용했어도 다른 값으로 구별됨.
    const symbol1 = Symbol('id');
    const symbol2 = Symbol('id');
    console.log(symbol1 === symbol2); // false
    
    //동일한 것으로 만들고 싶을때 'for'
    const gSymbol1 = Symbol.for('id');
    const gSymbol2 = Symbol.for('id');
    console.log(gSymbol1 === gSymbol2); // true
    
    //출력시에는 .description을 통해 문자열로 변환해서 출력해야함
    console.log(`value: ${symbol1.description}`); // id
    ```
### object
```jsx
const haesung = {name:"haesung", age: 20};
//haesung 변수를 가리키는 포인터는 잠겨있어 다른 오브젝트로 할당 불가
//but, 객체 안 name과 age변수에 대한 포인터는 잠겨있지 않아 다른 값으로 할당가능
haesung.age = 33;
```
### box container
### function, first-class function
  - 함수도 다른 데이터타입처럼 변수할당 가능, 함수 패러미터 전달, 함수 리턴 타입으로도 사용가능한 기능을 지원함을 의미
## 4. Dynamic typing
```jsx
let text = 'hello';
console.log(`value: ${text}, type: ${typeof text}`); // value:hello, type:string
text = 1;
console.log(`value: ${text}, type: ${typeof text}`); //value:1, type: number
text = '7' + 5;
console.log(`value: ${text}, type: ${typeof text}`); //value: 75, type:string
text = '8' / '2';
console.log(`value: ${text}, type: ${typeof text}`); //value: 4, type: number
```

## 5. VAR vs LET vs CONST
    </img>


# 출처

[자바스크립트 3. 데이터타입, data types, let vs var, hoisting | 프론트엔드 개발자 입문편 (JavaScript ES5+)](https://www.youtube.com/watch?v=OCCpGh4ujb8&list=PLv2d7VI9OotTVOL4QmPfvJWPJvkmv6h-2&index=3)
