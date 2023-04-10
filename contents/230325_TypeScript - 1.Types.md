---
date: '2023-03-25'
title: '타입스크립트 - 1.Types'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: '키:타입'
thumbnail: './TypescriptStudy/Typescript_logo.png'
---

# Type

- **타입스크립트의 주요 원시 타입은 모두 소문자.**

## number

- JS:  1, 5.3, -10  모두 숫자 타입
- TS : 모든 숫자, integer or floats간 차이점 없음

## string

- JS : ‘Hi’, “HI”, `Hi` 같은 모든 텍스트 값
- TS : 모든 텍스트 값

## boolean

- JS : true, false
- TS: true,false

---

## cf. 타입추론

### 명시적 타입 할당

```tsx
const age:number = 29;
```

### 타입 추론(type inference)

```tsx
const age = 29;
```

- 타입스크립트는 특정 변수나 상수에 어떤 타입을 사용했는지 이해한다.
  - number1을 숫자형으로 설정했기 때문에 항상 숫자형이라고 이해한다.
  - resultPhrase변수에 문자열을 할당했기 때문에 문자열로 이해한다.

```tsx
function add(n1: number, n2: number, showResult: boolean, phrase: string) {
  // if (typeof n1 !== 'number' || typeof n2 !== 'number') {
  //   throw new Error('Incorrect input!');
  // }
  const result = n1 + n2;
  if (showResult) {
    console.log(phrase + result);
  } else {
    return result;
  }
}

let number1: number;
number1 = 5;
const number2 = 2.8;
const printResult = true;
let resultPhrase = 'Result is: ';
resultPhrase = 0; // 에러 발생 Type '0' is not assignable to type 'string.
add(number1, number2, printResult, resultPhrase);
```

## object

- JS : {age : 30}
- TS : 자바스크립트 객체와 구체적 객체타입(객체의 타입을 명확히하는 타입)이 가능

```tsx
// object라는 객체정보가 없으므로 에러, 아래 B코드와 같이 작성
// A.
const person: object = {
  name: "JoeHaesung",
  age: 32,
};

console.log(person.name);
```

```tsx
// B. 물론 같은 타입스크립트를 명시적으로 지정하는 것은 좋은 작업 방식x
// 하지만 타입스크립트가 객체 타입을 이해하게하려면 아래와 같이 입력
const person: {
   name: string;
   age: number;
}= {
//const person = {
  name: "JoeHaesung",
  age: 32,
};

console.log(person.name);
```

```tsx
// C. 다음과 같이 타입스크립트를 이해시키는 것이 좋음
//const person: {
//   name: string;
//   age: number;
//}= {
const person = {
  name: "JoeHaesung",
  age: 32,
};
console.log(person.name);
```

- 구체적 객체타입 - 새로운 자바스크립트 객체를 생성하는 것이 아니라 해당 객체의 키와 타입형태로 타입을 명시하는 객체 타입
  - 자바스크립트 객체와 구체적 객체타입의 차이점
    - ts는 키-타입 쌍, 쌍반점(;)을 붙임
    - js는 키-값 쌍, 쉼표 붙임

    ```tsx
    //ts, 키-타입
    const person:{
     name : string;
     age : number;
    }
    
    // js, 키-값
    const person = {
     name : "haesung",
     age : 32
    };
    
    ```

### 중첩된 객체 및 타입

- 객체 타입은 중첩 객체에 대해서도 생성 가능

```tsx
//js 객체타입
const product = {
  id: 'abc1',
  price: 12.99,
  tags: ['great-offer', 'hot-and-new'],
  details: {
    title: 'Red Carpet',
    description: 'A great carpet - almost brand-new!'
  }
}
//=> 이 객체의 ts 객체 타입
{
  id: string;
  price: number;
  tags: string[];
  details: {
    title: string;
    description: string;
  }
}
```

## array

- JS : [1,2,3]
- TS : 모든 자바스크립트 array 그리고 타입은 유연하거나 제한되게 지정 가능

```tsx
const person = {
  name: 'Maximilian',
  age: 30,
  hobbies: ['Sports', 'Cooking']
};

let favoriteActivities: string[];
favoriteActivities = ['Sports'];

console.log(person.name);

for (const hobby of person.hobbies) {
  console.log(hobby.toUpperCase()); //hobby를 자동으로 문자열로 인식하므로 가능
  // console.log(hobby.map()); // !!! ERROR !!!
}
```

## tuple

- 자바스크립트에는 없는 타입, 항상 두개의 요소
  - 배열에 정확히 x개의 값이 필요하고 각 값 타입을 미리 알고 있는 상황에서는 배열보다 튜플을 사용하면 작업 중인 데이터 타입과 예상되는 데이터 타입을 명확하게 파악 가능
- ex) [1,2]
- 길이와 타입이 고정된 배열

```tsx
const person: {
  name: string;
  age: number;
  hobbies: string[];
 // 튜플을 사용하고자 한다면
  // 다음과 같이 명시적으로 지정해줘야 아래에서 
  // 배열의 값을 바꾸는 등 배열처럼 쓰는 것을 방지할 수 있음
  role: [number, string]; 
} = {
  name: 'Maximilian',
  age: 30,
  hobbies: ['Sports', 'Cooking'],
  role: [2, 'author']
};

// person.role.push('admin'); // push메서드는 적용되는데 이런 부분은 걸러내질 못함
// person.role[1] = 10; // 하지만 의도지 않은 값 변경

// person.role = [0, 'admin', 'user']; // 배열 길이 제한 가능
```

## enum(열거형)

- enum { NEW, OLD } , 식별자들을 중괄호 쌍 안에 넣는 방식
- 코드 내에서 작업 가능한 인간이 읽을 수 있는 라벨을 표현하는 개념
- 0부터 시작하는 숫자로 변환
- 아래 role에 2가 무엇을 의미하는지 알 수 없다. ⇒ 인간이 읽을 수 있는 식별자로 표시 하는게 낫다.

    ```tsx
    enum Role {ADMIN, READ_ONLY, AUTHOR}; // 0,1,2
    //enum Role {ADMIN=5, READ_ONLY, AUTHOR}; 5,6,7
    //enum Role {ADMIN=5, READ_ONLY=100, AUTHOR=200}; // 5, 100, 200
    //enum Role {ADMIN='ADMIN', READ_ONLY=100, AUTHOR=200}; // ADMIN, 100, 200
    
    const person = {
      name: "Maximilian",
      age: 30,
    // role : 2
     role: Role.ADMIN
    };
    console.log(person.name);
    ```

## any

- 가장 유연한 타입, 타입스크립트에 어떤 것도 이해시키지 않는다.
- 모든 종류의 값을 저장 가능
- 어떤 값이나 종류의 데이터가 어디 저장될지 전혀 알수 없는 경우나 런타임 검사를 수행하는 경우에만 사용하는 것이 좋다. - 다 any를 쓴다면 타입스크립트 쓰는 이유가 없어짐

## Union

- 유니온 타입을 사용하면 두 가지 이상의 타입을 사용 할 수 있다.
- 여러 타입을 사용하므로 예상 외의 결과를 초래할 수 있어 종종 아래와 같이 타입을 체크하는 런타임 검사가 필요한 경우도 있다.

```tsx
function combine(input1: number | string, input2: number | string) {
  let result;
  if (typeof input1 === 'number' && typeof input2 === 'number') {
    result = input1 + input2;
  } else {
    result = input1.toString() + input2.toString();
  }
  return result;
}

const combinedAges = combine(30, 26);
console.log(combinedAges); //56

const combinedNames = combine('Joe', 'Haesung');
console.log(combinedNames); // JoeHaesung
```

## 리터럴 타입

- 정확한 값을 가지는 타입

```tsx
const number1 = 3; //상수로 타입이 3
```

- 유니온 타입을 사용할 때 결합하여 사용하면 용이하다
  - resultConversion에 해당하는 문자열은 ‘as-number’나 ‘as-text’ 값 중 하나

```tsx
function combine(
  input1: number | string,
  input2: number | string,
  resultConversion: 'as-number' | 'as-text' //리터럴 타입
) {
  let result;
  if (typeof input1 === 'number' && typeof input2 === 'number' || resultConversion === 'as-number') {
    result = +input1 + +input2;
  } else {
    result = input1.toString() + input2.toString();
  }
  return result;
  // if (resultConversion === 'as-number') {
  //   return +result;
  // } else {
  //   return result.toString();
  // }
}

const combinedAges = combine(30, 26, 'as-number');
console.log(combinedAges);

const combinedStringAges = combine('30', '26', 'as-number');
console.log(combinedStringAges);

const combinedNames = combine('Max', 'Anna', 'as-text');
console.log(combinedNames);
```

## 타입 별칭(**Type Aliases**)

- 유니온 타입으로 작업 시, 반복해서 유니온 타입을 지정하는 대신 해당 유니언 타입을 저장하는 유니온 타입을 만들 수 있음
- type + 별칭 =  타입들 ;

```tsx
type Combinable = number | string;
type ConversionDescriptor = 'as-number' | 'as-text';

function combine(
  input1: Combinable,
  input2: Combinable,
  resultConversion: ConversionDescriptor
) {
  let result;
  if (typeof input1 === 'number' && typeof input2 === 'number' || resultConversion === 'as-number') {
    result = +input1 + +input2;
  } else {
    result = input1.toString() + input2.toString();
  }
  return result;
  // if (resultConversion === 'as-number') {
  //   return +result;
  // } else {
  //   return result.toString();
  // }
}

const combinedAges = combine(30, 26, 'as-number');
console.log(combinedAges);

const combinedStringAges = combine('30', '26', 'as-number');
console.log(combinedStringAges);

const combinedNames = combine('Max', 'Anna', 'as-text');
console.log(combinedNames);
```

### **타입 알리어스 및 객체 타입**

- 타입 별칭을 사용하여 타입을 직접 “생성” 가능
- 유니온 타입을 저장하는 것만 가능한 것이 아니라 복잡할 수 있는 객체 타입에도 별칭을 붙일 수 있음

```tsx
1. type User = { name: string; age: number };
2. const u1: User = { name: 'Max', age: 30 }; // this works!
```

- 타입 별칭을 사용하면 불필요한 반복을 피하고 타입을 중심에서 관리할 수 있음.
- 예를 들어, 다음 코드를 아래와 같이 단순화할 수 있습니다.
- 단순화 전

```tsx
1. function greet(user: { name: string; age: number }) {
2.   console.log('Hi, I am ' + user.name);
3. }
4.  
5. function isOlder(user: { name: string; age: number }, checkAge: number) {
6.   return checkAge > user.age;
7. }
```

- 단순화 후

```tsx
1. type User = { name: string; age: number };
2.  
3. function greet(user: User) {
4.   console.log('Hi, I am ' + user.name);
5. }
6.  
7. function isOlder(user: User, checkAge: number) {
8.   return checkAge > user.age;
9. }
```

## 함수

### 함수 반환 타입 및 ‘무효’

- 함수 반환 타입을 지정하려는 경우 함수인자 괄호 뒤에 명시
- 함수 반환이 없는 경우 Void라는 반환 타입 존재

    ```tsx
    function add(n1:number, n2:number){
     return n1+n2;
    }
    
    function add(n1:number, n2:number):number{
     return n1+n2;
    }
    ```

- 함수:void 와 함수:undefined 차이
  - **값을 반환하지 않는 함수를 사용하는 경우 void를 표준으로 사용**하며 void를 명시적으로 지정할 수 있지만 타입스크립트는 그 코 드를 추론할 수 있다.
- 자바스크립트에서는 반환하지 않는 함수를 변수에 할당하면 undefined로 확인되지만 타입스크립트에서 undefined라고 지정하면 값을 반환하지 않는 반환문이 있을 것이라 여김. 따라서, return;과 같이 반환해야함.

```tsx
function printResult(n1:number){ // 타입스크립트가 반환 값 추론할 수 있어 안적음
 console.log('Result: ' + num);
 //return; 
}

function printResult(n1:number):void{
 console.log('Result: ' + num);
 //return; 상황에 맞게 리턴있어도 되고 없어도 되고
}

function printResult(n1:number):undefined{ // 드믄 경우 사용됨
 console.log('Result: ' + num);
 return; // 있어야함
}
```

### 타입 기능을 하는 함수

- JS에서는 아래와 같은 문제 발생 가능

    ```tsx
    function add(n1: number, n2:number){
     return n1 + n2;
    }
    
    function printResult(num: number):void{
     console.log("Result : " + num);
    }
    
    let combineValues;
    
    combineValues = add;
    combineValues = 5;
    
    // 함수 실행을 하려했으나 중간에 5가 할당되어 런타임 에러
    console.log(combineValues(8, 8)); 
    ```

- Function 으로 타입 지정할 수 있음.

    ```tsx
    //수정 후
    function add(n1: number, n2:number){
     return n1 + n2;
    }
    
    function printResult(num: number):void{
     console.log("Result : " + num);
    }
    
    let combineValues: Function;
    
    combineValues = add;
    combineValues = 5; // 문제의 원인, 이곳에서 컴파일 에러 발생해서 수정 가능 함
    
    console.log(combineValues(8, 8)); 
    ```

- But, Function으로만 지정하면 함수 인자와 타입 지정이 다른 함수를 할당 받을 때, 문제 발생 가능. 따라서, **함수 인자와 반환 값을 지정.**

    ```tsx
    function add(n1: number, n2:number){
     return n1 + n2;
    }
    
    function printResult(num: number):void{
     console.log("Result : " + num);
    }
    
    printResult(add(5, 12));
    
    //이렇게만 지정하면 printResult함수를 할당 받은 comvineValues가 undefined 값 가짐
    //**let combineValues: Function; 
    
    //따라서 아래와 같이 함수 인자, 반환에 타입 지정**
    let combineValues: (a:number, b:number) => number;
    
    combineValues = add;
    
    //여기서 문제 발생하므로 함수 인자, 반환 타입지정
    //combineValues = printResult;
    
    console.log(combineValues(8, 8)); 
    ```

### 함수 타입 및 콜백

- 함수  타입은 함수 매개변수 및 반환 타입을 정의
- 콜백 함수는 자신이 전달되는 인수가 반환 값을 기대하지 않는 경우에도 값을 반환할 수 있습니다.

```tsx
function sendRequest(data: string, cb: (response: any) => void) {
  // ... sending a request with "data"
  return cb({data: 'Hi there!'});
}
 
sendRequest('Send this!', (response) => { 
  console.log(response);
  return true;
 });
```

- 2번 보다 1번 코드를 써야 한다. 아무 값도 반환하고 싶지 않은 경우, 어떤 값을 반환하도록 강요하지 않기 때문.

```tsx
//1.
function sayHi(): void {
  // ...
}

//2.
function sayHi(): undefined {
  // ...
}
```

## Unknown(‘알 수 없는 타입’)

- any 타입처럼 unknown 타입에는 **어떤 타입의 값도 할당**할 수 있다.
- **any 타입의 값은 어느 타입의 변수에도 할당**될 수 있으나, **unknown 타입의 값은 any와 unknown 타입을 제외한 타입의 변수에는 할당이 불가능**
- any보다 나은 이유는 할 수 없는 작업을 알 수 있도록 타입 검사를 수행할 수 있다.

```tsx
let userInput: unknown;
let unserName: string;

userInput = 5;
userInput = 'Max';

//따라서, 타입 검사 하여 할당 가능
//if(typeof userInput === 'string'){
// userName = userInput;
//}

// Type 'unknown' is not assignable to type 'string' 
userName = userInput;
```

## Never

- 아래 코드에서 void로 리턴값 타입을 지정할 수 있지만, never를 통해 아무것도 반환하지 않는다는 것을 확실하게 명시할 수 있다. 즉, 코드를 읽는 개발자에게 해당 값의 의도를 명확히 할 수 있음.

```tsx
function generateError(message: string, code: number): never {
  throw { message: message, errorCode: code };
  // while (true) {}
}

generateError('An error occurred!', 500);
```

## cf. JavaScript와 TypeScript의 타입 차이

- 자바스크립트는 동적 타입(런타임에서 에러 발생 및 해결)
- 타입스크립트는 정적타입(개발하는 중 에러 발생 및 해결)
  - **타입 스크립트 기능과 검사 기능이 자바스크립트 엔진에 내장되어 있지 않기 때문에 개발 도중에만 지원 받을 수 있음**
