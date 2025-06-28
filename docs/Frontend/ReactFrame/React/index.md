# React 框架详解

## React 基础概念

### 什么是 React？

React 是由 Facebook 开发的用于构建用户界面的 JavaScript 库。它采用组件化的开发模式，使用虚拟 DOM 来提高性能，并支持声明式编程范式。

### React 核心特性

- **组件化**：将 UI 拆分为独立、可复用的组件
- **虚拟 DOM**：提高渲染性能的关键技术
- **单向数据流**：数据从父组件流向子组件
- **JSX 语法**：在 JavaScript 中编写类似 HTML 的语法

## JSX 语法

### 基本 JSX

```jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// 使用组件
function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}
```

### JSX 表达式

```jsx
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);
```

## 组件与 Props

### 函数组件

```jsx
function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### 类组件

```jsx
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date() };
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}
```

## React Hooks

### useState Hook

```jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### useEffect Hook

```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  // 相当于 componentDidMount 和 componentDidUpdate:
  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

### 自定义 Hook

```jsx
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}

// 使用自定义 Hook
function UserProfile({ userId }) {
  const { data: user, loading, error } = useFetch(`/api/users/${userId}`);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

## 状态管理

### Context API

```jsx
import React, { createContext, useContext, useReducer } from 'react';

// 创建 Context
const ThemeContext = createContext();

// Theme Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用 Context
function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button 
      className={`btn btn-${theme}`}
      onClick={toggleTheme}
    >
      Toggle Theme
    </button>
  );
}
```

### useReducer Hook

```jsx
import React, { useReducer } from 'react';

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return initialState;
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <>
      Count: {state.count}
      <button onClick={() => dispatch({ type: 'reset' })}>
        Reset
      </button>
      <button onClick={() => dispatch({ type: 'increment' })}>
        +
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        -
      </button>
    </>
  );
}
```

## 性能优化

### React.memo

```jsx
const MyComponent = React.memo(function MyComponent({ name }) {
  return <div>Hello {name}</div>;
});

// 自定义比较函数
const MyComponent = React.memo(function MyComponent(props) {
  /* render using props */
}, function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
});
```

### useMemo 和 useCallback

```jsx
import React, { useMemo, useCallback } from 'react';

function ExpensiveComponent({ items, filter }) {
  // 缓存计算结果
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);

  // 缓存函数
  const handleClick = useCallback((id) => {
    console.log('Clicked item:', id);
  }, []);

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => handleClick(item.id)}>
          {item.name}
        </div>
      ))}
    </div>
  );
}
```

## 错误边界

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// 使用错误边界
function App() {
  return (
    <ErrorBoundary>
      <MyWidget />
    </ErrorBoundary>
  );
}
```

## React 18 新特性

### 并发特性

```jsx
import { createRoot } from 'react-dom/client';

// React 18 的新渲染方式
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
```

### Suspense 和 lazy

```jsx
import React, { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}
```

### useTransition

```jsx
import { useTransition, useState } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  function handleClick() {
    startTransition(() => {
      setCount(c => c + 1);
    });
  }

  return (
    <div>
      {isPending && <Spinner />}
      <button onClick={handleClick}>{count}</button>
    </div>
  );
}
```

## 最佳实践

### 组件设计原则

1. **单一职责原则**：每个组件只负责一个功能
2. **组合优于继承**：使用组合来复用代码
3. **Props 向下，事件向上**：数据流向清晰
4. **保持组件纯净**：避免副作用

### 代码组织

```
src/
  components/
    common/
      Button/
        Button.jsx
        Button.module.css
        index.js
    features/
      UserProfile/
        UserProfile.jsx
        UserProfile.test.js
        index.js
  hooks/
    useAuth.js
    useFetch.js
  utils/
    api.js
    helpers.js
  App.jsx
  index.js
```

### 性能优化建议

1. 使用 React.memo 包装纯组件
2. 合理使用 useMemo 和 useCallback
3. 避免在渲染函数中创建对象和函数
4. 使用 key 属性优化列表渲染
5. 代码分割和懒加载

## 测试

### 使用 React Testing Library

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter', () => {
  render(<Counter />);
  
  const button = screen.getByRole('button', { name: /increment/i });
  const count = screen.getByText(/count: 0/i);
  
  fireEvent.click(button);
  
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

## 参考资源

- [React 官方文档](https://react.dev/)
- [React Hooks 文档](https://react.dev/reference/react)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)