---
outline: deep
---

# Vue3 知识库

## Vue3 简介

Vue3 是 Vue.js 的最新主要版本，于 2020 年 9 月正式发布。它在保持 Vue2 核心理念的基础上，带来了更好的性能、更小的包体积、更强的 TypeScript 支持，以及全新的组合式 API。

### Vue3 的主要特性

- **组合式 API (Composition API)**：提供更灵活的逻辑复用方式
- **更好的性能**：重写了虚拟 DOM，提升了渲染性能
- **更小的包体积**：支持 Tree-shaking，减少打包体积
- **更强的 TypeScript 支持**：从底层重写，提供更好的类型推导
- **多根节点组件**：支持 Fragment，组件可以有多个根节点
- **Teleport**：可以将组件渲染到 DOM 树的任意位置
- **Suspense**：支持异步组件的加载状态处理

::: tip Vue3 与 Vue2 的兼容性
Vue3 在设计时考虑了向后兼容性，大部分 Vue2 的 API 在 Vue3 中仍然可用。但建议在新项目中使用组合式 API 来获得更好的开发体验。
:::

## 创建 Vue3 应用

### 使用 Vite 创建项目

```bash
# 使用 npm
npm create vue@latest my-vue-app

# 使用 yarn
yarn create vue my-vue-app

# 使用 pnpm
pnpm create vue my-vue-app
```

### 手动创建应用

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

## 组合式 API

### setup() 函数

`setup()` 是组合式 API 的入口点，在组件创建之前执行。

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'

export default {
  setup() {
    // 响应式数据
    const title = ref('Vue3 Demo')
    const count = ref(0)
    
    // 方法
    const increment = () => {
      count.value++
    }
    
    // 返回模板需要的数据和方法
    return {
      title,
      count,
      increment
    }
  }
}
</script>
```

### script setup 语法糖

`<script setup>` 是组合式 API 的语法糖，使代码更简洁。

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 直接声明响应式数据
const title = ref('Vue3 Demo')
const count = ref(0)

// 直接声明方法
const increment = () => {
  count.value++
}
</script>
```

## 响应式 API

### ref()

`ref()` 用于创建响应式的基本数据类型。

```javascript
import { ref } from 'vue'

const count = ref(0)
const message = ref('Hello Vue3')

// 访问值需要使用 .value
console.log(count.value) // 0
count.value++
console.log(count.value) // 1
```

### reactive()

`reactive()` 用于创建响应式的对象。

```javascript
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  message: 'Hello Vue3',
  user: {
    name: 'Jerry',
    age: 25
  }
})

// 直接访问属性
console.log(state.count) // 0
state.count++
console.log(state.count) // 1
```

### computed()

计算属性，基于响应式数据计算得出的值。

```javascript
import { ref, computed } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 只读计算属性
const fullName = computed(() => {
  return `${firstName.value} ${lastName.value}`
})

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${firstName.value} ${lastName.value}`
  },
  set(value) {
    [firstName.value, lastName.value] = value.split(' ')
  }
})
```

### watch() 和 watchEffect()

监听响应式数据的变化。

```javascript
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const message = ref('Hello')

// watch 监听特定数据源
watch(count, (newValue, oldValue) => {
  console.log(`count changed from ${oldValue} to ${newValue}`)
})

// 监听多个数据源
watch([count, message], ([newCount, newMessage], [oldCount, oldMessage]) => {
  console.log('Multiple values changed')
})

// watchEffect 自动追踪依赖
watchEffect(() => {
  console.log(`Count is ${count.value}, message is ${message.value}`)
})
```

## 生命周期钩子

Vue3 中的生命周期钩子在组合式 API 中有新的命名。

```javascript
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted
} from 'vue'

export default {
  setup() {
    onBeforeMount(() => {
      console.log('组件挂载前')
    })
    
    onMounted(() => {
      console.log('组件已挂载')
    })
    
    onBeforeUpdate(() => {
      console.log('组件更新前')
    })
    
    onUpdated(() => {
      console.log('组件已更新')
    })
    
    onBeforeUnmount(() => {
      console.log('组件卸载前')
    })
    
    onUnmounted(() => {
      console.log('组件已卸载')
    })
  }
}
```

## 组件通信

### Props 和 Emits

```vue
<!-- 子组件 -->
<template>
  <div>
    <h3>{{ title }}</h3>
    <button @click="handleClick">Click me</button>
  </div>
</template>

<script setup>
// 定义 props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

// 定义 emits
const emit = defineEmits(['update', 'click'])

const handleClick = () => {
  emit('click', 'Button clicked!')
  emit('update', props.count + 1)
}
</script>
```

### Provide/Inject

跨层级组件通信。

```javascript
// 祖先组件
import { provide, ref } from 'vue'

const theme = ref('dark')
const updateTheme = (newTheme) => {
  theme.value = newTheme
}

provide('theme', {
  theme,
  updateTheme
})

// 后代组件
import { inject } from 'vue'

const { theme, updateTheme } = inject('theme')
```

## 新特性

### Teleport

将组件渲染到 DOM 树的任意位置。

```vue
<template>
  <div>
    <h1>Main Content</h1>
    
    <!-- 将模态框渲染到 body 下 -->
    <Teleport to="body">
      <div class="modal" v-if="showModal">
        <div class="modal-content">
          <h2>Modal Title</h2>
          <p>Modal content...</p>
          <button @click="showModal = false">Close</button>
        </div>
      </div>
    </Teleport>
    
    <button @click="showModal = true">Open Modal</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showModal = ref(false)
</script>
```

### Suspense

处理异步组件的加载状态。

```vue
<template>
  <Suspense>
    <!-- 异步组件 -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- 加载中的后备内容 -->
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent(() => 
  import('./components/AsyncComponent.vue')
)
</script>
```

### 多根节点组件

Vue3 支持组件有多个根节点。

```vue
<template>
  <header>Header content</header>
  <main>Main content</main>
  <footer>Footer content</footer>
</template>
```

## 状态管理

### 简单状态管理

对于简单的状态管理，可以使用响应式 API。

```javascript
// store.js
import { reactive } from 'vue'

export const store = reactive({
  count: 0,
  increment() {
    this.count++
  },
  decrement() {
    this.count--
  }
})

// 在组件中使用
import { store } from './store.js'

export default {
  setup() {
    return {
      store
    }
  }
}
```

### Pinia 状态管理

Pinia 是 Vue3 推荐的状态管理库。

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0
  }),
  getters: {
    doubleCount: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})

// 在组件中使用
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
```

## 性能优化

### 懒加载组件

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComponent = defineAsyncComponent({
  loader: () => import('./AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### v-memo 指令

缓存模板的一部分。

```vue
<template>
  <div v-memo="[valueA, valueB]">
    <!-- 只有当 valueA 或 valueB 改变时才重新渲染 -->
    <ExpensiveComponent :value="valueA" />
    <AnotherComponent :value="valueB" />
  </div>
</template>
```

## 最佳实践

### 1. 使用组合式 API

- 优先使用 `<script setup>` 语法
- 合理使用 `ref()` 和 `reactive()`
- 将相关逻辑组合在一起

### 2. TypeScript 支持

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const user = ref<User>({
  id: 1,
  name: 'Jerry',
  email: 'jerry@example.com'
})

const displayName = computed((): string => {
  return `${user.value.name} (${user.value.email})`
})
</script>
```

### 3. 组件设计原则

- 保持组件的单一职责
- 合理使用 props 和 emits
- 避免过深的组件嵌套
- 使用 provide/inject 进行跨层级通信

### 4. 性能优化建议

- 使用 `v-memo` 缓存昂贵的渲染
- 合理使用 `shallowRef()` 和 `shallowReactive()`
- 避免在模板中使用复杂的表达式
- 使用 `defineAsyncComponent` 进行代码分割

## 迁移指南

### 从 Vue2 迁移到 Vue3

1. **更新依赖**：升级 Vue 版本和相关生态库
2. **API 变更**：使用新的创建应用方式
3. **组合式 API**：逐步迁移到组合式 API
4. **移除的特性**：处理 Vue3 中移除的特性
5. **工具链更新**：更新构建工具和开发工具

### 常见迁移问题

- 全局 API 的变更
- 事件 API 的移除
- 过滤器的移除
- 插槽语法的变更

## 总结

Vue3 带来了许多激动人心的新特性和改进：

- **组合式 API** 提供了更灵活的逻辑复用方式
- **更好的性能** 和更小的包体积
- **更强的 TypeScript 支持**
- **新的内置组件** 如 Teleport 和 Suspense
- **更好的开发体验** 和工具支持

Vue3 保持了 Vue 一贯的易学易用特性，同时为大型应用提供了更好的支持。建议在新项目中使用 Vue3，并逐步将现有项目迁移到 Vue3。