# E2E 端到端测试
## 简介

E2E（End-to-End）测试是一种测试方法，用于验证应用程序从开始到结束的完整工作流程，确保所有组件和系统集成正常工作。

### 核心价值
- **用户体验验证**：从用户角度验证应用功能
- **集成测试**：验证前后端、数据库等系统集成
- **回归测试**：确保新功能不破坏现有功能
- **自动化验收**：自动化用户验收测试流程
- **持续质量保证**：CI/CD 流程中的质量门禁

### 测试策略
- **关键路径优先**：覆盖核心业务流程
- **用户场景驱动**：基于真实用户行为设计测试
- **数据驱动测试**：使用多种测试数据验证
- **环境隔离**：独立的测试环境和数据

## 测试框架选择

### 主流框架对比

| 框架 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| **Cypress** | 开发体验好、调试方便 | 仅支持 Chrome 系 | 现代 Web 应用 |
| **Playwright** | 跨浏览器、性能好 | 学习成本高 | 复杂应用、多浏览器 |
| **Selenium** | 成熟稳定、语言支持多 | 配置复杂、速度慢 | 传统应用、多语言团队 |
| **Puppeteer** | 轻量、Chrome 深度集成 | 仅支持 Chrome | Chrome 专用场景 |

## Cypress E2E 测试

### 基础配置

```javascript
// cypress.config.js
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,

    // 测试文件配置
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',

    // 环境配置
    env: {
      apiUrl: 'http://localhost:8080/api',
      testUser: {
        email: 'test@example.com',
        password: 'password123'
      }
    },

    // 重试配置
    retries: {
      runMode: 2,
      openMode: 0
    },

    // 超时配置
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000
  }
})
```

### 用户登录流程测试

```javascript
// cypress/e2e/auth/login.cy.js
describe('用户登录流程', () => {
  beforeEach(() => {
    // 访问登录页面
    cy.visit('/login')

    // 清除本地存储
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('应该能够成功登录', () => {
    // 输入用户名和密码
    cy.get('[data-testid="email-input"]')
      .type(Cypress.env('testUser.email'))

    cy.get('[data-testid="password-input"]')
      .type(Cypress.env('testUser.password'))

    // 点击登录按钮
    cy.get('[data-testid="login-button"]').click()

    // 验证登录成功
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="user-menu"]').should('be.visible')

    // 验证用户信息
    cy.get('[data-testid="user-name"]')
      .should('contain', 'Test User')
  })

  it('应该显示错误信息当凭据无效时', () => {
    cy.get('[data-testid="email-input"]')
      .type('invalid@example.com')

    cy.get('[data-testid="password-input"]')
      .type('wrongpassword')

    cy.get('[data-testid="login-button"]').click()

    // 验证错误信息
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', '用户名或密码错误')

    // 确保仍在登录页面
    cy.url().should('include', '/login')
  })

  it('应该能够通过记住我功能保持登录状态', () => {
    cy.get('[data-testid="email-input"]')
      .type(Cypress.env('testUser.email'))

    cy.get('[data-testid="password-input"]')
      .type(Cypress.env('testUser.password'))

    // 勾选记住我
    cy.get('[data-testid="remember-me"]').check()

    cy.get('[data-testid="login-button"]').click()

    // 验证登录成功
    cy.url().should('include', '/dashboard')

    // 刷新页面验证持久登录
    cy.reload()
    cy.url().should('include', '/dashboard')
  })
})
```

### 电商购物流程测试

```javascript
// cypress/e2e/ecommerce/shopping-flow.cy.js
describe('电商购物流程', () => {
  beforeEach(() => {
    // 登录用户
    cy.login(Cypress.env('testUser.email'), Cypress.env('testUser.password'))
  })

  it('应该能够完成完整的购物流程', () => {
    // 1. 浏览商品
    cy.visit('/products')
    cy.get('[data-testid="product-list"]').should('be.visible')

    // 2. 搜索商品
    cy.get('[data-testid="search-input"]').type('iPhone')
    cy.get('[data-testid="search-button"]').click()

    // 3. 选择商品
    cy.get('[data-testid="product-item"]').first().click()
    cy.url().should('include', '/products/')

    // 4. 添加到购物车
    cy.get('[data-testid="add-to-cart"]').click()
    cy.get('[data-testid="cart-notification"]')
      .should('be.visible')
      .and('contain', '商品已添加到购物车')

    // 5. 查看购物车
    cy.get('[data-testid="cart-icon"]').click()
    cy.get('[data-testid="cart-items"]').should('have.length.at.least', 1)

    // 6. 修改数量
    cy.get('[data-testid="quantity-input"]').clear().type('2')
    cy.get('[data-testid="update-quantity"]').click()

    // 7. 进入结算
    cy.get('[data-testid="checkout-button"]').click()
    cy.url().should('include', '/checkout')

    // 8. 填写配送信息
    cy.get('[data-testid="shipping-address"]').type('北京市朝阳区测试地址123号')
    cy.get('[data-testid="phone-number"]').type('13800138000')

    // 9. 选择支付方式
    cy.get('[data-testid="payment-method-credit"]').check()

    // 10. 确认订单
    cy.get('[data-testid="place-order"]').click()

    // 11. 验证订单成功
    cy.url().should('include', '/order-success')
    cy.get('[data-testid="order-number"]').should('be.visible')
    cy.get('[data-testid="success-message"]')
      .should('contain', '订单提交成功')
  })

  it('应该能够处理库存不足的情况', () => {
    // 模拟库存不足的商品
    cy.intercept('POST', '/api/cart/add', {
      statusCode: 400,
      body: { error: '库存不足' }
    }).as('addToCartError')

    cy.visit('/products/out-of-stock-item')
    cy.get('[data-testid="add-to-cart"]').click()

    cy.wait('@addToCartError')
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', '库存不足')
  })
})
```

## Playwright E2E 测试

### 基础配置

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],

  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
})
```

### 跨浏览器测试

```javascript
// tests/cross-browser.spec.js
const { test, expect } = require('@playwright/test')

test.describe('跨浏览器兼容性测试', () => {
  test('应该在所有浏览器中正常显示首页', async ({ page }) => {
    await page.goto('/')

    // 验证页面标题
    await expect(page).toHaveTitle(/我的应用/)

    // 验证关键元素
    await expect(page.locator('[data-testid="header"]')).toBeVisible()
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible()
    await expect(page.locator('[data-testid="main-content"]')).toBeVisible()

    // 验证响应式设计
    const viewport = page.viewportSize()
    if (viewport.width < 768) {
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    } else {
      await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible()
    }
  })

  test('应该在所有浏览器中正常处理表单提交', async ({ page }) => {
    await page.goto('/contact')

    // 填写表单
    await page.fill('[data-testid="name-input"]', '测试用户')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="message-input"]', '这是一条测试消息')

    // 提交表单
    await page.click('[data-testid="submit-button"]')

    // 验证成功消息
    await expect(page.locator('[data-testid="success-message"]'))
      .toBeVisible()
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('消息发送成功')
  })
})
```

## 测试数据管理

### 测试数据工厂

```javascript
// cypress/support/data-factory.js
class DataFactory {
  static user(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 10000),
      email: `user${Date.now()}@example.com`,
      password: 'password123',
      firstName: '测试',
      lastName: '用户',
      phone: '13800138000',
      ...overrides
    }
  }

  static product(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 10000),
      name: `测试商品 ${Date.now()}`,
      price: 99.99,
      description: '这是一个测试商品',
      category: 'electronics',
      stock: 100,
      ...overrides
    }
  }

  static order(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 10000),
      userId: 1,
      items: [this.product()],
      total: 99.99,
      status: 'pending',
      shippingAddress: '北京市朝阳区测试地址123号',
      ...overrides
    }
  }
}

module.exports = DataFactory
```

### 数据库种子数据

```javascript
// cypress/support/database.js
class DatabaseHelper {
  static async seedTestData() {
    // 清理现有数据
    await cy.task('db:clean')

    // 创建测试用户
    const testUser = DataFactory.user({
      email: Cypress.env('testUser.email'),
      password: Cypress.env('testUser.password')
    })
    await cy.task('db:createUser', testUser)

    // 创建测试商品
    const products = Array.from({ length: 10 }, () => DataFactory.product())
    await cy.task('db:createProducts', products)
  }

  static async cleanupTestData() {
    await cy.task('db:clean')
  }
}

module.exports = DatabaseHelper
```

## 页面对象模式

### 页面对象基类

```javascript
// cypress/support/page-objects/base-page.js
class BasePage {
  constructor() {
    this.url = '/'
  }

  visit() {
    cy.visit(this.url)
    return this
  }

  waitForLoad() {
    cy.get('[data-testid="loading"]').should('not.exist')
    return this
  }

  getElement(selector) {
    return cy.get(selector)
  }

  clickElement(selector) {
    this.getElement(selector).click()
    return this
  }

  typeInElement(selector, text) {
    this.getElement(selector).clear().type(text)
    return this
  }

  verifyElementVisible(selector) {
    this.getElement(selector).should('be.visible')
    return this
  }

  verifyElementText(selector, text) {
    this.getElement(selector).should('contain', text)
    return this
  }
}

module.exports = BasePage
```

### 登录页面对象

```javascript
// cypress/support/page-objects/login-page.js
const BasePage = require('./base-page')

class LoginPage extends BasePage {
  constructor() {
    super()
    this.url = '/login'
    this.selectors = {
      emailInput: '[data-testid="email-input"]',
      passwordInput: '[data-testid="password-input"]',
      loginButton: '[data-testid="login-button"]',
      errorMessage: '[data-testid="error-message"]',
      rememberMe: '[data-testid="remember-me"]'
    }
  }

  enterEmail(email) {
    this.typeInElement(this.selectors.emailInput, email)
    return this
  }

  enterPassword(password) {
    this.typeInElement(this.selectors.passwordInput, password)
    return this
  }

  checkRememberMe() {
    this.getElement(this.selectors.rememberMe).check()
    return this
  }

  clickLogin() {
    this.clickElement(this.selectors.loginButton)
    return this
  }

  login(email, password, rememberMe = false) {
    this.enterEmail(email)
    this.enterPassword(password)

    if (rememberMe) {
      this.checkRememberMe()
    }

    this.clickLogin()
    return this
  }

  verifyErrorMessage(message) {
    this.verifyElementVisible(this.selectors.errorMessage)
    this.verifyElementText(this.selectors.errorMessage, message)
    return this
  }
}

module.exports = LoginPage
```

## API 测试集成

### API 测试辅助函数

```javascript
// cypress/support/api-helpers.js
class ApiHelpers {
  static request(method, url, body = null, headers = {}) {
    return cy.request({
      method,
      url: `${Cypress.env('apiUrl')}${url}`,
      body,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      failOnStatusCode: false
    })
  }

  static get(url, headers = {}) {
    return this.request('GET', url, null, headers)
  }

  static post(url, body, headers = {}) {
    return this.request('POST', url, body, headers)
  }

  static put(url, body, headers = {}) {
    return this.request('PUT', url, body, headers)
  }

  static delete(url, headers = {}) {
    return this.request('DELETE', url, null, headers)
  }

  static authenticatedRequest(method, url, body = null) {
    return cy.getLocalStorage('authToken').then(token => {
      return this.request(method, url, body, {
        'Authorization': `Bearer ${token}`
      })
    })
  }
}

module.exports = ApiHelpers
```

### API 与 UI 集成测试

```javascript
// cypress/e2e/api-ui-integration.cy.js
const ApiHelpers = require('../support/api-helpers')

describe('API 与 UI 集成测试', () => {
  it('应该在 API 创建数据后在 UI 中显示', () => {
    // 通过 API 创建商品
    const productData = {
      name: '测试商品',
      price: 99.99,
      description: '通过 API 创建的测试商品'
    }

    ApiHelpers.post('/products', productData)
      .then(response => {
        expect(response.status).to.eq(201)
        const productId = response.body.id

        // 在 UI 中验证商品显示
        cy.visit('/products')
        cy.get(`[data-testid="product-${productId}"]`)
          .should('be.visible')
          .and('contain', productData.name)
      })
  })

  it('应该在 UI 操作后通过 API 验证数据变更', () => {
    // UI 操作：添加商品到购物车
    cy.visit('/products/1')
    cy.get('[data-testid="add-to-cart"]').click()

    // API 验证：检查购物车内容
    ApiHelpers.authenticatedRequest('GET', '/cart')
      .then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.items).to.have.length.at.least(1)
        expect(response.body.items[0].productId).to.eq(1)
      })
  })
})
```

## 性能测试

### 页面加载性能测试

```javascript
// cypress/e2e/performance.cy.js
describe('性能测试', () => {
  it('应该在合理时间内加载首页', () => {
    const startTime = Date.now()

    cy.visit('/')
    cy.get('[data-testid="main-content"]').should('be.visible')

    cy.then(() => {
      const loadTime = Date.now() - startTime
      expect(loadTime).to.be.lessThan(3000) // 3秒内加载完成
    })
  })

  it('应该优化图片加载', () => {
    cy.visit('/gallery')

    // 检查图片懒加载
    cy.get('[data-testid="lazy-image"]').should('have.attr', 'loading', 'lazy')

    // 检查图片格式优化
    cy.get('img').each($img => {
      const src = $img.attr('src')
      expect(src).to.match(/\.(webp|avif|jpg|png)$/)
    })
  })
})
```

## CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        browser: [chrome, firefox, edge]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Start application
        run: |
          npm start &
          npx wait-on http://localhost:3000

      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          browser: ${{ matrix.browser }}
          record: true
          parallel: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots-${{ matrix.browser }}
          path: cypress/screenshots

      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-videos-${{ matrix.browser }}
          path: cypress/videos
```

## 最佳实践

### 测试策略

1. **测试金字塔原则**
   - 70% 单元测试
   - 20% 集成测试
   - 10% E2E 测试

2. **关键路径优先**
   - 用户注册/登录流程
   - 核心业务功能
   - 支付流程
   - 数据提交流程

3. **数据驱动测试**
   ```javascript
   const testData = [
     { email: 'user1@example.com', password: 'password1' },
     { email: 'user2@example.com', password: 'password2' }
   ]

   testData.forEach(data => {
     it(`应该能够使用 ${data.email} 登录`, () => {
       // 测试逻辑
     })
   })
   ```

### 错误处理和调试

```javascript
// cypress/support/commands.js
Cypress.Commands.add('loginWithRetry', (email, password, maxRetries = 3) => {
  const attemptLogin = (attempt) => {
    if (attempt > maxRetries) {
      throw new Error(`登录失败，已重试 ${maxRetries} 次`)
    }

    cy.visit('/login')
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()

    cy.url().then(url => {
      if (!url.includes('/dashboard')) {
        cy.wait(1000)
        attemptLogin(attempt + 1)
      }
    })
  }

  attemptLogin(1)
})

// 自定义错误处理
Cypress.on('fail', (error, runnable) => {
  // 截图
  cy.screenshot(`failure-${runnable.title}`)

  // 记录错误信息
  console.error('测试失败:', error.message)

  // 抛出原始错误
  throw error
})
```

### 测试报告

```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // 生成测试报告
      on('after:run', (results) => {
        const report = {
          totalTests: results.totalTests,
          totalPassed: results.totalPassed,
          totalFailed: results.totalFailed,
          totalDuration: results.totalDuration,
          browser: results.browserName,
          timestamp: new Date().toISOString()
        }

        // 发送到监控系统
        // sendToMonitoring(report)

        console.log('测试报告:', report)
      })
    }
  }
})
```

## 故障排除

### 常见问题解决

```bash
# 元素未找到
# 增加等待时间
cy.get('[data-testid="element"]', { timeout: 10000 })

# 使用更具体的选择器
cy.get('[data-testid="submit-button"]:visible')

# 等待元素出现
cy.get('[data-testid="loading"]').should('not.exist')
cy.get('[data-testid="content"]').should('be.visible')

# 网络请求超时
# 增加请求超时时间
cy.intercept('GET', '/api/data', { timeout: 30000 })

# 模拟慢网络
cy.intercept('GET', '/api/data', (req) => {
  req.reply((res) => {
    res.delay(2000) // 延迟2秒
  })
})

# 浏览器兼容性问题
# 使用条件测试
if (Cypress.browser.name === 'chrome') {
  // Chrome 特定测试
}

# 清理测试环境
beforeEach(() => {
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.window().then(win => {
    win.sessionStorage.clear()
  })
})
```

### 调试脚本

```javascript
// debug-helpers.js
class DebugHelpers {
  static logPageState() {
    cy.window().then(win => {
      console.log('当前 URL:', win.location.href)
      console.log('Local Storage:', win.localStorage)
      console.log('Session Storage:', win.sessionStorage)
    })
  }

  static takeScreenshot(name) {
    cy.screenshot(name || `debug-${Date.now()}`)
  }

  static logNetworkRequests() {
    cy.intercept('**', (req) => {
      console.log(`${req.method} ${req.url}`)
    })
  }
}

module.exports = DebugHelpers
```

## 参考资源

### 📚 学习资源
- [Cypress 官方文档](https://docs.cypress.io/)
- [Playwright 官方文档](https://playwright.dev/)
- [E2E 测试最佳实践](https://docs.cypress.io/guides/references/best-practices)
- [测试自动化金字塔](https://martinfowler.com/articles/practical-test-pyramid.html)

### 🛠️ 相关工具
- **测试框架**: Cypress, Playwright, Selenium, Puppeteer
- **测试报告**: Allure, Mochawesome, HTML Reporter
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **监控工具**: TestRail, Zephyr, qTest

### 📖 进阶主题
- [视觉回归测试](https://docs.cypress.io/guides/tooling/visual-testing)
- [移动端测试](https://playwright.dev/docs/emulation)
- [API 测试集成](https://docs.cypress.io/guides/guides/network-requests)
- [性能测试](https://web.dev/lighthouse-ci/)

---

> 💡 **提示**：E2E 测试是质量保证的最后一道防线，合理的测试策略和持续优化能够大大提升产品质量和用户体验！
