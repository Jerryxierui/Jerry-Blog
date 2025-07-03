# RESTful API 设计与实现

## 简介

REST（Representational State Transfer）是一种软件架构风格，用于设计网络应用程序的接口。RESTful API 是遵循 REST 原则的 Web API，它使用标准的 HTTP 方法来操作资源。

### 核心特性

- **无状态性**：每个请求都包含处理该请求所需的所有信息
- **统一接口**：使用标准的 HTTP 方法和状态码
- **资源导向**：将数据和功能视为资源，通过 URI 标识
- **可缓存性**：支持缓存机制提高性能
- **分层系统**：支持代理、网关等中间层

### 适用场景

- Web 应用程序 API
- 移动应用后端服务
- 微服务架构中的服务间通信
- 第三方集成接口
- 公开 API 服务

## REST 核心原则

### 1. 资源（Resources）

资源是 REST 的核心概念，每个资源都有唯一的 URI 标识。

```javascript
// 资源 URI 设计示例
const resourceURIs = {
  // 用户资源
  users: '/api/users',
  userById: '/api/users/:id',
  userPosts: '/api/users/:id/posts',
  
  // 文章资源
  posts: '/api/posts',
  postById: '/api/posts/:id',
  postComments: '/api/posts/:id/comments',
  
  // 评论资源
  comments: '/api/comments',
  commentById: '/api/comments/:id'
}

// 资源命名最佳实践
class ResourceNaming {
  static getBestPractices() {
    return {
      // 使用名词而非动词
      good: '/api/users',
      bad: '/api/getUsers',
      
      // 使用复数形式
      good: '/api/products',
      bad: '/api/product',
      
      // 使用小写字母和连字符
      good: '/api/user-profiles',
      bad: '/api/UserProfiles',
      
      // 层次化资源关系
      good: '/api/users/123/orders/456',
      bad: '/api/getUserOrder?userId=123&orderId=456'
    }
  }
}
```

### 2. HTTP 方法

使用标准的 HTTP 方法来操作资源。

```javascript
// HTTP 方法使用示例
class RESTfulMethods {
  // GET - 获取资源
  static getExamples() {
    return {
      // 获取所有用户
      getAllUsers: {
        method: 'GET',
        url: '/api/users',
        description: '获取用户列表'
      },
      
      // 获取特定用户
      getUserById: {
        method: 'GET',
        url: '/api/users/123',
        description: '获取 ID 为 123 的用户'
      },
      
      // 获取用户的文章
      getUserPosts: {
        method: 'GET',
        url: '/api/users/123/posts',
        description: '获取用户 123 的所有文章'
      }
    }
  }
  
  // POST - 创建资源
  static postExamples() {
    return {
      createUser: {
        method: 'POST',
        url: '/api/users',
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          age: 30
        },
        description: '创建新用户'
      },
      
      createPost: {
        method: 'POST',
        url: '/api/users/123/posts',
        body: {
          title: 'My First Post',
          content: 'This is the content of my first post.',
          tags: ['tech', 'programming']
        },
        description: '为用户 123 创建新文章'
      }
    }
  }
  
  // PUT - 完整更新资源
  static putExamples() {
    return {
      updateUser: {
        method: 'PUT',
        url: '/api/users/123',
        body: {
          id: 123,
          name: 'John Smith',
          email: 'johnsmith@example.com',
          age: 31,
          updatedAt: new Date().toISOString()
        },
        description: '完整更新用户 123 的信息'
      }
    }
  }
  
  // PATCH - 部分更新资源
  static patchExamples() {
    return {
      partialUpdateUser: {
        method: 'PATCH',
        url: '/api/users/123',
        body: {
          email: 'newemail@example.com'
        },
        description: '仅更新用户 123 的邮箱'
      }
    }
  }
  
  // DELETE - 删除资源
  static deleteExamples() {
    return {
      deleteUser: {
        method: 'DELETE',
        url: '/api/users/123',
        description: '删除用户 123'
      },
      
      deletePost: {
        method: 'DELETE',
        url: '/api/posts/456',
        description: '删除文章 456'
      }
    }
  }
}
```

### 3. HTTP 状态码

使用标准的 HTTP 状态码来表示请求的结果。

```javascript
// HTTP 状态码使用指南
class HTTPStatusCodes {
  static getStatusCodeGuide() {
    return {
      // 2xx 成功
      success: {
        200: {
          name: 'OK',
          usage: 'GET、PUT、PATCH 请求成功',
          example: '获取用户信息成功'
        },
        201: {
          name: 'Created',
          usage: 'POST 请求成功创建资源',
          example: '用户创建成功'
        },
        204: {
          name: 'No Content',
          usage: 'DELETE 请求成功，无返回内容',
          example: '用户删除成功'
        }
      },
      
      // 4xx 客户端错误
      clientError: {
        400: {
          name: 'Bad Request',
          usage: '请求参数错误或格式不正确',
          example: '缺少必需的字段'
        },
        401: {
          name: 'Unauthorized',
          usage: '未认证或认证失败',
          example: 'Token 无效或过期'
        },
        403: {
          name: 'Forbidden',
          usage: '已认证但无权限访问',
          example: '普通用户尝试访问管理员接口'
        },
        404: {
          name: 'Not Found',
          usage: '资源不存在',
          example: '用户 ID 不存在'
        },
        409: {
          name: 'Conflict',
          usage: '资源冲突',
          example: '邮箱已被注册'
        },
        422: {
          name: 'Unprocessable Entity',
          usage: '请求格式正确但语义错误',
          example: '数据验证失败'
        }
      },
      
      // 5xx 服务器错误
      serverError: {
        500: {
          name: 'Internal Server Error',
          usage: '服务器内部错误',
          example: '数据库连接失败'
        },
        502: {
          name: 'Bad Gateway',
          usage: '网关错误',
          example: '上游服务不可用'
        },
        503: {
          name: 'Service Unavailable',
          usage: '服务暂时不可用',
          example: '服务器维护中'
        }
      }
    }
  }
}
```

## API 设计最佳实践

### 1. 版本控制

```javascript
// API 版本控制策略
class APIVersioning {
  // 方法1：URL 路径版本控制
  static urlVersioning() {
    return {
      v1: '/api/v1/users',
      v2: '/api/v2/users',
      advantages: ['清晰明确', '易于缓存', '支持不同版本并存'],
      disadvantages: ['URL 冗长', '需要维护多个路由']
    }
  }
  
  // 方法2：请求头版本控制
  static headerVersioning() {
    return {
      url: '/api/users',
      headers: {
        'API-Version': 'v2',
        'Accept': 'application/vnd.api+json;version=2'
      },
      advantages: ['URL 简洁', '灵活性高'],
      disadvantages: ['不易缓存', '调试困难']
    }
  }
  
  // 方法3：查询参数版本控制
  static queryVersioning() {
    return {
      url: '/api/users?version=v2',
      advantages: ['简单易用', '向后兼容'],
      disadvantages: ['容易被忽略', '不够专业']
    }
  }
}
```

### 2. 分页和过滤

```javascript
// 分页和过滤实现
class PaginationAndFiltering {
  // 基于偏移量的分页
  static offsetPagination() {
    return {
      request: {
        url: '/api/users?page=2&limit=20&sort=createdAt&order=desc',
        params: {
          page: 2,        // 页码
          limit: 20,      // 每页数量
          sort: 'createdAt', // 排序字段
          order: 'desc'   // 排序方向
        }
      },
      response: {
        data: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 150,
          totalPages: 8,
          hasNext: true,
          hasPrev: true
        }
      }
    }
  }
  
  // 基于游标的分页
  static cursorPagination() {
    return {
      request: {
        url: '/api/users?cursor=eyJpZCI6MTIzfQ&limit=20',
        params: {
          cursor: 'eyJpZCI6MTIzfQ', // Base64 编码的游标
          limit: 20
        }
      },
      response: {
        data: [],
        pagination: {
          nextCursor: 'eyJpZCI6MTQzfQ',
          prevCursor: 'eyJpZCI6MTAzfQ',
          hasNext: true,
          hasPrev: true
        }
      }
    }
  }
  
  // 过滤和搜索
  static filteringAndSearch() {
    return {
      // 简单过滤
      simpleFilter: {
        url: '/api/users?status=active&role=admin',
        description: '获取状态为 active 的管理员用户'
      },
      
      // 范围过滤
      rangeFilter: {
        url: '/api/users?age[gte]=18&age[lte]=65',
        description: '获取年龄在 18-65 之间的用户'
      },
      
      // 全文搜索
      textSearch: {
        url: '/api/users?q=john&fields=name,email',
        description: '在姓名和邮箱字段中搜索包含 "john" 的用户'
      },
      
      // 复杂过滤
      complexFilter: {
        url: '/api/posts?author.name=John&tags[in]=tech,programming&publishedAt[gte]=2023-01-01',
        description: '获取作者名为 John，标签包含 tech 或 programming，发布时间在 2023 年之后的文章'
      }
    }
  }
}
```

### 3. 错误处理

```javascript
// 统一错误响应格式
class ErrorHandling {
  static getErrorResponseFormat() {
    return {
      // 标准错误响应格式
      standardFormat: {
        error: {
          code: 'VALIDATION_ERROR',
          message: '请求数据验证失败',
          details: [
            {
              field: 'email',
              message: '邮箱格式不正确',
              code: 'INVALID_EMAIL'
            },
            {
              field: 'age',
              message: '年龄必须大于 0',
              code: 'INVALID_AGE'
            }
          ],
          timestamp: '2023-12-01T10:30:00Z',
          path: '/api/users',
          requestId: 'req-123456'
        }
      },
      
      // 不同类型的错误示例
      errorTypes: {
        validationError: {
          status: 422,
          error: {
            code: 'VALIDATION_ERROR',
            message: '数据验证失败',
            details: []
          }
        },
        
        authenticationError: {
          status: 401,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '需要身份验证',
            details: 'Token 缺失或无效'
          }
        },
        
        authorizationError: {
          status: 403,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '权限不足',
            details: '需要管理员权限'
          }
        },
        
        notFoundError: {
          status: 404,
          error: {
            code: 'RESOURCE_NOT_FOUND',
            message: '资源不存在',
            details: '用户 ID 123 不存在'
          }
        },
        
        conflictError: {
          status: 409,
          error: {
            code: 'RESOURCE_CONFLICT',
            message: '资源冲突',
            details: '邮箱 john@example.com 已被使用'
          }
        },
        
        serverError: {
          status: 500,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: '服务器内部错误',
            details: '请稍后重试或联系技术支持'
          }
        }
      }
    }
  }
}
```

## 实际应用案例

### 博客系统 RESTful API

```javascript
// 博客系统 API 设计
class BlogAPIDesign {
  constructor() {
    this.baseURL = '/api/v1'
    this.endpoints = this.defineEndpoints()
  }
  
  defineEndpoints() {
    return {
      // 用户管理
      users: {
        // 用户注册
        register: {
          method: 'POST',
          path: '/auth/register',
          body: {
            username: 'string',
            email: 'string',
            password: 'string',
            firstName: 'string',
            lastName: 'string'
          },
          responses: {
            201: 'User created successfully',
            400: 'Invalid input data',
            409: 'Email already exists'
          }
        },
        
        // 用户登录
        login: {
          method: 'POST',
          path: '/auth/login',
          body: {
            email: 'string',
            password: 'string'
          },
          responses: {
            200: 'Login successful with JWT token',
            401: 'Invalid credentials'
          }
        },
        
        // 获取用户资料
        getProfile: {
          method: 'GET',
          path: '/users/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          responses: {
            200: 'User profile data',
            404: 'User not found'
          }
        },
        
        // 更新用户资料
        updateProfile: {
          method: 'PATCH',
          path: '/users/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          body: {
            firstName: 'string (optional)',
            lastName: 'string (optional)',
            bio: 'string (optional)',
            avatar: 'string (optional)'
          },
          responses: {
            200: 'Profile updated successfully',
            403: 'Forbidden - can only update own profile'
          }
        }
      },
      
      // 文章管理
      posts: {
        // 获取文章列表
        list: {
          method: 'GET',
          path: '/posts',
          queryParams: {
            page: 'number (default: 1)',
            limit: 'number (default: 10, max: 100)',
            sort: 'string (createdAt, updatedAt, title)',
            order: 'string (asc, desc)',
            status: 'string (draft, published)',
            author: 'string (author ID)',
            category: 'string (category ID)',
            tags: 'string (comma-separated tag names)',
            q: 'string (search query)'
          },
          responses: {
            200: 'List of posts with pagination'
          }
        },
        
        // 获取单篇文章
        getById: {
          method: 'GET',
          path: '/posts/:id',
          responses: {
            200: 'Post details',
            404: 'Post not found'
          }
        },
        
        // 创建文章
        create: {
          method: 'POST',
          path: '/posts',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          body: {
            title: 'string',
            content: 'string',
            excerpt: 'string (optional)',
            status: 'string (draft, published)',
            categoryId: 'string',
            tags: 'array of strings',
            featuredImage: 'string (optional)'
          },
          responses: {
            201: 'Post created successfully',
            400: 'Invalid input data',
            401: 'Authentication required'
          }
        },
        
        // 更新文章
        update: {
          method: 'PUT',
          path: '/posts/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          body: {
            title: 'string',
            content: 'string',
            excerpt: 'string',
            status: 'string',
            categoryId: 'string',
            tags: 'array of strings',
            featuredImage: 'string'
          },
          responses: {
            200: 'Post updated successfully',
            403: 'Forbidden - can only update own posts',
            404: 'Post not found'
          }
        },
        
        // 删除文章
        delete: {
          method: 'DELETE',
          path: '/posts/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          responses: {
            204: 'Post deleted successfully',
            403: 'Forbidden - can only delete own posts',
            404: 'Post not found'
          }
        }
      },
      
      // 评论管理
      comments: {
        // 获取文章评论
        getByPost: {
          method: 'GET',
          path: '/posts/:postId/comments',
          queryParams: {
            page: 'number',
            limit: 'number',
            sort: 'string (createdAt)',
            order: 'string (asc, desc)'
          },
          responses: {
            200: 'List of comments for the post'
          }
        },
        
        // 创建评论
        create: {
          method: 'POST',
          path: '/posts/:postId/comments',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          body: {
            content: 'string',
            parentId: 'string (optional, for replies)'
          },
          responses: {
            201: 'Comment created successfully',
            400: 'Invalid input data',
            404: 'Post not found'
          }
        },
        
        // 更新评论
        update: {
          method: 'PATCH',
          path: '/comments/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          body: {
            content: 'string'
          },
          responses: {
            200: 'Comment updated successfully',
            403: 'Forbidden - can only update own comments'
          }
        },
        
        // 删除评论
        delete: {
          method: 'DELETE',
          path: '/comments/:id',
          headers: {
            'Authorization': 'Bearer <token>'
          },
          responses: {
            204: 'Comment deleted successfully',
            403: 'Forbidden - can only delete own comments'
          }
        }
      },
      
      // 分类管理
      categories: {
        // 获取所有分类
        list: {
          method: 'GET',
          path: '/categories',
          responses: {
            200: 'List of all categories'
          }
        },
        
        // 创建分类（管理员）
        create: {
          method: 'POST',
          path: '/categories',
          headers: {
            'Authorization': 'Bearer <admin-token>'
          },
          body: {
            name: 'string',
            description: 'string (optional)',
            slug: 'string (optional)'
          },
          responses: {
            201: 'Category created successfully',
            403: 'Admin access required'
          }
        }
      }
    }
  }
  
  // 生成 API 文档
  generateAPIDocumentation() {
    const documentation = {
      info: {
        title: 'Blog API',
        version: '1.0.0',
        description: 'RESTful API for blog system'
      },
      baseURL: this.baseURL,
      authentication: {
        type: 'Bearer Token (JWT)',
        header: 'Authorization: Bearer <token>'
      },
      endpoints: this.endpoints
    }
    
    return documentation
  }
}

// 使用示例
const blogAPI = new BlogAPIDesign()
const apiDocs = blogAPI.generateAPIDocumentation()
console.log('Blog API Documentation:', apiDocs)
```

## 性能优化

### 1. 缓存策略

```javascript
// RESTful API 缓存策略
class CachingStrategies {
  // HTTP 缓存头
  static httpCacheHeaders() {
    return {
      // 强缓存
      strongCache: {
        'Cache-Control': 'public, max-age=3600', // 缓存 1 小时
        'Expires': new Date(Date.now() + 3600000).toUTCString()
      },
      
      // 协商缓存
      conditionalCache: {
        'ETag': '"123456789"',
        'Last-Modified': new Date().toUTCString(),
        'Cache-Control': 'no-cache'
      },
      
      // 不缓存
      noCache: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }
  }
  
  // 缓存策略应用
  static applyCachingStrategy(resourceType, data) {
    const strategies = {
      // 静态资源 - 长期缓存
      static: {
        maxAge: 31536000, // 1 年
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      },
      
      // 用户数据 - 短期缓存
      user: {
        maxAge: 300, // 5 分钟
        headers: {
          'Cache-Control': 'private, max-age=300',
          'ETag': this.generateETag(data)
        }
      },
      
      // 文章列表 - 中期缓存
      posts: {
        maxAge: 1800, // 30 分钟
        headers: {
          'Cache-Control': 'public, max-age=1800',
          'ETag': this.generateETag(data)
        }
      },
      
      // 实时数据 - 不缓存
      realtime: {
        maxAge: 0,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    }
    
    return strategies[resourceType] || strategies.realtime
  }
  
  static generateETag(data) {
    // 简化的 ETag 生成
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
    return `"${hash}"`
  }
}
```

### 2. 数据压缩

```javascript
// 响应数据压缩
class ResponseCompression {
  static compressionMiddleware() {
    return {
      // Gzip 压缩
      gzip: {
        enabled: true,
        threshold: 1024, // 大于 1KB 的响应才压缩
        level: 6, // 压缩级别 1-9
        types: [
          'text/plain',
          'text/html',
          'text/css',
          'text/javascript',
          'application/json',
          'application/xml'
        ]
      },
      
      // Brotli 压缩（更高效）
      brotli: {
        enabled: true,
        threshold: 1024,
        quality: 6, // 压缩质量 0-11
        types: [
          'text/plain',
          'text/html',
          'text/css',
          'text/javascript',
          'application/json'
        ]
      }
    }
  }
  
  // 响应数据优化
  static optimizeResponseData(data, options = {}) {
    const optimized = { ...data }
    
    // 移除空值
    if (options.removeNull) {
      this.removeNullValues(optimized)
    }
    
    // 字段选择
    if (options.fields) {
      return this.selectFields(optimized, options.fields)
    }
    
    // 数据转换
    if (options.transform) {
      return this.transformData(optimized, options.transform)
    }
    
    return optimized
  }
  
  static removeNullValues(obj) {
    Object.keys(obj).forEach(key => {
      if (obj[key] === null || obj[key] === undefined) {
        delete obj[key]
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        this.removeNullValues(obj[key])
      }
    })
  }
  
  static selectFields(obj, fields) {
    const result = {}
    fields.forEach(field => {
      if (obj.hasOwnProperty(field)) {
        result[field] = obj[field]
      }
    })
    return result
  }
  
  static transformData(obj, transformer) {
    return transformer(obj)
  }
}
```

## 安全性

### 1. 身份验证和授权

```javascript
// JWT 身份验证实现
class JWTAuthentication {
  constructor(secretKey) {
    this.secretKey = secretKey
    this.tokenExpiry = '24h'
  }
  
  // 生成 JWT Token
  generateToken(payload) {
    const jwt = require('jsonwebtoken')
    return jwt.sign(
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 小时
      },
      this.secretKey
    )
  }
  
  // 验证 Token
  verifyToken(token) {
    try {
      const jwt = require('jsonwebtoken')
      return jwt.verify(token, this.secretKey)
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
  
  // 中间件：验证身份
  authenticationMiddleware() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication token required'
          }
        })
      }
      
      const token = authHeader.substring(7)
      
      try {
        const decoded = this.verifyToken(token)
        req.user = decoded
        next()
      } catch (error) {
        return res.status(401).json({
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired token'
          }
        })
      }
    }
  }
  
  // 中间件：权限检查
  authorizationMiddleware(requiredRoles = []) {
    return (req, res, next) => {
      const user = req.user
      
      if (!user) {
        return res.status(401).json({
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Authentication required'
          }
        })
      }
      
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return res.status(403).json({
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: 'Insufficient permissions'
          }
        })
      }
      
      next()
    }
  }
}
```

### 2. 输入验证和清理

```javascript
// 输入验证和清理
class InputValidation {
  // 数据验证规则
  static getValidationRules() {
    return {
      user: {
        email: {
          required: true,
          type: 'email',
          maxLength: 255
        },
        password: {
          required: true,
          type: 'string',
          minLength: 8,
          pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        },
        username: {
          required: true,
          type: 'string',
          minLength: 3,
          maxLength: 30,
          pattern: /^[a-zA-Z0-9_]+$/
        },
        age: {
          required: false,
          type: 'number',
          min: 13,
          max: 120
        }
      },
      
      post: {
        title: {
          required: true,
          type: 'string',
          minLength: 1,
          maxLength: 200
        },
        content: {
          required: true,
          type: 'string',
          minLength: 10
        },
        status: {
          required: true,
          type: 'string',
          enum: ['draft', 'published', 'archived']
        },
        tags: {
          required: false,
          type: 'array',
          maxItems: 10,
          items: {
            type: 'string',
            maxLength: 50
          }
        }
      }
    }
  }
  
  // 验证数据
  static validateData(data, rules) {
    const errors = []
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = data[field]
      
      // 检查必需字段
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field,
          message: `${field} is required`,
          code: 'REQUIRED_FIELD'
        })
        return
      }
      
      // 如果字段不存在且不是必需的，跳过验证
      if (value === undefined || value === null) {
        return
      }
      
      // 类型检查
      if (rule.type && !this.validateType(value, rule.type)) {
        errors.push({
          field,
          message: `${field} must be of type ${rule.type}`,
          code: 'INVALID_TYPE'
        })
        return
      }
      
      // 长度检查
      if (rule.minLength && value.length < rule.minLength) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.minLength} characters long`,
          code: 'MIN_LENGTH'
        })
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push({
          field,
          message: `${field} must be no more than ${rule.maxLength} characters long`,
          code: 'MAX_LENGTH'
        })
      }
      
      // 数值范围检查
      if (rule.min && value < rule.min) {
        errors.push({
          field,
          message: `${field} must be at least ${rule.min}`,
          code: 'MIN_VALUE'
        })
      }
      
      if (rule.max && value > rule.max) {
        errors.push({
          field,
          message: `${field} must be no more than ${rule.max}`,
          code: 'MAX_VALUE'
        })
      }
      
      // 枚举值检查
      if (rule.enum && !rule.enum.includes(value)) {
        errors.push({
          field,
          message: `${field} must be one of: ${rule.enum.join(', ')}`,
          code: 'INVALID_ENUM'
        })
      }
      
      // 正则表达式检查
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push({
          field,
          message: `${field} format is invalid`,
          code: 'INVALID_FORMAT'
        })
      }
      
      // 数组项检查
      if (rule.type === 'array' && Array.isArray(value)) {
        if (rule.maxItems && value.length > rule.maxItems) {
          errors.push({
            field,
            message: `${field} must have no more than ${rule.maxItems} items`,
            code: 'MAX_ITEMS'
          })
        }
        
        if (rule.items) {
          value.forEach((item, index) => {
            const itemErrors = this.validateData({ item }, { item: rule.items })
            itemErrors.forEach(error => {
              errors.push({
                field: `${field}[${index}]`,
                message: error.message.replace('item', `${field}[${index}]`),
                code: error.code
              })
            })
          })
        }
      }
    })
    
    return errors
  }
  
  static validateType(value, type) {
    switch (type) {
      case 'string':
        return typeof value === 'string'
      case 'number':
        return typeof value === 'number' && !isNaN(value)
      case 'boolean':
        return typeof value === 'boolean'
      case 'array':
        return Array.isArray(value)
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value)
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      default:
        return true
    }
  }
  
  // 数据清理
  static sanitizeData(data) {
    const sanitized = {}
    
    Object.keys(data).forEach(key => {
      let value = data[key]
      
      if (typeof value === 'string') {
        // 去除首尾空格
        value = value.trim()
        
        // HTML 转义
        value = this.escapeHtml(value)
        
        // SQL 注入防护（基础）
        value = this.escapeSql(value)
      }
      
      sanitized[key] = value
    })
    
    return sanitized
  }
  
  static escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    
    return text.replace(/[&<>"']/g, m => map[m])
  }
  
  static escapeSql(text) {
    return text.replace(/['"\\]/g, '\\$&')
  }
}
```

## 测试

### API 测试示例

```javascript
// RESTful API 测试
class APITesting {
  constructor(baseURL) {
    this.baseURL = baseURL
    this.authToken = null
  }
  
  // 设置认证 Token
  setAuthToken(token) {
    this.authToken = token
  }
  
  // 获取请求头
  getHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    }
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }
    
    return headers
  }
  
  // 用户相关测试
  async testUserEndpoints() {
    const testResults = []
    
    try {
      // 测试用户注册
      const registerResult = await this.testUserRegistration()
      testResults.push(registerResult)
      
      // 测试用户登录
      const loginResult = await this.testUserLogin()
      testResults.push(loginResult)
      
      // 测试获取用户资料
      const profileResult = await this.testGetUserProfile()
      testResults.push(profileResult)
      
      // 测试更新用户资料
      const updateResult = await this.testUpdateUserProfile()
      testResults.push(updateResult)
      
    } catch (error) {
      testResults.push({
        test: 'User Endpoints',
        status: 'error',
        error: error.message
      })
    }
    
    return testResults
  }
  
  async testUserRegistration() {
    const testData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    }
    
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    return {
      test: 'User Registration',
      status: response.status === 201 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 201,
      assertions: [
        {
          description: 'Status code should be 201',
          passed: response.status === 201
        },
        {
          description: 'Response should contain user ID',
          passed: result.data && result.data.id
        }
      ]
    }
  }
  
  async testUserLogin() {
    const testData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    }
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    // 保存 token 用于后续测试
    if (result.data && result.data.token) {
      this.setAuthToken(result.data.token)
    }
    
    return {
      test: 'User Login',
      status: response.status === 200 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 200,
      assertions: [
        {
          description: 'Status code should be 200',
          passed: response.status === 200
        },
        {
          description: 'Response should contain JWT token',
          passed: result.data && result.data.token
        },
        {
          description: 'Token should be a valid JWT format',
          passed: result.data && result.data.token && result.data.token.split('.').length === 3
        }
      ]
    }
  }
  
  async testGetUserProfile() {
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'GET',
      headers: this.getHeaders()
    })
    
    const result = await response.json()
    
    return {
      test: 'Get User Profile',
      status: response.status === 200 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 200,
      assertions: [
        {
          description: 'Status code should be 200',
          passed: response.status === 200
        },
        {
          description: 'Response should contain user data',
          passed: result.data && result.data.email
        }
      ]
    }
  }
  
  async testUpdateUserProfile() {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name'
    }
    
    const response = await fetch(`${this.baseURL}/users/me`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updateData)
    })
    
    const result = await response.json()
    
    return {
      test: 'Update User Profile',
      status: response.status === 200 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 200,
      assertions: [
        {
          description: 'Status code should be 200',
          passed: response.status === 200
        },
        {
          description: 'Updated fields should be reflected',
          passed: result.data && result.data.firstName === 'Updated'
        }
      ]
    }
  }
  
  // 文章相关测试
  async testPostEndpoints() {
    const testResults = []
    
    try {
      // 测试创建文章
      const createResult = await this.testCreatePost()
      testResults.push(createResult)
      
      // 测试获取文章列表
      const listResult = await this.testGetPosts()
      testResults.push(listResult)
      
      // 测试获取单篇文章
      const getResult = await this.testGetPost()
      testResults.push(getResult)
      
      // 测试更新文章
      const updateResult = await this.testUpdatePost()
      testResults.push(updateResult)
      
    } catch (error) {
      testResults.push({
        test: 'Post Endpoints',
        status: 'error',
        error: error.message
      })
    }
    
    return testResults
  }
  
  async testCreatePost() {
    const testData = {
      title: 'Test Post',
      content: 'This is a test post content.',
      status: 'published',
      tags: ['test', 'api']
    }
    
    const response = await fetch(`${this.baseURL}/posts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(testData)
    })
    
    const result = await response.json()
    
    return {
      test: 'Create Post',
      status: response.status === 201 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 201,
      assertions: [
        {
          description: 'Status code should be 201',
          passed: response.status === 201
        },
        {
          description: 'Response should contain post ID',
          passed: result.data && result.data.id
        },
        {
          description: 'Post title should match input',
          passed: result.data && result.data.title === testData.title
        }
      ]
    }
  }
  
  async testGetPosts() {
    const response = await fetch(`${this.baseURL}/posts?page=1&limit=10`, {
      method: 'GET',
      headers: this.getHeaders()
    })
    
    const result = await response.json()
    
    return {
      test: 'Get Posts List',
      status: response.status === 200 ? 'pass' : 'fail',
      statusCode: response.status,
      response: result,
      expected: 200,
      assertions: [
        {
          description: 'Status code should be 200',
          passed: response.status === 200
        },
        {
          description: 'Response should contain data array',
          passed: result.data && Array.isArray(result.data)
        },
        {
          description: 'Response should contain pagination info',
          passed: result.pagination && typeof result.pagination.total === 'number'
        }
      ]
    }
  }
  
  // 运行所有测试
  async runAllTests() {
    console.log('Starting API Tests...')
    
    const allResults = []
    
    // 运行用户测试
    const userResults = await this.testUserEndpoints()
    allResults.push(...userResults)
    
    // 运行文章测试
    const postResults = await this.testPostEndpoints()
    allResults.push(...postResults)
    
    // 生成测试报告
    const report = this.generateTestReport(allResults)
    
    return report
  }
  
  generateTestReport(results) {
    const totalTests = results.length
    const passedTests = results.filter(r => r.status === 'pass').length
    const failedTests = results.filter(r => r.status === 'fail').length
    const errorTests = results.filter(r => r.status === 'error').length
    
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        errors: errorTests,
        passRate: `${((passedTests / totalTests) * 100).toFixed(2)}%`
      },
      results: results,
      timestamp: new Date().toISOString()
    }
  }
}

// 使用示例
const apiTester = new APITesting('http://localhost:3000/api/v1')

// 运行测试
apiTester.runAllTests().then(report => {
  console.log('API Test Report:', report)
})
```

## 参考资源

### 官方文档和标准

- [HTTP/1.1 规范](https://tools.ietf.org/html/rfc7231)
- [REST 架构风格](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)
- [JSON API 规范](https://jsonapi.org/)
- [OpenAPI 规范](https://swagger.io/specification/)

### 工具和库

- [Postman](https://www.postman.com/) - API 测试工具
- [Swagger/OpenAPI](https://swagger.io/) - API 文档生成
- [Insomnia](https://insomnia.rest/) - REST 客户端
- [Express.js](https://expressjs.com/) - Node.js Web 框架

### 最佳实践文章

- [RESTful API 设计指南](https://restfulapi.net/)
- [HTTP 状态码完整指南](https://httpstatuses.com/)
- [API 安全最佳实践](https://owasp.org/www-project-api-security/)

---

通过本指南，你应该能够：

1. **理解 REST 架构原则**和核心概念
2. **设计符合 RESTful 规范的 API**
3. **实现标准的 HTTP 方法和状态码**
4. **应用最佳实践**进行版本控制、分页、错误处理
5. **优化 API 性能**和安全性
6. **编写全面的 API 测试**

RESTful API 是现代 Web 开发的基础，掌握其设计和实现对于构建可扩展、可维护的后端服务至关重要。