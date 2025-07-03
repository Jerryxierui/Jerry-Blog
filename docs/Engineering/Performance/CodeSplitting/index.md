# 代码分割

## 简介
### 🚀 什么是代码分割

代码分割（Code Splitting）是一种优化技术，将应用程序的代码拆分成多个较小的包（chunks），按需加载，从而减少初始加载时间，提升用户体验。

代码分割的核心思想是**"只加载当前需要的代码"**，通过将大型应用拆分成更小、更易管理的代码块，实现更快的页面加载速度和更好的用户体验。

### 🎯 适用场景

- **大型单页应用（SPA）**：减少首屏加载时间
- **多页面应用**：按页面分割代码
- **功能模块丰富的应用**：按功能模块分割
- **第三方依赖较多的项目**：分离 vendor 代码
- **移动端应用**：优化网络资源消耗

### 核心优势
- **减少初始包大小**：只加载必要的代码
- **提升加载速度**：并行加载多个小包
- **改善用户体验**：更快的首屏渲染
- **优化缓存策略**：独立更新不同模块
- **按需加载**：用户需要时才加载相应功能

### 分割策略
- **路由级分割**：按页面/路由分割，适用于 SPA 应用
- **组件级分割**：按组件分割，适用于大型组件或条件渲染组件
- **功能级分割**：按功能模块分割，适用于可选功能或权限相关功能
- **第三方库分割**：分离 vendor 代码，优化缓存策略
- **公共代码分割**：提取共享代码，减少重复打包
- **异步模块分割**：按需加载的工具库和插件
- **CSS 代码分割**：分离样式文件，优化关键渲染路径

### 📊 性能指标

代码分割的效果可以通过以下指标衡量：

- **首屏加载时间（FCP）**：首次内容绘制时间
- **最大内容绘制（LCP）**：最大内容元素的渲染时间
- **首次输入延迟（FID）**：用户首次交互的响应时间
- **累积布局偏移（CLS）**：页面布局稳定性
- **包大小减少比例**：初始包大小的优化程度
- **缓存命中率**：代码块的缓存利用率

## Webpack 代码分割
### 基础配置

```javascript
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    clean: true
  },

  optimization: {
    // 代码分割配置
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,

      cacheGroups: {
        // 第三方库分割
        vendor: {
          test: /[\\\/]node_modules[\\\/]/,
          name: 'vendors',
          priority: 10,
          chunks: 'all',
          enforce: true
        },

        // React 相关库单独分割
        react: {
          test: /[\\\/]node_modules[\\\/](react|react-dom)[\\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
          enforce: true
        },

        // UI 库分割
        ui: {
          test: /[\\\/]node_modules[\\\/](antd|@ant-design|element-ui)[\\\/]/,
          name: 'ui',
          priority: 15,
          chunks: 'all',
          enforce: true
        },

        // 工具库分割
        utils: {
          test: /[\\\/]node_modules[\\\/](lodash|moment|dayjs|axios)[\\\/]/,
          name: 'utils',
          priority: 12,
          chunks: 'all',
          enforce: true
        },

        // 公共代码分割
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true
        },

        // 默认分组
        default: {
          minChunks: 2,
          priority: -10,
          reuseExistingChunk: true
        }
      }
    },

    // 运行时代码分离
    runtimeChunk: {
      name: 'runtime'
    },

    // 模块 ID 优化
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true
    }),

    // 包分析工具
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled',
      openAnalyzer: false
    })
  ]
}
```

### 动态导入

```javascript
// 动态导入实现
class DynamicImporter {
  constructor() {
    this.cache = new Map()
    this.loading = new Map()
  }

  // 基础动态导入
  async import(modulePath) {
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath)
    }

    if (this.loading.has(modulePath)) {
      return this.loading.get(modulePath)
    }

    const promise = import(modulePath)
      .then(module => {
        this.cache.set(modulePath, module)
        this.loading.delete(modulePath)
        return module
      })
      .catch(error => {
        this.loading.delete(modulePath)
        throw error
      })

    this.loading.set(modulePath, promise)
    return promise
  }

  // 预加载
  preload(modulePath) {
    if (!this.cache.has(modulePath) && !this.loading.has(modulePath)) {
      // 使用 webpackPreload 魔法注释
      import(/* webpackPreload: true */ modulePath)
        .then(module => {
          this.cache.set(modulePath, module)
        })
        .catch(error => {
          console.warn('Preload failed:', modulePath, error)
        })
    }
  }

  // 预获取
  prefetch(modulePath) {
    if (!this.cache.has(modulePath) && !this.loading.has(modulePath)) {
      // 使用 webpackPrefetch 魔法注释
      import(/* webpackPrefetch: true */ modulePath)
        .then(module => {
          this.cache.set(modulePath, module)
        })
        .catch(error => {
          console.warn('Prefetch failed:', modulePath, error)
        })
    }
  }

  // 条件加载
  async conditionalImport(condition, modulePath) {
    if (condition) {
      return await this.import(modulePath)
    }
    return null
  }

  // 批量导入
  async batchImport(modulePaths) {
    const promises = modulePaths.map(path => this.import(path))
    return await Promise.all(promises)
  }

  // 重试机制
  async importWithRetry(modulePath, maxRetries = 3, delay = 1000) {
    let lastError

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await this.import(modulePath)
      } catch (error) {
        lastError = error

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }

    throw lastError
  }

  // 清理缓存
  clearCache(modulePath) {
    if (modulePath) {
      this.cache.delete(modulePath)
    } else {
      this.cache.clear()
    }
  }

  // 获取缓存状态
  getCacheInfo() {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loading.keys()),
      cacheSize: this.cache.size
    }
  }
}

// 使用示例
const importer = new DynamicImporter()

// 基础使用
async function loadComponent() {
  try {
    const module = await importer.import('./components/HeavyComponent')
    return module.default
  } catch (error) {
    console.error('Failed to load component:', error)
    return null
  }
}

// 路由级代码分割
const routes = [
  {
    path: '/home',
    component: () => importer.import('./pages/Home')
  },
  {
    path: '/dashboard',
    component: () => importer.import('./pages/Dashboard')
  },
  {
    path: '/profile',
    component: () => importer.import('./pages/Profile')
  }
]

// 功能模块分割
class FeatureLoader {
  static async loadChart() {
    const [chartModule, dataModule] = await importer.batchImport([
      /* webpackChunkName: "chart" */ './features/chart',
      /* webpackChunkName: "chart-data" */ './features/chart/data'
    ])

    return {
      Chart: chartModule.default,
      ChartData: dataModule.default
    }
  }

  static async loadEditor() {
    return await importer.importWithRetry(
      /* webpackChunkName: "editor" */ './features/editor'
    )
  }

  static async loadAnalytics() {
    // 条件加载
    const hasPermission = await checkAnalyticsPermission()

    if (hasPermission) {
      return await importer.import(
        /* webpackChunkName: "analytics" */ './features/analytics'
      )
    }

    return null
  }
}
```

### Webpack 魔法注释

```javascript
// Webpack 魔法注释详解
class WebpackMagicComments {
  // 1. webpackChunkName - 指定 chunk 名称
  async loadNamedChunk() {
    const module = await import(
      /* webpackChunkName: "my-chunk-name" */ './module'
    )
    return module
  }

  // 2. webpackMode - 指定导入模式
  async loadWithMode() {
    // lazy: 默认模式，生成可延迟加载的 chunk
    const lazyModule = await import(
      /* webpackMode: "lazy" */ './lazy-module'
    )

    // eager: 不生成额外的 chunk，直接打包到当前 chunk
    const eagerModule = await import(
      /* webpackMode: "eager" */ './eager-module'
    )

    // weak: 如果模块已经加载则使用，否则失败
    const weakModule = await import(
      /* webpackMode: "weak" */ './weak-module'
    )

    return { lazyModule, eagerModule, weakModule }
  }

  // 3. webpackPrefetch - 预获取
  async setupPrefetch() {
    // 在浏览器空闲时预获取
    import(
      /* webpackPrefetch: true */
      /* webpackChunkName: "prefetch-module" */
      './prefetch-module'
    )
  }

  // 4. webpackPreload - 预加载
  async setupPreload() {
    // 与父 chunk 并行加载
    import(
      /* webpackPreload: true */
      /* webpackChunkName: "preload-module" */
      './preload-module'
    )
  }

  // 5. webpackIgnore - 忽略动态导入
  async loadIgnored() {
    const module = await import(
      /* webpackIgnore: true */ './ignored-module'
    )
    return module
  }

  // 6. webpackInclude/webpackExclude - 包含/排除文件
  async loadWithFilter(moduleName) {
    const module = await import(
      /* webpackInclude: /\.json$/ */
      /* webpackExclude: /\.noimport\.json$/ */
      `./data/${moduleName}.json`
    )
    return module
  }

  // 7. 组合使用
  async loadOptimized() {
    const module = await import(
      /* webpackChunkName: "optimized-chunk" */
      /* webpackMode: "lazy" */
      /* webpackPrefetch: true */
      './optimized-module'
    )
    return module
  }
}

// 动态导入模式示例
class DynamicModuleLoader {
  constructor() {
    this.moduleCache = new Map()
  }

  // 动态模块名导入
  async loadByName(moduleName) {
    try {
      const module = await import(
        /* webpackChunkName: "dynamic-[request]" */
        /* webpackMode: "lazy" */
        `./modules/${moduleName}`
      )
      return module.default
    } catch (error) {
      console.error(`Failed to load module: ${moduleName}`, error)
      return null
    }
  }

  // 条件动态导入
  async loadConditional(condition, truePath, falsePath) {
    const modulePath = condition ? truePath : falsePath

    return await import(
      /* webpackChunkName: "conditional-[request]" */
      modulePath
    )
  }

  // 批量动态导入
  async loadBatch(moduleNames) {
    const promises = moduleNames.map(name =>
      import(
        /* webpackChunkName: "batch-[request]" */
        `./modules/${name}`
      ).catch(error => {
        console.error(`Failed to load ${name}:`, error)
        return null
      })
    )

    return await Promise.all(promises)
  }
}
```

## React 代码分割
### React.lazy 和 Suspense

```jsx
// React 代码分割实现
import React, { Suspense, lazy, useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

// 懒加载组件
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))

// 带错误处理的懒加载
const LazyChart = lazy(() =>
  import('./components/Chart')
    .catch(error => {
      console.error('Failed to load Chart component:', error)
      // 返回错误组件
      return { default: () => <div>Failed to load chart</div> }
    })
)

// 条件懒加载
const ConditionalComponent = lazy(() => {
  const userRole = getUserRole()

  if (userRole === 'admin') {
    return import('./components/AdminPanel')
  } else if (userRole === 'user') {
    return import('./components/UserPanel')
  } else {
    return import('./components/GuestPanel')
  }
})

// 高阶组件：懒加载包装器
function withLazyLoading(importFunc, fallback = <LoadingSpinner />) {
  const LazyComponent = lazy(importFunc)

  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    )
  }
}

// 使用高阶组件
const LazyDashboard = withLazyLoading(
  () => import('./pages/Dashboard'),
  <div>Loading Dashboard...</div>
)

// 预加载 Hook
function usePreloadComponent(importFunc) {
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      importFunc()
    }, 2000) // 2秒后预加载

    return () => clearTimeout(preloadTimer)
  }, [])
}

// 智能预加载组件
function SmartPreloader({ children }) {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    // 检测浏览器空闲状态
    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        setIsIdle(true)
      })

      return () => window.cancelIdleCallback(idleCallback)
    } else {
      // 降级方案
      const timer = setTimeout(() => setIsIdle(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (isIdle) {
      // 预加载非关键组件
      import('./components/NonCriticalComponent')
      import('./pages/SecondaryPage')
    }
  }, [isIdle])

  return children
}

// 路由级代码分割
function App() {
  // 预加载常用页面
  usePreloadComponent(() => import('./pages/Dashboard'))

  return (
    <Router>
      <SmartPreloader>
        <div className="app">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/settings">Settings</Link>
          </nav>

          <main>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </SmartPreloader>
    </Router>
  )
}

// 组件级代码分割
function DashboardPage() {
  const [showChart, setShowChart] = useState(false)
  const [showTable, setShowTable] = useState(false)

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="controls">
        <button onClick={() => setShowChart(!showChart)}>
          {showChart ? 'Hide' : 'Show'} Chart
        </button>
        <button onClick={() => setShowTable(!showTable)}>
          {showTable ? 'Hide' : 'Show'} Table
        </button>
      </div>

      {showChart && (
        <ErrorBoundary>
          <Suspense fallback={<div>Loading chart...</div>}>
            <LazyChart />
          </Suspense>
        </ErrorBoundary>
      )}

      {showTable && (
        <ErrorBoundary>
          <Suspense fallback={<div>Loading table...</div>}>
            <LazyTable />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy loading error:', error, errorInfo)

    // 发送错误报告
    this.reportError(error, errorInfo)
  }

  reportError(error, errorInfo) {
    // 发送到错误监控服务
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>Failed to load component. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// 加载状态组件
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  )
}

// 渐进式加载组件
function ProgressiveLoader({ children, fallback, delay = 200 }) {
  const [showFallback, setShowFallback] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [])

  if (showFallback) {
    return fallback
  }

  return children
}
```

### React 路由代码分割

```jsx
// 高级路由代码分割
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoadingPage from './components/LoadingPage'
import ErrorBoundary from './components/ErrorBoundary'

// 路由配置
const routeConfig = [
  {
    path: '/',
    component: lazy(() => import('./pages/Home')),
    exact: true,
    public: true
  },
  {
    path: '/login',
    component: lazy(() => import('./pages/Login')),
    public: true
  },
  {
    path: '/dashboard',
    component: lazy(() => import('./pages/Dashboard')),
    private: true,
    preload: true
  },
  {
    path: '/profile',
    component: lazy(() => import('./pages/Profile')),
    private: true
  },
  {
    path: '/admin',
    component: lazy(() => import('./pages/Admin')),
    private: true,
    roles: ['admin']
  },
  {
    path: '/analytics',
    component: lazy(() =>
      import('./pages/Analytics').catch(() =>
        import('./pages/AnalyticsLite') // 降级组件
      )
    ),
    private: true,
    roles: ['admin', 'analyst']
  }
]

// 路由守卫组件
function ProtectedRoute({ children, isPrivate, requiredRoles = [] }) {
  const { user, isAuthenticated, hasRole } = useAuth()

  if (isPrivate && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// 智能路由组件
function SmartRoute({ route }) {
  const { component: Component, preload, ...routeProps } = route

  // 预加载逻辑
  React.useEffect(() => {
    if (preload) {
      // 在组件挂载后预加载
      const timer = setTimeout(() => {
        Component._payload._result || Component()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [Component, preload])

  return (
    <Route
      {...routeProps}
      element={
        <ProtectedRoute
          isPrivate={route.private}
          requiredRoles={route.roles}
        >
          <ErrorBoundary>
            <Suspense fallback={<LoadingPage />}>
              <Component />
            </Suspense>
          </ErrorBoundary>
        </ProtectedRoute>
      }
    />
  )
}

// 路由管理器
function RouteManager() {
  const { isAuthenticated } = useAuth()

  // 根据认证状态预加载路由
  React.useEffect(() => {
    if (isAuthenticated) {
      // 预加载私有路由
      import('./pages/Dashboard')
      import('./pages/Profile')
    }
  }, [isAuthenticated])

  return (
    <Routes>
      {routeConfig.map((route, index) => (
        <SmartRoute key={index} route={route} />
      ))}

      {/* 404 页面 */}
      <Route
        path="*"
        element={
          <Suspense fallback={<LoadingPage />}>
            <lazy(() => import('./pages/NotFound')) />
          </Suspense>
        }
      />
    </Routes>
  )
}

// 路由预加载 Hook
function useRoutePreloader() {
  const [preloadedRoutes, setPreloadedRoutes] = React.useState(new Set())

  const preloadRoute = React.useCallback((routePath) => {
    if (preloadedRoutes.has(routePath)) {
      return
    }

    const route = routeConfig.find(r => r.path === routePath)

    if (route) {
      route.component()
      setPreloadedRoutes(prev => new Set([...prev, routePath]))
    }
  }, [preloadedRoutes])

  const preloadRoutes = React.useCallback((routePaths) => {
    routePaths.forEach(preloadRoute)
  }, [preloadRoute])

  return { preloadRoute, preloadRoutes, preloadedRoutes }
}

// 使用示例
function Navigation() {
  const { preloadRoute } = useRoutePreloader()

  return (
    <nav>
      <Link
        to="/dashboard"
        onMouseEnter={() => preloadRoute('/dashboard')}
      >
        Dashboard
      </Link>
      <Link
        to="/profile"
        onMouseEnter={() => preloadRoute('/profile')}
      >
        Profile
      </Link>
    </nav>
  )
}
```

## Vue 代码分割
### Vue 3 异步组件

```vue
<!-- Vue 3 代码分割实现 -->
<template>
  <div class="app">
    <nav>
      <router-link to="/">Home</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/profile">Profile</router-link>
    </nav>

    <main>
      <router-view v-slot="{ Component }">
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <LoadingSpinner />
          </template>
        </Suspense>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { defineAsyncComponent, Suspense } from 'vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

// 异步组件定义
const AsyncChart = defineAsyncComponent({
  loader: () => import('./components/Chart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: () => import('./components/ErrorComponent.vue'),
  delay: 200,
  timeout: 3000,
  suspensible: false
})

// 带重试的异步组件
const AsyncTableWithRetry = defineAsyncComponent({
  loader: () => {
    let retries = 0
    const maxRetries = 3

    const loadComponent = async () => {
      try {
        return await import('./components/DataTable.vue')
      } catch (error) {
        if (retries < maxRetries) {
          retries++
          console.log(`Retrying component load (${retries}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * retries))
          return loadComponent()
        }
        throw error
      }
    }

    return loadComponent()
  },
  loadingComponent: LoadingSpinner,
  errorComponent: () => import('./components/ErrorComponent.vue')
})

// 条件异步组件
const ConditionalComponent = defineAsyncComponent(() => {
  const userRole = getUserRole()

  switch (userRole) {
    case 'admin':
      return import('./components/AdminPanel.vue')
    case 'user':
      return import('./components/UserPanel.vue')
    default:
      return import('./components/GuestPanel.vue')
  }
})
</script>
```

```javascript
// Vue Router 代码分割
import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'

// 路由级代码分割
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */
      './views/Dashboard.vue'
    ),
    meta: { preload: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import(
      /* webpackChunkName: "profile" */
      './views/Profile.vue'
    )
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(
      /* webpackChunkName: "admin" */
      './views/Admin.vue'
    ),
    meta: {
      requiresAuth: true,
      roles: ['admin']
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由预加载
router.beforeEach((to, from, next) => {
  // 预加载下一个可能的路由
  if (to.meta.preload) {
    const nextRoutes = getNextPossibleRoutes(to.name)
    nextRoutes.forEach(route => {
      route.component()
    })
  }

  next()
})

// Vue 组合式 API 代码分割
import { ref, defineAsyncComponent, onMounted } from 'vue'

export default {
  setup() {
    const showChart = ref(false)
    const showTable = ref(false)

    // 懒加载组件
    const LazyChart = defineAsyncComponent(() =>
      import('./components/Chart.vue')
    )

    const LazyTable = defineAsyncComponent(() =>
      import('./components/DataTable.vue')
    )

    // 预加载逻辑
    onMounted(() => {
      // 延迟预加载非关键组件
      setTimeout(() => {
        import('./components/NonCriticalComponent.vue')
      }, 2000)
    })

    return {
      showChart,
      showTable,
      LazyChart,
      LazyTable
    }
  }
}

// Vue 3 Composition API 预加载 Hook
import { ref, onMounted, onUnmounted } from 'vue'

export function useComponentPreloader() {
  const preloadedComponents = ref(new Set())
  const preloadQueue = ref([])

  const preloadComponent = (importFunc, priority = 1) => {
    if (preloadedComponents.value.has(importFunc)) {
      return
    }

    preloadQueue.value.push({ importFunc, priority })
    preloadQueue.value.sort((a, b) => b.priority - a.priority)
  }

  const processPreloadQueue = async () => {
    while (preloadQueue.value.length > 0) {
      const { importFunc } = preloadQueue.value.shift()

      try {
        await importFunc()
        preloadedComponents.value.add(importFunc)
      } catch (error) {
        console.warn('Component preload failed:', error)
      }

      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  onMounted(() => {
    // 在空闲时处理预加载队列
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(processPreloadQueue)
    } else {
      setTimeout(processPreloadQueue, 1000)
    }
  })

  return {
    preloadComponent,
    preloadedComponents: preloadedComponents.value
  }
}
```

## 现代构建工具代码分割
### Vite 代码分割

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      },
      output: {
        // 手动分割 chunks
        manualChunks: {
          // 将 React 相关库打包到一个 chunk
          'react-vendor': ['react', 'react-dom'],
          // 将 UI 库打包到一个 chunk
          'ui-vendor': ['antd', '@ant-design/icons'],
          // 将工具库打包到一个 chunk
          'utils-vendor': ['lodash-es', 'dayjs', 'axios']
        },
        // 或者使用函数形式进行更精细的控制
        manualChunks(id) {
          // 将 node_modules 中的包分离
          if (id.includes('node_modules')) {
            // React 生态
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // UI 组件库
            if (id.includes('antd') || id.includes('@ant-design')) {
              return 'ui-vendor'
            }
            // 图表库
            if (id.includes('echarts') || id.includes('chart.js')) {
              return 'chart-vendor'
            }
            // 其他第三方库
            return 'vendor'
          }
          
          // 将特定目录的文件分离
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
          
          if (id.includes('/src/components/')) {
            return 'components'
          }
        }
      }
    },
    
    // 代码分割阈值
    chunkSizeWarningLimit: 1000,
    
    // 启用 CSS 代码分割
    cssCodeSplit: true
  },
  
  // 预构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
    exclude: ['@vite/client', '@vite/env']
  }
})

// 动态导入示例
class ViteDynamicImporter {
  constructor() {
    this.moduleCache = new Map()
  }

  // Vite 支持的动态导入
  async importModule(modulePath) {
    if (this.moduleCache.has(modulePath)) {
      return this.moduleCache.get(modulePath)
    }

    try {
      const module = await import(/* @vite-ignore */ modulePath)
      this.moduleCache.set(modulePath, module)
      return module
    } catch (error) {
      console.error(`Failed to import module: ${modulePath}`, error)
      throw error
    }
  }

  // 预加载模块
  preloadModule(modulePath) {
    // Vite 会自动处理预加载
    import(modulePath).catch(error => {
      console.warn(`Preload failed: ${modulePath}`, error)
    })
  }

  // 条件导入
  async conditionalImport(condition, modulePath) {
    if (condition) {
      return await this.importModule(modulePath)
    }
    return null
  }
}

// 使用示例
const importer = new ViteDynamicImporter()

// 路由级代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => importer.importModule('./pages/Dashboard.vue')
  },
  {
    path: '/profile',
    component: () => importer.importModule('./pages/Profile.vue')
  }
]
```

### Rollup 代码分割

```javascript
// rollup.config.js
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import analyze from 'rollup-plugin-analyzer'

export default defineConfig({
  input: {
    main: 'src/main.js',
    admin: 'src/admin.js'
  },
  
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: '[name].[hash].js',
    chunkFileNames: '[name].[hash].chunk.js',
    
    // 手动分割
    manualChunks: {
      'vendor': ['react', 'react-dom'],
      'ui': ['antd'],
      'utils': ['lodash-es', 'dayjs']
    }
  },
  
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }),
    analyze({
      summaryOnly: true,
      limit: 10
    })
  ],
  
  // 外部依赖
  external: ['react', 'react-dom'],
  
  // 代码分割优化
  experimentalCodeSplitting: true
})

// Rollup 动态导入工具
class RollupChunkLoader {
  constructor() {
    this.loadedChunks = new Set()
    this.loadingPromises = new Map()
  }

  async loadChunk(chunkName) {
    if (this.loadedChunks.has(chunkName)) {
      return
    }

    if (this.loadingPromises.has(chunkName)) {
      return this.loadingPromises.get(chunkName)
    }

    const loadPromise = this.doLoadChunk(chunkName)
    this.loadingPromises.set(chunkName, loadPromise)

    try {
      await loadPromise
      this.loadedChunks.add(chunkName)
    } finally {
      this.loadingPromises.delete(chunkName)
    }
  }

  async doLoadChunk(chunkName) {
    const script = document.createElement('script')
    script.src = `/dist/${chunkName}.chunk.js`
    script.type = 'module'

    return new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  preloadChunks(chunkNames) {
    chunkNames.forEach(chunkName => {
      const link = document.createElement('link')
      link.rel = 'modulepreload'
      link.href = `/dist/${chunkName}.chunk.js`
      document.head.appendChild(link)
    })
  }
}
```

### Parcel 代码分割

```javascript
// Parcel 自动代码分割
// .parcelrc
{
  "extends": "@parcel/config-default",
  "optimizers": {
    "*.js": ["@parcel/optimizer-terser"]
  },
  "bundler": "@parcel/bundler-default"
}

// package.json
{
  "scripts": {
    "build": "parcel build src/index.html --dist-dir dist",
    "dev": "parcel src/index.html --dist-dir dev"
  },
  "targets": {
    "default": {
      "distDir": "dist",
      "optimize": true
    }
  }
}

// Parcel 动态导入
class ParcelDynamicLoader {
  constructor() {
    this.cache = new Map()
  }

  // Parcel 支持的动态导入语法
  async loadModule(modulePath) {
    if (this.cache.has(modulePath)) {
      return this.cache.get(modulePath)
    }

    try {
      // Parcel 会自动处理代码分割
      const module = await import(modulePath)
      this.cache.set(modulePath, module)
      return module
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error)
      throw error
    }
  }

  // 预加载资源
  preloadAsset(assetPath) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = assetPath
    link.as = 'script'
    document.head.appendChild(link)
  }

  // 批量预加载
  preloadModules(modulePaths) {
    modulePaths.forEach(path => {
      import(path).catch(error => {
        console.warn(`Preload failed: ${path}`, error)
      })
    })
  }
}

// 使用示例
const loader = new ParcelDynamicLoader()

// 条件加载
async function loadFeature(featureName) {
  switch (featureName) {
    case 'chart':
      return await loader.loadModule('./features/chart')
    case 'editor':
      return await loader.loadModule('./features/editor')
    case 'analytics':
      return await loader.loadModule('./features/analytics')
    default:
      throw new Error(`Unknown feature: ${featureName}`)
  }
}
```

## 第三方库分割
### Vendor 分离策略

```javascript
// vendor 分离配置
const path = require('path')

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 基础框架库
        framework: {
          test: /[\\\/]node_modules[\\\/](react|react-dom|vue|@vue)[\\\/]/,
          name: 'framework',
          priority: 40,
          chunks: 'all',
          enforce: true
        },

        // UI 组件库
        ui: {
          test: /[\\\/]node_modules[\\\/](antd|@ant-design|element-ui|element-plus|vuetify)[\\\/]/,
          name: 'ui',
          priority: 30,
          chunks: 'all',
          enforce: true
        },

        // 图表库
        charts: {
          test: /[\\\/]node_modules[\\\/](echarts|chart\.js|d3|@nivo)[\\\/]/,
          name: 'charts',
          priority: 25,
          chunks: 'all',
          enforce: true
        },

        // 工具库
        utils: {
          test: /[\\\/]node_modules[\\\/](lodash|moment|dayjs|date-fns|ramda)[\\\/]/,
          name: 'utils',
          priority: 20,
          chunks: 'all',
          enforce: true
        },

        // HTTP 库
        http: {
          test: /[\\\/]node_modules[\\\/](axios|fetch|superagent)[\\\/]/,
          name: 'http',
          priority: 18,
          chunks: 'all',
          enforce: true
        },

        // 状态管理
        state: {
          test: /[\\\/]node_modules[\\\/](redux|@reduxjs|vuex|pinia|mobx)[\\\/]/,
          name: 'state',
          priority: 15,
          chunks: 'all',
          enforce: true
        },

        // 其他第三方库
        vendor: {
          test: /[\\\/]node_modules[\\\/]/,
          name: 'vendor',
          priority: 10,
          chunks: 'all',
          enforce: true,
          minSize: 30000
        },

        // 公共代码
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
}

// 动态 vendor 分割
class DynamicVendorSplitter {
  constructor() {
    this.vendorGroups = new Map()
    this.loadedVendors = new Set()
  }

  // 注册 vendor 组
  registerVendorGroup(name, packages, priority = 10) {
    this.vendorGroups.set(name, {
      packages,
      priority,
      loaded: false
    })
  }

  // 动态加载 vendor
  async loadVendor(vendorName) {
    if (this.loadedVendors.has(vendorName)) {
      return
    }

    const vendorGroup = this.vendorGroups.get(vendorName)

    if (!vendorGroup) {
      throw new Error(`Vendor group '${vendorName}' not found`)
    }

    try {
      // 动态导入 vendor 包
      const modules = await Promise.all(
        vendorGroup.packages.map(pkg =>
          import(/* webpackChunkName: "vendor-[request]" */ pkg)
        )
      )

      this.loadedVendors.add(vendorName)
      vendorGroup.loaded = true

      return modules
    } catch (error) {
      console.error(`Failed to load vendor '${vendorName}':`, error)
      throw error
    }
  }

  // 预加载关键 vendor
  async preloadCriticalVendors() {
    const criticalVendors = Array.from(this.vendorGroups.entries())
      .filter(([, group]) => group.priority >= 20)
      .sort((a, b) => b[1].priority - a[1].priority)

    for (const [name] of criticalVendors) {
      try {
        await this.loadVendor(name)
      } catch (error) {
        console.warn(`Failed to preload critical vendor '${name}':`, error)
      }
    }
  }

  // 获取加载状态
  getLoadStatus() {
    const status = {}

    for (const [name, group] of this.vendorGroups) {
      status[name] = {
        loaded: group.loaded,
        priority: group.priority,
        packages: group.packages
      }
    }

    return status
  }
}

// 使用示例
const vendorSplitter = new DynamicVendorSplitter()

// 注册 vendor 组
vendorSplitter.registerVendorGroup('charts', [
  'echarts',
  'chart.js',
  'd3'
], 25)

vendorSplitter.registerVendorGroup('ui', [
  'antd',
  '@ant-design/icons'
], 30)

vendorSplitter.registerVendorGroup('utils', [
  'lodash',
  'moment',
  'axios'
], 20)

// 条件加载 vendor
async function loadChartingCapability() {
  try {
    const chartModules = await vendorSplitter.loadVendor('charts')
    console.log('Charting libraries loaded:', chartModules)
  } catch (error) {
    console.error('Failed to load charting capability:', error)
  }
}

// 应用启动时预加载关键 vendor
vendorSplitter.preloadCriticalVendors()
```

### Tree Shaking 优化

```javascript
// Tree Shaking 配置
module.exports = {
  mode: 'production',

  optimization: {
    usedExports: true,
    sideEffects: false, // 或者指定具体文件

    // 自定义 Tree Shaking
    innerGraph: true,
    providedExports: true,

    // Terser 配置
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info'],
            unused: true,
            dead_code: true
          },
          mangle: {
            safari10: true
          }
        }
      })
    ]
  },

  // 模块解析配置
  resolve: {
    mainFields: ['es2015', 'module', 'main'],
    alias: {
      // 使用 ES 模块版本
      'lodash': 'lodash-es',
      'moment': 'dayjs'
    }
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                modules: false, // 保持 ES 模块
                useBuiltIns: 'usage',
                corejs: 3
              }]
            ]
          }
        }
      }
    ]
  }
}

// 按需导入工具
class SelectiveImporter {
  constructor() {
    this.importMap = new Map()
  }

  // 注册按需导入配置
  register(libraryName, config) {
    this.importMap.set(libraryName, config)
  }

  // 生成按需导入代码
  generateImport(libraryName, methods) {
    const config = this.importMap.get(libraryName)

    if (!config) {
      throw new Error(`Library '${libraryName}' not configured`)
    }

    const imports = methods.map(method => {
      if (config.type === 'named') {
        return `import { ${method} } from '${libraryName}'`
      } else if (config.type === 'default') {
        return `import ${method} from '${libraryName}/${config.path || ''}${method}'`
      }
    })

    return imports.join('\n')
  }
}

// 配置常用库的按需导入
const importer = new SelectiveImporter()

importer.register('lodash', {
  type: 'default',
  path: ''
})

importer.register('antd', {
  type: 'named',
  styleImport: true
})

// 使用示例
console.log(importer.generateImport('lodash', ['debounce', 'throttle']))
// 输出:
// import debounce from 'lodash/debounce'
// import throttle from 'lodash/throttle'

// Babel 插件：自动按需导入
function babelPluginImportOnDemand() {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value

        // 转换 lodash 导入
        if (source === 'lodash') {
          const specifiers = path.node.specifiers

          const newImports = specifiers.map(spec => {
            if (spec.type === 'ImportSpecifier') {
              return `import ${spec.local.name} from 'lodash/${spec.imported.name}'`
            }
          })

          // 替换原导入
          path.replaceWithMultiple(
            newImports.map(imp =>
              require('@babel/parser').parse(imp, { sourceType: 'module' }).body[0]
            )
          )
        }
      }
    }
  }
}
```

## 性能监控
### 分割效果分析

```javascript
// 代码分割性能监控
class CodeSplittingAnalyzer {
  constructor() {
    this.metrics = {
      chunks: new Map(),
      loadTimes: new Map(),
      errors: new Map(),
      cacheHits: new Map()
    }

    this.observer = null
    this.setupPerformanceObserver()
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource' && entry.name.includes('.chunk.js')) {
            this.recordChunkLoad(entry)
          }
        }
      })

      this.observer.observe({ entryTypes: ['resource'] })
    }
  }

  recordChunkLoad(entry) {
    const chunkName = this.extractChunkName(entry.name)
    const loadTime = entry.responseEnd - entry.startTime
    const fromCache = entry.transferSize === 0

    // 记录加载时间
    if (!this.metrics.loadTimes.has(chunkName)) {
      this.metrics.loadTimes.set(chunkName, [])
    }
    this.metrics.loadTimes.get(chunkName).push(loadTime)

    // 记录缓存命中
    if (!this.metrics.cacheHits.has(chunkName)) {
      this.metrics.cacheHits.set(chunkName, { hits: 0, total: 0 })
    }

    const cacheStats = this.metrics.cacheHits.get(chunkName)
    cacheStats.total++
    if (fromCache) {
      cacheStats.hits++
    }

    // 记录 chunk 信息
    this.metrics.chunks.set(chunkName, {
      size: entry.transferSize,
      loadTime,
      fromCache,
      timestamp: Date.now()
    })
  }

  recordChunkError(chunkName, error) {
    if (!this.metrics.errors.has(chunkName)) {
      this.metrics.errors.set(chunkName, []
    }

    this.metrics.errors.get(chunkName).push({
      error: error.message,
      timestamp: Date.now()
    })
  }

  extractChunkName(url) {
    const match = url.match(/([^/]+)\.chunk\.js$/)
    return match ? match[1] : 'unknown'
  }

  getAnalytics() {
    const analytics = {
      totalChunks: this.metrics.chunks.size,
      averageLoadTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      chunkDetails: []
    }

    let totalLoadTime = 0
    let totalRequests = 0
    let totalCacheHits = 0
    let totalErrors = 0

    for (const [chunkName, loadTimes] of this.metrics.loadTimes) {
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length
      const cacheStats = this.metrics.cacheHits.get(chunkName) || { hits: 0, total: 0 }
      const errors = this.metrics.errors.get(chunkName) || []

      analytics.chunkDetails.push({
        name: chunkName,
        averageLoadTime: avgLoadTime,
        requests: loadTimes.length,
        cacheHitRate: cacheStats.total > 0 ? (cacheStats.hits / cacheStats.total * 100) : 0,
        errors: errors.length
      })

      totalLoadTime += avgLoadTime * loadTimes.length
      totalRequests += loadTimes.length
      totalCacheHits += cacheStats.hits
      totalErrors += errors.length
    }

    analytics.averageLoadTime = totalRequests > 0 ? totalLoadTime / totalRequests : 0
    analytics.cacheHitRate = totalRequests > 0 ? (totalCacheHits / totalRequests * 100) : 0
    analytics.errorRate = totalRequests > 0 ? (totalErrors / totalRequests * 100) : 0

    return analytics
  }

  generateReport() {
    const analytics = this.getAnalytics()

    return {
      summary: {
        totalChunks: analytics.totalChunks,
        averageLoadTime: `${analytics.averageLoadTime.toFixed(2)}ms`,
        cacheHitRate: `${analytics.cacheHitRate.toFixed(2)}%`,
        errorRate: `${analytics.errorRate.toFixed(2)}%`
      },
      recommendations: this.generateRecommendations(analytics),
      chunkDetails: analytics.chunkDetails
    }
  }

  generateRecommendations(analytics) {
    const recommendations = []

    if (analytics.averageLoadTime > 1000) {
      recommendations.push('Consider further splitting large chunks')
    }

    if (analytics.cacheHitRate < 50) {
      recommendations.push('Improve caching strategy for better performance')
    }

    if (analytics.errorRate > 5) {
      recommendations.push('Investigate and fix chunk loading errors')
    }

    const largeChunks = analytics.chunkDetails.filter(chunk =>
      chunk.averageLoadTime > 2000
    )

    if (largeChunks.length > 0) {
      recommendations.push(`Consider splitting these large chunks: ${largeChunks.map(c => c.name).join(', ')}`)
    }

    return recommendations
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const analyzer = new CodeSplittingAnalyzer()

// 定期生成报告
setInterval(() => {
  const report = analyzer.generateReport()
  console.log('Code Splitting Report:', report)

  // 发送到分析服务
  if (window.analytics) {
    window.analytics.track('code_splitting_metrics', report)
  }
}, 60000) // 每分钟生成一次报告

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  analyzer.cleanup()
})
```

### Bundle 分析工具

```javascript
// Bundle 分析器
class BundleAnalyzer {
  constructor() {
    this.bundleInfo = null
    this.loadBundleInfo()
  }

  async loadBundleInfo() {
    try {
      // 从 webpack-bundle-analyzer 生成的数据加载
      const response = await fetch('/bundle-stats.json')
      this.bundleInfo = await response.json()
    } catch (error) {
      console.warn('Bundle info not available:', error)
    }
  }

  analyzeBundleSize() {
    if (!this.bundleInfo) {
      return null
    }

    const analysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      duplicates: [],
      recommendations: []
    }

    // 分析每个 chunk
    for (const chunk of this.bundleInfo.chunks) {
      analysis.totalSize += chunk.size
      analysis.gzippedSize += chunk.gzippedSize || chunk.size * 0.3

      analysis.chunks.push({
        name: chunk.name,
        size: chunk.size,
        modules: chunk.modules.length,
        isInitial: chunk.initial,
        isAsync: !chunk.initial
      })
    }

    // 检测重复模块
    const moduleMap = new Map()

    for (const chunk of this.bundleInfo.chunks) {
      for (const module of chunk.modules) {
        if (!moduleMap.has(module.name)) {
          moduleMap.set(module.name, [])
        }
        moduleMap.get(module.name).push(chunk.name)
      }
    }

    for (const [moduleName, chunks] of moduleMap) {
      if (chunks.length > 1) {
        analysis.duplicates.push({
          module: moduleName,
          chunks: chunks,
          occurrences: chunks.length
        })
      }
    }

    // 生成建议
    analysis.recommendations = this.generateBundleRecommendations(analysis)

    return analysis
  }

  generateBundleRecommendations(analysis) {
    const recommendations = []

    // 检查大型 chunk
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > 500000) // 500KB
    if (largeChunks.length > 0) {
      recommendations.push({
        type: 'large_chunks',
        message: `Consider splitting these large chunks: ${largeChunks.map(c => c.name).join(', ')}`,
        chunks: largeChunks
      })
    }

    // 检查重复模块
    const significantDuplicates = analysis.duplicates.filter(dup => dup.occurrences > 2)
    if (significantDuplicates.length > 0) {
      recommendations.push({
        type: 'duplicate_modules',
        message: 'Extract common modules to reduce duplication',
        duplicates: significantDuplicates
      })
    }

    // 检查初始包大小
    const initialChunks = analysis.chunks.filter(chunk => chunk.isInitial)
    const initialSize = initialChunks.reduce((sum, chunk) => sum + chunk.size, 0)

    if (initialSize > 1000000) { // 1MB
      recommendations.push({
        type: 'large_initial_bundle',
        message: 'Initial bundle size is too large, consider lazy loading more components',
        size: initialSize
      })
    }

    return recommendations
  }

  generateOptimizationPlan() {
    const analysis = this.analyzeBundleSize()

    if (!analysis) {
      return null
    }

    const plan = {
      priority: 'high',
      actions: [],
      expectedSavings: 0
    }

    // 基于分析结果生成优化计划
    for (const recommendation of analysis.recommendations) {
      switch (recommendation.type) {
        case 'large_chunks':
          plan.actions.push({
            action: 'split_chunks',
            description: 'Split large chunks into smaller ones',
            chunks: recommendation.chunks,
            estimatedSaving: recommendation.chunks.reduce((sum, chunk) => sum + chunk.size * 0.3, 0)
          })
          break

        case 'duplicate_modules':
          plan.actions.push({
            action: 'extract_common',
            description: 'Extract common modules to separate chunk',
            modules: recommendation.duplicates,
            estimatedSaving: recommendation.duplicates.length * 50000 // 估算
          })
          break

        case 'large_initial_bundle':
          plan.actions.push({
            action: 'lazy_load',
            description: 'Implement lazy loading for non-critical components',
            currentSize: recommendation.size,
            estimatedSaving: recommendation.size * 0.4
          })
          break
      }
    }

    plan.expectedSavings = plan.actions.reduce((sum, action) => sum + action.estimatedSaving, 0)

    return plan
  }
}

// 使用示例
const bundleAnalyzer = new BundleAnalyzer()

// 分析当前 bundle
setTimeout(async () => {
  const analysis = bundleAnalyzer.analyzeBundleSize()
  const optimizationPlan = bundleAnalyzer.generateOptimizationPlan()

  console.log('Bundle Analysis:', analysis)
  console.log('Optimization Plan:', optimizationPlan)
}, 5000)
```

## 最佳实践
### 分割策略选择

1. **路由级分割**
   - 适用于 SPA 应用
   - 按页面功能分割
   - 提升首屏加载速度

2. **组件级分割**
   - 大型组件独立分割
   - 条件渲染组件
   - 用户交互触发的组件

3. **功能模块分割**
   - 按业务功能分割
   - 权限相关功能
   - 可选功能模块

4. **第三方库分割**
   - 框架库单独分割
   - UI 库独立打包
   - 工具库按需加载

### 性能优化技巧

```javascript
// 性能优化最佳实践
class CodeSplittingOptimizer {
  constructor() {
    this.preloadQueue = []
    this.prefetchQueue = []
    this.loadedChunks = new Set()
  }

  // 智能预加载
  smartPreload(routes, userBehavior) {
    // 基于用户行为预测下一个可能访问的路由
    const predictedRoutes = this.predictNextRoutes(userBehavior)

    predictedRoutes.forEach(route => {
      if (!this.loadedChunks.has(route)) {
        this.preloadQueue.push(route)
      }
    })

    this.processPreloadQueue()
  }

  predictNextRoutes(userBehavior) {
    // 简单的预测算法
    const { currentRoute, visitHistory, timeSpent } = userBehavior

    // 基于访问历史预测
    const frequentRoutes = this.getFrequentRoutes(visitHistory)

    // 基于停留时间预测
    if (timeSpent > 30000) { // 30秒以上
      return frequentRoutes.slice(0, 2)
    }

    return frequentRoutes.slice(0, 1)
  }

  getFrequentRoutes(visitHistory) {
    const routeCount = {}

    visitHistory.forEach(route => {
      routeCount[route] = (routeCount[route] || 0) + 1
    })

    return Object.entries(routeCount)
      .sort(([,a], [,b]) => b - a)
      .map(([route]) => route)
  }

  async processPreloadQueue() {
    while (this.preloadQueue.length > 0) {
      const route = this.preloadQueue.shift()

      try {
        await this.preloadRoute(route)
        this.loadedChunks.add(route)
      } catch (error) {
        console.warn(`Failed to preload route ${route}:`, error)
      }

      // 避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async preloadRoute(route) {
    // 使用 link rel="preload" 预加载
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = this.getChunkUrl(route)

    document.head.appendChild(link)

    return new Promise((resolve, reject) => {
      link.onload = resolve
      link.onerror = reject
    })
  }

  getChunkUrl(route) {
    // 根据路由获取对应的 chunk URL
    const chunkMap = {
      '/dashboard': '/static/js/dashboard.chunk.js',
      '/profile': '/static/js/profile.chunk.js',
      '/settings': '/static/js/settings.chunk.js'
    }

    return chunkMap[route] || ''
  }
}
```

### 错误处理策略

```javascript
// 代码分割错误处理
class ChunkLoadErrorHandler {
  constructor() {
    this.retryCount = new Map()
    this.maxRetries = 3
    this.retryDelay = 1000
  }

  async handleChunkLoadError(chunkName, importFunc) {
    const currentRetries = this.retryCount.get(chunkName) || 0

    if (currentRetries >= this.maxRetries) {
      throw new Error(`Failed to load chunk ${chunkName} after ${this.maxRetries} retries`)
    }

    // 增加重试次数
    this.retryCount.set(chunkName, currentRetries + 1)

    // 延迟重试
    await new Promise(resolve =>
      setTimeout(resolve, this.retryDelay * (currentRetries + 1))
    )

    try {
      const result = await importFunc()
      // 重置重试次数
      this.retryCount.delete(chunkName)
      return result
    } catch (error) {
      return this.handleChunkLoadError(chunkName, importFunc)
    }
  }

  // 降级处理
  async loadWithFallback(primaryImport, fallbackImport) {
    try {
      return await primaryImport()
    } catch (error) {
      console.warn('Primary chunk load failed, using fallback:', error)
      return await fallbackImport()
    }
  }

  // 网络状态检测
  isNetworkSlow() {
    if ('connection' in navigator) {
      const connection = navigator.connection
      return connection.effectiveType === 'slow-2g' ||
             connection.effectiveType === '2g'
    }
    return false
  }

  // 自适应加载策略
  async adaptiveLoad(chunkImports) {
    if (this.isNetworkSlow()) {
      // 网络慢时只加载关键 chunk
      const criticalChunks = chunkImports.filter(chunk => chunk.critical)
      return await Promise.all(criticalChunks.map(chunk => chunk.import()))
    } else {
      // 网络快时加载所有 chunk
      return await Promise.all(chunkImports.map(chunk => chunk.import()))
    }
  }
}

// 使用示例
const errorHandler = new ChunkLoadErrorHandler()

// 带重试的组件加载
const LazyComponentWithRetry = lazy(() =>
  errorHandler.handleChunkLoadError(
    'heavy-component',
    () => import('./components/HeavyComponent')
  )
)

// 带降级的组件加载
const LazyComponentWithFallback = lazy(() =>
  errorHandler.loadWithFallback(
    () => import('./components/AdvancedComponent'),
    () => import('./components/BasicComponent')
  )
)
```

## CSS 代码分割
### CSS-in-JS 代码分割

```javascript
// styled-components 代码分割
import styled, { css } from 'styled-components'
import { lazy, Suspense } from 'react'

// 懒加载样式组件
const LazyStyledComponent = lazy(() =>
  import('./StyledComponents').then(module => ({
    default: module.HeavyStyledComponent
  }))
)

// 条件样式加载
const ConditionalStyles = styled.div`
  ${props => props.theme === 'dark' && css`
    /* 只在需要时加载深色主题样式 */
    background: #333;
    color: #fff;
  `}
  
  ${props => props.variant === 'premium' && css`
    /* 只在高级版本时加载 */
    background: linear-gradient(45deg, #gold, #orange);
  `}
`

// 动态主题加载
class ThemeLoader {
  constructor() {
    this.loadedThemes = new Set()
    this.themeCache = new Map()
  }

  async loadTheme(themeName) {
    if (this.loadedThemes.has(themeName)) {
      return this.themeCache.get(themeName)
    }

    try {
      const themeModule = await import(`./themes/${themeName}.js`)
      const theme = themeModule.default
      
      this.themeCache.set(themeName, theme)
      this.loadedThemes.add(themeName)
      
      return theme
    } catch (error) {
      console.error(`Failed to load theme: ${themeName}`, error)
      // 返回默认主题
      return await this.loadTheme('default')
    }
  }

  async switchTheme(themeName) {
    const theme = await this.loadTheme(themeName)
    
    // 应用主题
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
    document.documentElement.style.setProperty('--background-color', theme.backgroundColor)
    
    return theme
  }
}
```

### CSS 模块代码分割

```javascript
// CSS 模块懒加载
class CSSModuleLoader {
  constructor() {
    this.loadedModules = new Set()
    this.styleElements = new Map()
  }

  async loadCSSModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      return
    }

    try {
      // 动态导入 CSS 模块
      const cssModule = await import(`./styles/${moduleName}.module.css`)
      
      // 创建 style 元素
      const styleElement = document.createElement('style')
      styleElement.textContent = cssModule.default
      styleElement.setAttribute('data-module', moduleName)
      
      document.head.appendChild(styleElement)
      
      this.styleElements.set(moduleName, styleElement)
      this.loadedModules.add(moduleName)
      
      return cssModule
    } catch (error) {
      console.error(`Failed to load CSS module: ${moduleName}`, error)
    }
  }

  unloadCSSModule(moduleName) {
    const styleElement = this.styleElements.get(moduleName)
    
    if (styleElement) {
      document.head.removeChild(styleElement)
      this.styleElements.delete(moduleName)
      this.loadedModules.delete(moduleName)
    }
  }

  // 条件加载样式
  async loadConditionalStyles(condition, moduleName) {
    if (condition) {
      await this.loadCSSModule(moduleName)
    } else {
      this.unloadCSSModule(moduleName)
    }
  }
}

// 使用示例
const cssLoader = new CSSModuleLoader()

// 根据设备类型加载不同样式
const isMobile = window.innerWidth < 768
if (isMobile) {
  cssLoader.loadCSSModule('mobile')
} else {
  cssLoader.loadCSSModule('desktop')
}

// 根据功能加载样式
async function enableDarkMode() {
  await cssLoader.loadCSSModule('dark-theme')
  document.body.classList.add('dark-mode')
}

async function enableAnimations() {
  await cssLoader.loadCSSModule('animations')
  document.body.classList.add('animations-enabled')
}
```

## 微前端代码分割
### Module Federation

```javascript
// webpack.config.js - 主应用
const ModuleFederationPlugin = require('@module-federation/webpack')

module.exports = {
  mode: 'development',
  devServer: {
    port: 3000
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // 远程微前端应用
        dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
        profile: 'profile@http://localhost:3002/remoteEntry.js',
        analytics: 'analytics@http://localhost:3003/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
}

// 微前端动态加载器
class MicrofrontendLoader {
  constructor() {
    this.loadedApps = new Map()
    this.loadingPromises = new Map()
  }

  async loadMicrofrontend(appName, remoteName) {
    if (this.loadedApps.has(appName)) {
      return this.loadedApps.get(appName)
    }

    if (this.loadingPromises.has(appName)) {
      return this.loadingPromises.get(appName)
    }

    const loadPromise = this.doLoadMicrofrontend(appName, remoteName)
    this.loadingPromises.set(appName, loadPromise)

    try {
      const app = await loadPromise
      this.loadedApps.set(appName, app)
      return app
    } finally {
      this.loadingPromises.delete(appName)
    }
  }

  async doLoadMicrofrontend(appName, remoteName) {
    try {
      // 动态导入远程模块
      const container = await import(remoteName)
      await container.init(__webpack_share_scopes__.default)
      
      const factory = await container.get('./App')
      const Module = factory()
      
      return Module.default || Module
    } catch (error) {
      console.error(`Failed to load microfrontend: ${appName}`, error)
      
      // 返回错误组件
      return () => React.createElement('div', null, `Failed to load ${appName}`)
    }
  }

  // 预加载微前端
  preloadMicrofrontends(apps) {
    apps.forEach(({ appName, remoteName }) => {
      this.loadMicrofrontend(appName, remoteName).catch(error => {
        console.warn(`Preload failed for ${appName}:`, error)
      })
    })
  }

  // 卸载微前端
  unloadMicrofrontend(appName) {
    this.loadedApps.delete(appName)
    
    // 清理相关资源
    const scripts = document.querySelectorAll(`script[src*="${appName}"]`)
    scripts.forEach(script => script.remove())
  }
}

// React 组件中使用
import React, { Suspense, lazy } from 'react'

const microfrontendLoader = new MicrofrontendLoader()

// 懒加载微前端组件
const DashboardApp = lazy(() =>
  microfrontendLoader.loadMicrofrontend('dashboard', 'dashboard/App')
)

const ProfileApp = lazy(() =>
  microfrontendLoader.loadMicrofrontend('profile', 'profile/App')
)

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <Suspense fallback={<div>Loading Dashboard...</div>}>
              <DashboardApp />
            </Suspense>
          }
        />
        <Route
          path="/profile/*"
          element={
            <Suspense fallback={<div>Loading Profile...</div>}>
              <ProfileApp />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  )
}
```

### Single-SPA 代码分割

```javascript
// single-spa 配置
import { registerApplication, start } from 'single-spa'

// 动态注册微前端应用
class SingleSPALoader {
  constructor() {
    this.registeredApps = new Set()
  }

  registerApp(appName, loadingFunction, activityFunction) {
    if (this.registeredApps.has(appName)) {
      return
    }

    registerApplication({
      name: appName,
      app: loadingFunction,
      activeWhen: activityFunction,
      customProps: {
        domElement: document.getElementById(`${appName}-container`)
      }
    })

    this.registeredApps.add(appName)
  }

  // 条件注册应用
  conditionalRegister(condition, appName, loadingFunction, activityFunction) {
    if (condition) {
      this.registerApp(appName, loadingFunction, activityFunction)
    }
  }

  // 批量注册
  registerApps(apps) {
    apps.forEach(({ name, loader, activity, condition = true }) => {
      this.conditionalRegister(condition, name, loader, activity)
    })
  }
}

const spaLoader = new SingleSPALoader()

// 注册微前端应用
spaLoader.registerApps([
  {
    name: 'dashboard',
    loader: () => import('./microfrontends/dashboard'),
    activity: location => location.pathname.startsWith('/dashboard')
  },
  {
    name: 'profile',
    loader: () => import('./microfrontends/profile'),
    activity: location => location.pathname.startsWith('/profile'),
    condition: userHasPermission('profile')
  },
  {
    name: 'admin',
    loader: () => import('./microfrontends/admin'),
    activity: location => location.pathname.startsWith('/admin'),
    condition: userIsAdmin()
  }
])

// 启动 single-spa
start()
```

## 实际应用案例
### 电商平台代码分割

```javascript
// 电商平台代码分割策略
class EcommerceCodeSplitting {
  constructor() {
    this.userRole = this.getUserRole()
    this.deviceType = this.getDeviceType()
    this.setupCodeSplitting()
  }

  setupCodeSplitting() {
    // 基础页面分割
    this.setupBasicPages()
    
    // 用户角色相关分割
    this.setupRoleBasedSplitting()
    
    // 设备类型分割
    this.setupDeviceBasedSplitting()
    
    // 功能模块分割
    this.setupFeatureBasedSplitting()
  }

  setupBasicPages() {
    // 首页 - 立即加载
    const HomePage = lazy(() => import('./pages/Home'))
    
    // 商品列表 - 预加载
    const ProductList = lazy(() => import('./pages/ProductList'))
    
    // 商品详情 - 按需加载
    const ProductDetail = lazy(() => import('./pages/ProductDetail'))
    
    // 购物车 - 用户交互时加载
    const ShoppingCart = lazy(() => import('./pages/ShoppingCart'))
    
    // 结算页面 - 用户点击结算时加载
    const Checkout = lazy(() => import('./pages/Checkout'))
    
    return {
      HomePage,
      ProductList,
      ProductDetail,
      ShoppingCart,
      Checkout
    }
  }

  setupRoleBasedSplitting() {
    const components = {}
    
    // 普通用户组件
    if (this.userRole === 'customer') {
      components.UserProfile = lazy(() => import('./components/UserProfile'))
      components.OrderHistory = lazy(() => import('./components/OrderHistory'))
    }
    
    // 商家组件
    if (this.userRole === 'seller') {
      components.SellerDashboard = lazy(() => import('./components/SellerDashboard'))
      components.ProductManagement = lazy(() => import('./components/ProductManagement'))
      components.OrderManagement = lazy(() => import('./components/OrderManagement'))
    }
    
    // 管理员组件
    if (this.userRole === 'admin') {
      components.AdminPanel = lazy(() => import('./components/AdminPanel'))
      components.UserManagement = lazy(() => import('./components/UserManagement'))
      components.SystemSettings = lazy(() => import('./components/SystemSettings'))
    }
    
    return components
  }

  setupDeviceBasedSplitting() {
    if (this.deviceType === 'mobile') {
      // 移动端特定组件
      return {
        MobileNavigation: lazy(() => import('./components/mobile/Navigation')),
        MobileProductCard: lazy(() => import('./components/mobile/ProductCard')),
        MobileCheckout: lazy(() => import('./components/mobile/Checkout'))
      }
    } else {
      // 桌面端特定组件
      return {
        DesktopNavigation: lazy(() => import('./components/desktop/Navigation')),
        DesktopProductCard: lazy(() => import('./components/desktop/ProductCard')),
        DesktopCheckout: lazy(() => import('./components/desktop/Checkout'))
      }
    }
  }

  setupFeatureBasedSplitting() {
    return {
      // 搜索功能
      SearchModule: lazy(() => import('./features/search')),
      
      // 推荐系统
      RecommendationEngine: lazy(() => import('./features/recommendation')),
      
      // 支付模块
      PaymentModule: lazy(() => import('./features/payment')),
      
      // 物流跟踪
      ShippingTracker: lazy(() => import('./features/shipping')),
      
      // 客服聊天
      CustomerService: lazy(() => import('./features/chat')),
      
      // 数据分析
      Analytics: lazy(() => import('./features/analytics'))
    }
  }

  // 智能预加载
  async smartPreload() {
    const userBehavior = await this.getUserBehavior()
    
    // 基于用户行为预加载
    if (userBehavior.frequentlyViewsProducts) {
      import('./pages/ProductDetail')
    }
    
    if (userBehavior.hasItemsInCart) {
      import('./pages/ShoppingCart')
      import('./features/payment')
    }
    
    if (userBehavior.isReturningCustomer) {
      import('./components/UserProfile')
      import('./components/OrderHistory')
    }
  }

  getUserRole() {
    // 获取用户角色逻辑
    return localStorage.getItem('userRole') || 'guest'
  }

  getDeviceType() {
    return window.innerWidth < 768 ? 'mobile' : 'desktop'
  }

  async getUserBehavior() {
    // 分析用户行为数据
    return {
      frequentlyViewsProducts: true,
      hasItemsInCart: localStorage.getItem('cartItems') !== null,
      isReturningCustomer: localStorage.getItem('userId') !== null
    }
  }
}

// 使用示例
const ecommerceSplitting = new EcommerceCodeSplitting()
ecommerceSplitting.smartPreload()
```

## 故障排除
### 常见问题

1. **Chunk 加载失败**
   ```javascript
   // 解决方案：添加重试机制
   const retryImport = (importFunc, retries = 3) => {
     return importFunc().catch(error => {
       if (retries > 0) {
         return new Promise(resolve => {
           setTimeout(() => resolve(retryImport(importFunc, retries - 1)), 1000)
         })
       }
       throw error
     })
   }
   ```

2. **缓存问题**
   ```javascript
   // 解决方案：使用 contenthash
   output: {
     filename: '[name].[contenthash].js',
     chunkFilename: '[name].[contenthash].chunk.js'
   }
   ```

3. **预加载过多**
   ```javascript
   // 解决方案：智能预加载
   const shouldPreload = (route) => {
     const userBehavior = getUserBehavior()
     return userBehavior.likelyToVisit.includes(route)
   }
   ```

### 调试工具

```javascript
// 代码分割调试工具
class CodeSplittingDebugger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development'
    this.logs = []
  }

  log(message, data = {}) {
    if (!this.enabled) return

    const logEntry = {
      timestamp: Date.now(),
      message,
      data
    }

    this.logs.push(logEntry)
    console.log(`[CodeSplitting] ${message}`, data)
  }

  trackChunkLoad(chunkName, startTime) {
    const loadTime = Date.now() - startTime
    this.log(`Chunk loaded: ${chunkName}`, { loadTime })
  }

  trackChunkError(chunkName, error) {
    this.log(`Chunk error: ${chunkName}`, { error: error.message })
  }

  generateReport() {
    return {
      totalLogs: this.logs.length,
      errors: this.logs.filter(log => log.message.includes('error')),
      loadTimes: this.logs
        .filter(log => log.message.includes('loaded'))
        .map(log => log.data.loadTime)
    }
  }
}

const debugger = new CodeSplittingDebugger()

// 在动态导入中使用
const loadChunkWithDebug = async (chunkName, importFunc) => {
  const startTime = Date.now()

  try {
    const result = await importFunc()
    debugger.trackChunkLoad(chunkName, startTime)
    return result
  } catch (error) {
    debugger.trackChunkError(chunkName, error)
    throw error
  }
}
```

## 高级性能优化
### 智能预加载策略

```javascript
// 智能预加载管理器
class IntelligentPreloader {
  constructor() {
    this.preloadQueue = new Set()
    this.loadedModules = new Set()
    this.userBehaviorData = new Map()
    this.networkCondition = this.getNetworkCondition()
    this.deviceCapabilities = this.getDeviceCapabilities()
    
    this.setupIntersectionObserver()
    this.setupUserBehaviorTracking()
  }

  // 基于用户行为的预测性预加载
  async predictivePreload() {
    const predictions = await this.analyzeUserBehavior()
    
    predictions.forEach(({ module, probability, priority }) => {
      if (probability > 0.7 && this.shouldPreload(priority)) {
        this.schedulePreload(module, priority)
      }
    })
  }

  // 基于视口的智能预加载
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const preloadTarget = entry.target.dataset.preload
            if (preloadTarget) {
              this.schedulePreload(preloadTarget, 'high')
            }
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    )

    // 观察所有带有 data-preload 属性的元素
    document.querySelectorAll('[data-preload]').forEach(el => {
      observer.observe(el)
    })
  }

  // 用户行为跟踪
  setupUserBehaviorTracking() {
    // 鼠标悬停预加载
    document.addEventListener('mouseover', (e) => {
      const link = e.target.closest('[data-hover-preload]')
      if (link) {
        const module = link.dataset.hoverPreload
        this.schedulePreload(module, 'medium', 200) // 200ms 延迟
      }
    })

    // 点击意图检测
    document.addEventListener('mousedown', (e) => {
      const link = e.target.closest('[data-click-preload]')
      if (link) {
        const module = link.dataset.clickPreload
        this.schedulePreload(module, 'urgent')
      }
    })

    // 滚动行为分析
    let scrollTimeout
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        this.analyzeScrollBehavior()
      }, 150)
    })
  }

  // 网络条件适应性预加载
  shouldPreload(priority) {
    const { effectiveType, downlink } = this.networkCondition
    
    // 根据网络条件调整预加载策略
    if (effectiveType === '4g' && downlink > 2) {
      return true // 良好网络，积极预加载
    } else if (effectiveType === '3g' && priority === 'high') {
      return true // 中等网络，只预加载高优先级
    } else if (effectiveType === '2g' && priority === 'urgent') {
      return true // 慢网络，只预加载紧急内容
    }
    
    return false
  }

  // 设备能力适应性
  getDeviceCapabilities() {
    return {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    }
  }

  // 调度预加载
  async schedulePreload(module, priority, delay = 0) {
    if (this.loadedModules.has(module) || this.preloadQueue.has(module)) {
      return
    }

    this.preloadQueue.add(module)

    // 根据优先级和设备能力调整延迟
    const adjustedDelay = this.calculateDelay(delay, priority)

    setTimeout(async () => {
      try {
        await this.preloadModule(module)
        this.loadedModules.add(module)
        this.preloadQueue.delete(module)
      } catch (error) {
        console.warn(`Preload failed for ${module}:`, error)
        this.preloadQueue.delete(module)
      }
    }, adjustedDelay)
  }

  async preloadModule(module) {
    // 使用 link rel="modulepreload" 进行预加载
    const link = document.createElement('link')
    link.rel = 'modulepreload'
    link.href = module
    document.head.appendChild(link)

    // 同时进行动态导入预加载
    return import(module)
  }

  calculateDelay(baseDelay, priority) {
    const priorityMultipliers = {
      urgent: 0,
      high: 0.5,
      medium: 1,
      low: 2
    }

    const deviceMultiplier = this.deviceCapabilities.isMobile ? 1.5 : 1
    const networkMultiplier = this.networkCondition.effectiveType === '2g' ? 3 : 1

    return baseDelay * priorityMultipliers[priority] * deviceMultiplier * networkMultiplier
  }

  getNetworkCondition() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100
    }
  }

  async analyzeUserBehavior() {
    // 分析用户行为模式，返回预测结果
    const currentPath = window.location.pathname
    const timeOnPage = Date.now() - this.pageStartTime
    const scrollDepth = this.getScrollDepth()

    // 基于历史数据预测用户下一步行为
    return [
      { module: './pages/ProductDetail', probability: 0.8, priority: 'high' },
      { module: './components/ShoppingCart', probability: 0.6, priority: 'medium' },
      { module: './features/search', probability: 0.4, priority: 'low' }
    ]
  }

  getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    return Math.round((scrollTop / documentHeight) * 100)
  }
}

// 使用示例
const preloader = new IntelligentPreloader()
preloader.predictivePreload()
```

### 内存管理优化

```javascript
// 内存管理器
class MemoryManager {
  constructor() {
    this.moduleCache = new Map()
    this.memoryThreshold = this.calculateMemoryThreshold()
    this.cleanupInterval = 30000 // 30秒清理一次
    
    this.startMemoryMonitoring()
  }

  calculateMemoryThreshold() {
    const deviceMemory = navigator.deviceMemory || 4
    // 根据设备内存设置阈值（MB）
    return deviceMemory >= 8 ? 100 : deviceMemory >= 4 ? 50 : 25
  }

  startMemoryMonitoring() {
    setInterval(() => {
      this.checkMemoryUsage()
    }, this.cleanupInterval)

    // 监听内存压力事件
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory
        const usedMB = memInfo.usedJSHeapSize / 1024 / 1024
        
        if (usedMB > this.memoryThreshold) {
          this.aggressiveCleanup()
        }
      }, 5000)
    }
  }

  async checkMemoryUsage() {
    if ('memory' in performance) {
      const memInfo = performance.memory
      const usedMB = memInfo.usedJSHeapSize / 1024 / 1024
      const totalMB = memInfo.totalJSHeapSize / 1024 / 1024
      
      console.log(`Memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`)
      
      if (usedMB > this.memoryThreshold * 0.8) {
        await this.performCleanup()
      }
    }
  }

  async performCleanup() {
    // 清理未使用的模块
    const unusedModules = this.findUnusedModules()
    
    for (const moduleId of unusedModules) {
      await this.unloadModule(moduleId)
    }

    // 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc()
    }
  }

  findUnusedModules() {
    const currentTime = Date.now()
    const unusedThreshold = 5 * 60 * 1000 // 5分钟未使用
    
    return Array.from(this.moduleCache.entries())
      .filter(([id, info]) => {
        return currentTime - info.lastUsed > unusedThreshold && !info.isPersistent
      })
      .map(([id]) => id)
  }

  async unloadModule(moduleId) {
    const moduleInfo = this.moduleCache.get(moduleId)
    
    if (moduleInfo && moduleInfo.cleanup) {
      try {
        await moduleInfo.cleanup()
      } catch (error) {
        console.warn(`Cleanup failed for module ${moduleId}:`, error)
      }
    }

    this.moduleCache.delete(moduleId)
    
    // 移除相关的 DOM 元素
    const elements = document.querySelectorAll(`[data-module="${moduleId}"]`)
    elements.forEach(el => el.remove())
  }

  aggressiveCleanup() {
    // 紧急内存清理
    const allModules = Array.from(this.moduleCache.keys())
    const nonEssentialModules = allModules.filter(id => {
      const info = this.moduleCache.get(id)
      return !info.isPersistent && !info.isCurrentlyVisible
    })

    nonEssentialModules.forEach(moduleId => {
      this.unloadModule(moduleId)
    })
  }

  registerModule(moduleId, module, options = {}) {
    this.moduleCache.set(moduleId, {
      module,
      lastUsed: Date.now(),
      isPersistent: options.persistent || false,
      isCurrentlyVisible: options.visible || false,
      cleanup: options.cleanup
    })
  }

  markModuleUsed(moduleId) {
    const moduleInfo = this.moduleCache.get(moduleId)
    if (moduleInfo) {
      moduleInfo.lastUsed = Date.now()
    }
  }
}

// 使用示例
const memoryManager = new MemoryManager()

// 注册模块时提供清理函数
memoryManager.registerModule('heavy-chart', chartModule, {
  persistent: false,
  cleanup: async () => {
    // 清理图表实例
    chartModule.destroy()
    // 清理事件监听器
    chartModule.removeAllListeners()
  }
})
```

### 错误恢复和降级策略

```javascript
// 错误恢复管理器
class ErrorRecoveryManager {
  constructor() {
    this.failedModules = new Map()
    this.retryStrategies = new Map()
    this.fallbackComponents = new Map()
    
    this.setupGlobalErrorHandling()
  }

  setupGlobalErrorHandling() {
    // 捕获动态导入错误
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Loading chunk')) {
        event.preventDefault()
        this.handleChunkLoadError(event.reason)
      }
    })

    // 捕获脚本加载错误
    window.addEventListener('error', (event) => {
      if (event.target.tagName === 'SCRIPT') {
        this.handleScriptError(event.target.src)
      }
    })
  }

  async handleChunkLoadError(error) {
    const chunkId = this.extractChunkId(error.message)
    
    if (chunkId) {
      await this.retryChunkLoad(chunkId)
    }
  }

  async retryChunkLoad(chunkId, maxRetries = 3) {
    const failureInfo = this.failedModules.get(chunkId) || { count: 0, lastAttempt: 0 }
    
    if (failureInfo.count >= maxRetries) {
      return this.loadFallback(chunkId)
    }

    // 指数退避重试
    const delay = Math.min(1000 * Math.pow(2, failureInfo.count), 10000)
    
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      // 清除缓存并重新加载
      await this.clearChunkCache(chunkId)
      const module = await import(/* webpackChunkName: "[request]" */ chunkId)
      
      // 重试成功，清除失败记录
      this.failedModules.delete(chunkId)
      return module
    } catch (retryError) {
      failureInfo.count++
      failureInfo.lastAttempt = Date.now()
      this.failedModules.set(chunkId, failureInfo)
      
      console.warn(`Retry ${failureInfo.count} failed for chunk ${chunkId}:`, retryError)
      
      if (failureInfo.count >= maxRetries) {
        return this.loadFallback(chunkId)
      }
      
      return this.retryChunkLoad(chunkId, maxRetries)
    }
  }

  async clearChunkCache(chunkId) {
    // 清除浏览器缓存
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const requests = await cache.keys()
        
        for (const request of requests) {
          if (request.url.includes(chunkId)) {
            await cache.delete(request)
          }
        }
      }
    }

    // 清除 webpack 模块缓存
    if (typeof __webpack_require__ !== 'undefined' && __webpack_require__.cache) {
      Object.keys(__webpack_require__.cache).forEach(key => {
        if (key.includes(chunkId)) {
          delete __webpack_require__.cache[key]
        }
      })
    }
  }

  async loadFallback(chunkId) {
    const fallback = this.fallbackComponents.get(chunkId)
    
    if (fallback) {
      console.info(`Loading fallback for failed chunk: ${chunkId}`)
      return fallback
    }

    // 通用降级组件
    return {
      default: () => React.createElement('div', {
        className: 'error-fallback',
        children: [
          React.createElement('h3', null, '内容暂时无法加载'),
          React.createElement('p', null, '请刷新页面重试'),
          React.createElement('button', {
            onClick: () => window.location.reload()
          }, '刷新页面')
        ]
      })
    }
  }

  registerFallback(chunkId, fallbackComponent) {
    this.fallbackComponents.set(chunkId, fallbackComponent)
  }

  extractChunkId(errorMessage) {
    // 从错误消息中提取 chunk ID
    const match = errorMessage.match(/Loading chunk (\d+) failed/)
    return match ? match[1] : null
  }

  // 网络状态适应性加载
  async adaptiveLoad(moduleId) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    if (connection) {
      const { effectiveType, downlink } = connection
      
      // 根据网络状况选择加载策略
      if (effectiveType === '2g' || downlink < 0.5) {
        // 慢网络：加载轻量版本
        return this.loadLightVersion(moduleId)
      } else if (effectiveType === '3g' || downlink < 2) {
        // 中等网络：标准版本
        return this.loadStandardVersion(moduleId)
      } else {
        // 快网络：完整版本
        return this.loadFullVersion(moduleId)
      }
    }

    // 默认加载标准版本
    return this.loadStandardVersion(moduleId)
  }

  async loadLightVersion(moduleId) {
    try {
      return await import(`${moduleId}/light`)
    } catch (error) {
      console.warn(`Light version not available for ${moduleId}, loading standard version`)
      return this.loadStandardVersion(moduleId)
    }
  }

  async loadStandardVersion(moduleId) {
    return import(moduleId)
  }

  async loadFullVersion(moduleId) {
    try {
      return await import(`${moduleId}/full`)
    } catch (error) {
      console.warn(`Full version not available for ${moduleId}, loading standard version`)
      return this.loadStandardVersion(moduleId)
    }
  }
}

// 使用示例
const errorRecovery = new ErrorRecoveryManager()

// 注册降级组件
errorRecovery.registerFallback('dashboard', {
  default: () => React.createElement('div', null, '仪表板暂时不可用')
})

// 在组件中使用适应性加载
const AdaptiveComponent = () => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    errorRecovery.adaptiveLoad('./components/HeavyComponent')
      .then(module => {
        setComponent(() => module.default)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading component</div>
  if (Component) return <Component />
  
  return null
}
```

## 参考资源
### 官方文档

- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [React.lazy](https://reactjs.org/docs/code-splitting.html)
- [Vue Async Components](https://vuejs.org/guide/components/async.html)
- [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)

### 工具推荐

- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [source-map-explorer](https://github.com/danvk/source-map-explorer)
- [bundlephobia](https://bundlephobia.com/)
- [Bundle Buddy](https://bundle-buddy.com/)

### 学习资源

- [Web Performance Optimization](https://developers.google.com/web/fundamentals/performance)
- [JavaScript Performance](https://developer.mozilla.org/en-US/docs/Web/Performance)
- [Modern Web App Performance](https://web.dev/performance/)

---

> 💡 **提示**：代码分割是一个渐进式的优化过程，建议从路由级分割开始，然后根据实际需求逐步细化到组件级和功能级分割！
