# 微服务负载均衡

## 简介

负载均衡是微服务架构中的关键组件，它将客户端请求分发到多个服务实例上，以提高系统的可用性、性能和可扩展性。在微服务环境中，负载均衡不仅要处理外部流量，还要管理服务间的内部通信。

### 核心特性

- **流量分发**：将请求均匀分配到多个服务实例
- **健康检查**：自动检测和剔除不健康的服务实例
- **故障转移**：当某个实例失败时自动切换到其他实例
- **会话保持**：确保来自同一客户端的请求路由到同一实例
- **动态配置**：支持运行时添加或移除服务实例
- **性能监控**：实时监控各实例的性能指标

### 适用场景

- 高并发 Web 应用
- 微服务架构系统
- API 网关场景
- 数据库读写分离
- 缓存集群管理
- 容器化部署环境

## 负载均衡算法

### 1. 轮询（Round Robin）

按顺序将请求分配给每个服务实例。

```javascript
// 轮询负载均衡器
class RoundRobinLoadBalancer {
  constructor() {
    this.currentIndex = 0;
    this.servers = [];
  }
  
  addServer(server) {
    this.servers.push({
      ...server,
      id: server.id || `${server.host}:${server.port}`,
      weight: server.weight || 1,
      status: 'healthy'
    });
  }
  
  removeServer(serverId) {
    this.servers = this.servers.filter(server => server.id !== serverId);
  }
  
  selectServer() {
    const healthyServers = this.servers.filter(server => server.status === 'healthy');
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }
    
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
    
    return server;
  }
  
  markServerUnhealthy(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.status = 'unhealthy';
      server.lastFailure = Date.now();
    }
  }
  
  markServerHealthy(serverId) {
    const server = this.servers.find(s => s.id === serverId);
    if (server) {
      server.status = 'healthy';
      delete server.lastFailure;
    }
  }
}

// 使用示例
const loadBalancer = new RoundRobinLoadBalancer();

// 添加服务器
loadBalancer.addServer({ host: '192.168.1.10', port: 8080 });
loadBalancer.addServer({ host: '192.168.1.11', port: 8080 });
loadBalancer.addServer({ host: '192.168.1.12', port: 8080 });

// 选择服务器
for (let i = 0; i < 6; i++) {
  const server = loadBalancer.selectServer();
  console.log(`Request ${i + 1} -> ${server.host}:${server.port}`);
}
```

### 2. 加权轮询（Weighted Round Robin）

根据服务器的权重分配请求，权重高的服务器获得更多请求。

```javascript
// 加权轮询负载均衡器
class WeightedRoundRobinLoadBalancer {
  constructor() {
    this.servers = [];
    this.currentWeights = new Map();
  }
  
  addServer(server) {
    const serverConfig = {
      ...server,
      id: server.id || `${server.host}:${server.port}`,
      weight: server.weight || 1,
      status: 'healthy'
    };
    
    this.servers.push(serverConfig);
    this.currentWeights.set(serverConfig.id, 0);
  }
  
  selectServer() {
    const healthyServers = this.servers.filter(server => server.status === 'healthy');
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }
    
    // 计算总权重
    const totalWeight = healthyServers.reduce((sum, server) => sum + server.weight, 0);
    
    // 更新当前权重
    healthyServers.forEach(server => {
      const currentWeight = this.currentWeights.get(server.id) + server.weight;
      this.currentWeights.set(server.id, currentWeight);
    });
    
    // 选择权重最高的服务器
    let selectedServer = null;
    let maxWeight = -1;
    
    healthyServers.forEach(server => {
      const currentWeight = this.currentWeights.get(server.id);
      if (currentWeight > maxWeight) {
        maxWeight = currentWeight;
        selectedServer = server;
      }
    });
    
    // 减少选中服务器的权重
    if (selectedServer) {
      const newWeight = this.currentWeights.get(selectedServer.id) - totalWeight;
      this.currentWeights.set(selectedServer.id, newWeight);
    }
    
    return selectedServer;
  }
}

// 使用示例
const weightedLB = new WeightedRoundRobinLoadBalancer();

// 添加不同权重的服务器
weightedLB.addServer({ host: '192.168.1.10', port: 8080, weight: 3 }); // 高性能服务器
weightedLB.addServer({ host: '192.168.1.11', port: 8080, weight: 2 }); // 中等性能服务器
weightedLB.addServer({ host: '192.168.1.12', port: 8080, weight: 1 }); // 低性能服务器

// 测试权重分配
const distribution = {};
for (let i = 0; i < 60; i++) {
  const server = weightedLB.selectServer();
  const key = `${server.host}:${server.port}`;
  distribution[key] = (distribution[key] || 0) + 1;
}

console.log('Request distribution:', distribution);
```

### 3. 最少连接（Least Connections）

将请求分配给当前连接数最少的服务器。

```javascript
// 最少连接负载均衡器
class LeastConnectionsLoadBalancer {
  constructor() {
    this.servers = [];
    this.connections = new Map();
  }
  
  addServer(server) {
    const serverConfig = {
      ...server,
      id: server.id || `${server.host}:${server.port}`,
      status: 'healthy'
    };
    
    this.servers.push(serverConfig);
    this.connections.set(serverConfig.id, 0);
  }
  
  selectServer() {
    const healthyServers = this.servers.filter(server => server.status === 'healthy');
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }
    
    // 找到连接数最少的服务器
    let selectedServer = null;
    let minConnections = Infinity;
    
    healthyServers.forEach(server => {
      const connectionCount = this.connections.get(server.id);
      if (connectionCount < minConnections) {
        minConnections = connectionCount;
        selectedServer = server;
      }
    });
    
    // 增加连接计数
    if (selectedServer) {
      const currentConnections = this.connections.get(selectedServer.id);
      this.connections.set(selectedServer.id, currentConnections + 1);
    }
    
    return selectedServer;
  }
  
  releaseConnection(serverId) {
    const currentConnections = this.connections.get(serverId);
    if (currentConnections > 0) {
      this.connections.set(serverId, currentConnections - 1);
    }
  }
  
  getConnectionCount(serverId) {
    return this.connections.get(serverId) || 0;
  }
}

// 使用示例
const leastConnLB = new LeastConnectionsLoadBalancer();

// 添加服务器
leastConnLB.addServer({ host: '192.168.1.10', port: 8080 });
leastConnLB.addServer({ host: '192.168.1.11', port: 8080 });
leastConnLB.addServer({ host: '192.168.1.12', port: 8080 });

// 模拟请求处理
class RequestHandler {
  constructor(loadBalancer) {
    this.loadBalancer = loadBalancer;
  }
  
  async handleRequest(requestId) {
    const server = this.loadBalancer.selectServer();
    console.log(`Request ${requestId} -> ${server.host}:${server.port}`);
    
    try {
      // 模拟请求处理时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      
      // 释放连接
      this.loadBalancer.releaseConnection(server.id);
      console.log(`Request ${requestId} completed`);
    } catch (error) {
      this.loadBalancer.releaseConnection(server.id);
      console.error(`Request ${requestId} failed:`, error);
    }
  }
}
```

### 4. 一致性哈希（Consistent Hashing）

使用哈希算法确保相同的请求总是路由到同一个服务器。

```javascript
// 一致性哈希负载均衡器
class ConsistentHashLoadBalancer {
  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
    this.ring = new Map();
    this.servers = new Map();
  }
  
  // 简单哈希函数
  hash(key) {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }
  
  addServer(server) {
    const serverId = server.id || `${server.host}:${server.port}`;
    const serverConfig = {
      ...server,
      id: serverId,
      status: 'healthy'
    };
    
    this.servers.set(serverId, serverConfig);
    
    // 为每个服务器创建虚拟节点
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${serverId}:${i}`;
      const hash = this.hash(virtualKey);
      this.ring.set(hash, serverId);
    }
    
    // 对哈希环进行排序
    this.sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }
  
  removeServer(serverId) {
    this.servers.delete(serverId);
    
    // 移除虚拟节点
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${serverId}:${i}`;
      const hash = this.hash(virtualKey);
      this.ring.delete(hash);
    }
    
    this.sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }
  
  selectServer(key) {
    if (this.sortedHashes.length === 0) {
      throw new Error('No servers available');
    }
    
    const hash = this.hash(key);
    
    // 找到第一个大于等于该哈希值的节点
    let index = this.binarySearch(hash);
    
    // 如果没找到，使用第一个节点（环形结构）
    if (index === -1) {
      index = 0;
    }
    
    const serverHash = this.sortedHashes[index];
    const serverId = this.ring.get(serverHash);
    const server = this.servers.get(serverId);
    
    // 检查服务器健康状态
    if (server && server.status === 'healthy') {
      return server;
    }
    
    // 如果选中的服务器不健康，寻找下一个健康的服务器
    return this.findNextHealthyServer(index);
  }
  
  binarySearch(target) {
    let left = 0;
    let right = this.sortedHashes.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midValue = this.sortedHashes[mid];
      
      if (midValue === target) {
        return mid;
      } else if (midValue < target) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return left < this.sortedHashes.length ? left : -1;
  }
  
  findNextHealthyServer(startIndex) {
    for (let i = 0; i < this.sortedHashes.length; i++) {
      const index = (startIndex + i) % this.sortedHashes.length;
      const serverHash = this.sortedHashes[index];
      const serverId = this.ring.get(serverHash);
      const server = this.servers.get(serverId);
      
      if (server && server.status === 'healthy') {
        return server;
      }
    }
    
    throw new Error('No healthy servers available');
  }
}

// 使用示例
const consistentHashLB = new ConsistentHashLoadBalancer();

// 添加服务器
consistentHashLB.addServer({ host: '192.168.1.10', port: 8080 });
consistentHashLB.addServer({ host: '192.168.1.11', port: 8080 });
consistentHashLB.addServer({ host: '192.168.1.12', port: 8080 });

// 测试一致性
const testKeys = ['user:1001', 'user:1002', 'user:1003', 'session:abc123', 'session:def456'];

console.log('Initial routing:');
testKeys.forEach(key => {
  const server = consistentHashLB.selectServer(key);
  console.log(`${key} -> ${server.host}:${server.port}`);
});

// 移除一个服务器，测试一致性
consistentHashLB.removeServer('192.168.1.11:8080');

console.log('\nAfter removing server:');
testKeys.forEach(key => {
  const server = consistentHashLB.selectServer(key);
  console.log(`${key} -> ${server.host}:${server.port}`);
});
```

### 5. IP 哈希（IP Hash）

基于客户端 IP 地址进行哈希，确保同一客户端的请求总是路由到同一服务器。

```javascript
// IP 哈希负载均衡器
class IPHashLoadBalancer {
  constructor() {
    this.servers = [];
  }
  
  addServer(server) {
    this.servers.push({
      ...server,
      id: server.id || `${server.host}:${server.port}`,
      status: 'healthy'
    });
  }
  
  hash(ip) {
    // 将 IP 地址转换为数字
    const parts = ip.split('.');
    return parts.reduce((acc, part, index) => {
      return acc + (parseInt(part) * Math.pow(256, 3 - index));
    }, 0);
  }
  
  selectServer(clientIP) {
    const healthyServers = this.servers.filter(server => server.status === 'healthy');
    
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }
    
    const hash = this.hash(clientIP);
    const index = hash % healthyServers.length;
    
    return healthyServers[index];
  }
}

// 使用示例
const ipHashLB = new IPHashLoadBalancer();

// 添加服务器
ipHashLB.addServer({ host: '192.168.1.10', port: 8080 });
ipHashLB.addServer({ host: '192.168.1.11', port: 8080 });
ipHashLB.addServer({ host: '192.168.1.12', port: 8080 });

// 测试 IP 哈希
const clientIPs = ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.1', '10.0.0.2'];

clientIPs.forEach(ip => {
  const server = ipHashLB.selectServer(ip);
  console.log(`Client ${ip} -> ${server.host}:${server.port}`);
});
```

## 健康检查机制

### 1. HTTP 健康检查

```javascript
// HTTP 健康检查器
class HTTPHealthChecker {
  constructor(options = {}) {
    this.interval = options.interval || 30000; // 30秒
    this.timeout = options.timeout || 5000; // 5秒
    this.healthPath = options.healthPath || '/health';
    this.unhealthyThreshold = options.unhealthyThreshold || 3;
    this.healthyThreshold = options.healthyThreshold || 2;
    
    this.serverStates = new Map();
    this.checkIntervals = new Map();
  }
  
  addServer(server, loadBalancer) {
    const serverId = server.id;
    
    this.serverStates.set(serverId, {
      server,
      loadBalancer,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
      lastCheck: null,
      status: 'unknown'
    });
    
    // 开始健康检查
    this.startHealthCheck(serverId);
  }
  
  removeServer(serverId) {
    this.stopHealthCheck(serverId);
    this.serverStates.delete(serverId);
  }
  
  startHealthCheck(serverId) {
    const intervalId = setInterval(() => {
      this.checkServerHealth(serverId);
    }, this.interval);
    
    this.checkIntervals.set(serverId, intervalId);
    
    // 立即执行一次检查
    this.checkServerHealth(serverId);
  }
  
  stopHealthCheck(serverId) {
    const intervalId = this.checkIntervals.get(serverId);
    if (intervalId) {
      clearInterval(intervalId);
      this.checkIntervals.delete(serverId);
    }
  }
  
  async checkServerHealth(serverId) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    const { server, loadBalancer } = state;
    const healthUrl = `http://${server.host}:${server.port}${this.healthPath}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'LoadBalancer-HealthChecker/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        this.handleHealthCheckSuccess(serverId, loadBalancer);
      } else {
        this.handleHealthCheckFailure(serverId, loadBalancer, `HTTP ${response.status}`);
      }
    } catch (error) {
      this.handleHealthCheckFailure(serverId, loadBalancer, error.message);
    }
    
    state.lastCheck = new Date();
  }
  
  handleHealthCheckSuccess(serverId, loadBalancer) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    state.consecutiveFailures = 0;
    state.consecutiveSuccesses++;
    
    // 如果服务器之前是不健康的，检查是否可以标记为健康
    if (state.status === 'unhealthy' && 
        state.consecutiveSuccesses >= this.healthyThreshold) {
      state.status = 'healthy';
      loadBalancer.markServerHealthy(serverId);
      console.log(`Server ${serverId} marked as healthy`);
    } else if (state.status === 'unknown') {
      state.status = 'healthy';
      loadBalancer.markServerHealthy(serverId);
      console.log(`Server ${serverId} initial health check passed`);
    }
  }
  
  handleHealthCheckFailure(serverId, loadBalancer, error) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    state.consecutiveSuccesses = 0;
    state.consecutiveFailures++;
    
    console.warn(`Health check failed for ${serverId}: ${error}`);
    
    // 如果连续失败次数达到阈值，标记为不健康
    if (state.consecutiveFailures >= this.unhealthyThreshold) {
      if (state.status !== 'unhealthy') {
        state.status = 'unhealthy';
        loadBalancer.markServerUnhealthy(serverId);
        console.error(`Server ${serverId} marked as unhealthy`);
      }
    }
  }
  
  getServerStatus(serverId) {
    const state = this.serverStates.get(serverId);
    return state ? {
      status: state.status,
      consecutiveFailures: state.consecutiveFailures,
      consecutiveSuccesses: state.consecutiveSuccesses,
      lastCheck: state.lastCheck
    } : null;
  }
  
  getAllServerStatuses() {
    const statuses = {};
    this.serverStates.forEach((state, serverId) => {
      statuses[serverId] = this.getServerStatus(serverId);
    });
    return statuses;
  }
}

// 使用示例
const loadBalancer = new RoundRobinLoadBalancer();
const healthChecker = new HTTPHealthChecker({
  interval: 10000, // 10秒检查一次
  timeout: 3000,   // 3秒超时
  healthPath: '/health',
  unhealthyThreshold: 2,
  healthyThreshold: 1
});

// 添加服务器
const servers = [
  { host: '192.168.1.10', port: 8080 },
  { host: '192.168.1.11', port: 8080 },
  { host: '192.168.1.12', port: 8080 }
];

servers.forEach(server => {
  loadBalancer.addServer(server);
  healthChecker.addServer(server, loadBalancer);
});

// 定期打印服务器状态
setInterval(() => {
  console.log('Server statuses:', healthChecker.getAllServerStatuses());
}, 30000);
```

### 2. TCP 健康检查

```javascript
// TCP 健康检查器
const net = require('net');

class TCPHealthChecker {
  constructor(options = {}) {
    this.interval = options.interval || 30000;
    this.timeout = options.timeout || 5000;
    this.serverStates = new Map();
    this.checkIntervals = new Map();
  }
  
  addServer(server, loadBalancer) {
    const serverId = server.id;
    
    this.serverStates.set(serverId, {
      server,
      loadBalancer,
      consecutiveFailures: 0,
      status: 'unknown'
    });
    
    this.startHealthCheck(serverId);
  }
  
  startHealthCheck(serverId) {
    const intervalId = setInterval(() => {
      this.checkServerHealth(serverId);
    }, this.interval);
    
    this.checkIntervals.set(serverId, intervalId);
    this.checkServerHealth(serverId);
  }
  
  async checkServerHealth(serverId) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    const { server, loadBalancer } = state;
    
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let isResolved = false;
      
      const cleanup = () => {
        if (!isResolved) {
          isResolved = true;
          socket.destroy();
        }
      };
      
      const timeout = setTimeout(() => {
        cleanup();
        this.handleHealthCheckFailure(serverId, loadBalancer, 'Connection timeout');
        resolve(false);
      }, this.timeout);
      
      socket.connect(server.port, server.host, () => {
        clearTimeout(timeout);
        cleanup();
        this.handleHealthCheckSuccess(serverId, loadBalancer);
        resolve(true);
      });
      
      socket.on('error', (error) => {
        clearTimeout(timeout);
        cleanup();
        this.handleHealthCheckFailure(serverId, loadBalancer, error.message);
        resolve(false);
      });
    });
  }
  
  handleHealthCheckSuccess(serverId, loadBalancer) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    state.consecutiveFailures = 0;
    
    if (state.status !== 'healthy') {
      state.status = 'healthy';
      loadBalancer.markServerHealthy(serverId);
      console.log(`TCP health check: Server ${serverId} is healthy`);
    }
  }
  
  handleHealthCheckFailure(serverId, loadBalancer, error) {
    const state = this.serverStates.get(serverId);
    if (!state) return;
    
    state.consecutiveFailures++;
    
    if (state.consecutiveFailures >= 3 && state.status !== 'unhealthy') {
      state.status = 'unhealthy';
      loadBalancer.markServerUnhealthy(serverId);
      console.error(`TCP health check: Server ${serverId} is unhealthy - ${error}`);
    }
  }
}
```

## 会话保持（Session Affinity）

### 1. Cookie 会话保持

```javascript
// Cookie 会话保持负载均衡器
class SessionAffinityLoadBalancer {
  constructor(baseLoadBalancer) {
    this.baseLoadBalancer = baseLoadBalancer;
    this.sessionMap = new Map(); // sessionId -> serverId
    this.cookieName = 'JSESSIONID';
    this.sessionTimeout = 30 * 60 * 1000; // 30分钟
  }
  
  selectServer(request) {
    const sessionId = this.extractSessionId(request);
    
    if (sessionId) {
      // 检查会话是否存在且未过期
      const sessionInfo = this.sessionMap.get(sessionId);
      
      if (sessionInfo && !this.isSessionExpired(sessionInfo)) {
        const server = this.baseLoadBalancer.servers.find(s => 
          s.id === sessionInfo.serverId && s.status === 'healthy'
        );
        
        if (server) {
          // 更新会话访问时间
          sessionInfo.lastAccess = Date.now();
          return {
            server,
            sessionId,
            isNewSession: false
          };
        } else {
          // 原服务器不可用，移除会话映射
          this.sessionMap.delete(sessionId);
        }
      }
    }
    
    // 新会话或原服务器不可用，选择新服务器
    const server = this.baseLoadBalancer.selectServer();
    const newSessionId = sessionId || this.generateSessionId();
    
    // 创建新的会话映射
    this.sessionMap.set(newSessionId, {
      serverId: server.id,
      createdAt: Date.now(),
      lastAccess: Date.now()
    });
    
    return {
      server,
      sessionId: newSessionId,
      isNewSession: true
    };
  }
  
  extractSessionId(request) {
    // 从 Cookie 中提取会话 ID
    const cookies = request.headers.cookie;
    if (!cookies) return null;
    
    const cookieMatch = cookies.match(new RegExp(`${this.cookieName}=([^;]+)`));
    return cookieMatch ? cookieMatch[1] : null;
  }
  
  generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
  
  isSessionExpired(sessionInfo) {
    return (Date.now() - sessionInfo.lastAccess) > this.sessionTimeout;
  }
  
  cleanupExpiredSessions() {
    const now = Date.now();
    const expiredSessions = [];
    
    this.sessionMap.forEach((sessionInfo, sessionId) => {
      if ((now - sessionInfo.lastAccess) > this.sessionTimeout) {
        expiredSessions.push(sessionId);
      }
    });
    
    expiredSessions.forEach(sessionId => {
      this.sessionMap.delete(sessionId);
    });
    
    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }
  
  getSessionStats() {
    return {
      totalSessions: this.sessionMap.size,
      activeSessions: Array.from(this.sessionMap.values()).filter(
        session => !this.isSessionExpired(session)
      ).length
    };
  }
}

// 使用示例
const baseLB = new RoundRobinLoadBalancer();
const sessionLB = new SessionAffinityLoadBalancer(baseLB);

// 添加服务器
sessionLB.baseLoadBalancer.addServer({ host: '192.168.1.10', port: 8080 });
sessionLB.baseLoadBalancer.addServer({ host: '192.168.1.11', port: 8080 });
sessionLB.baseLoadBalancer.addServer({ host: '192.168.1.12', port: 8080 });

// 定期清理过期会话
setInterval(() => {
  sessionLB.cleanupExpiredSessions();
}, 5 * 60 * 1000); // 每5分钟清理一次

// Express.js 中间件示例
function loadBalancerMiddleware(req, res, next) {
  const result = sessionLB.selectServer(req);
  
  // 设置会话 Cookie
  if (result.isNewSession) {
    res.cookie(sessionLB.cookieName, result.sessionId, {
      maxAge: sessionLB.sessionTimeout,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }
  
  // 将选中的服务器信息添加到请求对象
  req.targetServer = result.server;
  req.sessionId = result.sessionId;
  
  next();
}
```

## 动态配置和服务发现集成

### 1. 与 Consul 集成

```javascript
// Consul 集成的动态负载均衡器
class ConsulLoadBalancer {
  constructor(consulClient, serviceName) {
    this.consul = consulClient;
    this.serviceName = serviceName;
    this.loadBalancer = new WeightedRoundRobinLoadBalancer();
    this.healthChecker = new HTTPHealthChecker();
    
    this.startServiceWatch();
  }
  
  async startServiceWatch() {
    // 初始加载服务实例
    await this.updateServiceInstances();
    
    // 监听服务变化
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: this.serviceName,
        passing: true
      }
    });
    
    watch.on('change', (data) => {
      this.handleServiceChange(data);
    });
    
    watch.on('error', (error) => {
      console.error('Consul watch error:', error);
    });
  }
  
  async updateServiceInstances() {
    try {
      const services = await this.consul.health.service({
        service: this.serviceName,
        passing: true
      });
      
      const instances = services.map(service => ({
        id: service.Service.ID,
        host: service.Service.Address,
        port: service.Service.Port,
        weight: parseInt(service.Service.Meta?.weight || '1'),
        tags: service.Service.Tags || []
      }));
      
      this.syncInstances(instances);
    } catch (error) {
      console.error('Failed to update service instances:', error);
    }
  }
  
  handleServiceChange(data) {
    const instances = data.map(service => ({
      id: service.Service.ID,
      host: service.Service.Address,
      port: service.Service.Port,
      weight: parseInt(service.Service.Meta?.weight || '1'),
      tags: service.Service.Tags || []
    }));
    
    this.syncInstances(instances);
    console.log(`Service instances updated: ${instances.length} instances`);
  }
  
  syncInstances(newInstances) {
    // 获取当前实例
    const currentInstances = new Set(this.loadBalancer.servers.map(s => s.id));
    const newInstanceIds = new Set(newInstances.map(i => i.id));
    
    // 移除不存在的实例
    currentInstances.forEach(instanceId => {
      if (!newInstanceIds.has(instanceId)) {
        this.loadBalancer.removeServer(instanceId);
        this.healthChecker.removeServer(instanceId);
        console.log(`Removed instance: ${instanceId}`);
      }
    });
    
    // 添加新实例
    newInstances.forEach(instance => {
      if (!currentInstances.has(instance.id)) {
        this.loadBalancer.addServer(instance);
        this.healthChecker.addServer(instance, this.loadBalancer);
        console.log(`Added instance: ${instance.id}`);
      }
    });
  }
  
  selectServer(request) {
    return this.loadBalancer.selectServer();
  }
  
  getStats() {
    return {
      serviceName: this.serviceName,
      totalInstances: this.loadBalancer.servers.length,
      healthyInstances: this.loadBalancer.servers.filter(s => s.status === 'healthy').length,
      serverStatuses: this.healthChecker.getAllServerStatuses()
    };
  }
}
```

### 2. 配置热更新

```javascript
// 支持配置热更新的负载均衡器
class ConfigurableLoadBalancer {
  constructor(initialConfig) {
    this.config = initialConfig;
    this.loadBalancer = this.createLoadBalancer(initialConfig.algorithm);
    this.healthChecker = new HTTPHealthChecker(initialConfig.healthCheck);
    
    this.setupConfigWatch();
  }
  
  createLoadBalancer(algorithm) {
    switch (algorithm) {
      case 'round-robin':
        return new RoundRobinLoadBalancer();
      case 'weighted-round-robin':
        return new WeightedRoundRobinLoadBalancer();
      case 'least-connections':
        return new LeastConnectionsLoadBalancer();
      case 'consistent-hash':
        return new ConsistentHashLoadBalancer();
      case 'ip-hash':
        return new IPHashLoadBalancer();
      default:
        return new RoundRobinLoadBalancer();
    }
  }
  
  setupConfigWatch() {
    // 监听配置文件变化
    const fs = require('fs');
    const configFile = './load-balancer-config.json';
    
    fs.watchFile(configFile, (curr, prev) => {
      console.log('Configuration file changed, reloading...');
      this.reloadConfig(configFile);
    });
  }
  
  async reloadConfig(configFile) {
    try {
      const fs = require('fs').promises;
      const configData = await fs.readFile(configFile, 'utf8');
      const newConfig = JSON.parse(configData);
      
      await this.updateConfig(newConfig);
      console.log('Configuration reloaded successfully');
    } catch (error) {
      console.error('Failed to reload configuration:', error);
    }
  }
  
  async updateConfig(newConfig) {
    // 检查是否需要更换负载均衡算法
    if (newConfig.algorithm !== this.config.algorithm) {
      const oldServers = this.loadBalancer.servers || [];
      this.loadBalancer = this.createLoadBalancer(newConfig.algorithm);
      
      // 迁移服务器配置
      oldServers.forEach(server => {
        this.loadBalancer.addServer(server);
      });
      
      console.log(`Load balancing algorithm changed to: ${newConfig.algorithm}`);
    }
    
    // 更新健康检查配置
    if (JSON.stringify(newConfig.healthCheck) !== JSON.stringify(this.config.healthCheck)) {
      // 重新创建健康检查器
      const oldStates = this.healthChecker.getAllServerStatuses();
      this.healthChecker = new HTTPHealthChecker(newConfig.healthCheck);
      
      // 重新添加服务器到健康检查器
      this.loadBalancer.servers.forEach(server => {
        this.healthChecker.addServer(server, this.loadBalancer);
      });
      
      console.log('Health check configuration updated');
    }
    
    // 更新服务器列表
    if (newConfig.servers) {
      this.updateServerList(newConfig.servers);
    }
    
    this.config = newConfig;
  }
  
  updateServerList(newServers) {
    const currentServers = new Set(this.loadBalancer.servers.map(s => s.id));
    const newServerIds = new Set(newServers.map(s => s.id || `${s.host}:${s.port}`));
    
    // 移除不存在的服务器
    currentServers.forEach(serverId => {
      if (!newServerIds.has(serverId)) {
        this.loadBalancer.removeServer(serverId);
        this.healthChecker.removeServer(serverId);
      }
    });
    
    // 添加新服务器
    newServers.forEach(server => {
      const serverId = server.id || `${server.host}:${server.port}`;
      if (!currentServers.has(serverId)) {
        this.loadBalancer.addServer(server);
        this.healthChecker.addServer(server, this.loadBalancer);
      }
    });
  }
}

// 配置文件示例 (load-balancer-config.json)
const exampleConfig = {
  algorithm: 'weighted-round-robin',
  healthCheck: {
    interval: 30000,
    timeout: 5000,
    healthPath: '/health',
    unhealthyThreshold: 3,
    healthyThreshold: 2
  },
  servers: [
    { host: '192.168.1.10', port: 8080, weight: 3 },
    { host: '192.168.1.11', port: 8080, weight: 2 },
    { host: '192.168.1.12', port: 8080, weight: 1 }
  ]
};
```

## 性能监控和指标

### 1. 负载均衡器指标收集

```javascript
// 负载均衡器指标收集器
class LoadBalancerMetrics {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimeSum: 0,
      serverMetrics: new Map(),
      requestsPerSecond: 0,
      averageResponseTime: 0
    };
    
    this.requestHistory = [];
    this.startMetricsCollection();
  }
  
  recordRequest(serverId, responseTime, success = true) {
    const now = Date.now();
    
    // 更新总体指标
    this.metrics.totalRequests++;
    this.metrics.responseTimeSum += responseTime;
    
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    // 更新服务器指标
    if (!this.metrics.serverMetrics.has(serverId)) {
      this.metrics.serverMetrics.set(serverId, {
        requests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        responseTimeSum: 0,
        averageResponseTime: 0,
        lastRequestTime: null
      });
    }
    
    const serverMetric = this.metrics.serverMetrics.get(serverId);
    serverMetric.requests++;
    serverMetric.responseTimeSum += responseTime;
    serverMetric.lastRequestTime = now;
    
    if (success) {
      serverMetric.successfulRequests++;
    } else {
      serverMetric.failedRequests++;
    }
    
    serverMetric.averageResponseTime = serverMetric.responseTimeSum / serverMetric.requests;
    
    // 记录请求历史（用于计算 RPS）
    this.requestHistory.push({ timestamp: now, serverId, responseTime, success });
    
    // 清理旧的历史记录（保留最近1分钟）
    const oneMinuteAgo = now - 60000;
    this.requestHistory = this.requestHistory.filter(req => req.timestamp > oneMinuteAgo);
  }
  
  startMetricsCollection() {
    // 每秒更新指标
    setInterval(() => {
      this.updateMetrics();
    }, 1000);
  }
  
  updateMetrics() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // 计算每秒请求数
    const recentRequests = this.requestHistory.filter(req => req.timestamp > oneMinuteAgo);
    this.metrics.requestsPerSecond = recentRequests.length / 60;
    
    // 计算平均响应时间
    if (this.metrics.totalRequests > 0) {
      this.metrics.averageResponseTime = this.metrics.responseTimeSum / this.metrics.totalRequests;
    }
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      serverMetrics: Object.fromEntries(this.metrics.serverMetrics),
      successRate: this.metrics.totalRequests > 0 ? 
        (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 : 0
    };
  }
  
  getServerDistribution() {
    const distribution = {};
    let totalRequests = 0;
    
    this.metrics.serverMetrics.forEach((metric, serverId) => {
      totalRequests += metric.requests;
    });
    
    this.metrics.serverMetrics.forEach((metric, serverId) => {
      distribution[serverId] = {
        requests: metric.requests,
        percentage: totalRequests > 0 ? (metric.requests / totalRequests) * 100 : 0,
        averageResponseTime: metric.averageResponseTime,
        successRate: metric.requests > 0 ? 
          (metric.successfulRequests / metric.requests) * 100 : 0
      };
    });
    
    return distribution;
  }
  
  reset() {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      responseTimeSum: 0,
      serverMetrics: new Map(),
      requestsPerSecond: 0,
      averageResponseTime: 0
    };
    this.requestHistory = [];
  }
}

// 集成指标收集的负载均衡器
class InstrumentedLoadBalancer {
  constructor(loadBalancer) {
    this.loadBalancer = loadBalancer;
    this.metrics = new LoadBalancerMetrics();
  }
  
  async selectServerAndExecute(requestHandler, ...args) {
    const startTime = Date.now();
    let server = null;
    let success = false;
    
    try {
      server = this.loadBalancer.selectServer(...args);
      const result = await requestHandler(server, ...args);
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const responseTime = Date.now() - startTime;
      if (server) {
        this.metrics.recordRequest(server.id, responseTime, success);
      }
    }
  }
  
  getMetrics() {
    return this.metrics.getMetrics();
  }
  
  getServerDistribution() {
    return this.metrics.getServerDistribution();
  }
}

// 使用示例
const baseLB = new WeightedRoundRobinLoadBalancer();
const instrumentedLB = new InstrumentedLoadBalancer(baseLB);

// 添加服务器
instrumentedLB.loadBalancer.addServer({ host: '192.168.1.10', port: 8080, weight: 3 });
instrumentedLB.loadBalancer.addServer({ host: '192.168.1.11', port: 8080, weight: 2 });
instrumentedLB.loadBalancer.addServer({ host: '192.168.1.12', port: 8080, weight: 1 });

// 模拟请求处理
async function handleRequest(server, requestData) {
  // 模拟网络请求
  const response = await fetch(`http://${server.host}:${server.port}/api/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return await response.json();
}

// 执行请求
async function executeRequest(requestData) {
  try {
    const result = await instrumentedLB.selectServerAndExecute(handleRequest, requestData);
    return result;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// 定期打印指标
setInterval(() => {
  console.log('Load Balancer Metrics:', instrumentedLB.getMetrics());
  console.log('Server Distribution:', instrumentedLB.getServerDistribution());
}, 30000);
```

## 最佳实践

### 1. 算法选择指南

- **轮询（Round Robin）**：适用于服务器性能相近的场景
- **加权轮询**：适用于服务器性能差异较大的场景
- **最少连接**：适用于请求处理时间差异较大的场景
- **一致性哈希**：适用于需要会话保持或缓存一致性的场景
- **IP 哈希**：适用于需要基于客户端的会话保持

### 2. 健康检查策略

- **检查频率**：平衡及时性和资源消耗
- **超时设置**：避免健康检查本身成为瓶颈
- **阈值配置**：防止服务器状态频繁切换
- **检查路径**：使用专门的健康检查端点
- **分层检查**：结合 TCP 和 HTTP 检查

### 3. 性能优化

- **连接池**：复用连接减少开销
- **异步处理**：避免阻塞操作
- **缓存策略**：缓存服务器列表和健康状态
- **批量操作**：减少频繁的配置更新
- **监控告警**：及时发现性能问题

### 4. 故障处理

- **熔断机制**：防止级联故障
- **降级策略**：提供备用服务
- **重试逻辑**：处理临时故障
- **故障隔离**：快速剔除问题服务器
- **恢复机制**：自动恢复健康服务器

## 参考资源

### 官方文档
- [NGINX 负载均衡](https://docs.nginx.com/nginx/admin-guide/load-balancer/)
- [HAProxy 配置指南](https://www.haproxy.org/download/2.4/doc/configuration.txt)
- [AWS Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [Kubernetes Service](https://kubernetes.io/docs/concepts/services-networking/service/)

### 开源项目
- [NGINX](https://nginx.org/) - 高性能 Web 服务器和反向代理
- [HAProxy](https://www.haproxy.org/) - 高可用负载均衡器
- [Traefik](https://traefik.io/) - 现代反向代理和负载均衡器
- [Envoy](https://www.envoyproxy.io/) - 云原生代理

### 算法和理论
- [负载均衡算法比较](https://kemptechnologies.com/load-balancer/load-balancing-algorithms-techniques/)
- [一致性哈希算法](https://en.wikipedia.org/wiki/Consistent_hashing)
- [分布式系统负载均衡](https://www.educative.io/blog/load-balancing)

### 最佳实践
- [微服务负载均衡模式](https://microservices.io/patterns/client-side-discovery.html)
- [云原生负载均衡](https://www.cncf.io/blog/2018/07/03/load-balancing-in-kubernetes/)
- [高可用架构设计](https://aws.amazon.com/architecture/well-architected/)

---

本指南全面介绍了微服务环境中的负载均衡技术，包括各种算法实现、健康检查机制、会话保持、动态配置和性能监控。通过合理选择和配置负载均衡策略，可以显著提高系统的可用性、性能和可扩展性。