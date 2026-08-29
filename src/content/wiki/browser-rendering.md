---
title: '브라우저는 주소창에 URL을 넣으면 무엇을 하나'
description: 'DNS 조회부터 DOM·CSSOM·Render Tree, Layout과 Paint까지. 그리고 어떤 CSS 속성이 Layout을 다시 유발하는가.'
topic: 'web'
tags: ['브라우저', '렌더링', 'DOM', 'CSSOM', 'Reflow']
created: 2023-02-07
updated: 2026-08-30
status: 'stable'
---

## 주소를 입력하면 벌어지는 일

1. 주소창에 URL을 입력한다
2. **캐싱된 DNS 기록**을 먼저 본다. 없으면 DNS에 질의해 IP를 받는다
3. 서버와 **TCP 3-way handshake**로 연결한다. HTTPS면 여기에 **TLS handshake**가 더해진다
4. HTTP 요청을 보낸다
5. 응답으로 HTML을 받는다
6. **파싱하며 그린다** — 데이터를 다 받고 시작하는 게 아니라, 받는 대로 반복해서 일어난다

## 브라우저의 구성

| 구성 요소 | 하는 일 |
|---|---|
| **사용자 인터페이스** | 주소 표시줄, 뒤로/앞으로, 새로고침 등 |
| **브라우저 엔진** | UI와 렌더링 엔진 사이의 동작을 제어. 데이터 저장소를 참조 |
| **렌더링 엔진** | HTML·CSS를 파싱해 화면에 그린다 |
| **통신(Networking)** | HTTP 요청을 처리하고 응답을 넘긴다 |
| **자바스크립트 해석기** | JS를 파싱·실행 (크롬은 V8) |
| **UI 백엔드** | 렌더 트리를 실제로 브라우저에 그린다 |
| **데이터 저장소** | 로컬 스토리지, 쿠키 등 |

렌더링 엔진은 브라우저마다 다르다. Firefox는 **Gecko**, Safari는 **WebKit**, Chrome은 WebKit에서 갈라져 나온 **Blink**(버전 28부터)를 쓴다.

## 렌더링 과정

### 1. DOM Tree — 무엇을 그릴지

렌더링 엔진이 HTML을 파싱해 브라우저가 이해할 수 있는 자료구조로 만든다. HTML 요소 간의 부모-자식 관계를 반영한 **트리**다.

### 2. CSSOM Tree — 어떻게 그릴지

CSS를 파싱해 만든다. **HTML 대신 CSS를 대상으로 하는 DOM**이라고 생각하면 된다. JS로 스타일을 동적으로 읽고 수정할 수 있는 통로이기도 하다.

### 3. 중간에 끼어드는 자바스크립트

여기가 중요하다.

```
HTML 파싱 중 <script> 만남
  → DOM 생성 중단
  → 자바스크립트 엔진에 제어권 넘김
  → 파일 요청·수신·파싱·실행 (AST 생성 후 실행)
  → 렌더링 엔진에 제어권 반환
  → 중단했던 지점부터 DOM 생성 재개
```

**스크립트가 DOM 생성을 막는다.** `<script>`를 `<body>` 끝에 두거나 `defer`를 쓰는 이유가 이것이다.

### 4. Render Tree — 화면에 그려질 것만

DOM과 CSSOM을 결합한다. **표시할 노드만** 포함한다.

- `script`, `meta`처럼 화면에 안 보이는 태그는 제외
- `display: none`인 요소도 제외

> `visibility: hidden`은 **공간을 차지하므로 렌더 트리에 남는다.** `display: none`과 여기서 갈린다.

### 5. Layout (Reflow) — 어디에 얼마나

뷰포트 안에서 각 요소의 정확한 위치와 크기를 계산한다. `em`, `%` 같은 상대 단위가 여기서 픽셀로 확정된다.

### 6. Paint — 실제 픽셀로

렌더 트리의 요소·텍스트·이미지가 픽셀로 그려진다.

### 7. Composite — 레이어 합성

그려진 레이어들을 순서대로 합친다.

## Critical Rendering Path와 성능

요즘 화면은 **초당 60번** 다시 그린다(60fps). 브라우저가 이걸 못 따라가면 스크롤이나 드래그에서 버벅임(**Jank**)이 생긴다.

그래서 중요한 게 **어느 단계부터 다시 도는가**다.

| 상황 | 다시 도는 단계 |
|---|---|
| 요소의 크기·위치 변경, 창 크기 변경 | JS → Style → **Layout** → Paint → Composite |
| 배경색·글자색·그림자 등 **크기가 안 변하는** 변경 | JS → Style → ~~Layout~~ → **Paint** → Composite |
| `transform`, `opacity` 등 | JS → Style → ~~Layout~~ → ~~Paint~~ → **Composite** |

**세 번째가 가장 싸다.** 애니메이션을 `left`/`top`이 아니라 `transform`으로 만드는 이유가 여기 있다. Layout과 Paint를 건너뛰고 합성만 하기 때문이다.

어떤 CSS 속성이 어느 단계를 유발하는지는 **CSS Triggers** 같은 자료로 확인할 수 있다.

## 더 볼 것

- [네트워크 기초와 TCP/IP](/wiki/network-basics-and-tcp-ip/) — 1~3단계의 실제 동작
- [MPA·SPA·CSR·SSR·SSG](/wiki/rendering-strategies/) — 이 과정을 어디서 할 것인가
