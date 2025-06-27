# Pinia 状态管理详解

## Pinia 简介

### 什么是 Pinia？

Pinia 是 Vue 的专属状态管理库，它允许你跨组件或页面共享状态。它是 Vuex 的继任者，为 Vue 2 和 Vue 3 提供了更简单的 API，具有完整的 TypeScript 支持。

### 核心特性

- **类型安全**：完整的 TypeScript 支持
- **开发工具支持**：Vue DevTools 集成
- **热模块替换**：在不重新加载页面的情况下修改 store
- **插件系统**：通过插件扩展 Pinia 功能
- **服务端渲染支持**：SSR 友好
- **轻量级**：压缩后约 1kb

## 安装和设置

### 安装 Pinia

```bash
# npm
npm install pinia

# yarn
yarn add pinia

# pnpm
pnpm add pinia
```

### Vue 3 中使用

```js
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

### Vue 2 中使用

```js
// main.js
import Vue from 'vue'
import { createPinia, PiniaVuePlugin } from 'pinia'
import App from './App.vue'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

new Vue({
  el: '#app',
  pinia,
  render: h => h(App)
})
```

## 定义 Store

### 基本 Store 定义

```js
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Eduardo'
  }),
  
  getters: {
    doubleCount: (state) => state.count * 2,
    
    // 使用其他 getter
    doubleCountPlusOne() {
      return this.doubleCount + 1
    },
    
    // 传递参数的 getter
    getUserById: (state) => {
      return (userId) => state.users.find((user) => user.id === userId)
    }
  },
  
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    async fetchUser(id) {
      try {
        const user = await api.getUser(id)
        this.name = user.name
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
  }
})
```

### Composition API 风格

```js
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // state
  const count = ref(0)
  const name = ref('Eduardo')
  
  // getters
  const doubleCount = computed(() => count.value * 2)
  
  // actions
  function increment() {
    count.value++
  }
  
  function decrement() {
    count.value--
  }
  
  async function fetchUser(id) {
    try {
      const user = await api.getUser(id)
      name.value = user.name
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }
  
  return {
    count,
    name,
    doubleCount,
    increment,
    decrement,
    fetchUser
  }
})
```

## 使用 Store

### 在组件中使用

```vue
<!-- Counter.vue -->
<template>
  <div>
    <p>Count: {{ counter.count }}</p>
    <p>Double Count: {{ counter.doubleCount }}</p>
    <p>Name: {{ counter.name }}</p>
    
    <button @click="counter.increment()">+</button>
    <button @click="counter.decrement()">-</button>
    <button @click="counter.fetchUser(1)">Fetch User</button>
  </div>
</template>

<script setup>
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
</script>
```

### 解构 Store

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()

// 解构响应式属性
const { count, name, doubleCount } = storeToRefs(counter)

// 解构 actions（不需要 storeToRefs）
const { increment, decrement, fetchUser } = counter
</script>
```

### Options API 中使用

```vue
<script>
import { mapStores, mapState, mapActions } from 'pinia'
import { useCounterStore } from '@/stores/counter'

export default {
  computed: {
    // 访问整个 store
    ...mapStores(useCounterStore),
    
    // 访问特定状态
    ...mapState(useCounterStore, ['count', 'name']),
    
    // 访问 getters
    ...mapState(useCounterStore, {
      myOwnName: 'doubleCount'
    })
  },
  
  methods: {
    // 访问 actions
    ...mapActions(useCounterStore, ['increment', 'decrement'])
  }
}
</script>
```

## 高级用法

### 订阅状态变化

```js
// 订阅整个 store
const counter = useCounterStore()

counter.$subscribe((mutation, state) => {
  console.log('Store changed:', mutation.type, mutation.payload)
  console.log('New state:', state)
  
  // 持久化到本地存储
  localStorage.setItem('counter', JSON.stringify(state))
})

// 订阅 actions
counter.$onAction(({ name, store, args, after, onError }) => {
  console.log(`Action "${name}" called with args:`, args)
  
  after((result) => {
    console.log(`Action "${name}" finished with result:`, result)
  })
  
  onError((error) => {
    console.error(`Action "${name}" failed:`, error)
  })
})
```

### 重置状态

```js
const counter = useCounterStore()

// 重置到初始状态
counter.$reset()

// 部分重置
counter.$patch({
  count: 0
})

// 使用函数进行复杂更新
counter.$patch((state) => {
  state.items.push({ name: 'shoes', quantity: 1 })
  state.hasChanged = true
})
```

### 替换整个状态

```js
const counter = useCounterStore()

// 替换整个状态
counter.$state = {
  count: 10,
  name: 'New Name'
}
```

## 组合多个 Store

### Store 之间的依赖

```js
// stores/user.js
import { defineStore } from 'pinia'
import { useSettingsStore } from './settings'

export const useUserStore = defineStore('user', {
  state: () => ({
    userData: null
  }),
  
  actions: {
    async fetchUser() {
      const settings = useSettingsStore()
      
      const response = await fetch(`${settings.apiUrl}/user`)
      this.userData = await response.json()
    }
  }
})

// stores/settings.js
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apiUrl: 'https://api.example.com',
    theme: 'light'
  })
})
```

### 嵌套 Store

```js
// stores/main.js
import { defineStore } from 'pinia'
import { useUserStore } from './user'
import { useCartStore } from './cart'

export const useMainStore = defineStore('main', () => {
  const user = useUserStore()
  const cart = useCartStore()
  
  const isLoggedIn = computed(() => !!user.userData)
  const cartItemCount = computed(() => cart.items.length)
  
  function logout() {
    user.$reset()
    cart.$reset()
  }
  
  return {
    user,
    cart,
    isLoggedIn,
    cartItemCount,
    logout
  }
})
```

## 插件系统

### 创建插件

```js
// plugins/persistedState.js
export function createPersistedState(options = {}) {
  return (context) => {
    const { store } = context
    const storageKey = options.key || store.$id
    
    // 从本地存储恢复状态
    const savedState = localStorage.getItem(storageKey)
    if (savedState) {
      store.$patch(JSON.parse(savedState))
    }
    
    // 订阅状态变化并保存
    store.$subscribe((mutation, state) => {
      localStorage.setItem(storageKey, JSON.stringify(state))
    })
  }
}

// 使用插件
import { createPinia } from 'pinia'
import { createPersistedState } from './plugins/persistedState'

const pinia = createPinia()
pinia.use(createPersistedState())
```

### 官方插件

```js
// 持久化插件
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 在 store 中使用
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  
  persist: {
    key: 'counter-store',
    storage: sessionStorage,
    paths: ['count'] // 只持久化特定字段
  }
})
```

## TypeScript 支持

### 类型化 Store

```ts
// stores/user.ts
import { defineStore } from 'pinia'

interface User {
  id: number
  name: string
  email: string
}

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false
  }),
  
  getters: {
    isLoggedIn: (state): boolean => !!state.currentUser,
    
    getUserById: (state) => {
      return (id: number): User | undefined => {
        return state.users.find(user => user.id === id)
      }
    }
  },
  
  actions: {
    async fetchUser(id: number): Promise<void> {
      this.loading = true
      try {
        const response = await fetch(`/api/users/${id}`)
        this.currentUser = await response.json()
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
```

### 类型化插件

```ts
// plugins/logger.ts
import type { PiniaPluginContext } from 'pinia'

interface LoggerOptions {
  logActions?: boolean
  logState?: boolean
}

export function createLogger(options: LoggerOptions = {}) {
  return (context: PiniaPluginContext) => {
    const { store } = context
    
    if (options.logActions) {
      store.$onAction(({ name, args }) => {
        console.log(`Action ${name} called with:`, args)
      })
    }
    
    if (options.logState) {
      store.$subscribe((mutation, state) => {
        console.log('State changed:', state)
      })
    }
  }
}
```

## 测试

### 单元测试

```js
// stores/__tests__/counter.spec.js
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '../counter'

describe('Counter Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  
  it('increments count', () => {
    const counter = useCounterStore()
    expect(counter.count).toBe(0)
    
    counter.increment()
    expect(counter.count).toBe(1)
  })
  
  it('computes double count', () => {
    const counter = useCounterStore()
    counter.count = 5
    expect(counter.doubleCount).toBe(10)
  })
  
  it('resets state', () => {
    const counter = useCounterStore()
    counter.count = 10
    counter.$reset()
    expect(counter.count).toBe(0)
  })
})
```

### 组件测试

```js
// components/__tests__/Counter.spec.js
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Counter from '../Counter.vue'
import { useCounterStore } from '@/stores/counter'

describe('Counter Component', () => {
  let wrapper
  let store
  
  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCounterStore()
    wrapper = mount(Counter, {
      global: {
        plugins: [createPinia()]
      }
    })
  })
  
  it('displays count', () => {
    expect(wrapper.text()).toContain('Count: 0')
  })
  
  it('increments count when button clicked', async () => {
    await wrapper.find('button').trigger('click')
    expect(store.count).toBe(1)
    expect(wrapper.text()).toContain('Count: 1')
  })
})
```

## 最佳实践

### Store 组织

```
stores/
├── index.js          # 导出所有 stores
├── user.js           # 用户相关状态
├── cart.js           # 购物车状态
├── products.js       # 产品状态
└── modules/
    ├── auth.js       # 认证模块
    └── settings.js   # 设置模块
```

### 命名约定

```js
// 使用 use 前缀和 Store 后缀
export const useUserStore = defineStore('user', { /* ... */ })
export const useCartStore = defineStore('cart', { /* ... */ })
export const useProductStore = defineStore('product', { /* ... */ })
```

### 状态设计原则

1. **保持状态扁平**：避免深层嵌套
2. **单一数据源**：每个数据只在一个地方定义
3. **最小化状态**：只存储必要的状态
4. **规范化数据**：使用 ID 映射而不是嵌套对象

```js
// 好的设计
export const useUserStore = defineStore('user', {
  state: () => ({
    users: {},           // { [id]: user }
    currentUserId: null,
    loading: false,
    error: null
  }),
  
  getters: {
    currentUser: (state) => state.users[state.currentUserId],
    userList: (state) => Object.values(state.users)
  }
})

// 避免的设计
export const useBadStore = defineStore('bad', {
  state: () => ({
    user: {
      profile: {
        personal: {
          name: '',
          nested: {
            // 过度嵌套
          }
        }
      }
    }
  })
})
```

### 异步操作处理

```js
export const useApiStore = defineStore('api', {
  state: () => ({
    data: null,
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchData(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.getData(id)
        this.data = response.data
      } catch (error) {
        this.error = error.message
        throw error // 重新抛出错误供组件处理
      } finally {
        this.loading = false
      }
    }
  }
})
```

## 迁移指南

### 从 Vuex 迁移

```js
// Vuex
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++
    }
  },
  actions: {
    increment({ commit }) {
      commit('increment')
    }
  },
  getters: {
    doubleCount: state => state.count * 2
  }
})

// Pinia
export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  actions: {
    increment() {
      this.count++
    }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  }
})
```

## 参考资源

- [Pinia 官方文档](https://pinia.vuejs.org/)
- [Pinia GitHub](https://github.com/vuejs/pinia)
- [Vue DevTools](https://devtools.vuejs.org/)
- [Pinia 插件生态](https://pinia.vuejs.org/cookbook/plugins.html)