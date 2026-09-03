---
title: '커스텀 훅 — 로직을 컴포넌트에서 떼어내기'
description: 'use로 시작해야 하는 이유, 훅마다 상태가 격리된다는 것, 그리고 useCallback 없이 쓰면 무한 루프에 빠지는 이유.'
topic: 'web'
tags: ['React', 'Custom Hooks', 'useCallback', 'useEffect']
created: 2023-03-01
updated: 2026-08-30
status: 'stable'
---

## 왜 쓰나

여러 컴포넌트에서 같은 로직을 반복할 때, 일반 함수로는 못 빼는 부분이 있다. **`useState`나 `useEffect` 같은 훅은 컴포넌트 함수 안에서만 호출할 수 있기 때문이다.**

커스텀 훅은 이 제약을 우회하는 게 아니라, **React가 훅으로 인정하는 함수를 하나 더 만드는 것**이다. 그래서 이름 규칙이 있다.

> 커스텀 훅의 이름은 반드시 **`use`로 시작해야 한다.**

React 런타임이 이름을 검사하는 것은 아니다. ESLint의 훅 규칙(과 React Compiler)이 이 이름 규칙에 기대어 "이 함수 안에서 훅을 호출해도 되는지"를 판단하고 위반을 잡아낸다. 사람과 도구를 위한 관례다.

## 상태는 훅마다 격리된다

가장 헷갈리는 부분이다. **커스텀 훅을 쓰는 컴포넌트들이 상태를 공유하지 않는다.**

```javascript
// hooks/use-counter.js
import { useState, useEffect } from 'react'

const useCounter = (forwards = true) => {
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(prev => (forwards ? prev + 1 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)   // 정리 함수를 빠뜨리면 인터벌이 쌓인다
  }, [forwards])

  return counter
}

export default useCounter
```

```javascript
const ForwardCounter = () => <Card>{useCounter()}</Card>
const BackwardCounter = () => <Card>{useCounter(false)}</Card>
```

두 컴포넌트는 각각 **자기만의 `counter` 상태**를 갖는다. 훅을 쓰는 컴포넌트 인스턴스마다 별도의 상태가 만들어진다. 렌더마다 훅이 다시 호출되지만 상태는 유지된다. 공유하고 싶으면 Context나 Redux를 써야 한다. 커스텀 훅은 **상태 공유가 아니라 로직 공유** 도구다.

반환값도 자유다. 값 하나, 객체, 배열 — 필요한 형태로 돌려주면 된다.

## 실전 — HTTP 요청 훅

컴포넌트마다 반복되는 loading/error/fetch 처리를 묶는다.

```javascript
// hooks/use-http.js
import { useState, useCallback } from 'react'

const useHttp = (requestConfig, applyData) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendRequest = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(requestConfig.url, {
        method: requestConfig.method || 'GET',
        headers: requestConfig.headers || {},
        body: requestConfig.body ? JSON.stringify(requestConfig.body) : null,
      })
      if (!response.ok) throw new Error('Request failed!')

      const data = await response.json()
      applyData(data)
    } catch (err) {
      setError(err.message || 'Something went wrong!')
    }
    setIsLoading(false)
  }, [requestConfig, applyData])

  return { isLoading, error, sendRequest }
}
```

`applyData`를 인자로 받는 게 핵심이다. **가져온 데이터를 어떻게 쓸지는 훅이 정하지 않고 호출한 쪽이 정한다.** 훅은 요청·로딩·에러만 책임진다.

## useCallback을 빼면 무한 루프에 빠진다

여기가 실수하기 쉬운 지점이다.

```javascript
const { isLoading, error, sendRequest: fetchTasks } = useHttp(
  { url: 'https://.../tasks.json' },
  transformTasks,
)

useEffect(() => {
  fetchTasks()
}, [fetchTasks])
```

`useCallback`이 없으면 이렇게 돈다.

```
fetchTasks 재생성 → useEffect 의존성 변경 → 실행 → setState → 리렌더
   ↑                                                              ↓
   └──────────────────────────────────────────────────────────────┘
```

**함수는 렌더될 때마다 새 객체로 만들어지므로** 의존성 배열이 매번 "바뀐 것"으로 판정된다. `useCallback`으로 감싸면 의존성이 실제로 바뀔 때만 새로 만들어져 루프가 끊긴다.

주의할 게 하나 더 있다. 위 예시의 `requestConfig`가 **호출부에서 인라인 객체 리터럴로 넘어오면** 그것도 매 렌더마다 새 객체다. 그러면 `useCallback`의 의존성이 매번 바뀌어 루프가 다시 생긴다. 설정 객체를 `useMemo`로 감싸거나, 훅 시그니처를 바꿔 `sendRequest(config)`처럼 호출 시점에 받는 편이 안전하다.

## 정리 순서

1. 반복되는 로직을 찾는다
2. `use`로 시작하는 함수로 옮긴다
3. 컴포넌트마다 달라지는 부분은 **인자로 받는다** (`forwards`, `applyData`)
4. 훅이 반환하는 함수를 `useEffect` 의존성이나 memo된 자식에 넘길 거라면 `useCallback`으로 감싼다. 그럴 일이 없으면 감싸지 않는다
5. `useEffect` 안에서 구독·타이머를 만들면 **정리 함수를 반환한다**

## 더 볼 것

- [React 상태와 렌더링](/wiki/react-state-and-rendering/)
- [React Context와 Redux](/wiki/react-context-and-redux/)
