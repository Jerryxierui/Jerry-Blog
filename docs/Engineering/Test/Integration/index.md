# 集成测试最佳实践

## 简介

集成测试是验证多个组件或模块协同工作的测试方法。它位于测试金字塔的中间层，介于单元测试和端到端测试之间，专注于测试组件间的接口和交互。

### 核心价值
- **接口验证**：确保组件间的接口正确工作
- **数据流测试**：验证数据在系统中的流转
- **配置验证**：测试不同环境配置的正确性
- **依赖关系**：验证外部依赖的集成
- **业务流程**：测试完整的业务场景

### 集成测试类型
- **API 集成测试**：测试 REST API 端点
- **数据库集成测试**：测试数据持久化层
- **服务集成测试**：测试微服务间的通信
- **第三方集成测试**：测试外部服务集成
- **组件集成测试**：测试前端组件协作

## API 集成测试

### Express API 测试

```javascript
// server.js
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { userRoutes } from './routes/users.js'
import { authRoutes } from './routes/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', authMiddleware, userRoutes)

// 错误处理
app.use(errorHandler)

export default app
```

```javascript
// routes/users.js
import express from 'express'
import { UserService } from '../services/UserService.js'
import { validateUser } from '../validators/userValidator.js'

const router = express.Router()
const userService = new UserService()

// 获取所有用户
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const users = await userService.getUsers({ page, limit, search })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

// 获取单个用户
router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// 创建用户
router.post('/', validateUser, async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

// 更新用户
router.put('/:id', validateUser, async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// 删除用户
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

export { router as userRoutes }
```

```javascript
// __tests__/integration/users.test.js
import request from 'supertest'
import app from '../../server.js'
import { setupTestDB, cleanupTestDB } from '../helpers/database.js'
import { createTestUser, generateAuthToken } from '../helpers/testHelpers.js'

describe('Users API Integration Tests', () => {
  let authToken
  
  beforeAll(async () => {
    await setupTestDB()
  })
  
  afterAll(async () => {
    await cleanupTestDB()
  })
  
  beforeEach(async () => {
    // 创建测试用户并获取认证令牌
    const testUser = await createTestUser({ role: 'admin' })
    authToken = generateAuthToken(testUser)
  })
  
  describe('GET /api/users', () => {
    test('should return paginated users list', async () => {
      // 创建测试数据
      await createTestUser({ name: 'User 1', email: 'user1@test.com' })
      await createTestUser({ name: 'User 2', email: 'user2@test.com' })
      await createTestUser({ name: 'User 3', email: 'user3@test.com' })
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 2 })
        .expect(200)
      
      expect(response.body).toHaveProperty('users')
      expect(response.body).toHaveProperty('pagination')
      expect(response.body.users).toHaveLength(2)
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      })
    })
    
    test('should filter users by search query', async () => {
      await createTestUser({ name: 'John Doe', email: 'john@test.com' })
      await createTestUser({ name: 'Jane Smith', email: 'jane@test.com' })
      
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'John' })
        .expect(200)
      
      expect(response.body.users).toHaveLength(1)
      expect(response.body.users[0].name).toBe('John Doe')
    })
    
    test('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401)
    })
  })
  
  describe('GET /api/users/:id', () => {
    test('should return user by id', async () => {
      const user = await createTestUser({ name: 'Test User' })
      
      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
      
      expect(response.body).toMatchObject({
        id: user.id,
        name: 'Test User',
        email: user.email
      })
      expect(response.body).not.toHaveProperty('password')
    })
    
    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
      
      expect(response.body).toMatchObject({
        error: 'User not found'
      })
    })
  })
  
  describe('POST /api/users', () => {
    test('should create new user with valid data', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123',
        age: 25
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201)
      
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
        email: userData.email,
        age: userData.age
      })
      expect(response.body).not.toHaveProperty('password')
    })
    
    test('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123' // 太短
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400)
      
      expect(response.body).toHaveProperty('errors')
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' })
        ])
      )
    })
    
    test('should return 409 for duplicate email', async () => {
      const existingUser = await createTestUser({ email: 'existing@test.com' })
      
      const userData = {
        name: 'Another User',
        email: 'existing@test.com',
        password: 'password123'
      }
      
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(409)
      
      expect(response.body).toMatchObject({
        error: 'Email already exists'
      })
    })
  })
  
  describe('PUT /api/users/:id', () => {
    test('should update user with valid data', async () => {
      const user = await createTestUser({ name: 'Original Name' })
      
      const updateData = {
        name: 'Updated Name',
        age: 30
      }
      
      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
      
      expect(response.body).toMatchObject({
        id: user.id,
        name: 'Updated Name',
        age: 30
      })
    })
    
    test('should return 404 for non-existent user', async () => {
      const updateData = { name: 'Updated Name' }
      
      await request(app)
        .put('/api/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404)
    })
  })
  
  describe('DELETE /api/users/:id', () => {
    test('should delete existing user', async () => {
      const user = await createTestUser()
      
      await request(app)
        .delete(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)
      
      // 验证用户已被删除
      await request(app)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
    
    test('should return 404 for non-existent user', async () => {
      await request(app)
        .delete('/api/users/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })
  })
})
```

### GraphQL API 测试

```javascript
// graphql/schema.js
import { gql } from 'apollo-server-express'

export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
  }
  
  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }
  
  input CreateUserInput {
    name: String!
    email: String!
    age: Int
  }
  
  input UpdateUserInput {
    name: String
    email: String
    age: Int
  }
  
  input CreatePostInput {
    title: String!
    content: String!
    authorId: ID!
  }
  
  input UpdatePostInput {
    title: String
    content: String
  }
`
```

```javascript
// __tests__/integration/graphql.test.js
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from '../../graphql/schema.js'
import { resolvers } from '../../graphql/resolvers.js'
import { setupTestDB, cleanupTestDB } from '../helpers/database.js'
import { createTestUser, createTestPost } from '../helpers/testHelpers.js'

describe('GraphQL API Integration Tests', () => {
  let server
  let query
  let mutate
  
  beforeAll(async () => {
    await setupTestDB()
    
    server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        user: req.user // 模拟认证用户
      })
    })
    
    const testClient = createTestClient(server)
    query = testClient.query
    mutate = testClient.mutate
  })
  
  afterAll(async () => {
    await cleanupTestDB()
  })
  
  describe('User Queries', () => {
    test('should fetch all users', async () => {
      // 创建测试数据
      await createTestUser({ name: 'User 1', email: 'user1@test.com' })
      await createTestUser({ name: 'User 2', email: 'user2@test.com' })
      
      const GET_USERS = `
        query GetUsers {
          users {
            id
            name
            email
            age
          }
        }
      `
      
      const { data, errors } = await query({ query: GET_USERS })
      
      expect(errors).toBeUndefined()
      expect(data.users).toHaveLength(2)
      expect(data.users[0]).toMatchObject({
        id: expect.any(String),
        name: 'User 1',
        email: 'user1@test.com'
      })
    })
    
    test('should fetch user by id with posts', async () => {
      const user = await createTestUser({ name: 'Test User' })
      const post = await createTestPost({ 
        title: 'Test Post', 
        authorId: user.id 
      })
      
      const GET_USER = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            email
            posts {
              id
              title
              content
            }
          }
        }
      `
      
      const { data, errors } = await query({
        query: GET_USER,
        variables: { id: user.id.toString() }
      })
      
      expect(errors).toBeUndefined()
      expect(data.user).toMatchObject({
        id: user.id.toString(),
        name: 'Test User',
        posts: [
          {
            id: post.id.toString(),
            title: 'Test Post'
          }
        ]
      })
    })
    
    test('should return null for non-existent user', async () => {
      const GET_USER = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
          }
        }
      `
      
      const { data, errors } = await query({
        query: GET_USER,
        variables: { id: '999999' }
      })
      
      expect(errors).toBeUndefined()
      expect(data.user).toBeNull()
    })
  })
  
  describe('User Mutations', () => {
    test('should create new user', async () => {
      const CREATE_USER = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
            age
          }
        }
      `
      
      const input = {
        name: 'New User',
        email: 'newuser@test.com',
        age: 25
      }
      
      const { data, errors } = await mutate({
        mutation: CREATE_USER,
        variables: { input }
      })
      
      expect(errors).toBeUndefined()
      expect(data.createUser).toMatchObject({
        id: expect.any(String),
        name: 'New User',
        email: 'newuser@test.com',
        age: 25
      })
    })
    
    test('should update existing user', async () => {
      const user = await createTestUser({ name: 'Original Name' })
      
      const UPDATE_USER = `
        mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            id
            name
            email
          }
        }
      `
      
      const input = {
        name: 'Updated Name'
      }
      
      const { data, errors } = await mutate({
        mutation: UPDATE_USER,
        variables: { 
          id: user.id.toString(), 
          input 
        }
      })
      
      expect(errors).toBeUndefined()
      expect(data.updateUser).toMatchObject({
        id: user.id.toString(),
        name: 'Updated Name'
      })
    })
    
    test('should delete user', async () => {
      const user = await createTestUser()
      
      const DELETE_USER = `
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `
      
      const { data, errors } = await mutate({
        mutation: DELETE_USER,
        variables: { id: user.id.toString() }
      })
      
      expect(errors).toBeUndefined()
      expect(data.deleteUser).toBe(true)
      
      // 验证用户已被删除
      const GET_USER = `
        query GetUser($id: ID!) {
          user(id: $id) {
            id
          }
        }
      `
      
      const { data: userData } = await query({
        query: GET_USER,
        variables: { id: user.id.toString() }
      })
      
      expect(userData.user).toBeNull()
    })
  })
  
  describe('Error Handling', () => {
    test('should handle validation errors', async () => {
      const CREATE_USER = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
          }
        }
      `
      
      const input = {
        name: '', // 无效的名称
        email: 'invalid-email' // 无效的邮箱
      }
      
      const { data, errors } = await mutate({
        mutation: CREATE_USER,
        variables: { input }
      })
      
      expect(errors).toBeDefined()
      expect(errors[0].message).toContain('validation')
    })
  })
})
```

## 数据库集成测试

### 数据库测试设置

```javascript
// __tests__/helpers/database.js
import { Pool } from 'pg'
import { migrate } from 'postgres-migrations'
import path from 'path'

const testConfig = {
  host: process.env.TEST_DB_HOST || 'localhost',
  port: process.env.TEST_DB_PORT || 5432,
  database: process.env.TEST_DB_NAME || 'test_db',
  user: process.env.TEST_DB_USER || 'test_user',
  password: process.env.TEST_DB_PASSWORD || 'test_password'
}

let pool

export async function setupTestDB() {
  pool = new Pool(testConfig)
  
  // 运行数据库迁移
  const migrationsPath = path.join(process.cwd(), 'migrations')
  await migrate({ client: pool }, migrationsPath)
  
  return pool
}

export async function cleanupTestDB() {
  if (pool) {
    await pool.end()
  }
}

export async function clearTestData() {
  if (pool) {
    // 清理测试数据，保持表结构
    await pool.query('TRUNCATE TABLE posts, users RESTART IDENTITY CASCADE')
  }
}

export function getTestDB() {
  return pool
}

// 事务测试辅助函数
export async function withTransaction(testFn) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    await testFn(client)
    await client.query('ROLLBACK')
  } finally {
    client.release()
  }
}
```

### Repository 集成测试

```javascript
// repositories/UserRepository.js
export class UserRepository {
  constructor(db) {
    this.db = db
  }
  
  async findAll(options = {}) {
    const { page = 1, limit = 10, search } = options
    const offset = (page - 1) * limit
    
    let query = 'SELECT * FROM users'
    let params = []
    
    if (search) {
      query += ' WHERE name ILIKE $1 OR email ILIKE $1'
      params.push(`%${search}%`)
    }
    
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)
    
    const result = await this.db.query(query, params)
    
    // 获取总数
    let countQuery = 'SELECT COUNT(*) FROM users'
    let countParams = []
    
    if (search) {
      countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1'
      countParams.push(`%${search}%`)
    }
    
    const countResult = await this.db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)
    
    return {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
  
  async findById(id) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    )
    return result.rows[0] || null
  }
  
  async findByEmail(email) {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0] || null
  }
  
  async create(userData) {
    const { name, email, password, age } = userData
    
    const result = await this.db.query(
      `INSERT INTO users (name, email, password, age, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [name, email, password, age]
    )
    
    return result.rows[0]
  }
  
  async update(id, userData) {
    const fields = []
    const values = []
    let paramIndex = 1
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })
    
    if (fields.length === 0) {
      return this.findById(id)
    }
    
    fields.push(`updated_at = $${paramIndex}`)
    values.push(new Date())
    values.push(id)
    
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex + 1}
      RETURNING *
    `
    
    const result = await this.db.query(query, values)
    return result.rows[0] || null
  }
  
  async delete(id) {
    const result = await this.db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    )
    return result.rows.length > 0
  }
  
  async getUsersWithPosts() {
    const result = await this.db.query(`
      SELECT 
        u.id, u.name, u.email,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', p.id,
              'title', p.title,
              'content', p.content,
              'created_at', p.created_at
            )
          ) FILTER (WHERE p.id IS NOT NULL),
          '[]'
        ) as posts
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.created_at DESC
    `)
    
    return result.rows
  }
}
```

```javascript
// __tests__/integration/UserRepository.test.js
import { UserRepository } from '../../repositories/UserRepository.js'
import { 
  setupTestDB, 
  cleanupTestDB, 
  clearTestData, 
  getTestDB,
  withTransaction 
} from '../helpers/database.js'
import { hashPassword } from '../../utils/auth.js'

describe('UserRepository Integration Tests', () => {
  let userRepository
  let db
  
  beforeAll(async () => {
    db = await setupTestDB()
    userRepository = new UserRepository(db)
  })
  
  afterAll(async () => {
    await cleanupTestDB()
  })
  
  beforeEach(async () => {
    await clearTestData()
  })
  
  describe('findAll', () => {
    test('should return paginated users', async () => {
      // 创建测试数据
      const users = [
        { name: 'User 1', email: 'user1@test.com', password: 'password123' },
        { name: 'User 2', email: 'user2@test.com', password: 'password123' },
        { name: 'User 3', email: 'user3@test.com', password: 'password123' }
      ]
      
      for (const user of users) {
        await userRepository.create(user)
      }
      
      const result = await userRepository.findAll({ page: 1, limit: 2 })
      
      expect(result.users).toHaveLength(2)
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        pages: 2
      })
    })
    
    test('should filter users by search term', async () => {
      await userRepository.create({
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123'
      })
      
      await userRepository.create({
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password123'
      })
      
      const result = await userRepository.findAll({ search: 'John' })
      
      expect(result.users).toHaveLength(1)
      expect(result.users[0].name).toBe('John Doe')
    })
  })
  
  describe('findById', () => {
    test('should return user by id', async () => {
      const createdUser = await userRepository.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      })
      
      const foundUser = await userRepository.findById(createdUser.id)
      
      expect(foundUser).toMatchObject({
        id: createdUser.id,
        name: 'Test User',
        email: 'test@test.com'
      })
    })
    
    test('should return null for non-existent id', async () => {
      const user = await userRepository.findById(999999)
      expect(user).toBeNull()
    })
  })
  
  describe('findByEmail', () => {
    test('should return user by email', async () => {
      await userRepository.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      })
      
      const user = await userRepository.findByEmail('test@test.com')
      
      expect(user).toMatchObject({
        name: 'Test User',
        email: 'test@test.com'
      })
    })
    
    test('should return null for non-existent email', async () => {
      const user = await userRepository.findByEmail('nonexistent@test.com')
      expect(user).toBeNull()
    })
  })
  
  describe('create', () => {
    test('should create new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        age: 25
      }
      
      const user = await userRepository.create(userData)
      
      expect(user).toMatchObject({
        id: expect.any(Number),
        name: 'New User',
        email: 'new@test.com',
        age: 25,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      })
    })
    
    test('should handle database constraints', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123'
      }
      
      // 创建第一个用户
      await userRepository.create(userData)
      
      // 尝试创建相同邮箱的用户应该失败
      await expect(userRepository.create(userData))
        .rejects.toThrow(/duplicate key value/)
    })
  })
  
  describe('update', () => {
    test('should update existing user', async () => {
      const user = await userRepository.create({
        name: 'Original Name',
        email: 'original@test.com',
        password: 'password123'
      })
      
      const updatedUser = await userRepository.update(user.id, {
        name: 'Updated Name',
        age: 30
      })
      
      expect(updatedUser).toMatchObject({
        id: user.id,
        name: 'Updated Name',
        email: 'original@test.com',
        age: 30
      })
      expect(updatedUser.updated_at.getTime()).toBeGreaterThan(
        user.updated_at.getTime()
      )
    })
    
    test('should return null for non-existent user', async () => {
      const result = await userRepository.update(999999, { name: 'Updated' })
      expect(result).toBeNull()
    })
  })
  
  describe('delete', () => {
    test('should delete existing user', async () => {
      const user = await userRepository.create({
        name: 'To Delete',
        email: 'delete@test.com',
        password: 'password123'
      })
      
      const deleted = await userRepository.delete(user.id)
      expect(deleted).toBe(true)
      
      const foundUser = await userRepository.findById(user.id)
      expect(foundUser).toBeNull()
    })
    
    test('should return false for non-existent user', async () => {
      const deleted = await userRepository.delete(999999)
      expect(deleted).toBe(false)
    })
  })
  
  describe('getUsersWithPosts', () => {
    test('should return users with their posts', async () => {
      // 创建用户
      const user1 = await userRepository.create({
        name: 'User 1',
        email: 'user1@test.com',
        password: 'password123'
      })
      
      const user2 = await userRepository.create({
        name: 'User 2',
        email: 'user2@test.com',
        password: 'password123'
      })
      
      // 创建文章
      await db.query(
        'INSERT INTO posts (title, content, author_id, created_at) VALUES ($1, $2, $3, NOW())',
        ['Post 1', 'Content 1', user1.id]
      )
      
      await db.query(
        'INSERT INTO posts (title, content, author_id, created_at) VALUES ($1, $2, $3, NOW())',
        ['Post 2', 'Content 2', user1.id]
      )
      
      const users = await userRepository.getUsersWithPosts()
      
      expect(users).toHaveLength(2)
      
      const userWithPosts = users.find(u => u.id === user1.id)
      expect(userWithPosts.posts).toHaveLength(2)
      expect(userWithPosts.posts[0]).toMatchObject({
        title: expect.any(String),
        content: expect.any(String)
      })
      
      const userWithoutPosts = users.find(u => u.id === user2.id)
      expect(userWithoutPosts.posts).toEqual([])
    })
  })
  
  describe('Transaction handling', () => {
    test('should handle transactions correctly', async () => {
      await withTransaction(async (client) => {
        const transactionRepo = new UserRepository(client)
        
        // 在事务中创建用户
        const user = await transactionRepo.create({
          name: 'Transaction User',
          email: 'transaction@test.com',
          password: 'password123'
        })
        
        expect(user).toBeDefined()
        
        // 在事务中可以找到用户
        const foundUser = await transactionRepo.findById(user.id)
        expect(foundUser).toBeDefined()
      })
      
      // 事务回滚后，用户不应该存在
      const user = await userRepository.findByEmail('transaction@test.com')
      expect(user).toBeNull()
    })
  })
})
```

## 微服务集成测试

### 服务间通信测试

```javascript
// services/UserService.js
import axios from 'axios'

export class UserService {
  constructor(config) {
    this.apiClient = axios.create({
      baseURL: config.userServiceUrl,
      timeout: config.timeout || 5000
    })
  }
  
  async getUser(id) {
    try {
      const response = await this.apiClient.get(`/users/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
  
  async createUser(userData) {
    const response = await this.apiClient.post('/users', userData)
    return response.data
  }
}

// services/NotificationService.js
export class NotificationService {
  constructor(config) {
    this.apiClient = axios.create({
      baseURL: config.notificationServiceUrl,
      timeout: config.timeout || 5000
    })
  }
  
  async sendEmail(emailData) {
    const response = await this.apiClient.post('/notifications/email', emailData)
    return response.data
  }
  
  async sendSMS(smsData) {
    const response = await this.apiClient.post('/notifications/sms', smsData)
    return response.data
  }
}

// services/OrderService.js
export class OrderService {
  constructor(userService, notificationService, paymentService) {
    this.userService = userService
    this.notificationService = notificationService
    this.paymentService = paymentService
  }
  
  async createOrder(orderData) {
    // 验证用户
    const user = await this.userService.getUser(orderData.userId)
    if (!user) {
      throw new Error('User not found')
    }
    
    // 处理支付
    const payment = await this.paymentService.processPayment({
      amount: orderData.amount,
      userId: orderData.userId,
      paymentMethod: orderData.paymentMethod
    })
    
    if (!payment.success) {
      throw new Error('Payment failed')
    }
    
    // 创建订单
    const order = {
      id: Date.now(),
      userId: orderData.userId,
      items: orderData.items,
      amount: orderData.amount,
      paymentId: payment.id,
      status: 'confirmed',
      createdAt: new Date()
    }
    
    // 发送确认邮件
    await this.notificationService.sendEmail({
      to: user.email,
      subject: 'Order Confirmation',
      template: 'order_confirmation',
      data: { order, user }
    })
    
    return order
  }
}
```

```javascript
// __tests__/integration/microservices.test.js
import nock from 'nock'
import { UserService } from '../../services/UserService.js'
import { NotificationService } from '../../services/NotificationService.js'
import { PaymentService } from '../../services/PaymentService.js'
import { OrderService } from '../../services/OrderService.js'

describe('Microservices Integration Tests', () => {
  let userService
  let notificationService
  let paymentService
  let orderService
  
  const config = {
    userServiceUrl: 'http://user-service',
    notificationServiceUrl: 'http://notification-service',
    paymentServiceUrl: 'http://payment-service'
  }
  
  beforeEach(() => {
    userService = new UserService(config)
    notificationService = new NotificationService(config)
    paymentService = new PaymentService(config)
    orderService = new OrderService(userService, notificationService, paymentService)
    
    // 清理所有 nock 拦截器
    nock.cleanAll()
  })
  
  afterEach(() => {
    nock.cleanAll()
  })
  
  describe('UserService', () => {
    test('should get user successfully', async () => {
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      nock('http://user-service')
        .get('/users/1')
        .reply(200, userData)
      
      const user = await userService.getUser(1)
      
      expect(user).toEqual(userData)
    })
    
    test('should return null for non-existent user', async () => {
      nock('http://user-service')
        .get('/users/999')
        .reply(404)
      
      const user = await userService.getUser(999)
      
      expect(user).toBeNull()
    })
    
    test('should handle service errors', async () => {
      nock('http://user-service')
        .get('/users/1')
        .reply(500, { error: 'Internal Server Error' })
      
      await expect(userService.getUser(1))
        .rejects.toThrow()
    })
    
    test('should create user successfully', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      }
      
      const createdUser = {
        id: 2,
        ...userData,
        createdAt: '2023-01-01T00:00:00Z'
      }
      
      nock('http://user-service')
        .post('/users', userData)
        .reply(201, createdUser)
      
      const user = await userService.createUser(userData)
      
      expect(user).toEqual(createdUser)
    })
  })
  
  describe('NotificationService', () => {
    test('should send email successfully', async () => {
      const emailData = {
        to: 'user@example.com',
        subject: 'Test Email',
        template: 'test_template',
        data: { name: 'John' }
      }
      
      const response = {
        id: 'email-123',
        status: 'sent'
      }
      
      nock('http://notification-service')
        .post('/notifications/email', emailData)
        .reply(200, response)
      
      const result = await notificationService.sendEmail(emailData)
      
      expect(result).toEqual(response)
    })
  })
  
  describe('OrderService Integration', () => {
    test('should create order successfully', async () => {
      const orderData = {
        userId: 1,
        items: [{ id: 1, name: 'Product 1', price: 100 }],
        amount: 100,
        paymentMethod: 'credit_card'
      }
      
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      const paymentResponse = {
        id: 'payment-123',
        success: true,
        transactionId: 'txn-456'
      }
      
      const emailResponse = {
        id: 'email-789',
        status: 'sent'
      }
      
      // Mock 用户服务
      nock('http://user-service')
        .get('/users/1')
        .reply(200, userData)
      
      // Mock 支付服务
      nock('http://payment-service')
        .post('/payments', {
          amount: 100,
          userId: 1,
          paymentMethod: 'credit_card'
        })
        .reply(200, paymentResponse)
      
      // Mock 通知服务
      nock('http://notification-service')
        .post('/notifications/email')
        .reply(200, emailResponse)
      
      const order = await orderService.createOrder(orderData)
      
      expect(order).toMatchObject({
        id: expect.any(Number),
        userId: 1,
        items: orderData.items,
        amount: 100,
        paymentId: 'payment-123',
        status: 'confirmed',
        createdAt: expect.any(Date)
      })
    })
    
    test('should handle user not found', async () => {
      const orderData = {
        userId: 999,
        items: [{ id: 1, name: 'Product 1', price: 100 }],
        amount: 100,
        paymentMethod: 'credit_card'
      }
      
      nock('http://user-service')
        .get('/users/999')
        .reply(404)
      
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('User not found')
    })
    
    test('should handle payment failure', async () => {
      const orderData = {
        userId: 1,
        items: [{ id: 1, name: 'Product 1', price: 100 }],
        amount: 100,
        paymentMethod: 'credit_card'
      }
      
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      const paymentResponse = {
        id: 'payment-123',
        success: false,
        error: 'Insufficient funds'
      }
      
      nock('http://user-service')
        .get('/users/1')
        .reply(200, userData)
      
      nock('http://payment-service')
        .post('/payments')
        .reply(200, paymentResponse)
      
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow('Payment failed')
    })
    
    test('should handle notification service failure gracefully', async () => {
      const orderData = {
        userId: 1,
        items: [{ id: 1, name: 'Product 1', price: 100 }],
        amount: 100,
        paymentMethod: 'credit_card'
      }
      
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
      
      const paymentResponse = {
        id: 'payment-123',
        success: true,
        transactionId: 'txn-456'
      }
      
      nock('http://user-service')
        .get('/users/1')
        .reply(200, userData)
      
      nock('http://payment-service')
        .post('/payments')
        .reply(200, paymentResponse)
      
      // 通知服务失败
      nock('http://notification-service')
        .post('/notifications/email')
        .reply(500, { error: 'Service unavailable' })
      
      // 订单创建应该失败，因为通知是必需的
      await expect(orderService.createOrder(orderData))
        .rejects.toThrow()
    })
  })
  
  describe('Service timeout handling', () => {
    test('should handle service timeout', async () => {
      nock('http://user-service')
        .get('/users/1')
        .delay(6000) // 超过 5 秒超时
        .reply(200, { id: 1 })
      
      await expect(userService.getUser(1))
        .rejects.toThrow(/timeout/)
    })
  })
  
  describe('Network error handling', () => {
    test('should handle network errors', async () => {
      nock('http://user-service')
        .get('/users/1')
        .replyWithError('Network error')
      
      await expect(userService.getUser(1))
        .rejects.toThrow('Network error')
    })
  })
})
```

## 前端组件集成测试

### React 组件集成测试

```jsx
// components/UserProfile.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { userApi } from '../api/userApi'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { EditUserForm } from './EditUserForm'

export function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  
  useEffect(() => {
    loadUser()
  }, [userId])
  
  const loadUser = async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await userApi.getUser(userId)
      setUser(userData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleEdit = () => {
    setEditing(true)
  }
  
  const handleSave = async (updatedData) => {
    try {
      const updatedUser = await userApi.updateUser(userId, updatedData)
      setUser(updatedUser)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }
  
  const handleCancel = () => {
    setEditing(false)
  }
  
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.deleteUser(userId)
        navigate('/users')
      } catch (err) {
        setError(err.message)
      }
    }
  }
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (error) {
    return <ErrorMessage message={error} onRetry={loadUser} />
  }
  
  if (!user) {
    return <div>User not found</div>
  }
  
  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      
      {editing ? (
        <EditUserForm
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="user-details">
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Age: {user.age}</p>
            <p>Status: {user.status}</p>
          </div>
          
          <div className="user-actions">
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleDelete} className="danger">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

```jsx
// __tests__/integration/UserProfile.test.jsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProfile } from '../../components/UserProfile'
import { userApi } from '../../api/userApi'
import '@testing-library/jest-dom'

// Mock API
jest.mock('../../api/userApi')
const mockUserApi = userApi as jest.Mocked<typeof userApi>

// Mock navigate
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

// Test wrapper component
function TestWrapper({ userId = '1' }) {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/users/:userId" element={<UserProfile />} />
        <Route path="/users" element={<div>Users List</div>} />
      </Routes>
    </BrowserRouter>
  )
}

describe('UserProfile Integration Tests', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    status: 'active'
  }
  
  beforeEach(() => {
    mockUserApi.getUser.mockClear()
    mockUserApi.updateUser.mockClear()
    mockUserApi.deleteUser.mockClear()
    mockNavigate.mockClear()
    
    // Mock window.confirm
    window.confirm = jest.fn()
  })
  
  test('should load and display user profile', async () => {
    mockUserApi.getUser.mockResolvedValue(mockUser)
    
    // 设置初始路由
    window.history.pushState({}, '', '/users/1')
    
    render(<TestWrapper />)
    
    // 应该显示加载状态
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    // 等待用户数据加载
    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument()
    })
    
    // 验证用户信息显示
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Age: 30')).toBeInTheDocument()
    expect(screen.getByText('Status: active')).toBeInTheDocument()
    
    // 验证操作按钮
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
    
    expect(mockUserApi.getUser).toHaveBeenCalledWith('1')
  })
  
  test('should handle API error', async () => {
    mockUserApi.getUser.mockRejectedValue(new Error('User not found'))
    
    window.history.pushState({}, '', '/users/1')
    render(<TestWrapper />)
    
    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument()
    })
    
    // 应该显示重试按钮
    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })
  
  test('should retry loading user on error', async () => {
    mockUserApi.getUser
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockUser)
    
    window.history.pushState({}, '', '/users/1')
    render(<TestWrapper />)
    
    // 等待错误显示
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
    
    // 点击重试
    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)
    
    // 等待成功加载
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    expect(mockUserApi.getUser).toHaveBeenCalledTimes(2)
  })
  
  test('should enter edit mode when edit button clicked', async () => {
    mockUserApi.getUser.mockResolvedValue(mockUser)
    
    window.history.pushState({}, '', '/users/1')
    render(<TestWrapper />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
    
    // 点击编辑按钮
    const editButton = screen.getByRole('button', { name: /edit/i })
    fireEvent.click(editButton)
    
    // 应该显示编辑表单
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    })
    
    // 应该显示保存和取消按钮
    expect(screen.getByRole('button', { name: /save/i })).toBeIn