---
date: '2023-03-31'
title: '타입스크립트 - 3.1 클래스'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: '클래스, 상속'
thumbnail: './Typescript_logo.png'
---

# 클래스 만들기

```tsx
class Department {
//  name: string = "default"과 같이 초기값 설정 가능
  name: string; // 키 : 타입, 클래스의 필드

**// 생성자 메서드, 객체 생성되면서 실행되는 클래스에 기반하여 
// 만드는 모든 객체에도 연결되는 함수
// 구축하는 객체에 대한 초기화 작업 수행가능**
  **constructor(n: string) {** 
    this.name = n;
  }

  describe() {
    console.log('deparment : ' + this.name);
  }
}

//new 키워드가 있는 클래스를 실행하는 시점에 생성자(constructor)가 호출되고
//생성자 인수를 넘겨준다.
const accounting = ** new Department('Accounting'); **
```

## 생성자 함수 및 this 키워드

- 생성자 함수는 사용할 수 있는 속성뿐 아니라 메소드를 추가 할 수 있다. 생성자 메소드를 사용할 수도 있자만 클래스를 인스턴스화할 때 호출하는 유틸리티 함수일 뿐이다.
- 클래스에 메소드를 추가할 수 있다.
- 클래스 내부에 클래스 속성이나 메소드를 참조하려면 this키워드를 사용해야한다.

```tsx
class Department {
  name: string;

  constructor(n: string) {
    this.name = n;
  }
//수정전. **describe() {
  describe(this: Department) {
    console.log("Department: " + this.name);
  }**
}
const accounting = new Department("Accounting");

accounting.describe();

**//수정 전
//const accountingCopy = { describe: accounting.describe }; 
// 수정 후
const accountingCopy = { name: "DUMMY", describe: accounting.describe };** 

accountingCopy.describe();
**//만약 수정전과 같이 name이 없다면 accountingCopy.describe를 실행 시
//this에 해당하는 accountingCopy에 name값이 없어 undefined를 
// 출력하게 되므로 클래스의 describe 함수인자로 this:Department와 같이
// 타입을 지정하여야하고 컴파일 과정에서 에러를 발생시켜 
// 위와 같이 accountingCopy에 name값을 지정해주는 디버깅을 할 수 있다.**
```

## Private & Public 제어자

- Public은 기본 값이며 외부에서 접근할 수 있음.
- employee 속성에 private 없다면 아래 코드에서 직접 접근하게 되면서 문제가 발생할 수 있다. ex) A개발자는 사람추가를 위해 addEmployee 메소드를 쓰고 B개발자는 accounting.employees[2] = 'Anna' 코드로 추가하는 문제
- 따라서, 클래스 내에서만 접근할 수 있도록 Private 속성을 사용
- private, public은 TypeScript에서 지원하는 기능이기 때문에 타입스크립트는 **컴파일**
도중에 검사하므로 에러를 잡아낼 수 있다.
- 하지만, 자바스크립트의 런타임 환경에서는 컴파일 수행하는 버전에 따라 해당 기능을 인식하지 못하고 에러 없이 런타임을 수행할 수 있다.

```tsx
class Department {
  name: string;
  **private employee: string[] = [];**

  constructor(n: string) {
    this.name = n;
  }
  describe(this: Department) {
    console.log("Department: " + this.name);
  }

  addEmployee(employee: string) {
    this.employee.push(employee);
  }
  printEmployeeInformation() {
    console.log(this.employee.length);
    console.log(this.employee);
  }
}
const accounting = new Department("Accounting");

accounting.addEmployee("Max");
accounting.addEmployee("Manu");

//accounting.employees[2] = 'Anna';

accounting.describe();
accounting.printEmployeeInformation();
```

## 초기화를 축약하는 방법

- 아래와 같이 정의된 필드를 찾은 다음 값을 저장해야하는 이중 초기화 코드를 한 번에 처리하도록 축약할 수 있다.
- 축약해서 초기화 할 시에는 default값이었던 public도 명시한다.

```tsx
**//축약전**
**class Department {
 private id: string;
  name: string;
  private employee: string[] = [];

  constructor(id: string, n: string) {
    this.id = id;
    this.name = n;
  }**
 describe(this: Department) {
    console.log("Department: " + `${this.id} ${this.name}`);
  }
}

**//축약 후**
**class Department {**
  //   private id: string;
  //   name: string;
  **private employee: string[] = [];

  constructor(private id: string, public name: string) {**
    //   this.id = id;
    // this.name = n;
  **}**
 describe(this: Department) {
    console.log("Department: " + `${this.id} ${this.name}`);
  }
}
```

## readonly 제어자(읽기 전용)

- readonly 제어자를 통해 초기화 후 변경되어서는 안되는 특정 필드가 있는 경우(private, public 모두 사용가능) 사용한다.

```tsx
class Department {
 // private readonly id: string;
  //   name: string;
  private employee: string[] = [];

constructor(private **readonly** id: string, public name: string) {
  }
 describe(this: Department) {
    console.log("Department: " + `${this.id} ${this.name}`);
  }
}
```

## Inheritance (상속)

- 상속으로 특정 기능을 상속받고 고유 특성을 추가할 수 있다.
- extends 키워드와 상속할 클래스를 입력하여 해당 클래스를 상속할 수 있다.

```tsx
class ITDepartment extends Department{
}
```

- 상속 받은 클래스에 고유 생성자를 추가하지 않는 한 하위 클래스에 대한 기본 클래스는 생성자이므로 하위 클래스를 인스턴스화 할때 생성자가 자동으로 사용된다.
- 상속받는 클래스에 고유 생성자를 추가할 때마다 super를 추가하고 함수처럼 실행해야 한다.
- 또한, 상위클래스의 생성자함수 인자와 맞춰줘야하며 다른 특수한 속성을 할당하더라도 super부터 호출 해야한다.

```tsx
class Department {
  private employee: string[] = [];

**constructor(private readonly id: string, public name: string) {**
  }
// 생략
}

**class ITDepartment extends Department{
 admins: string[];**
 **constructor(id:string, admins: string[]){
  super(id, "IT"); // Department의 생성자함수의 인자
  this.admins = admins; // 
 }**
}

const accounting = new ITDepartment('d1', ['MAX']);
```

## Protected

- private으로 되어 있는 상위 클래스의 속성 값을 하위클래스에서 접근하려고 하면 에러 발생(private은 정의된 클래스 내에서만 접근가능하므로)
- 따라서, 이러한 경우 기본 클래스를 **확장하는 클래스 내에서 접근 가능하지만 외부에서 변경 불가능한 속성으로 만들기 위해서 Protected**를 사용한다.
- 클래스를 확장하는 모든 클래스에서 사용 가능하다.

```tsx
class Department {
  // private readonly id: string;
  // private name: string;
  **protected employees: string[] = [];**

  constructor(private readonly id: string, public name: string) {
    // this.id = id;
    // this.name = n;
  }

  describe(this: Department) {
    console.log(`Department (${this.id}): ${this.name}`);
  }

  addEmployee(employee: string) {
    // validation etc
    // this.id = 'd2';
    this.employees.push(employee);
  }

  printEmployeeInformation() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

class ITDepartment extends Department {
  admins: string[];
  constructor(id: string, admins: string[]) {
    super(id, 'IT');
    this.admins = admins;
  }
}

class AccountingDepartment extends Department {
  constructor(id: string, private reports: string[]) {
    super(id, 'Accounting');
  }

  addEmployee(name: string) { **// overriding**
    if (name === 'Max') {
      return;
    }
    **this.employees.push(name);**
  }

  addReport(text: string) {
    this.reports.push(text);
  }

  printReports() {
    console.log(this.reports);
  }
}

const it = new ITDepartment('d1', ['Max']);

it.addEmployee('Max');
it.addEmployee('Manu');

it.describe();
it.name = 'NEW NAME';
it.printEmployeeInformation();

console.log(it);

const accounting = new AccountingDepartment('d2', []);

accounting.addReport('Something went wrong...');

accounting.addEmployee('Max');
accounting.addEmployee('Manu');

accounting.printReports();
accounting.printEmployeeInformation();
```

## getter, setter

- getter와 setter는 로직을 캡슐화하고 속성을 읽거나 설정하려 할 때 실행되어야 하는 추가적인 로직을 추가하는데 유용
- getter는 값을 가지고 올때 함수나 메서드를 실행하는 속성이며 꼭 무언가를 return 해야한다.
- 접근자 프로퍼티의 값을 읽으려고 시도하면 getter가 호출되고 값을 쓰려고 시도하면 setter가 호출된다.

```tsx
class AccountingDepartment extends Department {
  **private lastReport: string; // getter를 통해 접근 가능**

//getter에는 인수가 없고 setter는 인수 하나를 받는다.
  **get mostRecentReport() {
    if (this.lastReport) {
      return this.lastReport;
    }
    throw new Error('No report found.');
  }

  set mostRecentReport(value: string) {
    if (!value) {
      throw new Error('Please pass in a valid value!');
    }
    this.addReport(value);
  }**

  constructor(id: string, private reports: string[]) {
    super(id, 'Accounting');
    this.lastReport = reports[0];
  }

  addEmployee(name: string) {
    if (name === 'Max') {
      return;
    }
    this.employees.push(name);
  }

  **addReport(text: string) {
    this.reports.push(text);
    this.lastReport = text;
  }**

  printReports() {
    console.log(this.reports);
  }
}

const accounting = new AccountingDepartment('d2', []);

//getter와 setter는 함수처럼 호출 하지 않고, 
//일반 프로퍼티에서 값에 접근하는 것처럼 사용해야한다.
**accounting.mostRecentReport = 'Year End Report';**
**accounting.addReport('Something went wrong...');**

console.log(accounting.mostRecentReport);

accounting.addEmployee('Max');
accounting.addEmployee('Manu');

accounting.printReports();
accounting.printEmployeeInformation();
```

## 정적 속성과 메서드

- 인스턴스에서 접근할 수 없는 속성과 메소드를 클래스에 추가할 수 있다.
- 주로 논리적으로 그룹화하거나 클래스에 매핑하려는 유틸리티 함수나 클래스에 저장하고자하는 전역 상수에 사용 된다.
  - ex) Math.PI, Math.pow() ~ 등, 자바스크립트 전역적으로 사용가능하며 상수 값으로 PI접근하면 PI수 또는 함수나 메서드를 제공하는 함수다.
  - new Math()를 호출 하면 작동하지 않고 직접 클래스 자체에서 속성과 메서드에 접근해야한다.
- this는 클래스를 기반으로 생성된 인스턴스를 참조하기 때문에 정적 속성에 접근할 수 없다. 정적 속성은 인스턴스에서 유효하지 않다. 따라서, 클래스 이름을 사용해서 정적속성과 메서드에 접근할 수 있다.

```tsx
abstract class Department {
  **static fiscalYear = 2020;**
  // private readonly id: string;
  // private name: string;
  protected employees: string[] = [];

  constructor(protected readonly id: string, public name: string) {
  **//this는 클래스를 기반으로 생성된 인스턴스를 참조하기 때문에 
  //정적 속성에 접근할 수 없다. 정적 속성은 인스턴스에서 유효하지 않다.
  // console.log(this.fiscalYear) 에러

  // 따라서, 클래스 이름을 사용해서 정적속성과 메서드에 접근할 수 있다.
    // console.log(Department.fiscalYear);**
  }

  **static createEmployee(name: string) {
    return { name: name };
  }**

  abstract describe(this: Department): void;

  addEmployee(employee: string) {
    // validation etc
    // this.id = 'd2';
    this.employees.push(employee);
  }

  printEmployeeInformation() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

const employee1 = Department.createEmployee('Max');
console.log(employee1, Department.fiscalYear);
```

## 추상클래스 abstract

- abstract 클래스, 메소드는 일부 상위 클래스를 기반으로 하는 모든 하위 클래스가 일부 공통 메소드 또는 속성을 공유하도록 하려는 경우 사용
- **추상 클래스를 상속하는 클래스는 추상 클래스에 정의된 메서드를 반드시 구현**해야 합니다.
- **abstract 키워드로 표기된 클래스들은 자체적으로 인스턴스화할 수 없다(생성 구문 new를 사용할 수 없다).** 이 클래스는 기본적으로 상속되어야 할 클래스일 뿐이며 상속되는 클래스가 인스턴스화되고 구체적인 구현을 제공하도록 할 수 있다.

```tsx
//추상 클래스
**abstract** class Department {
  protected employees: string[] = [];
  constructor(protected readonly id: string, public name: string) {}

 //추상 메서드 정의
  **abstract describe(this: Department): void;**
 
 //...생략
}

class ITDepartment extends Department {
  admins: string[];

  constructor(id: string, admins: string[]) {
    super(id, 'IT');
    this.admins = admins;
  }

// 추상 클래스에 정의된 추상 메서드 구현
  **describe() {
    console.log('ITdepartment');
  }**
}

**//Department는 추상화되었기 때문에 인스턴스화할 수 없다.**
**const departmentOne = new Department(); //오류**
```

## Singleton pattern & private constructor

- **싱글턴 패턴**은 특정 클래스의 **인스턴스를 하나만** 갖도록 한다. 정적 메소드나 속성을 사용할 수 없거나 사용하지 않고자 하는 동시에 클래스를 기반으로 여러 객체를 만들 수는 없지만 항상 클래스를 기반으로 정확히 하나의 객체만 가질 수 있도록 할 때.
- **private** 접근 제어자를 사용해 constructor() 앞에 붙이면 new 키워드를 통해 인스턴스를 생성하지 못하도록 제한할 수 있다. 따라서, 스태틱 메서드 getInstance()를 통해 **오직 한 번만 인스턴스를 생성**할 수 있다.

```tsx
abstract class Department {
//..생략
}

class AccountingDepartment extends Department {
  private lastReport: string;
  **private static instance: AccountingDepartment;**

  get mostRecentReport() {
    if (this.lastReport) {
      return this.lastReport;
    }
    throw new Error('No report found.');
  }

  set mostRecentReport(value: string) {
    if (!value) {
      throw new Error('Please pass in a valid value!');
    }
    this.addReport(value);
  }

 **// 생성자 함수에 private 접근 제어자를 통해 
  // new 키워드로 새 인스턴스 생성 제한
  private constructor(id: string, private reports: string[]) {
    super(id, 'Accounting');
    this.lastReport = reports[0];
  }**

  **static getInstance() {
  //이미 인스턴스가 있는지 확인하고 없다면 새 인스턴스 반환
    if (AccountingDepartment.instance) {
      return this.instance;
    }
    this.instance = new AccountingDepartment('d2', []);
    return this.instance;
  }**

  describe() {
    console.log('Accounting Department - ID: ' + this.id);
  }

  addEmployee(name: string) {
    if (name === 'Max') {
      return;
    }
    this.employees.push(name);
  }

  addReport(text: string) {
    this.reports.push(text);
    this.lastReport = text;
  }

  printReports() {
    console.log(this.reports);
  }
}

const employee1 = Department.createEmployee('Max');
console.log(employee1, Department.fiscalYear);

const it = new ITDepartment('d1', ['Max']);

it.addEmployee('Max');
it.addEmployee('Manu');

it.describe();
it.name = 'NEW NAME';
it.printEmployeeInformation();

console.log(it);

**const accounting = AccountingDepartment.getInstance();
const accounting2 = AccountingDepartment.getInstance();**

**console.log(accounting, accounting2); // 두 인스턴스 같음**

accounting.mostRecentReport = 'Year End Report';
accounting.addReport('Something went wrong...');
console.log(accounting.mostRecentReport);

accounting.addEmployee('Max');
accounting.addEmployee('Manu');

accounting.describe();

```
