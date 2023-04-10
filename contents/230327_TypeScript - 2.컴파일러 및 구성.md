---
date: '2023-03-27'
title: '타입스크립트 - 2.컴파일러 및 구성'
categories: ['Web Frontend', 'TIL', 'TypeScript']
summary: 'tsconfig'
thumbnail: './TypescriptStudy/Typescript_logo.png'
---

## watch 모드 사용하기

- 타입스크립트 파일 코드를 변경할때마다 `tsc 파일명.ts` 커맨드를 입력하는 번거로움을 피하기 위해 watch 모드를 사용
- 타입스크립트 파일을 관찰하고 파일에 변경사항이 있을 때, 다시 컴파일 해준다.
- 커맨드

    ```bash
    tsc 파일명.ts --watch
    //or 
    tsc 파일명.ts -w
    
    //종료시 ctrl+c
    ```

## 전체 프로젝트 컴파일 / 다수 파일

- 프로젝트를 타입스크립트 프로젝트라고 처음에 지정하면서 한번만 실행하면 됨.
  - 이 커맨드로 tsconfig.json 파일 생성

    ```bash
    // 이 커맨드가 실행되는 폴더의 모든 항목을 알려주는 역할
    tsc --init
    ```

- 전체 프로젝트 (한번)컴파일 시

    ```bash
    tsc
    ```

- 전체 프로젝트 watch 모드 실행

    ```bash
    tsc --watch
    //or 
    tsc -w
    ```

## 파일 포함하고 제외하기

- **제외(”exclude”)**
  - exclude 키 값으로 배열에 해당 되는 파일을 추가한다. 아무것도 추가할게 없고 node_modules만 추가하고 싶다면 기본값이 node_modules로 되어 있어 exclude를 추가할 필요가 없다.
  - 하지만, node_modules제외하고 하나라도 추가한다면 node_modules를 제외하고 싶으면 추가로 적어줘야한다.
- **포함(”include”)**
  - 컴파일 과정에 포함시킬 파일을 타입스크립트에 알린다.
  - include 값에 포함되지 않은 어떤 것도 컴파일 되지 않도록 한다.
    - 따라서, include를 설정하면 컴파일 하고자 하는 모든 항목을 포함시켜야한다.
- 즉, include + exclude를 설정하면 exclude 설정된 파일들을 제외한 채, include 파일들을 컴파일 하는 것
- **“files”**
  - 컴파일하고자 하는 개별 파일만을 지정할 수 있다.

```jsx
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
 },
 "exclude" : [
  "node_modules" //
 ],
 "include" : [
  "app.ts",
  "analytics.ts"
 ],
 //"files": [
 // "app.ts"
 //]
}
```

## 컴파일 대상 설정하기

[Documentation - What is a tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)

[Documentation - tsc CLI Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

- target
  - 컴파일될 JS버전 설정, 어떤 자바스크립트 버전을 대상으로 코드를 컴파일 할 것 인지
- module
- lib
  - dom으로 작업을 수행하는 항목들, 즉 기본 객체,기능,타입 스크립트 노드를 지정하게 해주는 옵션
  - 지정하지 않으면 기본으로 브라우저에서 작동하는데 필요한 dom API 등이 포함되어 사용 가능함.
- allowJS
  - 파일이 .ts로 끝나지 않더라도 타입스크립트가 자바스크립트 파일을 컴파일 할 수 있도록 해줌
- checkJs
  - 컴파일을 수행하지 않더라도 구문을 검사하고 잠재적 에러를 보고 해줌
- sourceMap
  - .map파일을 만들어줘서 브라우저 개발자 도구 소스 탭에서 js파일뿐 아니라 ts 파일도 볼수 있고 중단점을 둘 수 있어 디버깅할 수 있다.
- outDir
  - 생성된 파일이 저장되는 위치를 타입스크립트 컴파일러에 알릴 수 있다.
  - 설정하고 tsc 실행하면 js파일이 src 폴더가 아닌 설정한 dis폴더에 있다. 그러면 index.html에 js파일 위치를 ”dist/app.js” 처럼 변경해줘야한다.
- rootDir
  - 입력 파일들의 루트 디렉토리 설정.
- removeComments
  - ts 파일의 모든 주석이 컴파일된 js 파일에서 제거됨
- noEmit
  - 결과 파일(js) 내보내고 싶지 않을 때, 규모가 커서 결과파일을 만들지 않고 컴파일러가 파일을 검사하고 잠재적 에러만 보고싶을 때
- downlevelIteration
  - 코드를 이전 버전의 js로 컴파일 하고 for루프로 작업한 다음, 드물지만 컴파일이 제대로 작동하지 않는 경우가 있는 경우, 정확하게 컴파일 가능
- noEmitOnError
  - 기본값 false
  - 기본적으로 에러가 있음에도 컴파일되어 js파일이 생성된다.
  - 설정을 true로 하면 문제 되는 파일이 있는경우 js 파일이 생성되지 않는다.
- strict
  - 세부 옵션들을 모두 사용하려면 strict만 true로
  - 개별 옵션을 false로 설정하여 각각 설정 가능

        ```
        "strict":true,
        // any로 추론되는 것을 에러로 간주하게되어 매개변수와 값을 명확히 하도록 만듦
        // "noImplicitAny": false, 
        
        // null 값을 잠재적으로 가질 수 있는 값에 접근하고 작업하는 방식을 엄격하게 알려줌
        // "strictNullChecks": true,
        
        // 함수 매개변수가 더 정확하게 추론하여 사용 가능
        // "strictFunctionTypes": true,
        
        // 호출 함수가 bind, call, apply메서드 중 어디에 해당하는지 확인하고
        // 함수를 제대로 설정했는지 확인
        // "strictBindCallApply": true,
        
        //class constructor 작성시 타입체크 강하게
        // "strictPropertyInitialization": true,
        
        //this 키워드가 any 타입일 경우 에러내기
        // "noImplicitThis": true,
        
        //자바스크립트 "use strict" 모드 켜기
        // "alwaysStrict": true,
        
        ```

- noUnusedLocals
  - 쓰지 않는 지역변수 있으면 에러
- noUnusedParameters
  - 쓰지 않는 파라미터 있으면 에러
- noImplicitReturns
  - 모든 경우 반환 해야하는 함수에서 return 없으면 에러
