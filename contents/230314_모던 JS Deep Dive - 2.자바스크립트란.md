---
date: '2023-03-14'
title: '모던 JS Deep Dive - 2. 자바스크립트란'
categories: ['Web Frontend', 'TIL', 'JavaScript']
summary: 'imperative, functional, prototype-based'
thumbnail: './javascript.png'
---

# 2.1 자바스크립트의 탄생

- 1995년 넷스케이프 커뮤니케이션즈(Netscape com-munications)는 웹페이지 보조적 기능 수행을 위해 브라우저에서 동작하는 경량 프로그래밍 언어, 자바스크립트(Brendan Eich가 개발) 도입.
- 자바스크립트 이름 변화
  - Mocah → LiveScript로 → JavaScript

# 2.2 자바스크립트 표준화

- 마이크로소프트의 자바스크립트 파생 버전 ‘JScript’를 인터넷 익스플로러에 탑재
- 넷스케이프 커뮤니케이션즈와 마이크로소프트는 자사 브라우저 시장 점유율을 높이기 위해 자사 브라우저에서만 동작하는 기능을 경쟁적으로 추가하기 시작
- 브라우저에 따라 웹페이지가 정삭적으로 동작하지 않는 **크로스 브라우징** 이슈가 발생하기 시작
- 자바스크립트의 파편화 방지를 위해 표준화된 자바스크립트의 필요성이 대두되기 시작했고 넷스케이프 커뮤니케이션즈는 **ECMA 인터네셔널**(컴퓨터 시스템의 표준을 관리하는 비영리 표준화 기구)에 자바스크립트 표준화를 요청
- 상표권 문제로 자바스크립트는 ECMAScript로 명명 됨.
- **EMCAScript 버전별 특징**

| 버전 | 출시 연도 | 특징 |
| --- | --- | --- |
| ES1 | 1997 | 초판 |
| ES2 | 1998 | ISO/IEC 16262 국제 표준과 동일한 규격 적용 |
| ES3 | 1999 | 정규 표현식, try…catch |
| ES5 | 2009 | HTML5와 함께 출현한 표준안, JSON, strict mode, 접근자 프로퍼티, 프로퍼티 어트리뷰트 제어, 항향상된 배열 조작 기능(forEach, map, filter, reduce, some, every) |
| ES6(ECMAScript 2015) | 2015 | let/const, 클래스, 호살표 함수, 템플릿 리터럴, 디스트럭처링 할당, 스프레드 문법, rest 파라미터, 심벌, 프로미스, Map/Set, 이터러블, fro…of, 제너레이터, Proxy, 모듈 import/export |
| ES7(ECMAScript 2016) | 2016 | 지수(**) 연산자, Array.prototype.includes, String.prototype.includes |
| ES8(ECMAScript 2017) | 2017 | async/await, Object 정적 메서드(Object.values, Object.entries, Object.getOwnPropertyDescriptors) |
| ES9(ECMAScript 2018) | 2018 | Object rest/spread 프로퍼티, Promise.prototype.finally, async generator, for awit … of |
| ES10(ECMAScript 2019) | 2019 | Object.fromEntries, Array.protoytpe.flat, Array.prototype.flatMap, optional catch binding |
| ES10(ECMAScript 2020) | 2020 | String.prptotype.matchAll, BigInt, globalThis, Promise.allSettled, null 병합 연산자, 옵셔널 체이닝 연산자, for…in enumeration order |

# 2.3 자바스크립트 성장의 역사

- 초창기 자바스크립트
  - 웹페이지 보조적 기능 수행위한 한정적 용도
  - 대부분 로직 웹서버에서 실행, 브라우저는 서버로부터 전달받은 HTML과 CSS를 단순히 렌더링하는 수준

## 2.3.1 Ajax

- 자바스크립트를 이용해 서버와 브라우저가 **비동기(asynchronous)** 방식으로 데이터를 교환할 수 있는 통신 기능인 **Ajax(Asynchronous JavaScript and XML)**가 **XMLHttpRequset**라는 이름으로 등장
- Ajax 이전에는 HTML 코드를 서버로 전송받아 전체를 렌더링하는 방식. 화면 전환되면 서버로부터 새로운 HTML 전송받아 처음부터 다시 렌더링
  - 불필요한 데이터 통신 발생, 변경 필요 없는 부분까지 다시 렌더링
  - 성능 이슈, 화면 전환으로 인한 순간적 깜빡이는 현상
- **Ajax 등장 이후, 필요한 부분 렌더링, 웹 브라우저에서도 빠른 성능과 부드러운 화면 전환 가능**
- 구글의 구글 맵스 발표로 **웹 애플리케이션 프로그래밍 언어**로서 자바스크립트 가능성 확인

## 2.3.2 jQuery

- **jQuery 등장으로 DOM(Document Object Model)을 쉽게 제어할 수 있고 크로스 브라우징 이슈 부분 해결.**
- 어려운 자바스크립트보다 쉽고 직관적인 jQuery 선호하는 개발자가 양산되기 도함

## V8 자바스크립트 엔진

- V8 자바스크립트 엔진의 등장으로 자바스크립트는 데스크톱 애플리케이션과 유사한 사용자 경험(UX; user experience)을 제공할 수 있는 웹 애플리케이션 프로그래밍 언어로 정착
- 과거 **웹 서버에서 수행되던 로직들이 대거 클라이언트(브라우저)로 이동**했고 프론트엔드 영역이 주목 받는 계기

## 2.3.4 Node.js

- Ryan Dahl이 발표한 Node.js는 V8 자바스크립트 엔진으로 빌드된 자바스크립트 런타임 환경(runtime Environment).
- 브라우저 자바스크립트 엔진에서만 동작하던 **자바스크립트를 브라우저 이외의 환경에서도 동작할 수 있도록 자바스크립트 엔진을 브라우저에서 독립시킨 자바스크립트 실행환경**
- 서버 사이드 애플리케이션 개발에 주로 사용되며, 필요한 모듈, 파일 시스템, HTTP 등 빌트인(built-in) API를 제공.
- 프런트엔드와 백엔드 영역에서 자바스크립트를 사용할 수 있다는 동형성(isomorphc)은 별도 언어 학습시간을 줄일 수 있다는 장점
- Node.js는 비동기 I/O 지원, 단일 스레드(single thread) 이벤트 루프 기반으로 동작함으로써 request 처리 성능이 좋다. 따라서, 데이처를 실시간 처리하기 위해 I/O가 빈번 발생하는 SPA(Single Page Application)에 적합
- 하지만, CPU 사용률이 높은 애플리케이션에는 비권장
- 브라우저를 벗어나 서버 사이드 애플리케이션 개발에서도 사용할 수 있는 범용 프로그래밍 언어가 됨

자바스크립트는 크로스 플랫폼을 위한 가장 중요한 언어로 주목 받고 있음.

웹, 모바일 하이브리드 앱(PhoneGap, Ionic), 서버사이드(Node.js), 데스크톱(Electron), 머신러닝(TensorFlow.js), 로보틱스(Johnny-Five) 환경을 위한 프로그래밍 언어로서 세계에서 가장 인기 있는 프로그래밍 언어.

## 2.3.5 SPA 프레임워크

- 모던 웹 애플리케이션은 개발 규모와 복잡도가 상승했기 때문에 더 많은 패턴과 라이브러리가 출현
- 변경에 유연하면서 확장하기 쉬운 애플리케이션 아키텍처 구축이 어려워졌고 프레임워크가 등장
- **CBD**(Component based development) 방법론을 기반으로 하는 SPA가 대중화되면서 Angular, React, Vue.js, Svelte 등 다양한  SPA 프레임워크/라이브러리 출현

# 2.4 자바스크립트와 ECMAScript

- ECMAScript는 자바스크립트 표준 사양인 ECMA-262를 말하며, 프로그래밍 언어의 값, 타입, 객체와 프로퍼티, 함수, 표준 빌트인 객체(Standard built-in object)등 핵심 문법 규정
- 각 브라우저 제조사는 ECMASciprt 사양을 준수해 브라우저에서 내장되는 자바스크립트 엔진 구현함
- 자바스크립트는 일반적으로 프로그래밍 언어로서 기본 core를 이루는 ECMAScript와 브라우저가 별도 지원하는 클라이언트 사이드 Wev API, 즉 DOM, BOM, Canvas, XMLHttpRequest, fetch, requestAnimationFrame, SVG, Web Stroage, Web Component, Web Worker 등을 아우르는 개념
- 클라이언트 사이드 Webp API는 ECMAScript와는 별도로 W3C(World Wide Web Consortium)에서 별도 사양 관리

# 2.5 자바스크립트의 특징

- 자바스크립트는 웹 브라우저에서 동작하는 유일한 프로그래밍 언어.
- 기본 문법 c,와 자바와 유사하고 self 에서는 프로토타입 기반 상속을, scheme에서는 일급 함수 개념을 차용
- 개발자가 별도의 컴파일 작업을 수행하지 않는 interpreter language
- 대부분의 모던 자바스크립트 엔진은 인터프리터와 컴파일러 장점을 결합해 비교적 처리속도가 느린 인터프리터의 단점 해결
- 인터프리터는 소스 코드를 즉시 실행하고 컴파일러는 빠르게 동작하는 머신 코드를 생성하고 최적화 한다.
- cf) 컴파일러 언어 vs 인터프리터 언어
- 자바스크립트는 일반적으로 인터프리터 언어로 구분한다.
  - 하지만 대부분 모던 브라우저에서 사용되는 인터프리터는 전통적 컴파일러 언어처럼 명시적인 컴파일 단계를 거치지는 않지만 복잡한 과정을 거치며 일부 소스코드를 컴파일 하고 실행한다.
  - 이를 통해 인터프리터 언어 장점인 동적 기능 지원을 살리면서 실행속도가 느리다는 단점을 극복.
  - 자바스크립트는 런타임에 컴파일되며 실행 파일이 생성되지 않고 인터프리터 도움 없이 실행할 수 없기 때문에 컴파일러 언어라고는 할 수 없다.
- 명령형(imperative), 함수형(functional), 프로토타입 기반(prototype-based) 객체지향 프로그래밍을 지원하는 멀티 패러다임 프로그래밍 언어
- 자바스크립트는 프로토타입 기반의 객체지향 언어(ES6 에서 클래스 도입)

# 2.5 ES6 브라우저 지원 현황

- 대부분의 모던 브라우저는 ES6를 지원하지만 100%는 아니다.
- 아래 사이트에서 지원 현황 확인 가능

  [ECMAScript 6 compatibility table](http://kangax.github.io/compat-table/es6/)

- 구형 브라우저는 ES6를 대부분 지원하지 않기 때문에 최신 기능을 사용하거나 해당 브라우저를 고려해야 하는 상황이라면 Babel과 같은 트랜스 파일러를 사용해 ES6 이상으로 구현한 소스 코드를 다운그레이드할 필요도 있다.

# 출처

- 이웅모, **『모던 자바스크립트 Deep Dive 자바스크립트의 기본 개념과 동작 원리』**, 위키북스(2020).
