# WebSocket API 设计与实现

## 简介

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。它使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。

### 核心特性

- **全双工通信**：客户端和服务器可以同时发送和接收数据
- **低延迟**：建立连接后无需 HTTP 握手开销
- **实时性**：支持实时数据推送
- **持久连接**：连接保持开放状态
- **跨域支持**：支持跨域通信

### 适用场景

- 实时聊天应用
- 在线游戏
- 实时数据监控
- 协作编辑工具
- 股票交易系统
- 直播弹幕
- 实时通知系统

## WebSocket 协议基础

### 1. 连接建立

WebSocket 连接通过 HTTP 升级请求建立：

```http
GET /websocket HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Sec-WebSocket-Protocol: chat, superchat
```

服务器响应：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
Sec-WebSocket-Protocol: chat
```

### 2. 消息格式

WebSocket 支持文本和二进制消息：

```javascript
// 文本消息
const textMessage = JSON.stringify({
  type: 'chat',
  data: {
    user: 'Alice',
    message: 'Hello, World!',
    timestamp: Date.now()
  }
})

// 二进制消息
const binaryMessage = new ArrayBuffer(8)
const view = new DataView(binaryMessage)
view.setUint32(0, 42)
view.setUint32(4, Date.now())
```

### 3. 连接状态

```javascript
// WebSocket 连接状态
const WebSocketState = {
  CONNECTING: 0,  // 连接尚未建立
  OPEN: 1,        // 连接已建立
  CLOSING: 2,     // 连接正在关闭
  CLOSED: 3       // 连接已关闭
}

// 检查连接状态
function checkConnectionState(ws) {
  switch (ws.readyState) {
    case WebSocket.CONNECTING:
      console.log('WebSocket 正在连接...')
      break
    case WebSocket.OPEN:
      console.log('WebSocket 连接已建立')
      break
    case WebSocket.CLOSING:
      console.log('WebSocket 连接正在关闭...')
      break
    case WebSocket.CLOSED:
      console.log('WebSocket 连接已关闭')
      break
  }
}
```

## 服务器端实现

### 1. Node.js + ws 库实现

```javascript
// WebSocket 服务器实现
const WebSocket = require('ws')
const http = require('http')
const url = require('url')
const jwt = require('jsonwebtoken')

class WebSocketServer {
  constructor(options = {}) {
    this.port = options.port || 8080
    this.server = http.createServer()
    this.wss = new WebSocket.Server({ 
      server: this.server,
      verifyClient: this.verifyClient.bind(this)
    })
    
    this.clients = new Map() // 存储客户端连接
    this.rooms = new Map()   // 存储房间信息
    this.messageHandlers = new Map() // 消息处理器
    
    this.setupEventHandlers()
    this.registerMessageHandlers()
  }
  
  // 客户端验证
  verifyClient(info) {
    const query = url.parse(info.req.url, true).query
    const token = query.token
    
    if (!token) {
      console.log('WebSocket connection rejected: No token provided')
      return false
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      info.req.user = decoded
      return true
    } catch (error) {
      console.log('WebSocket connection rejected: Invalid token')
      return false
    }
  }
  
  // 设置事件处理器
  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const user = req.user
      const clientId = this.generateClientId()
      
      // 存储客户端信息
      this.clients.set(clientId, {
        ws,
        user,
        rooms: new Set(),
        lastPing: Date.now()
      })
      
      console.log(`Client ${clientId} connected (User: ${user.username})`)
      
      // 发送欢迎消息
      this.sendToClient(clientId, {
        type: 'welcome',
        data: {
          clientId,
          user: user.username,
          timestamp: Date.now()
        }
      })
      
      // 设置消息处理
      ws.on('message', (data) => {
        this.handleMessage(clientId, data)
      })
      
      // 设置 pong 处理（心跳检测）
      ws.on('pong', () => {
        const client = this.clients.get(clientId)
        if (client) {
          client.lastPing = Date.now()
        }
      })
      
      // 设置连接关闭处理
      ws.on('close', (code, reason) => {
        this.handleDisconnection(clientId, code, reason)
      })
      
      // 设置错误处理
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
        this.handleDisconnection(clientId, 1011, 'Server error')
      })
    })
    
    // 设置心跳检测
    this.startHeartbeat()
  }
  
  // 注册消息处理器
  registerMessageHandlers() {
    this.messageHandlers.set('ping', this.handlePing.bind(this))
    this.messageHandlers.set('join_room', this.handleJoinRoom.bind(this))
    this.messageHandlers.set('leave_room', this.handleLeaveRoom.bind(this))
    this.messageHandlers.set('chat_message', this.handleChatMessage.bind(this))
    this.messageHandlers.set('private_message', this.handlePrivateMessage.bind(this))
    this.messageHandlers.set('typing_start', this.handleTypingStart.bind(this))
    this.messageHandlers.set('typing_stop', this.handleTypingStop.bind(this))
    this.messageHandlers.set('get_online_users', this.handleGetOnlineUsers.bind(this))
  }
  
  // 处理消息
  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data)
      const handler = this.messageHandlers.get(message.type)
      
      if (handler) {
        handler(clientId, message.data)
      } else {
        console.warn(`Unknown message type: ${message.type}`)
        this.sendError(clientId, 'UNKNOWN_MESSAGE_TYPE', 'Unknown message type')
      }
    } catch (error) {
      console.error('Error parsing message:', error)
      this.sendError(clientId, 'INVALID_MESSAGE_FORMAT', 'Invalid message format')
    }
  }
  
  // Ping 处理
  handlePing(clientId, data) {
    this.sendToClient(clientId, {
      type: 'pong',
      data: {
        timestamp: Date.now(),
        clientTimestamp: data.timestamp
      }
    })
  }
  
  // 加入房间
  handleJoinRoom(clientId, data) {
    const { roomId } = data
    const client = this.clients.get(clientId)
    
    if (!client) return
    
    // 创建房间（如果不存在）
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        clients: new Set(),
        createdAt: Date.now()
      })
    }
    
    const room = this.rooms.get(roomId)
    
    // 将客户端添加到房间
    room.clients.add(clientId)
    client.rooms.add(roomId)
    
    // 通知房间内其他用户
    this.broadcastToRoom(roomId, {
      type: 'user_joined',
      data: {
        user: client.user.username,
        roomId,
        timestamp: Date.now()
      }
    }, clientId)
    
    // 向客户端确认加入成功
    this.sendToClient(clientId, {
      type: 'room_joined',
      data: {
        roomId,
        userCount: room.clients.size,
        timestamp: Date.now()
      }
    })
    
    console.log(`Client ${clientId} joined room ${roomId}`)
  }
  
  // 离开房间
  handleLeaveRoom(clientId, data) {
    const { roomId } = data
    const client = this.clients.get(clientId)
    
    if (!client) return
    
    this.removeClientFromRoom(clientId, roomId)
  }
  
  // 聊天消息
  handleChatMessage(clientId, data) {
    const { roomId, message } = data
    const client = this.clients.get(clientId)
    
    if (!client || !client.rooms.has(roomId)) {
      this.sendError(clientId, 'NOT_IN_ROOM', 'You are not in this room')
      return
    }
    
    // 消息验证
    if (!message || message.trim().length === 0) {
      this.sendError(clientId, 'EMPTY_MESSAGE', 'Message cannot be empty')
      return
    }
    
    if (message.length > 1000) {
      this.sendError(clientId, 'MESSAGE_TOO_LONG', 'Message too long')
      return
    }
    
    // 广播消息到房间
    this.broadcastToRoom(roomId, {
      type: 'chat_message',
      data: {
        id: this.generateMessageId(),
        user: client.user.username,
        message: message.trim(),
        roomId,
        timestamp: Date.now()
      }
    })
  }
  
  // 私聊消息
  handlePrivateMessage(clientId, data) {
    const { targetUser, message } = data
    const client = this.clients.get(clientId)
    
    if (!client) return
    
    // 查找目标用户
    const targetClientId = this.findClientByUsername(targetUser)
    if (!targetClientId) {
      this.sendError(clientId, 'USER_NOT_FOUND', 'Target user not found')
      return
    }
    
    // 发送私聊消息
    const messageData = {
      type: 'private_message',
      data: {
        id: this.generateMessageId(),
        from: client.user.username,
        message: message.trim(),
        timestamp: Date.now()
      }
    }
    
    this.sendToClient(targetClientId, messageData)
    
    // 向发送者确认
    this.sendToClient(clientId, {
      type: 'private_message_sent',
      data: {
        to: targetUser,
        message: message.trim(),
        timestamp: Date.now()
      }
    })
  }
  
  // 开始输入
  handleTypingStart(clientId, data) {
    const { roomId } = data
    const client = this.clients.get(clientId)
    
    if (!client || !client.rooms.has(roomId)) return
    
    this.broadcastToRoom(roomId, {
      type: 'typing_start',
      data: {
        user: client.user.username,
        roomId,
        timestamp: Date.now()
      }
    }, clientId)
  }
  
  // 停止输入
  handleTypingStop(clientId, data) {
    const { roomId } = data
    const client = this.clients.get(clientId)
    
    if (!client || !client.rooms.has(roomId)) return
    
    this.broadcastToRoom(roomId, {
      type: 'typing_stop',
      data: {
        user: client.user.username,
        roomId,
        timestamp: Date.now()
      }
    }, clientId)
  }
  
  // 获取在线用户
  handleGetOnlineUsers(clientId, data) {
    const { roomId } = data
    const room = this.rooms.get(roomId)
    
    if (!room) {
      this.sendError(clientId, 'ROOM_NOT_FOUND', 'Room not found')
      return
    }
    
    const onlineUsers = Array.from(room.clients)
      .map(id => this.clients.get(id))
      .filter(client => client)
      .map(client => ({
        username: client.user.username,
        joinedAt: client.user.joinedAt
      }))
    
    this.sendToClient(clientId, {
      type: 'online_users',
      data: {
        roomId,
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: Date.now()
      }
    })
  }
  
  // 发送消息给特定客户端
  sendToClient(clientId, message) {
    const client = this.clients.get(clientId)
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message))
    }
  }
  
  // 广播消息到房间
  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId)
    if (!room) return
    
    room.clients.forEach(clientId => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }
  
  // 广播消息给所有客户端
  broadcast(message, excludeClientId = null) {
    this.clients.forEach((client, clientId) => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message)
      }
    })
  }
  
  // 发送错误消息
  sendError(clientId, code, message) {
    this.sendToClient(clientId, {
      type: 'error',
      data: {
        code,
        message,
        timestamp: Date.now()
      }
    })
  }
  
  // 处理客户端断开连接
  handleDisconnection(clientId, code, reason) {
    const client = this.clients.get(clientId)
    if (!client) return
    
    console.log(`Client ${clientId} disconnected (Code: ${code}, Reason: ${reason})`)
    
    // 从所有房间中移除客户端
    client.rooms.forEach(roomId => {
      this.removeClientFromRoom(clientId, roomId)
    })
    
    // 移除客户端
    this.clients.delete(clientId)
  }
  
  // 从房间中移除客户端
  removeClientFromRoom(clientId, roomId) {
    const client = this.clients.get(clientId)
    const room = this.rooms.get(roomId)
    
    if (!client || !room) return
    
    // 从房间中移除客户端
    room.clients.delete(clientId)
    client.rooms.delete(roomId)
    
    // 通知房间内其他用户
    this.broadcastToRoom(roomId, {
      type: 'user_left',
      data: {
        user: client.user.username,
        roomId,
        timestamp: Date.now()
      }
    })
    
    // 如果房间为空，删除房间
    if (room.clients.size === 0) {
      this.rooms.delete(roomId)
      console.log(`Room ${roomId} deleted (empty)`)
    }
    
    console.log(`Client ${clientId} left room ${roomId}`)
  }
  
  // 心跳检测
  startHeartbeat() {
    setInterval(() => {
      const now = Date.now()
      const timeout = 30000 // 30 秒超时
      
      this.clients.forEach((client, clientId) => {
        if (client.ws.readyState === WebSocket.OPEN) {
          // 检查是否超时
          if (now - client.lastPing > timeout) {
            console.log(`Client ${clientId} timed out`)
            client.ws.terminate()
            return
          }
          
          // 发送 ping
          client.ws.ping()
        } else {
          // 清理已关闭的连接
          this.handleDisconnection(clientId, 1006, 'Connection lost')
        }
      })
    }, 15000) // 每 15 秒检查一次
  }
  
  // 工具方法
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  findClientByUsername(username) {
    for (const [clientId, client] of this.clients) {
      if (client.user.username === username) {
        return clientId
      }
    }
    return null
  }
  
  // 获取服务器统计信息
  getStats() {
    return {
      connectedClients: this.clients.size,
      activeRooms: this.rooms.size,
      totalMessages: this.messageCount || 0,
      uptime: process.uptime()
    }
  }
  
  // 启动服务器
  start() {
    this.server.listen(this.port, () => {
      console.log(`WebSocket server listening on port ${this.port}`)
    })
  }
  
  // 停止服务器
  stop() {
    // 关闭所有客户端连接
    this.clients.forEach((client, clientId) => {
      client.ws.close(1001, 'Server shutting down')
    })
    
    // 关闭服务器
    this.wss.close(() => {
      this.server.close(() => {
        console.log('WebSocket server stopped')
      })
    })
  }
}

// 使用示例
const wsServer = new WebSocketServer({ port: 8080 })
wsServer.start()

// 优雅关闭
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully')
  wsServer.stop()
  process.exit(0)
})

module.exports = WebSocketServer
```

### 2. Socket.IO 实现

```javascript
// Socket.IO 服务器实现
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const jwt = require('jsonwebtoken')

class SocketIOServer {
  constructor(options = {}) {
    this.app = express()
    this.server = http.createServer(this.app)
    this.io = socketIo(this.server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    })
    
    this.port = options.port || 8080
    this.connectedUsers = new Map()
    this.rooms = new Map()
    
    this.setupMiddleware()
    this.setupEventHandlers()
  }
  
  // 设置中间件
  setupMiddleware() {
    // 认证中间件
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        socket.user = decoded
        next()
      } catch (error) {
        next(new Error('Authentication error: Invalid token'))
      }
    })
    
    // 速率限制中间件
    this.io.use((socket, next) => {
      socket.messageCount = 0
      socket.lastMessageTime = 0
      next()
    })
  }
  
  // 设置事件处理器
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.username} connected (${socket.id})`)
      
      // 存储用户信息
      this.connectedUsers.set(socket.id, {
        socket,
        user: socket.user,
        rooms: new Set(),
        connectedAt: Date.now()
      })
      
      // 发送欢迎消息
      socket.emit('welcome', {
        message: 'Connected to server',
        user: socket.user.username,
        timestamp: Date.now()
      })
      
      // 注册事件处理器
      this.registerSocketEvents(socket)
      
      // 处理断开连接
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason)
      })
    })
  }
  
  // 注册 Socket 事件
  registerSocketEvents(socket) {
    // 加入房间
    socket.on('join_room', (data) => {
      this.handleJoinRoom(socket, data)
    })
    
    // 离开房间
    socket.on('leave_room', (data) => {
      this.handleLeaveRoom(socket, data)
    })
    
    // 聊天消息
    socket.on('chat_message', (data) => {
      if (this.checkRateLimit(socket)) {
        this.handleChatMessage(socket, data)
      }
    })
    
    // 私聊消息
    socket.on('private_message', (data) => {
      this.handlePrivateMessage(socket, data)
    })
    
    // 输入状态
    socket.on('typing_start', (data) => {
      this.handleTypingStart(socket, data)
    })
    
    socket.on('typing_stop', (data) => {
      this.handleTypingStop(socket, data)
    })
    
    // 获取房间信息
    socket.on('get_room_info', (data) => {
      this.handleGetRoomInfo(socket, data)
    })
    
    // 获取在线用户
    socket.on('get_online_users', () => {
      this.handleGetOnlineUsers(socket)
    })
    
    // 文件共享
    socket.on('file_share', (data) => {
      this.handleFileShare(socket, data)
    })
    
    // 视频通话信号
    socket.on('video_call_offer', (data) => {
      this.handleVideoCallOffer(socket, data)
    })
    
    socket.on('video_call_answer', (data) => {
      this.handleVideoCallAnswer(socket, data)
    })
    
    socket.on('ice_candidate', (data) => {
      this.handleIceCandidate(socket, data)
    })
  }
  
  // 速率限制检查
  checkRateLimit(socket) {
    const now = Date.now()
    const timeDiff = now - socket.lastMessageTime
    
    // 重置计数器（每分钟）
    if (timeDiff > 60000) {
      socket.messageCount = 0
    }
    
    socket.lastMessageTime = now
    socket.messageCount++
    
    // 限制每分钟最多 60 条消息
    if (socket.messageCount > 60) {
      socket.emit('error', {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many messages, please slow down'
      })
      return false
    }
    
    return true
  }
  
  // 加入房间处理
  handleJoinRoom(socket, data) {
    const { roomId, password } = data
    
    // 验证房间密码（如果需要）
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId)
      if (room.password && room.password !== password) {
        socket.emit('error', {
          code: 'INVALID_PASSWORD',
          message: 'Invalid room password'
        })
        return
      }
    } else {
      // 创建新房间
      this.rooms.set(roomId, {
        id: roomId,
        password,
        createdAt: Date.now(),
        createdBy: socket.user.username
      })
    }
    
    // 加入 Socket.IO 房间
    socket.join(roomId)
    
    // 更新用户房间信息
    const user = this.connectedUsers.get(socket.id)
    if (user) {
      user.rooms.add(roomId)
    }
    
    // 通知房间内其他用户
    socket.to(roomId).emit('user_joined', {
      user: socket.user.username,
      roomId,
      timestamp: Date.now()
    })
    
    // 向客户端确认加入成功
    socket.emit('room_joined', {
      roomId,
      userCount: this.io.sockets.adapter.rooms.get(roomId)?.size || 0,
      timestamp: Date.now()
    })
    
    console.log(`User ${socket.user.username} joined room ${roomId}`)
  }
  
  // 离开房间处理
  handleLeaveRoom(socket, data) {
    const { roomId } = data
    
    socket.leave(roomId)
    
    // 更新用户房间信息
    const user = this.connectedUsers.get(socket.id)
    if (user) {
      user.rooms.delete(roomId)
    }
    
    // 通知房间内其他用户
    socket.to(roomId).emit('user_left', {
      user: socket.user.username,
      roomId,
      timestamp: Date.now()
    })
    
    // 如果房间为空，删除房间
    const roomSize = this.io.sockets.adapter.rooms.get(roomId)?.size || 0
    if (roomSize === 0) {
      this.rooms.delete(roomId)
    }
    
    console.log(`User ${socket.user.username} left room ${roomId}`)
  }
  
  // 聊天消息处理
  handleChatMessage(socket, data) {
    const { roomId, message, messageType = 'text' } = data
    
    // 验证消息
    if (!message || message.trim().length === 0) {
      socket.emit('error', {
        code: 'EMPTY_MESSAGE',
        message: 'Message cannot be empty'
      })
      return
    }
    
    if (message.length > 1000) {
      socket.emit('error', {
        code: 'MESSAGE_TOO_LONG',
        message: 'Message too long'
      })
      return
    }
    
    // 检查用户是否在房间中
    if (!socket.rooms.has(roomId)) {
      socket.emit('error', {
        code: 'NOT_IN_ROOM',
        message: 'You are not in this room'
      })
      return
    }
    
    // 广播消息到房间
    const messageData = {
      id: this.generateMessageId(),
      user: socket.user.username,
      message: message.trim(),
      messageType,
      roomId,
      timestamp: Date.now()
    }
    
    this.io.to(roomId).emit('chat_message', messageData)
    
    // 记录消息（可选）
    this.logMessage(messageData)
  }
  
  // 私聊消息处理
  handlePrivateMessage(socket, data) {
    const { targetUser, message } = data
    
    // 查找目标用户
    const targetSocket = this.findSocketByUsername(targetUser)
    if (!targetSocket) {
      socket.emit('error', {
        code: 'USER_NOT_FOUND',
        message: 'Target user not found or offline'
      })
      return
    }
    
    // 发送私聊消息
    const messageData = {
      id: this.generateMessageId(),
      from: socket.user.username,
      message: message.trim(),
      timestamp: Date.now()
    }
    
    targetSocket.emit('private_message', messageData)
    
    // 向发送者确认
    socket.emit('private_message_sent', {
      to: targetUser,
      message: message.trim(),
      timestamp: Date.now()
    })
  }
  
  // 输入状态处理
  handleTypingStart(socket, data) {
    const { roomId } = data
    socket.to(roomId).emit('typing_start', {
      user: socket.user.username,
      roomId,
      timestamp: Date.now()
    })
  }
  
  handleTypingStop(socket, data) {
    const { roomId } = data
    socket.to(roomId).emit('typing_stop', {
      user: socket.user.username,
      roomId,
      timestamp: Date.now()
    })
  }
  
  // 获取房间信息
  handleGetRoomInfo(socket, data) {
    const { roomId } = data
    const room = this.rooms.get(roomId)
    const roomSockets = this.io.sockets.adapter.rooms.get(roomId)
    
    if (!room || !roomSockets) {
      socket.emit('error', {
        code: 'ROOM_NOT_FOUND',
        message: 'Room not found'
      })
      return
    }
    
    const users = Array.from(roomSockets)
      .map(socketId => this.connectedUsers.get(socketId))
      .filter(user => user)
      .map(user => ({
        username: user.user.username,
        connectedAt: user.connectedAt
      }))
    
    socket.emit('room_info', {
      roomId,
      userCount: users.length,
      users,
      createdAt: room.createdAt,
      createdBy: room.createdBy
    })
  }
  
  // 获取在线用户
  handleGetOnlineUsers(socket) {
    const onlineUsers = Array.from(this.connectedUsers.values())
      .map(user => ({
        username: user.user.username,
        connectedAt: user.connectedAt,
        rooms: Array.from(user.rooms)
      }))
    
    socket.emit('online_users', {
      users: onlineUsers,
      count: onlineUsers.length,
      timestamp: Date.now()
    })
  }
  
  // 文件共享处理
  handleFileShare(socket, data) {
    const { roomId, fileName, fileSize, fileType, fileData } = data
    
    // 验证文件大小（限制 10MB）
    if (fileSize > 10 * 1024 * 1024) {
      socket.emit('error', {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10MB limit'
      })
      return
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
    if (!allowedTypes.includes(fileType)) {
      socket.emit('error', {
        code: 'INVALID_FILE_TYPE',
        message: 'File type not allowed'
      })
      return
    }
    
    // 广播文件到房间
    socket.to(roomId).emit('file_shared', {
      id: this.generateMessageId(),
      user: socket.user.username,
      fileName,
      fileSize,
      fileType,
      fileData,
      roomId,
      timestamp: Date.now()
    })
  }
  
  // 视频通话信号处理
  handleVideoCallOffer(socket, data) {
    const { targetUser, offer } = data
    const targetSocket = this.findSocketByUsername(targetUser)
    
    if (targetSocket) {
      targetSocket.emit('video_call_offer', {
        from: socket.user.username,
        offer,
        timestamp: Date.now()
      })
    }
  }
  
  handleVideoCallAnswer(socket, data) {
    const { targetUser, answer } = data
    const targetSocket = this.findSocketByUsername(targetUser)
    
    if (targetSocket) {
      targetSocket.emit('video_call_answer', {
        from: socket.user.username,
        answer,
        timestamp: Date.now()
      })
    }
  }
  
  handleIceCandidate(socket, data) {
    const { targetUser, candidate } = data
    const targetSocket = this.findSocketByUsername(targetUser)
    
    if (targetSocket) {
      targetSocket.emit('ice_candidate', {
        from: socket.user.username,
        candidate,
        timestamp: Date.now()
      })
    }
  }
  
  // 处理断开连接
  handleDisconnection(socket, reason) {
    console.log(`User ${socket.user.username} disconnected (${reason})`)
    
    const user = this.connectedUsers.get(socket.id)
    if (user) {
      // 通知所有房间用户离线
      user.rooms.forEach(roomId => {
        socket.to(roomId).emit('user_left', {
          user: socket.user.username,
          roomId,
          timestamp: Date.now()
        })
      })
    }
    
    // 移除用户
    this.connectedUsers.delete(socket.id)
  }
  
  // 工具方法
  findSocketByUsername(username) {
    for (const user of this.connectedUsers.values()) {
      if (user.user.username === username) {
        return user.socket
      }
    }
    return null
  }
  
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  logMessage(messageData) {
    // 这里可以实现消息持久化
    console.log('Message logged:', messageData)
  }
  
  // 获取服务器统计信息
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeRooms: this.rooms.size,
      totalConnections: this.io.engine.clientsCount,
      uptime: process.uptime()
    }
  }
  
  // 启动服务器
  start() {
    this.server.listen(this.port, () => {
      console.log(`Socket.IO server listening on port ${this.port}`)
    })
  }
}

// 使用示例
const socketServer = new SocketIOServer({ port: 8080 })
socketServer.start()

module.exports = SocketIOServer
```