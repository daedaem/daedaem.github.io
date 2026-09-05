---
draft: false
title: 'React Context와 Redux'
description: 'Context는 상태 관리 도구가 아니다. 전달과 관리의 차이, Context의 두 가지 한계, 그리고 Redux의 단방향 흐름.'
topic: 'web'
tags: ['React', 'Context', 'Redux', '상태관리']
created: 2023-02-02
updated: 2026-09-05
status: 'stable'
---

## 상태를 셋으로 나눠 보기

무엇을 쓸지는 **상태의 범위**로 정해진다.

| 범위 | 예 | 방법 |
|---|---|---|
| **로컬** — 한 컴포넌트에 속함 | 더보기 버튼 토글, 입력값 | `useState`, `useReducer` |
| **컴포넌트 간** — 여러 컴포넌트에 영향 | 모달 열림 상태 | props chain, Context, Redux |
| **앱 전역** | 사용자 인증 상태 | Context, Redux |

## Context는 상태 관리 도구가 아니다

여기가 가장 자주 오해되는 지점이다.

> React 공식 문서는 Context를 설명하면서 **"전달"과 "공유"만 말하고 "관리"는 말하지 않는다.**

Context가 하는 일은 **단계마다 props를 넘기지 않고도 트리 전체에 값을 내려주는 것**이다. props drilling을 없애는 도구지, 상태를 어떻게 바꿀지 관리하는 도구가 아니다. Redux와 여기서 갈린다.

의존성 주입에 가깝다고 보면 이해가 쉽다.

### 쓰는 법

```javascript
// store/auth-context.js
const AuthContext = React.createContext({ isLoggedIn: false })
export default AuthContext
```

```javascript
// Provider로 감싸면 모든 자식이 접근할 수 있다
<AuthContext.Provider value={{ isLoggedIn }}>
  <MainHeader />
  <main>{isLoggedIn ? <Home /> : <Login />}</main>
</AuthContext.Provider>
```

```javascript
// 읽기 — useContext가 일반적인 방법
const ctx = useContext(AuthContext)
return ctx.isLoggedIn && <button onClick={props.onLogout}>Logout</button>
```

`Context.Consumer`로 감싸 함수를 넘기는 방식도 있지만 중첩이 깊어져 `useContext`를 쓴다.

두 가지를 기억하면 된다. **Context는 여러 개 만들 수 있고, Consumer는 가장 가까운 Provider의 값을 참조한다.**

### Provider를 따로 떼어내기

앱 컴포넌트에 상태 관리 로직이 쌓이면 분리한다.

```javascript
// auth-context.js
export const AuthContextProvider = props => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === '1') setIsLoggedIn(true)
  }, [])

  const loginHandler = () => {
    localStorage.setItem('isLoggedIn', '1')
    setIsLoggedIn(true)
  }
  const logoutHandler = () => {
    localStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, onLogin: loginHandler, onLogout: logoutHandler }}>
      {props.children}
    </AuthContext.Provider>
  )
}
```

App은 화면을 그리는 데 집중하고, 인증 상태 관리는 context 파일이 맡는다. **컴포넌트 하나가 하나의 임무만 갖게 하는 것**이다.

이 예제의 `localStorage.isLoggedIn`은 화면 상태를 설명하기 위한 값이다. 사용자가 직접 바꿀 수 있으므로 실제 인증 근거로 사용하면 안 된다. 실제 서비스는 서버가 세션이나 토큰을 검증하고, 클라이언트는 그 결과로 표시 상태를 갱신한다.

## Context의 두 가지 한계

### 1. 컴포넌트 구성을 대체하지 못한다

```javascript
const Button = props => (
  <button
    className={`${classes.button} ${props.className}`}
    onClick={props.onClick}   // context의 로그아웃을 직접 부르면 이 버튼은 로그아웃 전용이 된다
  >
    {props.children}
  </button>
)
```

여러 곳에서 공통으로 쓸 컴포넌트에 특정 context 동작을 박아 넣으면 **재사용이 막힌다.** 이런 건 props로 받는다.

### 2. 상태 변경이 잦으면 맞지 않는다

Provider의 `value`가 바뀌면 **구독 중인 컴포넌트가 전부 다시 렌더링된다.** 매초 바뀌는 값 같은 것에는 부적합하다.

그리고 Provider가 늘면 중첩이 깊어진다.

```javascript
<AuthContextProvider>
  <ThemeContextProvider>
    <UIInteractionContextProvider>
      <MultiStepFormContextProvider>
        <UserRegistration />
      </MultiStepFormContextProvider>
    </UIInteractionContextProvider>
  </ThemeContextProvider>
</AuthContextProvider>
```

## Redux

**예측 가능한 상태 컨테이너**다. 컴포넌트 간 상태와 앱 전역 상태를 위한 관리 시스템이다.

구성 요소는 넷이다.

**중앙 저장소** — 데이터를 한 곳에서만 관리한다. 상태가 바뀌면 구독 중인 컴포넌트에 알린다.

**컴포넌트** — 저장소를 구독하고, **액션을 발송(dispatch)** 한다. 중요한 규칙이 있다. **컴포넌트는 저장된 데이터를 직접 바꾸지 않는다.** 흐름이 한 방향이다.

**액션** — 리듀서가 무엇을 해야 하는지 설명하는 평범한 자바스크립트 객체다.

**리듀서 함수** — 저장소 데이터 변경을 담당한다. 규칙이 셋이다.

- 입력은 **이전 상태**와 **발송된 액션** 두 가지
- 출력은 **새 상태 객체**
- **항상 순수 함수여야 한다** — 같은 입력에 같은 출력. HTTP 요청이나 로컬 저장소 접근을 넣으면 안 된다

```javascript
const counterReducer = (state = { counter: 0 }, action) => {
  if (action.type === 'increment') return { counter: state.counter + 1 }
  if (action.type === 'decrement') return { counter: state.counter - 1 }
  return state
}

const store = redux.createStore(counterReducer)
store.subscribe(() => console.log(store.getState()))

store.dispatch({ type: 'increment' })   // { counter: 1 }
store.dispatch({ type: 'decrement' })   // { counter: 0 }
```

> `createStore`는 현재 deprecated이고, 실무에서는 **Redux Toolkit**의 `configureStore`와 `createSlice`를 쓴다. 위 코드는 리듀서와 액션의 원리를 보기 위한 것이다.

## 그래서 무엇을 쓰나

- **props drilling을 피하는 게 목적이라면** → Context
- **적당히 복잡하고 외부 라이브러리를 안 쓰고 싶다면** → Context + `useReducer`
- **특정 컴포넌트만 다시 렌더링하거나, 사이드 이펙트 제어가 필요하다면** → Redux (+ React-Redux)

## 더 볼 것

- [React 상태와 렌더링](/wiki/react-state-and-rendering/)
- [디자인 패턴 — Flux 패턴](/wiki/design-patterns/) — Redux의 뿌리
