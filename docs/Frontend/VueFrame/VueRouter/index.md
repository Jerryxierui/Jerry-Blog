---
outline: deep
---

# Vue Router 知识库

## Vue Router 简介

Vue Router 是 Vue.js 的官方路由管理器，用于构建单页应用程序 (SPA)。它与 Vue.js 深度集成，让构建单页应用变得轻而易举。Vue Router 包含的功能有：嵌套的路由/视图表、模块化的、基于组件的路由配置、路由参数、查询、通配符、基于 Vue.js 过渡系统的视图过渡效果、细粒度的导航控制等。

### 版本说明

- **Vue Router 3.x**：适用于 Vue 2
- **Vue Router 4.x**：适用于 Vue 3

本文档主要基于 Vue Router 4.x 进行讲解。

## 安装和基本配置

### 安装

```bash
# npm
npm install vue-router@4

# yarn
yarn add vue-router@4

# pnpm
pnpm add vue-router@4
```

### 基本配置

```javascript
// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <div id="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/about">About</router-link>
    </nav>
    <router-view />
  </div>
</template>
```

## 路由配置

### 基础路由

```javascript
const routes = [
  // 静态路由
  { path: '/', component: Home },
  { path: '/about', component: About },
  
  // 动态路由
  { path: '/user/:id', component: User },
  
  // 可选参数
  { path: '/user/:id?', component: User },
  
  // 多个参数
  { path: '/user/:id/post/:postId', component: UserPost },
  
  // 通配符路由（404页面）
  { path: '/:pathMatch(.*)*', component: NotFound }
]
```

### 嵌套路由

```javascript
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      // 空路径表示默认子路由
      { path: '', component: UserHome },
      
      // 相对路径
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts },
      
      // 绝对路径
      { path: '/user/:id/settings', component: UserSettings }
    ]
  }
]
```

```vue
<!-- User.vue -->
<template>
  <div class="user">
    <h2>User {{ $route.params.id }}</h2>
    <nav>
      <router-link :to="`/user/${$route.params.id}`">Home</router-link>
      <router-link :to="`/user/${$route.params.id}/profile`">Profile</router-link>
      <router-link :to="`/user/${$route.params.id}/posts`">Posts</router-link>
    </nav>
    <!-- 子路由出口 -->
    <router-view />
  </div>
</template>
```

### 命名路由

```javascript
const routes = [
  {
    path: '/user/:id',
    name: 'user',
    component: User
  }
]
```

```vue
<template>
  <!-- 使用命名路由 -->
  <router-link :to="{ name: 'user', params: { id: 123 }}">User</router-link>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 编程式导航
const goToUser = (id) => {
  router.push({ name: 'user', params: { id } })
}
</script>
```

### 命名视图

```javascript
const routes = [
  {
    path: '/',
    components: {
      default: Home,
      sidebar: Sidebar,
      header: Header
    }
  }
]
```

```vue
<template>
  <router-view name="header" />
  <div class="container">
    <router-view name="sidebar" />
    <router-view /> <!-- 默认视图 -->
  </div>
</template>
```

## 路由导航

### 声明式导航

```vue
<template>
  <!-- 基本用法 -->
  <router-link to="/about">About</router-link>
  
  <!-- 绑定对象 -->
  <router-link :to="{ path: '/about' }">About</router-link>
  
  <!-- 命名路由 -->
  <router-link :to="{ name: 'user', params: { id: 123 }}">User</router-link>
  
  <!-- 带查询参数 -->
  <router-link :to="{ path: '/search', query: { q: 'vue' }}">Search</router-link>
  
  <!-- 带哈希 -->
  <router-link :to="{ path: '/about', hash: '#team' }">About Team</router-link>
  
  <!-- 替换历史记录 -->
  <router-link :to="'/about'" replace>About</router-link>
  
  <!-- 自定义激活类名 -->
  <router-link to="/about" active-class="active" exact-active-class="exact-active">
    About
  </router-link>
</template>
```

### 编程式导航

```javascript
import { useRouter } from 'vue-router'

const router = useRouter()

// 导航到不同的位置
router.push('/about')
router.push({ path: '/about' })
router.push({ name: 'user', params: { id: 123 }})
router.push({ path: '/search', query: { q: 'vue' }})

// 替换当前位置
router.replace('/about')
router.replace({ path: '/about' })

// 横跨历史
router.go(1)  // 前进一步
router.go(-1) // 后退一步
router.go(3)  // 前进三步

// 如果没有那么多记录，静默失败
router.go(-100)
router.go(100)

// 等同于 router.go(1)
router.forward()

// 等同于 router.go(-1)
router.back()
```

## 路由参数和查询

### 获取路由参数

```vue
<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 路径参数
const userId = computed(() => route.params.id)

// 查询参数
const searchQuery = computed(() => route.query.q)

// 完整路径
const fullPath = computed(() => route.fullPath)

// 路由名称
const routeName = computed(() => route.name)
</script>

<template>
  <div>
    <p>User ID: {{ userId }}</p>
    <p>Search Query: {{ searchQuery }}</p>
    <p>Full Path: {{ fullPath }}</p>
    <p>Route Name: {{ routeName }}</p>
  </div>
</template>
```

### 响应路由参数变化

```vue
<script setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId, oldId) => {
    console.log(`User ID changed from ${oldId} to ${newId}`)
    // 重新获取用户数据
    fetchUser(newId)
  }
)

// 监听整个路由对象
watch(
  route,
  (to, from) => {
    console.log('Route changed:', to, from)
  }
)

const fetchUser = (id) => {
  // 获取用户数据的逻辑
}
</script>
```

## 路由守卫

### 全局守卫

```javascript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查用户是否已登录
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login')
  } else {
    next()
  }
})

// 全局解析守卫
router.beforeResolve((to, from, next) => {
  // 在导航被确认之前，同时在所有组件内守卫和异步路由组件被解析之后调用
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 发送页面浏览统计
  sendToAnalytics(to.fullPath)
})
```

### 路由独享守卫

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 检查管理员权限
      if (hasAdminPermission()) {
        next()
      } else {
        next('/unauthorized')
      }
    }
  }
]
```

### 组件内守卫

```vue
<script setup>
import { onBeforeRouteEnter, onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { ref } from 'vue'

const data = ref(null)

// 进入路由前
onBeforeRouteEnter((to, from, next) => {
  // 在渲染该组件的对应路由被确认前调用
  // 不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建
  fetchData(to.params.id).then(result => {
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.data = result
    })
  })
})

// 路由更新时
onBeforeRouteUpdate((to, from, next) => {
  // 在当前路由改变，但是该组件被复用时调用
  // 可以访问组件实例 `this`
  fetchData(to.params.id).then(result => {
    data.value = result
    next()
  })
})

// 离开路由前
onBeforeRouteLeave((to, from, next) => {
  // 导航离开该组件的对应路由时调用
  // 可以访问组件实例 `this`
  if (hasUnsavedChanges()) {
    const answer = window.confirm('你有未保存的更改，确定要离开吗？')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
```

## 路由元信息

```javascript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin'],
      title: '管理后台'
    }
  },
  {
    path: '/profile',
    component: Profile,
    meta: {
      requiresAuth: true,
      title: '个人资料'
    }
  }
]

// 在守卫中使用元信息
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查认证
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.roles && !hasRole(to.meta.roles)) {
    next('/unauthorized')
    return
  }
  
  next()
})
```

## 懒加载路由

```javascript
// 路由级别的代码分割
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    // 将组件分组到同一个异步块中
    // webpackChunkName: "admin"
  }
]

// 使用 Vite 的动态导入
const routes = [
  {
    path: '/user',
    component: () => import('../views/User.vue')
  }
]
```

## 过渡效果

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 基于路由的过渡

```vue
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>
```

```javascript
const routes = [
  {
    path: '/home',
    component: Home,
    meta: { transition: 'slide-left' }
  },
  {
    path: '/about',
    component: About,
    meta: { transition: 'slide-right' }
  }
]
```

## 滚动行为

```javascript
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（浏览器前进/后退）
    if (savedPosition) {
      return savedPosition
    }
    
    // 如果有锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // 默认滚动到顶部
    return { top: 0 }
  }
})
```

## 最佳实践

### 1. 路由结构设计

```javascript
// 推荐的路由结构
const routes = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: { title: '首页' }
      },
      {
        path: 'about',
        name: 'About',
        component: About,
        meta: { title: '关于我们' }
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { title: '注册' }
      }
    ]
  }
]
```

### 2. 路由守卫的使用

```javascript
// 统一的认证检查
const requireAuth = (to, from, next) => {
  if (store.getters.isAuthenticated) {
    next()
  } else {
    next('/login')
  }
}

// 统一的权限检查
const requireRole = (roles) => {
  return (to, from, next) => {
    if (store.getters.hasRole(roles)) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}

// 在路由中使用
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: [requireAuth, requireRole(['admin'])]
  }
]
```

### 3. 错误处理

```javascript
// 全局错误处理
router.onError((error) => {
  console.error('Router error:', error)
  // 发送错误报告
  sendErrorReport(error)
})

// 404 处理
const routes = [
  // ... 其他路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]
```

### 4. 性能优化

```javascript
// 预加载关键路由
const routes = [
  {
    path: '/important',
    component: () => import(/* webpackPreload: true */ '../views/Important.vue')
  },
  
  // 按功能模块分组
  {
    path: '/admin',
    component: () => import(/* webpackChunkName: "admin" */ '../views/Admin.vue')
  },
  {
    path: '/admin/users',
    component: () => import(/* webpackChunkName: "admin" */ '../views/AdminUsers.vue')
  }
]
```

## 常见问题

### 1. 路由参数不更新

```vue
<!-- 问题：组件复用时参数不更新 -->
<script setup>
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const route = useRoute()

// 解决方案：监听路由参数变化
watch(
  () => route.params,
  (newParams) => {
    // 重新获取数据
    fetchData(newParams)
  },
  { immediate: true }
)
</script>
```

### 2. 导航重复错误

```javascript
// 问题：重复导航到同一路由
router.push('/same-route')

// 解决方案：检查当前路由
if (router.currentRoute.value.path !== '/target-route') {
  router.push('/target-route')
}

// 或者捕获错误
router.push('/same-route').catch(err => {
  if (err.name !== 'NavigationDuplicated') {
    throw err
  }
})
```

### 3. 路由守卫中的异步操作

```javascript
// 正确的异步守卫写法
router.beforeEach(async (to, from, next) => {
  try {
    if (to.meta.requiresAuth) {
      await checkAuth()
    }
    next()
  } catch (error) {
    next('/login')
  }
})
```

## 总结

Vue Router 是构建 Vue.js 单页应用的核心工具，提供了：

- **灵活的路由配置**：支持静态、动态、嵌套路由
- **强大的导航控制**：声明式和编程式导航
- **完善的守卫机制**：全局、路由、组件级别的守卫
- **丰富的功能特性**：懒加载、过渡效果、滚动行为等
- **良好的开发体验**：与 Vue 3 组合式 API 完美集成

掌握 Vue Router 的使用对于开发复杂的 Vue.js 应用至关重要。
