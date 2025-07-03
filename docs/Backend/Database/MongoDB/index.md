# MongoDB 数据库设计与优化

## 简介

MongoDB 是一个基于文档的 NoSQL 数据库，以其灵活的数据模型、强大的查询功能和水平扩展能力而闻名。它使用 BSON（Binary JSON）格式存储数据，非常适合现代应用程序的开发需求。

### 核心特性

- **文档数据模型**：灵活的 JSON 风格文档存储
- **动态模式**：无需预定义表结构
- **强大的查询语言**：支持复杂查询、聚合和索引
- **水平扩展**：内置分片支持
- **高可用性**：副本集自动故障转移
- **ACID 事务**：支持多文档事务
- **全文搜索**：内置文本搜索功能

### 适用场景

- 内容管理系统
- 实时分析和大数据
- 物联网应用
- 移动应用后端
- 电商产品目录
- 社交网络平台
- 地理位置服务

## 数据建模

### 1. 文档设计原则

```javascript
// 用户文档设计示例
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "john_doe",
  email: "john@example.com",
  profile: {
    firstName: "John",
    lastName: "Doe",
    avatar: "https://example.com/avatar.jpg",
    bio: "Software developer passionate about technology",
    birthDate: ISODate("1990-05-15T00:00:00Z"),
    location: {
      city: "San Francisco",
      country: "USA",
      coordinates: {
        type: "Point",
        coordinates: [-122.4194, 37.7749]
      }
    }
  },
  preferences: {
    theme: "dark",
    language: "en",
    notifications: {
      email: true,
      push: false,
      sms: true
    }
  },
  roles: ["user", "contributor"],
  status: "active",
  lastLogin: ISODate("2024-01-15T10:30:00Z"),
  createdAt: ISODate("2023-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// 文章文档设计
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  title: "Getting Started with MongoDB",
  slug: "getting-started-with-mongodb",
  content: "MongoDB is a powerful NoSQL database...",
  excerpt: "Learn the basics of MongoDB database design",
  author: {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    username: "john_doe",
    displayName: "John Doe"
  },
  category: {
    _id: ObjectId("507f1f77bcf86cd799439013"),
    name: "Database",
    slug: "database"
  },
  tags: [
    { name: "mongodb", slug: "mongodb" },
    { name: "nosql", slug: "nosql" },
    { name: "database", slug: "database" }
  ],
  metadata: {
    readTime: 5,
    wordCount: 1200,
    difficulty: "beginner"
  },
  seo: {
    metaTitle: "Getting Started with MongoDB - Complete Guide",
    metaDescription: "Learn MongoDB basics, data modeling, and best practices",
    keywords: ["mongodb", "nosql", "database", "tutorial"]
  },
  stats: {
    views: 1250,
    likes: 89,
    shares: 23,
    comments: 15
  },
  status: "published",
  publishedAt: ISODate("2024-01-10T09:00:00Z"),
  createdAt: ISODate("2024-01-08T14:30:00Z"),
  updatedAt: ISODate("2024-01-15T11:20:00Z")
}

// 评论文档设计（嵌套 vs 引用）
// 方案1：嵌套评论（适合评论数量较少的情况）
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  title: "Article Title",
  // ... 其他字段
  comments: [
    {
      _id: ObjectId("507f1f77bcf86cd799439014"),
      author: {
        _id: ObjectId("507f1f77bcf86cd799439011"),
        username: "john_doe",
        avatar: "https://example.com/avatar.jpg"
      },
      content: "Great article! Very helpful.",
      likes: 5,
      replies: [
        {
          _id: ObjectId("507f1f77bcf86cd799439015"),
          author: {
            _id: ObjectId("507f1f77bcf86cd799439016"),
            username: "jane_smith",
            avatar: "https://example.com/avatar2.jpg"
          },
          content: "I agree! Thanks for sharing.",
          likes: 2,
          createdAt: ISODate("2024-01-11T15:30:00Z")
        }
      ],
      createdAt: ISODate("2024-01-11T14:20:00Z")
    }
  ]
}

// 方案2：独立评论集合（适合评论数量较多的情况）
// comments 集合
{
  _id: ObjectId("507f1f77bcf86cd799439014"),
  articleId: ObjectId("507f1f77bcf86cd799439012"),
  parentId: null, // 顶级评论
  author: {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    username: "john_doe",
    avatar: "https://example.com/avatar.jpg"
  },
  content: "Great article! Very helpful.",
  likes: 5,
  status: "approved",
  createdAt: ISODate("2024-01-11T14:20:00Z"),
  updatedAt: ISODate("2024-01-11T14:20:00Z")
}

// 回复评论
{
  _id: ObjectId("507f1f77bcf86cd799439015"),
  articleId: ObjectId("507f1f77bcf86cd799439012"),
  parentId: ObjectId("507f1f77bcf86cd799439014"), // 父评论ID
  author: {
    _id: ObjectId("507f1f77bcf86cd799439016"),
    username: "jane_smith",
    avatar: "https://example.com/avatar2.jpg"
  },
  content: "I agree! Thanks for sharing.",
  likes: 2,
  status: "approved",
  createdAt: ISODate("2024-01-11T15:30:00Z"),
  updatedAt: ISODate("2024-01-11T15:30:00Z")
}
```

### 2. 关系建模策略

```javascript
// 一对一关系：嵌入文档
// 用户和用户配置
{
  _id: ObjectId("..."),
  username: "john_doe",
  email: "john@example.com",
  settings: {
    theme: "dark",
    language: "en",
    timezone: "America/New_York"
  }
}

// 一对多关系：嵌入数组（数量较少）
// 博客文章和标签
{
  _id: ObjectId("..."),
  title: "Article Title",
  tags: ["mongodb", "nosql", "database"]
}

// 一对多关系：引用（数量较多）
// 用户和文章
// users 集合
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "john_doe",
  email: "john@example.com"
}

// articles 集合
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  title: "Article Title",
  authorId: ObjectId("507f1f77bcf86cd799439011"), // 引用用户ID
  content: "Article content..."
}

// 多对多关系：引用数组
// 用户和角色
// users 集合
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  username: "john_doe",
  roleIds: [
    ObjectId("507f1f77bcf86cd799439020"),
    ObjectId("507f1f77bcf86cd799439021")
  ]
}

// roles 集合
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  name: "admin",
  permissions: ["read", "write", "delete"]
}

// 双向引用（需要时）
{
  _id: ObjectId("507f1f77bcf86cd799439020"),
  name: "admin",
  permissions: ["read", "write", "delete"],
  userIds: [
    ObjectId("507f1f77bcf86cd799439011"),
    ObjectId("507f1f77bcf86cd799439022")
  ]
}
```

### 3. 模式验证

```javascript
// 创建带验证的集合
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "createdAt"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30,
          pattern: "^[a-zA-Z0-9_]+$",
          description: "用户名必须是3-30个字符的字母数字下划线组合"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "必须是有效的邮箱地址"
        },
        age: {
          bsonType: "int",
          minimum: 13,
          maximum: 120,
          description: "年龄必须在13-120之间"
        },
        status: {
          enum: ["active", "inactive", "suspended"],
          description: "状态必须是指定值之一"
        },
        profile: {
          bsonType: "object",
          properties: {
            firstName: {
              bsonType: "string",
              maxLength: 50
            },
            lastName: {
              bsonType: "string",
              maxLength: 50
            },
            birthDate: {
              bsonType: "date"
            }
          }
        },
        createdAt: {
          bsonType: "date",
          description: "创建时间是必需的"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
})

// 更新验证规则
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      // 新的验证规则
    }
  }
})

// 文章集合验证
db.createCollection("articles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "content", "authorId", "status", "createdAt"],
      properties: {
        title: {
          bsonType: "string",
          minLength: 1,
          maxLength: 200
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$"
        },
        content: {
          bsonType: "string",
          minLength: 1
        },
        authorId: {
          bsonType: "objectId"
        },
        status: {
          enum: ["draft", "published", "archived"]
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          maxItems: 10
        },
        publishedAt: {
          bsonType: ["date", "null"]
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
})
```

## 索引优化

### 1. 基础索引

```javascript
// 单字段索引
db.users.createIndex({ "username": 1 }) // 升序
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "createdAt": -1 }) // 降序

// 复合索引
db.articles.createIndex({ "status": 1, "publishedAt": -1 })
db.articles.createIndex({ "authorId": 1, "status": 1, "createdAt": -1 })

// 多键索引（数组字段）
db.articles.createIndex({ "tags": 1 })

// 文本索引（全文搜索）
db.articles.createIndex({
  "title": "text",
  "content": "text",
  "tags": "text"
}, {
  weights: {
    "title": 10,
    "content": 5,
    "tags": 1
  },
  name: "article_text_index"
})

// 地理空间索引
db.users.createIndex({ "profile.location.coordinates": "2dsphere" })

// 哈希索引（分片键）
db.users.createIndex({ "_id": "hashed" })

// 部分索引（条件索引）
db.users.createIndex(
  { "email": 1 },
  { 
    partialFilterExpression: { 
      "status": "active",
      "email": { $exists: true }
    }
  }
)

// 稀疏索引
db.users.createIndex(
  { "profile.phone": 1 },
  { sparse: true }
)

// TTL 索引（自动过期）
db.sessions.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 3600 } // 1小时后过期
)

// 唯一索引
db.users.createIndex(
  { "username": 1 },
  { unique: true }
)

// 复合唯一索引
db.articles.createIndex(
  { "authorId": 1, "slug": 1 },
  { unique: true }
)
```

### 2. 索引策略

```javascript
// 查看索引使用情况
db.articles.find({ "status": "published" }).explain("executionStats")

// 查看集合的所有索引
db.articles.getIndexes()

// 查看索引大小
db.articles.totalIndexSize()

// 重建索引
db.articles.reIndex()

// 删除索引
db.articles.dropIndex("index_name")
db.articles.dropIndex({ "field": 1 })

// 后台创建索引
db.articles.createIndex(
  { "content": "text" },
  { background: true }
)

// 查看索引构建进度
db.currentOp({
  "command.createIndexes": { $exists: true }
})

// 索引提示（强制使用特定索引）
db.articles.find({ "status": "published" }).hint({ "status": 1, "publishedAt": -1 })

// 分析查询性能
db.articles.find({ "authorId": ObjectId("..."), "status": "published" })
  .sort({ "publishedAt": -1 })
  .explain("executionStats")

// 索引交集
db.articles.find({
  "status": "published",
  "tags": "mongodb"
}).explain("executionStats")
```

### 3. 索引最佳实践

```javascript
// ESR 规则：Equality, Sort, Range
// 查询：{ status: "published", publishedAt: { $gte: date } }
// 排序：{ publishedAt: -1 }
// 最优索引：{ status: 1, publishedAt: -1 }

// 覆盖查询（所有字段都在索引中）
db.articles.createIndex({
  "status": 1,
  "publishedAt": -1,
  "title": 1,
  "authorId": 1
})

// 查询只返回索引中的字段
db.articles.find(
  { "status": "published" },
  { "title": 1, "authorId": 1, "publishedAt": 1, "_id": 0 }
).sort({ "publishedAt": -1 })

// 前缀索引优化
// 复合索引 { a: 1, b: 1, c: 1 } 可以支持：
// { a: 1 }
// { a: 1, b: 1 }
// { a: 1, b: 1, c: 1 }
// 但不能支持 { b: 1 } 或 { c: 1 }

// 索引基数分析
db.articles.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

## 查询优化

### 1. 高效查询模式

```javascript
// 使用投影减少网络传输
db.articles.find(
  { "status": "published" },
  { "title": 1, "excerpt": 1, "publishedAt": 1 }
)

// 使用 limit() 限制结果数量
db.articles.find({ "status": "published" })
  .sort({ "publishedAt": -1 })
  .limit(10)

// 分页查询优化
// 避免使用 skip() 进行深度分页
// 不推荐：
db.articles.find({ "status": "published" })
  .sort({ "publishedAt": -1 })
  .skip(1000)
  .limit(10)

// 推荐：基于游标的分页
const lastPublishedAt = ISODate("2024-01-10T00:00:00Z")
db.articles.find({
  "status": "published",
  "publishedAt": { $lt: lastPublishedAt }
})
.sort({ "publishedAt": -1 })
.limit(10)

// 范围查询优化
db.articles.find({
  "publishedAt": {
    $gte: ISODate("2024-01-01T00:00:00Z"),
    $lt: ISODate("2024-02-01T00:00:00Z")
  }
})

// 正则表达式优化
// 使用前缀匹配（可以使用索引）
db.users.find({ "username": /^john/ })

// 避免非前缀匹配（无法使用索引）
db.users.find({ "username": /john/ })

// 数组查询优化
// 查询包含特定元素的数组
db.articles.find({ "tags": "mongodb" })

// 查询数组中的多个元素
db.articles.find({ "tags": { $in: ["mongodb", "nosql"] } })

// 数组大小查询
db.articles.find({ "tags": { $size: 3 } })

// 嵌套文档查询
db.users.find({ "profile.location.city": "San Francisco" })

// 使用 $elemMatch 查询数组中的对象
db.orders.find({
  "items": {
    $elemMatch: {
      "product": "laptop",
      "quantity": { $gte: 2 }
    }
  }
})
```

### 2. 聚合管道优化

```javascript
// 文章统计聚合
db.articles.aggregate([
  // 尽早过滤数据
  {
    $match: {
      "status": "published",
      "publishedAt": {
        $gte: ISODate("2024-01-01T00:00:00Z")
      }
    }
  },
  // 尽早投影，减少数据传输
  {
    $project: {
      "authorId": 1,
      "category": 1,
      "tags": 1,
      "stats.views": 1,
      "publishedAt": 1
    }
  },
  // 按作者分组统计
  {
    $group: {
      _id: "$authorId",
      articleCount: { $sum: 1 },
      totalViews: { $sum: "$stats.views" },
      avgViews: { $avg: "$stats.views" },
      categories: { $addToSet: "$category.name" },
      tags: { $push: "$tags" }
    }
  },
  // 展开标签数组
  {
    $unwind: "$tags"
  },
  {
    $unwind: "$tags"
  },
  // 按标签重新分组
  {
    $group: {
      _id: {
        authorId: "$_id",
        tag: "$tags"
      },
      articleCount: { $first: "$articleCount" },
      totalViews: { $first: "$totalViews" },
      tagCount: { $sum: 1 }
    }
  },
  // 排序
  {
    $sort: {
      "totalViews": -1,
      "articleCount": -1
    }
  },
  // 限制结果
  {
    $limit: 10
  }
])

// 使用 $lookup 进行关联查询
db.articles.aggregate([
  {
    $match: { "status": "published" }
  },
  {
    $lookup: {
      from: "users",
      localField: "authorId",
      foreignField: "_id",
      as: "author",
      pipeline: [
        {
          $project: {
            "username": 1,
            "profile.firstName": 1,
            "profile.lastName": 1,
            "profile.avatar": 1
          }
        }
      ]
    }
  },
  {
    $unwind: "$author"
  },
  {
    $project: {
      "title": 1,
      "excerpt": 1,
      "publishedAt": 1,
      "author": 1,
      "stats.views": 1
    }
  }
])

// 时间序列聚合
db.pageViews.aggregate([
  {
    $match: {
      "timestamp": {
        $gte: ISODate("2024-01-01T00:00:00Z"),
        $lt: ISODate("2024-02-01T00:00:00Z")
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$timestamp" },
        month: { $month: "$timestamp" },
        day: { $dayOfMonth: "$timestamp" }
      },
      totalViews: { $sum: 1 },
      uniqueUsers: { $addToSet: "$userId" }
    }
  },
  {
    $project: {
      date: {
        $dateFromParts: {
          year: "$_id.year",
          month: "$_id.month",
          day: "$_id.day"
        }
      },
      totalViews: 1,
      uniqueUserCount: { $size: "$uniqueUsers" }
    }
  },
  {
    $sort: { "date": 1 }
  }
])

// 使用索引提示优化聚合
db.articles.aggregate([
  {
    $match: {
      "status": "published"
    }
  }
], {
  hint: { "status": 1, "publishedAt": -1 }
})

// 允许磁盘使用（处理大数据集）
db.articles.aggregate([
  // 聚合管道
], {
  allowDiskUse: true
})
```

### 3. 全文搜索

```javascript
// 创建文本索引
db.articles.createIndex({
  "title": "text",
  "content": "text",
  "tags": "text"
}, {
  weights: {
    "title": 10,
    "content": 5,
    "tags": 1
  },
  default_language: "english",
  language_override: "language"
})

// 基本文本搜索
db.articles.find({
  $text: {
    $search: "mongodb database"
  }
})

// 短语搜索
db.articles.find({
  $text: {
    $search: "\"NoSQL database\""
  }
})

// 排除词搜索
db.articles.find({
  $text: {
    $search: "database -sql"
  }
})

// 带相关性评分的搜索
db.articles.find(
  {
    $text: {
      $search: "mongodb tutorial"
    }
  },
  {
    score: { $meta: "textScore" }
  }
).sort({ score: { $meta: "textScore" } })

// 组合文本搜索和其他条件
db.articles.find({
  $text: {
    $search: "mongodb"
  },
  "status": "published",
  "publishedAt": {
    $gte: ISODate("2024-01-01T00:00:00Z")
  }
})

// 多语言文本搜索
db.articles.find({
  $text: {
    $search: "数据库",
    $language: "chinese"
  }
})
```

## 事务处理

### 1. 单文档事务

```javascript
// MongoDB 中的单文档操作是原子性的
// 更新文档中的多个字段
db.users.updateOne(
  { "_id": ObjectId("...") },
  {
    $set: {
      "profile.firstName": "John",
      "profile.lastName": "Doe",
      "updatedAt": new Date()
    },
    $inc: {
      "stats.loginCount": 1
    }
  }
)

// 使用 findAndModify 进行原子性更新
db.counters.findAndModify({
  query: { "_id": "articleId" },
  update: { $inc: { "sequence": 1 } },
  new: true,
  upsert: true
})
```

### 2. 多文档事务

```javascript
// 使用会话进行多文档事务
const session = db.getMongo().startSession()

try {
  session.startTransaction()
  
  const usersCollection = session.getDatabase("blog").users
  const articlesCollection = session.getDatabase("blog").articles
  
  // 创建用户
  const userResult = usersCollection.insertOne({
    username: "new_user",
    email: "user@example.com",
    createdAt: new Date()
  }, { session })
  
  const userId = userResult.insertedId
  
  // 创建用户的第一篇文章
  articlesCollection.insertOne({
    title: "My First Article",
    content: "This is my first article...",
    authorId: userId,
    status: "published",
    createdAt: new Date()
  }, { session })
  
  // 更新用户统计
  usersCollection.updateOne(
    { "_id": userId },
    {
      $set: {
        "stats.articleCount": 1,
        "updatedAt": new Date()
      }
    },
    { session }
  )
  
  // 提交事务
  session.commitTransaction()
  console.log("事务提交成功")
  
} catch (error) {
  // 回滚事务
  session.abortTransaction()
  console.error("事务回滚:", error)
} finally {
  session.endSession()
}

// Node.js 中的事务示例
const { MongoClient } = require('mongodb')

async function transferPoints(fromUserId, toUserId, points) {
  const client = new MongoClient(uri)
  const session = client.startSession()
  
  try {
    await session.withTransaction(async () => {
      const users = client.db('app').collection('users')
      
      // 检查发送方余额
      const fromUser = await users.findOne(
        { _id: fromUserId },
        { session }
      )
      
      if (!fromUser || fromUser.points < points) {
        throw new Error('余额不足')
      }
      
      // 扣除发送方积分
      await users.updateOne(
        { _id: fromUserId },
        { 
          $inc: { points: -points },
          $set: { updatedAt: new Date() }
        },
        { session }
      )
      
      // 增加接收方积分
      await users.updateOne(
        { _id: toUserId },
        { 
          $inc: { points: points },
          $set: { updatedAt: new Date() }
        },
        { session }
      )
      
      // 记录转账日志
      await client.db('app').collection('transactions').insertOne({
        fromUserId,
        toUserId,
        points,
        type: 'transfer',
        createdAt: new Date()
      }, { session })
      
    }, {
      readConcern: { level: 'majority' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary'
    })
    
    console.log('积分转账成功')
    
  } catch (error) {
    console.error('积分转账失败:', error)
    throw error
  } finally {
    await session.endSession()
    await client.close()
  }
}
```

### 3. 事务最佳实践

```javascript
// 事务重试逻辑
async function runTransactionWithRetry(txnFunc, session) {
  const maxRetries = 3
  let retryCount = 0
  
  while (retryCount < maxRetries) {
    try {
      await session.withTransaction(txnFunc, {
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' },
        readPreference: 'primary'
      })
      break // 成功，退出循环
    } catch (error) {
      if (error.hasErrorLabel('TransientTransactionError') && retryCount < maxRetries - 1) {
        console.log('事务遇到临时错误，重试中...')
        retryCount++
        await new Promise(resolve => setTimeout(resolve, 100 * retryCount)) // 指数退避
      } else {
        throw error
      }
    }
  }
}

// 避免长时间运行的事务
// 事务应该尽可能短，避免锁定资源过久
async function efficientTransaction() {
  const session = client.startSession()
  
  try {
    await session.withTransaction(async () => {
      // 只包含必要的数据库操作
      // 避免复杂的计算或外部API调用
      
      const result = await collection.updateOne(
        { _id: documentId },
        { $set: { status: 'processed' } },
        { session }
      )
      
      if (result.modifiedCount === 0) {
        throw new Error('文档未找到或未修改')
      }
      
    })
  } finally {
    await session.endSession()
  }
}

// 读关注和写关注配置
const transactionOptions = {
  readConcern: { level: 'majority' }, // 确保读取已提交的数据
  writeConcern: { 
    w: 'majority', // 确保写入到大多数节点
    j: true,       // 确保写入到日志
    wtimeout: 5000 // 写入超时时间
  },
  readPreference: 'primary' // 从主节点读取
}
```

## 性能优化

### 1. 连接池配置

```javascript
// Node.js MongoDB 驱动连接配置
const { MongoClient } = require('mongodb')

const client = new MongoClient(uri, {
  // 连接池配置
  maxPoolSize: 50,          // 最大连接数
  minPoolSize: 5,           // 最小连接数
  maxIdleTimeMS: 30000,     // 连接最大空闲时间
  serverSelectionTimeoutMS: 5000, // 服务器选择超时
  socketTimeoutMS: 45000,   // Socket 超时
  connectTimeoutMS: 10000,  // 连接超时
  heartbeatFrequencyMS: 10000, // 心跳频率
  
  // 重试配置
  retryWrites: true,
  retryReads: true,
  
  // 压缩配置
  compressors: ['snappy', 'zlib'],
  
  // 读写关注
  readConcern: { level: 'majority' },
  writeConcern: {
    w: 'majority',
    j: true,
    wtimeout: 5000
  }
})

// 连接池监控
client.on('connectionPoolCreated', (event) => {
  console.log('连接池已创建:', event)
})

client.on('connectionCreated', (event) => {
  console.log('新连接已创建:', event.connectionId)
})

client.on('connectionClosed', (event) => {
  console.log('连接已关闭:', event.connectionId)
})

client.on('connectionPoolCleared', (event) => {
  console.log('连接池已清空:', event)
})
```

### 2. 批量操作

```javascript
// 批量插入
const documents = []
for (let i = 0; i < 1000; i++) {
  documents.push({
    name: `Document ${i}`,
    value: Math.random(),
    createdAt: new Date()
  })
}

// 使用 insertMany 而不是多次 insertOne
const result = await db.collection('items').insertMany(documents, {
  ordered: false, // 允许并行插入
  writeConcern: { w: 1 } // 降低写关注以提高性能
})

// 批量更新
const bulkOps = []
for (const item of itemsToUpdate) {
  bulkOps.push({
    updateOne: {
      filter: { _id: item._id },
      update: { 
        $set: { 
          status: 'updated',
          updatedAt: new Date()
        }
      }
    }
  })
}

// 执行批量操作
const bulkResult = await db.collection('items').bulkWrite(bulkOps, {
  ordered: false
})

// 批量删除
const deleteResult = await db.collection('items').deleteMany({
  status: 'inactive',
  createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})

// 使用聚合进行批量更新
db.articles.aggregate([
  {
    $match: {
      "stats.views": { $exists: false }
    }
  },
  {
    $merge: {
      into: "articles",
      whenMatched: [
        {
          $set: {
            "stats.views": 0,
            "stats.likes": 0,
            "stats.shares": 0,
            "updatedAt": new Date()
          }
        }
      ]
    }
  }
])
```

### 3. 内存和存储优化

```javascript
// 使用投影减少内存使用
db.articles.find(
  { "status": "published" },
  { 
    "title": 1, 
    "excerpt": 1, 
    "publishedAt": 1,
    "_id": 0 // 排除 _id 字段
  }
)

// 使用游标进行大数据集处理
const cursor = db.articles.find({ "status": "published" })
  .batchSize(100) // 设置批次大小

while (await cursor.hasNext()) {
  const doc = await cursor.next()
  // 处理文档
  await processDocument(doc)
}

// 流式处理
const stream = db.articles.find({ "status": "published" }).stream()

stream.on('data', (doc) => {
  // 处理每个文档
  processDocument(doc)
})

stream.on('end', () => {
  console.log('处理完成')
})

// 使用聚合管道进行数据转换
db.articles.aggregate([
  {
    $match: { "status": "published" }
  },
  {
    $project: {
      "title": 1,
      "wordCount": {
        $size: {
          $split: ["$content", " "]
        }
      },
      "publishedYear": {
        $year: "$publishedAt"
      }
    }
  },
  {
    $out: "article_stats" // 输出到新集合
  }
])

// 数据压缩
// 使用较短的字段名
{
  "t": "Article Title",      // title
  "c": "Article content...", // content
  "a": ObjectId("..."),      // authorId
  "s": "published",          // status
  "ca": ISODate("...")       // createdAt
}

// 使用数值代替字符串枚举
{
  "status": 1, // 1: published, 2: draft, 3: archived
  "type": 2    // 1: article, 2: tutorial, 3: news
}
```

## 副本集和分片

### 1. 副本集配置

```javascript
// 初始化副本集
rs.initiate({
  _id: "myReplicaSet",
  members: [
    { _id: 0, host: "mongodb1.example.com:27017", priority: 2 },
    { _id: 1, host: "mongodb2.example.com:27017", priority: 1 },
    { _id: 2, host: "mongodb3.example.com:27017", priority: 1 }
  ]
})

// 添加副本集成员
rs.add("mongodb4.example.com:27017")

// 添加仲裁者
rs.addArb("mongodb-arbiter.example.com:27017")

// 查看副本集状态
rs.status()

// 查看副本集配置
rs.conf()

// 设置读偏好
db.getMongo().setReadPref("secondary")
db.getMongo().setReadPref("secondaryPreferred")
db.getMongo().setReadPref("nearest")

// 在应用中配置读偏好
const client = new MongoClient(uri, {
  readPreference: 'secondaryPreferred',
  readPreferenceTags: [
    { region: 'us-east' },
    { region: 'us-west' },
    {} // 回退到任何可用节点
  ]
})

// 强制从主节点读取
db.articles.find({ "_id": ObjectId("...") }).readPref("primary")

// 从最近的节点读取
db.articles.find({ "status": "published" }).readPref("nearest")
```

### 2. 分片配置

```javascript
// 启用分片
sh.enableSharding("blog")

// 创建分片键索引
db.articles.createIndex({ "authorId": 1 })

// 对集合进行分片
sh.shardCollection("blog.articles", { "authorId": 1 })

// 哈希分片（更均匀的数据分布）
db.articles.createIndex({ "_id": "hashed" })
sh.shardCollection("blog.articles", { "_id": "hashed" })

// 复合分片键
db.logs.createIndex({ "userId": 1, "timestamp": 1 })
sh.shardCollection("blog.logs", { "userId": 1, "timestamp": 1 })

// 查看分片状态
sh.status()

// 查看集合分片信息
db.articles.getShardDistribution()

// 查看分片键分布
db.articles.find().explain("executionStats")

// 预分割分片
for (let i = 0; i < 100; i++) {
  sh.splitAt("blog.articles", { "authorId": ObjectId() })
}

// 移动分片
sh.moveChunk("blog.articles", { "authorId": ObjectId("...") }, "shard0001")

// 平衡器控制
sh.stopBalancer()
sh.startBalancer()
sh.isBalancerRunning()

// 设置分片标签
sh.addShardTag("shard0000", "US")
sh.addShardTag("shard0001", "EU")

// 设置标签范围
sh.addTagRange(
  "blog.users",
  { "location.country": "US" },
  { "location.country": "US\uffff" },
  "US"
)
```

### 3. 分片策略

```javascript
// 选择合适的分片键
// 1. 高基数（cardinality）
// 2. 低频率（frequency）
// 3. 单调变化（monotonic change）

// 好的分片键示例
// 用户ID（高基数，随机分布）
sh.shardCollection("app.users", { "_id": "hashed" })

// 复合键（时间 + 用户ID）
sh.shardCollection("app.events", { "timestamp": 1, "userId": 1 })

// 避免的分片键
// 1. 单调递增的字段（如时间戳、自增ID）
// 2. 低基数字段（如状态、类型）
// 3. 经常作为查询条件的单一字段

// 查询路由优化
// 包含分片键的查询（定向查询）
db.articles.find({ "authorId": ObjectId("...") })

// 不包含分片键的查询（广播查询，性能较差）
db.articles.find({ "title": "MongoDB Tutorial" })

// 范围查询优化
db.events.find({
  "timestamp": {
    $gte: ISODate("2024-01-01T00:00:00Z"),
    $lt: ISODate("2024-01-02T00:00:00Z")
  },
  "userId": ObjectId("...")
})
```

## 监控和运维

### 1. 性能监控

```javascript
// 数据库统计信息
db.stats()
db.serverStatus()

// 集合统计信息
db.articles.stats()

// 索引统计信息
db.articles.aggregate([
  { $indexStats: {} }
])

// 当前操作监控
db.currentOp()

// 查看慢查询
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)

// 连接监控
db.serverStatus().connections

// 内存使用监控
db.serverStatus().mem

// 网络监控
db.serverStatus().network

// 锁监控
db.serverStatus().locks

// 操作计数器
db.serverStatus().opcounters

// WiredTiger 存储引擎统计
db.serverStatus().wiredTiger
```

### 2. 日志分析

```bash
# MongoDB 日志分析
# 查看慢查询日志
grep "slow operation" /var/log/mongodb/mongod.log

# 查看连接日志
grep "connection" /var/log/mongodb/mongod.log

# 查看错误日志
grep "ERROR" /var/log/mongodb/mongod.log

# 使用 mtools 分析日志
pip install mtools
mloginfo /var/log/mongodb/mongod.log
mplotqueries /var/log/mongodb/mongod.log
```

### 3. 备份和恢复

```bash
#!/bin/bash
# MongoDB 备份脚本

DB_NAME="blog"
BACKUP_DIR="/backup/mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/${DB_NAME}_${DATE}"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 使用 mongodump 备份
mongodump \
  --host localhost:27017 \
  --db $DB_NAME \
  --out $BACKUP_PATH \
  --gzip

# 压缩备份
tar -czf "${BACKUP_PATH}.tar.gz" -C $BACKUP_DIR "${DB_NAME}_${DATE}"
rm -rf $BACKUP_PATH

# 删除7天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "备份完成: ${BACKUP_PATH}.tar.gz"

# 恢复数据库
# mongorestore --host localhost:27017 --db blog --gzip /backup/mongodb/blog_20240115_120000

# 副本集备份
mongodump \
  --host "myReplicaSet/mongodb1.example.com:27017,mongodb2.example.com:27017" \
  --readPreference secondary \
  --db $DB_NAME \
  --out $BACKUP_PATH \
  --gzip

# 分片集群备份
mongodump \
  --host mongos.example.com:27017 \
  --db $DB_NAME \
  --out $BACKUP_PATH \
  --gzip

# 增量备份（使用 oplog）
mongodump \
  --host localhost:27017 \
  --db local \
  --collection oplog.rs \
  --query '{"ts":{"$gte":{"$timestamp":{"t":1642204800,"i":1}}}}' \
  --out $BACKUP_PATH
```

### 4. 安全配置

```javascript
// 启用认证
// 在 mongod.conf 中配置
/*
security:
  authorization: enabled
  keyFile: /etc/mongodb/keyfile
*/

// 创建管理员用户
use admin
db.createUser({
  user: "admin",
  pwd: "strong_password",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" },
    { role: "clusterAdmin", db: "admin" }
  ]
})

// 创建应用用户
use blog
db.createUser({
  user: "blogapp",
  pwd: "app_password",
  roles: [
    { role: "readWrite", db: "blog" }
  ]
})

// 创建只读用户
db.createUser({
  user: "readonly",
  pwd: "readonly_password",
  roles: [
    { role: "read", db: "blog" }
  ]
})

// 自定义角色
db.createRole({
  role: "articleManager",
  privileges: [
    {
      resource: { db: "blog", collection: "articles" },
      actions: ["find", "insert", "update", "remove"]
    },
    {
      resource: { db: "blog", collection: "comments" },
      actions: ["find", "insert", "update"]
    }
  ],
  roles: []
})

// SSL/TLS 配置
/*
net:
  ssl:
    mode: requireSSL
    PEMKeyFile: /etc/ssl/mongodb.pem
    CAFile: /etc/ssl/ca.pem
*/

// 网络安全
/*
net:
  bindIp: 127.0.0.1,10.0.0.100
  port: 27017
*/

// 审计日志
/*
auditLog:
  destination: file
  format: JSON
  path: /var/log/mongodb/audit.log
*/
```

## 故障排除

### 1. 常见问题诊断

```javascript
// 查看数据库错误
db.adminCommand("getLog", "global")

// 查看副本集状态
rs.status()
rs.printReplicationInfo()
rs.printSlaveReplicationInfo()

// 查看分片状态
sh.status()
db.printShardingStatus()

// 查看连接状态
db.serverStatus().connections

// 查看锁状态
db.currentOp({
  "waitingForLock": true
})

// 终止长时间运行的操作
db.killOp(operationId)

// 查看索引构建进度
db.currentOp({
  "command.createIndexes": { $exists: true }
})

// 检查数据一致性
db.collection.validate()
db.collection.validate({ full: true })

// 修复数据库
db.repairDatabase()

// 压缩集合
db.collection.compact()

// 重建索引
db.collection.reIndex()
```

### 2. 性能问题排查

```javascript
// 启用性能分析
db.setProfilingLevel(2, { slowms: 100 })

// 查看慢查询
db.system.profile.find({
  "millis": { $gt: 100 }
}).sort({ "ts": -1 }).limit(10)

// 分析查询计划
db.articles.find({ "status": "published" }).explain("executionStats")

// 查看索引使用情况
db.articles.aggregate([
  { $indexStats: {} },
  { $sort: { "accesses.ops": -1 } }
])

// 查看集合统计
db.articles.stats()

// 查看存储引擎统计
db.serverStatus().wiredTiger

// 内存使用分析
db.serverStatus().mem
db.serverStatus().wiredTiger.cache

// 磁盘使用分析
db.stats()
db.runCommand({ "dbStats": 1, "scale": 1024*1024 })
```

## 参考资源

### 官方文档
- [MongoDB 官方文档](https://docs.mongodb.com/)
- [MongoDB 大学](https://university.mongodb.com/)
- [MongoDB 最佳实践](https://docs.mongodb.com/manual/administration/production-notes/)

### 工具和插件
- [MongoDB Compass](https://www.mongodb.com/products/compass) - 官方图形化管理工具
- [Studio 3T](https://studio3t.com/) - 专业的 MongoDB IDE
- [Robo 3T](https://robomongo.org/) - 轻量级 MongoDB 客户端
- [mtools](https://github.com/rueckstiess/mtools) - MongoDB 日志分析工具

### 驱动程序
- [Node.js 驱动](https://mongodb.github.io/node-mongodb-native/)
- [Mongoose ODM](https://mongoosejs.com/) - Node.js 对象文档映射器
- [PyMongo](https://pymongo.readthedocs.io/) - Python 驱动
- [Java 驱动](https://mongodb.github.io/mongo-java-driver/) - Java 驱动

### 最佳实践文章
- [MongoDB Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/)
- [MongoDB Performance Best Practices](https://www.mongodb.com/basics/best-practices)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

### 社区资源
- [MongoDB Community](https://www.mongodb.com/community)
- [Stack Overflow MongoDB 标签](https://stackoverflow.com/questions/tagged/mongodb)
- [Reddit r/MongoDB](https://www.reddit.com/r/mongodb/)
- [MongoDB 中文社区](https://mongoing.com/)

---

本指南涵盖了 MongoDB 数据库设计、查询优化、事务处理、性能调优、分片配置和运维监控的各个方面。通过遵循这些最佳实践，你可以构建高性能、可扩展的 MongoDB 应用程序，并有效地解决开发和运维过程中遇到的问题。