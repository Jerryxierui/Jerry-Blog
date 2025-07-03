# 单元测试最佳实践

## 简介

单元测试是软件测试的基础，它专注于测试应用程序中最小的可测试单元（通常是函数、方法或类）。良好的单元测试能够提高代码质量、减少 bug、促进重构，并作为代码的活文档。

### 核心价值
- **快速反馈**：快速发现代码变更引入的问题
- **重构信心**：安全地重构代码而不破坏功能
- **文档作用**：测试用例描述了代码的预期行为
- **设计改进**：编写测试促使更好的代码设计
- **回归防护**：防止已修复的 bug 再次出现

### 测试原则
- **FIRST 原则**：Fast（快速）、Independent（独立）、Repeatable（可重复）、Self-Validating（自验证）、Timely（及时）
- **单一职责**：每个测试只验证一个行为
- **可读性**：测试代码应该清晰易懂
- **可维护性**：测试应该易于维护和更新

## 测试结构与组织

### 标准测试结构

```javascript
// math-utils.js
export class Calculator {
  add(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers')
    }
    return a + b
  }
  
  subtract(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers')
    }
    return a - b
  }
  
  multiply(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers')
    }
    return a * b
  }
  
  divide(a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers')
    }
    if (b === 0) {
      throw new Error('Division by zero is not allowed')
    }
    return a / b
  }
  
  power(base, exponent) {
    if (typeof base !== 'number' || typeof exponent !== 'number') {
      throw new Error('Both arguments must be numbers')
    }
    return Math.pow(base, exponent)
  }
}

export const MathUtils = {
  factorial(n) {
    if (!Number.isInteger(n) || n < 0) {
      throw new Error('Input must be a non-negative integer')
    }
    if (n === 0 || n === 1) return 1
    return n * this.factorial(n - 1)
  },
  
  isPrime(n) {
    if (!Number.isInteger(n) || n < 2) return false
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false
    }
    return true
  },
  
  gcd(a, b) {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('Both arguments must be integers')
    }
    a = Math.abs(a)
    b = Math.abs(b)
    while (b !== 0) {
      [a, b] = [b, a % b]
    }
    return a
  }
}
```

```javascript
// math-utils.test.js
import { Calculator, MathUtils } from './math-utils'

// 使用 describe 组织测试套件
describe('Calculator', () => {
  let calculator
  
  // 在每个测试前创建新实例
  beforeEach(() => {
    calculator = new Calculator()
  })
  
  // 测试正常情况
  describe('add method', () => {
    test('should add two positive numbers correctly', () => {
      expect(calculator.add(2, 3)).toBe(5)
    })
    
    test('should add negative numbers correctly', () => {
      expect(calculator.add(-2, -3)).toBe(-5)
    })
    
    test('should add positive and negative numbers correctly', () => {
      expect(calculator.add(5, -3)).toBe(2)
    })
    
    test('should handle decimal numbers', () => {
      expect(calculator.add(0.1, 0.2)).toBeCloseTo(0.3)
    })
    
    test('should handle zero', () => {
      expect(calculator.add(5, 0)).toBe(5)
      expect(calculator.add(0, 0)).toBe(0)
    })
  })
  
  // 测试边界条件和错误情况
  describe('add method - error cases', () => {
    test('should throw error when first argument is not a number', () => {
      expect(() => calculator.add('2', 3)).toThrow('Both arguments must be numbers')
    })
    
    test('should throw error when second argument is not a number', () => {
      expect(() => calculator.add(2, '3')).toThrow('Both arguments must be numbers')
    })
    
    test('should throw error when both arguments are not numbers', () => {
      expect(() => calculator.add('2', '3')).toThrow('Both arguments must be numbers')
    })
    
    test('should throw error with null arguments', () => {
      expect(() => calculator.add(null, 3)).toThrow('Both arguments must be numbers')
      expect(() => calculator.add(2, null)).toThrow('Both arguments must be numbers')
    })
    
    test('should throw error with undefined arguments', () => {
      expect(() => calculator.add(undefined, 3)).toThrow('Both arguments must be numbers')
      expect(() => calculator.add(2, undefined)).toThrow('Both arguments must be numbers')
    })
  })
  
  describe('divide method', () => {
    test('should divide two numbers correctly', () => {
      expect(calculator.divide(10, 2)).toBe(5)
      expect(calculator.divide(7, 2)).toBe(3.5)
    })
    
    test('should handle negative numbers', () => {
      expect(calculator.divide(-10, 2)).toBe(-5)
      expect(calculator.divide(10, -2)).toBe(-5)
      expect(calculator.divide(-10, -2)).toBe(5)
    })
    
    test('should throw error when dividing by zero', () => {
      expect(() => calculator.divide(10, 0)).toThrow('Division by zero is not allowed')
    })
    
    test('should handle division by very small numbers', () => {
      expect(calculator.divide(1, 0.1)).toBeCloseTo(10)
    })
  })
})

describe('MathUtils', () => {
  describe('factorial', () => {
    test('should calculate factorial of positive integers', () => {
      expect(MathUtils.factorial(0)).toBe(1)
      expect(MathUtils.factorial(1)).toBe(1)
      expect(MathUtils.factorial(5)).toBe(120)
      expect(MathUtils.factorial(10)).toBe(3628800)
    })
    
    test('should throw error for negative numbers', () => {
      expect(() => MathUtils.factorial(-1)).toThrow('Input must be a non-negative integer')
      expect(() => MathUtils.factorial(-5)).toThrow('Input must be a non-negative integer')
    })
    
    test('should throw error for non-integers', () => {
      expect(() => MathUtils.factorial(3.5)).toThrow('Input must be a non-negative integer')
      expect(() => MathUtils.factorial('5')).toThrow('Input must be a non-negative integer')
    })
  })
  
  describe('isPrime', () => {
    test('should identify prime numbers correctly', () => {
      expect(MathUtils.isPrime(2)).toBe(true)
      expect(MathUtils.isPrime(3)).toBe(true)
      expect(MathUtils.isPrime(5)).toBe(true)
      expect(MathUtils.isPrime(7)).toBe(true)
      expect(MathUtils.isPrime(11)).toBe(true)
      expect(MathUtils.isPrime(13)).toBe(true)
    })
    
    test('should identify non-prime numbers correctly', () => {
      expect(MathUtils.isPrime(1)).toBe(false)
      expect(MathUtils.isPrime(4)).toBe(false)
      expect(MathUtils.isPrime(6)).toBe(false)
      expect(MathUtils.isPrime(8)).toBe(false)
      expect(MathUtils.isPrime(9)).toBe(false)
      expect(MathUtils.isPrime(10)).toBe(false)
    })
    
    test('should handle edge cases', () => {
      expect(MathUtils.isPrime(0)).toBe(false)
      expect(MathUtils.isPrime(-1)).toBe(false)
      expect(MathUtils.isPrime(2.5)).toBe(false)
    })
  })
  
  describe('gcd', () => {
    test('should calculate GCD correctly', () => {
      expect(MathUtils.gcd(12, 8)).toBe(4)
      expect(MathUtils.gcd(48, 18)).toBe(6)
      expect(MathUtils.gcd(7, 13)).toBe(1)
    })
    
    test('should handle negative numbers', () => {
      expect(MathUtils.gcd(-12, 8)).toBe(4)
      expect(MathUtils.gcd(12, -8)).toBe(4)
      expect(MathUtils.gcd(-12, -8)).toBe(4)
    })
    
    test('should handle zero', () => {
      expect(MathUtils.gcd(0, 5)).toBe(5)
      expect(MathUtils.gcd(5, 0)).toBe(5)
    })
    
    test('should throw error for non-integers', () => {
      expect(() => MathUtils.gcd(3.5, 2)).toThrow('Both arguments must be integers')
      expect(() => MathUtils.gcd(3, 2.5)).toThrow('Both arguments must be integers')
    })
  })
})
```

### 测试命名约定

```javascript
// 好的测试命名示例
describe('UserService', () => {
  describe('createUser', () => {
    test('should create user with valid data', () => {})
    test('should throw error when email is invalid', () => {})
    test('should throw error when email already exists', () => {})
    test('should hash password before saving', () => {})
  })
  
  describe('getUserById', () => {
    test('should return user when id exists', () => {})
    test('should return null when id does not exist', () => {})
    test('should throw error when id is invalid format', () => {})
  })
})

// 使用 BDD 风格的命名
describe('When user submits registration form', () => {
  describe('Given valid user data', () => {
    test('Then user should be created successfully', () => {})
    test('Then welcome email should be sent', () => {})
  })
  
  describe('Given invalid email format', () => {
    test('Then validation error should be thrown', () => {})
    test('Then user should not be created', () => {})
  })
})
```

## 测试数据管理

### 测试数据工厂

```javascript
// test-factories.js
export class UserFactory {
  static create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active',
      createdAt: new Date(),
      ...overrides
    }
  }
  
  static createMany(count = 3, overrides = {}) {
    return Array.from({ length: count }, (_, index) => 
      this.create({ 
        id: index + 1, 
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
        ...overrides 
      })
    )
  }
  
  static createAdmin(overrides = {}) {
    return this.create({
      role: 'admin',
      permissions: ['read', 'write', 'delete'],
      ...overrides
    })
  }
  
  static createInactive(overrides = {}) {
    return this.create({
      status: 'inactive',
      deactivatedAt: new Date(),
      ...overrides
    })
  }
}

export class ProductFactory {
  static create(overrides = {}) {
    return {
      id: Math.floor(Math.random() * 1000),
      name: 'Sample Product',
      price: 99.99,
      category: 'electronics',
      inStock: true,
      quantity: 10,
      description: 'A sample product for testing',
      ...overrides
    }
  }
  
  static createOutOfStock(overrides = {}) {
    return this.create({
      inStock: false,
      quantity: 0,
      ...overrides
    })
  }
  
  static createExpensive(overrides = {}) {
    return this.create({
      price: 999.99,
      category: 'luxury',
      ...overrides
    })
  }
}
```

### 测试数据构建器

```javascript
// test-builders.js
export class UserBuilder {
  constructor() {
    this.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      status: 'active'
    }
  }
  
  withId(id) {
    this.user.id = id
    return this
  }
  
  withName(name) {
    this.user.name = name
    return this
  }
  
  withEmail(email) {
    this.user.email = email
    return this
  }
  
  withAge(age) {
    this.user.age = age
    return this
  }
  
  asAdmin() {
    this.user.role = 'admin'
    this.user.permissions = ['read', 'write', 'delete']
    return this
  }
  
  asInactive() {
    this.user.status = 'inactive'
    this.user.deactivatedAt = new Date()
    return this
  }
  
  build() {
    return { ...this.user }
  }
}

// 使用示例
const user = new UserBuilder()
  .withName('Jane Smith')
  .withEmail('jane@example.com')
  .asAdmin()
  .build()
```

### 测试数据使用示例

```javascript
// user-service.test.js
import { UserService } from './user-service'
import { UserFactory, UserBuilder } from './test-factories'

describe('UserService', () => {
  let userService
  
  beforeEach(() => {
    userService = new UserService()
  })
  
  describe('validateUser', () => {
    test('should validate user with valid data', () => {
      const user = UserFactory.create()
      
      expect(() => userService.validateUser(user)).not.toThrow()
    })
    
    test('should throw error for invalid email', () => {
      const user = UserFactory.create({ email: 'invalid-email' })
      
      expect(() => userService.validateUser(user)).toThrow('Invalid email format')
    })
    
    test('should throw error for underage user', () => {
      const user = UserFactory.create({ age: 16 })
      
      expect(() => userService.validateUser(user)).toThrow('User must be at least 18 years old')
    })
  })
  
  describe('calculateUserStats', () => {
    test('should calculate stats for multiple users', () => {
      const users = [
        UserFactory.create({ age: 25 }),
        UserFactory.create({ age: 35 }),
        UserFactory.create({ age: 45 })
      ]
      
      const stats = userService.calculateUserStats(users)
      
      expect(stats.averageAge).toBe(35)
      expect(stats.totalUsers).toBe(3)
    })
    
    test('should handle admin users correctly', () => {
      const users = [
        UserFactory.create(),
        UserFactory.createAdmin(),
        UserFactory.createAdmin()
      ]
      
      const stats = userService.calculateUserStats(users)
      
      expect(stats.adminCount).toBe(2)
      expect(stats.regularUserCount).toBe(1)
    })
  })
  
  describe('filterActiveUsers', () => {
    test('should return only active users', () => {
      const users = [
        UserFactory.create(),
        UserFactory.createInactive(),
        UserFactory.create(),
        UserFactory.createInactive()
      ]
      
      const activeUsers = userService.filterActiveUsers(users)
      
      expect(activeUsers).toHaveLength(2)
      expect(activeUsers.every(user => user.status === 'active')).toBe(true)
    })
  })
  
  describe('complex user scenarios', () => {
    test('should handle complex user with builder pattern', () => {
      const complexUser = new UserBuilder()
        .withName('Super Admin')
        .withEmail('admin@company.com')
        .withAge(40)
        .asAdmin()
        .build()
      
      const result = userService.processUser(complexUser)
      
      expect(result.canManageUsers).toBe(true)
      expect(result.accessLevel).toBe('full')
    })
  })
})
```

## Mock 和 Stub 策略

### 依赖注入和 Mock

```javascript
// email-service.js
export class EmailService {
  constructor(apiClient) {
    this.apiClient = apiClient
  }
  
  async sendWelcomeEmail(user) {
    const template = await this.apiClient.getTemplate('welcome')
    const personalizedContent = this.personalizeTemplate(template, user)
    
    return this.apiClient.sendEmail({
      to: user.email,
      subject: 'Welcome!',
      content: personalizedContent
    })
  }
  
  personalizeTemplate(template, user) {
    return template
      .replace('{{name}}', user.name)
      .replace('{{email}}', user.email)
  }
}

// user-registration.js
export class UserRegistration {
  constructor(userRepository, emailService, logger) {
    this.userRepository = userRepository
    this.emailService = emailService
    this.logger = logger
  }
  
  async registerUser(userData) {
    try {
      // 验证用户数据
      this.validateUserData(userData)
      
      // 检查邮箱是否已存在
      const existingUser = await this.userRepository.findByEmail(userData.email)
      if (existingUser) {
        throw new Error('Email already exists')
      }
      
      // 创建用户
      const user = await this.userRepository.create(userData)
      
      // 发送欢迎邮件
      await this.emailService.sendWelcomeEmail(user)
      
      // 记录日志
      this.logger.info(`User registered: ${user.email}`)
      
      return user
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`)
      throw error
    }
  }
  
  validateUserData(userData) {
    if (!userData.name || userData.name.trim().length === 0) {
      throw new Error('Name is required')
    }
    
    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      throw new Error('Valid email is required')
    }
    
    if (!userData.password || userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters')
    }
  }
}
```

```javascript
// user-registration.test.js
import { UserRegistration } from './user-registration'
import { UserFactory } from './test-factories'

describe('UserRegistration', () => {
  let userRegistration
  let mockUserRepository
  let mockEmailService
  let mockLogger
  
  beforeEach(() => {
    // 创建 Mock 对象
    mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn()
    }
    
    mockEmailService = {
      sendWelcomeEmail: jest.fn()
    }
    
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    }
    
    userRegistration = new UserRegistration(
      mockUserRepository,
      mockEmailService,
      mockLogger
    )
  })
  
  describe('registerUser', () => {
    test('should register user successfully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      const createdUser = UserFactory.create(userData)
      
      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockUserRepository.create.mockResolvedValue(createdUser)
      mockEmailService.sendWelcomeEmail.mockResolvedValue(true)
      
      // Act
      const result = await userRegistration.registerUser(userData)
      
      // Assert
      expect(result).toEqual(createdUser)
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email)
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData)
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(createdUser)
      expect(mockLogger.info).toHaveBeenCalledWith(`User registered: ${createdUser.email}`)
    })
    
    test('should throw error when email already exists', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      const existingUser = UserFactory.create({ email: userData.email })
      mockUserRepository.findByEmail.mockResolvedValue(existingUser)
      
      // Act & Assert
      await expect(userRegistration.registerUser(userData))
        .rejects.toThrow('Email already exists')
      
      expect(mockUserRepository.create).not.toHaveBeenCalled()
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled()
      expect(mockLogger.error).toHaveBeenCalledWith('Registration failed: Email already exists')
    })
    
    test('should handle email service failure gracefully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      const createdUser = UserFactory.create(userData)
      
      mockUserRepository.findByEmail.mockResolvedValue(null)
      mockUserRepository.create.mockResolvedValue(createdUser)
      mockEmailService.sendWelcomeEmail.mockRejectedValue(new Error('Email service unavailable'))
      
      // Act & Assert
      await expect(userRegistration.registerUser(userData))
        .rejects.toThrow('Email service unavailable')
      
      expect(mockLogger.error).toHaveBeenCalledWith('Registration failed: Email service unavailable')
    })
  })
  
  describe('validateUserData', () => {
    test('should validate correct user data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
      
      expect(() => userRegistration.validateUserData(userData)).not.toThrow()
    })
    
    test('should throw error for missing name', () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123'
      }
      
      expect(() => userRegistration.validateUserData(userData))
        .toThrow('Name is required')
    })
    
    test('should throw error for invalid email', () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      }
      
      expect(() => userRegistration.validateUserData(userData))
        .toThrow('Valid email is required')
    })
    
    test('should throw error for short password', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123'
      }
      
      expect(() => userRegistration.validateUserData(userData))
        .toThrow('Password must be at least 8 characters')
    })
  })
})
```

### Spy 和部分 Mock

```javascript
// analytics.test.js
import { Analytics } from './analytics'

describe('Analytics', () => {
  let analytics
  let originalConsole
  
  beforeEach(() => {
    analytics = new Analytics()
    originalConsole = console.log
  })
  
  afterEach(() => {
    console.log = originalConsole
  })
  
  test('should track events correctly', () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    
    analytics.track('user_login', { userId: 123 })
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'Event tracked:',
      'user_login',
      { userId: 123 }
    )
    
    consoleSpy.mockRestore()
  })
  
  test('should spy on method calls', () => {
    const trackSpy = jest.spyOn(analytics, 'track')
    
    analytics.trackUserAction('login', { userId: 123 })
    
    expect(trackSpy).toHaveBeenCalledWith('user_login', { userId: 123 })
  })
  
  test('should partially mock object methods', () => {
    const dateUtils = {
      getCurrentTimestamp: () => Date.now(),
      formatDate: (date) => date.toISOString()
    }
    
    // 只 mock 一个方法
    const timestampSpy = jest.spyOn(dateUtils, 'getCurrentTimestamp')
      .mockReturnValue(1234567890)
    
    const result = analytics.createEvent('test', {}, dateUtils)
    
    expect(result.timestamp).toBe(1234567890)
    expect(timestampSpy).toHaveBeenCalled()
    
    // formatDate 方法保持原始实现
    expect(typeof dateUtils.formatDate).toBe('function')
  })
})
```

## 异步代码测试

### Promise 和 async/await 测试

```javascript
// api-client.js
export class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }
  
  async get(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async post(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async uploadFile(endpoint, file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
    
    return response.json()
  }
}

// retry-utils.js
export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
}

export function debounceAsync(func, delay) {
  let timeoutId
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId)
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}
```

```javascript
// async-tests.test.js
import { ApiClient } from './api-client'
import { retryOperation, debounceAsync } from './retry-utils'

// Mock fetch
global.fetch = jest.fn()

describe('ApiClient', () => {
  let apiClient
  
  beforeEach(() => {
    apiClient = new ApiClient('https://api.example.com')
    fetch.mockClear()
  })
  
  describe('get method', () => {
    test('should fetch data successfully', async () => {
      const mockData = { id: 1, name: 'Test' }
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      })
      
      const result = await apiClient.get('/users/1')
      
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('https://api.example.com/users/1')
    })
    
    test('should handle HTTP errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })
      
      await expect(apiClient.get('/users/999'))
        .rejects.toThrow('HTTP 404: Not Found')
    })
    
    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(apiClient.get('/users/1'))
        .rejects.toThrow('Network error')
    })
  })
  
  describe('post method', () => {
    test('should post data successfully', async () => {
      const postData = { name: 'New User', email: 'user@example.com' }
      const responseData = { id: 1, ...postData }
      
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseData
      })
      
      const result = await apiClient.post('/users', postData)
      
      expect(result).toEqual(responseData)
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      )
    })
  })
})

describe('retryOperation', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  test('should succeed on first attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success')
    
    const result = await retryOperation(operation)
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(1)
  })
  
  test('should retry on failure and eventually succeed', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Attempt 1 failed'))
      .mockRejectedValueOnce(new Error('Attempt 2 failed'))
      .mockResolvedValueOnce('success')
    
    const resultPromise = retryOperation(operation, 3, 100)
    
    // 快进时间以触发重试
    jest.advanceTimersByTime(100)
    await Promise.resolve() // 让 Promise 解析
    
    jest.advanceTimersByTime(200)
    await Promise.resolve()
    
    const result = await resultPromise
    
    expect(result).toBe('success')
    expect(operation).toHaveBeenCalledTimes(3)
  })
  
  test('should fail after max retries', async () => {
    const operation = jest.fn().mockRejectedValue(new Error('Always fails'))
    
    const resultPromise = retryOperation(operation, 2, 100)
    
    // 快进时间
    jest.advanceTimersByTime(100)
    await Promise.resolve()
    
    jest.advanceTimersByTime(200)
    await Promise.resolve()
    
    await expect(resultPromise).rejects.toThrow('Always fails')
    expect(operation).toHaveBeenCalledTimes(2)
  })
})

describe('debounceAsync', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  test('should debounce async function calls', async () => {
    const asyncFn = jest.fn().mockResolvedValue('result')
    const debouncedFn = debounceAsync(asyncFn, 1000)
    
    // 快速调用多次
    const promise1 = debouncedFn('arg1')
    const promise2 = debouncedFn('arg2')
    const promise3 = debouncedFn('arg3')
    
    // 快进时间
    jest.advanceTimersByTime(1000)
    
    const results = await Promise.all([promise1, promise2, promise3])
    
    // 只有最后一次调用应该执行
    expect(asyncFn).toHaveBeenCalledTimes(1)
    expect(asyncFn).toHaveBeenCalledWith('arg3')
    expect(results).toEqual(['result', 'result', 'result'])
  })
})
```

### 定时器和延迟测试

```javascript
// timer-functions.js
export class Timer {
  constructor() {
    this.timers = new Map()
  }
  
  setTimeout(callback, delay, id = Symbol()) {
    const timerId = setTimeout(() => {
      callback()
      this.timers.delete(id)
    }, delay)
    
    this.timers.set(id, timerId)
    return id
  }
  
  clearTimeout(id) {
    const timerId = this.timers.get(id)
    if (timerId) {
      clearTimeout(timerId)
      this.timers.delete(id)
    }
  }
  
  clearAll() {
    this.timers.forEach(timerId => clearTimeout(timerId))
    this.timers.clear()
  }
}

export class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = []
  }
  
  async makeRequest(requestFn) {
    const now = Date.now()
    
    // 清理过期的请求记录
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.windowMs
    )
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      
      await new Promise(resolve => setTimeout(resolve, waitTime))
      return this.makeRequest(requestFn)
    }
    
    this.requests.push(now)
    return requestFn()
  }
}
```

```javascript
// timer-functions.test.js
import { Timer, RateLimiter } from './timer-functions'

describe('Timer', () => {
  let timer
  
  beforeEach(() => {
    timer = new Timer()
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    timer.clearAll()
    jest.useRealTimers()
  })
  
  test('should execute callback after delay', () => {
    const callback = jest.fn()
    
    timer.setTimeout(callback, 1000)
    
    expect(callback).not.toHaveBeenCalled()
    
    jest.advanceTimersByTime(1000)
    
    expect(callback).toHaveBeenCalledTimes(1)
  })
  
  test('should clear timeout before execution', () => {
    const callback = jest.fn()
    
    const id = timer.setTimeout(callback, 1000)
    timer.clearTimeout(id)
    
    jest.advanceTimersByTime(1000)
    
    expect(callback).not.toHaveBeenCalled()
  })
  
  test('should clear all timers', () => {
    const callback1 = jest.fn()
    const callback2 = jest.fn()
    
    timer.setTimeout(callback1, 1000)
    timer.setTimeout(callback2, 2000)
    
    timer.clearAll()
    
    jest.advanceTimersByTime(2000)
    
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })
})

describe('RateLimiter', () => {
  let rateLimiter
  
  beforeEach(() => {
    rateLimiter = new RateLimiter(3, 1000) // 3 requests per second
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  test('should allow requests within limit', async () => {
    const requestFn = jest.fn().mockResolvedValue('success')
    
    const promises = [
      rateLimiter.makeRequest(requestFn),
      rateLimiter.makeRequest(requestFn),
      rateLimiter.makeRequest(requestFn)
    ]
    
    const results = await Promise.all(promises)
    
    expect(results).toEqual(['success', 'success', 'success'])
    expect(requestFn).toHaveBeenCalledTimes(3)
  })
  
  test('should delay requests when limit exceeded', async () => {
    const requestFn = jest.fn().mockResolvedValue('success')
    
    // 发起 4 个请求（超过限制）
    const promise1 = rateLimiter.makeRequest(requestFn)
    const promise2 = rateLimiter.makeRequest(requestFn)
    const promise3 = rateLimiter.makeRequest(requestFn)
    const promise4 = rateLimiter.makeRequest(requestFn)
    
    // 前 3 个请求应该立即执行
    await Promise.all([promise1, promise2, promise3])
    expect(requestFn).toHaveBeenCalledTimes(3)
    
    // 第 4 个请求应该被延迟
    jest.advanceTimersByTime(1000)
    await promise4
    
    expect(requestFn).toHaveBeenCalledTimes(4)
  })
})
```

## 错误处理测试

### 异常和错误边界测试

```javascript
// error-handler.js
export class ErrorHandler {
  constructor(logger) {
    this.logger = logger
  }
  
  handleError(error, context = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    }
    
    if (error instanceof ValidationError) {
      this.logger.warn('Validation error:', errorInfo)
      return {
        type: 'validation',
        message: error.message,
        field: error.field
      }
    }
    
    if (error instanceof NetworkError) {
      this.logger.error('Network error:', errorInfo)
      return {
        type: 'network',
        message: 'Network connection failed',
        retryable: true
      }
    }
    
    if (error instanceof AuthenticationError) {
      this.logger.warn('Authentication error:', errorInfo)
      return {
        type: 'auth',
        message: 'Authentication required',
        redirectTo: '/login'
      }
    }
    
    // 未知错误
    this.logger.error('Unknown error:', errorInfo)
    return {
      type: 'unknown',
      message: 'An unexpected error occurred'
    }
  }
  
  async handleAsyncError(asyncOperation, fallback) {
    try {
      return await asyncOperation()
    } catch (error) {
      const errorResult = this.handleError(error)
      
      if (typeof fallback === 'function') {
        return fallback(errorResult)
      }
      
      return fallback
    }
  }
}

// 自定义错误类
export class ValidationError extends Error {
  constructor(message, field) {
    super(message)
    this.name = 'ValidationError'
    this.field = field
  }
}

export class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.name = 'NetworkError'
    this.statusCode = statusCode
  }
}

export class AuthenticationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AuthenticationError'
  }
}
```

```javascript
// error-handler.test.js
import { 
  ErrorHandler, 
  ValidationError, 
  NetworkError, 
  AuthenticationError 
} from './error-handler'

describe('ErrorHandler', () => {
  let errorHandler
  let mockLogger
  
  beforeEach(() => {
    mockLogger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn()
    }
    
    errorHandler = new ErrorHandler(mockLogger)
  })
  
  describe('handleError', () => {
    test('should handle ValidationError correctly', () => {
      const error = new ValidationError('Email is required', 'email')
      
      const result = errorHandler.handleError(error, { userId: 123 })
      
      expect(result).toEqual({
        type: 'validation',
        message: 'Email is required',
        field: 'email'
      })
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Validation error:',
        expect.objectContaining({
          message: 'Email is required',
          context: { userId: 123 }
        })
      )
    })
    
    test('should handle NetworkError correctly', () => {
      const error = new NetworkError('Connection timeout', 408)
      
      const result = errorHandler.handleError(error)
      
      expect(result).toEqual({
        type: 'network',
        message: 'Network connection failed',
        retryable: true
      })
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Network error:',
        expect.objectContaining({
          message: 'Connection timeout'
        })
      )
    })
    
    test('should handle AuthenticationError correctly', () => {
      const error = new AuthenticationError('Token expired')
      
      const result = errorHandler.handleError(error)
      
      expect(result).toEqual({
        type: 'auth',
        message: 'Authentication required',
        redirectTo: '/login'
      })
      
      expect(mockLogger.warn).toHaveBeenCalled()
    })
    
    test('should handle unknown errors', () => {
      const error = new Error('Something unexpected happened')
      
      const result = errorHandler.handleError(error)
      
      expect(result).toEqual({
        type: 'unknown',
        message: 'An unexpected error occurred'
      })
      
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unknown error:',
        expect.objectContaining({
          message: 'Something unexpected happened'
        })
      )
    })
  })
  
  describe('handleAsyncError', () => {
    test('should return result when operation succeeds', async () => {
      const asyncOperation = jest.fn().mockResolvedValue('success')
      
      const result = await errorHandler.handleAsyncError(asyncOperation)
      
      expect(result).toBe('success')
      expect(asyncOperation).toHaveBeenCalled()
    })
    
    test('should handle error and return fallback value', async () => {
      const asyncOperation = jest.fn().mockRejectedValue(
        new ValidationError('Invalid input', 'name')
      )
      const fallback = 'fallback value'
      
      const result = await errorHandler.handleAsyncError(asyncOperation, fallback)
      
      expect(result).toBe('fallback value')
      expect(mockLogger.warn).toHaveBeenCalled()
    })
    
    test('should handle error and call fallback function', async () => {
      const asyncOperation = jest.fn().mockRejectedValue(
        new NetworkError('Connection failed')
      )
      const fallbackFn = jest.fn().mockReturnValue('fallback result')
      
      const result = await errorHandler.handleAsyncError(asyncOperation, fallbackFn)
      
      expect(result).toBe('fallback result')
      expect(fallbackFn).toHaveBeenCalledWith({
        type: 'network',
        message: 'Network connection failed',
        retryable: true
      })
    })
  })
})

// 测试自定义错误类
describe('Custom Error Classes', () => {
  test('ValidationError should have correct properties', () => {
    const error = new ValidationError('Email is invalid', 'email')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ValidationError)
    expect(error.name).toBe('ValidationError')
    expect(error.message).toBe('Email is invalid')
    expect(error.field).toBe('email')
  })
  
  test('NetworkError should have correct properties', () => {
    const error = new NetworkError('Request timeout', 408)
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(NetworkError)
    expect(error.name).toBe('NetworkError')
    expect(error.message).toBe('Request timeout')
    expect(error.statusCode).toBe(408)
  })
  
  test('AuthenticationError should have correct properties', () => {
    const error = new AuthenticationError('Invalid credentials')
    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.name).toBe('AuthenticationError')
    expect(error.message).toBe('Invalid credentials')
  })
})
```

## 测试最佳实践总结

### 测试设计原则

1. **测试金字塔**：大量单元测试，适量集成测试，少量端到端测试
2. **测试独立性**：每个测试应该独立运行，不依赖其他测试
3. **测试可读性**：测试代码应该清晰表达意图
4. **测试覆盖率**：追求有意义的覆盖率，而非 100% 覆盖率
5. **测试维护性**：测试代码也需要重构和维护

### 常见反模式

```javascript
// ❌ 不好的测试示例
describe('Bad test examples', () => {
  // 测试过于复杂
  test('complex test with multiple assertions', () => {
    const user = createUser()
    const result = processUser(user)
    
    expect(result.name).toBe('John')
    expect(result.email).toBe('john@example.com')
    expect(result.isActive).toBe(true)
    expect(result.permissions).toContain('read')
    expect(result.createdAt).toBeInstanceOf(Date)
    // 太多断言，难以定位问题
  })
  
  // 测试实现细节而非行为
  test('tests implementation details', () => {
    const calculator = new Calculator()
    
    // 不应该测试私有方法或内部状态
    expect(calculator._internalState).toBeDefined()
    expect(calculator._validateInput).toBeInstanceOf(Function)
  })
  
  // 测试依赖外部状态
  test('depends on external state', () => {
    // 依赖全局变量或外部状态
    global.currentUser = { id: 1 }
    
    const result = getCurrentUserData()
    expect(result.id).toBe(1)
  })
})

// ✅ 好的测试示例
describe('Good test examples', () => {
  // 单一职责，清晰的测试意图
  test('should calculate user age correctly', () => {
    const birthDate = new Date('1990-01-01')
    const age = calculateAge(birthDate)
    
    expect(age).toBeGreaterThan(30)
  })
  
  // 测试行为而非实现
  test('should notify user when order is completed', () => {
    const mockNotificationService = {
      send: jest.fn()
    }
    
    const orderService = new OrderService(mockNotificationService)
    orderService.completeOrder('order-123')
    
    expect(mockNotificationService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'order_completed',
        orderId: 'order-123'
      })
    )
  })
  
  // 独立的测试，不依赖外部状态
  test('should format currency correctly', () => {
    const amount = 1234.56
    const formatted = formatCurrency(amount, 'USD')
    
    expect(formatted).toBe('$1,234.56')
  })
})
```

### 测试清单

- [ ] **测试命名**：描述性的测试名称
- [ ] **测试结构**：清晰的 Arrange-Act-Assert 结构
- [ ] **边界条件**：测试边界值和异常情况
- [ ] **错误处理**：测试错误路径和异常处理
- [ ] **Mock 使用**：合理使用 Mock，避免过度 Mock
- [ ] **测试数据**：使用工厂或构建器创建测试数据
- [ ] **异步测试**：正确处理 Promise 和异步操作
- [ ] **清理工作**：在 afterEach 中清理状态
- [ ] **覆盖率检查**：确保关键路径被覆盖
- [ ] **性能考虑**：测试应该快速运行

## 参考资源

### 📚 学习资源
- [单元测试艺术](https://www.manning.com/books/the-art-of-unit-testing-second-edition)
- [测试驱动开发](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [JavaScript 测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [前端测试策略](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

### 🛠️ 测试工具
- **测试框架**：Jest, Vitest, Mocha, Jasmine
- **断言库**：Jest (内置), Chai, Should.js
- **Mock 库**：Jest (内置), Sinon, MSW
- **测试工具**：Testing Library, Enzyme
- **覆盖率工具**：Istanbul, NYC, c8

### 📖 进阶主题
- [测试金字塔理论](https://martinfowler.com/articles/practical-test-pyramid.html)
- [契约测试](https://pact.io/)
- [属性测试](https://github.com/dubzzz/fast-check)
- [突变测试](https://stryker-mutator.io/)

---

> 💡 **提示**：好的单元测试不仅能发现 bug，更能改善代码设计。记住：如果代码难以测试，通常说明设计有问题！