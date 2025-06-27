---
outline: deep
---

# Vuex 知识库

## Vuex 简介

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式和库。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。Vuex 也集成到 Vue 的官方调试工具 devtools extension，提供了诸如零配置的 time-travel 调试、状态快照导入导出等高级调试功能。

### 版本说明

- **Vuex 3.x**：适用于 Vue 2
- **Vuex 4.x**：适用于 Vue 3
- **Pinia**：Vue 3 推荐的新状态管理库

本文档主要基于 Vuex 4.x 进行讲解，同时会介绍 Pinia 作为现代替代方案。

### 什么时候使用 Vuex

虽然 Vuex 可以帮助我们管理共享状态，但也附带了更多的概念和框架。这需要对短期和长期效益进行权衡。

如果您不打算开发大型单页应用，使用 Vuex 可能是繁琐冗余的。确实是如此——如果您的应用够简单，您最好不要使用 Vuex。一个简单的 store 模式就足够您所需了。但是，如果您需要构建一个中大型单页应用，您很可能会考虑如何更好地在组件外部管理状态，Vuex 将会成为自然而然的选择。

## 安装和基本配置

### 安装

```bash
# npm
npm install vuex@next --save

# yarn
yarn add vuex@next

# pnpm
pnpm add vuex@next
```

### 基本配置

```javascript
// store/index.js
import { createStore } from 'vuex'

const store = createStore({
  state() {
    return {
      count: 0,
      user: null,
      todos: []
    }
  },
  mutations: {
    increment(state) {
      state.count++
    },
    setUser(state, user) {
      state.user = user
    },
    addTodo(state, todo) {
      state.todos.push(todo)
    }
  },
  actions: {
    async fetchUser({ commit }, userId) {
      const user = await api.getUser(userId)
      commit('setUser', user)
    }
  },
  getters: {
    doneTodos(state) {
      return state.todos.filter(todo => todo.done)
    },
    doneTodosCount(state, getters) {
      return getters.doneTodos.length
    }
  }
})

export default store
```

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

const app = createApp(App)
app.use(store)
app.mount('#app')
```

## 核心概念

### State（状态）

Vuex 使用单一状态树，用一个对象就包含了全部的应用层级状态。

```javascript
// 定义状态
const store = createStore({
  state() {
    return {
      count: 0,
      user: {
        name: '',
        email: ''
      },
      settings: {
        theme: 'light',
        language: 'zh-CN'
      }
    }
  }
})
```

```vue
<!-- 在组件中访问状态 -->
<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>User: {{ user.name }}</p>
    <p>Theme: {{ settings.theme }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 使用计算属性获取状态
const count = computed(() => store.state.count)
const user = computed(() => store.state.user)
const settings = computed(() => store.state.settings)
</script>
```

### Getters（获取器）

Getters 可以认为是 store 的计算属性。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

```javascript
const store = createStore({
  state() {
    return {
      todos: [
        { id: 1, text: 'Learn Vue', done: true },
        { id: 2, text: 'Learn Vuex', done: false },
        { id: 3, text: 'Build app', done: false }
      ]
    }
  },
  getters: {
    // 基本 getter
    doneTodos(state) {
      return state.todos.filter(todo => todo.done)
    },
    
    // getter 可以接受其他 getter 作为第二个参数
    doneTodosCount(state, getters) {
      return getters.doneTodos.length
    },
    
    // 返回一个函数，实现给 getter 传参
    getTodoById: (state) => (id) => {
      return state.todos.find(todo => todo.id === id)
    },
    
    // 使用箭头函数
    activeTodos: state => state.todos.filter(todo => !todo.done)
  }
})
```

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 访问 getters
const doneTodos = computed(() => store.getters.doneTodos)
const doneTodosCount = computed(() => store.getters.doneTodosCount)

// 通过方法访问
const getTodoById = (id) => store.getters.getTodoById(id)
</script>
```

### Mutations（变更）

更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。Vuex 中的 mutation 非常类似于事件：每个 mutation 都有一个字符串的事件类型 (type) 和一个回调函数 (handler)。

```javascript
const store = createStore({
  state() {
    return {
      count: 0,
      user: null,
      todos: []
    }
  },
  mutations: {
    // 基本 mutation
    increment(state) {
      state.count++
    },
    
    // 带载荷的 mutation
    incrementBy(state, payload) {
      state.count += payload.amount
    },
    
    // 对象风格的载荷
    addTodo(state, payload) {
      state.todos.push({
        id: payload.id,
        text: payload.text,
        done: false
      })
    },
    
    // 更新用户信息
    updateUser(state, user) {
      state.user = { ...state.user, ...user }
    },
    
    // 重置状态
    resetState(state) {
      state.count = 0
      state.user = null
      state.todos = []
    }
  }
})
```

```vue
<script setup>
import { useStore } from 'vuex'

const store = useStore()

// 提交 mutation
const increment = () => {
  store.commit('increment')
}

// 带载荷提交
const incrementBy = (amount) => {
  store.commit('incrementBy', { amount })
}

// 对象风格的提交
const addTodo = (text) => {
  store.commit({
    type: 'addTodo',
    id: Date.now(),
    text
  })
}
</script>
```

### Actions（动作）

Action 类似于 mutation，不同在于：
- Action 提交的是 mutation，而不是直接变更状态
- Action 可以包含任意异步操作

```javascript
const store = createStore({
  state() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },
  mutations: {
    setLoading(state, loading) {
      state.loading = loading
    },
    setUser(state, user) {
      state.user = user
    },
    setError(state, error) {
      state.error = error
    }
  },
  actions: {
    // 基本 action
    async fetchUser({ commit }, userId) {
      commit('setLoading', true)
      commit('setError', null)
      
      try {
        const user = await api.getUser(userId)
        commit('setUser', user)
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    
    // 组合 actions
    async fetchUserAndPosts({ dispatch }, userId) {
      await dispatch('fetchUser', userId)
      await dispatch('fetchUserPosts', userId)
    },
    
    // 返回 Promise
    updateUser({ commit }, userData) {
      return api.updateUser(userData).then(user => {
        commit('setUser', user)
        return user
      })
    }
  }
})
```

```vue
<script setup>
import { useStore } from 'vuex'

const store = useStore()

// 分发 action
const fetchUser = async (userId) => {
  await store.dispatch('fetchUser', userId)
}

// 对象风格的分发
const updateUser = async (userData) => {
  await store.dispatch({
    type: 'updateUser',
    ...userData
  })
}
</script>
```

## 模块化

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。为了解决以上问题，Vuex 允许我们将 store 分割成模块（module）。

```javascript
// modules/user.js
const userModule = {
  namespaced: true,
  state() {
    return {
      profile: null,
      preferences: {}
    }
  },
  mutations: {
    setProfile(state, profile) {
      state.profile = profile
    },
    updatePreferences(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences }
    }
  },
  actions: {
    async fetchProfile({ commit }, userId) {
      const profile = await api.getUserProfile(userId)
      commit('setProfile', profile)
    }
  },
  getters: {
    fullName(state) {
      return state.profile ? `${state.profile.firstName} ${state.profile.lastName}` : ''
    }
  }
}

// modules/todos.js
const todosModule = {
  namespaced: true,
  state() {
    return {
      items: [],
      filter: 'all'
    }
  },
  mutations: {
    addTodo(state, todo) {
      state.items.push(todo)
    },
    toggleTodo(state, id) {
      const todo = state.items.find(item => item.id === id)
      if (todo) {
        todo.done = !todo.done
      }
    },
    setFilter(state, filter) {
      state.filter = filter
    }
  },
  actions: {
    async saveTodo({ commit }, todo) {
      const savedTodo = await api.saveTodo(todo)
      commit('addTodo', savedTodo)
    }
  },
  getters: {
    filteredTodos(state) {
      switch (state.filter) {
        case 'active':
          return state.items.filter(todo => !todo.done)
        case 'completed':
          return state.items.filter(todo => todo.done)
        default:
          return state.items
      }
    }
  }
}

// store/index.js
import { createStore } from 'vuex'
import userModule from './modules/user'
import todosModule from './modules/todos'

const store = createStore({
  modules: {
    user: userModule,
    todos: todosModule
  }
})

export default store
```

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 访问模块状态
const userProfile = computed(() => store.state.user.profile)
const todos = computed(() => store.state.todos.items)

// 访问模块 getters
const fullName = computed(() => store.getters['user/fullName'])
const filteredTodos = computed(() => store.getters['todos/filteredTodos'])

// 提交模块 mutations
const updateProfile = (profile) => {
  store.commit('user/setProfile', profile)
}

// 分发模块 actions
const fetchProfile = (userId) => {
  store.dispatch('user/fetchProfile', userId)
}
</script>
```

## 组合式 API 中使用 Vuex

### 基本用法

```vue
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// 状态
const count = computed(() => store.state.count)
const user = computed(() => store.state.user)

// Getters
const doneTodos = computed(() => store.getters.doneTodos)

// Mutations
const increment = () => store.commit('increment')
const setUser = (user) => store.commit('setUser', user)

// Actions
const fetchUser = (id) => store.dispatch('fetchUser', id)
</script>
```

### 创建辅助函数

```javascript
// composables/useStore.js
import { computed } from 'vue'
import { useStore as useVuexStore } from 'vuex'

export function useState(mapper) {
  const store = useVuexStore()
  const stateMapper = {}
  
  Object.keys(mapper).forEach(key => {
    stateMapper[key] = computed(() => store.state[mapper[key]])
  })
  
  return stateMapper
}

export function useGetters(mapper) {
  const store = useVuexStore()
  const gettersMapper = {}
  
  Object.keys(mapper).forEach(key => {
    gettersMapper[key] = computed(() => store.getters[mapper[key]])
  })
  
  return gettersMapper
}

export function useMutations(mapper) {
  const store = useVuexStore()
  const mutationsMapper = {}
  
  Object.keys(mapper).forEach(key => {
    mutationsMapper[key] = (payload) => store.commit(mapper[key], payload)
  })
  
  return mutationsMapper
}

export function useActions(mapper) {
  const store = useVuexStore()
  const actionsMapper = {}
  
  Object.keys(mapper).forEach(key => {
    actionsMapper[key] = (payload) => store.dispatch(mapper[key], payload)
  })
  
  return actionsMapper
}
```

```vue
<script setup>
import { useState, useGetters, useMutations, useActions } from '@/composables/useStore'

// 使用辅助函数
const { count, user } = useState({
  count: 'count',
  user: 'user'
})

const { doneTodos } = useGetters({
  doneTodos: 'doneTodos'
})

const { increment, setUser } = useMutations({
  increment: 'increment',
  setUser: 'setUser'
})

const { fetchUser } = useActions({
  fetchUser: 'fetchUser'
})
</script>
```

## Pinia - 现代状态管理

Pinia 是 Vue 3 推荐的状态管理库，提供了更简洁的 API 和更好的 TypeScript 支持。

### 安装 Pinia

```bash
npm install pinia
```

### 基本使用

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    async fetchData() {
      const data = await api.getData()
      this.name = data.name
    }
  }
})
```

```javascript
// stores/user.js - 组合式 API 风格
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref(null)
  const loading = ref(false)
  
  // getters
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => user.value?.name || '')
  
  // actions
  async function login(credentials) {
    loading.value = true
    try {
      user.value = await api.login(credentials)
    } finally {
      loading.value = false
    }
  }
  
  function logout() {
    user.value = null
  }
  
  return {
    user,
    loading,
    isLoggedIn,
    userName,
    login,
    logout
  }
})
```

```vue
<script setup>
import { useCounterStore } from '@/stores/counter'
import { useUserStore } from '@/stores/user'

const counterStore = useCounterStore()
const userStore = useUserStore()

// 直接访问状态
console.log(counterStore.count)
console.log(userStore.isLoggedIn)

// 调用 actions
const increment = () => counterStore.increment()
const login = (credentials) => userStore.login(credentials)
</script>

<template>
  <div>
    <p>Count: {{ counterStore.count }}</p>
    <p>Double: {{ counterStore.doubleCount }}</p>
    <button @click="increment">Increment</button>
    
    <div v-if="userStore.isLoggedIn">
      Welcome, {{ userStore.userName }}!
    </div>
  </div>
</template>
```

## 最佳实践

### 1. 状态设计原则

```javascript
// ✅ 好的状态设计
const store = createStore({
  state() {
    return {
      // 扁平化状态结构
      users: {},
      userIds: [],
      currentUserId: null,
      
      // 分离 UI 状态和业务状态
      ui: {
        loading: false,
        error: null,
        selectedTab: 'profile'
      }
    }
  }
})

// ❌ 避免的状态设计
const badStore = createStore({
  state() {
    return {
      // 嵌套过深
      data: {
        users: {
          list: {
            items: []
          }
        }
      },
      
      // 混合 UI 状态和业务状态
      usersWithUIState: [
        { id: 1, name: 'John', isSelected: true, isLoading: false }
      ]
    }
  }
})
```

### 2. Mutation 设计

```javascript
// ✅ 好的 mutation 设计
const mutations = {
  // 单一职责
  setUser(state, user) {
    state.user = user
  },
  
  setLoading(state, loading) {
    state.loading = loading
  },
  
  // 使用常量
  [SET_USER](state, user) {
    state.user = user
  },
  
  // 不可变更新
  updateUserProfile(state, profile) {
    state.user = { ...state.user, profile }
  }
}

// ❌ 避免的 mutation 设计
const badMutations = {
  // 异步操作
  async fetchUser(state, userId) {
    const user = await api.getUser(userId)
    state.user = user
  },
  
  // 多个职责
  setUserAndRedirect(state, user) {
    state.user = user
    router.push('/dashboard')
  }
}
```

### 3. Action 设计

```javascript
// ✅ 好的 action 设计
const actions = {
  // 错误处理
  async fetchUser({ commit }, userId) {
    commit('setLoading', true)
    commit('setError', null)
    
    try {
      const user = await api.getUser(userId)
      commit('setUser', user)
      return user
    } catch (error) {
      commit('setError', error.message)
      throw error
    } finally {
      commit('setLoading', false)
    }
  },
  
  // 组合多个操作
  async initializeApp({ dispatch }) {
    await Promise.all([
      dispatch('fetchUser'),
      dispatch('fetchSettings'),
      dispatch('fetchNotifications')
    ])
  }
}
```

### 4. 模块组织

```javascript
// 按功能模块组织
store/
├── index.js          # 根 store
├── modules/
│   ├── auth.js       # 认证模块
│   ├── user.js       # 用户模块
│   ├── products.js   # 产品模块
│   └── cart.js       # 购物车模块
└── types.js          # mutation 类型常量
```

## 调试和开发工具

### Vue DevTools

```javascript
// 启用严格模式（开发环境）
const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  // ...
})

// 添加插件
const store = createStore({
  plugins: process.env.NODE_ENV !== 'production' ? [createLogger()] : []
})
```

### 时间旅行调试

```javascript
// 在 mutation 中添加调试信息
const mutations = {
  increment(state, payload) {
    // 调试信息
    console.log('Incrementing count by:', payload)
    state.count += payload
  }
}
```

## 常见问题

### 1. 直接修改状态

```javascript
// ❌ 错误：直接修改状态
store.state.count++

// ✅ 正确：通过 mutation 修改
store.commit('increment')
```

### 2. 在 mutation 中执行异步操作

```javascript
// ❌ 错误：在 mutation 中执行异步操作
const mutations = {
  async fetchUser(state, userId) {
    const user = await api.getUser(userId)
    state.user = user
  }
}

// ✅ 正确：在 action 中执行异步操作
const actions = {
  async fetchUser({ commit }, userId) {
    const user = await api.getUser(userId)
    commit('setUser', user)
  }
}
```

### 3. 模块命名空间问题

```javascript
// 确保使用命名空间
const userModule = {
  namespaced: true, // 重要！
  // ...
}

// 正确访问命名空间模块
store.commit('user/setProfile', profile)
store.dispatch('user/fetchProfile', userId)
store.getters['user/fullName']
```

## 总结

Vuex 是 Vue.js 生态系统中重要的状态管理解决方案：

- **集中式状态管理**：统一管理应用状态
- **可预测的状态变更**：通过 mutation 确保状态变更的可追踪性
- **强大的调试能力**：与 Vue DevTools 深度集成
- **模块化支持**：支持大型应用的状态管理
- **现代化替代**：Pinia 提供了更简洁的 API

对于新项目，建议使用 Pinia；对于现有的 Vuex 项目，可以逐步迁移或继续使用 Vuex 4.x。
