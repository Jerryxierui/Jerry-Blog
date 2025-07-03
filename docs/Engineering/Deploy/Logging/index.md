# 日志管理与监控

## 简介

日志管理是现代应用程序运维的重要组成部分，它帮助开发者和运维人员监控应用状态、诊断问题、分析性能和确保系统安全。

### 核心价值
- **问题诊断**：快速定位和解决系统问题
- **性能监控**：分析应用性能瓶颈
- **安全审计**：追踪安全事件和异常行为
- **业务分析**：了解用户行为和业务趋势
- **合规要求**：满足法规和审计要求

### 日志类型
- **应用日志**：业务逻辑、错误信息、调试信息
- **访问日志**：HTTP 请求、响应时间、状态码
- **系统日志**：操作系统、服务器、网络事件
- **安全日志**：认证、授权、安全事件
- **审计日志**：数据变更、用户操作记录

## 日志级别与格式

### 标准日志级别

```javascript
// 日志级别定义
const LOG_LEVELS = {
  FATAL: 0,   // 致命错误，应用无法继续运行
  ERROR: 1,   // 错误信息，功能异常但应用可继续
  WARN: 2,    // 警告信息，潜在问题
  INFO: 3,    // 一般信息，重要业务流程
  DEBUG: 4,   // 调试信息，详细执行过程
  TRACE: 5    // 跟踪信息，最详细的执行信息
}

// 使用示例
logger.info('用户登录成功', { userId: 12345, ip: '192.168.1.1' })
logger.error('数据库连接失败', { error: err.message, stack: err.stack })
logger.warn('API 响应时间过长', { endpoint: '/api/users', duration: 2500 })
```

### 结构化日志格式

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "service": "user-service",
  "version": "1.2.3",
  "environment": "production",
  "requestId": "req-123456789",
  "userId": "user-12345",
  "message": "用户登录成功",
  "data": {
    "email": "user@example.com",
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  },
  "duration": 150,
  "tags": ["authentication", "success"]
}
```

## Node.js 日志实现

### Winston 日志库

```javascript
// logger.js
const winston = require('winston')
const path = require('path')

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// 创建 logger 实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: process.env.SERVICE_NAME || 'app',
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // 文件输出 - 错误日志
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    
    // 文件输出 - 所有日志
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      tailable: true
    })
  ],
  
  // 异常处理
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'exceptions.log')
    })
  ],
  
  // 拒绝处理
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join('logs', 'rejections.log')
    })
  ]
})

// 生产环境配置
if (process.env.NODE_ENV === 'production') {
  // 移除控制台输出
  logger.remove(winston.transports.Console)
  
  // 添加远程日志传输
  logger.add(new winston.transports.Http({
    host: 'log-server.example.com',
    port: 80,
    path: '/logs'
  }))
}

module.exports = logger
```

### 请求日志中间件

```javascript
// middleware/requestLogger.js
const logger = require('../utils/logger')
const { v4: uuidv4 } = require('uuid')

const requestLogger = (req, res, next) => {
  const startTime = Date.now()
  const requestId = uuidv4()
  
  // 添加请求 ID 到请求对象
  req.requestId = requestId
  
  // 记录请求开始
  logger.info('请求开始', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    headers: req.headers
  })
  
  // 监听响应结束
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const logLevel = res.statusCode >= 400 ? 'error' : 'info'
    
    logger[logLevel]('请求完成', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length')
    })
  })
  
  next()
}

module.exports = requestLogger
```

### 错误日志处理

```javascript
// middleware/errorLogger.js
const logger = require('../utils/logger')

const errorLogger = (err, req, res, next) => {
  // 记录错误详情
  logger.error('应用错误', {
    requestId: req.requestId,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    },
    user: req.user ? {
      id: req.user.id,
      email: req.user.email
    } : null
  })
  
  next(err)
}

module.exports = errorLogger
```

## 前端日志实现

### 浏览器日志收集

```javascript
// frontend/logger.js
class FrontendLogger {
  constructor(options = {}) {
    this.endpoint = options.endpoint || '/api/logs'
    this.batchSize = options.batchSize || 10
    this.flushInterval = options.flushInterval || 5000
    this.logBuffer = []
    this.sessionId = this.generateSessionId()
    
    this.startAutoFlush()
    this.setupErrorHandlers()
    this.setupPerformanceMonitoring()
  }
  
  generateSessionId() {
    return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  }
  
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getUserId()
    }
    
    this.logBuffer.push(logEntry)
    
    // 立即发送错误日志
    if (level === 'ERROR' || level === 'FATAL') {
      this.flush()
    }
    
    // 缓冲区满时发送
    if (this.logBuffer.length >= this.batchSize) {
      this.flush()
    }
  }
  
  info(message, data) {
    this.log('INFO', message, data)
  }
  
  warn(message, data) {
    this.log('WARN', message, data)
  }
  
  error(message, data) {
    this.log('ERROR', message, data)
  }
  
  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, data)
    }
  }
  
  // 发送日志到服务器
  async flush() {
    if (this.logBuffer.length === 0) return
    
    const logs = [...this.logBuffer]
    this.logBuffer = []
    
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ logs })
      })
    } catch (error) {
      // 发送失败时重新加入缓冲区
      this.logBuffer.unshift(...logs)
      console.error('日志发送失败:', error)
    }
  }
  
  // 自动定时发送
  startAutoFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
    
    // 页面卸载时发送剩余日志
    window.addEventListener('beforeunload', () => {
      if (this.logBuffer.length > 0) {
        navigator.sendBeacon(
          this.endpoint,
          JSON.stringify({ logs: this.logBuffer })
        )
      }
    })
  }
  
  // 设置全局错误处理
  setupErrorHandlers() {
    // JavaScript 错误
    window.addEventListener('error', (event) => {
      this.error('JavaScript 错误', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    })
    
    // Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.error('未处理的 Promise 拒绝', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    })
    
    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.error('资源加载错误', {
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          message: '资源加载失败'
        })
      }
    }, true)
  }
  
  // 性能监控
  setupPerformanceMonitoring() {
    // 页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        
        this.info('页面加载性能', {
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint()
        })
      }, 0)
    })
    
    // 用户交互监控
    this.setupUserInteractionLogging()
  }
  
  getFirstPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint')
    return firstPaint ? firstPaint.startTime : null
  }
  
  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType('paint')
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcp ? fcp.startTime : null
  }
  
  setupUserInteractionLogging() {
    // 点击事件
    document.addEventListener('click', (event) => {
      this.debug('用户点击', {
        tagName: event.target.tagName,
        className: event.target.className,
        id: event.target.id,
        text: event.target.textContent?.substring(0, 50)
      })
    })
    
    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.info('页面可见性变化', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
      })
    })
  }
  
  getUserId() {
    // 从本地存储或全局变量获取用户 ID
    return window.currentUser?.id || localStorage.getItem('userId') || 'anonymous'
  }
}

// 创建全局日志实例
const logger = new FrontendLogger({
  endpoint: '/api/frontend-logs',
  batchSize: 5,
  flushInterval: 3000
})

// 导出日志方法
window.logger = logger
export default logger
```

## ELK Stack 日志系统

### Elasticsearch 配置

```yaml
# docker-compose.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - elk

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./logstash/config:/usr/share/logstash/pipeline
    networks:
      - elk
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    networks:
      - elk
    depends_on:
      - elasticsearch

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: filebeat
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./logs:/app/logs:ro
    networks:
      - elk
    depends_on:
      - elasticsearch
      - logstash

volumes:
  elasticsearch_data:

networks:
  elk:
    driver: bridge
```

### Logstash 配置

```ruby
# logstash/config/logstash.conf
input {
  beats {
    port => 5044
  }
  
  http {
    port => 8080
    codec => json
  }
}

filter {
  # 解析 JSON 日志
  if [fields][log_type] == "application" {
    json {
      source => "message"
    }
    
    # 解析时间戳
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    # 添加地理位置信息
    if [data][ip] {
      geoip {
        source => "[data][ip]"
        target => "geoip"
      }
    }
    
    # 解析用户代理
    if [data][userAgent] {
      useragent {
        source => "[data][userAgent]"
        target => "user_agent"
      }
    }
  }
  
  # 解析 Nginx 访问日志
  if [fields][log_type] == "nginx" {
    grok {
      match => { 
        "message" => "%{NGINXACCESS}"
      }
    }
    
    date {
      match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
    }
    
    mutate {
      convert => { "response" => "integer" }
      convert => { "bytes" => "integer" }
      convert => { "responsetime" => "float" }
    }
  }
  
  # 添加环境标签
  mutate {
    add_field => { "environment" => "%{[fields][environment]}" }
    add_field => { "service" => "%{[fields][service]}" }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{[fields][log_type]}-%{+YYYY.MM.dd}"
  }
  
  # 调试输出
  stdout {
    codec => rubydebug
  }
}
```

### Filebeat 配置

```yaml
# filebeat/filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /app/logs/*.log
  fields:
    log_type: application
    service: node-app
    environment: production
  fields_under_root: false
  multiline.pattern: '^\d{4}-\d{2}-\d{2}'
  multiline.negate: true
  multiline.match: after

- type: docker
  enabled: true
  containers.ids:
    - '*'
  fields:
    log_type: docker
  fields_under_root: false

processors:
- add_host_metadata:
    when.not.contains.tags: forwarded
- add_docker_metadata: ~

output.logstash:
  hosts: ["logstash:5044"]

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644
```

## 日志分析与监控

### Kibana 仪表板配置

```json
{
  "version": "8.11.0",
  "objects": [
    {
      "id": "app-logs-dashboard",
      "type": "dashboard",
      "attributes": {
        "title": "应用日志监控",
        "description": "应用程序日志分析仪表板",
        "panelsJSON": "[\n  {\n    \"id\": \"log-level-pie\",\n    \"type\": \"visualization\",\n    \"gridData\": {\n      \"x\": 0,\n      \"y\": 0,\n      \"w\": 24,\n      \"h\": 15\n    }\n  },\n  {\n    \"id\": \"error-timeline\",\n    \"type\": \"visualization\",\n    \"gridData\": {\n      \"x\": 24,\n      \"y\": 0,\n      \"w\": 24,\n      \"h\": 15\n    }\n  }\n]"
      }
    }
  ]
}
```

### 日志告警配置

```javascript
// alerting/logAlerts.js
const { Client } = require('@elastic/elasticsearch')
const nodemailer = require('nodemailer')

class LogAlerting {
  constructor() {
    this.esClient = new Client({ node: 'http://localhost:9200' })
    this.emailTransporter = nodemailer.createTransporter({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    
    this.alertRules = [
      {
        name: '错误率过高',
        query: {
          bool: {
            must: [
              { term: { level: 'ERROR' } },
              { range: { '@timestamp': { gte: 'now-5m' } } }
            ]
          }
        },
        threshold: 10,
        interval: 300000 // 5分钟
      },
      {
        name: '响应时间过长',
        query: {
          bool: {
            must: [
              { range: { duration: { gte: 5000 } } },
              { range: { '@timestamp': { gte: 'now-10m' } } }
            ]
          }
        },
        threshold: 5,
        interval: 600000 // 10分钟
      }
    ]
  }
  
  async startMonitoring() {
    this.alertRules.forEach(rule => {
      setInterval(async () => {
        await this.checkRule(rule)
      }, rule.interval)
    })
  }
  
  async checkRule(rule) {
    try {
      const response = await this.esClient.count({
        index: 'logs-*',
        body: {
          query: rule.query
        }
      })
      
      if (response.body.count >= rule.threshold) {
        await this.sendAlert(rule, response.body.count)
      }
    } catch (error) {
      console.error('告警检查失败:', error)
    }
  }
  
  async sendAlert(rule, count) {
    const alertMessage = {
      from: 'alerts@example.com',
      to: 'admin@example.com',
      subject: `🚨 日志告警: ${rule.name}`,
      html: `
        <h2>日志告警通知</h2>
        <p><strong>规则:</strong> ${rule.name}</p>
        <p><strong>触发次数:</strong> ${count}</p>
        <p><strong>阈值:</strong> ${rule.threshold}</p>
        <p><strong>时间:</strong> ${new Date().toISOString()}</p>
        <p><a href="http://localhost:5601">查看 Kibana 仪表板</a></p>
      `
    }
    
    try {
      await this.emailTransporter.sendMail(alertMessage)
      console.log(`告警邮件已发送: ${rule.name}`)
    } catch (error) {
      console.error('告警邮件发送失败:', error)
    }
  }
}

// 启动告警监控
const alerting = new LogAlerting()
alerting.startMonitoring()

module.exports = LogAlerting
```

## 日志最佳实践

### 日志设计原则

```javascript
// 最佳实践示例
class BestPracticeLogger {
  constructor() {
    this.logger = require('./logger')
  }
  
  // ✅ 好的日志实践
  logUserAction(action, userId, details = {}) {
    this.logger.info('用户操作', {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
      // 添加上下文信息
      sessionId: this.getSessionId(),
      requestId: this.getRequestId(),
      userAgent: this.getUserAgent()
    })
  }
  
  // ✅ 结构化错误日志
  logError(error, context = {}) {
    this.logger.error('应用错误', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      context,
      timestamp: new Date().toISOString(),
      severity: this.calculateSeverity(error)
    })
  }
  
  // ✅ 性能日志
  logPerformance(operation, duration, metadata = {}) {
    const level = duration > 1000 ? 'warn' : 'info'
    
    this.logger[level]('性能指标', {
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString(),
      performanceGrade: this.getPerformanceGrade(duration)
    })
  }
  
  // ✅ 业务事件日志
  logBusinessEvent(event, data = {}) {
    this.logger.info('业务事件', {
      event,
      data,
      timestamp: new Date().toISOString(),
      category: 'business',
      importance: this.getEventImportance(event)
    })
  }
  
  calculateSeverity(error) {
    if (error.name === 'ValidationError') return 'low'
    if (error.name === 'DatabaseError') return 'high'
    if (error.name === 'SecurityError') return 'critical'
    return 'medium'
  }
  
  getPerformanceGrade(duration) {
    if (duration < 100) return 'excellent'
    if (duration < 500) return 'good'
    if (duration < 1000) return 'fair'
    return 'poor'
  }
  
  getEventImportance(event) {
    const criticalEvents = ['user_registration', 'payment_completed', 'security_breach']
    return criticalEvents.includes(event) ? 'critical' : 'normal'
  }
}

// ❌ 避免的日志反模式
class BadLoggingExamples {
  badExamples() {
    // ❌ 日志信息不够详细
    logger.info('用户登录')
    
    // ❌ 敏感信息泄露
    logger.info('用户登录', { password: 'secret123' })
    
    // ❌ 日志级别使用错误
    logger.error('用户点击按钮')
    
    // ❌ 字符串拼接而非结构化
    logger.info(`用户 ${userId} 在 ${new Date()} 执行了 ${action}`)
    
    // ❌ 过度日志记录
    for (let i = 0; i < 1000000; i++) {
      logger.debug(`处理第 ${i} 条记录`)
    }
  }
}
```

### 日志安全与合规

```javascript
// security/logSecurity.js
class LogSecurity {
  constructor() {
    this.sensitiveFields = [
      'password', 'token', 'secret', 'key', 'auth',
      'ssn', 'credit_card', 'phone', 'email'
    ]
  }
  
  // 数据脱敏
  sanitizeLogData(data) {
    if (typeof data !== 'object' || data === null) {
      return data
    }
    
    const sanitized = { ...data }
    
    Object.keys(sanitized).forEach(key => {
      if (this.isSensitiveField(key)) {
        sanitized[key] = this.maskSensitiveData(sanitized[key])
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = this.sanitizeLogData(sanitized[key])
      }
    })
    
    return sanitized
  }
  
  isSensitiveField(fieldName) {
    const lowerField = fieldName.toLowerCase()
    return this.sensitiveFields.some(sensitive => 
      lowerField.includes(sensitive)
    )
  }
  
  maskSensitiveData(value) {
    if (typeof value !== 'string') {
      return '[REDACTED]'
    }
    
    if (value.length <= 4) {
      return '*'.repeat(value.length)
    }
    
    return value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2)
  }
  
  // GDPR 合规 - 用户数据删除
  async deleteUserLogs(userId) {
    try {
      // 从 Elasticsearch 删除用户相关日志
      await this.esClient.deleteByQuery({
        index: 'logs-*',
        body: {
          query: {
            term: { userId }
          }
        }
      })
      
      // 从文件系统删除
      await this.deleteUserLogsFromFiles(userId)
      
      console.log(`用户 ${userId} 的日志已删除`)
    } catch (error) {
      console.error('删除用户日志失败:', error)
    }
  }
  
  // 日志加密
  encryptLogEntry(logEntry) {
    const crypto = require('crypto')
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.LOG_ENCRYPTION_KEY, 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipher(algorithm, key, iv)
    
    let encrypted = cipher.update(JSON.stringify(logEntry), 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }
}

module.exports = LogSecurity
```

## 性能优化

### 异步日志处理

```javascript
// performance/asyncLogger.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads')
const fs = require('fs').promises
const path = require('path')

class AsyncLogger {
  constructor(options = {}) {
    this.bufferSize = options.bufferSize || 1000
    this.flushInterval = options.flushInterval || 5000
    this.logBuffer = []
    this.worker = null
    
    this.initWorker()
    this.startPeriodicFlush()
  }
  
  initWorker() {
    if (isMainThread) {
      this.worker = new Worker(__filename, {
        workerData: {
          logDir: path.join(process.cwd(), 'logs')
        }
      })
      
      this.worker.on('error', (error) => {
        console.error('日志工作线程错误:', error)
      })
    }
  }
  
  log(entry) {
    this.logBuffer.push({
      ...entry,
      timestamp: new Date().toISOString()
    })
    
    if (this.logBuffer.length >= this.bufferSize) {
      this.flush()
    }
  }
  
  flush() {
    if (this.logBuffer.length === 0) return
    
    const logs = [...this.logBuffer]
    this.logBuffer = []
    
    if (this.worker) {
      this.worker.postMessage({ type: 'WRITE_LOGS', logs })
    }
  }
  
  startPeriodicFlush() {
    setInterval(() => {
      this.flush()
    }, this.flushInterval)
    
    // 进程退出时刷新缓冲区
    process.on('exit', () => this.flush())
    process.on('SIGINT', () => {
      this.flush()
      process.exit(0)
    })
  }
}

// Worker 线程处理日志写入
if (!isMainThread) {
  const logDir = workerData.logDir
  
  parentPort.on('message', async ({ type, logs }) => {
    if (type === 'WRITE_LOGS') {
      await writeLogs(logs)
    }
  })
  
  async function writeLogs(logs) {
    try {
      // 按日期和级别分组
      const groupedLogs = groupLogsByDateAndLevel(logs)
      
      // 并行写入不同文件
      const writePromises = Object.entries(groupedLogs).map(
        ([filename, logEntries]) => writeLogFile(filename, logEntries)
      )
      
      await Promise.all(writePromises)
    } catch (error) {
      console.error('写入日志失败:', error)
    }
  }
  
  function groupLogsByDateAndLevel(logs) {
    const groups = {}
    
    logs.forEach(log => {
      const date = new Date(log.timestamp).toISOString().split('T')[0]
      const filename = `${date}-${log.level.toLowerCase()}.log`
      
      if (!groups[filename]) {
        groups[filename] = []
      }
      
      groups[filename].push(log)
    })
    
    return groups
  }
  
  async function writeLogFile(filename, logs) {
    const filepath = path.join(logDir, filename)
    const logLines = logs.map(log => JSON.stringify(log)).join('\n') + '\n'
    
    await fs.appendFile(filepath, logLines, 'utf8')
  }
}

module.exports = AsyncLogger
```

## 故障排除

### 常见问题解决

```bash
# 日志文件过大问题
# 使用 logrotate 自动轮转
sudo nano /etc/logrotate.d/myapp

# logrotate 配置
/var/log/myapp/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload myapp
    endscript
}

# 手动测试 logrotate
sudo logrotate -d /etc/logrotate.d/myapp
sudo logrotate -f /etc/logrotate.d/myapp

# 日志权限问题
sudo chown -R www-data:www-data /var/log/myapp
sudo chmod -R 644 /var/log/myapp

# Elasticsearch 磁盘空间不足
# 删除旧索引
curl -X DELETE "localhost:9200/logs-*-2023.01.*"

# 设置索引生命周期管理
curl -X PUT "localhost:9200/_ilm/policy/logs-policy" -H 'Content-Type: application/json' -d'
{
  "policy": {
    "phases": {
      "hot": {
        "actions": {
          "rollover": {
            "max_size": "1GB",
            "max_age": "7d"
          }
        }
      },
      "delete": {
        "min_age": "30d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}'

# 日志解析错误
# 检查 Logstash 配置
sudo docker logs logstash

# 测试 Grok 模式
echo 'test log line' | sudo docker exec -i logstash /usr/share/logstash/bin/logstash -e 'input{stdin{}} filter{grok{match=>{"message"=>"%{WORD:word}"}}} output{stdout{codec=>rubydebug}}'
```

### 监控脚本

```bash
#!/bin/bash
# monitor-logs.sh

# 日志系统健康检查脚本

LOG_DIR="/var/log/myapp"
ELASTIC_URL="http://localhost:9200"
KIBANA_URL="http://localhost:5601"
ALERT_EMAIL="admin@example.com"

# 检查日志文件大小
check_log_size() {
    echo "检查日志文件大小..."
    
    find $LOG_DIR -name "*.log" -size +100M | while read file; do
        echo "警告: 日志文件过大 - $file"
        # 发送告警邮件
        echo "日志文件 $file 超过 100MB" | mail -s "日志文件过大告警" $ALERT_EMAIL
    done
}

# 检查 Elasticsearch 状态
check_elasticsearch() {
    echo "检查 Elasticsearch 状态..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $ELASTIC_URL/_cluster/health)
    
    if [ $response -ne 200 ]; then
        echo "错误: Elasticsearch 不可用 (HTTP $response)"
        echo "Elasticsearch 服务不可用" | mail -s "Elasticsearch 告警" $ALERT_EMAIL
        return 1
    fi
    
    # 检查集群健康状态
    health=$(curl -s $ELASTIC_URL/_cluster/health | jq -r '.status')
    
    if [ "$health" != "green" ]; then
        echo "警告: Elasticsearch 集群状态为 $health"
        echo "Elasticsearch 集群状态异常: $health" | mail -s "Elasticsearch 健康告警" $ALERT_EMAIL
    fi
}

# 检查 Kibana 状态
check_kibana() {
    echo "检查 Kibana 状态..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $KIBANA_URL/api/status)
    
    if [ $response -ne 200 ]; then
        echo "错误: Kibana 不可用 (HTTP $response)"
        echo "Kibana 服务不可用" | mail -s "Kibana 告警" $ALERT_EMAIL
    fi
}

# 检查磁盘空间
check_disk_space() {
    echo "检查磁盘空间..."
    
    usage=$(df $LOG_DIR | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ $usage -gt 80 ]; then
        echo "警告: 日志目录磁盘使用率 ${usage}%"
        echo "日志目录磁盘使用率过高: ${usage}%" | mail -s "磁盘空间告警" $ALERT_EMAIL
    fi
}

# 检查日志错误率
check_error_rate() {
    echo "检查日志错误率..."
    
    # 最近1小时的错误日志数量
    error_count=$(curl -s "$ELASTIC_URL/logs-*/_count" -H 'Content-Type: application/json' -d'{
      "query": {
        "bool": {
          "must": [
            {"term": {"level": "ERROR"}},
            {"range": {"@timestamp": {"gte": "now-1h"}}}
          ]
        }
      }
    }' | jq '.count')
    
    if [ $error_count -gt 100 ]; then
        echo "警告: 最近1小时错误日志数量 $error_count"
        echo "错误日志数量异常: $error_count" | mail -s "错误率告警" $ALERT_EMAIL
    fi
}

# 主函数
main() {
    echo "开始日志系统健康检查 - $(date)"
    
    check_log_size
    check_elasticsearch
    check_kibana
    check_disk_space
    check_error_rate
    
    echo "健康检查完成 - $(date)"
}

# 运行检查
main
```

## 参考资源

### 📚 学习资源
- [Winston 官方文档](https://github.com/winstonjs/winston)
- [ELK Stack 官方指南](https://www.elastic.co/guide/)
- [日志管理最佳实践](https://www.loggly.com/ultimate-guide/)
- [结构化日志指南](https://stackify.com/what-is-structured-logging-and-why-developers-need-it/)

### 🛠️ 工具推荐
- **日志库**: Winston, Bunyan, Pino, Log4js
- **日志收集**: Filebeat, Fluentd, Logstash
- **日志存储**: Elasticsearch, MongoDB, InfluxDB
- **日志分析**: Kibana, Grafana, Splunk
- **告警工具**: ElastAlert, Prometheus AlertManager

### 📖 最佳实践指南
- [12-Factor App 日志原则](https://12factor.net/logs)
- [OWASP 日志安全指南](https://owasp.org/www-project-logging-guide/)
- [Google SRE 日志实践](https://sre.google/sre-book/monitoring-distributed-systems/)
- [微服务日志聚合模式](https://microservices.io/patterns/observability/application-logging.html)

---

> 💡 **提示**：良好的日志管理是系统可观测性的基础，合理的日志策略能够大大提升问题诊断和系统监控的效率！