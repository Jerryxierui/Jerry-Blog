# 微服务消息队列

## 简介

消息队列是微服务架构中的核心组件，它提供了异步通信机制，使服务之间能够解耦、可靠地传递消息。消息队列不仅能提高系统的可扩展性和容错性，还能处理流量峰值，确保系统的稳定运行。

### 核心特性

- **异步通信**：发送者和接收者无需同时在线
- **解耦服务**：减少服务间的直接依赖
- **可靠传递**：确保消息不丢失
- **流量削峰**：缓解突发流量压力
- **扩展性**：支持水平扩展
- **持久化**：消息可持久化存储
- **顺序保证**：支持消息顺序处理
- **重试机制**：处理失败消息的重试

### 适用场景

- 异步任务处理
- 事件驱动架构
- 系统解耦
- 流量削峰填谷
- 数据同步
- 日志收集
- 通知推送
- 分布式事务

## 消息队列模式

### 1. 点对点模式（Point-to-Point）

一个消息只能被一个消费者消费。

```javascript
// 点对点消息队列实现
class PointToPointQueue {
  constructor(name) {
    this.name = name;
    this.messages = [];
    this.consumers = new Set();
    this.isProcessing = false;
  }
  
  // 发送消息
  send(message) {
    const messageObj = {
      id: this.generateMessageId(),
      content: message,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };
    
    this.messages.push(messageObj);
    console.log(`Message sent to queue ${this.name}:`, messageObj.id);
    
    // 触发消息处理
    this.processMessages();
    
    return messageObj.id;
  }
  
  // 注册消费者
  registerConsumer(consumer) {
    this.consumers.add(consumer);
    console.log(`Consumer registered to queue ${this.name}`);
    
    // 开始处理消息
    this.processMessages();
  }
  
  // 移除消费者
  unregisterConsumer(consumer) {
    this.consumers.delete(consumer);
    console.log(`Consumer unregistered from queue ${this.name}`);
  }
  
  // 处理消息
  async processMessages() {
    if (this.isProcessing || this.messages.length === 0 || this.consumers.size === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.messages.length > 0 && this.consumers.size > 0) {
      const message = this.messages.shift();
      const consumer = this.getNextConsumer();
      
      try {
        await this.deliverMessage(message, consumer);
        console.log(`Message ${message.id} processed successfully`);
      } catch (error) {
        console.error(`Failed to process message ${message.id}:`, error);
        await this.handleFailedMessage(message);
      }
    }
    
    this.isProcessing = false;
  }
  
  // 获取下一个可用消费者（轮询）
  getNextConsumer() {
    const consumers = Array.from(this.consumers);
    if (consumers.length === 0) return null;
    
    // 简单轮询策略
    const consumer = consumers[Math.floor(Math.random() * consumers.length)];
    return consumer;
  }
  
  // 投递消息给消费者
  async deliverMessage(message, consumer) {
    if (!consumer || typeof consumer.handleMessage !== 'function') {
      throw new Error('Invalid consumer');
    }
    
    message.attempts++;
    await consumer.handleMessage(message);
  }
  
  // 处理失败消息
  async handleFailedMessage(message) {
    if (message.attempts < message.maxAttempts) {
      // 重新加入队列
      setTimeout(() => {
        this.messages.unshift(message);
        this.processMessages();
      }, 1000 * message.attempts); // 指数退避
    } else {
      // 发送到死信队列
      console.error(`Message ${message.id} exceeded max attempts, sending to DLQ`);
      this.sendToDeadLetterQueue(message);
    }
  }
  
  // 发送到死信队列
  sendToDeadLetterQueue(message) {
    // 实现死信队列逻辑
    console.log(`Message ${message.id} sent to dead letter queue`);
  }
  
  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // 获取队列状态
  getStatus() {
    return {
      name: this.name,
      messageCount: this.messages.length,
      consumerCount: this.consumers.size,
      isProcessing: this.isProcessing
    };
  }
}

// 消费者示例
class MessageConsumer {
  constructor(name) {
    this.name = name;
  }
  
  async handleMessage(message) {
    console.log(`Consumer ${this.name} processing message:`, message.id);
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // 模拟处理失败（10% 概率）
    if (Math.random() < 0.1) {
      throw new Error(`Processing failed for message ${message.id}`);
    }
    
    console.log(`Consumer ${this.name} completed message:`, message.id);
  }
}

// 使用示例
const orderQueue = new PointToPointQueue('order-processing');

// 创建消费者
const consumer1 = new MessageConsumer('OrderProcessor-1');
const consumer2 = new MessageConsumer('OrderProcessor-2');

// 注册消费者
orderQueue.registerConsumer(consumer1);
orderQueue.registerConsumer(consumer2);

// 发送消息
for (let i = 1; i <= 5; i++) {
  orderQueue.send({
    orderId: `order-${i}`,
    customerId: `customer-${i}`,
    amount: Math.random() * 1000
  });
}

// 监控队列状态
setInterval(() => {
  console.log('Queue Status:', orderQueue.getStatus());
}, 5000);
```

### 2. 发布订阅模式（Publish-Subscribe）

一个消息可以被多个订阅者消费。

```javascript
// 发布订阅消息队列实现
class PubSubQueue {
  constructor() {
    this.topics = new Map();
  }
  
  // 创建主题
  createTopic(topicName) {
    if (!this.topics.has(topicName)) {
      this.topics.set(topicName, {
        subscribers: new Set(),
        messages: [],
        retentionPolicy: {
          maxMessages: 1000,
          maxAge: 24 * 60 * 60 * 1000 // 24小时
        }
      });
      console.log(`Topic created: ${topicName}`);
    }
    return this.topics.get(topicName);
  }
  
  // 发布消息
  publish(topicName, message) {
    const topic = this.topics.get(topicName);
    if (!topic) {
      throw new Error(`Topic ${topicName} does not exist`);
    }
    
    const messageObj = {
      id: this.generateMessageId(),
      topicName,
      content: message,
      timestamp: Date.now(),
      headers: {}
    };
    
    // 添加消息到主题
    topic.messages.push(messageObj);
    
    // 应用保留策略
    this.applyRetentionPolicy(topic);
    
    // 通知所有订阅者
    this.notifySubscribers(topic, messageObj);
    
    console.log(`Message published to topic ${topicName}:`, messageObj.id);
    return messageObj.id;
  }
  
  // 订阅主题
  subscribe(topicName, subscriber, options = {}) {
    const topic = this.createTopic(topicName);
    
    const subscription = {
      subscriber,
      options: {
        fromBeginning: options.fromBeginning || false,
        filter: options.filter || null,
        batchSize: options.batchSize || 1
      },
      lastProcessedOffset: options.fromBeginning ? 0 : topic.messages.length
    };
    
    topic.subscribers.add(subscription);
    console.log(`Subscriber added to topic ${topicName}`);
    
    // 如果需要从头开始消费
    if (options.fromBeginning) {
      this.deliverHistoricalMessages(topic, subscription);
    }
    
    return subscription;
  }
  
  // 取消订阅
  unsubscribe(topicName, subscription) {
    const topic = this.topics.get(topicName);
    if (topic) {
      topic.subscribers.delete(subscription);
      console.log(`Subscriber removed from topic ${topicName}`);
    }
  }
  
  // 通知订阅者
  async notifySubscribers(topic, message) {
    const notifications = [];
    
    for (const subscription of topic.subscribers) {
      // 应用过滤器
      if (subscription.options.filter && !subscription.options.filter(message)) {
        continue;
      }
      
      notifications.push(this.deliverMessage(subscription, message));
    }
    
    await Promise.allSettled(notifications);
  }
  
  // 投递消息
  async deliverMessage(subscription, message) {
    try {
      await subscription.subscriber.handleMessage(message);
      subscription.lastProcessedOffset = Math.max(
        subscription.lastProcessedOffset,
        this.getMessageOffset(message)
      );
    } catch (error) {
      console.error(`Failed to deliver message to subscriber:`, error);
      // 可以实现重试逻辑
    }
  }
  
  // 投递历史消息
  async deliverHistoricalMessages(topic, subscription) {
    const messages = topic.messages.slice(subscription.lastProcessedOffset);
    
    for (const message of messages) {
      if (subscription.options.filter && !subscription.options.filter(message)) {
        continue;
      }
      
      await this.deliverMessage(subscription, message);
    }
  }
  
  // 应用保留策略
  applyRetentionPolicy(topic) {
    const { maxMessages, maxAge } = topic.retentionPolicy;
    const now = Date.now();
    
    // 按数量限制
    if (topic.messages.length > maxMessages) {
      topic.messages = topic.messages.slice(-maxMessages);
    }
    
    // 按时间限制
    topic.messages = topic.messages.filter(msg => 
      (now - msg.timestamp) < maxAge
    );
  }
  
  getMessageOffset(message) {
    const topic = this.topics.get(message.topicName);
    return topic ? topic.messages.indexOf(message) : -1;
  }
  
  generateMessageId() {
    return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // 获取主题状态
  getTopicStatus(topicName) {
    const topic = this.topics.get(topicName);
    if (!topic) return null;
    
    return {
      name: topicName,
      messageCount: topic.messages.length,
      subscriberCount: topic.subscribers.size,
      retentionPolicy: topic.retentionPolicy
    };
  }
}

// 订阅者示例
class EventSubscriber {
  constructor(name) {
    this.name = name;
  }
  
  async handleMessage(message) {
    console.log(`Subscriber ${this.name} received message:`, {
      id: message.id,
      topic: message.topicName,
      content: message.content
    });
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
  }
}

// 使用示例
const pubsub = new PubSubQueue();

// 创建订阅者
const emailService = new EventSubscriber('EmailService');
const smsService = new EventSubscriber('SMSService');
const analyticsService = new EventSubscriber('AnalyticsService');

// 订阅用户事件
pubsub.subscribe('user.events', emailService);
pubsub.subscribe('user.events', smsService, {
  filter: (message) => message.content.eventType === 'registration'
});
pubsub.subscribe('user.events', analyticsService, {
  fromBeginning: true
});

// 发布事件
pubsub.publish('user.events', {
  eventType: 'registration',
  userId: 'user123',
  email: 'user@example.com',
  timestamp: Date.now()
});

pubsub.publish('user.events', {
  eventType: 'login',
  userId: 'user123',
  timestamp: Date.now()
});

pubsub.publish('user.events', {
  eventType: 'purchase',
  userId: 'user123',
  orderId: 'order456',
  amount: 99.99,
  timestamp: Date.now()
});
```

## 消息队列实现

### 1. Redis 消息队列

```javascript
// Redis 消息队列实现
const Redis = require('ioredis');

class RedisMessageQueue {
  constructor(redisConfig = {}) {
    this.redis = new Redis(redisConfig);
    this.subscribers = new Map();
  }
  
  // 发送消息到队列
  async sendToQueue(queueName, message, options = {}) {
    const messageObj = {
      id: this.generateMessageId(),
      content: message,
      timestamp: Date.now(),
      delay: options.delay || 0,
      priority: options.priority || 0
    };
    
    const serializedMessage = JSON.stringify(messageObj);
    
    if (options.delay > 0) {
      // 延迟消息
      const deliveryTime = Date.now() + options.delay;
      await this.redis.zadd(
        `${queueName}:delayed`,
        deliveryTime,
        serializedMessage
      );
    } else {
      // 立即消息
      if (options.priority > 0) {
        // 优先级队列
        await this.redis.zadd(
          `${queueName}:priority`,
          options.priority,
          serializedMessage
        );
      } else {
        // 普通队列
        await this.redis.lpush(queueName, serializedMessage);
      }
    }
    
    console.log(`Message sent to Redis queue ${queueName}:`, messageObj.id);
    return messageObj.id;
  }
  
  // 从队列消费消息
  async consumeFromQueue(queueName, options = {}) {
    const timeout = options.timeout || 10; // 10秒超时
    
    try {
      // 首先检查优先级队列
      let result = await this.redis.zpopmax(`${queueName}:priority`);
      
      if (result.length === 0) {
        // 然后检查普通队列
        result = await this.redis.brpop(queueName, timeout);
        if (result) {
          result = [result[1]]; // brpop 返回 [queueName, message]
        }
      }
      
      if (result && result.length > 0) {
        const message = JSON.parse(result[0]);
        return message;
      }
      
      return null;
    } catch (error) {
      console.error('Error consuming from Redis queue:', error);
      return null;
    }
  }
  
  // 处理延迟消息
  async processDelayedMessages(queueName) {
    const now = Date.now();
    const delayedKey = `${queueName}:delayed`;
    
    // 获取到期的延迟消息
    const messages = await this.redis.zrangebyscore(
      delayedKey,
      '-inf',
      now,
      'LIMIT', 0, 100
    );
    
    for (const serializedMessage of messages) {
      // 移动到普通队列
      await this.redis.lpush(queueName, serializedMessage);
      await this.redis.zrem(delayedKey, serializedMessage);
    }
    
    return messages.length;
  }
  
  // 发布消息到主题
  async publish(topic, message) {
    const messageObj = {
      id: this.generateMessageId(),
      topic,
      content: message,
      timestamp: Date.now()
    };
    
    const serializedMessage = JSON.stringify(messageObj);
    const subscriberCount = await this.redis.publish(topic, serializedMessage);
    
    console.log(`Message published to Redis topic ${topic}:`, messageObj.id);
    return { messageId: messageObj.id, subscriberCount };
  }
  
  // 订阅主题
  subscribe(topic, handler) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
      
      // 创建新的 Redis 连接用于订阅
      const subscriber = new Redis(this.redis.options);
      
      subscriber.subscribe(topic);
      subscriber.on('message', (receivedTopic, serializedMessage) => {
        if (receivedTopic === topic) {
          try {
            const message = JSON.parse(serializedMessage);
            const handlers = this.subscribers.get(topic);
            
            if (handlers) {
              handlers.forEach(handler => {
                try {
                  handler(message);
                } catch (error) {
                  console.error('Error in message handler:', error);
                }
              });
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        }
      });
      
      // 存储订阅连接
      this.subscribers.get(topic).subscriber = subscriber;
    }
    
    this.subscribers.get(topic).add(handler);
    console.log(`Subscribed to Redis topic: ${topic}`);
  }
  
  // 取消订阅
  unsubscribe(topic, handler) {
    const topicHandlers = this.subscribers.get(topic);
    if (topicHandlers) {
      topicHandlers.delete(handler);
      
      if (topicHandlers.size === 0) {
        // 关闭订阅连接
        if (topicHandlers.subscriber) {
          topicHandlers.subscriber.unsubscribe(topic);
          topicHandlers.subscriber.disconnect();
        }
        this.subscribers.delete(topic);
      }
    }
  }
  
  // 获取队列长度
  async getQueueLength(queueName) {
    const normalLength = await this.redis.llen(queueName);
    const priorityLength = await this.redis.zcard(`${queueName}:priority`);
    const delayedLength = await this.redis.zcard(`${queueName}:delayed`);
    
    return {
      normal: normalLength,
      priority: priorityLength,
      delayed: delayedLength,
      total: normalLength + priorityLength + delayedLength
    };
  }
  
  generateMessageId() {
    return 'redis_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // 关闭连接
  async close() {
    // 关闭所有订阅连接
    for (const [topic, handlers] of this.subscribers) {
      if (handlers.subscriber) {
        await handlers.subscriber.quit();
      }
    }
    
    await this.redis.quit();
  }
}

// 使用示例
async function redisQueueExample() {
  const queue = new RedisMessageQueue({
    host: 'localhost',
    port: 6379
  });
  
  // 队列消费者
  async function startConsumer(queueName, consumerName) {
    console.log(`Starting consumer ${consumerName} for queue ${queueName}`);
    
    while (true) {
      try {
        // 处理延迟消息
        await queue.processDelayedMessages(queueName);
        
        // 消费消息
        const message = await queue.consumeFromQueue(queueName, { timeout: 5 });
        
        if (message) {
          console.log(`Consumer ${consumerName} processing:`, message.id);
          
          // 模拟处理时间
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          console.log(`Consumer ${consumerName} completed:`, message.id);
        }
      } catch (error) {
        console.error(`Consumer ${consumerName} error:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  // 启动消费者
  startConsumer('task-queue', 'Worker-1');
  startConsumer('task-queue', 'Worker-2');
  
  // 发送消息
  await queue.sendToQueue('task-queue', { task: 'process-order', orderId: 'order-1' });
  await queue.sendToQueue('task-queue', { task: 'send-email', userId: 'user-1' }, { priority: 10 });
  await queue.sendToQueue('task-queue', { task: 'cleanup', type: 'temp-files' }, { delay: 60000 });
  
  // 发布订阅示例
  queue.subscribe('user.events', (message) => {
    console.log('Email service received:', message);
  });
  
  queue.subscribe('user.events', (message) => {
    console.log('Analytics service received:', message);
  });
  
  await queue.publish('user.events', {
    eventType: 'user.registered',
    userId: 'user123',
    email: 'user@example.com'
  });
  
  // 监控队列状态
  setInterval(async () => {
    const status = await queue.getQueueLength('task-queue');
    console.log('Queue status:', status);
  }, 10000);
}

// redisQueueExample();
```

### 2. RabbitMQ 集成

```javascript
// RabbitMQ 消息队列实现
const amqp = require('amqplib');

class RabbitMQMessageQueue {
  constructor(connectionUrl = 'amqp://localhost') {
    this.connectionUrl = connectionUrl;
    this.connection = null;
    this.channel = null;
    this.exchanges = new Map();
    this.queues = new Map();
  }
  
  // 连接到 RabbitMQ
  async connect() {
    try {
      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();
      
      // 设置预取数量
      await this.channel.prefetch(10);
      
      console.log('Connected to RabbitMQ');
      
      // 处理连接错误
      this.connection.on('error', (error) => {
        console.error('RabbitMQ connection error:', error);
      });
      
      this.connection.on('close', () => {
        console.log('RabbitMQ connection closed');
      });
      
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }
  
  // 声明交换机
  async declareExchange(exchangeName, type = 'direct', options = {}) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    const exchangeOptions = {
      durable: true,
      autoDelete: false,
      ...options
    };
    
    await this.channel.assertExchange(exchangeName, type, exchangeOptions);
    this.exchanges.set(exchangeName, { type, options: exchangeOptions });
    
    console.log(`Exchange declared: ${exchangeName} (${type})`);
  }
  
  // 声明队列
  async declareQueue(queueName, options = {}) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    const queueOptions = {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {},
      ...options
    };
    
    const queue = await this.channel.assertQueue(queueName, queueOptions);
    this.queues.set(queueName, { options: queueOptions, info: queue });
    
    console.log(`Queue declared: ${queueName}`);
    return queue;
  }
  
  // 绑定队列到交换机
  async bindQueue(queueName, exchangeName, routingKey = '') {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    await this.channel.bindQueue(queueName, exchangeName, routingKey);
    console.log(`Queue ${queueName} bound to exchange ${exchangeName} with routing key: ${routingKey}`);
  }
  
  // 发布消息
  async publish(exchangeName, routingKey, message, options = {}) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    const messageObj = {
      id: this.generateMessageId(),
      content: message,
      timestamp: Date.now()
    };
    
    const messageBuffer = Buffer.from(JSON.stringify(messageObj));
    
    const publishOptions = {
      persistent: true,
      messageId: messageObj.id,
      timestamp: messageObj.timestamp,
      ...options
    };
    
    const published = this.channel.publish(
      exchangeName,
      routingKey,
      messageBuffer,
      publishOptions
    );
    
    if (published) {
      console.log(`Message published to exchange ${exchangeName}:`, messageObj.id);
    } else {
      console.warn('Message could not be published (buffer full)');
    }
    
    return messageObj.id;
  }
  
  // 发送消息到队列
  async sendToQueue(queueName, message, options = {}) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    const messageObj = {
      id: this.generateMessageId(),
      content: message,
      timestamp: Date.now()
    };
    
    const messageBuffer = Buffer.from(JSON.stringify(messageObj));
    
    const sendOptions = {
      persistent: true,
      messageId: messageObj.id,
      timestamp: messageObj.timestamp,
      ...options
    };
    
    const sent = this.channel.sendToQueue(queueName, messageBuffer, sendOptions);
    
    if (sent) {
      console.log(`Message sent to queue ${queueName}:`, messageObj.id);
    } else {
      console.warn('Message could not be sent (buffer full)');
    }
    
    return messageObj.id;
  }
  
  // 消费消息
  async consume(queueName, handler, options = {}) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    const consumeOptions = {
      noAck: false,
      exclusive: false,
      ...options
    };
    
    const consumerTag = await this.channel.consume(
      queueName,
      async (msg) => {
        if (msg) {
          try {
            const message = JSON.parse(msg.content.toString());
            
            console.log(`Processing message from queue ${queueName}:`, message.id);
            
            // 调用处理函数
            await handler(message, msg);
            
            // 确认消息
            if (!consumeOptions.noAck) {
              this.channel.ack(msg);
            }
            
            console.log(`Message processed successfully:`, message.id);
            
          } catch (error) {
            console.error('Error processing message:', error);
            
            // 拒绝消息并重新排队
            if (!consumeOptions.noAck) {
              this.channel.nack(msg, false, true);
            }
          }
        }
      },
      consumeOptions
    );
    
    console.log(`Started consuming from queue ${queueName}, consumer tag: ${consumerTag.consumerTag}`);
    return consumerTag;
  }
  
  // 设置死信队列
  async setupDeadLetterQueue(queueName, dlxExchange = 'dlx', dlqName = null) {
    const deadLetterQueue = dlqName || `${queueName}.dlq`;
    
    // 声明死信交换机
    await this.declareExchange(dlxExchange, 'direct');
    
    // 声明死信队列
    await this.declareQueue(deadLetterQueue);
    
    // 绑定死信队列
    await this.bindQueue(deadLetterQueue, dlxExchange, queueName);
    
    // 重新声明原队列，添加死信配置
    await this.declareQueue(queueName, {
      arguments: {
        'x-dead-letter-exchange': dlxExchange,
        'x-dead-letter-routing-key': queueName,
        'x-message-ttl': 300000, // 5分钟 TTL
        'x-max-retries': 3
      }
    });
    
    console.log(`Dead letter queue setup for ${queueName} -> ${deadLetterQueue}`);
  }
  
  // 获取队列信息
  async getQueueInfo(queueName) {
    if (!this.channel) {
      throw new Error('Not connected to RabbitMQ');
    }
    
    try {
      const queue = await this.channel.checkQueue(queueName);
      return {
        queue: queueName,
        messageCount: queue.messageCount,
        consumerCount: queue.consumerCount
      };
    } catch (error) {
      console.error(`Error getting queue info for ${queueName}:`, error);
      return null;
    }
  }
  
  generateMessageId() {
    return 'rmq_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  // 关闭连接
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('RabbitMQ connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }
}

// 使用示例
async function rabbitMQExample() {
  const queue = new RabbitMQMessageQueue('amqp://localhost');
  
  try {
    await queue.connect();
    
    // 设置工作队列模式
    await queue.declareQueue('task-queue');
    await queue.setupDeadLetterQueue('task-queue');
    
    // 设置发布订阅模式
    await queue.declareExchange('events', 'fanout');
    await queue.declareQueue('email-service-queue');
    await queue.declareQueue('sms-service-queue');
    await queue.bindQueue('email-service-queue', 'events');
    await queue.bindQueue('sms-service-queue', 'events');
    
    // 设置路由模式
    await queue.declareExchange('logs', 'direct');
    await queue.declareQueue('error-logs');
    await queue.declareQueue('info-logs');
    await queue.bindQueue('error-logs', 'logs', 'error');
    await queue.bindQueue('info-logs', 'logs', 'info');
    
    // 消费者
    await queue.consume('task-queue', async (message) => {
      console.log('Task worker processing:', message.content);
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
    });
    
    await queue.consume('email-service-queue', async (message) => {
      console.log('Email service processing:', message.content);
    });
    
    await queue.consume('sms-service-queue', async (message) => {
      console.log('SMS service processing:', message.content);
    });
    
    await queue.consume('error-logs', async (message) => {
      console.log('Error log handler:', message.content);
    });
    
    // 发送消息
    await queue.sendToQueue('task-queue', {
      task: 'process-payment',
      orderId: 'order-123',
      amount: 99.99
    });
    
    // 发布事件
    await queue.publish('events', '', {
      eventType: 'user.registered',
      userId: 'user-456',
      email: 'user@example.com'
    });
    
    // 路由消息
    await queue.publish('logs', 'error', {
      level: 'error',
      message: 'Database connection failed',
      timestamp: Date.now()
    });
    
    await queue.publish('logs', 'info', {
      level: 'info',
      message: 'User logged in',
      userId: 'user-789',
      timestamp: Date.now()
    });
    
    // 监控队列状态
    setInterval(async () => {
      const taskQueueInfo = await queue.getQueueInfo('task-queue');
      console.log('Task queue status:', taskQueueInfo);
    }, 10000);
    
  } catch (error) {
    console.error('RabbitMQ example error:', error);
  }
}

// rabbitMQExample();
```

## 消息可靠性保证

### 1. 消息持久化

```javascript
// 消息持久化实现
class PersistentMessageQueue {
  constructor(storageAdapter) {
    this.storage = storageAdapter;
    this.queues = new Map();
    this.consumers = new Map();
    this.isProcessing = false;
  }
  
  // 发送持久化消息
  async sendMessage(queueName, message, options = {}) {
    const messageObj = {
      id: this.generateMessageId(),
      queueName,
      content: message,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      status: 'pending',
      priority: options.priority || 0,
      delay: options.delay || 0
    };
    
    // 持久化消息
    await this.storage.saveMessage(messageObj);
    
    // 添加到内存队列
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
    }
    
    if (messageObj.delay > 0) {
      // 延迟消息
      setTimeout(() => {
        this.queues.get(queueName).push(messageObj);
        this.processQueue(queueName);
      }, messageObj.delay);
    } else {
      this.queues.get(queueName).push(messageObj);
      this.processQueue(queueName);
    }
    
    console.log(`Persistent message sent to queue ${queueName}:`, messageObj.id);
    return messageObj.id;
  }
  
  // 注册消费者
  registerConsumer(queueName, consumer) {
    if (!this.consumers.has(queueName)) {
      this.consumers.set(queueName, []);
    }
    
    this.consumers.get(queueName).push(consumer);
    console.log(`Consumer registered for queue ${queueName}`);
    
    // 开始处理队列
    this.processQueue(queueName);
  }
  
  // 处理队列
  async processQueue(queueName) {
    if (this.isProcessing) return;
    
    const queue = this.queues.get(queueName);
    const consumers = this.consumers.get(queueName);
    
    if (!queue || !consumers || queue.length === 0 || consumers.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      while (queue.length > 0 && consumers.length > 0) {
        // 按优先级排序
        queue.sort((a, b) => b.priority - a.priority);
        
        const message = queue.shift();
        const consumer = consumers[Math.floor(Math.random() * consumers.length)];
        
        await this.processMessage(message, consumer);
      }
    } finally {
      this.isProcessing = false;
    }
  }
  
  // 处理单个消息
  async processMessage(message, consumer) {
    try {
      message.attempts++;
      message.status = 'processing';
      
      // 更新消息状态
      await this.storage.updateMessage(message);
      
      // 处理消息
      await consumer.handleMessage(message);
      
      // 标记为已完成
      message.status = 'completed';
      await this.storage.updateMessage(message);
      
      console.log(`Message processed successfully:`, message.id);
      
    } catch (error) {
      console.error(`Error processing message ${message.id}:`, error);
      
      message.status = 'failed';
      message.lastError = error.message;
      
      if (message.attempts < message.maxAttempts) {
        // 重试
        message.status = 'pending';
        await this.storage.updateMessage(message);
        
        // 指数退避重试
        const retryDelay = Math.pow(2, message.attempts) * 1000;
        setTimeout(() => {
          this.queues.get(message.queueName).push(message);
          this.processQueue(message.queueName);
        }, retryDelay);
        
      } else {
        // 发送到死信队列
        message.status = 'dead_letter';
        await this.storage.updateMessage(message);
        await this.sendToDeadLetterQueue(message);
      }
    }
  }
  
  // 发送到死信队列
  async sendToDeadLetterQueue(message) {
    const dlqMessage = {
      ...message,
      id: this.generateMessageId(),
      originalMessageId: message.id,
      dlqTimestamp: Date.now()
    };
    
    await this.storage.saveDeadLetterMessage(dlqMessage);
    console.log(`Message sent to dead letter queue:`, message.id);
  }
  
  // 恢复未完成的消息
  async recoverMessages() {
    console.log('Recovering unfinished messages...');
    
    const pendingMessages = await this.storage.getPendingMessages();
    
    for (const message of pendingMessages) {
      if (!this.queues.has(message.queueName)) {
        this.queues.set(message.queueName, []);
      }
      
      this.queues.get(message.queueName).push(message);
    }
    
    // 处理所有队列
    for (const queueName of this.queues.keys()) {
      this.processQueue(queueName);
    }
    
    console.log(`Recovered ${pendingMessages.length} messages`);
  }
  
  generateMessageId() {
    return 'persistent_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 存储适配器接口
class FileStorageAdapter {
  constructor(dataDir = './queue_data') {
    this.dataDir = dataDir;
    this.fs = require('fs').promises;
    this.path = require('path');
    
    this.ensureDataDir();
  }
  
  async ensureDataDir() {
    try {
      await this.fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      // 目录已存在
    }
  }
  
  async saveMessage(message) {
    const filePath = this.path.join(this.dataDir, `${message.id}.json`);
    await this.fs.writeFile(filePath, JSON.stringify(message, null, 2));
  }
  
  async updateMessage(message) {
    await this.saveMessage(message);
  }
  
  async getMessage(messageId) {
    try {
      const filePath = this.path.join(this.dataDir, `${messageId}.json`);
      const data = await this.fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }
  
  async getPendingMessages() {
    try {
      const files = await this.fs.readdir(this.dataDir);
      const messages = [];
      
      for (const file of files) {
        if (file.endsWith('.json') && !file.includes('dlq_')) {
          const filePath = this.path.join(this.dataDir, file);
          const data = await this.fs.readFile(filePath, 'utf8');
          const message = JSON.parse(data);
          
          if (message.status === 'pending' || message.status === 'processing') {
            messages.push(message);
          }
        }
      }
      
      return messages;
    } catch (error) {
      console.error('Error getting pending messages:', error);
      return [];
    }
  }
  
  async saveDeadLetterMessage(message) {
    const filePath = this.path.join(this.dataDir, `dlq_${message.id}.json`);
    await this.fs.writeFile(filePath, JSON.stringify(message, null, 2));
  }
}

// 使用示例
async function persistentQueueExample() {
  const storage = new FileStorageAdapter('./queue_data');
  const queue = new PersistentMessageQueue(storage);
  
  // 恢复未完成的消息
  await queue.recoverMessages();
  
  // 注册消费者
  const consumer = {
    async handleMessage(message) {
      console.log('Processing persistent message:', message.content);
      
      // 模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟处理失败（20% 概率）
      if (Math.random() < 0.2) {
        throw new Error('Random processing failure');
      }
    }
  };
  
  queue.registerConsumer('persistent-queue', consumer);
  
  // 发送消息
  await queue.sendMessage('persistent-queue', {
    orderId: 'order-123',
    action: 'process-payment'
  }, { priority: 10 });
  
  await queue.sendMessage('persistent-queue', {
    userId: 'user-456',
    action: 'send-welcome-email'
  }, { delay: 5000 });
}

// persistentQueueExample();
```

### 2. 事务消息

```javascript
// 事务消息实现
class TransactionalMessageQueue {
  constructor(storage) {
    this.storage = storage;
    this.transactions = new Map();
    this.messageQueue = new PersistentMessageQueue(storage);
  }
  
  // 开始事务
  async beginTransaction(transactionId = null) {
    const txId = transactionId || this.generateTransactionId();
    
    const transaction = {
      id: txId,
      status: 'active',
      messages: [],
      createdAt: Date.now(),
      timeout: 30000 // 30秒超时
    };
    
    this.transactions.set(txId, transaction);
    
    // 设置超时
    setTimeout(() => {
      this.timeoutTransaction(txId);
    }, transaction.timeout);
    
    console.log(`Transaction started: ${txId}`);
    return txId;
  }
  
  // 在事务中发送消息
  async sendTransactionalMessage(transactionId, queueName, message, options = {}) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    if (transaction.status !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }
    
    const messageObj = {
      id: this.generateMessageId(),
      queueName,
      content: message,
      timestamp: Date.now(),
      transactionId,
      status: 'prepared',
      ...options
    };
    
    // 添加到事务中
    transaction.messages.push(messageObj);
    
    // 预存储消息（prepared 状态）
    await this.storage.saveTransactionalMessage(messageObj);
    
    console.log(`Transactional message prepared: ${messageObj.id}`);
    return messageObj.id;
  }
  
  // 提交事务
  async commitTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }
    
    if (transaction.status !== 'active') {
      throw new Error(`Transaction ${transactionId} is not active`);
    }
    
    try {
      transaction.status = 'committing';
      
      // 提交所有消息
      for (const message of transaction.messages) {
        message.status = 'committed';
        await this.storage.updateTransactionalMessage(message);
        
        // 发送到实际队列
        await this.messageQueue.sendMessage(
          message.queueName,
          message.content,
          {
            priority: message.priority,
            delay: message.delay,
            maxAttempts: message.maxAttempts
          }
        );
      }
      
      transaction.status = 'committed';
      await this.storage.updateTransaction(transaction);
      
      console.log(`Transaction committed: ${transactionId}`);
      
      // 清理事务
      this.transactions.delete(transactionId);
      
    } catch (error) {
      console.error(`Error committing transaction ${transactionId}:`, error);
      await this.rollbackTransaction(transactionId);
      throw error;
    }
  }
  
  // 回滚事务
  async rollbackTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (!transaction) {
      console.warn(`Transaction ${transactionId} not found for rollback`);
      return;
    }
    
    try {
      transaction.status = 'rolling_back';
      
      // 标记所有消息为已回滚
      for (const message of transaction.messages) {
        message.status = 'rolled_back';
        await this.storage.updateTransactionalMessage(message);
      }
      
      transaction.status = 'rolled_back';
      await this.storage.updateTransaction(transaction);
      
      console.log(`Transaction rolled back: ${transactionId}`);
      
    } catch (error) {
      console.error(`Error rolling back transaction ${transactionId}:`, error);
    } finally {
      this.transactions.delete(transactionId);
    }
  }
  
  // 事务超时处理
  async timeoutTransaction(transactionId) {
    const transaction = this.transactions.get(transactionId);
    
    if (transaction && transaction.status === 'active') {
      console.warn(`Transaction ${transactionId} timed out`);
      await this.rollbackTransaction(transactionId);
    }
  }
  
  // 恢复未完成的事务
  async recoverTransactions() {
    console.log('Recovering unfinished transactions...');
    
    const pendingTransactions = await this.storage.getPendingTransactions();
    
    for (const transaction of pendingTransactions) {
      if (transaction.status === 'committing') {
        // 重新提交
        try {
          await this.commitTransaction(transaction.id);
        } catch (error) {
          await this.rollbackTransaction(transaction.id);
        }
      } else if (transaction.status === 'active') {
        // 超时回滚
        await this.rollbackTransaction(transaction.id);
      }
    }
    
    console.log(`Recovered ${pendingTransactions.length} transactions`);
  }
  
  generateTransactionId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  generateMessageId() {
    return 'tx_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 扩展存储适配器支持事务
class TransactionalFileStorageAdapter extends FileStorageAdapter {
  constructor(dataDir = './queue_data') {
    super(dataDir);
    this.transactionDir = this.path.join(dataDir, 'transactions');
    this.ensureTransactionDir();
  }
  
  async ensureTransactionDir() {
    try {
      await this.fs.mkdir(this.transactionDir, { recursive: true });
    } catch (error) {
      // 目录已存在
    }
  }
  
  async saveTransactionalMessage(message) {
    const filePath = this.path.join(this.transactionDir, `msg_${message.id}.json`);
    await this.fs.writeFile(filePath, JSON.stringify(message, null, 2));
  }
  
  async updateTransactionalMessage(message) {
    await this.saveTransactionalMessage(message);
  }
  
  async updateTransaction(transaction) {
    const filePath = this.path.join(this.transactionDir, `tx_${transaction.id}.json`);
    await this.fs.writeFile(filePath, JSON.stringify(transaction, null, 2));
  }
  
  async getPendingTransactions() {
    try {
      const files = await this.fs.readdir(this.transactionDir);
      const transactions = [];
      
      for (const file of files) {
        if (file.startsWith('tx_') && file.endsWith('.json')) {
          const filePath = this.path.join(this.transactionDir, file);
          const data = await this.fs.readFile(filePath, 'utf8');
          const transaction = JSON.parse(data);
          
          if (['active', 'committing', 'rolling_back'].includes(transaction.status)) {
            transactions.push(transaction);
          }
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('Error getting pending transactions:', error);
      return [];
    }
  }
}

// 使用示例
async function transactionalQueueExample() {
  const storage = new TransactionalFileStorageAdapter('./queue_data');
  const txQueue = new TransactionalMessageQueue(storage);
  
  // 恢复未完成的事务
  await txQueue.recoverTransactions();
  
  try {
    // 开始事务
    const txId = await txQueue.beginTransaction();
    
    // 在事务中发送多个消息
    await txQueue.sendTransactionalMessage(txId, 'order-queue', {
      action: 'create-order',
      orderId: 'order-123',
      customerId: 'customer-456'
    });
    
    await txQueue.sendTransactionalMessage(txId, 'inventory-queue', {
      action: 'reserve-items',
      orderId: 'order-123',
      items: [{ productId: 'prod-1', quantity: 2 }]
    });
    
    await txQueue.sendTransactionalMessage(txId, 'payment-queue', {
      action: 'process-payment',
      orderId: 'order-123',
      amount: 99.99
    });
    
    // 模拟业务逻辑
    const businessLogicSuccess = Math.random() > 0.3;
    
    if (businessLogicSuccess) {
      // 提交事务
      await txQueue.commitTransaction(txId);
      console.log('Order processing transaction committed');
    } else {
      // 回滚事务
      await txQueue.rollbackTransaction(txId);
      console.log('Order processing transaction rolled back');
    }
    
  } catch (error) {
    console.error('Transaction error:', error);
  }
}

// transactionalQueueExample();
```

## 性能优化

### 1. 批量处理

```javascript
// 批量处理消息队列
class BatchProcessingQueue {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 10;
    this.batchTimeout = options.batchTimeout || 5000; // 5秒
    this.maxConcurrency = options.maxConcurrency || 5;
    
    this.queues = new Map();
    this.processors = new Map();
    this.activeBatches = new Map();
  }
  
  // 注册批量处理器
  registerBatchProcessor(queueName, processor) {
    this.processors.set(queueName, processor);
    
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, {
        messages: [],
        batchTimer: null,
        processing: false
      });
    }
    
    console.log(`Batch processor registered for queue: ${queueName}`);
  }
  
  // 发送消息
   async sendMessage(queueName, message) {
     const messageObj = {
       id: this.generateMessageId(),
       content: message,
       timestamp: Date.now()
     };
     
     const queue = this.queues.get(queueName);
     if (!queue) {
       throw new Error(`Queue ${queueName} not found`);
     }
     
     queue.messages.push(messageObj);
     console.log(`Message added to batch queue ${queueName}:`, messageObj.id);
     
     // 检查是否需要立即处理批次
     if (queue.messages.length >= this.batchSize) {
       this.processBatch(queueName);
     } else if (!queue.batchTimer) {
       // 设置批次超时
       queue.batchTimer = setTimeout(() => {
         this.processBatch(queueName);
       }, this.batchTimeout);
     }
     
     return messageObj.id;
   }
   
   // 处理批次
   async processBatch(queueName) {
     const queue = this.queues.get(queueName);
     const processor = this.processors.get(queueName);
     
     if (!queue || !processor || queue.processing || queue.messages.length === 0) {
       return;
     }
     
     // 清除定时器
     if (queue.batchTimer) {
       clearTimeout(queue.batchTimer);
       queue.batchTimer = null;
     }
     
     // 提取批次消息
     const batchMessages = queue.messages.splice(0, this.batchSize);
     const batchId = this.generateBatchId();
     
     queue.processing = true;
     
     try {
       console.log(`Processing batch ${batchId} with ${batchMessages.length} messages`);
       
       // 处理批次
       await processor.processBatch(batchMessages, batchId);
       
       console.log(`Batch ${batchId} processed successfully`);
       
     } catch (error) {
       console.error(`Error processing batch ${batchId}:`, error);
       
       // 重新加入队列进行重试
       queue.messages.unshift(...batchMessages);
       
     } finally {
       queue.processing = false;
       
       // 如果还有消息，继续处理
       if (queue.messages.length > 0) {
         setTimeout(() => this.processBatch(queueName), 1000);
       }
     }
   }
   
   generateMessageId() {
     return 'batch_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
   }
   
   generateBatchId() {
     return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
   }
   
   // 获取队列状态
   getQueueStatus(queueName) {
     const queue = this.queues.get(queueName);
     if (!queue) return null;
     
     return {
       name: queueName,
       messageCount: queue.messages.length,
       processing: queue.processing,
       hasBatchTimer: !!queue.batchTimer
     };
   }
 }
 
 // 批量处理器示例
 class BatchProcessor {
   constructor(name) {
     this.name = name;
   }
   
   async processBatch(messages, batchId) {
     console.log(`Processor ${this.name} handling batch ${batchId} with ${messages.length} messages`);
     
     // 模拟批量处理
     const results = [];
     
     for (const message of messages) {
       try {
         // 模拟处理单个消息
         const result = await this.processMessage(message);
         results.push({ messageId: message.id, success: true, result });
       } catch (error) {
         results.push({ messageId: message.id, success: false, error: error.message });
       }
     }
     
     // 模拟批量操作（如批量数据库插入）
     await this.batchOperation(results);
     
     console.log(`Batch ${batchId} completed with ${results.filter(r => r.success).length} successes`);
   }
   
   async processMessage(message) {
     // 模拟处理时间
     await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
     
     // 模拟处理失败（5% 概率）
     if (Math.random() < 0.05) {
       throw new Error(`Processing failed for message ${message.id}`);
     }
     
     return { processed: true, timestamp: Date.now() };
   }
   
   async batchOperation(results) {
     // 模拟批量数据库操作
     console.log(`Performing batch operation for ${results.length} items`);
     await new Promise(resolve => setTimeout(resolve, 200));
   }
 }
 
 // 使用示例
 async function batchProcessingExample() {
   const batchQueue = new BatchProcessingQueue({
     batchSize: 5,
     batchTimeout: 3000,
     maxConcurrency: 3
   });
   
   // 注册批量处理器
   const emailProcessor = new BatchProcessor('EmailBatchProcessor');
   batchQueue.registerBatchProcessor('email-queue', emailProcessor);
   
   // 发送消息
   for (let i = 1; i <= 12; i++) {
     await batchQueue.sendMessage('email-queue', {
       type: 'email',
       recipient: `user${i}@example.com`,
       subject: `Notification ${i}`,
       body: `This is notification number ${i}`
     });
     
     // 模拟消息间隔
     await new Promise(resolve => setTimeout(resolve, 500));
   }
   
   // 监控队列状态
   setInterval(() => {
     const status = batchQueue.getQueueStatus('email-queue');
     console.log('Batch queue status:', status);
   }, 2000);
 }
 
 // batchProcessingExample();
 ```

### 2. 连接池管理

```javascript
// 连接池管理
class ConnectionPool {
  constructor(options = {}) {
    this.minConnections = options.minConnections || 2;
    this.maxConnections = options.maxConnections || 10;
    this.acquireTimeout = options.acquireTimeout || 30000;
    this.idleTimeout = options.idleTimeout || 300000; // 5分钟
    
    this.connections = [];
    this.availableConnections = [];
    this.pendingAcquires = [];
    this.connectionFactory = options.connectionFactory;
    
    this.initialize();
  }
  
  // 初始化连接池
  async initialize() {
    console.log(`Initializing connection pool with ${this.minConnections} connections`);
    
    for (let i = 0; i < this.minConnections; i++) {
      try {
        const connection = await this.createConnection();
        this.connections.push(connection);
        this.availableConnections.push(connection);
      } catch (error) {
        console.error('Error creating initial connection:', error);
      }
    }
    
    // 启动空闲连接清理
    this.startIdleConnectionCleanup();
  }
  
  // 创建新连接
  async createConnection() {
    if (!this.connectionFactory) {
      throw new Error('Connection factory not provided');
    }
    
    const connection = await this.connectionFactory();
    connection._poolCreatedAt = Date.now();
    connection._poolLastUsed = Date.now();
    connection._poolInUse = false;
    
    console.log('New connection created');
    return connection;
  }
  
  // 获取连接
  async acquire() {
    return new Promise((resolve, reject) => {
      // 检查是否有可用连接
      if (this.availableConnections.length > 0) {
        const connection = this.availableConnections.pop();
        connection._poolInUse = true;
        connection._poolLastUsed = Date.now();
        resolve(connection);
        return;
      }
      
      // 如果可以创建新连接
      if (this.connections.length < this.maxConnections) {
        this.createConnection()
          .then(connection => {
            this.connections.push(connection);
            connection._poolInUse = true;
            connection._poolLastUsed = Date.now();
            resolve(connection);
          })
          .catch(reject);
        return;
      }
      
      // 加入等待队列
      const timeout = setTimeout(() => {
        const index = this.pendingAcquires.findIndex(p => p.resolve === resolve);
        if (index !== -1) {
          this.pendingAcquires.splice(index, 1);
          reject(new Error('Connection acquire timeout'));
        }
      }, this.acquireTimeout);
      
      this.pendingAcquires.push({ resolve, reject, timeout });
    });
  }
  
  // 释放连接
  release(connection) {
    if (!connection || !connection._poolInUse) {
      return;
    }
    
    connection._poolInUse = false;
    connection._poolLastUsed = Date.now();
    
    // 检查是否有等待的请求
    if (this.pendingAcquires.length > 0) {
      const pending = this.pendingAcquires.shift();
      clearTimeout(pending.timeout);
      
      connection._poolInUse = true;
      connection._poolLastUsed = Date.now();
      pending.resolve(connection);
    } else {
      this.availableConnections.push(connection);
    }
  }
  
  // 销毁连接
  async destroy(connection) {
    const index = this.connections.indexOf(connection);
    if (index !== -1) {
      this.connections.splice(index, 1);
    }
    
    const availableIndex = this.availableConnections.indexOf(connection);
    if (availableIndex !== -1) {
      this.availableConnections.splice(availableIndex, 1);
    }
    
    try {
      if (connection.close) {
        await connection.close();
      }
      console.log('Connection destroyed');
    } catch (error) {
      console.error('Error destroying connection:', error);
    }
  }
  
  // 清理空闲连接
  startIdleConnectionCleanup() {
    setInterval(() => {
      const now = Date.now();
      const connectionsToDestroy = [];
      
      for (const connection of this.availableConnections) {
        if (now - connection._poolLastUsed > this.idleTimeout &&
            this.connections.length > this.minConnections) {
          connectionsToDestroy.push(connection);
        }
      }
      
      for (const connection of connectionsToDestroy) {
        this.destroy(connection);
      }
      
      if (connectionsToDestroy.length > 0) {
        console.log(`Cleaned up ${connectionsToDestroy.length} idle connections`);
      }
    }, 60000); // 每分钟检查一次
  }
  
  // 获取连接池状态
  getStatus() {
    return {
      totalConnections: this.connections.length,
      availableConnections: this.availableConnections.length,
      inUseConnections: this.connections.filter(c => c._poolInUse).length,
      pendingAcquires: this.pendingAcquires.length,
      minConnections: this.minConnections,
      maxConnections: this.maxConnections
    };
  }
  
  // 关闭连接池
  async close() {
    console.log('Closing connection pool...');
    
    // 拒绝所有等待的请求
    for (const pending of this.pendingAcquires) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection pool is closing'));
    }
    this.pendingAcquires = [];
    
    // 关闭所有连接
    const closePromises = this.connections.map(connection => this.destroy(connection));
    await Promise.allSettled(closePromises);
    
    this.connections = [];
    this.availableConnections = [];
    
    console.log('Connection pool closed');
  }
}

// 带连接池的消息队列
class PooledMessageQueue {
  constructor(connectionPool) {
    this.connectionPool = connectionPool;
  }
  
  // 发送消息
  async sendMessage(queueName, message) {
    const connection = await this.connectionPool.acquire();
    
    try {
      // 使用连接发送消息
      const messageId = await this.doSendMessage(connection, queueName, message);
      console.log(`Message sent using pooled connection:`, messageId);
      return messageId;
    } finally {
      this.connectionPool.release(connection);
    }
  }
  
  // 消费消息
  async consumeMessage(queueName, timeout = 10000) {
    const connection = await this.connectionPool.acquire();
    
    try {
      const message = await this.doConsumeMessage(connection, queueName, timeout);
      return message;
    } finally {
      this.connectionPool.release(connection);
    }
  }
  
  // 实际发送消息的实现
  async doSendMessage(connection, queueName, message) {
    // 模拟发送消息
    const messageId = 'pooled_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    
    return messageId;
  }
  
  // 实际消费消息的实现
  async doConsumeMessage(connection, queueName, timeout) {
    // 模拟消费消息
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    
    // 模拟有消息的概率
    if (Math.random() > 0.3) {
      return {
        id: 'consumed_msg_' + Date.now(),
        content: { data: 'sample message' },
        timestamp: Date.now()
      };
    }
    
    return null;
  }
}

// 使用示例
async function connectionPoolExample() {
  // 模拟连接工厂
  const connectionFactory = async () => {
    // 模拟连接创建时间
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      id: 'conn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      close: async () => {
        console.log('Connection closed');
      }
    };
  };
  
  const pool = new ConnectionPool({
    minConnections: 2,
    maxConnections: 8,
    acquireTimeout: 5000,
    idleTimeout: 30000,
    connectionFactory
  });
  
  const queue = new PooledMessageQueue(pool);
  
  // 并发发送消息
  const sendPromises = [];
  for (let i = 0; i < 20; i++) {
    sendPromises.push(
      queue.sendMessage('test-queue', {
        id: i,
        data: `Message ${i}`,
        timestamp: Date.now()
      })
    );
  }
  
  await Promise.all(sendPromises);
  
  // 并发消费消息
  const consumePromises = [];
  for (let i = 0; i < 10; i++) {
    consumePromises.push(
      queue.consumeMessage('test-queue')
    );
  }
  
  const messages = await Promise.all(consumePromises);
  console.log('Consumed messages:', messages.filter(m => m !== null).length);
  
  // 监控连接池状态
  const statusInterval = setInterval(() => {
    console.log('Pool status:', pool.getStatus());
  }, 2000);
  
  // 10秒后关闭
  setTimeout(async () => {
    clearInterval(statusInterval);
    await pool.close();
  }, 10000);
}

// connectionPoolExample();
```

## 最佳实践

### 设计原则

1. **消息幂等性**
   - 确保消息处理的幂等性
   - 使用唯一消息ID防止重复处理
   - 实现去重机制

2. **错误处理**
   - 实现重试机制和指数退避
   - 设置死信队列处理失败消息
   - 记录详细的错误日志

3. **性能优化**
   - 使用批量处理提高吞吐量
   - 实现连接池管理
   - 合理设置预取数量

4. **监控和告警**
   - 监控队列长度和处理速度
   - 设置关键指标的告警
   - 实现健康检查

### 运维实践

1. **容量规划**
   - 根据业务需求评估消息量
   - 合理配置队列和消费者数量
   - 预留足够的存储空间

2. **高可用部署**
   - 部署多个消息队列实例
   - 实现主从复制和故障转移
   - 使用负载均衡分散流量

3. **安全性**
   - 实现访问控制和认证
   - 加密敏感消息内容
   - 定期更新和维护

## 参考资源

- [RabbitMQ 官方文档](https://www.rabbitmq.com/documentation.html)
- [Apache Kafka 文档](https://kafka.apache.org/documentation/)
- [Redis Pub/Sub](https://redis.io/topics/pubsub)
- [消息队列设计模式](https://www.enterpriseintegrationpatterns.com/patterns/messaging/)
- [微服务架构中的消息传递](https://microservices.io/patterns/data/event-driven-architecture.html)

---

本指南涵盖了微服务消息队列的核心概念、实现模式、可靠性保证和性能优化策略，为构建高效、可靠的异步通信系统提供了全面的技术指导。