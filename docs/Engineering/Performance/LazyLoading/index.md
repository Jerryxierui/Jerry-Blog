# 懒加载 (Lazy Loading)

## 简介

懒加载是一种性能优化技术，**核心思想是"延迟加载非关键资源"**，只在真正需要时才加载内容，从而减少初始页面加载时间，提升用户体验和页面性能。

### 核心特性
- **按需加载**：只在需要时加载资源
- **性能优化**：减少初始加载时间和带宽消耗
- **用户体验**：更快的首屏渲染时间
- **资源节约**：避免加载用户可能永远不会看到的内容
- **渐进增强**：支持优雅降级和渐进增强

### 适用场景
- **图片密集型应用**：电商网站、图片画廊、社交媒体
- **长列表页面**：无限滚动、分页列表
- **单页应用**：组件懒加载、路由懒加载
- **移动端应用**：带宽和性能敏感的场景
- **内容管理系统**：大量媒体资源的网站

### 性能指标
- **首屏时间 (FCP)**：首次内容绘制时间
- **最大内容绘制 (LCP)**：最大内容元素的渲染时间
- **累积布局偏移 (CLS)**：视觉稳定性指标
- **首次输入延迟 (FID)**：交互响应时间
- **带宽节约**：减少不必要的数据传输

## 核心概念

### 懒加载原理

懒加载通过以下机制实现：

1. **延迟执行**：推迟资源的加载和执行
2. **触发条件**：基于用户交互或视口位置
3. **占位符**：使用轻量级占位符保持布局
4. **渐进加载**：逐步替换占位符为实际内容

### 懒加载类型

#### 图片懒加载
- **原生懒加载**：使用 `loading="lazy"` 属性
- **Intersection Observer**：基于视口检测
- **滚动事件**：传统的滚动监听方式
- **渐进式图片**：从低质量到高质量的渐进加载

#### 组件懒加载
- **动态导入**：使用 `import()` 语法
- **条件渲染**：基于状态的组件渲染
- **路由懒加载**：按路由分割组件
- **功能模块懒加载**：按功能划分的模块加载

#### 内容懒加载
- **无限滚动**：滚动时动态加载更多内容
- **分页懒加载**：点击或滚动时加载下一页
- **标签页懒加载**：切换标签时才加载内容
- **模态框懒加载**：打开时才加载模态框内容

## 图片懒加载

### 原生懒加载

```html
<!-- 原生懒加载 -->
<img src="image.jpg" loading="lazy" alt="描述" />

<!-- 带占位符的懒加载 -->
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg" 
  loading="lazy" 
  alt="描述"
  class="lazy-image"
/>

<!-- 响应式懒加载 -->
<img 
  src="placeholder.jpg"
  data-srcset="
    small.jpg 480w,
    medium.jpg 768w,
    large.jpg 1200w
  "
  data-sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
  loading="lazy"
  alt="响应式图片"
/>
```

### Intersection Observer 实现

```javascript
// 基础 Intersection Observer 懒加载
class LazyImageLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '50px 0px',
      threshold: 0.01,
      ...options
    }
    
    this.imageObserver = null
    this.images = []
    this.init()
  }

  init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
      this.loadAllImages()
      return
    }

    this.createObserver()
    this.observeImages()
  }

  createObserver() {
    this.imageObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    )
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target)
        this.imageObserver.unobserve(entry.target)
      }
    })
  }

  async loadImage(img) {
    const src = img.dataset.src
    const srcset = img.dataset.srcset
    const sizes = img.dataset.sizes

    if (!src && !srcset) return

    // 显示加载状态
    img.classList.add('loading')

    try {
      // 预加载图片
      await this.preloadImage(src, srcset)
      
      // 设置图片源
      if (srcset) {
        img.srcset = srcset
      }
      if (sizes) {
        img.sizes = sizes
      }
      if (src) {
        img.src = src
      }

      // 图片加载完成
      img.addEventListener('load', () => {
        img.classList.remove('loading')
        img.classList.add('loaded')
      }, { once: true })

      // 处理加载错误
      img.addEventListener('error', () => {
        img.classList.remove('loading')
        img.classList.add('error')
        this.handleImageError(img)
      }, { once: true })

    } catch (error) {
      console.error('Image preload failed:', error)
      img.classList.remove('loading')
      img.classList.add('error')
      this.handleImageError(img)
    }
  }

  preloadImage(src, srcset) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = resolve
      img.onerror = reject
      
      if (srcset) {
        img.srcset = srcset
      }
      if (src) {
        img.src = src
      }
    })
  }

  handleImageError(img) {
    // 设置错误占位符
    const errorSrc = img.dataset.errorSrc || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4='
    img.src = errorSrc
  }

  observeImages() {
    // 查找所有懒加载图片
    this.images = document.querySelectorAll('img[data-src], img[data-srcset]')
    
    this.images.forEach(img => {
      this.imageObserver.observe(img)
    })
  }

  // 降级处理：直接加载所有图片
  loadAllImages() {
    const images = document.querySelectorAll('img[data-src], img[data-srcset]')
    
    images.forEach(img => {
      this.loadImage(img)
    })
  }

  // 添加新图片到观察列表
  addImages(newImages) {
    newImages.forEach(img => {
      this.imageObserver.observe(img)
    })
  }

  // 销毁观察器
  destroy() {
    if (this.imageObserver) {
      this.imageObserver.disconnect()
    }
  }
}

// 使用示例
const lazyLoader = new LazyImageLoader({
  rootMargin: '100px 0px', // 提前100px开始加载
  threshold: 0.1
})

// 动态添加图片时
const newImages = document.querySelectorAll('.new-images img[data-src]')
lazyLoader.addImages(newImages)
```

### 渐进式图片加载

```javascript
// 渐进式图片加载器
class ProgressiveImageLoader {
  constructor() {
    this.init()
  }

  init() {
    const progressiveImages = document.querySelectorAll('.progressive-image')
    
    progressiveImages.forEach(container => {
      this.loadProgressiveImage(container)
    })
  }

  async loadProgressiveImage(container) {
    const img = container.querySelector('img')
    const lowQualitySrc = img.dataset.lowsrc
    const highQualitySrc = img.dataset.src
    const placeholder = container.querySelector('.placeholder')

    try {
      // 1. 显示占位符
      if (placeholder) {
        placeholder.style.display = 'block'
      }

      // 2. 加载低质量图片
      if (lowQualitySrc) {
        await this.loadImage(lowQualitySrc)
        img.src = lowQualitySrc
        img.classList.add('low-quality')
        
        if (placeholder) {
          placeholder.style.display = 'none'
        }
      }

      // 3. 在后台加载高质量图片
      if (highQualitySrc) {
        const highQualityImg = await this.loadImage(highQualitySrc)
        
        // 4. 平滑过渡到高质量图片
        this.transitionToHighQuality(img, highQualitySrc)
      }

    } catch (error) {
      console.error('Progressive image loading failed:', error)
      this.handleLoadError(container)
    }
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  transitionToHighQuality(img, highQualitySrc) {
    // 创建高质量图片元素
    const highQualityImg = img.cloneNode(true)
    highQualityImg.src = highQualitySrc
    highQualityImg.classList.remove('low-quality')
    highQualityImg.classList.add('high-quality')
    highQualityImg.style.opacity = '0'
    
    // 插入到容器中
    img.parentNode.insertBefore(highQualityImg, img.nextSibling)
    
    // 淡入效果
    requestAnimationFrame(() => {
      highQualityImg.style.transition = 'opacity 0.3s ease-in-out'
      highQualityImg.style.opacity = '1'
      
      // 移除低质量图片
      setTimeout(() => {
        if (img.parentNode) {
          img.parentNode.removeChild(img)
        }
      }, 300)
    })
  }

  handleLoadError(container) {
    const errorPlaceholder = container.querySelector('.error-placeholder')
    if (errorPlaceholder) {
      errorPlaceholder.style.display = 'block'
    }
  }
}

// CSS 样式
const progressiveImageCSS = `
.progressive-image {
  position: relative;
  overflow: hidden;
}

.progressive-image img {
  width: 100%;
  height: auto;
  display: block;
}

.progressive-image img.low-quality {
  filter: blur(2px);
  transform: scale(1.05);
}

.progressive-image img.high-quality {
  position: absolute;
  top: 0;
  left: 0;
}

.progressive-image .placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.progressive-image .error-placeholder {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 14px;
}
`

// 注入样式
const style = document.createElement('style')
style.textContent = progressiveImageCSS
document.head.appendChild(style)

// 使用示例
const progressiveLoader = new ProgressiveImageLoader()
```

## 组件懒加载

### React 组件懒加载

```javascript
// React 懒加载组件
import React, { lazy, Suspense, useState, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

// 基础懒加载组件
const LazyComponent = lazy(() => import('./HeavyComponent'))

// 带错误处理的懒加载
const LazyComponentWithRetry = lazy(() => 
  import('./HeavyComponent').catch(error => {
    console.error('Component load failed:', error)
    // 重试机制
    return import('./FallbackComponent')
  })
)

// 条件懒加载组件
const ConditionalLazyComponent = ({ shouldLoad, children }) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (shouldLoad && !Component && !loading) {
      setLoading(true)
      
      import('./ConditionalComponent')
        .then(module => {
          setComponent(() => module.default)
          setLoading(false)
        })
        .catch(err => {
          setError(err)
          setLoading(false)
        })
    }
  }, [shouldLoad, Component, loading])

  if (!shouldLoad) return children || null
  if (loading) return <div className="loading">Loading component...</div>
  if (error) return <div className="error">Failed to load component</div>
  if (Component) return <Component />
  
  return null
}

// 视口懒加载组件
const ViewportLazyComponent = ({ children, ...props }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasLoaded])

  return (
    <div ref={ref} {...props}>
      {isVisible ? (
        <Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </Suspense>
      ) : (
        children || <div className="placeholder">Scroll to load content</div>
      )}
    </div>
  )
}

// 懒加载 Hook
const useLazyComponent = (importFunction, dependencies = []) => {
  const [Component, setComponent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadComponent = useCallback(async () => {
    if (Component || loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const module = await importFunction()
      setComponent(() => module.default || module)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, dependencies)

  return { Component, loading, error, loadComponent }
}

// 使用示例
function App() {
  const [showHeavyComponent, setShowHeavyComponent] = useState(false)
  const { Component: DynamicComponent, loading, error, loadComponent } = useLazyComponent(
    () => import('./DynamicComponent')
  )

  return (
    <div>
      {/* 基础懒加载 */}
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>

      {/* 条件懒加载 */}
      <ConditionalLazyComponent shouldLoad={showHeavyComponent}>
        <button onClick={() => setShowHeavyComponent(true)}>
          Load Heavy Component
        </button>
      </ConditionalLazyComponent>

      {/* 视口懒加载 */}
      <ViewportLazyComponent className="viewport-lazy">
        <div>Scroll down to load component</div>
      </ViewportLazyComponent>

      {/* 手动懒加载 */}
      <div>
        <button onClick={loadComponent} disabled={loading}>
          {loading ? 'Loading...' : 'Load Dynamic Component'}
        </button>
        {error && <div>Error: {error.message}</div>}
        {DynamicComponent && <DynamicComponent />}
      </div>

      {/* 错误边界包装 */}
      <ErrorBoundary
        fallback={<div>Something went wrong with lazy component</div>}
        onError={(error, errorInfo) => {
          console.error('Lazy component error:', error, errorInfo)
        }}
      >
        <Suspense fallback={<div>Loading with error boundary...</div>}>
          <LazyComponentWithRetry />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
```

### Vue 组件懒加载

```javascript
// Vue 3 组件懒加载
import { defineAsyncComponent, ref, onMounted } from 'vue'

// 基础异步组件
const AsyncComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// 带加载状态的异步组件
const AsyncComponentWithLoading = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: {
    template: '<div class="loading">Loading component...</div>'
  },
  errorComponent: {
    template: '<div class="error">Failed to load component</div>'
  },
  delay: 200,
  timeout: 3000
})

// 条件懒加载组合式函数
function useLazyComponent(importFunction) {
  const component = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const loadComponent = async () => {
    if (component.value || loading.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const module = await importFunction()
      component.value = module.default || module
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  return {
    component,
    loading,
    error,
    loadComponent
  }
}

// 视口懒加载组件
const ViewportLazyComponent = {
  props: {
    importFunction: {
      type: Function,
      required: true
    },
    threshold: {
      type: Number,
      default: 0.1
    }
  },
  setup(props) {
    const containerRef = ref(null)
    const isVisible = ref(false)
    const hasLoaded = ref(false)
    
    const { component, loading, error, loadComponent } = useLazyComponent(props.importFunction)

    onMounted(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasLoaded.value) {
            isVisible.value = true
            hasLoaded.value = true
            loadComponent()
            observer.unobserve(entry.target)
          }
        },
        { threshold: props.threshold }
      )

      if (containerRef.value) {
        observer.observe(containerRef.value)
      }

      return () => observer.disconnect()
    })

    return {
      containerRef,
      isVisible,
      component,
      loading,
      error
    }
  },
  template: `
    <div ref="containerRef">
      <div v-if="loading" class="loading">Loading component...</div>
      <div v-else-if="error" class="error">Failed to load component</div>
      <component v-else-if="component" :is="component" />
      <div v-else class="placeholder">
        <slot>Scroll to load content</slot>
      </div>
    </div>
  `
}

// Vue 路由懒加载
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('./views/About.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import(
      /* webpackChunkName: "dashboard" */ 
      './views/Dashboard.vue'
    )
  }
]

// 使用示例组件
export default {
  components: {
    AsyncComponent,
    AsyncComponentWithLoading,
    ViewportLazyComponent
  },
  setup() {
    const showHeavyComponent = ref(false)
    const { component: dynamicComponent, loading, error, loadComponent } = useLazyComponent(
      () => import('./DynamicComponent.vue')
    )

    return {
      showHeavyComponent,
      dynamicComponent,
      loading,
      error,
      loadComponent
    }
  },
  template: `
    <div>
      <!-- 基础异步组件 -->
      <AsyncComponent />
      
      <!-- 带加载状态的异步组件 -->
      <AsyncComponentWithLoading />
      
      <!-- 条件懒加载 -->
      <button v-if="!showHeavyComponent" @click="showHeavyComponent = true">
        Load Heavy Component
      </button>
      <AsyncComponent v-if="showHeavyComponent" />
      
      <!-- 视口懒加载 -->
      <ViewportLazyComponent 
        :import-function="() => import('./ViewportComponent.vue')"
        :threshold="0.2"
      >
        <div>Scroll down to load component</div>
      </ViewportLazyComponent>
      
      <!-- 手动懒加载 -->
      <div>
        <button @click="loadComponent" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load Dynamic Component' }}
        </button>
        <div v-if="error" class="error">Error: {{ error.message }}</div>
        <component v-if="dynamicComponent" :is="dynamicComponent" />
      </div>
    </div>
  `
}
```

## 内容懒加载

### 无限滚动实现

```javascript
// 无限滚动管理器
class InfiniteScrollManager {
  constructor(options = {}) {
    this.options = {
      container: window,
      threshold: 100, // 距离底部多少像素开始加载
      debounceDelay: 100,
      ...options
    }
    
    this.loading = false
    this.hasMore = true
    this.page = 1
    this.items = []
    
    this.init()
  }

  init() {
    this.debouncedScrollHandler = this.debounce(
      this.handleScroll.bind(this),
      this.options.debounceDelay
    )
    
    this.bindEvents()
    this.loadInitialData()
  }

  bindEvents() {
    const container = this.options.container
    
    if (container === window) {
      window.addEventListener('scroll', this.debouncedScrollHandler)
      window.addEventListener('resize', this.debouncedScrollHandler)
    } else {
      container.addEventListener('scroll', this.debouncedScrollHandler)
    }
  }

  handleScroll() {
    if (this.loading || !this.hasMore) return
    
    const { container, threshold } = this.options
    let scrollTop, scrollHeight, clientHeight
    
    if (container === window) {
      scrollTop = window.pageYOffset || document.documentElement.scrollTop
      scrollHeight = document.documentElement.scrollHeight
      clientHeight = window.innerHeight
    } else {
      scrollTop = container.scrollTop
      scrollHeight = container.scrollHeight
      clientHeight = container.clientHeight
    }
    
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight)
    
    if (distanceToBottom <= threshold) {
      this.loadMore()
    }
  }

  async loadInitialData() {
    try {
      this.loading = true
      this.showLoadingIndicator()
      
      const data = await this.fetchData(1)
      this.items = data.items
      this.hasMore = data.hasMore
      this.page = 2
      
      this.renderItems(this.items)
    } catch (error) {
      this.handleError(error)
    } finally {
      this.loading = false
      this.hideLoadingIndicator()
    }
  }

  async loadMore() {
    if (this.loading || !this.hasMore) return
    
    try {
      this.loading = true
      this.showLoadingIndicator()
      
      const data = await this.fetchData(this.page)
      
      if (data.items.length === 0) {
        this.hasMore = false
        this.showEndMessage()
        return
      }
      
      this.items = [...this.items, ...data.items]
      this.hasMore = data.hasMore
      this.page++
      
      this.renderNewItems(data.items)
      
    } catch (error) {
      this.handleError(error)
    } finally {
      this.loading = false
      this.hideLoadingIndicator()
    }
  }

  async fetchData(page) {
    // 模拟 API 调用
    const response = await fetch(`/api/items?page=${page}&limit=20`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }

  renderItems(items) {
    const container = document.getElementById('items-container')
    container.innerHTML = ''
    
    items.forEach(item => {
      const element = this.createItemElement(item)
      container.appendChild(element)
    })
  }

  renderNewItems(items) {
    const container = document.getElementById('items-container')
    
    items.forEach(item => {
      const element = this.createItemElement(item)
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
      container.appendChild(element)
      
      // 动画效果
      requestAnimationFrame(() => {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
        element.style.opacity = '1'
        element.style.transform = 'translateY(0)'
      })
    })
  }

  createItemElement(item) {
    const div = document.createElement('div')
    div.className = 'item'
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <img data-src="${item.image}" alt="${item.title}" loading="lazy" />
    `
    return div
  }

  showLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator')
    if (indicator) {
      indicator.style.display = 'block'
    }
  }

  hideLoadingIndicator() {
    const indicator = document.getElementById('loading-indicator')
    if (indicator) {
      indicator.style.display = 'none'
    }
  }

  showEndMessage() {
    const endMessage = document.getElementById('end-message')
    if (endMessage) {
      endMessage.style.display = 'block'
    }
  }

  handleError(error) {
    console.error('Infinite scroll error:', error)
    
    const errorMessage = document.getElementById('error-message')
    if (errorMessage) {
      errorMessage.textContent = `加载失败: ${error.message}`
      errorMessage.style.display = 'block'
      
      // 添加重试按钮
      const retryButton = document.createElement('button')
      retryButton.textContent = '重试'
      retryButton.onclick = () => {
        errorMessage.style.display = 'none'
        this.loadMore()
      }
      errorMessage.appendChild(retryButton)
    }
  }

  debounce(func, delay) {
    let timeoutId
    return function (...args) {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(this, args), delay)
    }
  }

  // 重置滚动状态
  reset() {
    this.loading = false
    this.hasMore = true
    this.page = 1
    this.items = []
    this.loadInitialData()
  }

  // 销毁实例
  destroy() {
    const container = this.options.container
    
    if (container === window) {
      window.removeEventListener('scroll', this.debouncedScrollHandler)
      window.removeEventListener('resize', this.debouncedScrollHandler)
    } else {
      container.removeEventListener('scroll', this.debouncedScrollHandler)
    }
  }
}

// React Hook 版本
function useInfiniteScroll(fetchFunction, options = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      setError(null)
      
      const data = await fetchFunction(page)
      
      if (data.items.length === 0) {
        setHasMore(false)
        return
      }
      
      setItems(prev => [...prev, ...data.items])
      setHasMore(data.hasMore)
      setPage(prev => prev + 1)
      
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, page, loading, hasMore])
  
  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
    setLoading(false)
  }, [])
  
  return {
    items,
    loading,
    hasMore,
    error,
    loadMore,
    reset
  }
}

// 使用示例
const infiniteScroll = new InfiniteScrollManager({
  container: document.getElementById('scroll-container'),
  threshold: 200
})
```

### 虚拟滚动实现

```javascript
// 虚拟滚动管理器
class VirtualScrollManager {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      itemHeight: 50, // 每个项目的高度
      bufferSize: 5,  // 缓冲区大小
      ...options
    }
    
    this.items = []
    this.visibleItems = []
    this.startIndex = 0
    this.endIndex = 0
    this.scrollTop = 0
    
    this.init()
  }

  init() {
    this.createElements()
    this.bindEvents()
    this.updateVisibleItems()
  }

  createElements() {
    // 创建滚动容器
    this.scrollContainer = document.createElement('div')
    this.scrollContainer.className = 'virtual-scroll-container'
    this.scrollContainer.style.cssText = `
      height: 100%;
      overflow-y: auto;
      position: relative;
    `
    
    // 创建内容容器
    this.contentContainer = document.createElement('div')
    this.contentContainer.className = 'virtual-scroll-content'
    this.contentContainer.style.cssText = `
      position: relative;
    `
    
    // 创建可见项目容器
    this.visibleContainer = document.createElement('div')
    this.visibleContainer.className = 'virtual-scroll-visible'
    this.visibleContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    `
    
    this.contentContainer.appendChild(this.visibleContainer)
    this.scrollContainer.appendChild(this.contentContainer)
    this.container.appendChild(this.scrollContainer)
  }

  bindEvents() {
    this.scrollContainer.addEventListener('scroll', () => {
      this.scrollTop = this.scrollContainer.scrollTop
      this.updateVisibleItems()
    })
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.updateVisibleItems()
    })
  }

  setItems(items) {
    this.items = items
    this.updateContentHeight()
    this.updateVisibleItems()
  }

  updateContentHeight() {
    const totalHeight = this.items.length * this.options.itemHeight
    this.contentContainer.style.height = `${totalHeight}px`
  }

  updateVisibleItems() {
    const containerHeight = this.scrollContainer.clientHeight
    const itemHeight = this.options.itemHeight
    const bufferSize = this.options.bufferSize
    
    // 计算可见范围
    const visibleStart = Math.floor(this.scrollTop / itemHeight)
    const visibleEnd = Math.min(
      this.items.length - 1,
      Math.ceil((this.scrollTop + containerHeight) / itemHeight)
    )
    
    // 添加缓冲区
    this.startIndex = Math.max(0, visibleStart - bufferSize)
    this.endIndex = Math.min(this.items.length - 1, visibleEnd + bufferSize)
    
    // 更新可见项目
    this.renderVisibleItems()
  }

  renderVisibleItems() {
    const fragment = document.createDocumentFragment()
    
    // 清空现有内容
    this.visibleContainer.innerHTML = ''
    
    // 渲染可见项目
    for (let i = this.startIndex; i <= this.endIndex; i++) {
      const item = this.items[i]
      if (!item) continue
      
      const element = this.createItemElement(item, i)
      fragment.appendChild(element)
    }
    
    this.visibleContainer.appendChild(fragment)
    
    // 设置容器位置
    const offsetY = this.startIndex * this.options.itemHeight
    this.visibleContainer.style.transform = `translateY(${offsetY}px)`
  }

  createItemElement(item, index) {
    const div = document.createElement('div')
    div.className = 'virtual-scroll-item'
    div.style.cssText = `
      height: ${this.options.itemHeight}px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      border-bottom: 1px solid #eee;
      box-sizing: border-box;
    `
    
    // 自定义渲染函数
    if (this.options.renderItem) {
      const content = this.options.renderItem(item, index)
      if (typeof content === 'string') {
        div.innerHTML = content
      } else {
        div.appendChild(content)
      }
    } else {
      div.textContent = item.toString()
    }
    
    return div
  }

  // 滚动到指定项目
  scrollToItem(index) {
    const targetScrollTop = index * this.options.itemHeight
    this.scrollContainer.scrollTop = targetScrollTop
  }

  // 获取当前可见项目
  getVisibleItems() {
    return this.items.slice(this.startIndex, this.endIndex + 1)
  }

  // 更新单个项目
  updateItem(index, newItem) {
    if (index >= 0 && index < this.items.length) {
      this.items[index] = newItem
      
      // 如果项目在可见范围内，重新渲染
      if (index >= this.startIndex && index <= this.endIndex) {
        this.renderVisibleItems()
      }
    }
  }

  // 添加项目
  addItem(item, index = this.items.length) {
    this.items.splice(index, 0, item)
    this.updateContentHeight()
    this.updateVisibleItems()
  }

  // 删除项目
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1)
      this.updateContentHeight()
      this.updateVisibleItems()
    }
  }

  // 销毁实例
  destroy() {
    if (this.container.contains(this.scrollContainer)) {
      this.container.removeChild(this.scrollContainer)
    }
  }
}

// React 虚拟滚动组件
const VirtualScrollList = ({ items, itemHeight = 50, height = 400, renderItem }) => {
  const containerRef = useRef()
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(height)
  
  const bufferSize = 5
  const totalHeight = items.length * itemHeight
  
  // 计算可见范围
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight)
  )
  
  const startIndex = Math.max(0, visibleStart - bufferSize)
  const endIndex = Math.min(items.length - 1, visibleEnd + bufferSize)
  
  const visibleItems = items.slice(startIndex, endIndex + 1)
  const offsetY = startIndex * itemHeight
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }
  
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }
    
    updateHeight()
    window.addEventListener('resize', updateHeight)
    
    return () => window.removeEventListener('resize', updateHeight)
  }, [])
  
  return (
    <div
      ref={containerRef}
      style={{
        height,
        overflowY: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index
            return (
              <div
                key={actualIndex}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                  borderBottom: '1px solid #eee',
                  boxSizing: 'border-box'
                }}
              >
                {renderItem ? renderItem(item, actualIndex) : item.toString()}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// 使用示例
const items = Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
  description: `Description for item ${i}`
}))

const virtualScroll = new VirtualScrollManager(
  document.getElementById('container'),
  {
    itemHeight: 60,
    renderItem: (item, index) => `
      <div>
        <strong>${item.name}</strong>
        <p>${item.description}</p>
      </div>
    `
  }
)

virtualScroll.setItems(items)
```

## 最佳实践

### 性能优化策略

```javascript
// 懒加载性能优化管理器
class LazyLoadingOptimizer {
  constructor() {
    this.performanceMetrics = new Map()
    this.loadingQueue = new Set()
    this.loadedResources = new Set()
    this.failedResources = new Set()
    
    this.setupPerformanceMonitoring()
  }

  setupPerformanceMonitoring() {
    // 监控 Core Web Vitals
    this.observeLCP()
    this.observeFID()
    this.observeCLS()
    this.observeResourceTiming()
  }

  observeLCP() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      this.performanceMetrics.set('LCP', {
        value: lastEntry.startTime,
        element: lastEntry.element,
        timestamp: Date.now()
      })
      
      console.log('LCP:', lastEntry.startTime)
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }

  observeFID() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach(entry => {
        this.performanceMetrics.set('FID', {
          value: entry.processingStart - entry.startTime,
          timestamp: Date.now()
        })
        
        console.log('FID:', entry.processingStart - entry.startTime)
      })
    }).observe({ entryTypes: ['first-input'] })
  }

  observeCLS() {
    let clsValue = 0
    
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })
      
      this.performanceMetrics.set('CLS', {
        value: clsValue,
        timestamp: Date.now()
      })
      
      console.log('CLS:', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  observeResourceTiming() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      
      entries.forEach(entry => {
        if (entry.initiatorType === 'img' || entry.initiatorType === 'script') {
          this.analyzeResourcePerformance(entry)
        }
      })
    }).observe({ entryTypes: ['resource'] })
  }

  analyzeResourcePerformance(entry) {
    const loadTime = entry.responseEnd - entry.startTime
    const isLazyLoaded = entry.name.includes('lazy') || 
                        this.loadingQueue.has(entry.name)
    
    if (isLazyLoaded) {
      console.log(`Lazy loaded resource: ${entry.name}, Load time: ${loadTime}ms`)
      
      // 记录懒加载性能
      this.performanceMetrics.set(`lazy-${entry.name}`, {
        loadTime,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        timestamp: Date.now()
      })
    }
  }

  // 智能预加载策略
  async intelligentPreload() {
    const networkInfo = this.getNetworkInfo()
    const deviceInfo = this.getDeviceInfo()
    const userBehavior = await this.analyzeUserBehavior()
    
    // 根据条件调整预加载策略
    if (networkInfo.effectiveType === '4g' && deviceInfo.memory >= 4) {
      // 高性能设备，积极预加载
      this.aggressivePreload(userBehavior.predictedResources)
    } else if (networkInfo.effectiveType === '3g') {
      // 中等性能，选择性预加载
      this.selectivePreload(userBehavior.highPriorityResources)
    } else {
      // 低性能设备，最小化预加载
      this.minimalPreload(userBehavior.criticalResources)
    }
  }

  async aggressivePreload(resources) {
    const batchSize = 3
    
    for (let i = 0; i < resources.length; i += batchSize) {
      const batch = resources.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(resource => this.preloadResource(resource))
      )
      
      // 批次间延迟，避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  async selectivePreload(resources) {
    // 串行预加载，减少并发压力
    for (const resource of resources) {
      try {
        await this.preloadResource(resource)
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.warn(`Preload failed for ${resource}:`, error)
      }
    }
  }

  async minimalPreload(resources) {
    // 只预加载最关键的资源
    const criticalResource = resources[0]
    if (criticalResource) {
      try {
        await this.preloadResource(criticalResource)
      } catch (error) {
        console.warn(`Critical preload failed:`, error)
      }
    }
  }

  async preloadResource(resource) {
    if (this.loadedResources.has(resource) || this.loadingQueue.has(resource)) {
      return
    }
    
    this.loadingQueue.add(resource)
    
    try {
      if (resource.endsWith('.jpg') || resource.endsWith('.png') || resource.endsWith('.webp')) {
        await this.preloadImage(resource)
      } else if (resource.endsWith('.js')) {
        await this.preloadScript(resource)
      } else if (resource.endsWith('.css')) {
        await this.preloadStylesheet(resource)
      }
      
      this.loadedResources.add(resource)
    } catch (error) {
      this.failedResources.add(resource)
      throw error
    } finally {
      this.loadingQueue.delete(resource)
    }
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = src
    })
  }

  preloadScript(src) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'modulepreload'
      link.href = src
      link.onload = resolve
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  preloadStylesheet(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      link.onload = resolve
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    
    return {
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
      saveData: connection?.saveData || false
    }
  }

  getDeviceInfo() {
    return {
      memory: navigator.deviceMemory || 4,
      cores: navigator.hardwareConcurrency || 4,
      isMobile: /Mobi|Android/i.test(navigator.userAgent)
    }
  }

  async analyzeUserBehavior() {
    // 分析用户行为模式
    const scrollDepth = this.getScrollDepth()
    const timeOnPage = Date.now() - (window.pageStartTime || Date.now())
    const clickPattern = this.getClickPattern()
    
    return {
      predictedResources: this.predictNextResources(scrollDepth, timeOnPage),
      highPriorityResources: this.getHighPriorityResources(clickPattern),
      criticalResources: this.getCriticalResources()
    }
  }

  predictNextResources(scrollDepth, timeOnPage) {
    // 基于滚动深度和停留时间预测下一步需要的资源
    const predictions = []
    
    if (scrollDepth > 50) {
      predictions.push('/images/below-fold-1.jpg', '/images/below-fold-2.jpg')
    }
    
    if (timeOnPage > 30000) { // 30秒
      predictions.push('/js/engagement-features.js')
    }
    
    return predictions
  }

  getHighPriorityResources(clickPattern) {
    // 基于点击模式确定高优先级资源
    const highPriority = []
    
    if (clickPattern.includes('product-link')) {
      highPriority.push('/js/product-detail.js', '/css/product-detail.css')
    }
    
    if (clickPattern.includes('cart-button')) {
      highPriority.push('/js/shopping-cart.js')
    }
    
    return highPriority
  }

  getCriticalResources() {
    // 关键资源列表
    return ['/js/critical-features.js', '/css/critical-styles.css']
  }

  getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight
    return Math.round((scrollTop / documentHeight) * 100)
  }

  getClickPattern() {
    // 从本地存储或分析工具获取点击模式
    return JSON.parse(localStorage.getItem('clickPattern') || '[]')
  }

  // 生成性能报告
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.performanceMetrics),
      loadedResources: Array.from(this.loadedResources),
      failedResources: Array.from(this.failedResources),
      recommendations: this.generateRecommendations()
    }
    
    console.log('Lazy Loading Performance Report:', report)
    return report
  }

  generateRecommendations() {
    const recommendations = []
    
    const lcp = this.performanceMetrics.get('LCP')
    if (lcp && lcp.value > 2500) {
      recommendations.push('考虑优化 LCP 元素的加载策略')
    }
    
    const cls = this.performanceMetrics.get('CLS')
    if (cls && cls.value > 0.1) {
      recommendations.push('减少布局偏移，为懒加载内容预留空间')
    }
    
    if (this.failedResources.size > 0) {
      recommendations.push('检查失败的资源加载，考虑添加重试机制')
    }
    
    return recommendations
  }
}

// 使用示例
const optimizer = new LazyLoadingOptimizer()
optimizer.intelligentPreload()

// 定期生成性能报告
setInterval(() => {
  optimizer.generatePerformanceReport()
}, 30000) // 每30秒生成一次报告
```

### 错误处理和降级策略

```javascript
// 懒加载错误处理管理器
class LazyLoadingErrorHandler {
  constructor() {
    this.retryAttempts = new Map()
    this.fallbackStrategies = new Map()
    this.errorCallbacks = new Map()
    
    this.setupGlobalErrorHandling()
  }

  setupGlobalErrorHandling() {
     // 捕获图片加载错误
     document.addEventListener('error', (event) => {
       if (event.target.tagName === 'IMG') {
         this.handleImageError(event.target)
       }
     }, true)

     // 捕获脚本加载错误
     document.addEventListener('error', (event) => {
       if (event.target.tagName === 'SCRIPT') {
         this.handleScriptError(event.target)
       }
     }, true)

     // 捕获未处理的 Promise 拒绝
     window.addEventListener('unhandledrejection', (event) => {
       this.handlePromiseRejection(event)
     })
   }

   async handleImageError(img) {
     const src = img.src || img.dataset.src
     const retryCount = this.retryAttempts.get(src) || 0
     const maxRetries = 3

     if (retryCount < maxRetries) {
       // 重试加载
       this.retryAttempts.set(src, retryCount + 1)
       
       try {
         await this.retryImageLoad(img, src)
       } catch (error) {
         console.warn(`Image retry ${retryCount + 1} failed for ${src}:`, error)
         
         if (retryCount + 1 >= maxRetries) {
           this.applyFallbackStrategy(img, 'image')
         }
       }
     } else {
       this.applyFallbackStrategy(img, 'image')
     }
   }

   async retryImageLoad(img, src) {
     return new Promise((resolve, reject) => {
       const retryImg = new Image()
       
       retryImg.onload = () => {
         img.src = src
         resolve()
       }
       
       retryImg.onerror = reject
       
       // 添加随机延迟避免同时重试
       setTimeout(() => {
         retryImg.src = src + '?retry=' + Date.now()
       }, Math.random() * 1000 + 500)
     })
   }

   handleScriptError(script) {
     const src = script.src
     const retryCount = this.retryAttempts.get(src) || 0
     const maxRetries = 2

     if (retryCount < maxRetries) {
       this.retryAttempts.set(src, retryCount + 1)
       this.retryScriptLoad(script, src)
     } else {
       this.applyFallbackStrategy(script, 'script')
     }
   }

   retryScriptLoad(originalScript, src) {
     const newScript = document.createElement('script')
     newScript.src = src + '?retry=' + Date.now()
     newScript.async = originalScript.async
     newScript.defer = originalScript.defer
     
     newScript.onload = () => {
       console.log(`Script retry successful: ${src}`)
     }
     
     newScript.onerror = () => {
       this.handleScriptError(newScript)
     }
     
     document.head.appendChild(newScript)
   }

   handlePromiseRejection(event) {
     const error = event.reason
     
     // 检查是否是懒加载相关的错误
     if (error && error.message && error.message.includes('lazy')) {
       console.error('Lazy loading promise rejection:', error)
       
       // 触发错误回调
       const callback = this.errorCallbacks.get('promise')
       if (callback) {
         callback(error)
       }
     }
   }

   applyFallbackStrategy(element, type) {
     const fallbackStrategy = this.fallbackStrategies.get(type)
     
     if (fallbackStrategy) {
       fallbackStrategy(element)
     } else {
       this.defaultFallback(element, type)
     }
   }

   defaultFallback(element, type) {
     switch (type) {
       case 'image':
         element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+'
         element.alt = 'Image not available'
         break
       case 'script':
         console.warn('Script fallback not implemented for:', element.src)
         break
       default:
         console.warn('Unknown fallback type:', type)
     }
   }

   // 注册自定义降级策略
   registerFallbackStrategy(type, strategy) {
     this.fallbackStrategies.set(type, strategy)
   }

   // 注册错误回调
   registerErrorCallback(type, callback) {
     this.errorCallbacks.set(type, callback)
   }

   // 网络状态检测
   checkNetworkStatus() {
     const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
     
     if (connection) {
       return {
         online: navigator.onLine,
         effectiveType: connection.effectiveType,
         downlink: connection.downlink,
         rtt: connection.rtt,
         saveData: connection.saveData
       }
     }
     
     return {
       online: navigator.onLine,
       effectiveType: 'unknown',
       downlink: null,
       rtt: null,
       saveData: false
     }
   }

   // 自适应加载策略
   getAdaptiveLoadingStrategy() {
     const networkStatus = this.checkNetworkStatus()
     
     if (!networkStatus.online) {
       return 'offline'
     }
     
     if (networkStatus.saveData) {
       return 'minimal'
     }
     
     switch (networkStatus.effectiveType) {
       case 'slow-2g':
       case '2g':
         return 'conservative'
       case '3g':
         return 'balanced'
       case '4g':
         return 'aggressive'
       default:
         return 'balanced'
     }
   }

   // 应用自适应策略
   applyAdaptiveStrategy(strategy) {
     switch (strategy) {
       case 'offline':
         // 离线模式：只加载缓存的资源
         this.enableOfflineMode()
         break
       case 'minimal':
         // 最小化模式：只加载关键资源
         this.enableMinimalMode()
         break
       case 'conservative':
         // 保守模式：减少并发，增加延迟
         this.enableConservativeMode()
         break
       case 'balanced':
         // 平衡模式：默认设置
         this.enableBalancedMode()
         break
       case 'aggressive':
         // 激进模式：最大化并发和预加载
         this.enableAggressiveMode()
         break
     }
   }

   enableOfflineMode() {
     console.log('Enabling offline mode')
     // 实现离线模式逻辑
   }

   enableMinimalMode() {
     console.log('Enabling minimal mode')
     // 实现最小化模式逻辑
   }

   enableConservativeMode() {
     console.log('Enabling conservative mode')
     // 实现保守模式逻辑
   }

   enableBalancedMode() {
     console.log('Enabling balanced mode')
     // 实现平衡模式逻辑
   }

   enableAggressiveMode() {
     console.log('Enabling aggressive mode')
     // 实现激进模式逻辑
   }
 }

 // 使用示例
 const errorHandler = new LazyLoadingErrorHandler()

 // 注册自定义降级策略
 errorHandler.registerFallbackStrategy('image', (img) => {
   img.src = '/images/placeholder.jpg'
   img.classList.add('fallback-image')
 })

 // 注册错误回调
 errorHandler.registerErrorCallback('promise', (error) => {
   // 发送错误报告到监控系统
   console.error('Lazy loading error:', error)
 })

 // 应用自适应策略
 const strategy = errorHandler.getAdaptiveLoadingStrategy()
 errorHandler.applyAdaptiveStrategy(strategy)
 ```

 ## 高级技术

 ### Service Worker 缓存策略

 ```javascript
 // Service Worker 懒加载缓存策略
 class LazyLoadingServiceWorker {
   constructor() {
     this.cacheName = 'lazy-loading-cache-v1'
     this.imageCache = 'lazy-images-cache-v1'
     this.scriptCache = 'lazy-scripts-cache-v1'
     
     this.setupServiceWorker()
   }

   async setupServiceWorker() {
     if ('serviceWorker' in navigator) {
       try {
         const registration = await navigator.serviceWorker.register('/sw-lazy-loading.js')
         console.log('Lazy loading service worker registered:', registration)
         
         // 监听消息
         navigator.serviceWorker.addEventListener('message', this.handleMessage.bind(this))
         
       } catch (error) {
         console.error('Service worker registration failed:', error)
       }
     }
   }

   handleMessage(event) {
     const { type, data } = event.data
     
     switch (type) {
       case 'CACHE_UPDATED':
         console.log('Cache updated:', data)
         break
       case 'CACHE_ERROR':
         console.error('Cache error:', data)
         break
     }
   }

   // 预缓存关键资源
   async precacheResources(resources) {
     if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
       navigator.serviceWorker.controller.postMessage({
         type: 'PRECACHE_RESOURCES',
         resources
       })
     }
   }

   // 清理过期缓存
   async cleanupCache() {
     if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
       navigator.serviceWorker.controller.postMessage({
         type: 'CLEANUP_CACHE'
       })
     }
   }
 }

 // Service Worker 脚本 (sw-lazy-loading.js)
 const SW_LAZY_LOADING_SCRIPT = `
 const CACHE_NAME = 'lazy-loading-cache-v1'
 const IMAGE_CACHE = 'lazy-images-cache-v1'
 const SCRIPT_CACHE = 'lazy-scripts-cache-v1'

 // 安装事件
 self.addEventListener('install', (event) => {
   event.waitUntil(
     caches.open(CACHE_NAME).then((cache) => {
       console.log('Lazy loading cache opened')
       return cache
     })
   )
 })

 // 激活事件
 self.addEventListener('activate', (event) => {
   event.waitUntil(
     caches.keys().then((cacheNames) => {
       return Promise.all(
         cacheNames.map((cacheName) => {
           if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE && cacheName !== SCRIPT_CACHE) {
             console.log('Deleting old cache:', cacheName)
             return caches.delete(cacheName)
           }
         })
       )
     })
   )
 })

 // 拦截请求
 self.addEventListener('fetch', (event) => {
   const { request } = event
   const url = new URL(request.url)
   
   // 处理图片请求
   if (request.destination === 'image') {
     event.respondWith(handleImageRequest(request))
   }
   // 处理脚本请求
   else if (request.destination === 'script') {
     event.respondWith(handleScriptRequest(request))
   }
   // 其他请求使用默认策略
   else {
     event.respondWith(handleDefaultRequest(request))
   }
 })

 // 处理图片请求
 async function handleImageRequest(request) {
   const cache = await caches.open(IMAGE_CACHE)
   const cachedResponse = await cache.match(request)
   
   if (cachedResponse) {
     return cachedResponse
   }
   
   try {
     const response = await fetch(request)
     
     if (response.ok) {
       cache.put(request, response.clone())
     }
     
     return response
   } catch (error) {
     console.error('Image fetch failed:', error)
     
     // 返回占位符图片
     return new Response(
       '<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f5f5f5"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">Image Not Available</text></svg>',
       {
         headers: {
           'Content-Type': 'image/svg+xml',
           'Cache-Control': 'no-cache'
         }
       }
     )
   }
 }

 // 处理脚本请求
 async function handleScriptRequest(request) {
   const cache = await caches.open(SCRIPT_CACHE)
   const cachedResponse = await cache.match(request)
   
   if (cachedResponse) {
     return cachedResponse
   }
   
   try {
     const response = await fetch(request)
     
     if (response.ok) {
       cache.put(request, response.clone())
     }
     
     return response
   } catch (error) {
     console.error('Script fetch failed:', error)
     throw error
   }
 }

 // 处理默认请求
 async function handleDefaultRequest(request) {
   const cache = await caches.open(CACHE_NAME)
   const cachedResponse = await cache.match(request)
   
   if (cachedResponse) {
     return cachedResponse
   }
   
   const response = await fetch(request)
   
   if (response.ok) {
     cache.put(request, response.clone())
   }
   
   return response
 }

 // 监听消息
 self.addEventListener('message', (event) => {
   const { type, resources } = event.data
   
   switch (type) {
     case 'PRECACHE_RESOURCES':
       precacheResources(resources)
       break
     case 'CLEANUP_CACHE':
       cleanupCache()
       break
   }
 })

 // 预缓存资源
 async function precacheResources(resources) {
   try {
     const cache = await caches.open(CACHE_NAME)
     await cache.addAll(resources)
     
     self.clients.matchAll().then((clients) => {
       clients.forEach((client) => {
         client.postMessage({
           type: 'CACHE_UPDATED',
           data: { resources, count: resources.length }
         })
       })
     })
   } catch (error) {
     self.clients.matchAll().then((clients) => {
       clients.forEach((client) => {
         client.postMessage({
           type: 'CACHE_ERROR',
           data: error.message
         })
       })
     })
   }
 }

 // 清理缓存
 async function cleanupCache() {
   const cacheNames = await caches.keys()
   
   for (const cacheName of cacheNames) {
     const cache = await caches.open(cacheName)
     const requests = await cache.keys()
     
     for (const request of requests) {
       const response = await cache.match(request)
       const cacheDate = new Date(response.headers.get('date'))
       const now = new Date()
       const daysDiff = (now - cacheDate) / (1000 * 60 * 60 * 24)
       
       // 删除超过7天的缓存
       if (daysDiff > 7) {
         await cache.delete(request)
       }
     }
   }
 }
 `

 // 使用示例
 const swLazyLoading = new LazyLoadingServiceWorker()

 // 预缓存关键资源
 swLazyLoading.precacheResources([
   '/images/hero-image.jpg',
   '/js/critical-features.js',
   '/css/critical-styles.css'
 ])
 ```

 ### Web Workers 并行处理

 ```javascript
 // Web Worker 并行图片处理
 class LazyLoadingWebWorker {
   constructor() {
     this.workers = []
     this.workerCount = navigator.hardwareConcurrency || 4
     this.taskQueue = []
     this.processingTasks = new Set()
     
     this.initWorkers()
   }

   initWorkers() {
     for (let i = 0; i < this.workerCount; i++) {
       const worker = new Worker('/workers/image-processor.js')
       
       worker.onmessage = (event) => {
         this.handleWorkerMessage(event, i)
       }
       
       worker.onerror = (error) => {
         console.error(`Worker ${i} error:`, error)
       }
       
       this.workers.push({
         worker,
         busy: false,
         id: i
       })
     }
   }

   handleWorkerMessage(event, workerId) {
     const { taskId, result, error } = event.data
     const workerInfo = this.workers[workerId]
     
     workerInfo.busy = false
     this.processingTasks.delete(taskId)
     
     if (error) {
       console.error(`Task ${taskId} failed:`, error)
     } else {
       this.handleTaskResult(taskId, result)
     }
     
     // 处理队列中的下一个任务
     this.processNextTask()
   }

   handleTaskResult(taskId, result) {
     const { type, data } = result
     
     switch (type) {
       case 'IMAGE_OPTIMIZED':
         this.applyOptimizedImage(data)
         break
       case 'IMAGE_RESIZED':
         this.applyResizedImage(data)
         break
       case 'IMAGE_COMPRESSED':
         this.applyCompressedImage(data)
         break
     }
   }

   // 添加图片处理任务
   addImageTask(imageElement, options = {}) {
     const taskId = `task_${Date.now()}_${Math.random()}`
     
     const task = {
       id: taskId,
       type: 'PROCESS_IMAGE',
       data: {
         src: imageElement.src || imageElement.dataset.src,
         width: options.width || imageElement.width,
         height: options.height || imageElement.height,
         quality: options.quality || 0.8,
         format: options.format || 'webp',
         element: imageElement
       }
     }
     
     this.taskQueue.push(task)
     this.processNextTask()
     
     return taskId
   }

   processNextTask() {
     if (this.taskQueue.length === 0) return
     
     const availableWorker = this.workers.find(w => !w.busy)
     if (!availableWorker) return
     
     const task = this.taskQueue.shift()
     availableWorker.busy = true
     this.processingTasks.add(task.id)
     
     availableWorker.worker.postMessage(task)
   }

   applyOptimizedImage(data) {
     const { element, optimizedSrc } = data
     element.src = optimizedSrc
     element.classList.add('optimized')
   }

   applyResizedImage(data) {
     const { element, resizedSrc } = data
     element.src = resizedSrc
     element.classList.add('resized')
   }

   applyCompressedImage(data) {
     const { element, compressedSrc } = data
     element.src = compressedSrc
     element.classList.add('compressed')
   }

   // 销毁所有 Workers
   destroy() {
     this.workers.forEach(({ worker }) => {
       worker.terminate()
     })
     this.workers = []
   }
 }

 // Web Worker 脚本 (workers/image-processor.js)
 const IMAGE_PROCESSOR_WORKER_SCRIPT = `
 self.onmessage = async function(event) {
   const { id, type, data } = event.data
   
   try {
     let result
     
     switch (type) {
       case 'PROCESS_IMAGE':
         result = await processImage(data)
         break
       default:
         throw new Error('Unknown task type: ' + type)
     }
     
     self.postMessage({
       taskId: id,
       result
     })
   } catch (error) {
     self.postMessage({
       taskId: id,
       error: error.message
     })
   }
 }

 async function processImage(data) {
   const { src, width, height, quality, format } = data
   
   // 加载图片
   const response = await fetch(src)
   const blob = await response.blob()
   
   // 创建 ImageBitmap
   const imageBitmap = await createImageBitmap(blob)
   
   // 创建 OffscreenCanvas
   const canvas = new OffscreenCanvas(width, height)
   const ctx = canvas.getContext('2d')
   
   // 绘制并调整大小
   ctx.drawImage(imageBitmap, 0, 0, width, height)
   
   // 转换为指定格式
   const outputBlob = await canvas.convertToBlob({
     type: \`image/\${format}\`,
     quality
   })
   
   // 创建 Object URL
   const optimizedSrc = URL.createObjectURL(outputBlob)
   
   return {
     type: 'IMAGE_OPTIMIZED',
     data: {
       element: data.element,
       optimizedSrc,
       originalSize: blob.size,
       optimizedSize: outputBlob.size,
       compressionRatio: (1 - outputBlob.size / blob.size) * 100
     }
   }
 }
 `

 // 使用示例
 const webWorkerProcessor = new LazyLoadingWebWorker()

 // 处理图片
 const images = document.querySelectorAll('img[data-src]')
 images.forEach(img => {
   webWorkerProcessor.addImageTask(img, {
     width: 800,
     height: 600,
     quality: 0.8,
     format: 'webp'
   })
 })
 ```

 ## 实际应用案例

 ### 电商网站优化案例

 ```javascript
 // 电商网站懒加载优化方案
 class EcommerceLazyLoading {
   constructor() {
     this.productImageLoader = null
     this.categoryLoader = null
     this.reviewLoader = null
     this.recommendationLoader = null
     
     this.userBehaviorTracker = new UserBehaviorTracker()
     this.performanceMonitor = new PerformanceMonitor()
     
     this.init()
   }

   init() {
     this.setupProductImageLoading()
     this.setupCategoryLoading()
     this.setupReviewLoading()
     this.setupRecommendationLoading()
     this.setupUserBehaviorTracking()
   }

   setupProductImageLoading() {
     this.productImageLoader = new LazyImageLoader({
       rootMargin: '100px 0px',
       threshold: 0.1
     })
     
     // 产品图片优先级策略
     const productImages = document.querySelectorAll('.product-image')
     
     productImages.forEach((img, index) => {
       // 首屏产品图片立即加载
       if (index < 6) {
         img.loading = 'eager'
         this.loadProductImage(img)
       } else {
         // 其他图片懒加载
         img.loading = 'lazy'
         this.productImageLoader.observe(img)
       }
     })
   }

   async loadProductImage(img) {
     const productId = img.dataset.productId
     const sizes = ['small', 'medium', 'large']
     
     try {
       // 渐进式加载：先加载小图，再加载大图
       for (const size of sizes) {
         const src = this.getProductImageUrl(productId, size)
         
         if (size === 'small') {
           img.src = src
           img.classList.add('loading-small')
         } else if (size === 'large') {
           // 预加载大图
           await this.preloadImage(src)
           img.src = src
           img.classList.remove('loading-small')
           img.classList.add('loaded-large')
         }
       }
     } catch (error) {
       console.error('Product image loading failed:', error)
       this.handleProductImageError(img)
     }
   }

   getProductImageUrl(productId, size) {
     return `/api/products/${productId}/images/${size}.webp`
   }

   handleProductImageError(img) {
     img.src = '/images/product-placeholder.svg'
     img.classList.add('error')
   }

   setupCategoryLoading() {
     this.categoryLoader = new InfiniteScrollManager({
       container: document.querySelector('.category-container'),
       threshold: 200,
       debounceDelay: 150
     })
     
     // 重写 fetchData 方法
     this.categoryLoader.fetchData = async (page) => {
       const categoryId = this.getCurrentCategoryId()
       const filters = this.getCurrentFilters()
       
       const response = await fetch(`/api/categories/${categoryId}/products`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           page,
           limit: 20,
           filters,
           sort: this.getCurrentSort()
         })
       })
       
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`)
       }
       
       const data = await response.json()
       
       // 预加载下一页的关键图片
       this.preloadNextPageImages(data.items)
       
       return data
     }
   }

   async preloadNextPageImages(products) {
     const preloadPromises = products.slice(0, 3).map(product => {
       const imageUrl = this.getProductImageUrl(product.id, 'small')
       return this.preloadImage(imageUrl)
     })
     
     try {
       await Promise.allSettled(preloadPromises)
     } catch (error) {
       console.warn('Next page image preload failed:', error)
     }
   }

   setupReviewLoading() {
     this.reviewLoader = new ConditionalLoader({
       trigger: '.reviews-tab',
       container: '.reviews-container',
       loadFunction: this.loadProductReviews.bind(this)
     })
   }

   async loadProductReviews(productId) {
     try {
       const response = await fetch(`/api/products/${productId}/reviews?limit=10`)
       const reviews = await response.json()
       
       this.renderReviews(reviews)
       
       // 懒加载评论图片
       const reviewImages = document.querySelectorAll('.review-image')
       reviewImages.forEach(img => {
         this.productImageLoader.observe(img)
       })
       
     } catch (error) {
       console.error('Reviews loading failed:', error)
     }
   }

   setupRecommendationLoading() {
     this.recommendationLoader = new ViewportLazyLoader({
       selector: '.recommendations-section',
       threshold: 0.2,
       loadFunction: this.loadRecommendations.bind(this)
     })
   }

   async loadRecommendations() {
     const userId = this.getCurrentUserId()
     const productId = this.getCurrentProductId()
     const viewHistory = this.userBehaviorTracker.getViewHistory()
     
     try {
       const response = await fetch('/api/recommendations', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           userId,
           productId,
           viewHistory: viewHistory.slice(-10), // 最近10个浏览记录
           limit: 8
         })
       })
       
       const recommendations = await response.json()
       this.renderRecommendations(recommendations)
       
     } catch (error) {
       console.error('Recommendations loading failed:', error)
     }
   }

   setupUserBehaviorTracking() {
     // 跟踪用户行为以优化懒加载策略
     this.userBehaviorTracker.on('productView', (productId) => {
       this.preloadRelatedProducts(productId)
     })
     
     this.userBehaviorTracker.on('categoryChange', (categoryId) => {
       this.preloadCategoryImages(categoryId)
     })
     
     this.userBehaviorTracker.on('searchQuery', (query) => {
       this.preloadSearchResults(query)
     })
   }

   async preloadRelatedProducts(productId) {
     try {
       const response = await fetch(`/api/products/${productId}/related?limit=4`)
       const relatedProducts = await response.json()
       
       const preloadPromises = relatedProducts.map(product => {
         const imageUrl = this.getProductImageUrl(product.id, 'small')
         return this.preloadImage(imageUrl)
       })
       
       await Promise.allSettled(preloadPromises)
     } catch (error) {
       console.warn('Related products preload failed:', error)
     }
   }

   // 性能监控和优化
   startPerformanceMonitoring() {
     this.performanceMonitor.track('imageLoadTime', (duration, element) => {
       if (duration > 2000) {
         console.warn('Slow image loading detected:', element.src, duration + 'ms')
       }
     })
     
     this.performanceMonitor.track('scrollPerformance', (fps) => {
       if (fps < 30) {
         console.warn('Poor scroll performance detected:', fps + 'fps')
         this.optimizeScrollPerformance()
       }
     })
   }

   optimizeScrollPerformance() {
     // 减少并发加载数量
     this.productImageLoader.options.threshold = 0.05
     this.categoryLoader.options.debounceDelay = 200
     
     // 暂停非关键资源加载
     this.recommendationLoader.pause()
     
     setTimeout(() => {
       this.recommendationLoader.resume()
     }, 2000)
   }

   // 获取当前状态的辅助方法
   getCurrentCategoryId() {
     return document.querySelector('[data-category-id]')?.dataset.categoryId
   }

   getCurrentProductId() {
     return document.querySelector('[data-product-id]')?.dataset.productId
   }

   getCurrentUserId() {
     return localStorage.getItem('userId')
   }

   getCurrentFilters() {
     const filterElements = document.querySelectorAll('.filter-active')
     return Array.from(filterElements).map(el => ({
       type: el.dataset.filterType,
       value: el.dataset.filterValue
     }))
   }

   getCurrentSort() {
     const sortElement = document.querySelector('.sort-active')
     return sortElement?.dataset.sortValue || 'relevance'
   }

   preloadImage(src) {
     return new Promise((resolve, reject) => {
       const img = new Image()
       img.onload = resolve
       img.onerror = reject
       img.src = src
     })
   }

   renderReviews(reviews) {
     const container = document.querySelector('.reviews-container')
     container.innerHTML = reviews.map(review => `
       <div class="review">
         <div class="review-header">
           <span class="review-author">${review.author}</span>
           <span class="review-rating">${'★'.repeat(review.rating)}</span>
         </div>
         <p class="review-content">${review.content}</p>
         ${review.images ? review.images.map(img => 
           `<img class="review-image" data-src="${img}" loading="lazy" alt="Review image" />`
         ).join('') : ''}
       </div>
     `).join('')
   }

   renderRecommendations(recommendations) {
     const container = document.querySelector('.recommendations-container')
     container.innerHTML = recommendations.map(product => `
       <div class="recommendation-item" data-product-id="${product.id}">
         <img class="product-image" data-src="${this.getProductImageUrl(product.id, 'medium')}" loading="lazy" alt="${product.name}" />
         <h3>${product.name}</h3>
         <p class="price">$${product.price}</p>
       </div>
     `).join('')
   }
 }

 // 用户行为跟踪器
 class UserBehaviorTracker {
   constructor() {
     this.events = new Map()
     this.viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]')
     this.setupTracking()
   }

   setupTracking() {
     // 跟踪产品浏览
     document.addEventListener('click', (event) => {
       const productLink = event.target.closest('[data-product-id]')
       if (productLink) {
         const productId = productLink.dataset.productId
         this.trackProductView(productId)
       }
     })
     
     // 跟踪分类切换
     document.addEventListener('click', (event) => {
       const categoryLink = event.target.closest('[data-category-id]')
       if (categoryLink) {
         const categoryId = categoryLink.dataset.categoryId
         this.trackCategoryChange(categoryId)
       }
     })
   }

   trackProductView(productId) {
     this.viewHistory.unshift(productId)
     this.viewHistory = this.viewHistory.slice(0, 50) // 保留最近50个
     localStorage.setItem('viewHistory', JSON.stringify(this.viewHistory))
     
     this.emit('productView', productId)
   }

   trackCategoryChange(categoryId) {
     this.emit('categoryChange', categoryId)
   }

   getViewHistory() {
     return this.viewHistory
   }

   on(event, callback) {
     if (!this.events.has(event)) {
       this.events.set(event, [])
     }
     this.events.get(event).push(callback)
   }

   emit(event, data) {
     const callbacks = this.events.get(event) || []
     callbacks.forEach(callback => callback(data))
   }
 }

 // 性能监控器
 class PerformanceMonitor {
   constructor() {
     this.metrics = new Map()
     this.observers = new Map()
   }

   track(metricName, callback) {
     this.observers.set(metricName, callback)
     
     switch (metricName) {
       case 'imageLoadTime':
         this.trackImageLoadTime()
         break
       case 'scrollPerformance':
         this.trackScrollPerformance()
         break
     }
   }

   trackImageLoadTime() {
     const observer = new PerformanceObserver((entryList) => {
       const entries = entryList.getEntries()
       
       entries.forEach(entry => {
         if (entry.initiatorType === 'img') {
           const duration = entry.responseEnd - entry.startTime
           const callback = this.observers.get('imageLoadTime')
           
           if (callback) {
             const element = document.querySelector(`img[src="${entry.name}"]`)
             callback(duration, element)
           }
         }
       })
     })
     
     observer.observe({ entryTypes: ['resource'] })
   }

   trackScrollPerformance() {
     let lastTime = performance.now()
     let frameCount = 0
     
     const measureFPS = () => {
       frameCount++
       const currentTime = performance.now()
       
       if (currentTime - lastTime >= 1000) {
         const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
         const callback = this.observers.get('scrollPerformance')
         
         if (callback) {
           callback(fps)
         }
         
         frameCount = 0
         lastTime = currentTime
       }
       
       requestAnimationFrame(measureFPS)
     }
     
     requestAnimationFrame(measureFPS)
   }
 }

 // 使用示例
 const ecommerceLazyLoading = new EcommerceLazyLoading()
 ecommerceLazyLoading.startPerformanceMonitoring()
 ```

 ## 故障排除

 ### 常见问题和解决方案

 ```javascript
 // 懒加载故障排除工具
 class LazyLoadingDebugger {
   constructor() {
     this.issues = []
     this.solutions = new Map()
     this.setupCommonSolutions()
   }

   setupCommonSolutions() {
     this.solutions.set('INTERSECTION_OBSERVER_NOT_SUPPORTED', {
       description: 'Intersection Observer API 不支持',
       solution: '使用 polyfill 或降级到滚动事件监听',
       code: `
         if (!('IntersectionObserver' in window)) {
           // 加载 polyfill
           import('intersection-observer')
           // 或使用滚动事件降级
           this.useScrollFallback()
         }
       `
     })
     
     this.solutions.set('IMAGES_NOT_LOADING', {
       description: '图片无法加载',
       solution: '检查图片路径、网络连接和 CORS 设置',
       code: `
         // 添加错误处理
         img.onerror = () => {
           console.error('Image failed to load:', img.src)
           img.src = '/images/fallback.jpg'
         }
       `
     })
     
     this.solutions.set('LAYOUT_SHIFT', {
       description: '布局偏移问题',
       solution: '为懒加载元素预设尺寸',
       code: `
         // CSS 解决方案
         .lazy-image {
           width: 100%;
           height: 200px; /* 预设高度 */
           object-fit: cover;
         }
         
         // 或使用 aspect-ratio
         .lazy-image {
           aspect-ratio: 16/9;
         }
       `
     })
     
     this.solutions.set('PERFORMANCE_ISSUES', {
       description: '性能问题',
       solution: '优化加载策略和减少并发请求',
       code: `
         // 限制并发加载数量
         const loadingQueue = new Set()
         const MAX_CONCURRENT = 3
         
         function loadImage(img) {
           if (loadingQueue.size >= MAX_CONCURRENT) {
             setTimeout(() => loadImage(img), 100)
             return
           }
           
           loadingQueue.add(img)
           // 加载逻辑...
         }
       `
     })
   }

   // 诊断懒加载问题
   diagnose() {
     this.issues = []
     
     this.checkBrowserSupport()
     this.checkImageElements()
     this.checkNetworkConditions()
     this.checkPerformanceMetrics()
     this.checkLayoutStability()
     
     return this.generateReport()
   }

   checkBrowserSupport() {
     if (!('IntersectionObserver' in window)) {
       this.issues.push({
         type: 'INTERSECTION_OBSERVER_NOT_SUPPORTED',
         severity: 'high',
         element: null,
         message: 'Intersection Observer API 不支持'
       })
     }
     
     if (!('loading' in HTMLImageElement.prototype)) {
       this.issues.push({
         type: 'NATIVE_LAZY_LOADING_NOT_SUPPORTED',
         severity: 'medium',
         element: null,
         message: '原生懒加载不支持'
       })
     }
   }

   checkImageElements() {
     const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]')
     
     lazyImages.forEach(img => {
       // 检查图片路径
       const src = img.src || img.dataset.src
       if (!src) {
         this.issues.push({
           type: 'MISSING_IMAGE_SRC',
           severity: 'high',
           element: img,
           message: '图片缺少 src 或 data-src 属性'
         })
       }
       
       // 检查图片尺寸
       if (!img.width && !img.height && !img.style.width && !img.style.height) {
         this.issues.push({
           type: 'MISSING_IMAGE_DIMENSIONS',
           severity: 'medium',
           element: img,
           message: '图片缺少尺寸设置，可能导致布局偏移'
         })
       }
       
       // 检查 alt 属性
       if (!img.alt) {
         this.issues.push({
           type: 'MISSING_ALT_TEXT',
           severity: 'low',
           element: img,
           message: '图片缺少 alt 属性'
         })
       }
     })
   }

   checkNetworkConditions() {
     const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
     
     if (connection) {
       if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
         this.issues.push({
           type: 'SLOW_NETWORK',
           severity: 'medium',
           element: null,
           message: '网络连接较慢，建议优化加载策略'
         })
       }
       
       if (connection.saveData) {
         this.issues.push({
           type: 'DATA_SAVER_MODE',
           severity: 'low',
           element: null,
           message: '用户开启了数据节省模式'
         })
       }
     }
   }

   checkPerformanceMetrics() {
     // 检查 LCP
     new PerformanceObserver((entryList) => {
       const entries = entryList.getEntries()
       const lastEntry = entries[entries.length - 1]
       
       if (lastEntry.startTime > 2500) {
         this.issues.push({
           type: 'POOR_LCP',
           severity: 'high',
           element: lastEntry.element,
           message: `LCP 时间过长: ${lastEntry.startTime}ms`
         })
       }
     }).observe({ entryTypes: ['largest-contentful-paint'] })
     
     // 检查 CLS
     let clsValue = 0
     new PerformanceObserver((entryList) => {
       const entries = entryList.getEntries()
       
       entries.forEach(entry => {
         if (!entry.hadRecentInput) {
           clsValue += entry.value
         }
       })
       
       if (clsValue > 0.1) {
         this.issues.push({
           type: 'LAYOUT_SHIFT',
           severity: 'high',
           element: null,
           message: `累积布局偏移过大: ${clsValue}`
         })
       }
     }).observe({ entryTypes: ['layout-shift'] })
   }

   checkLayoutStability() {
     const images = document.querySelectorAll('img')
     
     images.forEach(img => {
       if (img.complete && img.naturalHeight === 0) {
         this.issues.push({
           type: 'IMAGES_NOT_LOADING',
           severity: 'high',
           element: img,
           message: '图片加载失败'
         })
       }
     })
   }

   generateReport() {
     const report = {
       timestamp: new Date().toISOString(),
       totalIssues: this.issues.length,
       highSeverityIssues: this.issues.filter(issue => issue.severity === 'high').length,
       mediumSeverityIssues: this.issues.filter(issue => issue.severity === 'medium').length,
       lowSeverityIssues: this.issues.filter(issue => issue.severity === 'low').length,
       issues: this.issues,
       recommendations: this.generateRecommendations()
     }
     
     console.group('懒加载诊断报告')
     console.log('总问题数:', report.totalIssues)
     console.log('高严重性问题:', report.highSeverityIssues)
     console.log('中等严重性问题:', report.mediumSeverityIssues)
     console.log('低严重性问题:', report.lowSeverityIssues)
     
     if (report.issues.length > 0) {
       console.table(report.issues)
     }
     
     console.groupEnd()
     
     return report
   }

   generateRecommendations() {
     const recommendations = []
     const issueTypes = new Set(this.issues.map(issue => issue.type))
     
     issueTypes.forEach(type => {
       const solution = this.solutions.get(type)
       if (solution) {
         recommendations.push(solution)
       }
     })
     
     return recommendations
   }

   // 自动修复某些问题
   autoFix() {
     this.issues.forEach(issue => {
       switch (issue.type) {
         case 'MISSING_ALT_TEXT':
           if (issue.element) {
             issue.element.alt = '图片'
           }
           break
         case 'MISSING_IMAGE_DIMENSIONS':
           if (issue.element) {
             issue.element.style.aspectRatio = '16/9'
           }
           break
       }
     })
   }
 }

 // 使用示例
 const debugger = new LazyLoadingDebugger()
 const report = debugger.diagnose()

 // 自动修复可修复的问题
 debugger.autoFix()
 ```

 ## 参考资源

 ### 官方文档
- [Intersection Observer API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Loading attribute - MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-loading)
- [Web Vitals - Google](https://web.dev/vitals/)
- [Lazy loading - web.dev](https://web.dev/lazy-loading/)

### 工具推荐
- **LazySizes**: 功能丰富的懒加载库
- **Lozad.js**: 轻量级懒加载库
- **React.lazy**: React 官方懒加载方案
- **Vue 异步组件**: Vue 官方懒加载方案
- **Webpack Bundle Analyzer**: 分析打包结果
- **Lighthouse**: 性能审计工具

### 学习资源
- [Lazy Loading Images and Video - web.dev](https://web.dev/lazy-loading-images/)
- [The Complete Guide to Lazy Loading Images - CSS-Tricks](https://css-tricks.com/the-complete-guide-to-lazy-loading-images/)
- [Intersection Observer API Tutorial - JavaScript.info](https://javascript.info/intersection-observer)
- [React Code Splitting - React Docs](https://reactjs.org/docs/code-splitting.html)
- [Vue Async Components - Vue Docs](https://vuejs.org/guide/components/async.html)