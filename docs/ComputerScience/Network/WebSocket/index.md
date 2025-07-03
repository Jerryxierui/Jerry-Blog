# WebSocket 协议

WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议。它使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。

## 简介

### 核心概念

- **全双工通信**：客户端和服务器可以同时发送和接收数据
- **持久连接**：连接建立后保持开放状态
- **低延迟**：避免了 HTTP 的请求-响应开销
- **协议升级**：从 HTTP 协议升级而来
- **帧格式**：数据以帧的形式传输

### WebSocket vs HTTP

| 特性 | HTTP | WebSocket |
|------|------|----------|
| 连接类型 | 请求-响应 | 持久连接 |
| 通信方向 | 单向 | 双向 |
| 开销 | 每次请求都有头部 | 握手后开销很小 |
| 实时性 | 需要轮询 | 真正实时 |
| 服务器推送 | 不支持 | 原生支持 |

## WebSocket 协议详解

### 1. 握手过程

```javascript
// WebSocket 握手过程模拟
class WebSocketHandshake {
  constructor() {
    this.WEBSOCKET_MAGIC_STRING = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
  }

  // 客户端握手请求
  createClientHandshake(url, protocols = []) {
    const key = this.generateWebSocketKey();
    const urlObj = new URL(url);
    
    const request = [
      `GET ${urlObj.pathname}${urlObj.search} HTTP/1.1`,
      `Host: ${urlObj.host}`,
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Key: ${key}`,
      'Sec-WebSocket-Version: 13'
    ];
    
    if (protocols.length > 0) {
      request.push(`Sec-WebSocket-Protocol: ${protocols.join(', ')}`);
    }
    
    request.push('', ''); // 空行结束
    
    return {
      request: request.join('\r\n'),
      key
    };
  }

  // 服务器握手响应
  createServerHandshake(clientKey, protocol = null) {
    const acceptKey = this.generateAcceptKey(clientKey);
    
    const response = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`
    ];
    
    if (protocol) {
      response.push(`Sec-WebSocket-Protocol: ${protocol}`);
    }
    
    response.push('', ''); // 空行结束
    
    return response.join('\r\n');
  }

  // 生成 WebSocket Key
  generateWebSocketKey() {
    const bytes = new Uint8Array(16);
    for (let i = 0; i < 16; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return btoa(String.fromCharCode(...bytes));
  }

  // 生成 Accept Key
  generateAcceptKey(clientKey) {
    const crypto = require('crypto');
    const concatenated = clientKey + this.WEBSOCKET_MAGIC_STRING;
    return crypto.createHash('sha1').update(concatenated).digest('base64');
  }

  // 验证握手
  validateHandshake(clientKey, serverAcceptKey) {
    const expectedAcceptKey = this.generateAcceptKey(clientKey);
    return expectedAcceptKey === serverAcceptKey;
  }
}

// 使用示例
const handshake = new WebSocketHandshake();
const { request, key } = handshake.createClientHandshake('ws://localhost:8080/chat');
console.log('客户端握手请求:');
console.log(request);

const response = handshake.createServerHandshake(key);
console.log('\n服务器握手响应:');
console.log(response);
```

### 2. 帧格式解析

```javascript
// WebSocket 帧格式处理
class WebSocketFrame {
  constructor() {
    this.OPCODES = {
      CONTINUATION: 0x0,
      TEXT: 0x1,
      BINARY: 0x2,
      CLOSE: 0x8,
      PING: 0x9,
      PONG: 0xa
    };
  }

  // 创建帧
  createFrame(opcode, payload, masked = false) {
    const payloadBuffer = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
    const payloadLength = payloadBuffer.length;
    
    let frame = Buffer.alloc(2); // 最小帧头
    let offset = 0;
    
    // 第一个字节：FIN(1) + RSV(3) + OPCODE(4)
    frame[offset++] = 0x80 | opcode; // FIN=1, RSV=000
    
    // 第二个字节：MASK(1) + Payload Length(7)
    if (payloadLength < 126) {
      frame[offset++] = (masked ? 0x80 : 0x00) | payloadLength;
    } else if (payloadLength < 65536) {
      frame[offset++] = (masked ? 0x80 : 0x00) | 126;
      frame = Buffer.concat([frame, Buffer.allocUnsafe(2)]);
      frame.writeUInt16BE(payloadLength, offset);
      offset += 2;
    } else {
      frame[offset++] = (masked ? 0x80 : 0x00) | 127;
      frame = Buffer.concat([frame, Buffer.allocUnsafe(8)]);
      frame.writeUInt32BE(0, offset); // 高32位
      frame.writeUInt32BE(payloadLength, offset + 4); // 低32位
      offset += 8;
    }
    
    // 掩码
    let maskingKey;
    if (masked) {
      maskingKey = Buffer.allocUnsafe(4);
      for (let i = 0; i < 4; i++) {
        maskingKey[i] = Math.floor(Math.random() * 256);
      }
      frame = Buffer.concat([frame, maskingKey]);
      offset += 4;
    }
    
    // 载荷数据
    if (payloadLength > 0) {
      let maskedPayload = payloadBuffer;
      if (masked) {
        maskedPayload = Buffer.alloc(payloadLength);
        for (let i = 0; i < payloadLength; i++) {
          maskedPayload[i] = payloadBuffer[i] ^ maskingKey[i % 4];
        }
      }
      frame = Buffer.concat([frame, maskedPayload]);
    }
    
    return frame;
  }

  // 解析帧
  parseFrame(buffer) {
    if (buffer.length < 2) {
      throw new Error('Frame too short');
    }
    
    let offset = 0;
    
    // 第一个字节
    const firstByte = buffer[offset++];
    const fin = (firstByte & 0x80) === 0x80;
    const rsv1 = (firstByte & 0x40) === 0x40;
    const rsv2 = (firstByte & 0x20) === 0x20;
    const rsv3 = (firstByte & 0x10) === 0x10;
    const opcode = firstByte & 0x0f;
    
    // 第二个字节
    const secondByte = buffer[offset++];
    const masked = (secondByte & 0x80) === 0x80;
    let payloadLength = secondByte & 0x7f;
    
    // 扩展载荷长度
    if (payloadLength === 126) {
      if (buffer.length < offset + 2) {
        throw new Error('Frame too short for extended payload length');
      }
      payloadLength = buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (buffer.length < offset + 8) {
        throw new Error('Frame too short for extended payload length');
      }
      const high = buffer.readUInt32BE(offset);
      const low = buffer.readUInt32BE(offset + 4);
      payloadLength = high * 0x100000000 + low;
      offset += 8;
    }
    
    // 掩码密钥
    let maskingKey;
    if (masked) {
      if (buffer.length < offset + 4) {
        throw new Error('Frame too short for masking key');
      }
      maskingKey = buffer.slice(offset, offset + 4);
      offset += 4;
    }
    
    // 载荷数据
    if (buffer.length < offset + payloadLength) {
      throw new Error('Frame too short for payload');
    }
    
    let payload = buffer.slice(offset, offset + payloadLength);
    
    // 解掩码
    if (masked && maskingKey) {
      for (let i = 0; i < payload.length; i++) {
        payload[i] ^= maskingKey[i % 4];
      }
    }
    
    return {
      fin,
      rsv1,
      rsv2,
      rsv3,
      opcode,
      masked,
      payloadLength,
      payload,
      frameLength: offset + payloadLength
    };
  }

  // 创建文本帧
  createTextFrame(text, masked = false) {
    return this.createFrame(this.OPCODES.TEXT, text, masked);
  }

  // 创建二进制帧
  createBinaryFrame(data, masked = false) {
    return this.createFrame(this.OPCODES.BINARY, data, masked);
  }

  // 创建关闭帧
  createCloseFrame(code = 1000, reason = '', masked = false) {
    const reasonBuffer = Buffer.from(reason, 'utf8');
    const payload = Buffer.alloc(2 + reasonBuffer.length);
    payload.writeUInt16BE(code, 0);
    reasonBuffer.copy(payload, 2);
    return this.createFrame(this.OPCODES.CLOSE, payload, masked);
  }

  // 创建 Ping 帧
  createPingFrame(data = Buffer.alloc(0), masked = false) {
    return this.createFrame(this.OPCODES.PING, data, masked);
  }

  // 创建 Pong 帧
  createPongFrame(data = Buffer.alloc(0), masked = false) {
    return this.createFrame(this.OPCODES.PONG, data, masked);
  }
}
```

### 3. WebSocket 客户端实现

```javascript
// WebSocket 客户端实现
class WebSocketClient extends EventTarget {
  constructor(url, protocols = []) {
    super();
    this.url = url;
    this.protocols = protocols;
    this.readyState = WebSocketClient.CONNECTING;
    this.socket = null;
    this.frameParser = new WebSocketFrame();
    this.buffer = Buffer.alloc(0);
    this.pingInterval = null;
    this.pongTimeout = null;
  }

  static get CONNECTING() { return 0; }
  static get OPEN() { return 1; }
  static get CLOSING() { return 2; }
  static get CLOSED() { return 3; }

  // 连接到服务器
  connect() {
    const net = require('net');
    const url = new URL(this.url);
    const port = url.port || (url.protocol === 'wss:' ? 443 : 80);
    
    this.socket = net.createConnection(port, url.hostname);
    
    this.socket.on('connect', () => {
      this.performHandshake();
    });
    
    this.socket.on('data', (data) => {
      this.handleData(data);
    });
    
    this.socket.on('close', () => {
      this.readyState = WebSocketClient.CLOSED;
      this.dispatchEvent(new CustomEvent('close'));
      this.cleanup();
    });
    
    this.socket.on('error', (error) => {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    });
  }

  // 执行握手
  performHandshake() {
    const handshake = new WebSocketHandshake();
    const { request, key } = handshake.createClientHandshake(this.url, this.protocols);
    
    this.expectedAcceptKey = handshake.generateAcceptKey(key);
    this.socket.write(request);
  }

  // 处理接收到的数据
  handleData(data) {
    if (this.readyState === WebSocketClient.CONNECTING) {
      this.handleHandshakeResponse(data);
    } else {
      this.handleFrameData(data);
    }
  }

  // 处理握手响应
  handleHandshakeResponse(data) {
    const response = data.toString();
    const lines = response.split('\r\n');
    
    if (lines[0] !== 'HTTP/1.1 101 Switching Protocols') {
      this.dispatchEvent(new CustomEvent('error', { 
        detail: new Error('Invalid handshake response') 
      }));
      return;
    }
    
    // 验证 Sec-WebSocket-Accept
    const acceptHeader = lines.find(line => 
      line.toLowerCase().startsWith('sec-websocket-accept:')
    );
    
    if (acceptHeader) {
      const acceptKey = acceptHeader.split(':')[1].trim();
      if (acceptKey === this.expectedAcceptKey) {
        this.readyState = WebSocketClient.OPEN;
        this.dispatchEvent(new CustomEvent('open'));
        this.startPingPong();
      } else {
        this.dispatchEvent(new CustomEvent('error', { 
          detail: new Error('Invalid accept key') 
        }));
      }
    }
  }

  // 处理帧数据
  handleFrameData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    
    while (this.buffer.length >= 2) {
      try {
        const frame = this.frameParser.parseFrame(this.buffer);
        this.buffer = this.buffer.slice(frame.frameLength);
        this.handleFrame(frame);
      } catch (error) {
        if (error.message.includes('too short')) {
          break; // 等待更多数据
        }
        this.dispatchEvent(new CustomEvent('error', { detail: error }));
        break;
      }
    }
  }

  // 处理帧
  handleFrame(frame) {
    switch (frame.opcode) {
      case this.frameParser.OPCODES.TEXT:
        const text = frame.payload.toString('utf8');
        this.dispatchEvent(new CustomEvent('message', { 
          detail: { data: text, type: 'text' } 
        }));
        break;
        
      case this.frameParser.OPCODES.BINARY:
        this.dispatchEvent(new CustomEvent('message', { 
          detail: { data: frame.payload, type: 'binary' } 
        }));
        break;
        
      case this.frameParser.OPCODES.CLOSE:
        let code = 1000;
        let reason = '';
        if (frame.payload.length >= 2) {
          code = frame.payload.readUInt16BE(0);
          reason = frame.payload.slice(2).toString('utf8');
        }
        this.close(code, reason);
        break;
        
      case this.frameParser.OPCODES.PING:
        this.pong(frame.payload);
        break;
        
      case this.frameParser.OPCODES.PONG:
        this.handlePong(frame.payload);
        break;
    }
  }

  // 发送数据
  send(data) {
    if (this.readyState !== WebSocketClient.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    let frame;
    if (typeof data === 'string') {
      frame = this.frameParser.createTextFrame(data, true);
    } else {
      frame = this.frameParser.createBinaryFrame(data, true);
    }
    
    this.socket.write(frame);
  }

  // 发送 Ping
  ping(data = Buffer.alloc(0)) {
    if (this.readyState === WebSocketClient.OPEN) {
      const frame = this.frameParser.createPingFrame(data, true);
      this.socket.write(frame);
    }
  }

  // 发送 Pong
  pong(data = Buffer.alloc(0)) {
    if (this.readyState === WebSocketClient.OPEN) {
      const frame = this.frameParser.createPongFrame(data, true);
      this.socket.write(frame);
    }
  }

  // 处理 Pong
  handlePong(data) {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }

  // 开始心跳
  startPingPong() {
    this.pingInterval = setInterval(() => {
      if (this.readyState === WebSocketClient.OPEN) {
        this.ping();
        this.pongTimeout = setTimeout(() => {
          this.close(1002, 'Pong timeout');
        }, 5000);
      }
    }, 30000);
  }

  // 关闭连接
  close(code = 1000, reason = '') {
    if (this.readyState === WebSocketClient.OPEN) {
      this.readyState = WebSocketClient.CLOSING;
      const frame = this.frameParser.createCloseFrame(code, reason, true);
      this.socket.write(frame);
    }
    
    setTimeout(() => {
      if (this.socket) {
        this.socket.destroy();
      }
    }, 1000);
  }

  // 清理资源
  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }
}
```

### 4. WebSocket 服务器实现

```javascript
// WebSocket 服务器实现
class WebSocketServer extends EventTarget {
  constructor(options = {}) {
    super();
    this.port = options.port || 8080;
    this.host = options.host || 'localhost';
    this.server = null;
    this.clients = new Set();
    this.frameParser = new WebSocketFrame();
  }

  // 启动服务器
  listen(callback) {
    const http = require('http');
    
    this.server = http.createServer();
    
    this.server.on('upgrade', (request, socket, head) => {
      this.handleUpgrade(request, socket, head);
    });
    
    this.server.listen(this.port, this.host, callback);
  }

  // 处理协议升级
  handleUpgrade(request, socket, head) {
    const key = request.headers['sec-websocket-key'];
    const version = request.headers['sec-websocket-version'];
    const protocol = request.headers['sec-websocket-protocol'];
    
    if (!key || version !== '13') {
      socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
      socket.destroy();
      return;
    }
    
    const handshake = new WebSocketHandshake();
    const response = handshake.createServerHandshake(key, protocol);
    
    socket.write(response);
    
    const client = new WebSocketConnection(socket, this);
    this.clients.add(client);
    
    this.dispatchEvent(new CustomEvent('connection', { detail: client }));
  }

  // 广播消息
  broadcast(data, exclude = null) {
    for (const client of this.clients) {
      if (client !== exclude && client.readyState === WebSocketConnection.OPEN) {
        client.send(data);
      }
    }
  }

  // 移除客户端
  removeClient(client) {
    this.clients.delete(client);
  }

  // 关闭服务器
  close() {
    for (const client of this.clients) {
      client.close();
    }
    
    if (this.server) {
      this.server.close();
    }
  }
}

// WebSocket 连接类
class WebSocketConnection extends EventTarget {
  constructor(socket, server) {
    super();
    this.socket = socket;
    this.server = server;
    this.readyState = WebSocketConnection.OPEN;
    this.frameParser = new WebSocketFrame();
    this.buffer = Buffer.alloc(0);
    
    this.setupEventHandlers();
  }

  static get CONNECTING() { return 0; }
  static get OPEN() { return 1; }
  static get CLOSING() { return 2; }
  static get CLOSED() { return 3; }

  // 设置事件处理器
  setupEventHandlers() {
    this.socket.on('data', (data) => {
      this.handleData(data);
    });
    
    this.socket.on('close', () => {
      this.readyState = WebSocketConnection.CLOSED;
      this.server.removeClient(this);
      this.dispatchEvent(new CustomEvent('close'));
    });
    
    this.socket.on('error', (error) => {
      this.dispatchEvent(new CustomEvent('error', { detail: error }));
    });
  }

  // 处理数据
  handleData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    
    while (this.buffer.length >= 2) {
      try {
        const frame = this.frameParser.parseFrame(this.buffer);
        this.buffer = this.buffer.slice(frame.frameLength);
        this.handleFrame(frame);
      } catch (error) {
        if (error.message.includes('too short')) {
          break;
        }
        this.close(1002, 'Protocol error');
        break;
      }
    }
  }

  // 处理帧
  handleFrame(frame) {
    switch (frame.opcode) {
      case this.frameParser.OPCODES.TEXT:
        const text = frame.payload.toString('utf8');
        this.dispatchEvent(new CustomEvent('message', { 
          detail: { data: text, type: 'text' } 
        }));
        break;
        
      case this.frameParser.OPCODES.BINARY:
        this.dispatchEvent(new CustomEvent('message', { 
          detail: { data: frame.payload, type: 'binary' } 
        }));
        break;
        
      case this.frameParser.OPCODES.CLOSE:
        let code = 1000;
        let reason = '';
        if (frame.payload.length >= 2) {
          code = frame.payload.readUInt16BE(0);
          reason = frame.payload.slice(2).toString('utf8');
        }
        this.close(code, reason);
        break;
        
      case this.frameParser.OPCODES.PING:
        this.pong(frame.payload);
        break;
        
      case this.frameParser.OPCODES.PONG:
        // 处理 pong 响应
        break;
    }
  }

  // 发送数据
  send(data) {
    if (this.readyState !== WebSocketConnection.OPEN) {
      throw new Error('WebSocket is not open');
    }
    
    let frame;
    if (typeof data === 'string') {
      frame = this.frameParser.createTextFrame(data, false);
    } else {
      frame = this.frameParser.createBinaryFrame(data, false);
    }
    
    this.socket.write(frame);
  }

  // 发送 Ping
  ping(data = Buffer.alloc(0)) {
    if (this.readyState === WebSocketConnection.OPEN) {
      const frame = this.frameParser.createPingFrame(data, false);
      this.socket.write(frame);
    }
  }

  // 发送 Pong
  pong(data = Buffer.alloc(0)) {
    if (this.readyState === WebSocketConnection.OPEN) {
      const frame = this.frameParser.createPongFrame(data, false);
      this.socket.write(frame);
    }
  }

  // 关闭连接
  close(code = 1000, reason = '') {
    if (this.readyState === WebSocketConnection.OPEN) {
      this.readyState = WebSocketConnection.CLOSING;
      const frame = this.frameParser.createCloseFrame(code, reason, false);
      this.socket.write(frame);
    }
    
    setTimeout(() => {
      this.socket.destroy();
    }, 1000);
  }
}
```

## 实际应用示例

### 1. 聊天室应用

```javascript
// 聊天室服务器
class ChatServer {
  constructor(port = 8080) {
    this.server = new WebSocketServer({ port });
    this.rooms = new Map();
    this.clients = new Map();
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.server.addEventListener('connection', (event) => {
      const client = event.detail;
      console.log('新客户端连接');
      
      client.addEventListener('message', (event) => {
        this.handleMessage(client, event.detail.data);
      });
      
      client.addEventListener('close', () => {
        this.handleDisconnect(client);
      });
    });
  }

  handleMessage(client, data) {
    try {
      const message = JSON.parse(data);
      
      switch (message.type) {
        case 'join':
          this.handleJoin(client, message);
          break;
        case 'chat':
          this.handleChat(client, message);
          break;
        case 'leave':
          this.handleLeave(client, message);
          break;
      }
    } catch (error) {
      client.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  }

  handleJoin(client, message) {
    const { room, username } = message;
    
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    
    this.rooms.get(room).add(client);
    this.clients.set(client, { room, username });
    
    // 通知房间内其他用户
    this.broadcastToRoom(room, {
      type: 'user_joined',
      username,
      timestamp: Date.now()
    }, client);
    
    // 发送欢迎消息
    client.send(JSON.stringify({
      type: 'joined',
      room,
      message: `欢迎加入房间 ${room}`
    }));
  }

  handleChat(client, message) {
    const clientInfo = this.clients.get(client);
    if (!clientInfo) return;
    
    const chatMessage = {
      type: 'chat',
      username: clientInfo.username,
      message: message.message,
      timestamp: Date.now()
    };
    
    this.broadcastToRoom(clientInfo.room, chatMessage);
  }

  handleLeave(client, message) {
    this.handleDisconnect(client);
  }

  handleDisconnect(client) {
    const clientInfo = this.clients.get(client);
    if (!clientInfo) return;
    
    const { room, username } = clientInfo;
    
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(client);
      
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      } else {
        this.broadcastToRoom(room, {
          type: 'user_left',
          username,
          timestamp: Date.now()
        });
      }
    }
    
    this.clients.delete(client);
  }

  broadcastToRoom(room, message, exclude = null) {
    if (!this.rooms.has(room)) return;
    
    const messageStr = JSON.stringify(message);
    for (const client of this.rooms.get(room)) {
      if (client !== exclude) {
        client.send(messageStr);
      }
    }
  }

  start() {
    this.server.listen(() => {
      console.log(`聊天服务器启动在端口 ${this.server.port}`);
    });
  }
}

// 启动聊天服务器
const chatServer = new ChatServer(8080);
chatServer.start();
```

### 2. 实时数据推送

```javascript
// 实时数据推送服务
class RealTimeDataService {
  constructor() {
    this.server = new WebSocketServer({ port: 8081 });
    this.subscribers = new Map();
    this.dataStreams = new Map();
    
    this.setupEventHandlers();
    this.startDataGeneration();
  }

  setupEventHandlers() {
    this.server.addEventListener('connection', (event) => {
      const client = event.detail;
      
      client.addEventListener('message', (event) => {
        this.handleSubscription(client, event.detail.data);
      });
      
      client.addEventListener('close', () => {
        this.handleUnsubscribe(client);
      });
    });
  }

  handleSubscription(client, data) {
    try {
      const request = JSON.parse(data);
      
      if (request.type === 'subscribe') {
        const { streams } = request;
        this.subscribers.set(client, new Set(streams));
        
        // 发送当前数据
        for (const stream of streams) {
          if (this.dataStreams.has(stream)) {
            client.send(JSON.stringify({
              type: 'data',
              stream,
              data: this.dataStreams.get(stream)
            }));
          }
        }
      }
    } catch (error) {
      console.error('处理订阅请求失败:', error);
    }
  }

  handleUnsubscribe(client) {
    this.subscribers.delete(client);
  }

  // 生成模拟数据
  startDataGeneration() {
    // 股票价格数据
    setInterval(() => {
      const stockData = {
        AAPL: 150 + Math.random() * 10 - 5,
        GOOGL: 2800 + Math.random() * 100 - 50,
        MSFT: 300 + Math.random() * 20 - 10
      };
      
      this.updateStream('stocks', stockData);
    }, 1000);
    
    // 系统监控数据
    setInterval(() => {
      const systemData = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        timestamp: Date.now()
      };
      
      this.updateStream('system', systemData);
    }, 2000);
    
    // 用户活动数据
    setInterval(() => {
      const activityData = {
        activeUsers: Math.floor(Math.random() * 1000),
        pageViews: Math.floor(Math.random() * 5000),
        timestamp: Date.now()
      };
      
      this.updateStream('activity', activityData);
    }, 5000);
  }

  updateStream(streamName, data) {
    this.dataStreams.set(streamName, data);
    
    const message = JSON.stringify({
      type: 'data',
      stream: streamName,
      data
    });
    
    for (const [client, streams] of this.subscribers) {
      if (streams.has(streamName)) {
        client.send(message);
      }
    }
  }

  start() {
    this.server.listen(() => {
      console.log('实时数据服务启动在端口 8081');
    });
  }
}

// 启动实时数据服务
const dataService = new RealTimeDataService();
dataService.start();
```

## 性能优化

### 1. 连接池管理

```javascript
// WebSocket 连接池
class WebSocketPool {
  constructor(maxConnections = 100) {
    this.maxConnections = maxConnections;
    this.connections = new Map();
    this.connectionCount = 0;
  }

  // 添加连接
  addConnection(id, connection) {
    if (this.connectionCount >= this.maxConnections) {
      throw new Error('连接池已满');
    }
    
    this.connections.set(id, {
      connection,
      lastActivity: Date.now(),
      messageCount: 0
    });
    
    this.connectionCount++;
    
    // 设置活动监听
    connection.addEventListener('message', () => {
      this.updateActivity(id);
    });
    
    connection.addEventListener('close', () => {
      this.removeConnection(id);
    });
  }

  // 移除连接
  removeConnection(id) {
    if (this.connections.has(id)) {
      this.connections.delete(id);
      this.connectionCount--;
    }
  }

  // 更新活动时间
  updateActivity(id) {
    const conn = this.connections.get(id);
    if (conn) {
      conn.lastActivity = Date.now();
      conn.messageCount++;
    }
  }

  // 清理不活跃连接
  cleanupInactiveConnections(timeout = 300000) { // 5分钟
    const now = Date.now();
    
    for (const [id, conn] of this.connections) {
      if (now - conn.lastActivity > timeout) {
        conn.connection.close(1000, 'Inactive connection');
        this.removeConnection(id);
      }
    }
  }

  // 获取统计信息
  getStats() {
    return {
      totalConnections: this.connectionCount,
      maxConnections: this.maxConnections,
      utilization: (this.connectionCount / this.maxConnections * 100).toFixed(2) + '%'
    };
  }
}
```

### 2. 消息压缩

```javascript
// WebSocket 消息压缩
class CompressedWebSocket {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.compressionEnabled = false;
    
    this.setupCompression();
  }

  setupCompression() {
    const zlib = require('zlib');
    
    this.ws.addEventListener('open', () => {
      // 协商压缩支持
      this.ws.send(JSON.stringify({
        type: 'compression_request',
        algorithms: ['gzip', 'deflate']
      }));
    });
    
    this.ws.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });
  }

  handleMessage(data) {
    if (this.compressionEnabled && data instanceof ArrayBuffer) {
      // 解压缩数据
      const compressed = Buffer.from(data);
      zlib.gunzip(compressed, (err, decompressed) => {
        if (!err) {
          const message = decompressed.toString();
          this.processMessage(message);
        }
      });
    } else {
      this.processMessage(data);
    }
  }

  processMessage(message) {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'compression_response') {
        this.compressionEnabled = data.enabled;
        console.log('压缩', this.compressionEnabled ? '已启用' : '未启用');
      } else {
        // 处理其他消息
        console.log('收到消息:', data);
      }
    } catch (error) {
      console.error('消息解析失败:', error);
    }
  }

  send(data) {
    const message = JSON.stringify(data);
    
    if (this.compressionEnabled && message.length > 1024) {
      // 压缩大消息
      const zlib = require('zlib');
      zlib.gzip(message, (err, compressed) => {
        if (!err) {
          this.ws.send(compressed);
        } else {
          this.ws.send(message);
        }
      });
    } else {
      this.ws.send(message);
    }
  }
}
```

## 安全考虑

### 1. 认证和授权

```javascript
// WebSocket 认证中间件
class WebSocketAuth {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.authenticatedClients = new Map();
  }

  // 验证 JWT Token
  verifyToken(token) {
    try {
      const jwt = require('jsonwebtoken');
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      return null;
    }
  }

  // 处理认证
  authenticate(client, message) {
    try {
      const { token } = JSON.parse(message);
      const payload = this.verifyToken(token);
      
      if (payload) {
        this.authenticatedClients.set(client, {
          userId: payload.userId,
          permissions: payload.permissions || [],
          authenticatedAt: Date.now()
        });
        
        client.send(JSON.stringify({
          type: 'auth_success',
          userId: payload.userId
        }));
        
        return true;
      } else {
        client.send(JSON.stringify({
          type: 'auth_failed',
          message: 'Invalid token'
        }));
        
        return false;
      }
    } catch (error) {
      client.send(JSON.stringify({
        type: 'auth_error',
        message: 'Authentication error'
      }));
      
      return false;
    }
  }

  // 检查权限
  hasPermission(client, permission) {
    const auth = this.authenticatedClients.get(client);
    return auth && auth.permissions.includes(permission);
  }

  // 获取用户信息
  getUserInfo(client) {
    return this.authenticatedClients.get(client);
  }

  // 移除认证信息
  removeAuth(client) {
    this.authenticatedClients.delete(client);
  }
}
```

### 2. 速率限制

```javascript
// WebSocket 速率限制
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.clients = new Map();
  }

  // 检查速率限制
  checkLimit(clientId) {
    const now = Date.now();
    const clientData = this.clients.get(clientId) || {
      requests: [],
      blocked: false,
      blockUntil: 0
    };
    
    // 检查是否仍在阻止期
    if (clientData.blocked && now < clientData.blockUntil) {
      return false;
    }
    
    // 清理过期请求
    clientData.requests = clientData.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    // 检查请求数量
    if (clientData.requests.length >= this.maxRequests) {
      clientData.blocked = true;
      clientData.blockUntil = now + this.windowMs;
      this.clients.set(clientId, clientData);
      return false;
    }
    
    // 记录请求
    clientData.requests.push(now);
    clientData.blocked = false;
    this.clients.set(clientId, clientData);
    
    return true;
  }

  // 获取剩余请求数
  getRemainingRequests(clientId) {
    const clientData = this.clients.get(clientId);
    if (!clientData) return this.maxRequests;
    
    const now = Date.now();
    const validRequests = clientData.requests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  // 重置客户端限制
  resetClient(clientId) {
    this.clients.delete(clientId);
  }
}
```

## 应用场景

### 实时通信
- 即时聊天
- 视频会议
- 在线游戏
- 协作编辑

### 数据推送
- 股票行情
- 系统监控
- 新闻推送
- 通知系统

### 交互应用
- 在线白板
- 实时投票
- 直播弹幕
- IoT 设备控制

---

WebSocket 协议为现代 Web 应用提供了强大的实时通信能力。通过理解其工作原理和实现细节，开发者可以构建高效、可靠的实时应用系统。