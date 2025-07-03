# Cypress 端到端测试

## 简介

Cypress 是一个现代化的端到端测试框架，专为现代 Web 应用程序设计。它提供了快速、可靠且易于使用的测试体验，支持实时重载、时间旅行调试和自动等待等特性。

### 核心特性
- **实时重载**：代码变更时自动重新运行测试
- **时间旅行**：可以查看测试执行过程中每一步的状态
- **自动等待**：智能等待元素出现，无需手动添加等待
- **网络控制**：可以 stub 和 spy 网络请求
- **截图和视频**：自动捕获失败时的截图和视频
- **调试友好**：使用熟悉的开发者工具进行调试

### 应用场景
- **端到端测试**：完整用户流程测试
- **集成测试**：组件间交互测试
- **API 测试**：后端接口测试
- **视觉回归测试**：UI 变化检测
- **性能测试**：页面加载和响应时间测试

## 安装与配置

### 基础安装

```bash
# 安装 Cypress
npm install --save-dev cypress

# 或使用 yarn
yarn add --dev cypress

# 打开 Cypress Test Runner
npx cypress open

# 运行 Cypress 测试（无头模式）
npx cypress run
```

### 项目配置

```javascript
// cypress.config.js
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // 基础配置
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // 测试文件配置
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    
    // 超时配置
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    // 重试配置
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // 视频和截图
    video: true,
    screenshotOnRunFailure: true,
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    
    // 环境变量
    env: {
      apiUrl: 'http://localhost:8080/api',
      username: 'testuser',
      password: 'testpass'
    },
    
    setupNodeEvents(on, config) {
      // 插件配置
      // on('task', {
      //   log(message) {
      //     console.log(message)
      //     return null
      //   }
      // })
      
      return config
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}'
  }
})
```

### 支持文件配置

```javascript
// cypress/support/e2e.js
import './commands'
import 'cypress-real-events/support'

// 全局配置
Cypress.config('defaultCommandTimeout', 10000)

// 全局钩子
beforeEach(() => {
  // 每个测试前的设置
  cy.clearCookies()
  cy.clearLocalStorage()
})

// 异常处理
Cypress.on('uncaught:exception', (err, runnable) => {
  // 忽略特定错误
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})
```

## 基础测试语法

### 测试结构

```javascript
// cypress/e2e/basic.cy.js
describe('基础测试示例', () => {
  beforeEach(() => {
    // 每个测试前执行
    cy.visit('/')
  })
  
  it('应该显示首页标题', () => {
    cy.get('h1').should('contain.text', '欢迎')
    cy.title().should('eq', '我的应用')
  })
  
  it('应该能够导航到关于页面', () => {
    cy.get('[data-cy="nav-about"]').click()
    cy.url().should('include', '/about')
    cy.get('h1').should('contain.text', '关于我们')
  })
  
  it('应该响应式显示', () => {
    // 测试移动端视图
    cy.viewport(375, 667)
    cy.get('.mobile-menu').should('be.visible')
    
    // 测试桌面端视图
    cy.viewport(1280, 720)
    cy.get('.desktop-menu').should('be.visible')
  })
})
```

### 元素选择和交互

```javascript
// cypress/e2e/interactions.cy.js
describe('元素交互测试', () => {
  beforeEach(() => {
    cy.visit('/form')
  })
  
  it('应该能够填写和提交表单', () => {
    // 输入文本
    cy.get('[data-cy="name-input"]')
      .type('张三')
      .should('have.value', '张三')
    
    // 选择下拉框
    cy.get('[data-cy="country-select"]')
      .select('中国')
      .should('have.value', 'CN')
    
    // 选择单选按钮
    cy.get('[data-cy="gender-male"]')
      .check()
      .should('be.checked')
    
    // 选择复选框
    cy.get('[data-cy="terms-checkbox"]')
      .check()
      .should('be.checked')
    
    // 上传文件
    cy.get('[data-cy="file-input"]')
      .selectFile('cypress/fixtures/test-image.jpg')
    
    // 提交表单
    cy.get('[data-cy="submit-button"]').click()
    
    // 验证提交结果
    cy.get('[data-cy="success-message"]')
      .should('be.visible')
      .and('contain.text', '提交成功')
  })
  
  it('应该验证表单字段', () => {
    // 提交空表单
    cy.get('[data-cy="submit-button"]').click()
    
    // 验证错误消息
    cy.get('[data-cy="name-error"]')
      .should('be.visible')
      .and('contain.text', '姓名不能为空')
    
    // 输入无效邮箱
    cy.get('[data-cy="email-input"]').type('invalid-email')
    cy.get('[data-cy="submit-button"]').click()
    
    cy.get('[data-cy="email-error"]')
      .should('be.visible')
      .and('contain.text', '请输入有效的邮箱地址')
  })
})
```

## 高级功能

### 自定义命令

```javascript
// cypress/support/commands.js

// 登录命令
Cypress.Commands.add('login', (username, password) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="username"]').type(username)
    cy.get('[data-cy="password"]').type(password)
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('not.include', '/login')
  })
})

// 创建用户命令
Cypress.Commands.add('createUser', (userData) => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users`,
    body: userData,
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    }
  })
})

// 等待 API 响应
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias).then((interception) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 201, 204])
  })
})

// 拖拽命令
Cypress.Commands.add('dragAndDrop', (source, target) => {
  cy.get(source).trigger('mousedown', { button: 0 })
  cy.get(target).trigger('mousemove').trigger('mouseup')
})

// 等待元素加载
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible')
})
```

### 网络请求处理

```javascript
// cypress/e2e/api.cy.js
describe('API 测试', () => {
  beforeEach(() => {
    // 拦截 API 请求
    cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers')
    cy.intercept('POST', '/api/users', { statusCode: 201, body: { id: 1, name: '新用户' } }).as('createUser')
    cy.intercept('PUT', '/api/users/*', { statusCode: 200 }).as('updateUser')
    cy.intercept('DELETE', '/api/users/*', { statusCode: 204 }).as('deleteUser')
  })
  
  it('应该加载用户列表', () => {
    cy.visit('/users')
    
    // 等待 API 请求完成
    cy.wait('@getUsers').then((interception) => {
      expect(interception.response.statusCode).to.eq(200)
    })
    
    // 验证用户列表显示
    cy.get('[data-cy="user-list"]').should('be.visible')
    cy.get('[data-cy="user-item"]').should('have.length.greaterThan', 0)
  })
  
  it('应该能够创建新用户', () => {
    cy.visit('/users/new')
    
    cy.get('[data-cy="name-input"]').type('新用户')
    cy.get('[data-cy="email-input"]').type('newuser@example.com')
    cy.get('[data-cy="submit-button"]').click()
    
    cy.wait('@createUser').then((interception) => {
      expect(interception.request.body).to.deep.include({
        name: '新用户',
        email: 'newuser@example.com'
      })
    })
    
    cy.get('[data-cy="success-message"]').should('be.visible')
  })
  
  it('应该处理 API 错误', () => {
    // 模拟服务器错误
    cy.intercept('POST', '/api/users', {
      statusCode: 500,
      body: { error: '服务器内部错误' }
    }).as('createUserError')
    
    cy.visit('/users/new')
    cy.get('[data-cy="name-input"]').type('测试用户')
    cy.get('[data-cy="submit-button"]').click()
    
    cy.wait('@createUserError')
    cy.get('[data-cy="error-message"]')
      .should('be.visible')
      .and('contain.text', '服务器内部错误')
  })
})
```

### 数据驱动测试

```javascript
// cypress/fixtures/test-data.json
{
  "users": [
    {
      "name": "张三",
      "email": "zhangsan@example.com",
      "age": 25
    },
    {
      "name": "李四",
      "email": "lisi@example.com",
      "age": 30
    },
    {
      "name": "王五",
      "email": "wangwu@example.com",
      "age": 28
    }
  ],
  "loginCredentials": [
    {
      "username": "admin",
      "password": "admin123",
      "role": "administrator"
    },
    {
      "username": "user",
      "password": "user123",
      "role": "user"
    }
  ]
}
```

```javascript
// cypress/e2e/data-driven.cy.js
describe('数据驱动测试', () => {
  beforeEach(() => {
    cy.fixture('test-data').as('testData')
  })
  
  it('应该使用不同数据创建用户', function() {
    this.testData.users.forEach((user, index) => {
      cy.visit('/users/new')
      
      cy.get('[data-cy="name-input"]').type(user.name)
      cy.get('[data-cy="email-input"]').type(user.email)
      cy.get('[data-cy="age-input"]').type(user.age.toString())
      
      cy.get('[data-cy="submit-button"]').click()
      
      cy.get('[data-cy="success-message"]')
        .should('be.visible')
        .and('contain.text', `用户 ${user.name} 创建成功`)
    })
  })
  
  it('应该测试不同角色的登录', function() {
    this.testData.loginCredentials.forEach((credential) => {
      cy.visit('/login')
      
      cy.get('[data-cy="username"]').type(credential.username)
      cy.get('[data-cy="password"]').type(credential.password)
      cy.get('[data-cy="login-button"]').click()
      
      // 根据角色验证不同的页面
      if (credential.role === 'administrator') {
        cy.url().should('include', '/admin')
        cy.get('[data-cy="admin-panel"]').should('be.visible')
      } else {
        cy.url().should('include', '/dashboard')
        cy.get('[data-cy="user-dashboard"]').should('be.visible')
      }
      
      // 登出
      cy.get('[data-cy="logout-button"]').click()
    })
  })
})
```

## 页面对象模式

### 页面对象类

```javascript
// cypress/support/pages/LoginPage.js
export class LoginPage {
  // 元素选择器
  elements = {
    usernameInput: '[data-cy="username"]',
    passwordInput: '[data-cy="password"]',
    loginButton: '[data-cy="login-button"]',
    errorMessage: '[data-cy="error-message"]',
    forgotPasswordLink: '[data-cy="forgot-password"]'
  }
  
  // 页面操作
  visit() {
    cy.visit('/login')
    return this
  }
  
  enterUsername(username) {
    cy.get(this.elements.usernameInput).type(username)
    return this
  }
  
  enterPassword(password) {
    cy.get(this.elements.passwordInput).type(password)
    return this
  }
  
  clickLogin() {
    cy.get(this.elements.loginButton).click()
    return this
  }
  
  login(username, password) {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLogin()
    return this
  }
  
  // 验证方法
  shouldShowError(message) {
    cy.get(this.elements.errorMessage)
      .should('be.visible')
      .and('contain.text', message)
    return this
  }
  
  shouldRedirectToDashboard() {
    cy.url().should('include', '/dashboard')
    return this
  }
}
```

```javascript
// cypress/support/pages/UserListPage.js
export class UserListPage {
  elements = {
    userList: '[data-cy="user-list"]',
    userItem: '[data-cy="user-item"]',
    addUserButton: '[data-cy="add-user-button"]',
    searchInput: '[data-cy="search-input"]',
    filterSelect: '[data-cy="filter-select"]',
    loadingSpinner: '[data-cy="loading"]',
    emptyState: '[data-cy="empty-state"]'
  }
  
  visit() {
    cy.visit('/users')
    return this
  }
  
  waitForLoad() {
    cy.get(this.elements.loadingSpinner).should('not.exist')
    return this
  }
  
  searchUsers(query) {
    cy.get(this.elements.searchInput).type(query)
    return this
  }
  
  filterByRole(role) {
    cy.get(this.elements.filterSelect).select(role)
    return this
  }
  
  clickAddUser() {
    cy.get(this.elements.addUserButton).click()
    return this
  }
  
  getUserByName(name) {
    return cy.get(this.elements.userItem).contains(name)
  }
  
  shouldHaveUserCount(count) {
    cy.get(this.elements.userItem).should('have.length', count)
    return this
  }
  
  shouldShowEmptyState() {
    cy.get(this.elements.emptyState).should('be.visible')
    return this
  }
}
```

### 使用页面对象

```javascript
// cypress/e2e/user-management.cy.js
import { LoginPage } from '../support/pages/LoginPage'
import { UserListPage } from '../support/pages/UserListPage'

describe('用户管理测试', () => {
  const loginPage = new LoginPage()
  const userListPage = new UserListPage()
  
  beforeEach(() => {
    // 登录
    loginPage
      .visit()
      .login('admin', 'admin123')
      .shouldRedirectToDashboard()
  })
  
  it('应该显示用户列表', () => {
    userListPage
      .visit()
      .waitForLoad()
      .shouldHaveUserCount(5)
  })
  
  it('应该能够搜索用户', () => {
    userListPage
      .visit()
      .waitForLoad()
      .searchUsers('张三')
      .shouldHaveUserCount(1)
      .getUserByName('张三').should('be.visible')
  })
  
  it('应该能够按角色过滤用户', () => {
    userListPage
      .visit()
      .waitForLoad()
      .filterByRole('管理员')
      .shouldHaveUserCount(2)
  })
  
  it('应该显示空状态', () => {
    userListPage
      .visit()
      .waitForLoad()
      .searchUsers('不存在的用户')
      .shouldShowEmptyState()
  })
})
```

## 组件测试

### React 组件测试

```jsx
// src/components/UserCard.cy.jsx
import UserCard from './UserCard'

describe('UserCard 组件测试', () => {
  const mockUser = {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: '/avatars/zhangsan.jpg',
    role: '管理员',
    status: 'active'
  }
  
  it('应该渲染用户信息', () => {
    cy.mount(<UserCard user={mockUser} />)
    
    cy.get('[data-cy="user-name"]').should('contain.text', '张三')
    cy.get('[data-cy="user-email"]').should('contain.text', 'zhangsan@example.com')
    cy.get('[data-cy="user-role"]').should('contain.text', '管理员')
    cy.get('[data-cy="user-avatar"]').should('have.attr', 'src', '/avatars/zhangsan.jpg')
  })
  
  it('应该处理点击事件', () => {
    const onEdit = cy.stub().as('onEdit')
    const onDelete = cy.stub().as('onDelete')
    
    cy.mount(
      <UserCard 
        user={mockUser} 
        onEdit={onEdit}
        onDelete={onDelete}
      />
    )
    
    cy.get('[data-cy="edit-button"]').click()
    cy.get('@onEdit').should('have.been.calledWith', mockUser)
    
    cy.get('[data-cy="delete-button"]').click()
    cy.get('@onDelete').should('have.been.calledWith', mockUser.id)
  })
  
  it('应该显示不同的状态', () => {
    const inactiveUser = { ...mockUser, status: 'inactive' }
    
    cy.mount(<UserCard user={inactiveUser} />)
    
    cy.get('[data-cy="user-status"]')
      .should('contain.text', '未激活')
      .and('have.class', 'status-inactive')
  })
  
  it('应该处理缺失的头像', () => {
    const userWithoutAvatar = { ...mockUser, avatar: null }
    
    cy.mount(<UserCard user={userWithoutAvatar} />)
    
    cy.get('[data-cy="user-avatar"]')
      .should('have.attr', 'src')
      .and('include', 'default-avatar')
  })
})
```

### Vue 组件测试

```javascript
// src/components/TodoList.cy.js
import TodoList from './TodoList.vue'

describe('TodoList 组件测试', () => {
  const mockTodos = [
    { id: 1, text: '学习 Cypress', completed: false },
    { id: 2, text: '写测试用例', completed: true },
    { id: 3, text: '部署应用', completed: false }
  ]
  
  it('应该渲染待办事项列表', () => {
    cy.mount(TodoList, {
      props: {
        todos: mockTodos
      }
    })
    
    cy.get('[data-cy="todo-item"]').should('have.length', 3)
    cy.get('[data-cy="todo-text"]').first().should('contain.text', '学习 Cypress')
  })
  
  it('应该能够添加新的待办事项', () => {
    cy.mount(TodoList, {
      props: {
        todos: []
      }
    })
    
    cy.get('[data-cy="todo-input"]').type('新的待办事项')
    cy.get('[data-cy="add-button"]').click()
    
    cy.get('[data-cy="todo-item"]').should('have.length', 1)
    cy.get('[data-cy="todo-text"]').should('contain.text', '新的待办事项')
  })
  
  it('应该能够切换完成状态', () => {
    cy.mount(TodoList, {
      props: {
        todos: mockTodos
      }
    })
    
    cy.get('[data-cy="todo-checkbox"]').first().click()
    cy.get('[data-cy="todo-item"]').first().should('have.class', 'completed')
  })
  
  it('应该能够删除待办事项', () => {
    cy.mount(TodoList, {
      props: {
        todos: mockTodos
      }
    })
    
    cy.get('[data-cy="delete-button"]').first().click()
    cy.get('[data-cy="todo-item"]').should('have.length', 2)
  })
})
```

## CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
        browser: [chrome, firefox, edge]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
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
          group: 'Tests on ${{ matrix.browser }}'
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots-${{ matrix.browser }}
          path: cypress/screenshots
      
      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos-${{ matrix.browser }}
          path: cypress/videos
```

### Docker 集成

```dockerfile
# Dockerfile.cypress
FROM cypress/included:12.7.0

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 运行测试
CMD ["npm", "run", "cy:run"]
```

```yaml
# docker-compose.cypress.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=test
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  cypress:
    build:
      context: .
      dockerfile: Dockerfile.cypress
    depends_on:
      app:
        condition: service_healthy
    environment:
      - CYPRESS_baseUrl=http://app:3000
    volumes:
      - ./cypress/videos:/app/cypress/videos
      - ./cypress/screenshots:/app/cypress/screenshots
```

## 最佳实践

### 测试策略

```javascript
// cypress/support/utils/testHelpers.js

// 数据属性选择器
export const getByTestId = (testId) => `[data-cy="${testId}"]`

// 等待网络请求
export const waitForNetworkIdle = (timeout = 2000) => {
  cy.window().then((win) => {
    let requestCount = 0
    
    // 监听网络请求
    const originalFetch = win.fetch
    win.fetch = (...args) => {
      requestCount++
      return originalFetch(...args).finally(() => {
        requestCount--
      })
    }
    
    // 等待所有请求完成
    cy.waitUntil(() => requestCount === 0, {
      timeout,
      interval: 100
    })
  })
}

// 模拟慢网络
export const simulateSlowNetwork = () => {
  cy.intercept('**', (req) => {
    req.reply((res) => {
      res.delay(2000) // 2秒延迟
    })
  })
}

// 清理测试数据
export const cleanupTestData = () => {
  cy.task('db:seed') // 重置数据库
  cy.clearCookies()
  cy.clearLocalStorage()
  cy.clearSessionStorage()
}

// 截图比较
export const compareScreenshot = (name, options = {}) => {
  cy.screenshot(name, {
    capture: 'viewport',
    ...options
  })
}
```

### 错误处理和调试

```javascript
// cypress/support/commands.js

// 调试命令
Cypress.Commands.add('debug', () => {
  cy.then(() => {
    debugger // 在浏览器中触发断点
  })
})

// 条件执行
Cypress.Commands.add('conditionalClick', (selector, condition) => {
  cy.get('body').then(($body) => {
    if ($body.find(selector).length > 0 && condition) {
      cy.get(selector).click()
    }
  })
})

// 重试机制
Cypress.Commands.add('retryableClick', (selector, maxRetries = 3) => {
  const clickWithRetry = (attempt = 1) => {
    cy.get(selector).then(($el) => {
      try {
        $el.click()
      } catch (error) {
        if (attempt < maxRetries) {
          cy.wait(1000)
          clickWithRetry(attempt + 1)
        } else {
          throw error
        }
      }
    })
  }
  
  clickWithRetry()
})

// 智能等待
Cypress.Commands.add('smartWait', (selector, action = 'exist') => {
  const actions = {
    exist: () => cy.get(selector).should('exist'),
    visible: () => cy.get(selector).should('be.visible'),
    clickable: () => cy.get(selector).should('not.be.disabled')
  }
  
  return actions[action]()
})
```

### 性能测试

```javascript
// cypress/e2e/performance.cy.js
describe('性能测试', () => {
  it('应该在合理时间内加载页面', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        win.performance.mark('start')
      },
      onLoad: (win) => {
        win.performance.mark('end')
        win.performance.measure('pageLoad', 'start', 'end')
      }
    })
    
    cy.window().then((win) => {
      const measure = win.performance.getEntriesByName('pageLoad')[0]
      expect(measure.duration).to.be.lessThan(3000) // 3秒内加载
    })
  })
  
  it('应该监控 Core Web Vitals', () => {
    cy.visit('/')
    
    // 监控 LCP (Largest Contentful Paint)
    cy.window().then((win) => {
      return new Promise((resolve) => {
        new win.PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lcp = entries[entries.length - 1]
          resolve(lcp.startTime)
        }).observe({ entryTypes: ['largest-contentful-paint'] })
        
        setTimeout(() => resolve(null), 5000)
      })
    }).then((lcp) => {
      if (lcp) {
        expect(lcp).to.be.lessThan(2500) // LCP 应小于 2.5s
      }
    })
  })
  
  it('应该检查资源加载时间', () => {
    cy.visit('/')
    
    cy.window().then((win) => {
      const resources = win.performance.getEntriesByType('resource')
      
      resources.forEach((resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          expect(resource.duration).to.be.lessThan(1000) // 资源加载时间小于1秒
        }
      })
    })
  })
})
```

## 故障排除

### 常见问题解决

```javascript
// cypress/support/troubleshooting.js

// 处理不稳定的测试
export const handleFlaky = {
  // 等待元素稳定
  waitForStable: (selector) => {
    cy.get(selector).should('be.visible')
    cy.wait(100) // 短暂等待
    cy.get(selector).should('be.visible')
  },
  
  // 重试点击
  retryClick: (selector, maxAttempts = 3) => {
    let attempts = 0
    
    const attemptClick = () => {
      attempts++
      
      cy.get(selector).then(($el) => {
        if ($el.is(':visible') && !$el.is(':disabled')) {
          $el.click()
        } else if (attempts < maxAttempts) {
          cy.wait(500)
          attemptClick()
        } else {
          throw new Error(`无法点击元素 ${selector} 在 ${maxAttempts} 次尝试后`)
        }
      })
    }
    
    attemptClick()
  },
  
  // 处理异步加载
  waitForAsyncLoad: (selector, timeout = 10000) => {
    cy.get(selector, { timeout }).should('exist')
    cy.get(selector).should('not.have.class', 'loading')
  }
}

// 调试工具
export const debugTools = {
  // 打印元素信息
  logElement: (selector) => {
    cy.get(selector).then(($el) => {
      console.log('Element info:', {
        selector,
        text: $el.text(),
        html: $el.html(),
        attributes: $el[0].attributes,
        position: $el.offset(),
        size: { width: $el.width(), height: $el.height() }
      })
    })
  },
  
  // 截图调试
  debugScreenshot: (name) => {
    cy.screenshot(`debug-${name}-${Date.now()}`)
  },
  
  // 等待并记录
  waitAndLog: (selector, message) => {
    cy.log(message)
    cy.get(selector).should('be.visible')
    cy.log(`${message} - 完成`)
  }
}
```

### 调试脚本

```bash
#!/bin/bash
# debug-cypress.sh

echo "=== Cypress 调试信息 ==="
echo

echo "1. Cypress 版本:"
npx cypress version
echo

echo "2. 浏览器信息:"
npx cypress info
echo

echo "3. 配置验证:"
npx cypress verify
echo

echo "4. 测试文件列表:"
find cypress/e2e -name "*.cy.js" -o -name "*.cy.ts"
echo

echo "5. 最近的测试运行日志:"
if [ -d "cypress/videos" ]; then
    echo "视频文件:"
    ls -la cypress/videos/
fi

if [ -d "cypress/screenshots" ]; then
    echo "截图文件:"
    ls -la cypress/screenshots/
fi

echo
echo "6. 系统信息:"
node --version
npm --version
echo "操作系统: $(uname -a)"

echo
echo "调试信息收集完成"
```

## 参考资源

### 📚 学习资源

- [Cypress 官方文档](https://docs.cypress.io/)
- [Cypress GitHub 仓库](https://github.com/cypress-io/cypress)
- [Cypress 最佳实践](https://docs.cypress.io/guides/references/best-practices)
- [Cypress 示例项目](https://github.com/cypress-io/cypress-example-kitchensink)

### 🛠️ 相关工具

- **测试工具**: Playwright, Selenium, TestCafe
- **断言库**: Chai, Jest, Jasmine
- **Mock 工具**: MSW, Nock, Sinon
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **报告工具**: Mochawesome, Allure, Percy

### 📖 进阶主题

- [视觉回归测试](https://docs.cypress.io/guides/tooling/visual-testing)
- [API 测试策略](https://docs.cypress.io/guides/guides/network-requests)
- [测试数据管理](https://docs.cypress.io/guides/guides/test-data)
- [跨浏览器测试](https://docs.cypress.io/guides/guides/cross-browser-testing)

---

> 💡 **提示**：Cypress 提供了强大的端到端测试能力，合理使用页面对象模式、自定义命令和数据驱动测试可以大大提升测试效率和可维护性！