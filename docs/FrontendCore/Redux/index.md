# Redux

## 简介

Redux 是一个用于 JavaScript 应用程序的可预测状态容器。它帮助你编写行为一致、运行在不同环境（客户端、服务器和原生应用）中、易于测试的应用程序。

### 核心原则

1. **单一数据源**：整个应用的状态存储在一个对象树中，并且这个对象树只存在于唯一一个 store 中
2. **状态是只读的**：唯一改变状态的方法就是触发 action，action 是一个用于描述已发生事件的普通对象
3. **使用纯函数来执行修改**：为了描述 action 如何改变状态树，你需要编写 reducers

### 适用场景

- 应用中有很多状态需要在多个组件中共享
- 应用状态会频繁更新
- 更新状态的逻辑复杂
- 应用有中等或大型的代码库，需要多人协作开发

## 核心概念

### Action

Action 是把数据从应用传到 store 的有效载荷，是 store 数据的唯一来源。

```javascript
// Action 类型常量
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER';

// Action 创建函数
function addTodo(text) {
  return {
    type: ADD_TODO,
    id: nextTodoId++,
    text
  };
}

function toggleTodo(id) {
  return {
    type: TOGGLE_TODO,
    id
  };
}

function setVisibilityFilter(filter) {
  return {
    type: SET_VISIBILITY_FILTER,
    filter
  };
}
```

### Reducer

Reducer 指定了应用状态的变化如何响应 actions 并发送到 store。

```javascript
// 初始状态
const initialState = {
  todos: [],
  visibilityFilter: 'SHOW_ALL'
};

// Reducer 函数
function todoApp(state = initialState, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: action.id,
            text: action.text,
            completed: false
          }
        ]
      };
    case TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(todo =>
          todo.id === action.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      };
    case SET_VISIBILITY_FILTER:
      return {
        ...state,
        visibilityFilter: action.filter
      };
    default:
      return state;
  }
}
```

### Store

Store 是把 action 和 reducer 联系到一起的对象。

```javascript
import { createStore } from 'redux';
import todoApp from './reducers';

// 创建 store
const store = createStore(todoApp);

// 获取状态
console.log(store.getState());

// 监听状态变化
const unsubscribe = store.subscribe(() =>
  console.log(store.getState())
);

// 发起 action
store.dispatch(addTodo('Learn about actions'));
store.dispatch(addTodo('Learn about reducers'));
store.dispatch(toggleTodo(0));
store.dispatch(setVisibilityFilter('SHOW_COMPLETED'));

// 停止监听状态更新
unsubscribe();
```

## Redux Toolkit (RTK)

Redux Toolkit 是官方推荐的编写 Redux 逻辑的方法，它简化了 Redux 的使用。

### 安装

```bash
npm install @reduxjs/toolkit react-redux
# 或
yarn add @reduxjs/toolkit react-redux
```

### 创建 Slice

```javascript
import { createSlice } from '@reduxjs/toolkit';

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all'
  },
  reducers: {
    addTodo: (state, action) => {
      state.items.push({
        id: Date.now(),
        text: action.payload,
        completed: false
      });
    },
    toggleTodo: (state, action) => {
      const todo = state.items.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    deleteTodo: (state, action) => {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    }
  }
});

export const { addTodo, toggleTodo, deleteTodo, setFilter } = todosSlice.actions;
export default todosSlice.reducer;
```

### 配置 Store

```javascript
import { configureStore } from '@reduxjs/toolkit';
import todosReducer from './todosSlice';
import userReducer from './userSlice';

const store = configureStore({
  reducer: {
    todos: todosReducer,
    user: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
```

## 在 React 中使用 Redux

### 提供 Store

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

### 连接组件

#### 使用 Hooks (推荐)

```jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTodo, toggleTodo, deleteTodo, setFilter } from './todosSlice';

function TodoApp() {
  const [inputValue, setInputValue] = useState('');
  const todos = useSelector(state => state.todos.items);
  const filter = useSelector(state => state.todos.filter);
  const dispatch = useDispatch();

  const filteredTodos = todos.filter(todo => {
    if (filter === 'completed') return todo.completed;
    if (filter === 'active') return !todo.completed;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch(addTodo(inputValue));
      setInputValue('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a todo"
        />
        <button type="submit">Add</button>
      </form>

      <div>
        <button onClick={() => dispatch(setFilter('all'))}>All</button>
        <button onClick={() => dispatch(setFilter('active'))}>Active</button>
        <button onClick={() => dispatch(setFilter('completed'))}>Completed</button>
      </div>

      <ul>
        {filteredTodos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => dispatch(toggleTodo(todo.id))}
            />
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
              {todo.text}
            </span>
            <button onClick={() => dispatch(deleteTodo(todo.id))}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
```

#### 使用 connect (传统方式)

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { addTodo, toggleTodo } from './actions';

class TodoList extends React.Component {
  render() {
    const { todos, addTodo, toggleTodo } = this.props;
    
    return (
      <div>
        <button onClick={() => addTodo('New Todo')}>Add Todo</button>
        <ul>
          {todos.map(todo => (
            <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
              {todo.text}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  todos: state.todos
});

const mapDispatchToProps = {
  addTodo,
  toggleTodo
};

export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
```

## 异步操作

### 使用 createAsyncThunk

```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 异步 thunk
export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    entities: [],
    loading: 'idle',
    error: null
  },
  reducers: {
    // 同步 reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = 'idle';
        state.entities.push(action.payload);
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload;
      });
  }
});

export default usersSlice.reducer;
```

### 在组件中使用异步操作

```jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserById } from './usersSlice';

function UserProfile({ userId }) {
  const dispatch = useDispatch();
  const { entities: users, loading, error } = useSelector(state => state.users);
  
  const user = users.find(u => u.id === userId);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUserById(userId));
    }
  }, [dispatch, userId, user]);

  if (loading === 'pending') {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

export default UserProfile;
```

## 中间件

### Redux Thunk

```javascript
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

// Thunk action creator
function fetchPosts() {
  return async (dispatch, getState) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();
      dispatch({ type: 'FETCH_POSTS_SUCCESS', payload: posts });
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
    }
  };
}
```

### 自定义中间件

```javascript
// 日志中间件
const logger = store => next => action => {
  console.log('dispatching', action);
  let result = next(action);
  console.log('next state', store.getState());
  return result;
};

// 错误处理中间件
const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('Caught an exception!', err);
    throw err;
  }
};

const store = createStore(
  reducer,
  applyMiddleware(logger, crashReporter)
);
```

## 性能优化

### 使用 Reselect

```javascript
import { createSelector } from 'reselect';

// 基础选择器
const getTodos = (state) => state.todos.items;
const getFilter = (state) => state.todos.filter;

// 记忆化选择器
export const getVisibleTodos = createSelector(
  [getTodos, getFilter],
  (todos, filter) => {
    switch (filter) {
      case 'completed':
        return todos.filter(todo => todo.completed);
      case 'active':
        return todos.filter(todo => !todo.completed);
      default:
        return todos;
    }
  }
);

// 在组件中使用
function TodoList() {
  const visibleTodos = useSelector(getVisibleTodos);
  // ...
}
```

### 避免不必要的重渲染

```jsx
import React, { memo } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

// 使用 shallowEqual 进行浅比较
const TodoItem = memo(({ todoId }) => {
  const todo = useSelector(
    state => state.todos.items.find(item => item.id === todoId),
    shallowEqual
  );

  return (
    <div>
      <span>{todo.text}</span>
      <input type="checkbox" checked={todo.completed} />
    </div>
  );
});

// 使用 React.memo 包装组件
export default TodoItem;
```

## 调试工具

### Redux DevTools

```javascript
import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

// 或者使用传统方式
const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(thunk)
  )
);
```

### 时间旅行调试

```javascript
// 在 Redux DevTools 中可以:
// 1. 查看每个 action 和状态变化
// 2. 跳转到任意时间点
// 3. 重放 actions
// 4. 导入/导出状态
```

## 最佳实践

### 状态结构设计

```javascript
// 推荐的状态结构
const initialState = {
  // 按功能模块组织
  auth: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  todos: {
    items: [],
    filter: 'all',
    loading: false,
    error: null
  },
  ui: {
    sidebarOpen: false,
    theme: 'light'
  }
};
```

### Action 设计原则

```javascript
// 1. 使用常量定义 action types
export const ActionTypes = {
  ADD_TODO: 'todos/add',
  TOGGLE_TODO: 'todos/toggle',
  DELETE_TODO: 'todos/delete'
};

// 2. Action 应该包含最少的必要信息
const addTodo = (text) => ({
  type: ActionTypes.ADD_TODO,
  payload: { text, id: generateId() }
});

// 3. 使用 FSA (Flux Standard Action) 格式
const fetchTodosSuccess = (todos) => ({
  type: 'todos/fetchSuccess',
  payload: todos
});

const fetchTodosFailure = (error) => ({
  type: 'todos/fetchFailure',
  payload: error,
  error: true
});
```

### Reducer 设计原则

```javascript
// 1. 保持 reducer 纯净
// 2. 不要修改原始状态
// 3. 处理未知 action 时返回原始状态
// 4. 使用 Immer 简化不可变更新

import { createReducer } from '@reduxjs/toolkit';

const todosReducer = createReducer(initialState, (builder) => {
  builder
    .addCase('todos/add', (state, action) => {
      // Immer 允许"直接"修改状态
      state.items.push(action.payload);
    })
    .addCase('todos/toggle', (state, action) => {
      const todo = state.items.find(item => item.id === action.payload.id);
      if (todo) {
        todo.completed = !todo.completed;
      }
    });
});
```

### 组件设计原则

```jsx
// 1. 容器组件 vs 展示组件分离

// 展示组件 - 只关心如何显示
const TodoItem = ({ todo, onToggle, onDelete }) => (
  <div>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
    />
    <span>{todo.text}</span>
    <button onClick={() => onDelete(todo.id)}>Delete</button>
  </div>
);

// 容器组件 - 关心数据如何工作
const TodoItemContainer = ({ todoId }) => {
  const todo = useSelector(state => 
    state.todos.items.find(item => item.id === todoId)
  );
  const dispatch = useDispatch();

  return (
    <TodoItem
      todo={todo}
      onToggle={(id) => dispatch(toggleTodo(id))}
      onDelete={(id) => dispatch(deleteTodo(id))}
    />
  );
};
```

## 测试

### 测试 Reducers

```javascript
import todosReducer from './todosSlice';
import { addTodo, toggleTodo } from './todosSlice';

describe('todos reducer', () => {
  const initialState = {
    items: [],
    filter: 'all'
  };

  it('should handle initial state', () => {
    expect(todosReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addTodo', () => {
    const actual = todosReducer(initialState, addTodo('Run the tests'));
    expect(actual.items).toHaveLength(1);
    expect(actual.items[0].text).toEqual('Run the tests');
  });

  it('should handle toggleTodo', () => {
    const previousState = {
      items: [{ id: 1, text: 'Run the tests', completed: false }],
      filter: 'all'
    };
    const actual = todosReducer(previousState, toggleTodo(1));
    expect(actual.items[0].completed).toBe(true);
  });
});
```

### 测试 Action Creators

```javascript
import { addTodo, toggleTodo } from './todosSlice';

describe('todo actions', () => {
  it('should create an action to add a todo', () => {
    const text = 'Finish docs';
    const expectedAction = {
      type: 'todos/addTodo',
      payload: text
    };
    expect(addTodo(text)).toEqual(expectedAction);
  });
});
```

### 测试连接的组件

```jsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TodoApp from './TodoApp';
import todosReducer from './todosSlice';

function renderWithRedux(
  ui,
  {
    initialState,
    store = configureStore({ reducer: { todos: todosReducer }, preloadedState: initialState })
  } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  };
}

test('can add a todo', () => {
  const { getByPlaceholderText, getByText } = renderWithRedux(<TodoApp />);
  
  const input = getByPlaceholderText('Add a todo');
  const button = getByText('Add');
  
  fireEvent.change(input, { target: { value: 'Learn Redux' } });
  fireEvent.click(button);
  
  expect(getByText('Learn Redux')).toBeInTheDocument();
});
```

## 常见问题

### 状态更新不生效

```javascript
// 错误：直接修改状态
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      state.push(action.todo); // ❌ 直接修改了状态
      return state;
    default:
      return state;
  }
}

// 正确：返回新的状态对象
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.todo]; // ✅ 返回新数组
    default:
      return state;
  }
}
```

### 组件不更新

```jsx
// 问题：useSelector 返回新对象导致不必要的重渲染
const TodoList = () => {
  // ❌ 每次都返回新对象
  const { todos, filter } = useSelector(state => ({
    todos: state.todos.items,
    filter: state.todos.filter
  }));
  
  // ✅ 分别选择
  const todos = useSelector(state => state.todos.items);
  const filter = useSelector(state => state.todos.filter);
  
  // 或者使用 shallowEqual
  const { todos, filter } = useSelector(
    state => ({
      todos: state.todos.items,
      filter: state.todos.filter
    }),
    shallowEqual
  );
};
```

### 异步操作处理

```javascript
// 问题：在 reducer 中处理异步操作
// ❌ 错误做法
function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USER':
      // ❌ 不能在 reducer 中进行异步操作
      fetch('/api/user').then(response => {
        // 这里无法 dispatch action
      });
      return state;
  }
}

// ✅ 正确做法：使用 thunk 或 createAsyncThunk
const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);
```

## 参考资源

- [Redux 官方文档](https://redux.js.org/)
- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [React Redux 官方文档](https://react-redux.js.org/)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
- [Reselect](https://github.com/reduxjs/reselect)

## 总结

Redux 是一个强大的状态管理库，通过其可预测的状态管理模式，可以帮助开发者构建复杂的应用程序。Redux Toolkit 进一步简化了 Redux 的使用，是现代 Redux 开发的推荐方式。在使用 Redux 时，要遵循其核心原则，合理设计状态结构，并注意性能优化和测试。
