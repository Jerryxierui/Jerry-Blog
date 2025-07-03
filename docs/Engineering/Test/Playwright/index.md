# Playwright 自动化测试
## 简介

Playwright 是由 Microsoft 开发的现代化端到端测试框架，支持多浏览器、多平台的自动化测试，提供了强大的 API 和优秀的开发体验。

### 核心特性
- **跨浏览器支持**：Chromium、Firefox、Safari 全覆盖
- **多平台兼容**：Windows、macOS、Linux 支持
- **自动等待**：智能等待元素和网络请求
- **并行执行**：高效的并行测试执行
- **强大调试**：时间旅行调试和追踪功能
- **移动测试**：移动设备模拟和测试
- **API 测试**：内置 HTTP 客户端支持

### 应用场景
- **端到端测试**：完整用户流程验证
- **跨浏览器测试**：确保多浏览器兼容性
- **API 测试**：后端接口自动化测试
- **性能测试**：页面加载和响应时间测试
- **视觉回归测试**：UI 变化检测
- **移动端测试**：响应式设计验证

## 安装与配置

### 项目初始化

```bash
# 创建新项目
npm init playwright@latest

# 或在现有项目中安装
npm install -D @playwright/test

# 安装浏览器
npx playwright install

# 安装特定浏览器
npx playwright install chromium firefox webkit
```

### 基础配置

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  // 测试目录
  testDir: './tests',
  
  // 全局设置
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // 报告配置
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  
  // 全局测试配置
  use: {
    baseURL: 'http://localhost:3000',
    
    // 浏览器配置
    headless: true,
    viewport: { width: 1280, height: 720 },
    
    // 调试配置
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 网络配置
    ignoreHTTPSErrors: true,
    
    // 超时配置
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // 多浏览器项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    
    // 移动设备测试
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    },
    
    // 平板设备测试
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] }
    }
  ],

  // 本地开发服务器
  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
```

## 基础测试语法

### 测试结构

```javascript
// tests/example.spec.js
const { test, expect } = require('@playwright/test')

test.describe('基础测试示例', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的准备工作
    await page.goto('/')
  })

  test('应该显示页面标题', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/我的应用/)
  })

  test('应该能够点击按钮', async ({ page }) => {
    // 点击按钮
    await page.click('[data-testid="submit-button"]')
    
    // 验证结果
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible()
  })

  test('应该能够填写表单', async ({ page }) => {
    // 填写表单
    await page.fill('[data-testid="name-input"]', '测试用户')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    
    // 选择下拉框
    await page.selectOption('[data-testid="country-select"]', 'CN')
    
    // 勾选复选框
    await page.check('[data-testid="agree-checkbox"]')
    
    // 提交表单
    await page.click('[data-testid="submit-button"]')
    
    // 验证提交成功
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('提交成功')
  })
})
```

### 元素定位和操作

```javascript
// tests/element-interactions.spec.js
const { test, expect } = require('@playwright/test')

test.describe('元素交互测试', () => {
  test('各种元素定位方式', async ({ page }) => {
    await page.goto('/form')
    
    // 通过 data-testid 定位
    await page.click('[data-testid="submit-btn"]')
    
    // 通过文本内容定位
    await page.click('text=提交')
    
    // 通过角色定位
    await page.click('role=button[name="提交"]')
    
    // 通过 CSS 选择器
    await page.click('.submit-button')
    
    // 通过 XPath
    await page.click('xpath=//button[@type="submit"]')
    
    // 组合定位
    await page.click('form >> text=提交')
  })

  test('复杂元素操作', async ({ page }) => {
    await page.goto('/complex-form')
    
    // 文件上传
    await page.setInputFiles('[data-testid="file-input"]', 'path/to/file.pdf')
    
    // 拖拽操作
    await page.dragAndDrop('[data-testid="source"]', '[data-testid="target"]')
    
    // 鼠标悬停
    await page.hover('[data-testid="tooltip-trigger"]')
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible()
    
    // 键盘操作
    await page.press('[data-testid="search-input"]', 'Control+A')
    await page.type('[data-testid="search-input"]', '新的搜索内容')
    
    // 滚动操作
    await page.locator('[data-testid="scroll-target"]').scrollIntoViewIfNeeded()
    
    // 等待元素状态
    await page.waitForSelector('[data-testid="loading"]', { state: 'hidden' })
    await page.waitForSelector('[data-testid="content"]', { state: 'visible' })
  })
})
```

## 高级功能

### 网络请求拦截

```javascript
// tests/network-interception.spec.js
const { test, expect } = require('@playwright/test')

test.describe('网络请求拦截', () => {
  test('拦截和修改 API 请求', async ({ page }) => {
    // 拦截 API 请求并返回模拟数据
    await page.route('/api/users', async route => {
      const mockUsers = [
        { id: 1, name: '测试用户1', email: 'user1@example.com' },
        { id: 2, name: '测试用户2', email: 'user2@example.com' }
      ]
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockUsers)
      })
    })
    
    await page.goto('/users')
    
    // 验证模拟数据显示
    await expect(page.locator('[data-testid="user-list"]'))
      .toContainText('测试用户1')
  })

  test('模拟网络错误', async ({ page }) => {
    // 模拟 500 错误
    await page.route('/api/data', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: '服务器内部错误' })
      })
    })
    
    await page.goto('/data')
    
    // 验证错误处理
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('服务器内部错误')
  })

  test('监控网络请求', async ({ page }) => {
    const requests = []
    
    // 监听所有请求
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      })
    })
    
    await page.goto('/dashboard')
    await page.click('[data-testid="load-data"]')
    
    // 验证请求发送
    expect(requests.some(req => 
      req.url.includes('/api/dashboard') && req.method === 'GET'
    )).toBeTruthy()
  })
})
```

### 多标签页和窗口处理

```javascript
// tests/multi-tab.spec.js
const { test, expect } = require('@playwright/test')

test.describe('多标签页测试', () => {
  test('处理新标签页', async ({ context, page }) => {
    await page.goto('/')
    
    // 监听新标签页
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('[data-testid="open-new-tab"]')
    ])
    
    // 在新标签页中操作
    await newPage.waitForLoadState()
    await expect(newPage).toHaveTitle(/新标签页/)
    
    // 在新标签页中填写表单
    await newPage.fill('[data-testid="message-input"]', '来自新标签页的消息')
    await newPage.click('[data-testid="send-button"]')
    
    // 切换回原标签页验证结果
    await page.bringToFront()
    await expect(page.locator('[data-testid="notification"]'))
      .toContainText('收到新消息')
  })

  test('处理弹出窗口', async ({ context, page }) => {
    await page.goto('/popup-test')
    
    // 处理弹出窗口
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.click('[data-testid="open-popup"]')
    ])
    
    // 在弹出窗口中操作
    await popup.fill('[data-testid="popup-input"]', '弹出窗口数据')
    await popup.click('[data-testid="popup-submit"]')
    
    // 等待弹出窗口关闭
    await popup.waitForEvent('close')
    
    // 验证主页面更新
    await expect(page.locator('[data-testid="result"]'))
      .toContainText('弹出窗口数据')
  })
})
```

### 文件上传和下载

```javascript
// tests/file-operations.spec.js
const { test, expect } = require('@playwright/test')
const path = require('path')
const fs = require('fs')

test.describe('文件操作测试', () => {
  test('文件上传', async ({ page }) => {
    await page.goto('/upload')
    
    // 创建测试文件
    const testFile = path.join(__dirname, 'test-file.txt')
    fs.writeFileSync(testFile, '这是测试文件内容')
    
    // 上传文件
    await page.setInputFiles('[data-testid="file-input"]', testFile)
    await page.click('[data-testid="upload-button"]')
    
    // 验证上传成功
    await expect(page.locator('[data-testid="upload-success"]'))
      .toContainText('文件上传成功')
    
    // 清理测试文件
    fs.unlinkSync(testFile)
  })

  test('多文件上传', async ({ page }) => {
    await page.goto('/multi-upload')
    
    // 创建多个测试文件
    const files = ['file1.txt', 'file2.txt'].map(name => {
      const filePath = path.join(__dirname, name)
      fs.writeFileSync(filePath, `内容：${name}`)
      return filePath
    })
    
    // 上传多个文件
    await page.setInputFiles('[data-testid="multi-file-input"]', files)
    await page.click('[data-testid="upload-all"]')
    
    // 验证所有文件上传
    await expect(page.locator('[data-testid="file-list"]'))
      .toContainText('file1.txt')
    await expect(page.locator('[data-testid="file-list"]'))
      .toContainText('file2.txt')
    
    // 清理测试文件
    files.forEach(file => fs.unlinkSync(file))
  })

  test('文件下载', async ({ page }) => {
    await page.goto('/download')
    
    // 监听下载事件
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="download-button"]')
    ])
    
    // 验证下载文件
    expect(download.suggestedFilename()).toBe('report.pdf')
    
    // 保存下载文件
    const downloadPath = path.join(__dirname, 'downloads', download.suggestedFilename())
    await download.saveAs(downloadPath)
    
    // 验证文件存在
    expect(fs.existsSync(downloadPath)).toBeTruthy()
  })
})
```

## API 测试

### HTTP 请求测试

```javascript
// tests/api.spec.js
const { test, expect } = require('@playwright/test')

test.describe('API 测试', () => {
  let apiContext
  
  test.beforeAll(async ({ playwright }) => {
    // 创建 API 上下文
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8080/api',
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
  })
  
  test.afterAll(async () => {
    await apiContext.dispose()
  })

  test('GET 请求测试', async () => {
    const response = await apiContext.get('/users')
    
    expect(response.status()).toBe(200)
    
    const users = await response.json()
    expect(users).toHaveLength(3)
    expect(users[0]).toHaveProperty('id')
    expect(users[0]).toHaveProperty('name')
  })

  test('POST 请求测试', async () => {
    const newUser = {
      name: '新用户',
      email: 'newuser@example.com',
      role: 'user'
    }
    
    const response = await apiContext.post('/users', {
      data: newUser
    })
    
    expect(response.status()).toBe(201)
    
    const createdUser = await response.json()
    expect(createdUser.name).toBe(newUser.name)
    expect(createdUser.email).toBe(newUser.email)
    expect(createdUser).toHaveProperty('id')
  })

  test('PUT 请求测试', async () => {
    const updatedData = {
      name: '更新的用户名',
      email: 'updated@example.com'
    }
    
    const response = await apiContext.put('/users/1', {
      data: updatedData
    })
    
    expect(response.status()).toBe(200)
    
    const updatedUser = await response.json()
    expect(updatedUser.name).toBe(updatedData.name)
  })

  test('DELETE 请求测试', async () => {
    const response = await apiContext.delete('/users/1')
    
    expect(response.status()).toBe(204)
    
    // 验证用户已删除
    const getResponse = await apiContext.get('/users/1')
    expect(getResponse.status()).toBe(404)
  })

  test('错误处理测试', async () => {
    // 测试 400 错误
    const response = await apiContext.post('/users', {
      data: { name: '' } // 无效数据
    })
    
    expect(response.status()).toBe(400)
    
    const error = await response.json()
    expect(error).toHaveProperty('message')
    expect(error.message).toContain('name is required')
  })
})
```

### 认证和授权测试

```javascript
// tests/auth-api.spec.js
const { test, expect } = require('@playwright/test')

test.describe('认证 API 测试', () => {
  let apiContext
  let authToken
  
  test.beforeAll(async ({ playwright }) => {
    // 创建 API 上下文
    apiContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8080/api'
    })
    
    // 获取认证令牌
    const loginResponse = await apiContext.post('/auth/login', {
      data: {
        email: 'admin@example.com',
        password: 'password123'
      }
    })
    
    const loginData = await loginResponse.json()
    authToken = loginData.token
  })

  test('需要认证的 API 请求', async () => {
    const response = await apiContext.get('/admin/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    
    expect(response.status()).toBe(200)
    
    const users = await response.json()
    expect(Array.isArray(users)).toBeTruthy()
  })

  test('无效令牌测试', async () => {
    const response = await apiContext.get('/admin/users', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    expect(response.status()).toBe(401)
  })

  test('权限不足测试', async () => {
    // 使用普通用户令牌
    const userLoginResponse = await apiContext.post('/auth/login', {
      data: {
        email: 'user@example.com',
        password: 'password123'
      }
    })
    
    const userData = await userLoginResponse.json()
    
    const response = await apiContext.get('/admin/users', {
      headers: {
        'Authorization': `Bearer ${userData.token}`
      }
    })
    
    expect(response.status()).toBe(403)
  })
})
```

## 移动端测试

### 移动设备模拟

```javascript
// tests/mobile.spec.js
const { test, expect, devices } = require('@playwright/test')

test.describe('移动端测试', () => {
  test('iPhone 响应式测试', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12']
    })
    
    const page = await context.newPage()
    await page.goto('/')
    
    // 验证移动端布局
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    await expect(page.locator('[data-testid="desktop-menu"]')).toBeHidden()
    
    // 测试移动端导航
    await page.click('[data-testid="mobile-menu-toggle"]')
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    
    await context.close()
  })

  test('平板设备测试', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPad Pro']
    })
    
    const page = await context.newPage()
    await page.goto('/dashboard')
    
    // 验证平板布局
    const sidebar = page.locator('[data-testid="sidebar"]')
    await expect(sidebar).toBeVisible()
    
    // 测试触摸操作
    await page.tap('[data-testid="touch-button"]')
    await expect(page.locator('[data-testid="touch-feedback"]')).toBeVisible()
    
    await context.close()
  })

  test('横竖屏切换测试', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['iPhone 12']
    })
    
    const page = await context.newPage()
    await page.goto('/gallery')
    
    // 竖屏模式
    await expect(page.locator('[data-testid="portrait-layout"]')).toBeVisible()
    
    // 切换到横屏
    await page.setViewportSize({ width: 812, height: 375 })
    await expect(page.locator('[data-testid="landscape-layout"]')).toBeVisible()
    
    await context.close()
  })
})
```

### 触摸手势测试

```javascript
// tests/touch-gestures.spec.js
const { test, expect, devices } = require('@playwright/test')

test.describe('触摸手势测试', () => {
  test.use({ ...devices['iPhone 12'] })

  test('滑动手势', async ({ page }) => {
    await page.goto('/swipe-gallery')
    
    const gallery = page.locator('[data-testid="gallery"]')
    
    // 向左滑动
    await gallery.swipeLeft()
    await expect(page.locator('[data-testid="image-2"]')).toBeVisible()
    
    // 向右滑动
    await gallery.swipeRight()
    await expect(page.locator('[data-testid="image-1"]')).toBeVisible()
  })

  test('长按手势', async ({ page }) => {
    await page.goto('/context-menu')
    
    // 长按触发上下文菜单
    await page.locator('[data-testid="long-press-target"]').press({
      delay: 1000
    })
    
    await expect(page.locator('[data-testid="context-menu"]')).toBeVisible()
  })

  test('缩放手势', async ({ page }) => {
    await page.goto('/zoom-image')
    
    const image = page.locator('[data-testid="zoomable-image"]')
    
    // 模拟双指缩放
    await image.dblclick()
    
    // 验证缩放效果
    const transform = await image.evaluate(el => 
      window.getComputedStyle(el).transform
    )
    expect(transform).toContain('scale')
  })
})
```

## 性能测试

### 页面性能监控

```javascript
// tests/performance.spec.js
const { test, expect } = require('@playwright/test')

test.describe('性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    // 开始性能监控
    await page.goto('/', { waitUntil: 'networkidle' })
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime
      }
    })
    
    // 验证性能指标
    expect(metrics.domContentLoaded).toBeLessThan(2000) // 2秒内 DOM 加载完成
    expect(metrics.loadComplete).toBeLessThan(5000) // 5秒内完全加载
    expect(metrics.firstPaint).toBeLessThan(1000) // 1秒内首次绘制
  })

  test('资源加载性能', async ({ page }) => {
    const resourceTimings = []
    
    // 监听资源加载
    page.on('response', response => {
      resourceTimings.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        timing: response.timing()
      })
    })
    
    await page.goto('/heavy-page')
    
    // 分析大文件加载时间
    const largeResources = resourceTimings.filter(resource => 
      parseInt(resource.size) > 1024 * 1024 // 大于 1MB
    )
    
    largeResources.forEach(resource => {
      expect(resource.timing.responseEnd - resource.timing.requestStart)
        .toBeLessThan(10000) // 大文件 10秒内加载完成
    })
  })

  test('内存使用监控', async ({ page }) => {
    await page.goto('/memory-test')
    
    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      } : null
    })
    
    // 执行内存密集操作
    await page.click('[data-testid="memory-intensive-operation"]')
    await page.waitForTimeout(5000)
    
    // 获取操作后内存使用
    const finalMemory = await page.evaluate(() => {
      return performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize
      } : null
    })
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024) // 内存增长不超过 50MB
    }
  })
})
```

## 视觉回归测试

### 截图对比

```javascript
// tests/visual-regression.spec.js
const { test, expect } = require('@playwright/test')

test.describe('视觉回归测试', () => {
  test('首页截图对比', async ({ page }) => {
    await page.goto('/')
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle')
    
    // 截图对比
    await expect(page).toHaveScreenshot('homepage.png')
  })

  test('组件截图对比', async ({ page }) => {
    await page.goto('/components')
    
    // 对特定组件截图
    const button = page.locator('[data-testid="primary-button"]')
    await expect(button).toHaveScreenshot('primary-button.png')
    
    // 悬停状态截图
    await button.hover()
    await expect(button).toHaveScreenshot('primary-button-hover.png')
  })

  test('响应式设计截图', async ({ page }) => {
    await page.goto('/responsive-page')
    
    // 桌面版截图
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page).toHaveScreenshot('responsive-desktop.png')
    
    // 平板版截图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page).toHaveScreenshot('responsive-tablet.png')
    
    // 手机版截图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('responsive-mobile.png')
  })

  test('主题切换截图', async ({ page }) => {
    await page.goto('/theme-test')
    
    // 浅色主题截图
    await page.click('[data-testid="light-theme"]')
    await expect(page).toHaveScreenshot('light-theme.png')
    
    // 深色主题截图
    await page.click('[data-testid="dark-theme"]')
    await expect(page).toHaveScreenshot('dark-theme.png')
  })
})
```

## 数据驱动测试

### 参数化测试

```javascript
// tests/data-driven.spec.js
const { test, expect } = require('@playwright/test')

// 测试数据
const loginTestData = [
  { email: 'admin@example.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'user@example.com', password: 'user123', expectedRole: 'user' },
  { email: 'guest@example.com', password: 'guest123', expectedRole: 'guest' }
]

const formValidationData = [
  { field: 'email', value: 'invalid-email', error: '请输入有效的邮箱地址' },
  { field: 'phone', value: '123', error: '请输入有效的手机号码' },
  { field: 'age', value: '-1', error: '年龄必须大于0' }
]

test.describe('数据驱动测试', () => {
  // 参数化登录测试
  for (const testData of loginTestData) {
    test(`${testData.expectedRole} 用户登录测试`, async ({ page }) => {
      await page.goto('/login')
      
      await page.fill('[data-testid="email-input"]', testData.email)
      await page.fill('[data-testid="password-input"]', testData.password)
      await page.click('[data-testid="login-button"]')
      
      // 验证登录成功
      await expect(page.locator('[data-testid="user-role"]'))
        .toContainText(testData.expectedRole)
    })
  }

  // 参数化表单验证测试
  for (const validationData of formValidationData) {
    test(`${validationData.field} 字段验证测试`, async ({ page }) => {
      await page.goto('/form')
      
      await page.fill(`[data-testid="${validationData.field}-input"]`, validationData.value)
      await page.click('[data-testid="submit-button"]')
      
      // 验证错误信息
      await expect(page.locator(`[data-testid="${validationData.field}-error"]`))
        .toContainText(validationData.error)
    })
  }
})
```

### 外部数据源

```javascript
// tests/external-data.spec.js
const { test, expect } = require('@playwright/test')
const fs = require('fs')
const path = require('path')

// 从 JSON 文件读取测试数据
const testData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'test-users.json'), 'utf8')
)

// 从 CSV 文件读取测试数据
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim()
      return obj
    }, {})
  }).filter(row => Object.values(row).some(value => value))
}

const csvData = parseCSV(path.join(__dirname, 'data', 'products.csv'))

test.describe('外部数据源测试', () => {
  test('JSON 数据驱动的用户测试', async ({ page }) => {
    for (const user of testData.users) {
      await test.step(`测试用户: ${user.name}`, async () => {
        await page.goto('/profile')
        
        // 填写用户信息
        await page.fill('[data-testid="name-input"]', user.name)
        await page.fill('[data-testid="email-input"]', user.email)
        await page.selectOption('[data-testid="country-select"]', user.country)
        
        await page.click('[data-testid="save-button"]')
        
        // 验证保存成功
        await expect(page.locator('[data-testid="success-message"]'))
          .toBeVisible()
      })
    }
  })

  test('CSV 数据驱动的产品测试', async ({ page }) => {
    await page.goto('/admin/products')
    
    for (const product of csvData) {
      await test.step(`添加产品: ${product.name}`, async () => {
        await page.click('[data-testid="add-product"]')
        
        await page.fill('[data-testid="product-name"]', product.name)
        await page.fill('[data-testid="product-price"]', product.price)
        await page.fill('[data-testid="product-description"]', product.description)
        
        await page.click('[data-testid="save-product"]')
        
        // 验证产品添加成功
        await expect(page.locator('[data-testid="product-list"]'))
          .toContainText(product.name)
      })
    }
  })
})
```

## CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        
    steps:
    - uses: actions/checkout@v3
    
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps ${{ matrix.browser }}
      
    - name: Build application
      run: npm run build
      
    - name: Start application
      run: |
        npm start &
        npx wait-on http://localhost:3000
        
    - name: Run Playwright tests
      run: npx playwright test --project=${{ matrix.browser }}
      
    - uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-report-${{ matrix.browser }}
        path: playwright-report/
        retention-days: 30
        
    - uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: test-results-${{ matrix.browser }}
        path: test-results/
        retention-days: 30
```

### Docker 集成

```dockerfile
# Dockerfile.playwright
FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 运行测试
CMD ["npx", "playwright", "test"]
```

```bash
# 构建和运行 Docker 容器
docker build -f Dockerfile.playwright -t my-app-tests .
docker run --rm -v $(pwd)/test-results:/app/test-results my-app-tests
```

## 最佳实践

### 测试组织和结构

```javascript
// tests/utils/test-helpers.js
class TestHelpers {
  static async login(page, email, password) {
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', email)
    await page.fill('[data-testid="password-input"]', password)
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/dashboard')
  }
  
  static async createTestUser(apiContext, userData) {
    const response = await apiContext.post('/api/users', {
      data: userData
    })
    return response.json()
  }
  
  static async cleanupTestData(apiContext) {
    await apiContext.delete('/api/test-data')
  }
  
  static generateRandomEmail() {
    return `test-${Date.now()}@example.com`
  }
}

module.exports = TestHelpers
```

### 页面对象模式

```javascript
// tests/pages/login-page.js
class LoginPage {
  constructor(page) {
    this.page = page
    this.emailInput = page.locator('[data-testid="email-input"]')
    this.passwordInput = page.locator('[data-testid="password-input"]')
    this.loginButton = page.locator('[data-testid="login-button"]')
    this.errorMessage = page.locator('[data-testid="error-message"]')
  }
  
  async goto() {
    await this.page.goto('/login')
  }
  
  async login(email, password) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }
  
  async getErrorMessage() {
    return await this.errorMessage.textContent()
  }
}

module.exports = LoginPage
```

### 错误处理和重试

```javascript
// playwright.config.js
module.exports = defineConfig({
  // 全局重试配置
  retries: process.env.CI ? 2 : 0,
  
  use: {
    // 操作超时
    actionTimeout: 10000,
    
    // 自定义错误处理
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  // 项目特定配置
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 特定浏览器的重试策略
        retries: 1
      }
    }
  ]
})
```

## 故障排除

### 常见问题解决

```javascript
// 调试辅助函数
class DebugHelpers {
  static async debugElement(page, selector) {
    const element = page.locator(selector)
    
    console.log('元素信息:')
    console.log('- 是否存在:', await element.count() > 0)
    console.log('- 是否可见:', await element.isVisible().catch(() => false))
    console.log('- 是否启用:', await element.isEnabled().catch(() => false))
    console.log('- 文本内容:', await element.textContent().catch(() => 'N/A'))
    console.log('- 属性:', await element.evaluate(el => {
      const attrs = {}
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value
      }
      return attrs
    }).catch(() => {}))
  }
  
  static async debugPage(page) {
    console.log('页面信息:')
    console.log('- URL:', page.url())
    console.log('- 标题:', await page.title())
    console.log('- 视口:', page.viewportSize())
    
    // 检查控制台错误
    const errors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    if (errors.length > 0) {
      console.log('- 控制台错误:', errors)
    }
  }
  
  static async waitForStableState(page, selector, timeout = 5000) {
    const element = page.locator(selector)
    let lastCount = 0
    let stableCount = 0
    
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const currentCount = await element.count()
      
      if (currentCount === lastCount) {
        stableCount++
        if (stableCount >= 3) { // 连续3次检查都相同
          return
        }
      } else {
        stableCount = 0
      }
      
      lastCount = currentCount
      await page.waitForTimeout(100)
    }
    
    throw new Error(`元素 ${selector} 在 ${timeout}ms 内未达到稳定状态`)
  }
}

module.exports = DebugHelpers
```

### 性能优化

```javascript
// 测试性能优化配置
module.exports = defineConfig({
  // 并行执行
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  
  use: {
    // 减少等待时间
    actionTimeout: 5000,
    navigationTimeout: 15000,
    
    // 优化资源加载
    ignoreHTTPSErrors: true,
    
    // 禁用不必要的功能
    video: process.env.CI ? 'retain-on-failure' : 'off',
    trace: process.env.CI ? 'retain-on-failure' : 'off'
  },
  
  // 测试过滤
  grep: process.env.TEST_FILTER ? new RegExp(process.env.TEST_FILTER) : undefined,
  
  // 全局设置
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown')
})
```

## 参考资源

### 📚 学习资源
- [Playwright 官方文档](https://playwright.dev/)
- [Playwright GitHub 仓库](https://github.com/microsoft/playwright)
- [测试最佳实践指南](https://playwright.dev/docs/best-practices)
- [API 测试指南](https://playwright.dev/docs/api-testing)

### 🛠️ 相关工具
- **IDE 插件**: VS Code Playwright Extension
- **测试报告**: Allure, HTML Reporter, JUnit
- **CI/CD**: GitHub Actions, Azure DevOps, Jenkins
- **监控工具**: Playwright Trace Viewer, Test Results

### 📖 进阶主题
- [视觉回归测试](https://playwright.dev/docs/test-snapshots)
- [组件测试](https://playwright.dev/docs/test-components)
- [网络模拟](https://playwright.dev/docs/network)
- [认证和状态管理](https://playwright.dev/docs/auth)

---

> 💡 **提示**：Playwright 是现代化的端到端测试解决方案，合理使用其强大功能能够大大提升测试效率和质量保证水平！