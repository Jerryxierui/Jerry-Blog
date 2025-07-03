# HTTP/HTTPS

HTTP（HyperText Transfer Protocol）是互联网上应用最为广泛的网络协议，用于从Web服务器传输超文本到本地浏览器的传输协议。HTTPS是HTTP的安全版本，通过SSL/TLS加密保护数据传输。

## HTTP基础

### 核心概念

- **无状态协议**：每个请求都是独立的，服务器不保存客户端状态
- **请求-响应模型**：客户端发送请求，服务器返回响应
- **基于TCP**：HTTP建立在可靠的TCP连接之上
- **文本协议**：HTTP消息以纯文本形式传输
- **应用层协议**：位于OSI模型的应用层

### HTTP消息结构

```http
# HTTP请求消息结构
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html,application/xhtml+xml
Connection: keep-alive

[请求体]

# HTTP响应消息结构
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Server: Apache/2.4.41
Date: Wed, 21 Oct 2023 07:28:00 GMT

<!DOCTYPE html>
<html>
<head><title>Example</title></head>
<body><h1>Hello World</h1></body>
</html>
```

## HTTP方法

### 常用HTTP方法

```javascript
// HTTP方法示例
class HTTPClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // GET - 获取资源
  async get(path, params = {}) {
    const url = new URL(path, this.baseURL);
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MyApp/1.0'
      }
    });

    return this.handleResponse(response);
  }

  // POST - 创建资源
  async post(path, data) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // PUT - 更新资源（完整更新）
  async put(path, data) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // PATCH - 部分更新资源
  async patch(path, data) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return this.handleResponse(response);
  }

  // DELETE - 删除资源
  async delete(path) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json'
      }
    });

    return this.handleResponse(response);
  }

  // HEAD - 获取资源头信息
  async head(path) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'HEAD'
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  // OPTIONS - 获取支持的方法
  async options(path) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'OPTIONS'
    });

    return {
      status: response.status,
      allowedMethods: response.headers.get('Allow')?.split(', ') || [],
      headers: Object.fromEntries(response.headers.entries())
    };
  }

  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  }
}

// 使用示例
const client = new HTTPClient('https://api.example.com');

// GET请求
client.get('/users', { page: 1, limit: 10 })
  .then(response => console.log(response.data))
  .catch(error => console.error(error));

// POST请求
client.post('/users', { name: 'John', email: 'john@example.com' })
  .then(response => console.log('User created:', response.data))
  .catch(error => console.error(error));
```

## HTTP状态码

### 状态码分类

```javascript
// HTTP状态码处理
class HTTPStatusHandler {
  static getStatusInfo(statusCode) {
    const statusMap = {
      // 1xx 信息性状态码
      100: { type: 'informational', message: 'Continue' },
      101: { type: 'informational', message: 'Switching Protocols' },
      102: { type: 'informational', message: 'Processing' },

      // 2xx 成功状态码
      200: { type: 'success', message: 'OK' },
      201: { type: 'success', message: 'Created' },
      202: { type: 'success', message: 'Accepted' },
      204: { type: 'success', message: 'No Content' },
      206: { type: 'success', message: 'Partial Content' },

      // 3xx 重定向状态码
      301: { type: 'redirection', message: 'Moved Permanently' },
      302: { type: 'redirection', message: 'Found' },
      304: { type: 'redirection', message: 'Not Modified' },
      307: { type: 'redirection', message: 'Temporary Redirect' },
      308: { type: 'redirection', message: 'Permanent Redirect' },

      // 4xx 客户端错误状态码
      400: { type: 'client_error', message: 'Bad Request' },
      401: { type: 'client_error', message: 'Unauthorized' },
      403: { type: 'client_error', message: 'Forbidden' },
      404: { type: 'client_error', message: 'Not Found' },
      405: { type: 'client_error', message: 'Method Not Allowed' },
      409: { type: 'client_error', message: 'Conflict' },
      422: { type: 'client_error', message: 'Unprocessable Entity' },
      429: { type: 'client_error', message: 'Too Many Requests' },

      // 5xx 服务器错误状态码
      500: { type: 'server_error', message: 'Internal Server Error' },
      501: { type: 'server_error', message: 'Not Implemented' },
      502: { type: 'server_error', message: 'Bad Gateway' },
      503: { type: 'server_error', message: 'Service Unavailable' },
      504: { type: 'server_error', message: 'Gateway Timeout' }
    };

    return statusMap[statusCode] || { 
      type: 'unknown', 
      message: 'Unknown Status Code' 
    };
  }

  static isSuccess(statusCode) {
    return statusCode >= 200 && statusCode < 300;
  }

  static isRedirection(statusCode) {
    return statusCode >= 300 && statusCode < 400;
  }

  static isClientError(statusCode) {
    return statusCode >= 400 && statusCode < 500;
  }

  static isServerError(statusCode) {
    return statusCode >= 500 && statusCode < 600;
  }

  static shouldRetry(statusCode) {
    // 可重试的状态码
    const retryableStatus = [408, 429, 500, 502, 503, 504];
    return retryableStatus.includes(statusCode);
  }
}

// 带重试机制的HTTP客户端
class RetryableHTTPClient extends HTTPClient {
  constructor(baseURL, options = {}) {
    super(baseURL);
    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.backoffFactor = options.backoffFactor || 2;
  }

  async requestWithRetry(method, path, data = null, attempt = 1) {
    try {
      return await this[method](path, data);
    } catch (error) {
      const statusCode = error.response?.status;
      
      if (attempt < this.maxRetries && HTTPStatusHandler.shouldRetry(statusCode)) {
        const delay = this.retryDelay * Math.pow(this.backoffFactor, attempt - 1);
        console.log(`Retrying request (attempt ${attempt + 1}) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.requestWithRetry(method, path, data, attempt + 1);
      }
      
      throw error;
    }
  }
}
```

## HTTP头部

### 常用HTTP头部

```javascript
// HTTP头部管理
class HTTPHeaders {
  constructor() {
    this.headers = new Map();
  }

  // 设置通用头部
  setCommonHeaders() {
    this.set('User-Agent', 'MyApp/1.0.0');
    this.set('Accept', 'application/json, text/plain, */*');
    this.set('Accept-Language', 'en-US,en;q=0.9');
    this.set('Accept-Encoding', 'gzip, deflate, br');
    this.set('Connection', 'keep-alive');
    return this;
  }

  // 设置认证头部
  setAuth(token, type = 'Bearer') {
    this.set('Authorization', `${type} ${token}`);
    return this;
  }

  // 设置内容类型
  setContentType(type) {
    const contentTypes = {
      json: 'application/json',
      form: 'application/x-www-form-urlencoded',
      multipart: 'multipart/form-data',
      text: 'text/plain',
      html: 'text/html',
      xml: 'application/xml'
    };
    
    this.set('Content-Type', contentTypes[type] || type);
    return this;
  }

  // 设置缓存控制
  setCacheControl(directive) {
    this.set('Cache-Control', directive);
    return this;
  }

  // 设置CORS头部
  setCORS(origin = '*') {
    this.set('Access-Control-Allow-Origin', origin);
    this.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    this.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return this;
  }

  // 设置安全头部
  setSecurityHeaders() {
    this.set('X-Content-Type-Options', 'nosniff');
    this.set('X-Frame-Options', 'DENY');
    this.set('X-XSS-Protection', '1; mode=block');
    this.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    this.set('Content-Security-Policy', "default-src 'self'");
    return this;
  }

  set(name, value) {
    this.headers.set(name.toLowerCase(), value);
    return this;
  }

  get(name) {
    return this.headers.get(name.toLowerCase());
  }

  delete(name) {
    this.headers.delete(name.toLowerCase());
    return this;
  }

  toObject() {
    return Object.fromEntries(this.headers);
  }

  toString() {
    return Array.from(this.headers.entries())
      .map(([name, value]) => `${name}: ${value}`)
      .join('\r\n');
  }
}

// 使用示例
const headers = new HTTPHeaders()
  .setCommonHeaders()
  .setContentType('json')
  .setAuth('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  .setCacheControl('no-cache');

console.log(headers.toObject());
```

## HTTP版本

### HTTP/1.1 vs HTTP/2 vs HTTP/3

```javascript
// HTTP版本特性比较
class HTTPVersionComparison {
  static getFeatures() {
    return {
      'HTTP/1.1': {
        year: 1997,
        features: [
          '持久连接（Keep-Alive）',
          '管道化（Pipelining）',
          '分块传输编码',
          '缓存控制',
          '内容协商'
        ],
        limitations: [
          '队头阻塞（Head-of-line blocking）',
          '连接数限制',
          '头部冗余',
          '无服务器推送'
        ],
        performance: 'baseline'
      },
      'HTTP/2': {
        year: 2015,
        features: [
          '二进制分帧',
          '多路复用',
          '头部压缩（HPACK）',
          '服务器推送',
          '流优先级'
        ],
        improvements: [
          '解决队头阻塞',
          '减少连接数',
          '降低延迟',
          '提高吞吐量'
        ],
        performance: '2-3x faster'
      },
      'HTTP/3': {
        year: 2022,
        features: [
          '基于QUIC协议',
          '内置加密',
          '连接迁移',
          '0-RTT连接建立',
          '改进的拥塞控制'
        ],
        improvements: [
          '解决TCP队头阻塞',
          '更快的连接建立',
          '更好的移动网络支持',
          '内置安全性'
        ],
        performance: '3-4x faster'
      }
    };
  }

  static detectHTTPVersion(response) {
    // 检测HTTP版本的方法
    if (response.headers.get('alt-svc')?.includes('h3')) {
      return 'HTTP/3';
    }
    
    if (response.httpVersion === '2.0' || response.headers.get(':status')) {
      return 'HTTP/2';
    }
    
    return 'HTTP/1.1';
  }
}

// HTTP/2服务器推送示例（Node.js）
class HTTP2Server {
  constructor() {
    this.http2 = require('http2');
    this.fs = require('fs');
  }

  createServer() {
    const server = this.http2.createSecureServer({
      key: this.fs.readFileSync('private-key.pem'),
      cert: this.fs.readFileSync('certificate.pem')
    });

    server.on('stream', (stream, headers) => {
      const path = headers[':path'];
      
      if (path === '/') {
        // 推送CSS和JS资源
        this.pushResource(stream, '/styles.css', 'text/css');
        this.pushResource(stream, '/script.js', 'application/javascript');
        
        // 发送HTML响应
        stream.respond({
          'content-type': 'text/html; charset=utf-8',
          ':status': 200
        });
        
        stream.end('<html><head><link rel="stylesheet" href="/styles.css"></head><body><script src="/script.js"></script></body></html>');
      }
    });

    return server;
  }

  pushResource(stream, path, contentType) {
    stream.pushStream({ ':path': path }, (err, pushStream) => {
      if (err) throw err;
      
      pushStream.respond({
        'content-type': contentType,
        ':status': 200
      });
      
      this.fs.createReadStream(`.${path}`).pipe(pushStream);
    });
  }
}
```

## HTTPS和SSL/TLS

### HTTPS实现

```javascript
// HTTPS客户端配置
class HTTPSClient {
  constructor(options = {}) {
    this.options = {
      rejectUnauthorized: true, // 验证证书
      checkServerIdentity: true, // 验证服务器身份
      secureProtocol: 'TLSv1_2_method', // TLS版本
      ciphers: 'ECDHE+AESGCM:ECDHE+CHACHA20:DHE+AESGCM:DHE+CHACHA20:!aNULL:!MD5:!DSS',
      ...options
    };
  }

  // 创建安全连接
  async createSecureConnection(hostname, port = 443) {
    const tls = require('tls');
    
    return new Promise((resolve, reject) => {
      const socket = tls.connect(port, hostname, this.options, () => {
        console.log('Secure connection established');
        console.log('Protocol:', socket.getProtocol());
        console.log('Cipher:', socket.getCipher());
        
        // 验证证书
        const cert = socket.getPeerCertificate();
        if (cert) {
          console.log('Certificate subject:', cert.subject);
          console.log('Certificate issuer:', cert.issuer);
          console.log('Valid from:', cert.valid_from);
          console.log('Valid to:', cert.valid_to);
        }
        
        resolve(socket);
      });
      
      socket.on('error', reject);
    });
  }

  // 证书固定（Certificate Pinning）
  validateCertificatePin(cert, expectedFingerprint) {
    const crypto = require('crypto');
    const fingerprint = crypto
      .createHash('sha256')
      .update(cert.raw)
      .digest('hex');
    
    return fingerprint === expectedFingerprint;
  }

  // HSTS（HTTP Strict Transport Security）检查
  checkHSTS(headers) {
    const hstsHeader = headers['strict-transport-security'];
    if (!hstsHeader) {
      console.warn('HSTS header not found');
      return false;
    }
    
    const maxAge = hstsHeader.match(/max-age=(\d+)/);
    const includeSubDomains = hstsHeader.includes('includeSubDomains');
    const preload = hstsHeader.includes('preload');
    
    return {
      maxAge: maxAge ? parseInt(maxAge[1]) : 0,
      includeSubDomains,
      preload
    };
  }
}

// SSL/TLS配置最佳实践
class TLSConfig {
  static getSecureConfig() {
    return {
      // 最小TLS版本
      minVersion: 'TLSv1.2',
      
      // 推荐的密码套件
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-CHACHA20-POLY1305',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384'
      ].join(':'),
      
      // 禁用不安全的协议和算法
      secureOptions: [
        'SSL_OP_NO_SSLv2',
        'SSL_OP_NO_SSLv3',
        'SSL_OP_NO_TLSv1',
        'SSL_OP_NO_TLSv1_1',
        'SSL_OP_CIPHER_SERVER_PREFERENCE'
      ],
      
      // ECDH曲线
      ecdhCurve: 'prime256v1:secp384r1:secp521r1',
      
      // DH参数
      dhparam: 'path/to/dhparam.pem'
    };
  }

  static generateCSR(commonName, organization) {
    const forge = require('node-forge');
    
    // 生成密钥对
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // 创建证书签名请求
    const csr = forge.pki.createCertificationRequest();
    csr.publicKey = keys.publicKey;
    
    csr.setSubject([{
      name: 'commonName',
      value: commonName
    }, {
      name: 'organizationName',
      value: organization
    }]);
    
    // 签名CSR
    csr.sign(keys.privateKey);
    
    return {
      csr: forge.pki.certificationRequestToPem(csr),
      privateKey: forge.pki.privateKeyToPem(keys.privateKey)
    };
  }
}
```

## HTTP缓存

### 缓存策略实现

```javascript
// HTTP缓存管理
class HTTPCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // 最大缓存条目数
    this.defaultTTL = 300000; // 默认5分钟TTL
  }

  // 生成缓存键
  generateKey(url, method = 'GET', headers = {}) {
    const key = `${method}:${url}`;
    const varyHeaders = headers.vary?.split(',').map(h => h.trim()) || [];
    
    if (varyHeaders.length > 0) {
      const varyValues = varyHeaders.map(h => headers[h.toLowerCase()] || '').join(':');
      return `${key}:${varyValues}`;
    }
    
    return key;
  }

  // 解析Cache-Control头
  parseCacheControl(cacheControl) {
    const directives = {};
    
    if (!cacheControl) return directives;
    
    cacheControl.split(',').forEach(directive => {
      const [key, value] = directive.trim().split('=');
      directives[key] = value ? parseInt(value) : true;
    });
    
    return directives;
  }

  // 检查缓存是否有效
  isValid(entry) {
    const now = Date.now();
    
    // 检查TTL
    if (entry.expiresAt && now > entry.expiresAt) {
      return false;
    }
    
    // 检查max-age
    if (entry.cacheControl['max-age']) {
      const maxAge = entry.cacheControl['max-age'] * 1000;
      if (now - entry.timestamp > maxAge) {
        return false;
      }
    }
    
    return true;
  }

  // 存储响应到缓存
  store(url, method, headers, response) {
    const cacheControl = this.parseCacheControl(headers['cache-control']);
    
    // 检查是否可缓存
    if (cacheControl['no-store'] || cacheControl['private']) {
      return;
    }
    
    const key = this.generateKey(url, method, headers);
    const now = Date.now();
    
    let expiresAt = null;
    if (headers.expires) {
      expiresAt = new Date(headers.expires).getTime();
    } else if (cacheControl['max-age']) {
      expiresAt = now + (cacheControl['max-age'] * 1000);
    } else {
      expiresAt = now + this.defaultTTL;
    }
    
    const entry = {
      response: this.cloneResponse(response),
      headers,
      timestamp: now,
      expiresAt,
      cacheControl,
      etag: headers.etag,
      lastModified: headers['last-modified']
    };
    
    // 清理过期缓存
    this.cleanup();
    
    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, entry);
  }

  // 从缓存获取响应
  get(url, method = 'GET', headers = {}) {
    const key = this.generateKey(url, method, headers);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // 检查缓存是否仍然有效
    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }
    
    // 检查条件请求
    if (this.shouldRevalidate(entry, headers)) {
      return { type: 'revalidate', entry };
    }
    
    return { type: 'hit', response: this.cloneResponse(entry.response) };
  }

  // 检查是否需要重新验证
  shouldRevalidate(entry, requestHeaders) {
    const cacheControl = this.parseCacheControl(requestHeaders['cache-control']);
    
    // 强制重新验证
    if (cacheControl['no-cache'] || cacheControl['max-age'] === 0) {
      return true;
    }
    
    // 检查If-None-Match
    if (requestHeaders['if-none-match'] && entry.etag) {
      return requestHeaders['if-none-match'] !== entry.etag;
    }
    
    // 检查If-Modified-Since
    if (requestHeaders['if-modified-since'] && entry.lastModified) {
      const ifModifiedSince = new Date(requestHeaders['if-modified-since']);
      const lastModified = new Date(entry.lastModified);
      return lastModified > ifModifiedSince;
    }
    
    return false;
  }

  // 清理过期缓存
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        this.cache.delete(key);
      }
    }
  }

  // 克隆响应对象
  cloneResponse(response) {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: { ...response.headers },
      data: response.data
    };
  }

  // 清空缓存
  clear() {
    this.cache.clear();
  }

  // 获取缓存统计
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys())
    };
  }
}

// 使用示例
const cache = new HTTPCache();

// 带缓存的HTTP客户端
class CachedHTTPClient extends HTTPClient {
  constructor(baseURL) {
    super(baseURL);
    this.cache = new HTTPCache();
  }

  async get(path, params = {}, options = {}) {
    const url = `${this.baseURL}${path}`;
    const cacheResult = this.cache.get(url, 'GET', options.headers || {});
    
    if (cacheResult?.type === 'hit') {
      console.log('Cache hit for:', url);
      return cacheResult.response;
    }
    
    // 添加条件请求头
    const headers = { ...options.headers };
    if (cacheResult?.type === 'revalidate') {
      if (cacheResult.entry.etag) {
        headers['If-None-Match'] = cacheResult.entry.etag;
      }
      if (cacheResult.entry.lastModified) {
        headers['If-Modified-Since'] = cacheResult.entry.lastModified;
      }
    }
    
    try {
      const response = await super.get(path, params);
      
      // 存储到缓存
      this.cache.store(url, 'GET', response.headers, response);
      
      return response;
    } catch (error) {
      // 如果是304 Not Modified，返回缓存的响应
      if (error.status === 304 && cacheResult?.entry) {
        console.log('304 Not Modified, using cached response');
        return this.cache.cloneResponse(cacheResult.entry.response);
      }
      throw error;
    }
  }
}
```

## 性能优化

### HTTP性能最佳实践

```javascript
// HTTP性能优化工具
class HTTPPerformanceOptimizer {
  // 连接池管理
  static createConnectionPool(options = {}) {
    return {
      maxSockets: options.maxSockets || 10,
      maxFreeSockets: options.maxFreeSockets || 5,
      timeout: options.timeout || 30000,
      keepAlive: true,
      keepAliveMsecs: options.keepAliveMsecs || 1000
    };
  }

  // 请求合并
  static createRequestBatcher() {
    const pendingRequests = new Map();
    
    return {
      batch(key, requestFn) {
        if (pendingRequests.has(key)) {
          return pendingRequests.get(key);
        }
        
        const promise = requestFn().finally(() => {
          pendingRequests.delete(key);
        });
        
        pendingRequests.set(key, promise);
        return promise;
      }
    };
  }

  // 压缩支持
  static getCompressionHeaders() {
    return {
      'Accept-Encoding': 'gzip, deflate, br'
    };
  }

  // 资源预加载
  static preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.url;
      link.as = resource.type;
      
      if (resource.crossorigin) {
        link.crossOrigin = resource.crossorigin;
      }
      
      document.head.appendChild(link);
    });
  }

  // DNS预解析
  static prefetchDNS(domains) {
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });
  }

  // 连接预热
  static preconnect(origins) {
    origins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      document.head.appendChild(link);
    });
  }
}

// 性能监控
class HTTPPerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: 0,
      responses: 0,
      errors: 0,
      totalTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  startRequest(url) {
    const startTime = performance.now();
    this.metrics.requests++;
    
    return {
      url,
      startTime,
      end: (success = true, fromCache = false) => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.totalTime += duration;
        
        if (success) {
          this.metrics.responses++;
          if (fromCache) {
            this.metrics.cacheHits++;
          } else {
            this.metrics.cacheMisses++;
          }
        } else {
          this.metrics.errors++;
        }
        
        console.log(`${url}: ${duration.toFixed(2)}ms ${fromCache ? '(cached)' : ''}`);
      }
    };
  }

  getStats() {
    const avgResponseTime = this.metrics.responses > 0 
      ? this.metrics.totalTime / this.metrics.responses 
      : 0;
    
    const cacheHitRate = (this.metrics.cacheHits + this.metrics.cacheMisses) > 0
      ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
      : 0;
    
    return {
      ...this.metrics,
      avgResponseTime: avgResponseTime.toFixed(2),
      cacheHitRate: (cacheHitRate * 100).toFixed(2) + '%',
      errorRate: ((this.metrics.errors / this.metrics.requests) * 100).toFixed(2) + '%'
    };
  }

  reset() {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = 0;
    });
  }
}
```

---

HTTP/HTTPS是现代Web应用的基础协议，理解其工作原理、特性和最佳实践对于构建高性能、安全的Web应用至关重要。随着HTTP/3的普及，Web性能将得到进一步提升。