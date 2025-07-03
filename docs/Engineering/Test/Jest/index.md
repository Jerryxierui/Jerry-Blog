# Jest 单元测试

## 简介

Jest 是由 Facebook 开发的一个功能强大的 JavaScript 测试框架，专注于简单性和零配置。它内置了断言库、模拟功能、代码覆盖率报告等功能，是现代前端和 Node.js 项目的首选测试框架。

### 核心特性
- **零配置**：开箱即用，无需复杂配置
- **快照测试**：自动生成和比较组件快照
- **并行测试**：自动并行运行测试以提高速度
- **内置模拟**：强大的 mock 和 spy 功能
- **代码覆盖率**：内置代码覆盖率报告
- **监视模式**：文件变化时自动重新运行测试
- **异步测试**：完善的异步测试支持

### 应用场景
- **单元测试**：函数、类、模块的独立测试
- **集成测试**：多个模块协作的测试
- **React 组件测试**：配合 React Testing Library
- **API 测试**：HTTP 接口和服务测试
- **TDD/BDD**：测试驱动开发和行为驱动开发

## 安装与配置

### 基础安装

```bash
# 使用 npm 安装
npm install --save-dev jest

# 使用 yarn 安装
yarn add --dev jest

# 全局安装（可选）
npm install -g jest

# TypeScript 支持
npm install --save-dev @types/jest ts-jest typescript

# React 测试支持
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### package.json 配置

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false"
  },
  "jest": {
    "testEnvironment": "node",
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/index.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    },
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"]
  }
}
```

### jest.config.js 配置

```javascript
// jest.config.js
module.exports = {
  // 测试环境
  testEnvironment: 'node', // 或 'jsdom' 用于浏览器环境
  
  // 根目录
  rootDir: '.',
  
  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // 忽略的文件和目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/dist/'
  ],
  
  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },
  
  // 文件扩展名
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // 转换配置
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': 'jest-transform-css'
  },
  
  // 转换忽略
  transformIgnorePatterns: [
    '/node_modules/(?!(module-to-transform)/)',
  ],
  
  // 设置文件
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js'
  ],
  
  // 代码覆盖率配置
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // 全局变量
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  
  // 清除模拟
  clearMocks: true,
  restoreMocks: true,
  
  // 详细输出
  verbose: true,
  
  // 最大工作进程数
  maxWorkers: '50%',
  
  // 测试超时
  testTimeout: 10000
}
```

## 基础测试语法

### 基本测试结构

```javascript
// math.js
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

export function multiply(a, b) {
  return a * b
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}
```

```javascript
// math.test.js
import { add, subtract, multiply, divide } from './math'

// 测试套件
describe('Math functions', () => {
  // 单个测试用例
  test('adds 1 + 2 to equal 3', () => {
    expect(add(1, 2)).toBe(3)
  })
  
  test('subtracts 5 - 3 to equal 2', () => {
    expect(subtract(5, 3)).toBe(2)
  })
  
  test('multiplies 3 * 4 to equal 12', () => {
    expect(multiply(3, 4)).toBe(12)
  })
  
  test('divides 8 / 2 to equal 4', () => {
    expect(divide(8, 2)).toBe(4)
  })
  
  test('throws error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero')
  })
})

// 嵌套测试套件
describe('Edge cases', () => {
  describe('Negative numbers', () => {
    test('adds negative numbers', () => {
      expect(add(-1, -2)).toBe(-3)
    })
  })
  
  describe('Decimal numbers', () => {
    test('adds decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    })
  })
})
```

### 常用匹配器

```javascript
// 基本匹配器
describe('Basic matchers', () => {
  test('equality matchers', () => {
    expect(2 + 2).toBe(4) // 严格相等
    expect({ name: 'John' }).toEqual({ name: 'John' }) // 深度相等
    expect({ name: 'John' }).not.toBe({ name: 'John' }) // 不是同一个对象
  })
  
  test('truthiness matchers', () => {
    expect(true).toBeTruthy()
    expect(false).toBeFalsy()
    expect(null).toBeNull()
    expect(undefined).toBeUndefined()
    expect('hello').toBeDefined()
  })
  
  test('number matchers', () => {
    expect(2 + 2).toBeGreaterThan(3)
    expect(2 + 2).toBeGreaterThanOrEqual(4)
    expect(2 + 2).toBeLessThan(5)
    expect(2 + 2).toBeLessThanOrEqual(4)
    expect(0.1 + 0.2).toBeCloseTo(0.3)
  })
  
  test('string matchers', () => {
    expect('hello world').toMatch(/world/)
    expect('hello world').toMatch('world')
    expect('hello world').toContain('world')
  })
  
  test('array matchers', () => {
    expect(['apple', 'banana', 'orange']).toContain('banana')
    expect(['apple', 'banana']).toHaveLength(2)
    expect([1, 2, 3]).toEqual(expect.arrayContaining([1, 3]))
  })
  
  test('object matchers', () => {
    const user = {
      id: 1,
      name: 'John',
      email: 'john@example.com'
    }
    
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('name', 'John')
    expect(user).toMatchObject({ name: 'John' })
  })
  
  test('exception matchers', () => {
    const throwError = () => {
      throw new Error('Something went wrong')
    }
    
    expect(throwError).toThrow()
    expect(throwError).toThrow('Something went wrong')
    expect(throwError).toThrow(/wrong/)
  })
})
```

## 异步测试

### Promise 测试

```javascript
// async-functions.js
export function fetchUser(id) {
  return fetch(`/api/users/${id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('User not found')
      }
      return response.json()
    })
}

export async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create user')
  }
  
  return response.json()
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

```javascript
// async-functions.test.js
import { fetchUser, createUser, delay } from './async-functions'

// Mock fetch
global.fetch = jest.fn()

describe('Async functions', () => {
  beforeEach(() => {
    fetch.mockClear()
  })
  
  // 使用 async/await
  test('fetches user data', async () => {
    const userData = { id: 1, name: 'John' }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => userData
    })
    
    const user = await fetchUser(1)
    expect(user).toEqual(userData)
    expect(fetch).toHaveBeenCalledWith('/api/users/1')
  })
  
  // 使用 resolves
  test('creates user successfully', () => {
    const userData = { name: 'John', email: 'john@example.com' }
    const createdUser = { id: 1, ...userData }
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => createdUser
    })
    
    return expect(createUser(userData)).resolves.toEqual(createdUser)
  })
  
  // 使用 rejects
  test('handles fetch error', () => {
    fetch.mockResolvedValueOnce({
      ok: false
    })
    
    return expect(fetchUser(999)).rejects.toThrow('User not found')
  })
  
  // 测试延迟函数
  test('delay function waits specified time', async () => {
    const start = Date.now()
    await delay(100)
    const end = Date.now()
    
    expect(end - start).toBeGreaterThanOrEqual(100)
  })
  
  // 使用 done 回调
  test('callback-based async test', (done) => {
    setTimeout(() => {
      expect(true).toBe(true)
      done()
    }, 100)
  })
})
```

### 定时器测试

```javascript
// timer-functions.js
export function debounce(func, delay) {
  let timeoutId
  
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}

export function throttle(func, limit) {
  let inThrottle
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

export class Timer {
  constructor(callback, interval) {
    this.callback = callback
    this.interval = interval
    this.timerId = null
  }
  
  start() {
    this.timerId = setInterval(this.callback, this.interval)
  }
  
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }
}
```

```javascript
// timer-functions.test.js
import { debounce, throttle, Timer } from './timer-functions'

describe('Timer functions', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  test('debounce delays function execution', () => {
    const mockFn = jest.fn()
    const debouncedFn = debounce(mockFn, 1000)
    
    // 快速调用多次
    debouncedFn()
    debouncedFn()
    debouncedFn()
    
    // 函数还未执行
    expect(mockFn).not.toHaveBeenCalled()
    
    // 快进时间
    jest.advanceTimersByTime(1000)
    
    // 现在函数应该被调用一次
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
  
  test('throttle limits function calls', () => {
    const mockFn = jest.fn()
    const throttledFn = throttle(mockFn, 1000)
    
    // 快速调用多次
    throttledFn()
    throttledFn()
    throttledFn()
    
    // 只有第一次调用生效
    expect(mockFn).toHaveBeenCalledTimes(1)
    
    // 快进时间
    jest.advanceTimersByTime(1000)
    
    // 再次调用
    throttledFn()
    expect(mockFn).toHaveBeenCalledTimes(2)
  })
  
  test('Timer class works correctly', () => {
    const mockCallback = jest.fn()
    const timer = new Timer(mockCallback, 1000)
    
    timer.start()
    
    // 初始时未调用
    expect(mockCallback).not.toHaveBeenCalled()
    
    // 快进 1 秒
    jest.advanceTimersByTime(1000)
    expect(mockCallback).toHaveBeenCalledTimes(1)
    
    // 再快进 2 秒
    jest.advanceTimersByTime(2000)
    expect(mockCallback).toHaveBeenCalledTimes(3)
    
    // 停止定时器
    timer.stop()
    jest.advanceTimersByTime(1000)
    
    // 不再调用
    expect(mockCallback).toHaveBeenCalledTimes(3)
  })
})
```

## Mock 和 Spy

### 基础 Mock

```javascript
// user-service.js
import axios from 'axios'

export class UserService {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL
  }
  
  async getUser(id) {
    const response = await axios.get(`${this.baseURL}/users/${id}`)
    return response.data
  }
  
  async createUser(userData) {
    const response = await axios.post(`${this.baseURL}/users`, userData)
    return response.data
  }
  
  async updateUser(id, userData) {
    const response = await axios.put(`${this.baseURL}/users/${id}`, userData)
    return response.data
  }
  
  async deleteUser(id) {
    await axios.delete(`${this.baseURL}/users/${id}`)
    return true
  }
}

export function processUser(user) {
  return {
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    isActive: user.status === 'active'
  }
}
```

```javascript
// user-service.test.js
import axios from 'axios'
import { UserService, processUser } from './user-service'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('UserService', () => {
  let userService: UserService
  
  beforeEach(() => {
    userService = new UserService()
    mockedAxios.get.mockClear()
    mockedAxios.post.mockClear()
    mockedAxios.put.mockClear()
    mockedAxios.delete.mockClear()
  })
  
  test('getUser returns user data', async () => {
    const userData = { id: 1, name: 'John', email: 'john@example.com' }
    mockedAxios.get.mockResolvedValue({ data: userData })
    
    const result = await userService.getUser(1)
    
    expect(result).toEqual(userData)
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/1')
  })
  
  test('createUser creates new user', async () => {
    const userData = { name: 'John', email: 'john@example.com' }
    const createdUser = { id: 1, ...userData }
    
    mockedAxios.post.mockResolvedValue({ data: createdUser })
    
    const result = await userService.createUser(userData)
    
    expect(result).toEqual(createdUser)
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', userData)
  })
  
  test('handles API errors', async () => {
    const error = new Error('Network Error')
    mockedAxios.get.mockRejectedValue(error)
    
    await expect(userService.getUser(1)).rejects.toThrow('Network Error')
  })
})

describe('processUser', () => {
  test('processes user data correctly', () => {
    const user = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      status: 'active'
    }
    
    const result = processUser(user)
    
    expect(result).toEqual({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      status: 'active',
      fullName: 'John Doe',
      isActive: true
    })
  })
  
  test('handles inactive user', () => {
    const user = {
      id: 1,
      firstName: 'Jane',
      lastName: 'Smith',
      status: 'inactive'
    }
    
    const result = processUser(user)
    
    expect(result.isActive).toBe(false)
  })
})
```

### 高级 Mock 技巧

```javascript
// advanced-mocking.test.js

// 部分模块 Mock
jest.mock('./config', () => ({
  ...jest.requireActual('./config'),
  API_URL: 'http://test-api.com'
}))

// 动态 Mock
jest.mock('./logger')
import * as logger from './logger'
const mockLogger = logger as jest.Mocked<typeof logger>

describe('Advanced mocking', () => {
  test('mock function with different return values', () => {
    const mockFn = jest.fn()
    
    // 设置不同的返回值
    mockFn
      .mockReturnValueOnce('first call')
      .mockReturnValueOnce('second call')
      .mockReturnValue('default')
    
    expect(mockFn()).toBe('first call')
    expect(mockFn()).toBe('second call')
    expect(mockFn()).toBe('default')
    expect(mockFn()).toBe('default')
  })
  
  test('mock function with implementation', () => {
    const mockFn = jest.fn((x, y) => x + y)
    
    expect(mockFn(1, 2)).toBe(3)
    expect(mockFn).toHaveBeenCalledWith(1, 2)
  })
  
  test('spy on object methods', () => {
    const calculator = {
      add: (a, b) => a + b,
      multiply: (a, b) => a * b
    }
    
    const addSpy = jest.spyOn(calculator, 'add')
    const multiplySpy = jest.spyOn(calculator, 'multiply')
      .mockImplementation((a, b) => a * b * 2)
    
    expect(calculator.add(1, 2)).toBe(3)
    expect(calculator.multiply(2, 3)).toBe(12) // 被 mock 了
    
    expect(addSpy).toHaveBeenCalledWith(1, 2)
    expect(multiplySpy).toHaveBeenCalledWith(2, 3)
    
    // 恢复原始实现
    multiplySpy.mockRestore()
    expect(calculator.multiply(2, 3)).toBe(6)
  })
  
  test('mock class constructor', () => {
    class Database {
      connect() {
        return 'connected'
      }
      
      query(sql) {
        return `result for ${sql}`
      }
    }
    
    const MockDatabase = jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockReturnValue('mock connected'),
      query: jest.fn().mockReturnValue('mock result')
    }))
    
    const db = new MockDatabase()
    
    expect(db.connect()).toBe('mock connected')
    expect(db.query('SELECT * FROM users')).toBe('mock result')
    expect(MockDatabase).toHaveBeenCalled()
  })
  
  test('mock module with factory', () => {
    // 在测试文件顶部
    jest.mock('fs', () => ({
      readFileSync: jest.fn().mockReturnValue('mock file content'),
      writeFileSync: jest.fn(),
      existsSync: jest.fn().mockReturnValue(true)
    }))
    
    const fs = require('fs')
    
    expect(fs.readFileSync('test.txt')).toBe('mock file content')
    expect(fs.existsSync('test.txt')).toBe(true)
  })
})
```

## React 组件测试

### 基础组件测试

```jsx
// Button.jsx
import React from 'react'
import PropTypes from 'prop-types'

const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  const baseClasses = 'btn'
  const variantClass = `btn--${variant}`
  const sizeClass = `btn--${size}`
  const disabledClass = disabled ? 'btn--disabled' : ''
  
  const className = [baseClasses, variantClass, sizeClass, disabledClass]
    .filter(Boolean)
    .join(' ')
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large'])
}

export default Button
```

```jsx
// Button.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Button from './Button'

describe('Button component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })
  
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
  
  test('does not call onClick when disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    )
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })
  
  test('applies correct CSS classes', () => {
    render(
      <Button variant="secondary" size="large">
        Click me
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn', 'btn--secondary', 'btn--large')
  })
  
  test('applies disabled class when disabled', () => {
    render(<Button disabled>Click me</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn--disabled')
  })
  
  test('forwards additional props', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom button">
        Click me
      </Button>
    )
    
    const button = screen.getByTestId('custom-button')
    expect(button).toHaveAttribute('aria-label', 'Custom button')
  })
})
```

### 复杂组件测试

```jsx
// UserForm.jsx
import React, { useState } from 'react'
import Button from './Button'

const UserForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    age: initialData.age || ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.age) {
      newErrors.age = 'Age is required'
    } else if (isNaN(formData.age) || formData.age < 1) {
      newErrors.age = 'Age must be a positive number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
        />
        {errors.age && <span className="error">{errors.age}</span>}
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  )
}

export default UserForm
```

```jsx
// UserForm.test.jsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import UserForm from './UserForm'

describe('UserForm component', () => {
  const mockOnSubmit = jest.fn()
  
  beforeEach(() => {
    mockOnSubmit.mockClear()
  })
  
  test('renders form fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })
  
  test('displays initial data', () => {
    const initialData = {
      name: 'John Doe',
      email: 'john@example.com',
      age: '30'
    }
    
    render(<UserForm onSubmit={mockOnSubmit} initialData={initialData} />)
    
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('30')).toBeInTheDocument()
  })
  
  test('updates form fields on user input', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const ageInput = screen.getByLabelText(/age/i)
    
    await user.type(nameInput, 'Jane Doe')
    await user.type(emailInput, 'jane@example.com')
    await user.type(ageInput, '25')
    
    expect(nameInput).toHaveValue('Jane Doe')
    expect(emailInput).toHaveValue('jane@example.com')
    expect(ageInput).toHaveValue(25)
  })
  
  test('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Age is required')).toBeInTheDocument()
    
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })
  
  test('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)
    
    expect(screen.getByText('Email is invalid')).toBeInTheDocument()
  })
  
  test('clears error when user starts typing', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })
    
    // Trigger validation error
    await user.click(submitButton)
    expect(screen.getByText('Name is required')).toBeInTheDocument()
    
    // Start typing to clear error
    await user.type(nameInput, 'J')
    expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
  })
  
  test('submits form with valid data', async () => {
    const user = userEvent.setup()
    mockOnSubmit.mockResolvedValue()
    
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/age/i), '30')
    
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      age: '30'
    })
  })
  
  test('shows loading state during submission', async () => {
    const user = userEvent.setup()
    
    // Mock a delayed submission
    mockOnSubmit.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    )
    
    render(<UserForm onSubmit={mockOnSubmit} />)
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/age/i), '30')
    
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Wait for submission to complete
    await waitFor(() => {
      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
    
    expect(submitButton).not.toBeDisabled()
  })
})
```

## 代码覆盖率

### 配置覆盖率报告

```javascript
// jest.config.js
module.exports = {
  // 启用覆盖率收集
  collectCoverage: true,
  
  // 覆盖率收集的文件
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // 覆盖率输出目录
  coverageDirectory: 'coverage',
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',        // 控制台输出
    'text-summary', // 简要摘要
    'lcov',        // lcov 格式（用于 CI）
    'html',        // HTML 报告
    'json',        // JSON 格式
    'clover'       // Clover XML
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // 特定目录的阈值
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    // 特定文件的阈值
    './src/utils/math.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  
  // 覆盖率路径映射
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/build/',
    '/coverage/',
    '/.storybook/'
  ]
}
```

### 覆盖率脚本

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:coverage:watch": "jest --coverage --watchAll",
    "test:coverage:ci": "jest --coverage --ci --watchAll=false --passWithNoTests",
    "coverage:open": "open coverage/lcov-report/index.html",
    "coverage:check": "jest --coverage --passWithNoTests && echo 'Coverage check passed'"
  }
}
```

### 覆盖率分析

```javascript
// coverage-analysis.js
const fs = require('fs')
const path = require('path')

class CoverageAnalyzer {
  constructor(coverageFile = './coverage/coverage-summary.json') {
    this.coverageFile = coverageFile
  }
  
  analyze() {
    if (!fs.existsSync(this.coverageFile)) {
      console.error('Coverage file not found. Run tests with --coverage first.')
      return
    }
    
    const coverage = JSON.parse(fs.readFileSync(this.coverageFile, 'utf8'))
    
    console.log('\n📊 Coverage Analysis Report\n')
    
    // 总体覆盖率
    this.printOverallCoverage(coverage.total)
    
    // 文件级别分析
    this.analyzeFiles(coverage)
    
    // 建议
    this.provideSuggestions(coverage)
  }
  
  printOverallCoverage(total) {
    console.log('🎯 Overall Coverage:')
    console.log(`   Lines: ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`)
    console.log(`   Functions: ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`)
    console.log(`   Branches: ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`)
    console.log(`   Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})\n`)
  }
  
  analyzeFiles(coverage) {
    const files = Object.keys(coverage).filter(key => key !== 'total')
    
    // 找出覆盖率最低的文件
    const lowCoverageFiles = files
      .map(file => ({
        file,
        coverage: coverage[file].lines.pct
      }))
      .filter(item => item.coverage < 80)
      .sort((a, b) => a.coverage - b.coverage)
    
    if (lowCoverageFiles.length > 0) {
      console.log('⚠️  Files with low coverage (<80%):')
      lowCoverageFiles.slice(0, 10).forEach(item => {
        console.log(`   ${path.basename(item.file)}: ${item.coverage}%`)
      })
      console.log()
    }
    
    // 找出完全未覆盖的文件
    const uncoveredFiles = files.filter(file => coverage[file].lines.pct === 0)
    
    if (uncoveredFiles.length > 0) {
      console.log('🚨 Completely uncovered files:')
      uncoveredFiles.forEach(file => {
        console.log(`   ${path.basename(file)}`)
      })
      console.log()
    }
  }
  
  provideSuggestions(coverage) {
    const total = coverage.total
    
    console.log('💡 Suggestions:')
    
    if (total.lines.pct < 80) {
      console.log('   • Focus on increasing line coverage by adding more test cases')
    }
    
    if (total.branches.pct < 80) {
      console.log('   • Add tests for conditional logic and edge cases')
    }
    
    if (total.functions.pct < 80) {
      console.log('   • Ensure all functions are tested')
    }
    
    console.log('   • Review uncovered lines in the HTML report')
    console.log('   • Consider adding integration tests for better coverage')
  }
}

// 使用
if (require.main === module) {
  const analyzer = new CoverageAnalyzer()
  analyzer.analyze()
}

module.exports = CoverageAnalyzer
```

## 测试最佳实践

### 测试组织结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.test.jsx
│   │   └── index.js
│   └── UserForm/
│       ├── UserForm.jsx
│       ├── UserForm.test.jsx
│       └── index.js
├── utils/
│   ├── math.js
│   ├── math.test.js
│   ├── validation.js
│   └── validation.test.js
├── services/
│   ├── api.js
│   ├── api.test.js
│   ├── __mocks__/
│   │   └── api.js
│   └── __tests__/
│       └── integration.test.js
├── __tests__/
│   ├── setup.js
│   └── helpers.js
└── setupTests.js
```

### 测试辅助工具

```javascript
// __tests__/helpers.js
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { QueryClient, QueryClientProvider } from 'react-query'

// 自定义渲染函数
export function renderWithProviders(
  ui,
  {
    initialEntries = ['/'],
    theme = defaultTheme,
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            {children}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    )
  }
  
  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// 测试数据工厂
export const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  status: 'active',
  ...overrides
})

export const createUsers = (count = 3) => {
  return Array.from({ length: count }, (_, index) => 
    createUser({ id: index + 1, name: `User ${index + 1}` })
  )
}

// 等待工具
export const waitForLoadingToFinish = () => 
  waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

// Mock 工具
export const createMockResponse = (data, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data)
})

// 表单测试工具
export const fillForm = async (user, formData) => {
  for (const [field, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(field, 'i'))
    await user.clear(input)
    await user.type(input, value)
  }
}

// 错误边界测试
export const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false)
  
  if (hasError) {
    return <div>Something went wrong</div>
  }
  
  try {
    return children
  } catch (error) {
    setHasError(true)
    return <div>Something went wrong</div>
  }
}
```

### 测试模式和策略

```javascript
// test-patterns.test.js

// 1. AAA 模式 (Arrange, Act, Assert)
describe('AAA Pattern', () => {
  test('user can submit form with valid data', async () => {
    // Arrange
    const user = userEvent.setup()
    const mockSubmit = jest.fn()
    const formData = {
      name: 'John Doe',
      email: 'john@example.com'
    }
    
    render(<UserForm onSubmit={mockSubmit} />)
    
    // Act
    await fillForm(user, formData)
    await user.click(screen.getByRole('button', { name: /submit/i }))
    
    // Assert
    expect(mockSubmit).toHaveBeenCalledWith(formData)
  })
})

// 2. Given-When-Then 模式
describe('Given-When-Then Pattern', () => {
  test('should calculate discount correctly', () => {
    // Given
    const originalPrice = 100
    const discountPercentage = 20
    
    // When
    const discountedPrice = calculateDiscount(originalPrice, discountPercentage)
    
    // Then
    expect(discountedPrice).toBe(80)
  })
})

// 3. 参数化测试
describe('Parameterized tests', () => {
  test.each([
    [1, 2, 3],
    [2, 3, 5],
    [5, 5, 10],
    [-1, 1, 0]
  ])('add(%i, %i) should return %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected)
  })
  
  test.each([
    { input: 'test@example.com', expected: true },
    { input: 'invalid-email', expected: false },
    { input: '', expected: false },
    { input: 'test@', expected: false }
  ])('validateEmail($input) should return $expected', ({ input, expected }) => {
    expect(validateEmail(input)).toBe(expected)
  })
})

// 4. 测试边界条件
describe('Boundary testing', () => {
  test('handles edge cases for array operations', () => {
    // 空数组
    expect(sum([])).toBe(0)
    
    // 单元素数组
    expect(sum([5])).toBe(5)
    
    // 负数
    expect(sum([-1, -2, -3])).toBe(-6)
    
    // 大数组
    const largeArray = Array.from({ length: 1000 }, (_, i) => i)
    expect(sum(largeArray)).toBe(499500)
  })
})

// 5. 错误处理测试
describe('Error handling', () => {
  test('throws error for invalid input', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero')
    expect(() => divide('10', 2)).toThrow('Invalid input type')
  })
  
  test('handles async errors', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'))
    global.fetch = mockFetch
    
    await expect(fetchUserData(1)).rejects.toThrow('Network error')
  })
})
```

## 性能测试

### 性能基准测试

```javascript
// performance.test.js
describe('Performance tests', () => {
  test('large array processing should complete within time limit', () => {
    const largeArray = Array.from({ length: 100000 }, (_, i) => i)
    
    const start = performance.now()
    const result = processLargeArray(largeArray)
    const end = performance.now()
    
    const executionTime = end - start
    
    expect(result).toHaveLength(100000)
    expect(executionTime).toBeLessThan(1000) // 应在1秒内完成
  })
  
  test('memory usage should be reasonable', () => {
    const initialMemory = process.memoryUsage().heapUsed
    
    // 执行可能消耗大量内存的操作
    const data = createLargeDataStructure()
    
    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory
    
    // 内存增长应在合理范围内（例如 50MB）
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })
})
```

## CI/CD 集成

### GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Comment coverage on PR
      if: github.event_name == 'pull_request'
      uses: romeovs/lcov-reporter-action@v0.3.1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        lcov-file: ./coverage/lcov.info
```

## 参考资源

### 📚 学习资源
- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library 文档](https://testing-library.com/docs/)
- [JavaScript 测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [React 测试指南](https://reactjs.org/docs/testing.html)

### 🛠️ 相关工具
- **测试框架**: Jest, Vitest, Mocha
- **断言库**: Jest (内置), Chai, Should.js
- **测试工具**: Testing Library, Enzyme
- **覆盖率工具**: Istanbul, NYC
- **Mock 工具**: MSW, Nock, Sinon

### 📖 进阶主题
- [测试驱动开发 (TDD)](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [行为驱动开发 (BDD)](https://cucumber.io/docs/bdd/)
- [测试金字塔理论](https://martinfowler.com/articles/practical-test-pyramid.html)
- [前端测试策略](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

> 💡 **提示**：好的测试不仅能发现 bug，更能提高代码质量和开发效率。记住：测试代码也是代码，需要同样的关注和维护！