# gRPC API 设计与实现

## 简介

gRPC（gRPC Remote Procedure Calls）是由 Google 开发的高性能、开源的通用 RPC 框架。它使用 Protocol Buffers 作为接口定义语言和消息交换格式，支持多种编程语言。

### 核心特性

- **高性能**：基于 HTTP/2 协议，支持多路复用和流式传输
- **跨语言支持**：支持多种编程语言的客户端和服务端
- **强类型**：使用 Protocol Buffers 定义严格的 API 契约
- **双向流式传输**：支持客户端流、服务端流和双向流
- **内置负载均衡**：支持多种负载均衡策略
- **认证和安全**：内置 TLS 支持和多种认证机制

### 适用场景

- 微服务间通信
- 高性能 API 服务
- 实时数据流处理
- 移动应用后端服务
- 物联网设备通信
- 分布式系统集成

## Protocol Buffers 基础

### 1. 定义服务接口

```protobuf
// user.proto
syntax = "proto3";

package user;

option go_package = "./proto/user";

// 用户服务定义
service UserService {
  // 获取用户信息
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  
  // 创建用户
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  
  // 更新用户
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
  
  // 删除用户
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
  
  // 获取用户列表（服务端流）
  rpc ListUsers(ListUsersRequest) returns (stream User);
  
  // 批量创建用户（客户端流）
  rpc BatchCreateUsers(stream CreateUserRequest) returns (BatchCreateUsersResponse);
  
  // 用户聊天（双向流）
  rpc UserChat(stream ChatMessage) returns (stream ChatMessage);
}

// 用户消息定义
message User {
  int64 id = 1;
  string username = 2;
  string email = 3;
  string full_name = 4;
  string avatar_url = 5;
  int64 created_at = 6;
  int64 updated_at = 7;
  UserStatus status = 8;
  repeated string roles = 9;
  map<string, string> metadata = 10;
}

// 用户状态枚举
enum UserStatus {
  USER_STATUS_UNSPECIFIED = 0;
  USER_STATUS_ACTIVE = 1;
  USER_STATUS_INACTIVE = 2;
  USER_STATUS_SUSPENDED = 3;
  USER_STATUS_DELETED = 4;
}

// 请求和响应消息
message GetUserRequest {
  int64 user_id = 1;
  repeated string fields = 2; // 指定返回字段
}

message GetUserResponse {
  User user = 1;
  bool found = 2;
}

message CreateUserRequest {
  string username = 1;
  string email = 2;
  string password = 3;
  string full_name = 4;
  string avatar_url = 5;
  repeated string roles = 6;
  map<string, string> metadata = 7;
}

message CreateUserResponse {
  User user = 1;
  bool success = 2;
  string message = 3;
}

message UpdateUserRequest {
  int64 user_id = 1;
  optional string username = 2;
  optional string email = 3;
  optional string full_name = 4;
  optional string avatar_url = 5;
  optional UserStatus status = 6;
  repeated string roles = 7;
  map<string, string> metadata = 8;
}

message UpdateUserResponse {
  User user = 1;
  bool success = 2;
  string message = 3;
}

message DeleteUserRequest {
  int64 user_id = 1;
  bool soft_delete = 2; // 软删除标志
}

message DeleteUserResponse {
  bool success = 1;
  string message = 2;
}

message ListUsersRequest {
  int32 page = 1;
  int32 page_size = 2;
  string search = 3;
  UserStatus status = 4;
  repeated string roles = 5;
  string sort_by = 6;
  string sort_order = 7;
}

message BatchCreateUsersResponse {
  repeated User users = 1;
  int32 success_count = 2;
  int32 error_count = 3;
  repeated string errors = 4;
}

message ChatMessage {
  int64 from_user_id = 1;
  int64 to_user_id = 2;
  string content = 3;
  int64 timestamp = 4;
  MessageType type = 5;
}

enum MessageType {
  MESSAGE_TYPE_UNSPECIFIED = 0;
  MESSAGE_TYPE_TEXT = 1;
  MESSAGE_TYPE_IMAGE = 2;
  MESSAGE_TYPE_FILE = 3;
  MESSAGE_TYPE_SYSTEM = 4;
}
```

### 2. 错误处理定义

```protobuf
// error.proto
syntax = "proto3";

package common;

// 错误详情
message ErrorDetail {
  string code = 1;
  string message = 2;
  string field = 3;
  map<string, string> metadata = 4;
}

// 验证错误
message ValidationError {
  repeated ErrorDetail errors = 1;
}

// 业务错误
message BusinessError {
  string error_code = 1;
  string error_message = 2;
  map<string, string> context = 3;
}
```

## Node.js 服务端实现

### 1. 基础服务器设置

```javascript
// server.js
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

// 加载 proto 文件
const PROTO_PATH = path.join(__dirname, 'proto/user.proto')
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})

const userProto = grpc.loadPackageDefinition(packageDefinition).user

// 模拟数据库
class UserDatabase {
  constructor() {
    this.users = new Map()
    this.nextId = 1
    
    // 初始化一些测试数据
    this.seedData()
  }
  
  seedData() {
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        full_name: 'Administrator',
        roles: ['admin', 'user']
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        full_name: 'John Doe',
        roles: ['user']
      }
    ]
    
    testUsers.forEach(userData => {
      this.createUser(userData)
    })
  }
  
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    const now = Date.now()
    
    const user = {
      id: this.nextId++,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      full_name: userData.full_name || '',
      avatar_url: userData.avatar_url || '',
      created_at: now,
      updated_at: now,
      status: 'USER_STATUS_ACTIVE',
      roles: userData.roles || ['user'],
      metadata: userData.metadata || {}
    }
    
    this.users.set(user.id, user)
    return user
  }
  
  getUserById(id) {
    return this.users.get(parseInt(id))
  }
  
  getUserByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user
      }
    }
    return null
  }
  
  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user
      }
    }
    return null
  }
  
  updateUser(id, updates) {
    const user = this.users.get(parseInt(id))
    if (!user) return null
    
    const updatedUser = {
      ...user,
      ...updates,
      updated_at: Date.now()
    }
    
    this.users.set(parseInt(id), updatedUser)
    return updatedUser
  }
  
  deleteUser(id, softDelete = true) {
    const user = this.users.get(parseInt(id))
    if (!user) return false
    
    if (softDelete) {
      this.updateUser(id, { status: 'USER_STATUS_DELETED' })
    } else {
      this.users.delete(parseInt(id))
    }
    
    return true
  }
  
  listUsers(filters = {}) {
    let users = Array.from(this.users.values())
    
    // 应用过滤器
    if (filters.status) {
      users = users.filter(user => user.status === filters.status)
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      users = users.filter(user => 
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.full_name.toLowerCase().includes(search)
      )
    }
    
    if (filters.roles && filters.roles.length > 0) {
      users = users.filter(user => 
        filters.roles.some(role => user.roles.includes(role))
      )
    }
    
    // 排序
    if (filters.sort_by) {
      const sortOrder = filters.sort_order === 'desc' ? -1 : 1
      users.sort((a, b) => {
        const aVal = a[filters.sort_by]
        const bVal = b[filters.sort_by]
        if (aVal < bVal) return -1 * sortOrder
        if (aVal > bVal) return 1 * sortOrder
        return 0
      })
    }
    
    // 分页
    const page = filters.page || 1
    const pageSize = filters.page_size || 10
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return users.slice(startIndex, endIndex)
  }
}

// gRPC 服务实现
class UserServiceImpl {
  constructor() {
    this.db = new UserDatabase()
    this.chatSessions = new Map() // 存储聊天会话
  }
  
  // 认证中间件
  authenticate(call) {
    const metadata = call.metadata
    const authHeader = metadata.get('authorization')[0]
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw {
        code: grpc.status.UNAUTHENTICATED,
        message: 'Missing or invalid authorization header'
      }
    }
    
    const token = authHeader.substring(7)
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
      return decoded
    } catch (error) {
      throw {
        code: grpc.status.UNAUTHENTICATED,
        message: 'Invalid token'
      }
    }
  }
  
  // 获取用户
  async getUser(call, callback) {
    try {
      // 认证（可选，根据需要）
      // const currentUser = this.authenticate(call)
      
      const { user_id, fields } = call.request
      
      if (!user_id) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'User ID is required'
        })
      }
      
      const user = this.db.getUserById(user_id)
      
      if (!user) {
        return callback(null, {
          user: null,
          found: false
        })
      }
      
      // 过滤字段（如果指定）
      let responseUser = { ...user }
      delete responseUser.password // 永远不返回密码
      
      if (fields && fields.length > 0) {
        const filteredUser = {}
        fields.forEach(field => {
          if (responseUser[field] !== undefined) {
            filteredUser[field] = responseUser[field]
          }
        })
        responseUser = filteredUser
      }
      
      callback(null, {
        user: responseUser,
        found: true
      })
    } catch (error) {
      console.error('GetUser error:', error)
      callback({
        code: error.code || grpc.status.INTERNAL,
        message: error.message || 'Internal server error'
      })
    }
  }
  
  // 创建用户
  async createUser(call, callback) {
    try {
      const { username, email, password, full_name, avatar_url, roles, metadata } = call.request
      
      // 验证必填字段
      if (!username || !email || !password) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Username, email, and password are required'
        })
      }
      
      // 验证用户名和邮箱唯一性
      if (this.db.getUserByUsername(username)) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: 'Username already exists'
        })
      }
      
      if (this.db.getUserByEmail(email)) {
        return callback({
          code: grpc.status.ALREADY_EXISTS,
          message: 'Email already exists'
        })
      }
      
      // 验证密码强度
      if (password.length < 6) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'Password must be at least 6 characters long'
        })
      }
      
      // 创建用户
      const user = await this.db.createUser({
        username,
        email,
        password,
        full_name,
        avatar_url,
        roles,
        metadata
      })
      
      // 移除密码字段
      const responseUser = { ...user }
      delete responseUser.password
      
      callback(null, {
        user: responseUser,
        success: true,
        message: 'User created successfully'
      })
    } catch (error) {
      console.error('CreateUser error:', error)
      callback({
        code: error.code || grpc.status.INTERNAL,
        message: error.message || 'Internal server error'
      })
    }
  }
  
  // 更新用户
  async updateUser(call, callback) {
    try {
      const { user_id, ...updates } = call.request
      
      if (!user_id) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'User ID is required'
        })
      }
      
      const existingUser = this.db.getUserById(user_id)
      if (!existingUser) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found'
        })
      }
      
      // 验证唯一性约束
      if (updates.username && updates.username !== existingUser.username) {
        const userWithUsername = this.db.getUserByUsername(updates.username)
        if (userWithUsername && userWithUsername.id !== parseInt(user_id)) {
          return callback({
            code: grpc.status.ALREADY_EXISTS,
            message: 'Username already exists'
          })
        }
      }
      
      if (updates.email && updates.email !== existingUser.email) {
        const userWithEmail = this.db.getUserByEmail(updates.email)
        if (userWithEmail && userWithEmail.id !== parseInt(user_id)) {
          return callback({
            code: grpc.status.ALREADY_EXISTS,
            message: 'Email already exists'
          })
        }
      }
      
      // 过滤掉未定义的字段
      const filteredUpdates = {}
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          filteredUpdates[key] = updates[key]
        }
      })
      
      const updatedUser = this.db.updateUser(user_id, filteredUpdates)
      
      // 移除密码字段
      const responseUser = { ...updatedUser }
      delete responseUser.password
      
      callback(null, {
        user: responseUser,
        success: true,
        message: 'User updated successfully'
      })
    } catch (error) {
      console.error('UpdateUser error:', error)
      callback({
        code: error.code || grpc.status.INTERNAL,
        message: error.message || 'Internal server error'
      })
    }
  }
  
  // 删除用户
  async deleteUser(call, callback) {
    try {
      const { user_id, soft_delete } = call.request
      
      if (!user_id) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          message: 'User ID is required'
        })
      }
      
      const success = this.db.deleteUser(user_id, soft_delete)
      
      if (!success) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: 'User not found'
        })
      }
      
      callback(null, {
        success: true,
        message: soft_delete ? 'User soft deleted successfully' : 'User deleted successfully'
      })
    } catch (error) {
      console.error('DeleteUser error:', error)
      callback({
        code: error.code || grpc.status.INTERNAL,
        message: error.message || 'Internal server error'
      })
    }
  }
  
  // 获取用户列表（服务端流）
  async listUsers(call) {
    try {
      const filters = call.request
      const users = this.db.listUsers(filters)
      
      // 流式发送用户数据
      for (const user of users) {
        const responseUser = { ...user }
        delete responseUser.password
        
        call.write(responseUser)
        
        // 模拟延迟（实际应用中可能不需要）
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      call.end()
    } catch (error) {
      console.error('ListUsers error:', error)
      call.emit('error', {
        code: error.code || grpc.status.INTERNAL,
        message: error.message || 'Internal server error'
      })
    }
  }
  
  // 批量创建用户（客户端流）
  async batchCreateUsers(call, callback) {
    const users = []
    const errors = []
    let successCount = 0
    let errorCount = 0
    
    call.on('data', async (request) => {
      try {
        const { username, email, password, full_name, avatar_url, roles, metadata } = request
        
        // 验证必填字段
        if (!username || !email || !password) {
          errors.push(`Invalid data for user ${username || 'unknown'}: missing required fields`)
          errorCount++
          return
        }
        
        // 验证唯一性
        if (this.db.getUserByUsername(username)) {
          errors.push(`Username ${username} already exists`)
          errorCount++
          return
        }
        
        if (this.db.getUserByEmail(email)) {
          errors.push(`Email ${email} already exists`)
          errorCount++
          return
        }
        
        // 创建用户
        const user = await this.db.createUser({
          username,
          email,
          password,
          full_name,
          avatar_url,
          roles,
          metadata
        })
        
        const responseUser = { ...user }
        delete responseUser.password
        
        users.push(responseUser)
        successCount++
      } catch (error) {
        errors.push(`Error creating user: ${error.message}`)
        errorCount++
      }
    })
    
    call.on('end', () => {
      callback(null, {
        users,
        success_count: successCount,
        error_count: errorCount,
        errors
      })
    })
    
    call.on('error', (error) => {
      console.error('BatchCreateUsers error:', error)
      callback({
        code: grpc.status.INTERNAL,
        message: 'Stream error occurred'
      })
    })
  }
  
  // 用户聊天（双向流）
  async userChat(call) {
    const sessionId = uuidv4()
    console.log(`Chat session ${sessionId} started`)
    
    // 存储会话信息
    this.chatSessions.set(sessionId, {
      call,
      startTime: Date.now(),
      messageCount: 0
    })
    
    call.on('data', (message) => {
      try {
        const session = this.chatSessions.get(sessionId)
        if (session) {
          session.messageCount++
        }
        
        console.log(`Chat message received:`, message)
        
        // 处理消息（这里可以添加业务逻辑）
        const response = {
          from_user_id: 0, // 系统消息
          to_user_id: message.from_user_id,
          content: `Echo: ${message.content}`,
          timestamp: Date.now(),
          type: 'MESSAGE_TYPE_SYSTEM'
        }
        
        // 发送响应
        call.write(response)
        
        // 广播给其他用户（实际应用中的逻辑）
        this.broadcastMessage(message, sessionId)
      } catch (error) {
        console.error('Chat message error:', error)
        call.emit('error', {
          code: grpc.status.INTERNAL,
          message: 'Error processing chat message'
        })
      }
    })
    
    call.on('end', () => {
      console.log(`Chat session ${sessionId} ended`)
      this.chatSessions.delete(sessionId)
      call.end()
    })
    
    call.on('error', (error) => {
      console.error(`Chat session ${sessionId} error:`, error)
      this.chatSessions.delete(sessionId)
    })
  }
  
  // 广播消息给其他会话
  broadcastMessage(message, excludeSessionId) {
    this.chatSessions.forEach((session, sessionId) => {
      if (sessionId !== excludeSessionId) {
        try {
          session.call.write(message)
        } catch (error) {
          console.error(`Error broadcasting to session ${sessionId}:`, error)
        }
      }
    })
  }
}

// 创建和启动服务器
function startServer() {
  const server = new grpc.Server()
  const userService = new UserServiceImpl()
  
  // 注册服务
  server.addService(userProto.UserService.service, {
    getUser: userService.getUser.bind(userService),
    createUser: userService.createUser.bind(userService),
    updateUser: userService.updateUser.bind(userService),
    deleteUser: userService.deleteUser.bind(userService),
    listUsers: userService.listUsers.bind(userService),
    batchCreateUsers: userService.batchCreateUsers.bind(userService),
    userChat: userService.userChat.bind(userService)
  })
  
  // 启动服务器
  const port = process.env.GRPC_PORT || 50051
  const bindAddress = `0.0.0.0:${port}`
  
  server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
      console.error('Failed to start gRPC server:', error)
      return
    }
    
    console.log(`gRPC server listening on ${bindAddress}`)
    server.start()
  })
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully')
    server.tryShutdown((error) => {
      if (error) {
        console.error('Error during shutdown:', error)
        process.exit(1)
      } else {
        console.log('gRPC server stopped')
        process.exit(0)
      }
    })
  })
}

// 启动服务器
if (require.main === module) {
  startServer()
}

module.exports = { UserServiceImpl, startServer }
```

### 2. 客户端实现

```javascript
// client.js
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')

// 加载 proto 文件
const PROTO_PATH = path.join(__dirname, 'proto/user.proto')
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
})

const userProto = grpc.loadPackageDefinition(packageDefinition).user

class UserServiceClient {
  constructor(serverAddress = 'localhost:50051') {
    this.client = new userProto.UserService(
      serverAddress,
      grpc.credentials.createInsecure()
    )
  }
  
  // 设置认证令牌
  setAuthToken(token) {
    this.authToken = token
  }
  
  // 获取认证元数据
  getAuthMetadata() {
    const metadata = new grpc.Metadata()
    if (this.authToken) {
      metadata.add('authorization', `Bearer ${this.authToken}`)
    }
    return metadata
  }
  
  // 获取用户
  async getUser(userId, fields = []) {
    return new Promise((resolve, reject) => {
      const request = {
        user_id: userId,
        fields
      }
      
      this.client.getUser(request, this.getAuthMetadata(), (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
  
  // 创建用户
  async createUser(userData) {
    return new Promise((resolve, reject) => {
      this.client.createUser(userData, this.getAuthMetadata(), (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
  
  // 更新用户
  async updateUser(userId, updates) {
    return new Promise((resolve, reject) => {
      const request = {
        user_id: userId,
        ...updates
      }
      
      this.client.updateUser(request, this.getAuthMetadata(), (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
  
  // 删除用户
  async deleteUser(userId, softDelete = true) {
    return new Promise((resolve, reject) => {
      const request = {
        user_id: userId,
        soft_delete: softDelete
      }
      
      this.client.deleteUser(request, this.getAuthMetadata(), (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
  
  // 获取用户列表（服务端流）
  async listUsers(filters = {}) {
    return new Promise((resolve, reject) => {
      const users = []
      const call = this.client.listUsers(filters, this.getAuthMetadata())
      
      call.on('data', (user) => {
        users.push(user)
      })
      
      call.on('end', () => {
        resolve(users)
      })
      
      call.on('error', (error) => {
        reject(error)
      })
    })
  }
  
  // 批量创建用户（客户端流）
  async batchCreateUsers(usersData) {
    return new Promise((resolve, reject) => {
      const call = this.client.batchCreateUsers(this.getAuthMetadata(), (error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
      
      // 发送用户数据
      usersData.forEach(userData => {
        call.write(userData)
      })
      
      call.end()
    })
  }
  
  // 用户聊天（双向流）
  createChatSession() {
    const call = this.client.userChat(this.getAuthMetadata())
    
    return {
      // 发送消息
      sendMessage: (message) => {
        call.write(message)
      },
      
      // 监听消息
      onMessage: (callback) => {
        call.on('data', callback)
      },
      
      // 监听错误
      onError: (callback) => {
        call.on('error', callback)
      },
      
      // 结束会话
      end: () => {
        call.end()
      }
    }
  }
  
  // 关闭客户端
  close() {
    this.client.close()
  }
}

// 使用示例
async function example() {
  const client = new UserServiceClient()
  
  try {
    // 创建用户
    console.log('Creating user...')
    const createResponse = await client.createUser({
      username: 'test_user',
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      roles: ['user']
    })
    console.log('User created:', createResponse)
    
    const userId = createResponse.user.id
    
    // 获取用户
    console.log('Getting user...')
    const getResponse = await client.getUser(userId)
    console.log('User retrieved:', getResponse)
    
    // 更新用户
    console.log('Updating user...')
    const updateResponse = await client.updateUser(userId, {
      full_name: 'Updated Test User'
    })
    console.log('User updated:', updateResponse)
    
    // 获取用户列表
    console.log('Listing users...')
    const users = await client.listUsers({
      page: 1,
      page_size: 10,
      status: 'USER_STATUS_ACTIVE'
    })
    console.log('Users:', users)
    
    // 批量创建用户
    console.log('Batch creating users...')
    const batchUsers = [
      {
        username: 'batch_user1',
        email: 'batch1@example.com',
        password: 'password123',
        full_name: 'Batch User 1'
      },
      {
        username: 'batch_user2',
        email: 'batch2@example.com',
        password: 'password123',
        full_name: 'Batch User 2'
      }
    ]
    
    const batchResponse = await client.batchCreateUsers(batchUsers)
    console.log('Batch create response:', batchResponse)
    
    // 聊天示例
    console.log('Starting chat session...')
    const chatSession = client.createChatSession()
    
    chatSession.onMessage((message) => {
      console.log('Received message:', message)
    })
    
    chatSession.onError((error) => {
      console.error('Chat error:', error)
    })
    
    // 发送几条消息
    chatSession.sendMessage({
      from_user_id: userId,
      to_user_id: 0,
      content: 'Hello, World!',
      timestamp: Date.now(),
      type: 'MESSAGE_TYPE_TEXT'
    })
    
    setTimeout(() => {
      chatSession.sendMessage({
        from_user_id: userId,
        to_user_id: 0,
        content: 'How are you?',
        timestamp: Date.now(),
        type: 'MESSAGE_TYPE_TEXT'
      })
    }, 1000)
    
    // 5秒后结束聊天
    setTimeout(() => {
      chatSession.end()
      console.log('Chat session ended')
    }, 5000)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// 运行示例
if (require.main === module) {
  example()
}

module.exports = UserServiceClient
```

## 性能优化

### 1. 连接池管理

```javascript
// connection-pool.js
const grpc = require('@grpc/grpc-js')

class GRPCConnectionPool {
  constructor(serviceDefinition, serverAddress, options = {}) {
    this.serviceDefinition = serviceDefinition
    this.serverAddress = serverAddress
    this.maxConnections = options.maxConnections || 10
    this.connections = []
    this.currentIndex = 0
    
    // 创建初始连接
    this.initializeConnections()
  }
  
  initializeConnections() {
    for (let i = 0; i < this.maxConnections; i++) {
      const client = new this.serviceDefinition(
        this.serverAddress,
        grpc.credentials.createInsecure(),
        {
          'grpc.keepalive_time_ms': 30000,
          'grpc.keepalive_timeout_ms': 5000,
          'grpc.keepalive_permit_without_calls': true,
          'grpc.http2.max_pings_without_data': 0,
          'grpc.http2.min_time_between_pings_ms': 10000,
          'grpc.http2.min_ping_interval_without_data_ms': 300000
        }
      )
      
      this.connections.push(client)
    }
  }
  
  getConnection() {
    const connection = this.connections[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.maxConnections
    return connection
  }
  
  closeAll() {
    this.connections.forEach(client => {
      client.close()
    })
  }
}

module.exports = GRPCConnectionPool
```

### 2. 缓存策略

```javascript
// cache-middleware.js
const NodeCache = require('node-cache')

class GRPCCacheMiddleware {
  constructor(options = {}) {
    this.cache = new NodeCache({
      stdTTL: options.ttl || 300, // 5分钟默认TTL
      checkperiod: options.checkPeriod || 60 // 1分钟检查过期
    })
  }
  
  // 生成缓存键
  generateCacheKey(method, request) {
    return `${method}:${JSON.stringify(request)}`
  }
  
  // 缓存装饰器
  withCache(method, ttl) {
    return (originalMethod) => {
      return async (call, callback) => {
        const cacheKey = this.generateCacheKey(method, call.request)
        
        // 尝试从缓存获取
        const cachedResult = this.cache.get(cacheKey)
        if (cachedResult) {
          console.log(`Cache hit for ${method}`)
          return callback(null, cachedResult)
        }
        
        // 缓存未命中，调用原方法
        const originalCallback = callback
        const wrappedCallback = (error, response) => {
          if (!error && response) {
            // 缓存成功响应
            this.cache.set(cacheKey, response, ttl || this.cache.options.stdTTL)
            console.log(`Cached result for ${method}`)
          }
          originalCallback(error, response)
        }
        
        return originalMethod.call(this, call, wrappedCallback)
      }
    }
  }
  
  // 清除缓存
  clearCache(pattern) {
    if (pattern) {
      const keys = this.cache.keys()
      const matchingKeys = keys.filter(key => key.includes(pattern))
      this.cache.del(matchingKeys)
    } else {
      this.cache.flushAll()
    }
  }
}

module.exports = GRPCCacheMiddleware
```

### 3. 负载均衡

```javascript
// load-balancer.js
const grpc = require('@grpc/grpc-js')

class GRPCLoadBalancer {
  constructor(serviceDefinition, servers, strategy = 'round-robin') {
    this.serviceDefinition = serviceDefinition
    this.servers = servers
    this.strategy = strategy
    this.currentIndex = 0
    this.clients = new Map()
    
    this.initializeClients()
  }
  
  initializeClients() {
    this.servers.forEach(server => {
      const client = new this.serviceDefinition(
        server.address,
        grpc.credentials.createInsecure()
      )
      
      this.clients.set(server.address, {
        client,
        weight: server.weight || 1,
        healthy: true,
        lastCheck: Date.now()
      })
    })
    
    // 启动健康检查
    this.startHealthCheck()
  }
  
  getClient() {
    const healthyServers = Array.from(this.clients.entries())
      .filter(([_, info]) => info.healthy)
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available')
    }
    
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobinSelect(healthyServers)
      case 'weighted':
        return this.weightedSelect(healthyServers)
      case 'random':
        return this.randomSelect(healthyServers)
      default:
        return this.roundRobinSelect(healthyServers)
    }
  }
  
  roundRobinSelect(servers) {
    const [address, info] = servers[this.currentIndex % servers.length]
    this.currentIndex++
    return info.client
  }
  
  weightedSelect(servers) {
    const totalWeight = servers.reduce((sum, [_, info]) => sum + info.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const [address, info] of servers) {
      random -= info.weight
      if (random <= 0) {
        return info.client
      }
    }
    
    return servers[0][1].client
  }
  
  randomSelect(servers) {
    const randomIndex = Math.floor(Math.random() * servers.length)
    return servers[randomIndex][1].client
  }
  
  startHealthCheck() {
    setInterval(() => {
      this.clients.forEach(async (info, address) => {
        try {
          // 简单的健康检查（可以根据需要实现更复杂的检查）
          const deadline = new Date(Date.now() + 5000) // 5秒超时
          
          await new Promise((resolve, reject) => {
            info.client.waitForReady(deadline, (error) => {
              if (error) {
                reject(error)
              } else {
                resolve()
              }
            })
          })
          
          info.healthy = true
          info.lastCheck = Date.now()
        } catch (error) {
          console.warn(`Server ${address} health check failed:`, error.message)
          info.healthy = false
          info.lastCheck = Date.now()
        }
      })
    }, 30000) // 每30秒检查一次
  }
  
  closeAll() {
    this.clients.forEach(info => {
      info.client.close()
    })
  }
}

module.exports = GRPCLoadBalancer
```

## 安全性

### 1. TLS 配置

```javascript
// tls-server.js
const grpc = require('@grpc/grpc-js')
const fs = require('fs')
const path = require('path')

function createSecureServer() {
  const server = new grpc.Server()
  
  // 加载 TLS 证书
  const serverCert = fs.readFileSync(path.join(__dirname, 'certs/server.crt'))
  const serverKey = fs.readFileSync(path.join(__dirname, 'certs/server.key'))
  const caCert = fs.readFileSync(path.join(__dirname, 'certs/ca.crt'))
  
  // 创建 SSL 凭据
  const sslCredentials = grpc.ServerCredentials.createSsl(
    caCert,
    [{
      cert_chain: serverCert,
      private_key: serverKey
    }],
    true // 要求客户端证书
  )
  
  // 注册服务...
  
  const port = process.env.GRPC_SECURE_PORT || 50052
  const bindAddress = `0.0.0.0:${port}`
  
  server.bindAsync(bindAddress, sslCredentials, (error, port) => {
    if (error) {
      console.error('Failed to start secure gRPC server:', error)
      return
    }
    
    console.log(`Secure gRPC server listening on ${bindAddress}`)
    server.start()
  })
  
  return server
}

module.exports = { createSecureServer }
```

### 2. 认证和授权

```javascript
// auth-middleware.js
const grpc = require('@grpc/grpc-js')
const jwt = require('jsonwebtoken')

class AuthMiddleware {
  constructor(options = {}) {
    this.jwtSecret = options.jwtSecret || process.env.JWT_SECRET
    this.publicMethods = options.publicMethods || []
    this.adminMethods = options.adminMethods || []
  }
  
  // 认证拦截器
  createAuthInterceptor() {
    return (options, nextCall) => {
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const methodName = options.method_definition.path
          
          // 检查是否为公开方法
          if (this.publicMethods.includes(methodName)) {
            return next(metadata, listener)
          }
          
          // 提取认证令牌
          const authHeader = metadata.get('authorization')[0]
          if (!authHeader || !authHeader.startsWith('Bearer ')) {
            const error = new Error('Missing or invalid authorization header')
            error.code = grpc.status.UNAUTHENTICATED
            return listener.onReceiveStatus(error)
          }
          
          const token = authHeader.substring(7)
          
          try {
            const decoded = jwt.verify(token, this.jwtSecret)
            
            // 检查管理员权限
            if (this.adminMethods.includes(methodName) && !decoded.roles.includes('admin')) {
              const error = new Error('Insufficient permissions')
              error.code = grpc.status.PERMISSION_DENIED
              return listener.onReceiveStatus(error)
            }
            
            // 将用户信息添加到元数据
            metadata.add('user-id', decoded.userId.toString())
            metadata.add('user-roles', JSON.stringify(decoded.roles))
            
            next(metadata, listener)
          } catch (error) {
            const authError = new Error('Invalid token')
            authError.code = grpc.status.UNAUTHENTICATED
            listener.onReceiveStatus(authError)
          }
        }
      })
    }
  }
  
  // 速率限制拦截器
  createRateLimitInterceptor(options = {}) {
    const rateLimits = new Map()
    const windowMs = options.windowMs || 60000 // 1分钟
    const maxRequests = options.maxRequests || 100
    
    return (options, nextCall) => {
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const clientId = metadata.get('user-id')[0] || 'anonymous'
          const now = Date.now()
          const windowStart = now - windowMs
          
          // 获取或创建客户端速率限制记录
          if (!rateLimits.has(clientId)) {
            rateLimits.set(clientId, [])
          }
          
          const requests = rateLimits.get(clientId)
          
          // 清理过期请求
          const validRequests = requests.filter(timestamp => timestamp > windowStart)
          
          // 检查速率限制
          if (validRequests.length >= maxRequests) {
            const error = new Error('Rate limit exceeded')
            error.code = grpc.status.RESOURCE_EXHAUSTED
            return listener.onReceiveStatus(error)
          }
          
          // 记录当前请求
          validRequests.push(now)
          rateLimits.set(clientId, validRequests)
          
          next(metadata, listener)
        }
      })
    }
  }
}

module.exports = AuthMiddleware
```

## 监控和调试

### 1. 性能监控

```javascript
// monitoring.js
const grpc = require('@grpc/grpc-js')
const prometheus = require('prom-client')

class GRPCMonitoring {
  constructor() {
    // 创建 Prometheus 指标
    this.requestCounter = new prometheus.Counter({
      name: 'grpc_requests_total',
      help: 'Total number of gRPC requests',
      labelNames: ['method', 'status']
    })
    
    this.requestDuration = new prometheus.Histogram({
      name: 'grpc_request_duration_seconds',
      help: 'Duration of gRPC requests in seconds',
      labelNames: ['method'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5]
    })
    
    this.activeConnections = new prometheus.Gauge({
      name: 'grpc_active_connections',
      help: 'Number of active gRPC connections'
    })
    
    // 注册默认指标
    prometheus.register.registerMetric(this.requestCounter)
    prometheus.register.registerMetric(this.requestDuration)
    prometheus.register.registerMetric(this.activeConnections)
  }
  
  // 创建监控拦截器
  createMonitoringInterceptor() {
    return (options, nextCall) => {
      const methodName = options.method_definition.path
      const startTime = Date.now()
      
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          this.activeConnections.inc()
          
          const wrappedListener = {
            ...listener,
            onReceiveStatus: (status) => {
              const duration = (Date.now() - startTime) / 1000
              const statusCode = status.code === grpc.status.OK ? 'success' : 'error'
              
              this.requestCounter.inc({ method: methodName, status: statusCode })
              this.requestDuration.observe({ method: methodName }, duration)
              this.activeConnections.dec()
              
              console.log(`gRPC ${methodName} - Status: ${statusCode}, Duration: ${duration}s`)
              
              listener.onReceiveStatus(status)
            }
          }
          
          next(metadata, wrappedListener)
        }
      })
    }
  }
  
  // 获取指标
  getMetrics() {
    return prometheus.register.metrics()
  }
}

module.exports = GRPCMonitoring
```

### 2. 日志记录

```javascript
// logger.js
const winston = require('winston')
const grpc = require('@grpc/grpc-js')

class GRPCLogger {
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'grpc-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'grpc-combined.log' }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    })
  }
  
  // 创建日志拦截器
  createLoggingInterceptor() {
    return (options, nextCall) => {
      const methodName = options.method_definition.path
      const requestId = this.generateRequestId()
      
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          const startTime = Date.now()
          
          this.logger.info('gRPC request started', {
            requestId,
            method: methodName,
            timestamp: new Date().toISOString()
          })
          
          const wrappedListener = {
            ...listener,
            onReceiveMessage: (message) => {
              this.logger.debug('gRPC response message', {
                requestId,
                method: methodName,
                messageSize: JSON.stringify(message).length
              })
              listener.onReceiveMessage(message)
            },
            onReceiveStatus: (status) => {
              const duration = Date.now() - startTime
              
              if (status.code === grpc.status.OK) {
                this.logger.info('gRPC request completed', {
                  requestId,
                  method: methodName,
                  duration,
                  status: 'success'
                })
              } else {
                this.logger.error('gRPC request failed', {
                  requestId,
                  method: methodName,
                  duration,
                  status: 'error',
                  code: status.code,
                  message: status.details
                })
              }
              
              listener.onReceiveStatus(status)
            }
          }
          
          next(metadata, wrappedListener)
        }
      })
    }
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

module.exports = GRPCLogger
```

## 测试

### 1. 单元测试

```javascript
// test/user-service.test.js
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const { UserServiceImpl } = require('../server')

describe('UserService', () => {
  let userService
  
  beforeEach(() => {
    userService = new UserServiceImpl()
  })
  
  describe('getUser', () => {
    it('should return user when user exists', (done) => {
      const call = {
        request: { user_id: 1 },
        metadata: new grpc.Metadata()
      }
      
      userService.getUser(call, (error, response) => {
        expect(error).toBeNull()
        expect(response.found).toBe(true)
        expect(response.user).toBeDefined()
        expect(response.user.id).toBe(1)
        done()
      })
    })
    
    it('should return not found when user does not exist', (done) => {
      const call = {
        request: { user_id: 999 },
        metadata: new grpc.Metadata()
      }
      
      userService.getUser(call, (error, response) => {
        expect(error).toBeNull()
        expect(response.found).toBe(false)
        expect(response.user).toBeNull()
        done()
      })
    })
  })
  
  describe('createUser', () => {
    it('should create user with valid data', (done) => {
      const call = {
        request: {
          username: 'test_user',
          email: 'test@example.com',
          password: 'password123',
          full_name: 'Test User'
        },
        metadata: new grpc.Metadata()
      }
      
      userService.createUser(call, (error, response) => {
        expect(error).toBeNull()
        expect(response.success).toBe(true)
        expect(response.user).toBeDefined()
        expect(response.user.username).toBe('test_user')
        expect(response.user.password).toBeUndefined() // 密码不应该返回
        done()
      })
    })
    
    it('should reject duplicate username', (done) => {
      const call = {
        request: {
          username: 'admin', // 已存在的用户名
          email: 'new@example.com',
          password: 'password123'
        },
        metadata: new grpc.Metadata()
      }
      
      userService.createUser(call, (error, response) => {
        expect(error).toBeDefined()
        expect(error.code).toBe(grpc.status.ALREADY_EXISTS)
        done()
      })
    })
  })
})
```

### 2. 集成测试

```javascript
// test/integration.test.js
const grpc = require('@grpc/grpc-js')
const protoLoader = require('@grpc/proto-loader')
const path = require('path')
const { startServer } = require('../server')
const UserServiceClient = require('../client')

describe('gRPC Integration Tests', () => {
  let server
  let client
  
  beforeAll((done) => {
    // 启动测试服务器
    server = startServer()
    
    // 等待服务器启动
    setTimeout(() => {
      client = new UserServiceClient('localhost:50051')
      done()
    }, 1000)
  })
  
  afterAll(() => {
    if (client) {
      client.close()
    }
    if (server) {
      server.forceShutdown()
    }
  })
  
  it('should handle complete user lifecycle', async () => {
    // 创建用户
    const createResponse = await client.createUser({
      username: 'integration_test_user',
      email: 'integration@example.com',
      password: 'password123',
      full_name: 'Integration Test User'
    })
    
    expect(createResponse.success).toBe(true)
    expect(createResponse.user.username).toBe('integration_test_user')
    
    const userId = createResponse.user.id
    
    // 获取用户
    const getResponse = await client.getUser(userId)
    expect(getResponse.found).toBe(true)
    expect(getResponse.user.id).toBe(userId)
    
    // 更新用户
    const updateResponse = await client.updateUser(userId, {
      full_name: 'Updated Integration Test User'
    })
    expect(updateResponse.success).toBe(true)
    expect(updateResponse.user.full_name).toBe('Updated Integration Test User')
    
    // 删除用户
    const deleteResponse = await client.deleteUser(userId, true)
    expect(deleteResponse.success).toBe(true)
  })
  
  it('should handle streaming operations', async () => {
    // 测试服务端流
    const users = await client.listUsers({
      page: 1,
      page_size: 5,
      status: 'USER_STATUS_ACTIVE'
    })
    
    expect(Array.isArray(users)).toBe(true)
    expect(users.length).toBeGreaterThan(0)
    
    // 测试客户端流
    const batchUsers = [
      {
        username: 'batch_test_1',
        email: 'batch1@test.com',
        password: 'password123'
      },
      {
        username: 'batch_test_2',
        email: 'batch2@test.com',
        password: 'password123'
      }
    ]
    
    const batchResponse = await client.batchCreateUsers(batchUsers)
    expect(batchResponse.success_count).toBe(2)
    expect(batchResponse.error_count).toBe(0)
  })
})
```

## 最佳实践

### 1. API 设计原则

```protobuf
// 良好的 API 设计示例
service ProductService {
  // 使用清晰的命名
  rpc GetProduct(GetProductRequest) returns (GetProductResponse);
  rpc ListProducts(ListProductsRequest) returns (stream Product);
  rpc CreateProduct(CreateProductRequest) returns (CreateProductResponse);
  rpc UpdateProduct(UpdateProductRequest) returns (UpdateProductResponse);
  rpc DeleteProduct(DeleteProductRequest) returns (DeleteProductResponse);
  
  // 批量操作
  rpc BatchGetProducts(BatchGetProductsRequest) returns (BatchGetProductsResponse);
  
  // 复杂查询
  rpc SearchProducts(SearchProductsRequest) returns (stream Product);
}

// 使用合适的字段类型
message Product {
  int64 id = 1;                    // 使用 int64 作为 ID
  string name = 2;                 // 必填字段
  optional string description = 3;  // 可选字段
  repeated string tags = 4;        // 重复字段
  map<string, string> metadata = 5; // 键值对
  google.protobuf.Timestamp created_at = 6; // 使用标准时间类型
  ProductStatus status = 7;        // 枚举类型
}

enum ProductStatus {
  PRODUCT_STATUS_UNSPECIFIED = 0; // 始终包含未指定值
  PRODUCT_STATUS_DRAFT = 1;
  PRODUCT_STATUS_PUBLISHED = 2;
  PRODUCT_STATUS_ARCHIVED = 3;
}
```

### 2. 错误处理策略

```javascript
// 统一错误处理
class GRPCErrorHandler {
  static handleError(error, context = {}) {
    const errorMap = {
      'INVALID_ARGUMENT': grpc.status.INVALID_ARGUMENT,
      'NOT_FOUND': grpc.status.NOT_FOUND,
      'ALREADY_EXISTS': grpc.status.ALREADY_EXISTS,
      'PERMISSION_DENIED': grpc.status.PERMISSION_DENIED,
      'UNAUTHENTICATED': grpc.status.UNAUTHENTICATED,
      'RESOURCE_EXHAUSTED': grpc.status.RESOURCE_EXHAUSTED,
      'INTERNAL': grpc.status.INTERNAL
    }
    
    const grpcError = {
      code: errorMap[error.code] || grpc.status.INTERNAL,
      message: error.message || 'Internal server error',
      details: error.details || ''
    }
    
    // 记录错误日志
    console.error('gRPC Error:', {
      ...grpcError,
      context,
      stack: error.stack
    })
    
    return grpcError
  }
  
  static createValidationError(field, message) {
    return {
      code: 'INVALID_ARGUMENT',
      message: `Validation failed for field '${field}': ${message}`,
      details: JSON.stringify({ field, validation_error: message })
    }
  }
}
```

### 3. 性能优化建议

```javascript
// 连接复用和池化
class OptimizedGRPCClient {
  constructor(serviceDefinition, serverAddress) {
    this.client = new serviceDefinition(
      serverAddress,
      grpc.credentials.createInsecure(),
      {
        // 启用 keepalive
        'grpc.keepalive_time_ms': 30000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': true,
        
        // HTTP/2 优化
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
        'grpc.http2.min_ping_interval_without_data_ms': 300000,
        
        // 消息大小限制
        'grpc.max_send_message_length': 4 * 1024 * 1024, // 4MB
        'grpc.max_receive_message_length': 4 * 1024 * 1024, // 4MB
        
        // 连接超时
        'grpc.http2.max_connection_idle_ms': 300000, // 5分钟
        'grpc.http2.max_connection_age_ms': 600000,  // 10分钟
      }
    )
  }
}

// 批量操作优化
class BatchProcessor {
  constructor(client, batchSize = 100) {
    this.client = client
    this.batchSize = batchSize
  }
  
  async processBatch(items, processor) {
    const results = []
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize)
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      )
      results.push(...batchResults)
    }
    
    return results
  }
}
```

### 4. 部署和运维

```yaml
# docker-compose.yml
version: '3.8'
services:
  grpc-server:
    build: .
    ports:
      - "50051:50051"
    environment:
      - NODE_ENV=production
      - GRPC_PORT=50051
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./certs:/app/certs:ro
    healthcheck:
      test: ["CMD", "grpc_health_probe", "-addr=localhost:50051"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    
  grpc-gateway:
    image: grpcweb/grpcwebproxy
    ports:
      - "8080:8080"
    command: >
      --backend_addr=grpc-server:50051
      --run_tls_server=false
      --allow_all_origins
    depends_on:
      - grpc-server
```

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 grpc_health_probe
RUN wget -qO/bin/grpc_health_probe https://github.com/grpc-ecosystem/grpc-health-probe/releases/download/v0.4.11/grpc_health_probe-linux-amd64 && \
    chmod +x /bin/grpc_health_probe

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 50051

USER node

CMD ["node", "server.js"]
```

## 故障排除

### 1. 常见问题和解决方案

```javascript
// 连接问题诊断
class GRPCDiagnostics {
  static async checkConnection(client, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const deadline = new Date(Date.now() + timeout)
      
      client.waitForReady(deadline, (error) => {
        if (error) {
          resolve({
            connected: false,
            error: error.message,
            code: error.code
          })
        } else {
          resolve({
            connected: true,
            message: 'Connection successful'
          })
        }
      })
    })
  }
  
  static analyzeError(error) {
    const errorAnalysis = {
      code: error.code,
      message: error.message,
      suggestions: []
    }
    
    switch (error.code) {
      case grpc.status.UNAVAILABLE:
        errorAnalysis.suggestions.push(
          '检查服务器是否运行',
          '验证网络连接',
          '检查防火墙设置'
        )
        break
        
      case grpc.status.DEADLINE_EXCEEDED:
        errorAnalysis.suggestions.push(
          '增加请求超时时间',
          '检查服务器性能',
          '优化请求处理逻辑'
        )
        break
        
      case grpc.status.UNAUTHENTICATED:
        errorAnalysis.suggestions.push(
          '检查认证令牌',
          '验证令牌是否过期',
          '确认认证配置正确'
        )
        break
        
      case grpc.status.PERMISSION_DENIED:
        errorAnalysis.suggestions.push(
          '检查用户权限',
          '验证角色配置',
          '确认资源访问权限'
        )
        break
        
      default:
        errorAnalysis.suggestions.push(
          '查看服务器日志',
          '检查请求参数',
          '联系技术支持'
        )
    }
    
    return errorAnalysis
  }
}
```

### 2. 调试工具

```javascript
// gRPC 调试工具
class GRPCDebugger {
  static enableVerboseLogging() {
    process.env.GRPC_VERBOSITY = 'DEBUG'
    process.env.GRPC_TRACE = 'all'
  }
  
  static createDebugInterceptor() {
    return (options, nextCall) => {
      console.log('gRPC Call Debug Info:', {
        method: options.method_definition.path,
        type: options.method_definition.type,
        requestStream: options.method_definition.requestStream,
        responseStream: options.method_definition.responseStream
      })
      
      return new grpc.InterceptingCall(nextCall(options), {
        start: (metadata, listener, next) => {
          console.log('Request Metadata:', metadata.getMap())
          
          const wrappedListener = {
            ...listener,
            onReceiveMessage: (message) => {
              console.log('Response Message:', JSON.stringify(message, null, 2))
              listener.onReceiveMessage(message)
            },
            onReceiveStatus: (status) => {
              console.log('Response Status:', {
                code: status.code,
                details: status.details,
                metadata: status.metadata?.getMap()
              })
              listener.onReceiveStatus(status)
            }
          }
          
          next(metadata, wrappedListener)
        },
        sendMessage: (message, next) => {
          console.log('Request Message:', JSON.stringify(message, null, 2))
          next(message)
        }
      })
    }
  }
}
```

## 参考资源

### 官方文档
- [gRPC 官方网站](https://grpc.io/)
- [Protocol Buffers 文档](https://developers.google.com/protocol-buffers)
- [gRPC Node.js 文档](https://grpc.github.io/grpc/node/)

### 工具和插件
- [grpcurl](https://github.com/fullstorydev/grpcurl) - gRPC 命令行工具
- [BloomRPC](https://github.com/bloomrpc/bloomrpc) - gRPC GUI 客户端
- [grpc-gateway](https://github.com/grpc-ecosystem/grpc-gateway) - gRPC 到 REST 网关
- [grpc-web](https://github.com/grpc/grpc-web) - 浏览器 gRPC 支持

### 最佳实践文章
- [gRPC Best Practices](https://grpc.io/docs/guides/best-practices/)
- [Production gRPC](https://grpc.io/docs/guides/production/)
- [gRPC Performance Best Practices](https://grpc.io/docs/guides/performance/)

### 社区资源
- [gRPC GitHub](https://github.com/grpc/grpc)
- [gRPC Community](https://grpc.io/community/)
- [Stack Overflow gRPC 标签](https://stackoverflow.com/questions/tagged/grpc)

---

本指南涵盖了 gRPC API 的设计、实现、优化和部署的各个方面。通过遵循这些最佳实践，你可以构建高性能、可扩展的 gRPC 服务，并有效地解决开发和运维过程中遇到的问题。