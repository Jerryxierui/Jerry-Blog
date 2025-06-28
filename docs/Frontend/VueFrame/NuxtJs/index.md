---
outline: deep
---

# Nuxt.js 知识库

## Nuxt.js 简介

### 什么是 Nuxt.js？

Nuxt.js 是一个基于 Vue.js 的通用应用框架，它预设了利用 Vue.js 开发服务端渲染的应用所需要的各种配置。Nuxt.js 提供了一个开箱即用的解决方案，让开发者能够快速构建现代化的 Web 应用。

### 核心特性

- **服务端渲染 (SSR)**：提供更好的 SEO 和首屏加载性能
- **静态站点生成 (SSG)**：支持预渲染静态页面
- **自动路由**：基于文件系统的路由配置
- **代码分割**：自动进行代码分割和懒加载
- **热重载**：开发时的热模块替换
- **ES6/ES7 支持**：通过 Babel 转译
- **打包和压缩**：使用 Webpack 进行资源优化
- **CSS 预处理器**：支持 Sass、Less、Stylus 等

::: tip
Nuxt.js 的设计理念是"约定优于配置"，通过合理的默认配置和目录结构，让开发者专注于业务逻辑的实现。
:::

## 安装和项目创建

### 使用 create-nuxt-app 创建项目

```bash
# 使用 npx（推荐）
npx create-nuxt-app my-nuxt-app

# 使用 yarn
yarn create nuxt-app my-nuxt-app

# 使用 npm
npm init nuxt-app my-nuxt-app
```

### 手动安装

```bash
# 创建项目目录
mkdir my-nuxt-app
cd my-nuxt-app

# 初始化 package.json
npm init -y

# 安装 Nuxt.js
npm install nuxt

# 添加脚本到 package.json
```

```json
{
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate"
  }
}
```

### 项目结构

```
my-nuxt-app/
├── assets/          # 未编译的静态资源
│   ├── css/
│   ├── images/
│   └── js/
├── components/      # Vue 组件
│   ├── Header.vue
│   └── Footer.vue
├── layouts/         # 布局组件
│   ├── default.vue
│   └── error.vue
├── middleware/      # 中间件
│   └── auth.js
├── pages/           # 页面组件（自动生成路由）
│   ├── index.vue
│   ├── about.vue
│   └── users/
│       ├── index.vue
│       └── _id.vue
├── plugins/         # 插件
│   └── axios.js
├── static/          # 静态文件
│   ├── favicon.ico
│   └── robots.txt
├── store/           # Vuex 状态管理
│   ├── index.js
│   └── users.js
├── nuxt.config.js   # Nuxt 配置文件
└── package.json
```

## 基础配置

### nuxt.config.js 配置

```javascript
// nuxt.config.js
export default {
  // 全局页面 headers
  head: {
    title: 'My Nuxt App',
    htmlAttrs: {
      lang: 'zh-CN'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '我的 Nuxt.js 应用' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' }
    ]
  },

  // 全局 CSS
  css: [
    '~/assets/css/main.css',
    '~/assets/scss/global.scss'
  ],

  // 插件
  plugins: [
    '~/plugins/axios.js',
    '~/plugins/vue-lazyload.js',
    { src: '~/plugins/localStorage.js', mode: 'client' }
  ],

  // 自动导入组件
  components: true,

  // 开发工具模块
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss'
  ],

  // 模块
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@nuxtjs/auth-next',
    '@nuxtjs/i18n'
  ],

  // Axios 模块配置
  axios: {
    baseURL: process.env.API_URL || 'http://localhost:3001/api'
  },

  // PWA 模块配置
  pwa: {
    manifest: {
      lang: 'zh-CN',
      name: 'My Nuxt App',
      short_name: 'NuxtApp',
      description: '我的 Nuxt.js 应用'
    }
  },

  // 国际化配置
  i18n: {
    locales: [
      { code: 'zh', name: '中文', file: 'zh.js' },
      { code: 'en', name: 'English', file: 'en.js' }
    ],
    defaultLocale: 'zh',
    langDir: 'lang/'
  },

  // 构建配置
  build: {
    // 分析包大小
    analyze: process.env.NODE_ENV === 'development',
    
    // 扩展 webpack 配置
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    },
    
    // 优化
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all'
          }
        }
      }
    }
  },

  // 服务器配置
  server: {
    port: 3000,
    host: '0.0.0.0'
  },

  // 环境变量
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001/api'
  },

  // 渲染模式
  mode: 'universal', // 或 'spa'
  
  // 目标
  target: 'server', // 或 'static'

  // 加载指示器
  loading: {
    color: '#3B82F6',
    height: '3px'
  },

  // 错误页面
  error: {
    layout: 'error'
  }
}
```

## 页面和路由

### 基础页面

```vue
<!-- pages/index.vue -->
<template>
  <div class="home-page">
    <Header />
    
    <main class="main-content">
      <section class="hero">
        <h1 class="hero-title">欢迎来到 Nuxt.js</h1>
        <p class="hero-description">
          一个基于 Vue.js 的通用应用框架
        </p>
        <NuxtLink to="/about" class="cta-button">
          了解更多
        </NuxtLink>
      </section>
      
      <section class="features">
        <h2>核心特性</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-card">
            <div class="feature-icon">
              <component :is="feature.icon" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>
    </main>
    
    <Footer />
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  
  // 页面元信息
  head() {
    return {
      title: '首页',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: '这是 Nuxt.js 应用的首页'
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: 'Nuxt.js, Vue.js, SSR, 前端框架'
        }
      ]
    }
  },
  
  data() {
    return {
      features: [
        {
          id: 1,
          title: '服务端渲染',
          description: '提供更好的 SEO 和首屏加载性能',
          icon: 'ServerIcon'
        },
        {
          id: 2,
          title: '自动路由',
          description: '基于文件系统的路由配置',
          icon: 'RouteIcon'
        },
        {
          id: 3,
          title: '代码分割',
          description: '自动进行代码分割和懒加载',
          icon: 'SplitIcon'
        }
      ]
    }
  },
  
  // 异步数据获取
  async asyncData({ $axios, params, error }) {
    try {
      // 在服务端和客户端都会执行
      const { data } = await $axios.get('/api/home-data')
      return {
        homeData: data
      }
    } catch (err) {
      error({ statusCode: 500, message: '数据获取失败' })
    }
  },
  
  // 获取数据（仅在客户端）
  async fetch() {
    // 这个方法在 Nuxt 2.12+ 中可用
    this.posts = await this.$axios.$get('/api/posts')
  },
  
  mounted() {
    console.log('页面已挂载')
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
}

.hero {
  text-align: center;
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.hero-description {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: transform 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.features {
  text-align: center;
}

.features h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2d3748;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  color: #667eea;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2d3748;
}

.feature-card p {
  color: #718096;
  line-height: 1.6;
}
</style>
```

### 动态路由

```vue
<!-- pages/users/_id.vue -->
<template>
  <div class="user-detail">
    <div v-if="$fetchState.pending" class="loading">
      加载中...
    </div>
    
    <div v-else-if="$fetchState.error" class="error">
      <h2>出错了</h2>
      <p>{{ $fetchState.error.message }}</p>
      <button @click="$fetch">重试</button>
    </div>
    
    <div v-else class="user-content">
      <div class="user-header">
        <img :src="user.avatar" :alt="user.name" class="user-avatar">
        <div class="user-info">
          <h1>{{ user.name }}</h1>
          <p class="user-email">{{ user.email }}</p>
          <p class="user-bio">{{ user.bio }}</p>
        </div>
      </div>
      
      <div class="user-stats">
        <div class="stat">
          <span class="stat-number">{{ user.postsCount }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ user.followersCount }}</span>
          <span class="stat-label">关注者</span>
        </div>
        <div class="stat">
          <span class="stat-number">{{ user.followingCount }}</span>
          <span class="stat-label">关注中</span>
        </div>
      </div>
      
      <div class="user-posts">
        <h2>最新文章</h2>
        <div class="posts-grid">
          <article v-for="post in user.posts" :key="post.id" class="post-card">
            <NuxtLink :to="`/posts/${post.slug}`">
              <img :src="post.coverImage" :alt="post.title" class="post-image">
              <div class="post-content">
                <h3>{{ post.title }}</h3>
                <p>{{ post.excerpt }}</p>
                <time>{{ formatDate(post.publishedAt) }}</time>
              </div>
            </NuxtLink>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserDetail',
  
  data() {
    return {
      user: null
    }
  },
  
  async fetch() {
    const userId = this.$route.params.id
    
    try {
      this.user = await this.$axios.$get(`/api/users/${userId}`)
    } catch (error) {
      throw error
    }
  },
  
  head() {
    if (!this.user) return {}
    
    return {
      title: `${this.user.name} - 用户详情`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.user.bio || `${this.user.name}的个人主页`
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.user.name
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.user.bio
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.user.avatar
        }
      ]
    }
  },
  
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    }
  },
  
  // 路由验证
  validate({ params }) {
    // 验证参数是否为数字
    return /^\d+$/.test(params.id)
  }
}
</script>

<style scoped>
.user-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading, .error {
  text-align: center;
  padding: 4rem;
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-right: 2rem;
}

.user-info h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.user-email {
  color: #718096;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.user-bio {
  color: #4a5568;
  line-height: 1.6;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
}

.user-posts h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.post-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.post-card:hover {
  transform: translateY(-4px);
}

.post-card a {
  text-decoration: none;
  color: inherit;
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-content {
  padding: 1.5rem;
}

.post-content h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.post-content p {
  color: #718096;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.post-content time {
  color: #a0aec0;
  font-size: 0.9rem;
}
</style>
```

## 布局系统

### 默认布局

```vue
<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="main-content">
      <Nuxt />
    </main>
    
    <AppFooter />
    
    <!-- 全局组件 -->
    <NotificationContainer />
    <LoadingOverlay v-if="$nuxt.$loading.show" />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Header 高度 */
}
</style>
```

### 自定义布局

```vue
<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar :collapsed="sidebarCollapsed" />
    
    <div class="admin-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <AdminHeader @toggle-sidebar="toggleSidebar" />
      
      <div class="admin-content">
        <Nuxt />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminLayout',
  
  data() {
    return {
      sidebarCollapsed: false
    }
  },
  
  methods: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-main {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.3s;
}

.admin-main.sidebar-collapsed {
  margin-left: 80px;
}

.admin-content {
  padding: 2rem;
}
</style>
```

### 错误页面

```vue
<!-- layouts/error.vue -->
<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-code">
        {{ error.statusCode }}
      </div>
      
      <div class="error-message">
        <h1 v-if="error.statusCode === 404">
          页面未找到
        </h1>
        <h1 v-else>
          服务器错误
        </h1>
        
        <p>{{ error.message }}</p>
        
        <div class="error-actions">
          <NuxtLink to="/" class="btn btn-primary">
            返回首页
          </NuxtLink>
          <button @click="$router.go(-1)" class="btn btn-secondary">
            返回上页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
  
  props: {
    error: {
      type: Object,
      required: true
    }
  },
  
  head() {
    return {
      title: `错误 ${this.error.statusCode}`
    }
  }
}
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.error-container {
  text-align: center;
  max-width: 500px;
  padding: 2rem;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.error-message h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.error-message p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}
</style>
```

## 中间件

### 认证中间件

```javascript
// middleware/auth.js
export default function ({ store, redirect, route }) {
  // 检查用户是否已登录
  if (!store.state.auth.user) {
    // 保存当前路由，登录后重定向
    const redirectPath = route.fullPath
    return redirect(`/login?redirect=${encodeURIComponent(redirectPath)}`)
  }
}
```

### 管理员权限中间件

```javascript
// middleware/admin.js
export default function ({ store, redirect, error }) {
  const user = store.state.auth.user
  
  if (!user) {
    return redirect('/login')
  }
  
  if (user.role !== 'admin') {
    error({
      statusCode: 403,
      message: '权限不足'
    })
  }
}
```

### 全局中间件

```javascript
// middleware/analytics.js
export default function ({ route }) {
  // 页面访问统计
  if (process.client && typeof gtag !== 'undefined') {
    gtag('config', 'GA_TRACKING_ID', {
      page_path: route.fullPath
    })
  }
}
```

在页面中使用中间件：

```vue
<script>
export default {
  // 单个中间件
  middleware: 'auth',
  
  // 多个中间件
  middleware: ['auth', 'admin'],
  
  // 内联中间件
  middleware({ store, redirect }) {
    if (!store.state.auth.user) {
      return redirect('/login')
    }
  }
}
</script>
```

## 状态管理 (Vuex)

### Store 模块

```javascript
// store/index.js
export const state = () => ({
  counter: 0
})

export const mutations = {
  increment(state) {
    state.counter++
  },
  decrement(state) {
    state.counter--
  }
}

export const actions = {
  async nuxtServerInit({ commit }, { app }) {
    // 服务端初始化时调用
    try {
      const { data } = await app.$axios.get('/api/init')
      commit('setInitialData', data)
    } catch (error) {
      console.error('初始化失败:', error)
    }
  }
}

export const getters = {
  doubleCounter: state => state.counter * 2
}
```

### 用户模块

```javascript
// store/auth.js
export const state = () => ({
  user: null,
  token: null,
  loading: false,
  error: null
})

export const mutations = {
  SET_USER(state, user) {
    state.user = user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  
  SET_ERROR(state, error) {
    state.error = error
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.error = null
  }
}

export const actions = {
  async login({ commit }, credentials) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      const { data } = await this.$axios.post('/api/auth/login', credentials)
      
      commit('SET_USER', data.user)
      commit('SET_TOKEN', data.token)
      
      // 设置 axios 默认 header
      this.$axios.setToken(data.token, 'Bearer')
      
      // 保存到 cookie
      this.$cookies.set('auth-token', data.token, {
        httpOnly: true,
        secure: true,
        maxAge: 60 * 60 * 24 * 7 // 7 天
      })
      
      return data
    } catch (error) {
      commit('SET_ERROR', error.response?.data?.message || '登录失败')
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
  
  async logout({ commit }) {
    try {
      await this.$axios.post('/api/auth/logout')
    } catch (error) {
      console.error('登出请求失败:', error)
    } finally {
      commit('CLEAR_AUTH')
      this.$axios.setToken(false)
      this.$cookies.remove('auth-token')
      this.$router.push('/login')
    }
  },
  
  async fetchUser({ commit, state }) {
    if (!state.token) return
    
    try {
      const { data } = await this.$axios.get('/api/auth/me')
      commit('SET_USER', data)
      return data
    } catch (error) {
      commit('CLEAR_AUTH')
      throw error
    }
  }
}

export const getters = {
  isAuthenticated: state => !!state.user,
  isAdmin: state => state.user?.role === 'admin'
}
```

## 插件系统

### Axios 插件

```javascript
// plugins/axios.js
export default function ({ $axios, redirect, store }) {
  // 请求拦截器
  $axios.onRequest(config => {
    console.log('Making request to ' + config.url)
    
    // 添加认证 token
    const token = store.state.auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  })
  
  // 响应拦截器
  $axios.onResponse(response => {
    console.log('Response received:', response.status)
  })
  
  // 错误处理
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    
    if (code === 401) {
      // 未授权，重定向到登录页
      store.commit('auth/CLEAR_AUTH')
      redirect('/login')
    } else if (code === 500) {
      // 服务器错误
      console.error('服务器错误:', error)
    }
    
    return Promise.reject(error)
  })
}
```

### 全局组件插件

```javascript
// plugins/global-components.js
import Vue from 'vue'
import BaseButton from '~/components/base/BaseButton.vue'
import BaseInput from '~/components/base/BaseInput.vue'
import BaseModal from '~/components/base/BaseModal.vue'

// 注册全局组件
Vue.component('BaseButton', BaseButton)
Vue.component('BaseInput', BaseInput)
Vue.component('BaseModal', BaseModal)
```

### 第三方库插件

```javascript
// plugins/vue-lazyload.js
import Vue from 'vue'
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: '/images/error.png',
  loading: '/images/loading.gif',
  attempt: 1,
  listenEvents: ['scroll', 'wheel', 'mousewheel', 'resize', 'animationend', 'transitionend']
})
```

### 客户端专用插件

```javascript
// plugins/localStorage.js
import createPersistedState from 'vuex-persistedstate'

export default ({ store }) => {
  createPersistedState({
    key: 'nuxt-app',
    paths: ['auth.user', 'settings']
  })(store)
}
```

## 数据获取

### asyncData

```vue
<template>
  <div>
    <h1>{{ post.title }}</h1>
    <div v-html="post.content"></div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $axios, error }) {
    try {
      const { data } = await $axios.get(`/api/posts/${params.slug}`)
      return {
        post: data
      }
    } catch (err) {
      error({ statusCode: 404, message: '文章未找到' })
    }
  }
}
</script>
```

### fetch 方法

```vue
<template>
  <div>
    <div v-if="$fetchState.pending">加载中...</div>
    <div v-else-if="$fetchState.error">加载失败</div>
    <div v-else>
      <article v-for="post in posts" :key="post.id">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: []
    }
  },
  
  async fetch() {
    this.posts = await this.$axios.$get('/api/posts')
  },
  
  // 每 60 秒重新获取数据
  fetchOnServer: false,
  fetchDelay: 200
}
</script>
```

## 部署

### 服务端渲染部署

```bash
# 构建应用
npm run build

# 启动生产服务器
npm run start
```

### 静态站点生成

```bash
# 生成静态文件
npm run generate

# 生成的文件在 dist/ 目录
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["npm", "start"]
```

### Vercel 部署

```json
// vercel.json
{
  "builds": [
    {
      "src": "nuxt.config.js",
      "use": "@nuxtjs/vercel-builder"
    }
  ]
}
```

## 性能优化

### 代码分割

```javascript
// nuxt.config.js
export default {
  build: {
    optimization: {
      splitChunks: {
        layouts: true,
        pages: true,
        commons: true
      }
    }
  }
}
```

### 图片优化

```javascript
// nuxt.config.js
export default {
  modules: [
    '@nuxt/image'
  ],
  
  image: {
    // 图片优化配置
    provider: 'static',
    static: {
      baseURL: '/images/'
    }
  }
}
```

```vue
<template>
  <div>
    <!-- 使用 nuxt-img 组件 -->
    <nuxt-img
      src="/hero.jpg"
      alt="Hero image"
      width="800"
      height="600"
      loading="lazy"
      placeholder
    />
  </div>
</template>
```

### 缓存策略

```javascript
// nuxt.config.js
export default {
  render: {
    // 静态资源缓存
    static: {
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 天
    }
  },
  
  // PWA 缓存
  pwa: {
    workbox: {
      runtimeCaching: [
        {
          urlPattern: '/api/.*',
          handler: 'NetworkFirst',
          strategyOptions: {
            cacheName: 'api-cache',
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    }
  }
}
```

## 测试

### 单元测试

```javascript
// test/components/Header.spec.js
import { mount } from '@vue/test-utils'
import Header from '~/components/Header.vue'

describe('Header', () => {
  test('renders correctly', () => {
    const wrapper = mount(Header)
    expect(wrapper.find('h1').text()).toBe('My App')
  })
  
  test('navigation works', async () => {
    const wrapper = mount(Header)
    await wrapper.find('.nav-link').trigger('click')
    expect(wrapper.emitted().navigate).toBeTruthy()
  })
})
```

### E2E 测试

```javascript
// test/e2e/homepage.spec.js
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  await expect(page.locator('h1')).toContainText('欢迎来到 Nuxt.js')
  await expect(page.locator('.cta-button')).toBeVisible()
})

test('navigation works', async ({ page }) => {
  await page.goto('/')
  
  await page.click('.cta-button')
  await expect(page).toHaveURL('/about')
})
```

## 最佳实践

### 项目结构

```
project/
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   └── variables.css
│   ├── images/
│   └── icons/
├── components/
│   ├── base/          # 基础组件
│   ├── layout/        # 布局组件
│   └── feature/       # 功能组件
├── composables/       # 组合式函数
├── layouts/
├── middleware/
├── pages/
├── plugins/
├── static/
├── store/
└── utils/             # 工具函数
```

### SEO 优化

```vue
<script>
export default {
  head() {
    return {
      title: this.post.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.post.description
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.post.title
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.post.description
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.post.image
        },
        {
          hid: 'twitter:card',
          name: 'twitter:card',
          content: 'summary_large_image'
        }
      ],
      link: [
        {
          hid: 'canonical',
          rel: 'canonical',
          href: `https://example.com${this.$route.path}`
        }
      ],
      script: [
        {
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: this.post.title,
            description: this.post.description,
            author: {
              '@type': 'Person',
              name: this.post.author.name
            }
          }
        }
      ]
    }
  }
}
</script>
```

## 参考资源

- [Nuxt.js 官方文档](https://nuxtjs.org/)
- [Vue.js 官方文档](https://vuejs.org/)
- [Nuxt.js 模块](https://modules.nuxtjs.org/)
- [Nuxt.js 社区](https://github.com/nuxt/nuxt.js)
- [Nuxt.js 示例](https://github.com/nuxt/examples)
- [Vue School Nuxt.js 课程](https://vueschool.io/courses/nuxtjs-fundamentals)

## 总结

Nuxt.js 是一个功能强大的 Vue.js 框架，它通过约定优于配置的理念，大大简化了 Vue.js 应用的开发过程。无论是服务端渲染、静态站点生成，还是单页应用，Nuxt.js 都能提供优秀的开发体验和性能表现。掌握 Nuxt.js 的核心概念和最佳实践，能够帮助开发者构建现代化、高性能的 Web 应用。