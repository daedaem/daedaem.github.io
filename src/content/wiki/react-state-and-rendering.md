---
title: 'setState가 비동기라는 말의 뜻'
description: 'useState의 지연 초기화, 이전 값에 의존할 때 콜백을 써야 하는 이유, 그리고 React 18에서 바뀐 자동 배칭.'
topic: 'web'
tags: ['React', 'useState', '렌더링', '배칭']
created: 2023-01-05
updated: 2026-08-30
status: 'stable'
---

## useState

함수형 컴포넌트에서 상태를 다루기 위한 훅이다. 배열을 반환하므로 구조 분해로 받는다.

```javascript
const [content, setContent] = useState(초기값)
```

`setContent`로 값이 바뀌면 컴포넌트가 다시 렌더링된다. 같은 값(`Object.is` 기준)이면 건너뛴다.

### 초기값이 무거우면 함수로 넘긴다

이게 놓치기 쉬운 부분이다.

```javascript
const heavyWork = () => [1, 2, /* ... */ 1000000]

// ❌ 렌더될 때마다 heavyWork()가 실행된다
const [cost, setCost] = useState(heavyWork())

// ✅ 최초 한 번만 실행된다 (지연 초기화)
const [cost, setCost] = useState(() => heavyWork())
```

첫 번째는 **결과를 인자로 넘기므로 매 렌더마다 함수가 호출된다.** 결과값은 첫 렌더 이후 무시되는데도 계산은 계속한다. 두 번째는 함수 자체를 넘기고 React가 최초에만 호출한다.

## 이전 값에 의존하면 콜백을 쓴다

```javascript
setCount(count + 1)   // ❌ 렌더 시점의 count를 캡처
setCount(c => c + 1)  // ✅ 최신 값을 받아서 계산
```

왜 문제가 되는지는 두 번 연달아 호출해보면 명확하다.

```javascript
const countIncreaseHandler = () => {
  setCount(count + 1)   // count가 1이면 → 2
  setCount(count * 2)   // count는 여전히 1 → 2
  // 결과: 2. 마지막 호출이 덮어쓴다
}
```

```javascript
const countIncreaseHandler = () => {
  setCount(c => c + 1)  // 1 → 2
  setCount(c => c * 2)  // 2 → 4
  // 결과: 4
}
```

**`count`는 그 렌더의 스냅샷이라 함수 안에서 바뀌지 않는다.** 콜백 형태를 쓰면 React가 큐에 쌓인 갱신을 순서대로 적용하며 직전 결과를 넘겨준다.

배열에 항목을 추가할 때도 마찬가지다.

```javascript
setExpenses(prev => [expense, ...prev])
```

## 배칭 — React 18에서 바뀐 것

여러 `setState`를 한 번의 렌더링으로 묶는 것을 배칭이라고 한다. **여기가 버전에 따라 다르다.**

| | React 17 이하 | **React 18 이상 (`createRoot`)** |
|---|---|---|
| React 이벤트 핸들러 안 | 배칭됨 | 배칭됨 |
| `setTimeout` 안 | **배칭 안 됨** | **배칭됨** |
| Promise·async 안 | **배칭 안 됨** | **배칭됨** |
| 네이티브 이벤트 핸들러 안 | **배칭 안 됨** | **배칭됨** |

React 17까지는 **React가 관리하는 이벤트 핸들러 안에서만** 배칭했다. 그래서 `await` 뒤에 있는 `setState` 두 개는 렌더링을 두 번 일으켰다.

React 18의 **자동 배칭(automatic batching)** 이 이걸 전부 묶는다. 단, `createRoot`로 마운트했을 때다. React 18에서도 레거시 `ReactDOM.render`를 쓰면 17의 동작이 유지된다. 즉 "콜백이나 프로미스가 없어야 배칭된다"는 설명은 **React 17까지의 이야기**다.

배칭을 피해야 하는 드문 경우에는 `flushSync`를 쓴다.

```javascript
import { flushSync } from 'react-dom'

flushSync(() => setCount(c => c + 1))   // 즉시 렌더링
```

## "비동기"라는 말의 의미

`setState`가 비동기라는 말은 **네트워크 요청처럼 나중에 실행된다는 뜻이 아니다.** 호출 직후에 상태 변수를 읽어도 옛 값이라는 뜻이다.

```javascript
setCount(5)
console.log(count)   // 5가 아니라 이전 값
```

상태는 렌더링 사이에 고정된 스냅샷이고, 다음 렌더에서야 새 값이 들어온다. 갱신 후의 값이 필요하면 계산한 값을 따로 들고 있거나 `useEffect`로 받는다.

## 반복 렌더링과 key

```javascript
{props.userData.map(user => (
  <li key={user.id}>
    {user.name} ({user.age} years old)
  </li>
))}
```

`key`는 React가 **어떤 항목이 바뀌고 추가되고 지워졌는지 식별하는 값**이다. 배열 인덱스를 key로 쓰면 중간에 항목을 삽입·삭제할 때 다른 항목으로 잘못 매칭되어 상태가 엉킨다. 고유한 id를 쓴다.

## 재사용 가능한 컴포넌트

`props.children`으로 내용을 받고, `className`을 받아 스타일을 바깥에서 정하게 하면 껍데기를 공유할 수 있다.

```javascript
import classes from './Card.module.css'

const Card = props => (
  <div className={`${classes.card} ${props.className}`}>{props.children}</div>
)
```

## 더 볼 것

- [React Context와 Redux — 무엇을 언제 쓰나](/wiki/react-context-and-redux/)
- [커스텀 훅 — 로직을 컴포넌트에서 떼어내기](/wiki/react-custom-hooks/)
- [브라우저는 주소창에 URL을 넣으면 무엇을 하나](/wiki/browser-rendering/)
