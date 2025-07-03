# 微服务架构设计与实践

## 简介

微服务架构是一种将单一应用程序开发为一组小型服务的方法，每个服务运行在自己的进程中，并使用轻量级机制（通常是 HTTP API）进行通信。这些服务围绕业务功能构建，并且可以由全自动部署机制独立部署。

### 核心特性

- **服务自治**：每个服务独立开发、部署和扩展
- **去中心化**：数据管理和业务逻辑分散到各个服务
- **技术多样性**：不同服务可以使用不同的技术栈
- **故障隔离**：单个服务的故障不会影响整个系统
- **可扩展性**：可以根据需求独立扩展特定服务
- **团队自主性**：小团队可以独立负责特定服务

### 适用场景

- 大型复杂应用系统
- 高并发、高可用系统
- 快速迭代的业务需求
- 多团队协作开发
- 需要技术栈多样性的项目
- 云原生应用

## 微服务架构设计原则

### 1. 单一职责原则

每个微服务应该专注于一个业务领域或功能。

```javascript
// 用户服务 - 只负责用户相关操作
class UserService {
  async createUser(userData) {
    // 用户创建逻辑
    const user = await this.userRepository.create(userData);
    
    // 发布用户创建事件
    await this.eventBus.publish('user.created', {
      userId: user.id,
      email: user.email,
      timestamp: new Date()
    });
    
    return user;
  }
  
  async getUserById(userId) {
    return await this.userRepository.findById(userId);
  }
  
  async updateUser(userId, updateData) {
    const user = await this.userRepository.update(userId, updateData);
    
    await this.eventBus.publish('user.updated', {
      userId: user.id,
      changes: updateData,
      timestamp: new Date()
    });
    
    return user;
  }
}

// 订单服务 - 只负责订单相关操作
class OrderService {
  async createOrder(orderData) {
    // 验证用户存在（通过用户服务）
    const user = await this.userServiceClient.getUser(orderData.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // 创建订单
    const order = await this.orderRepository.create(orderData);
    
    // 发布订单创建事件
    await this.eventBus.publish('order.created', {
      orderId: order.id,
      userId: order.userId,
      amount: order.amount,
      timestamp: new Date()
    });
    
    return order;
  }
}
```

### 2. 数据库分离

每个微服务应该拥有自己的数据库，避免共享数据库。

```yaml
# docker-compose.yml
version: '3.8'
services:
  user-service:
    build: ./user-service
    environment:
      - DB_HOST=user-db
      - DB_NAME=user_db
    depends_on:
      - user-db
  
  user-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=user_db
      - POSTGRES_USER=user_service
      - POSTGRES_PASSWORD=password
    volumes:
      - user_data:/var/lib/postgresql/data
  
  order-service:
    build: ./order-service
    environment:
      - DB_HOST=order-db
      - DB_NAME=order_db
    depends_on:
      - order-db
  
  order-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=order_db
      - POSTGRES_USER=order_service
      - POSTGRES_PASSWORD=password
    volumes:
      - order_data:/var/lib/postgresql/data

volumes:
  user_data:
  order_data:
```

### 3. API 网关模式

使用 API 网关作为所有客户端请求的单一入口点。

```javascript
// API Gateway 实现
const express = require('express');
const httpProxy = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

class APIGateway {
  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }
  
  setupMiddleware() {
    // 限流中间件
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 分钟
      max: 100, // 限制每个 IP 100 次请求
      message: 'Too many requests from this IP'
    });
    
    this.app.use(limiter);
    this.app.use(express.json());
    
    // 认证中间件
    this.app.use('/api', this.authenticateToken.bind(this));
  }
  
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  }
  
  setupRoutes() {
    // 用户服务路由
    this.app.use('/api/users', httpProxy({
      target: process.env.USER_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api/users': '/users'
      },
      onError: this.handleProxyError.bind(this)
    }));
    
    // 订单服务路由
    this.app.use('/api/orders', httpProxy({
      target: process.env.ORDER_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api/orders': '/orders'
      },
      onError: this.handleProxyError.bind(this)
    }));
    
    // 产品服务路由
    this.app.use('/api/products', httpProxy({
      target: process.env.PRODUCT_SERVICE_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api/products': '/products'
      },
      onError: this.handleProxyError.bind(this)
    }));
    
    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });
  }
  
  handleProxyError(err, req, res) {
    console.error('Proxy error:', err);
    res.status(503).json({
      error: 'Service temporarily unavailable',
      message: 'The requested service is currently unavailable'
    });
  }
  
  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`API Gateway running on port ${port}`);
    });
  }
}

module.exports = APIGateway;
```

## 服务间通信

### 1. 同步通信（HTTP/REST）

```javascript
// 服务客户端封装
class ServiceClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || 5000;
    this.retries = options.retries || 3;
    this.circuitBreaker = new CircuitBreaker(options.circuitBreaker);
  }
  
  async request(method, path, data = null, options = {}) {
    const url = `${this.baseURL}${path}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.generateRequestId(),
        ...options.headers
      },
      timeout: this.timeout
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    return await this.circuitBreaker.execute(async () => {
      return await this.retryRequest(url, config);
    });
  }
  
  async retryRequest(url, config, attempt = 1) {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      if (attempt < this.retries && this.isRetryableError(error)) {
        const delay = Math.pow(2, attempt) * 1000; // 指数退避
        await this.sleep(delay);
        return this.retryRequest(url, config, attempt + 1);
      }
      throw error;
    }
  }
  
  isRetryableError(error) {
    return error.code === 'ECONNRESET' || 
           error.code === 'ETIMEDOUT' ||
           (error.message && error.message.includes('500'));
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 用户服务客户端
class UserServiceClient extends ServiceClient {
  constructor() {
    super(process.env.USER_SERVICE_URL);
  }
  
  async getUser(userId) {
    return await this.request('GET', `/users/${userId}`);
  }
  
  async createUser(userData) {
    return await this.request('POST', '/users', userData);
  }
  
  async updateUser(userId, updateData) {
    return await this.request('PUT', `/users/${userId}`, updateData);
  }
}
```

### 2. 异步通信（消息队列）

```javascript
// 事件总线实现
class EventBus {
  constructor(brokerUrl) {
    this.connection = null;
    this.channel = null;
    this.brokerUrl = brokerUrl;
    this.subscribers = new Map();
  }
  
  async connect() {
    const amqp = require('amqplib');
    this.connection = await amqp.connect(this.brokerUrl);
    this.channel = await this.connection.createChannel();
    
    // 设置交换机
    await this.channel.assertExchange('events', 'topic', { durable: true });
  }
  
  async publish(eventType, data) {
    const message = {
      eventType,
      data,
      timestamp: new Date().toISOString(),
      id: this.generateEventId()
    };
    
    await this.channel.publish(
      'events',
      eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log(`Event published: ${eventType}`, message.id);
  }
  
  async subscribe(eventPattern, handler) {
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, 'events', eventPattern);
    
    await this.channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await handler(event);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Event handling error:', error);
          this.channel.nack(msg, false, false); // 拒绝消息，不重新入队
        }
      }
    });
  }
  
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 事件处理器示例
class OrderEventHandler {
  constructor(eventBus, emailService, inventoryService) {
    this.eventBus = eventBus;
    this.emailService = emailService;
    this.inventoryService = inventoryService;
    this.setupEventHandlers();
  }
  
  async setupEventHandlers() {
    // 监听用户创建事件
    await this.eventBus.subscribe('user.created', this.handleUserCreated.bind(this));
    
    // 监听订单创建事件
    await this.eventBus.subscribe('order.created', this.handleOrderCreated.bind(this));
    
    // 监听支付完成事件
    await this.eventBus.subscribe('payment.completed', this.handlePaymentCompleted.bind(this));
  }
  
  async handleUserCreated(event) {
    console.log('Handling user created event:', event.data.userId);
    
    // 发送欢迎邮件
    await this.emailService.sendWelcomeEmail(event.data.email);
  }
  
  async handleOrderCreated(event) {
    console.log('Handling order created event:', event.data.orderId);
    
    // 预留库存
    await this.inventoryService.reserveItems(event.data.items);
    
    // 发送订单确认邮件
    await this.emailService.sendOrderConfirmation(event.data);
  }
  
  async handlePaymentCompleted(event) {
    console.log('Handling payment completed event:', event.data.orderId);
    
    // 确认库存扣减
    await this.inventoryService.confirmReservation(event.data.orderId);
    
    // 发布订单完成事件
    await this.eventBus.publish('order.completed', {
      orderId: event.data.orderId,
      userId: event.data.userId,
      timestamp: new Date()
    });
  }
}
```

## 数据一致性

### 1. Saga 模式

```javascript
// Saga 编排器
class OrderSaga {
  constructor(userService, inventoryService, paymentService, eventBus) {
    this.userService = userService;
    this.inventoryService = inventoryService;
    this.paymentService = paymentService;
    this.eventBus = eventBus;
    this.sagaSteps = [];
  }
  
  async executeOrderCreation(orderData) {
    const sagaId = this.generateSagaId();
    const context = { sagaId, orderData, completedSteps: [] };
    
    try {
      // 步骤 1: 验证用户
      await this.validateUser(context);
      
      // 步骤 2: 预留库存
      await this.reserveInventory(context);
      
      // 步骤 3: 处理支付
      await this.processPayment(context);
      
      // 步骤 4: 创建订单
      await this.createOrder(context);
      
      console.log(`Saga ${sagaId} completed successfully`);
      return context.order;
      
    } catch (error) {
      console.error(`Saga ${sagaId} failed:`, error);
      await this.compensate(context);
      throw error;
    }
  }
  
  async validateUser(context) {
    const step = 'validateUser';
    try {
      const user = await this.userService.getUser(context.orderData.userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid or inactive user');
      }
      context.user = user;
      context.completedSteps.push(step);
    } catch (error) {
      throw new Error(`${step} failed: ${error.message}`);
    }
  }
  
  async reserveInventory(context) {
    const step = 'reserveInventory';
    try {
      const reservation = await this.inventoryService.reserve({
        items: context.orderData.items,
        sagaId: context.sagaId
      });
      context.reservation = reservation;
      context.completedSteps.push(step);
    } catch (error) {
      throw new Error(`${step} failed: ${error.message}`);
    }
  }
  
  async processPayment(context) {
    const step = 'processPayment';
    try {
      const payment = await this.paymentService.charge({
        userId: context.orderData.userId,
        amount: context.orderData.amount,
        sagaId: context.sagaId
      });
      context.payment = payment;
      context.completedSteps.push(step);
    } catch (error) {
      throw new Error(`${step} failed: ${error.message}`);
    }
  }
  
  async createOrder(context) {
    const step = 'createOrder';
    try {
      const order = await this.orderService.create({
        ...context.orderData,
        reservationId: context.reservation.id,
        paymentId: context.payment.id,
        sagaId: context.sagaId
      });
      context.order = order;
      context.completedSteps.push(step);
    } catch (error) {
      throw new Error(`${step} failed: ${error.message}`);
    }
  }
  
  async compensate(context) {
    console.log(`Starting compensation for saga ${context.sagaId}`);
    
    // 按相反顺序执行补偿操作
    const compensationSteps = context.completedSteps.reverse();
    
    for (const step of compensationSteps) {
      try {
        await this.executeCompensation(step, context);
      } catch (error) {
        console.error(`Compensation failed for step ${step}:`, error);
      }
    }
  }
  
  async executeCompensation(step, context) {
    switch (step) {
      case 'createOrder':
        await this.orderService.cancel(context.order.id);
        break;
      case 'processPayment':
        await this.paymentService.refund(context.payment.id);
        break;
      case 'reserveInventory':
        await this.inventoryService.release(context.reservation.id);
        break;
    }
  }
  
  generateSagaId() {
    return `saga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### 2. 事件溯源

```javascript
// 事件存储
class EventStore {
  constructor(database) {
    this.db = database;
  }
  
  async saveEvent(aggregateId, event, expectedVersion) {
    const eventData = {
      aggregateId,
      eventType: event.constructor.name,
      eventData: JSON.stringify(event),
      version: expectedVersion + 1,
      timestamp: new Date(),
      eventId: this.generateEventId()
    };
    
    try {
      await this.db.events.insert(eventData);
      return eventData;
    } catch (error) {
      if (error.code === 'UNIQUE_VIOLATION') {
        throw new Error('Concurrency conflict');
      }
      throw error;
    }
  }
  
  async getEvents(aggregateId, fromVersion = 0) {
    const events = await this.db.events.find({
      aggregateId,
      version: { $gt: fromVersion }
    }).sort({ version: 1 });
    
    return events.map(event => ({
      ...JSON.parse(event.eventData),
      version: event.version,
      timestamp: event.timestamp
    }));
  }
  
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 聚合根基类
class AggregateRoot {
  constructor() {
    this.id = null;
    this.version = 0;
    this.uncommittedEvents = [];
  }
  
  applyEvent(event) {
    this.handle(event);
    this.version++;
    this.uncommittedEvents.push(event);
  }
  
  loadFromHistory(events) {
    events.forEach(event => {
      this.handle(event);
      this.version = event.version;
    });
  }
  
  getUncommittedEvents() {
    return this.uncommittedEvents;
  }
  
  markEventsAsCommitted() {
    this.uncommittedEvents = [];
  }
  
  handle(event) {
    const handlerName = `on${event.constructor.name}`;
    if (typeof this[handlerName] === 'function') {
      this[handlerName](event);
    }
  }
}

// 订单聚合
class Order extends AggregateRoot {
  constructor() {
    super();
    this.status = 'pending';
    this.items = [];
    this.totalAmount = 0;
  }
  
  static create(orderId, userId, items) {
    const order = new Order();
    order.applyEvent(new OrderCreated(orderId, userId, items));
    return order;
  }
  
  confirm() {
    if (this.status !== 'pending') {
      throw new Error('Order cannot be confirmed');
    }
    this.applyEvent(new OrderConfirmed(this.id));
  }
  
  cancel() {
    if (this.status === 'completed') {
      throw new Error('Completed order cannot be cancelled');
    }
    this.applyEvent(new OrderCancelled(this.id));
  }
  
  onOrderCreated(event) {
    this.id = event.orderId;
    this.userId = event.userId;
    this.items = event.items;
    this.totalAmount = event.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    this.status = 'pending';
  }
  
  onOrderConfirmed(event) {
    this.status = 'confirmed';
  }
  
  onOrderCancelled(event) {
    this.status = 'cancelled';
  }
}

// 事件类
class OrderCreated {
  constructor(orderId, userId, items) {
    this.orderId = orderId;
    this.userId = userId;
    this.items = items;
    this.timestamp = new Date();
  }
}

class OrderConfirmed {
  constructor(orderId) {
    this.orderId = orderId;
    this.timestamp = new Date();
  }
}

class OrderCancelled {
  constructor(orderId) {
    this.orderId = orderId;
    this.timestamp = new Date();
  }
}
```

## 服务发现与注册

### 1. Consul 集成

```javascript
// 服务注册
class ServiceRegistry {
  constructor(consulClient) {
    this.consul = consulClient;
    this.serviceId = null;
    this.healthCheckInterval = null;
  }
  
  async register(serviceConfig) {
    this.serviceId = `${serviceConfig.name}-${serviceConfig.id}`;
    
    const registration = {
      ID: this.serviceId,
      Name: serviceConfig.name,
      Tags: serviceConfig.tags || [],
      Address: serviceConfig.address,
      Port: serviceConfig.port,
      Check: {
        HTTP: `http://${serviceConfig.address}:${serviceConfig.port}/health`,
        Interval: '10s',
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s'
      },
      Meta: serviceConfig.metadata || {}
    };
    
    await this.consul.agent.service.register(registration);
    console.log(`Service registered: ${this.serviceId}`);
    
    // 设置优雅关闭
    this.setupGracefulShutdown();
  }
  
  async deregister() {
    if (this.serviceId) {
      await this.consul.agent.service.deregister(this.serviceId);
      console.log(`Service deregistered: ${this.serviceId}`);
    }
  }
  
  async discoverService(serviceName) {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true
    });
    
    return services.map(service => ({
      id: service.Service.ID,
      address: service.Service.Address,
      port: service.Service.Port,
      tags: service.Service.Tags,
      metadata: service.Service.Meta
    }));
  }
  
  setupGracefulShutdown() {
    const shutdown = async () => {
      console.log('Shutting down service...');
      await this.deregister();
      process.exit(0);
    };
    
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  }
}

// 负载均衡器
class LoadBalancer {
  constructor(serviceRegistry) {
    this.serviceRegistry = serviceRegistry;
    this.serviceInstances = new Map();
    this.roundRobinCounters = new Map();
  }
  
  async getServiceInstance(serviceName, strategy = 'round-robin') {
    let instances = this.serviceInstances.get(serviceName);
    
    // 如果缓存为空或过期，重新获取
    if (!instances || this.isCacheExpired(serviceName)) {
      instances = await this.serviceRegistry.discoverService(serviceName);
      this.serviceInstances.set(serviceName, {
        instances,
        timestamp: Date.now()
      });
    } else {
      instances = instances.instances;
    }
    
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }
    
    return this.selectInstance(serviceName, instances, strategy);
  }
  
  selectInstance(serviceName, instances, strategy) {
    switch (strategy) {
      case 'round-robin':
        return this.roundRobinSelection(serviceName, instances);
      case 'random':
        return this.randomSelection(instances);
      case 'least-connections':
        return this.leastConnectionsSelection(instances);
      default:
        return this.roundRobinSelection(serviceName, instances);
    }
  }
  
  roundRobinSelection(serviceName, instances) {
    let counter = this.roundRobinCounters.get(serviceName) || 0;
    const instance = instances[counter % instances.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return instance;
  }
  
  randomSelection(instances) {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }
  
  leastConnectionsSelection(instances) {
    // 简化实现，实际应该跟踪连接数
    return instances.reduce((min, current) => 
      (current.connections || 0) < (min.connections || 0) ? current : min
    );
  }
  
  isCacheExpired(serviceName, ttl = 30000) {
    const cached = this.serviceInstances.get(serviceName);
    return !cached || (Date.now() - cached.timestamp) > ttl;
  }
}
```

## 监控和可观测性

### 1. 分布式追踪

```javascript
// 追踪中间件
const opentracing = require('opentracing');
const jaeger = require('jaeger-client');

class TracingMiddleware {
  constructor(serviceName) {
    this.tracer = this.initTracer(serviceName);
  }
  
  initTracer(serviceName) {
    const config = {
      serviceName,
      sampler: {
        type: 'const',
        param: 1
      },
      reporter: {
        logSpans: true,
        agentHost: process.env.JAEGER_AGENT_HOST || 'localhost',
        agentPort: process.env.JAEGER_AGENT_PORT || 6832
      }
    };
    
    return jaeger.initTracer(config);
  }
  
  middleware() {
    return (req, res, next) => {
      const parentSpanContext = this.tracer.extract(
        opentracing.FORMAT_HTTP_HEADERS,
        req.headers
      );
      
      const span = this.tracer.startSpan(
        `${req.method} ${req.path}`,
        { childOf: parentSpanContext }
      );
      
      // 添加标签
      span.setTag('http.method', req.method);
      span.setTag('http.url', req.url);
      span.setTag('user.id', req.user?.id);
      
      // 将 span 添加到请求对象
      req.span = span;
      
      // 响应完成时结束 span
      res.on('finish', () => {
        span.setTag('http.status_code', res.statusCode);
        if (res.statusCode >= 400) {
          span.setTag('error', true);
        }
        span.finish();
      });
      
      next();
    };
  }
  
  // 创建子 span
  createChildSpan(parentSpan, operationName) {
    return this.tracer.startSpan(operationName, {
      childOf: parentSpan
    });
  }
  
  // 注入追踪头
  injectHeaders(span, headers = {}) {
    this.tracer.inject(span, opentracing.FORMAT_HTTP_HEADERS, headers);
    return headers;
  }
}

// 使用示例
class UserService {
  constructor(tracingMiddleware, userRepository) {
    this.tracing = tracingMiddleware;
    this.userRepository = userRepository;
  }
  
  async getUser(userId, parentSpan) {
    const span = this.tracing.createChildSpan(parentSpan, 'UserService.getUser');
    span.setTag('user.id', userId);
    
    try {
      const user = await this.userRepository.findById(userId);
      span.setTag('user.found', !!user);
      return user;
    } catch (error) {
      span.setTag('error', true);
      span.log({ event: 'error', message: error.message });
      throw error;
    } finally {
      span.finish();
    }
  }
}
```

### 2. 指标收集

```javascript
// Prometheus 指标
const prometheus = require('prom-client');

class MetricsCollector {
  constructor() {
    // 创建指标
    this.httpRequestDuration = new prometheus.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });
    
    this.httpRequestTotal = new prometheus.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });
    
    this.activeConnections = new prometheus.Gauge({
      name: 'active_connections',
      help: 'Number of active connections'
    });
    
    this.databaseQueryDuration = new prometheus.Histogram({
      name: 'database_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5]
    });
    
    // 注册默认指标
    prometheus.collectDefaultMetrics();
  }
  
  // HTTP 请求中间件
  httpMetricsMiddleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const labels = {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode
        };
        
        this.httpRequestDuration.observe(labels, duration);
        this.httpRequestTotal.inc(labels);
      });
      
      next();
    };
  }
  
  // 数据库查询指标
  recordDatabaseQuery(operation, table, duration) {
    this.databaseQueryDuration.observe(
      { operation, table },
      duration / 1000
    );
  }
  
  // 获取指标
  getMetrics() {
    return prometheus.register.metrics();
  }
  
  // 增加活跃连接数
  incrementActiveConnections() {
    this.activeConnections.inc();
  }
  
  // 减少活跃连接数
  decrementActiveConnections() {
    this.activeConnections.dec();
  }
}
```

## 安全性

### 1. 服务间认证

```javascript
// JWT 服务间认证
class ServiceAuthenticator {
  constructor(secretKey, serviceName) {
    this.secretKey = secretKey;
    this.serviceName = serviceName;
  }
  
  // 生成服务令牌
  generateServiceToken(targetService, expiresIn = '1h') {
    const payload = {
      iss: this.serviceName,
      aud: targetService,
      iat: Math.floor(Date.now() / 1000),
      type: 'service'
    };
    
    return jwt.sign(payload, this.secretKey, { expiresIn });
  }
  
  // 验证服务令牌
  verifyServiceToken(token, expectedIssuer = null) {
    try {
      const decoded = jwt.verify(token, this.secretKey);
      
      if (decoded.type !== 'service') {
        throw new Error('Invalid token type');
      }
      
      if (expectedIssuer && decoded.iss !== expectedIssuer) {
        throw new Error('Invalid token issuer');
      }
      
      if (decoded.aud !== this.serviceName) {
        throw new Error('Invalid token audience');
      }
      
      return decoded;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }
  
  // 认证中间件
  authenticationMiddleware() {
    return (req, res, next) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }
      
      const token = authHeader.substring(7);
      
      try {
        const decoded = this.verifyServiceToken(token);
        req.serviceAuth = decoded;
        next();
      } catch (error) {
        return res.status(401).json({ error: error.message });
      }
    };
  }
}

// 服务客户端认证
class AuthenticatedServiceClient extends ServiceClient {
  constructor(baseURL, authenticator, targetService) {
    super(baseURL);
    this.authenticator = authenticator;
    this.targetService = targetService;
  }
  
  async request(method, path, data = null, options = {}) {
    // 生成服务令牌
    const token = this.authenticator.generateServiceToken(this.targetService);
    
    // 添加认证头
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    
    return super.request(method, path, data, { ...options, headers });
  }
}
```

### 2. API 限流

```javascript
// 分布式限流
class DistributedRateLimiter {
  constructor(redisClient) {
    this.redis = redisClient;
  }
  
  async isAllowed(key, limit, windowSize) {
    const now = Date.now();
    const window = Math.floor(now / windowSize);
    const redisKey = `rate_limit:${key}:${window}`;
    
    const pipeline = this.redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, Math.ceil(windowSize / 1000));
    
    const results = await pipeline.exec();
    const count = results[0][1];
    
    return {
      allowed: count <= limit,
      count,
      limit,
      resetTime: (window + 1) * windowSize
    };
  }
  
  // 滑动窗口限流
  async slidingWindowRateLimit(key, limit, windowSize) {
    const now = Date.now();
    const redisKey = `sliding_rate_limit:${key}`;
    
    const pipeline = this.redis.pipeline();
    
    // 移除过期的记录
    pipeline.zremrangebyscore(redisKey, 0, now - windowSize);
    
    // 获取当前窗口内的请求数
    pipeline.zcard(redisKey);
    
    // 添加当前请求
    pipeline.zadd(redisKey, now, `${now}-${Math.random()}`);
    
    // 设置过期时间
    pipeline.expire(redisKey, Math.ceil(windowSize / 1000));
    
    const results = await pipeline.exec();
    const count = results[1][1];
    
    return {
      allowed: count < limit,
      count: count + 1,
      limit,
      resetTime: now + windowSize
    };
  }
  
  // 限流中间件
  middleware(options = {}) {
    const {
      keyGenerator = (req) => req.ip,
      limit = 100,
      windowSize = 60000, // 1 分钟
      algorithm = 'fixed-window'
    } = options;
    
    return async (req, res, next) => {
      const key = keyGenerator(req);
      
      try {
        let result;
        if (algorithm === 'sliding-window') {
          result = await this.slidingWindowRateLimit(key, limit, windowSize);
        } else {
          result = await this.isAllowed(key, limit, windowSize);
        }
        
        // 设置响应头
        res.set({
          'X-RateLimit-Limit': result.limit,
          'X-RateLimit-Remaining': Math.max(0, result.limit - result.count),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
        });
        
        if (!result.allowed) {
          return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          });
        }
        
        next();
      } catch (error) {
        console.error('Rate limiting error:', error);
        // 限流失败时允许请求通过
        next();
      }
    };
  }
}
```

## 部署和运维

### 1. Docker 容器化

```dockerfile
# Dockerfile
FROM node:16-alpine

# 创建应用目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API 网关
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - USER_SERVICE_URL=http://user-service:3001
      - ORDER_SERVICE_URL=http://order-service:3002
      - PRODUCT_SERVICE_URL=http://product-service:3003
    depends_on:
      - user-service
      - order-service
      - product-service
    networks:
      - microservices
  
  # 用户服务
  user-service:
    build: ./user-service
    environment:
      - NODE_ENV=production
      - DB_HOST=user-db
      - DB_NAME=user_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - user-db
      - redis
    networks:
      - microservices
  
  # 订单服务
  order-service:
    build: ./order-service
    environment:
      - NODE_ENV=production
      - DB_HOST=order-db
      - DB_NAME=order_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - order-db
      - rabbitmq
    networks:
      - microservices
  
  # 产品服务
  product-service:
    build: ./product-service
    environment:
      - NODE_ENV=production
      - DB_HOST=product-db
      - DB_NAME=product_db
    depends_on:
      - product-db
    networks:
      - microservices
  
  # 数据库
  user-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=user_db
      - POSTGRES_USER=user_service
      - POSTGRES_PASSWORD=password
    volumes:
      - user_data:/var/lib/postgresql/data
    networks:
      - microservices
  
  order-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=order_db
      - POSTGRES_USER=order_service
      - POSTGRES_PASSWORD=password
    volumes:
      - order_data:/var/lib/postgresql/data
    networks:
      - microservices
  
  product-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=product_db
      - POSTGRES_USER=product_service
      - POSTGRES_PASSWORD=password
    volumes:
      - product_data:/var/lib/postgresql/data
    networks:
      - microservices
  
  # Redis
  redis:
    image: redis:6-alpine
    networks:
      - microservices
  
  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    ports:
      - "15672:15672"
    networks:
      - microservices
  
  # 监控
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - microservices
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - microservices

volumes:
  user_data:
  order_data:
  product_data:

networks:
  microservices:
    driver: bridge
```

### 2. Kubernetes 部署

```yaml
# user-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: user-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "user-db-service"
        - name: DB_NAME
          valueFrom:
            secretKeyRef:
              name: user-db-secret
              key: database
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: user-db-secret
              key: username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: user-db-secret
              key: password
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: user-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: user-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 最佳实践

### 1. 设计原则

- **领域驱动设计（DDD）**：按业务领域划分服务边界
- **数据库分离**：每个服务拥有独立的数据库
- **无状态设计**：服务应该是无状态的，便于扩展
- **幂等性**：确保重复调用不会产生副作用
- **向后兼容**：API 变更应保持向后兼容

### 2. 开发实践

- **API 优先**：先设计 API 契约，再实现服务
- **自动化测试**：包括单元测试、集成测试和端到端测试
- **持续集成/持续部署**：自动化构建、测试和部署流程
- **配置外部化**：使用环境变量或配置中心管理配置
- **日志标准化**：统一日志格式和级别

### 3. 运维实践

- **健康检查**：实现健康检查端点
- **优雅关闭**：处理关闭信号，完成正在处理的请求
- **资源限制**：设置合理的 CPU 和内存限制
- **监控告警**：设置关键指标的监控和告警
- **故障恢复**：实现熔断、重试和降级机制

## 参考资源

### 官方文档
- [微服务架构模式](https://microservices.io/)
- [Spring Cloud 官方文档](https://spring.io/projects/spring-cloud)
- [Kubernetes 官方文档](https://kubernetes.io/docs/)
- [Docker 官方文档](https://docs.docker.com/)

### 工具和框架
- [Consul](https://www.consul.io/) - 服务发现和配置
- [Istio](https://istio.io/) - 服务网格
- [Jaeger](https://www.jaegertracing.io/) - 分布式追踪
- [Prometheus](https://prometheus.io/) - 监控和告警
- [Grafana](https://grafana.com/) - 可视化监控

### 最佳实践文章
- [微服务架构设计模式](https://microservices.io/patterns/)
- [分布式系统设计原则](https://aws.amazon.com/builders-library/)
- [云原生应用设计](https://12factor.net/)

### 社区资源
- [微服务社区](https://microservices.io/community.html)
- [CNCF 项目](https://www.cncf.io/projects/)
- [Stack Overflow 微服务标签](https://stackoverflow.com/questions/tagged/microservices)

---

本指南涵盖了微服务架构的核心概念、设计原则、实现模式和最佳实践。通过遵循这些指导原则，你可以构建出可扩展、可维护、高可用的微服务系统。