---
outline: deep
---

# Redux Toolkit 知识库

## Redux Toolkit 简介

### 什么是 Redux Toolkit？

Redux Toolkit (RTK) 是 Redux 官方推荐的编写 Redux 逻辑的标准方式。它是围绕 Redux 核心构建的，包含了我们认为对于构建 Redux 应用必不可少的包和函数。Redux Toolkit 简化了大多数 Redux 任务，防止了常见错误，并让编写 Redux 应用变得更容易。

### 核心特性

- **简化配置**：提供 `configureStore()` 来简化 store 设置
- **减少样板代码**：使用 `createSlice()` 减少 action 和 reducer 的样板代码
- **内置最佳实践**：包含了 Redux DevTools、redux-thunk 等常用中间件
- **不可变更新**：内置 Immer 库，可以编写"可变"逻辑
- **类型安全**：对 TypeScript 有很好的支持
- **现代化工具**：包含 RTK Query 用于数据获取

::: tip
Redux Toolkit 是现在编写 Redux 逻辑的标准方式，它解决了原始 Redux 的三个常见问题：配置复杂、需要添加很多包、需要太多样板代码。
:::

## 安装和设置

### 安装 Redux Toolkit

```bash
# 使用 npm
npm install @reduxjs/toolkit react-redux

# 使用 yarn
yarn add @reduxjs/toolkit react-redux

# 使用 pnpm
pnpm add @reduxjs/toolkit react-redux
```

### 创建 Redux Store

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'
import userReducer from './features/user/userSlice'
import todoReducer from './features/todo/todoSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer,
    todo: todoReducer,
  },
  // Redux Toolkit 已经包含了这些中间件
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  
  // 开发环境配置
  devTools: process.env.NODE_ENV !== 'production',
})

// 推断出 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### 在 React 应用中提供 Store

```jsx
// index.js 或 App.js
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

## 创建 Slice

### 基础 Slice

```javascript
// store/features/counter/counterSlice.js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // Redux Toolkit 使用 Immer 内部处理，所以我们可以"mutate"状态
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
    reset: (state) => {
      state.value = 0
      state.status = 'idle'
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
  },
})

// 导出 action creators
export const { 
  increment, 
  decrement, 
  incrementByAmount, 
  reset, 
  setStatus 
} = counterSlice.actions

// 导出 reducer
export default counterSlice.reducer

// 选择器函数
export const selectCount = (state) => state.counter.value
export const selectStatus = (state) => state.counter.status
```

### 复杂状态的 Slice

```javascript
// store/features/user/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userAPI } from '../../api/userAPI'

// 异步 thunk
export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserById(userId)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateUser(id, userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  entities: {},
  ids: [],
  currentUser: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    userAdded: (state, action) => {
      const user = action.payload
      state.entities[user.id] = user
      state.ids.push(user.id)
    },
    userUpdated: (state, action) => {
      const { id, changes } = action.payload
      if (state.entities[id]) {
        Object.assign(state.entities[id], changes)
      }
    },
    userRemoved: (state, action) => {
      const id = action.payload
      delete state.entities[id]
      state.ids = state.ids.filter(existingId => existingId !== id)
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        const user = action.payload
        state.entities[user.id] = user
        if (!state.ids.includes(user.id)) {
          state.ids.push(user.id)
        }
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      // updateUser
      .addCase(updateUser.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const user = action.payload
        state.entities[user.id] = user
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
  },
})

export const {
  userAdded,
  userUpdated,
  userRemoved,
  setCurrentUser,
  clearError,
} = userSlice.actions

export default userSlice.reducer

// 选择器
export const selectAllUsers = (state) => 
  state.user.ids.map(id => state.user.entities[id])

export const selectUserById = (state, userId) => 
  state.user.entities[userId]

export const selectCurrentUser = (state) => state.user.currentUser
export const selectUserLoading = (state) => state.user.loading
export const selectUserError = (state) => state.user.error
```

## 异步逻辑处理

### createAsyncThunk

```javascript
// store/features/todo/todoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { todoAPI } from '../../api/todoAPI'

// 获取所有待办事项
export const fetchTodos = createAsyncThunk(
  'todo/fetchTodos',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState()
      const currentUser = state.user.currentUser
      
      if (!currentUser) {
        throw new Error('用户未登录')
      }
      
      const response = await todoAPI.getTodos(currentUser.id)
      return response.data
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.response?.status
      })
    }
  }
)

// 添加待办事项
export const addTodo = createAsyncThunk(
  'todo/addTodo',
  async (todoData, { rejectWithValue }) => {
    try {
      const response = await todoAPI.createTodo(todoData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// 更新待办事项
export const updateTodo = createAsyncThunk(
  'todo/updateTodo',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const response = await todoAPI.updateTodo(id, updates)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// 删除待办事项
export const deleteTodo = createAsyncThunk(
  'todo/deleteTodo',
  async (todoId, { rejectWithValue }) => {
    try {
      await todoAPI.deleteTodo(todoId)
      return todoId
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  items: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  filter: 'all', // 'all' | 'active' | 'completed'
}

const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    todoToggled: (state, action) => {
      const todo = state.items.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    todoTextUpdated: (state, action) => {
      const { id, text } = action.payload
      const todo = state.items.find(todo => todo.id === id)
      if (todo) {
        todo.text = text
      }
    },
    filterChanged: (state, action) => {
      state.filter = action.payload
    },
    allTodosCompleted: (state) => {
      state.items.forEach(todo => {
        todo.completed = true
      })
    },
    completedTodosCleared: (state) => {
      state.items = state.items.filter(todo => !todo.completed)
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload?.message || action.error.message
      })
      // addTodo
      .addCase(addTodo.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      // updateTodo
      .addCase(updateTodo.fulfilled, (state, action) => {
        const index = state.items.findIndex(todo => todo.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      // deleteTodo
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.items = state.items.filter(todo => todo.id !== action.payload)
      })
  },
})

export const {
  todoToggled,
  todoTextUpdated,
  filterChanged,
  allTodosCompleted,
  completedTodosCleared,
} = todoSlice.actions

export default todoSlice.reducer

// 选择器
export const selectAllTodos = (state) => state.todo.items
export const selectTodoById = (state, todoId) => 
  state.todo.items.find(todo => todo.id === todoId)

export const selectFilteredTodos = (state) => {
  const { items, filter } = state.todo
  
  switch (filter) {
    case 'active':
      return items.filter(todo => !todo.completed)
    case 'completed':
      return items.filter(todo => todo.completed)
    default:
      return items
  }
}

export const selectTodoStats = (state) => {
  const todos = state.todo.items
  return {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
  }
}
```

## 在 React 组件中使用

### 类型化的 Hooks

```typescript
// hooks/redux.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../store'

// 使用这些 hooks 而不是普通的 useDispatch 和 useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### 计数器组件

```jsx
// components/Counter.jsx
import React, { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import {
  increment,
  decrement,
  incrementByAmount,
  reset,
  selectCount,
  selectStatus,
} from '../store/features/counter/counterSlice'

export function Counter() {
  const count = useAppSelector(selectCount)
  const status = useAppSelector(selectStatus)
  const dispatch = useAppDispatch()
  
  const [incrementAmount, setIncrementAmount] = useState('2')
  const incrementValue = Number(incrementAmount) || 0

  return (
    <div className="counter">
      <div className="counter-display">
        <span className="value">{count}</span>
        <span className="status">状态: {status}</span>
      </div>
      
      <div className="counter-controls">
        <button
          className="button"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
        
        <button
          className="button"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        
        <input
          className="textbox"
          value={incrementAmount}
          onChange={(e) => setIncrementAmount(e.target.value)}
        />
        
        <button
          className="button"
          onClick={() => dispatch(incrementByAmount(incrementValue))}
        >
          增加数量
        </button>
        
        <button
          className="button"
          onClick={() => dispatch(reset())}
        >
          重置
        </button>
      </div>
    </div>
  )
}
```

### 用户列表组件

```jsx
// components/UserList.jsx
import React, { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import {
  fetchUserById,
  selectAllUsers,
  selectUserLoading,
  selectUserError,
} from '../store/features/user/userSlice'

export function UserList() {
  const users = useAppSelector(selectAllUsers)
  const loading = useAppSelector(selectUserLoading)
  const error = useAppSelector(selectUserError)
  const dispatch = useAppDispatch()

  useEffect(() => {
    // 组件挂载时获取用户数据
    if (users.length === 0) {
      dispatch(fetchUserById(1))
    }
  }, [dispatch, users.length])

  if (loading) {
    return <div className="loading">加载中...</div>
  }

  if (error) {
    return (
      <div className="error">
        错误: {error}
        <button onClick={() => dispatch(fetchUserById(1))}>
          重试
        </button>
      </div>
    )
  }

  return (
    <div className="user-list">
      <h2>用户列表</h2>
      {users.length === 0 ? (
        <p>暂无用户</p>
      ) : (
        <ul>
          {users.map(user => (
            <li key={user.id} className="user-item">
              <div className="user-info">
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
              <button
                onClick={() => dispatch(fetchUserById(user.id))}
              >
                刷新
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### 待办事项组件

```jsx
// components/TodoApp.jsx
import React, { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  todoToggled,
  filterChanged,
  selectFilteredTodos,
  selectTodoStats,
} from '../store/features/todo/todoSlice'

export function TodoApp() {
  const todos = useAppSelector(selectFilteredTodos)
  const stats = useAppSelector(selectTodoStats)
  const filter = useAppSelector(state => state.todo.filter)
  const status = useAppSelector(state => state.todo.status)
  const dispatch = useAppDispatch()
  
  const [newTodoText, setNewTodoText] = useState('')

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTodos())
    }
  }, [status, dispatch])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newTodoText.trim()) {
      await dispatch(addTodo({
        text: newTodoText.trim(),
        completed: false,
      }))
      setNewTodoText('')
    }
  }

  const handleToggle = (id) => {
    dispatch(todoToggled(id))
  }

  const handleDelete = (id) => {
    dispatch(deleteTodo(id))
  }

  const handleFilterChange = (newFilter) => {
    dispatch(filterChanged(newFilter))
  }

  return (
    <div className="todo-app">
      <header className="todo-header">
        <h1>待办事项</h1>
        <div className="stats">
          总计: {stats.total} | 已完成: {stats.completed} | 待完成: {stats.active}
        </div>
      </header>

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="添加新的待办事项..."
          className="todo-input"
        />
        <button type="submit" className="add-button">
          添加
        </button>
      </form>

      <div className="filter-buttons">
        {['all', 'active', 'completed'].map(filterType => (
          <button
            key={filterType}
            className={`filter-button ${
              filter === filterType ? 'active' : ''
            }`}
            onClick={() => handleFilterChange(filterType)}
          >
            {filterType === 'all' ? '全部' : 
             filterType === 'active' ? '待完成' : '已完成'}
          </button>
        ))}
      </div>

      {status === 'loading' && <div>加载中...</div>}
      
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id)}
            />
            <span 
              className={`todo-text ${
                todo.completed ? 'completed' : ''
              }`}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDelete(todo.id)}
              className="delete-button"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## RTK Query

### API Slice 定义

```javascript
// api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// 定义我们的单个 API slice 对象
export const apiSlice = createApi({
  // 缓存 reducer 预期被添加到 `state.api`（已经默认 - 这是可选的）
  reducerPath: 'api',
  // 所有的请求都有以 '/api' 开头的 URL
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // 如果我们有一个 token，让我们在 headers 中设置它
      const token = getState().auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  // "标签"类型用于缓存和失效
  tagTypes: ['Post', 'User'],
  // API 的端点定义在这里
  endpoints: (builder) => ({
    // 获取所有文章
    getPosts: builder.query({
      query: () => '/posts',
      providesTags: ['Post'],
    }),
    // 根据 ID 获取文章
    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    // 添加新文章
    addNewPost: builder.mutation({
      query: (initialPost) => ({
        url: '/posts',
        method: 'POST',
        body: initialPost,
      }),
      invalidatesTags: ['Post'],
    }),
    // 更新文章
    updatePost: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Post', id }],
    }),
    // 删除文章
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),
    // 获取用户信息
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User'],
    }),
  }),
})

// 导出自动生成的 hooks
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetUsersQuery,
} = apiSlice
```

### 在 Store 中配置 RTK Query

```javascript
// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'
import counterReducer from './features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    // 添加生成的 reducer 作为一个特定的顶级 slice
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // 添加 api 中间件启用缓存、失效、轮询和其他有用的功能
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})
```

### 使用 RTK Query Hooks

```jsx
// components/PostsList.jsx
import React from 'react'
import {
  useGetPostsQuery,
  useDeletePostMutation,
} from '../api/apiSlice'

export function PostsList() {
  const {
    data: posts,
    error,
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useGetPostsQuery()
  
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  const handleDelete = async (id) => {
    try {
      await deletePost(id).unwrap()
      console.log('文章删除成功')
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  let content

  if (isLoading) {
    content = <div className="loading">加载中...</div>
  } else if (isSuccess) {
    content = (
      <div className="posts-container">
        <div className="posts-header">
          <h2>文章列表</h2>
          <button onClick={refetch}>刷新</button>
        </div>
        <div className="posts-list">
          {posts.map(post => (
            <article key={post.id} className="post-excerpt">
              <h3>{post.title}</h3>
              <p>{post.content.substring(0, 100)}...</p>
              <div className="post-actions">
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? '删除中...' : '删除'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  } else if (isError) {
    content = (
      <div className="error">
        <h2>出错了！</h2>
        <div>{error.toString()}</div>
        <button onClick={refetch}>重试</button>
      </div>
    )
  }

  return content
}
```

### 添加文章组件

```jsx
// components/AddPostForm.jsx
import React, { useState } from 'react'
import { useAddNewPostMutation } from '../api/apiSlice'

export function AddPostForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [userId, setUserId] = useState('')
  
  const [addNewPost, { isLoading }] = useAddNewPostMutation()

  const onTitleChanged = (e) => setTitle(e.target.value)
  const onContentChanged = (e) => setContent(e.target.value)
  const onAuthorChanged = (e) => setUserId(e.target.value)

  const canSave = [title, content, userId].every(Boolean) && !isLoading

  const onSavePostClicked = async () => {
    if (canSave) {
      try {
        await addNewPost({ title, content, user: userId }).unwrap()
        setTitle('')
        setContent('')
        setUserId('')
      } catch (err) {
        console.error('保存文章失败: ', err)
      }
    }
  }

  return (
    <section className="add-post-form">
      <h2>添加新文章</h2>
      <form>
        <label htmlFor="postTitle">文章标题:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          value={title}
          onChange={onTitleChanged}
        />
        
        <label htmlFor="postAuthor">作者:</label>
        <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
          <option value=""></option>
          <option value="1">用户1</option>
          <option value="2">用户2</option>
        </select>
        
        <label htmlFor="postContent">内容:</label>
        <textarea
          id="postContent"
          name="postContent"
          value={content}
          onChange={onContentChanged}
        />
        
        <button
          type="button"
          onClick={onSavePostClicked}
          disabled={!canSave}
        >
          {isLoading ? '保存中...' : '保存文章'}
        </button>
      </form>
    </section>
  )
}
```

## 中间件和增强器

### 自定义中间件

```javascript
// middleware/logger.js
const logger = (store) => (next) => (action) => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger

// middleware/crashReporter.js
const crashReporter = (store) => (next) => (action) => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    // 在这里可以发送错误报告到服务器
    throw err
  }
}

export default crashReporter

// store/index.js
import { configureStore } from '@reduxjs/toolkit'
import logger from '../middleware/logger'
import crashReporter from '../middleware/crashReporter'

export const store = configureStore({
  reducer: {
    // reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 自定义序列化检查
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    })
    .concat(logger)
    .concat(crashReporter),
  
  // 开发工具配置
  devTools: process.env.NODE_ENV !== 'production' && {
    trace: true,
    traceLimit: 25,
  },
})
```

### 持久化状态

```javascript
// 安装 redux-persist
// npm install redux-persist

// store/index.js
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import counterReducer from './features/counter/counterSlice'
import userReducer from './features/user/userSlice'

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  // 只持久化特定的 reducer
  whitelist: ['user'],
  // 或者排除特定的 reducer
  // blacklist: ['counter']
}

const rootReducer = combineReducers({
  counter: counterReducer,
  user: userReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

// App.js
import React from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store'
import App from './App'

function Root() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  )
}

export default Root
```

## 测试

### 测试 Reducers

```javascript
// store/features/counter/counterSlice.test.js
import counterReducer, {
  increment,
  decrement,
  incrementByAmount,
} from './counterSlice'

describe('counter reducer', () => {
  const initialState = {
    value: 0,
    status: 'idle',
  }

  it('should handle initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual({
      value: 0,
      status: 'idle',
    })
  })

  it('should handle increment', () => {
    const actual = counterReducer(initialState, increment())
    expect(actual.value).toEqual(1)
  })

  it('should handle decrement', () => {
    const actual = counterReducer(initialState, decrement())
    expect(actual.value).toEqual(-1)
  })

  it('should handle incrementByAmount', () => {
    const actual = counterReducer(initialState, incrementByAmount(2))
    expect(actual.value).toEqual(2)
  })
})
```

### 测试异步 Thunks

```javascript
// store/features/user/userSlice.test.js
import { configureStore } from '@reduxjs/toolkit'
import userReducer, { fetchUserById } from './userSlice'

// Mock API
jest.mock('../../api/userAPI', () => ({
  userAPI: {
    getUserById: jest.fn(),
  },
}))

import { userAPI } from '../../api/userAPI'

describe('fetchUserById', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    })
  })

  it('should fetch user successfully', async () => {
    const userData = { id: 1, name: 'John Doe', email: 'john@example.com' }
    userAPI.getUserById.mockResolvedValue({ data: userData })

    await store.dispatch(fetchUserById(1))

    const state = store.getState()
    expect(state.user.entities[1]).toEqual(userData)
    expect(state.user.loading).toBe(false)
    expect(state.user.error).toBe(null)
  })

  it('should handle fetch user error', async () => {
    const errorMessage = 'User not found'
    userAPI.getUserById.mockRejectedValue({
      response: { data: errorMessage },
    })

    await store.dispatch(fetchUserById(999))

    const state = store.getState()
    expect(state.user.loading).toBe(false)
    expect(state.user.error).toBe(errorMessage)
  })
})
```

### 测试组件

```jsx
// components/Counter.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../store/features/counter/counterSlice'
import { Counter } from './Counter'

function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { counter: counterReducer },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

describe('Counter component', () => {
  it('renders with initial value', () => {
    renderWithProviders(<Counter />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('increments value when increment button is clicked', () => {
    renderWithProviders(<Counter />)
    
    fireEvent.click(screen.getByText('+'))
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('decrements value when decrement button is clicked', () => {
    renderWithProviders(<Counter />, {
      preloadedState: {
        counter: { value: 2, status: 'idle' },
      },
    })
    
    fireEvent.click(screen.getByText('-'))
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
```

## 性能优化

### 使用 Reselect

```javascript
// store/selectors.js
import { createSelector } from '@reduxjs/toolkit'

// 基础选择器
const selectTodos = (state) => state.todo.items
const selectFilter = (state) => state.todo.filter

// 记忆化选择器
export const selectFilteredTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    console.log('重新计算过滤的待办事项')
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  }
)

export const selectTodoStats = createSelector(
  [selectTodos],
  (todos) => {
    console.log('重新计算统计信息')
    return {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      active: todos.filter(todo => !todo.completed).length,
    }
  }
)

// 参数化选择器
export const selectTodoById = createSelector(
  [selectTodos, (state, todoId) => todoId],
  (todos, todoId) => todos.find(todo => todo.id === todoId)
)
```

### 组件优化

```jsx
// components/OptimizedTodoItem.jsx
import React, { memo } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { todoToggled } from '../store/features/todo/todoSlice'
import { selectTodoById } from '../store/selectors'

// 使用 memo 防止不必要的重新渲染
export const TodoItem = memo(({ todoId }) => {
  const todo = useAppSelector(state => selectTodoById(state, todoId))
  const dispatch = useAppDispatch()

  const handleToggle = () => {
    dispatch(todoToggled(todoId))
  }

  if (!todo) {
    return null
  }

  return (
    <li className="todo-item">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
      />
      <span className={todo.completed ? 'completed' : ''}>
        {todo.text}
      </span>
    </li>
  )
})

// 使用 React.memo 的比较函数
export const TodoItemWithComparison = memo(({ todoId }) => {
  // 组件逻辑
}, (prevProps, nextProps) => {
  // 返回 true 如果 props 相等（不重新渲染）
  return prevProps.todoId === nextProps.todoId
})
```

## 最佳实践

### 状态结构设计

```javascript
// ✅ 好的状态结构
const goodState = {
  users: {
    byId: {
      1: { id: 1, name: 'John' },
      2: { id: 2, name: 'Jane' },
    },
    allIds: [1, 2],
    loading: false,
    error: null,
  },
  posts: {
    byId: {
      1: { id: 1, title: 'Post 1', authorId: 1 },
      2: { id: 2, title: 'Post 2', authorId: 2 },
    },
    allIds: [1, 2],
    loading: false,
    error: null,
  },
}

// ❌ 避免的状态结构
const badState = {
  users: [
    {
      id: 1,
      name: 'John',
      posts: [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
      ],
    },
  ],
}
```

### Action 命名规范

```javascript
// ✅ 好的 action 命名
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 使用过去时态描述已发生的事件
    userAdded: (state, action) => { /* ... */ },
    userUpdated: (state, action) => { /* ... */ },
    userRemoved: (state, action) => { /* ... */ },
    
    // 或者使用动词描述动作
    addUser: (state, action) => { /* ... */ },
    updateUser: (state, action) => { /* ... */ },
    removeUser: (state, action) => { /* ... */ },
  },
})

// ❌ 避免的命名
const badSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 避免使用 set 前缀
    setUser: (state, action) => { /* ... */ },
    setUsers: (state, action) => { /* ... */ },
    
    // 避免过于通用的名称
    update: (state, action) => { /* ... */ },
    change: (state, action) => { /* ... */ },
  },
})
```

### 错误处理

```javascript
// store/features/api/apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // 尝试刷新 token
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions)
    
    if (refreshResult.data) {
      // 存储新 token
      api.dispatch(tokenReceived(refreshResult.data))
      // 重试原始请求
      result = await baseQuery(args, api, extraOptions)
    } else {
      // 刷新失败，登出用户
      api.dispatch(loggedOut())
    }
  }
  
  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // 端点定义
  }),
})
```

## 参考资源

- [Redux Toolkit 官方文档](https://redux-toolkit.js.org/)
- [Redux 官方文档](https://redux.js.org/)
- [RTK Query 文档](https://redux-toolkit.js.org/rtk-query/overview)
- [React Redux 文档](https://react-redux.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Reselect 文档](https://github.com/reduxjs/reselect)

## 总结

Redux Toolkit 大大简化了 Redux 的使用，提供了现代化的 API 和最佳实践。通过 `createSlice`、`createAsyncThunk` 和 RTK Query，开发者可以更高效地管理应用状态，减少样板代码，提高开发体验。掌握这些工具和模式，能够帮助你构建可维护、可扩展的 React 应用。