# 微服务发现与注册

## 简介

服务发现是微服务架构中的核心组件，它解决了服务实例动态变化时如何找到和连接服务的问题。在微服务环境中，服务实例会频繁地启动、停止、扩缩容，服务发现机制确保客户端能够自动发现可用的服务实例。

### 核心特性

- **自动注册**：服务启动时自动注册到服务注册中心
- **健康检查**：定期检查服务实例的健康状态
- **负载均衡**：在多个服务实例间分发请求
- **故障转移**：自动剔除不健康的服务实例
- **服务路由**：根据规则将请求路由到合适的服务实例
- **配置管理**：集中管理服务配置信息

### 适用场景

- 微服务架构系统
- 容器化部署环境
- 云原生应用
- 动态扩缩容场景
- 多环境部署
- 服务网格架构

## 服务发现模式

### 1. 客户端发现模式

客户端直接查询服务注册中心获取服务实例信息。

```javascript
// 客户端发现实现
class ClientSideDiscovery {
  constructor(registryClient) {
    this.registry = registryClient;
    this.serviceCache = new Map();
    this.loadBalancer = new LoadBalancer();
  }
  
  async discoverService(serviceName) {
    // 从缓存获取服务实例
    let instances = this.serviceCache.get(serviceName);
    
    // 如果缓存为空或过期，从注册中心获取
    if (!instances || this.isCacheExpired(serviceName)) {
      instances = await this.registry.getServiceInstances(serviceName);
      this.updateCache(serviceName, instances);
    }
    
    // 过滤健康的实例
    const healthyInstances = instances.filter(instance => instance.status === 'UP');
    
    if (healthyInstances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }
    
    // 负载均衡选择实例
    return this.loadBalancer.selectInstance(healthyInstances);
  }
  
  updateCache(serviceName, instances) {
    this.serviceCache.set(serviceName, {
      instances,
      timestamp: Date.now(),
      ttl: 30000 // 30秒缓存
    });
  }
  
  isCacheExpired(serviceName) {
    const cached = this.serviceCache.get(serviceName);
    return !cached || (Date.now() - cached.timestamp) > cached.ttl;
  }
}

// 负载均衡器
class LoadBalancer {
  constructor(strategy = 'round-robin') {
    this.strategy = strategy;
    this.counters = new Map();
  }
  
  selectInstance(instances) {
    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobinSelect(instances);
      case 'random':
        return this.randomSelect(instances);
      case 'weighted':
        return this.weightedSelect(instances);
      default:
        return this.roundRobinSelect(instances);
    }
  }
  
  roundRobinSelect(instances) {
    const key = instances.map(i => i.id).join(',');
    let counter = this.counters.get(key) || 0;
    const selected = instances[counter % instances.length];
    this.counters.set(key, counter + 1);
    return selected;
  }
  
  randomSelect(instances) {
    const index = Math.floor(Math.random() * instances.length);
    return instances[index];
  }
  
  weightedSelect(instances) {
    const totalWeight = instances.reduce((sum, instance) => sum + (instance.weight || 1), 0);
    let random = Math.random() * totalWeight;
    
    for (const instance of instances) {
      random -= (instance.weight || 1);
      if (random <= 0) {
        return instance;
      }
    }
    
    return instances[0];
  }
}
```

### 2. 服务端发现模式

通过负载均衡器或API网关进行服务发现。

```javascript
// 服务端发现 - API网关实现
class APIGatewayDiscovery {
  constructor(registryClient) {
    this.registry = registryClient;
    this.routingTable = new Map();
    this.healthChecker = new HealthChecker();
    
    // 定期更新路由表
    setInterval(() => this.updateRoutingTable(), 10000);
  }
  
  async updateRoutingTable() {
    try {
      const services = await this.registry.getAllServices();
      
      for (const serviceName of services) {
        const instances = await this.registry.getServiceInstances(serviceName);
        const healthyInstances = await this.filterHealthyInstances(instances);
        
        this.routingTable.set(serviceName, healthyInstances);
      }
      
      console.log('Routing table updated:', this.routingTable.size, 'services');
    } catch (error) {
      console.error('Failed to update routing table:', error);
    }
  }
  
  async filterHealthyInstances(instances) {
    const healthChecks = instances.map(instance => 
      this.healthChecker.checkHealth(instance)
    );
    
    const results = await Promise.allSettled(healthChecks);
    
    return instances.filter((instance, index) => 
      results[index].status === 'fulfilled' && results[index].value
    );
  }
  
  async routeRequest(serviceName, request) {
    const instances = this.routingTable.get(serviceName);
    
    if (!instances || instances.length === 0) {
      throw new Error(`No available instances for service: ${serviceName}`);
    }
    
    // 选择实例
    const instance = this.selectInstance(instances, request);
    
    // 转发请求
    return await this.forwardRequest(instance, request);
  }
  
  selectInstance(instances, request) {
    // 基于请求特征选择实例
    if (request.headers['x-user-type'] === 'premium') {
      // 优先选择高性能实例
      const premiumInstances = instances.filter(i => i.tags?.includes('premium'));
      if (premiumInstances.length > 0) {
        return premiumInstances[0];
      }
    }
    
    // 默认轮询选择
    return instances[Math.floor(Math.random() * instances.length)];
  }
  
  async forwardRequest(instance, request) {
    const url = `http://${instance.address}:${instance.port}${request.path}`;
    
    try {
      const response = await fetch(url, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return response;
    } catch (error) {
      // 标记实例为不健康
      this.markInstanceUnhealthy(instance);
      throw error;
    }
  }
  
  markInstanceUnhealthy(instance) {
    instance.status = 'DOWN';
    instance.lastFailure = Date.now();
    
    // 从路由表中临时移除
    setTimeout(() => {
      instance.status = 'UP';
    }, 30000); // 30秒后重新尝试
  }
}

// 健康检查器
class HealthChecker {
  async checkHealth(instance) {
    try {
      const healthUrl = `http://${instance.address}:${instance.port}/health`;
      const response = await fetch(healthUrl, {
        timeout: 5000,
        method: 'GET'
      });
      
      return response.ok;
    } catch (error) {
      console.warn(`Health check failed for ${instance.id}:`, error.message);
      return false;
    }
  }
}
```

## Consul 服务发现

### 1. Consul 客户端实现

```javascript
// Consul 服务注册与发现
const consul = require('consul');

class ConsulServiceRegistry {
  constructor(options = {}) {
    this.consul = consul({
      host: options.host || 'localhost',
      port: options.port || 8500,
      secure: options.secure || false
    });
    
    this.serviceName = options.serviceName;
    this.serviceId = options.serviceId || `${options.serviceName}-${process.pid}`;
    this.servicePort = options.servicePort;
    this.serviceAddress = options.serviceAddress || 'localhost';
    this.healthCheckInterval = options.healthCheckInterval || '10s';
    this.tags = options.tags || [];
  }
  
  async register() {
    const registration = {
      ID: this.serviceId,
      Name: this.serviceName,
      Tags: this.tags,
      Address: this.serviceAddress,
      Port: this.servicePort,
      Check: {
        HTTP: `http://${this.serviceAddress}:${this.servicePort}/health`,
        Interval: this.healthCheckInterval,
        Timeout: '5s',
        DeregisterCriticalServiceAfter: '30s'
      },
      Meta: {
        version: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        startTime: new Date().toISOString()
      }
    };
    
    try {
      await this.consul.agent.service.register(registration);
      console.log(`Service registered: ${this.serviceId}`);
      
      // 设置优雅关闭
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('Service registration failed:', error);
      throw error;
    }
  }
  
  async deregister() {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      console.log(`Service deregistered: ${this.serviceId}`);
    } catch (error) {
      console.error('Service deregistration failed:', error);
    }
  }
  
  async discoverService(serviceName, options = {}) {
    try {
      const services = await this.consul.health.service({
        service: serviceName,
        passing: options.onlyHealthy !== false, // 默认只返回健康实例
        tag: options.tag
      });
      
      return services.map(service => ({
        id: service.Service.ID,
        name: service.Service.Service,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags,
        meta: service.Service.Meta,
        status: this.getServiceStatus(service.Checks)
      }));
    } catch (error) {
      console.error(`Service discovery failed for ${serviceName}:`, error);
      return [];
    }
  }
  
  getServiceStatus(checks) {
    if (!checks || checks.length === 0) return 'unknown';
    
    const hasFailure = checks.some(check => check.Status !== 'passing');
    return hasFailure ? 'unhealthy' : 'healthy';
  }
  
  async watchService(serviceName, callback) {
    const watch = this.consul.watch({
      method: this.consul.health.service,
      options: {
        service: serviceName,
        passing: true
      }
    });
    
    watch.on('change', (data) => {
      const instances = data.map(service => ({
        id: service.Service.ID,
        address: service.Service.Address,
        port: service.Service.Port,
        tags: service.Service.Tags
      }));
      
      callback(instances);
    });
    
    watch.on('error', (error) => {
      console.error(`Watch error for service ${serviceName}:`, error);
    });
    
    return watch;
  }
  
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await this.deregister();
      process.exit(0);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// 使用示例
class UserService {
  constructor() {
    this.registry = new ConsulServiceRegistry({
      serviceName: 'user-service',
      servicePort: 3001,
      serviceAddress: process.env.SERVICE_ADDRESS || 'localhost',
      tags: ['api', 'user', 'v1']
    });
    
    this.orderServiceClient = new ServiceClient('order-service', this.registry);
  }
  
  async start() {
    // 注册服务
    await this.registry.register();
    
    // 启动HTTP服务器
    this.server = express();
    this.setupRoutes();
    
    this.server.listen(3001, () => {
      console.log('User service started on port 3001');
    });
  }
  
  setupRoutes() {
    // 健康检查端点
    this.server.get('/health', (req, res) => {
      res.json({ status: 'UP', timestamp: new Date().toISOString() });
    });
    
    // 用户相关端点
    this.server.get('/users/:id', async (req, res) => {
      try {
        const user = await this.getUserById(req.params.id);
        res.json(user);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  
  async getUserById(userId) {
    // 业务逻辑
    return { id: userId, name: 'John Doe', email: 'john@example.com' };
  }
}

// 服务客户端
class ServiceClient {
  constructor(serviceName, registry) {
    this.serviceName = serviceName;
    this.registry = registry;
    this.instances = [];
    this.currentIndex = 0;
    
    // 监听服务变化
    this.watchServiceChanges();
  }
  
  async watchServiceChanges() {
    this.watch = await this.registry.watchService(this.serviceName, (instances) => {
      this.instances = instances;
      console.log(`Service ${this.serviceName} instances updated:`, instances.length);
    });
  }
  
  async request(method, path, data = null) {
    const instance = await this.getAvailableInstance();
    const url = `http://${instance.address}:${instance.port}${path}`;
    
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Request failed to ${this.serviceName}:`, error);
      throw error;
    }
  }
  
  async getAvailableInstance() {
    if (this.instances.length === 0) {
      // 如果没有缓存的实例，主动发现
      this.instances = await this.registry.discoverService(this.serviceName);
    }
    
    if (this.instances.length === 0) {
      throw new Error(`No available instances for service: ${this.serviceName}`);
    }
    
    // 轮询选择实例
    const instance = this.instances[this.currentIndex % this.instances.length];
    this.currentIndex++;
    
    return instance;
  }
}
```

### 2. Consul 配置管理

```javascript
// Consul 配置管理
class ConsulConfigManager {
  constructor(consulClient) {
    this.consul = consulClient;
    this.configCache = new Map();
    this.watchers = new Map();
  }
  
  async getConfig(key, defaultValue = null) {
    try {
      // 先从缓存获取
      if (this.configCache.has(key)) {
        return this.configCache.get(key);
      }
      
      // 从 Consul 获取
      const result = await this.consul.kv.get(key);
      
      if (result && result.Value) {
        const value = this.parseValue(result.Value);
        this.configCache.set(key, value);
        return value;
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Failed to get config ${key}:`, error);
      return defaultValue;
    }
  }
  
  async setConfig(key, value) {
    try {
      const serializedValue = this.serializeValue(value);
      await this.consul.kv.set(key, serializedValue);
      
      // 更新缓存
      this.configCache.set(key, value);
      
      console.log(`Config updated: ${key}`);
    } catch (error) {
      console.error(`Failed to set config ${key}:`, error);
      throw error;
    }
  }
  
  async watchConfig(key, callback) {
    const watch = this.consul.watch({
      method: this.consul.kv.get,
      options: { key }
    });
    
    watch.on('change', (data) => {
      if (data && data.Value) {
        const value = this.parseValue(data.Value);
        this.configCache.set(key, value);
        callback(value);
      }
    });
    
    watch.on('error', (error) => {
      console.error(`Config watch error for ${key}:`, error);
    });
    
    this.watchers.set(key, watch);
    return watch;
  }
  
  parseValue(value) {
    try {
      return JSON.parse(value);
    } catch {
      return value; // 如果不是JSON，返回原始字符串
    }
  }
  
  serializeValue(value) {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }
  
  async loadConfigTree(prefix) {
    try {
      const result = await this.consul.kv.get({
        key: prefix,
        recurse: true
      });
      
      const config = {};
      
      if (result) {
        result.forEach(item => {
          const key = item.Key.replace(prefix, '').replace(/^\//,'');
          const value = this.parseValue(item.Value);
          this.setNestedValue(config, key, value);
        });
      }
      
      return config;
    } catch (error) {
      console.error(`Failed to load config tree ${prefix}:`, error);
      return {};
    }
  }
  
  setNestedValue(obj, path, value) {
    const keys = path.split('/');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

// 配置管理使用示例
class ConfigurableService {
  constructor() {
    this.configManager = new ConsulConfigManager(consul());
    this.config = {};
  }
  
  async initialize() {
    // 加载初始配置
    this.config = await this.configManager.loadConfigTree('services/user-service/');
    
    // 监听配置变化
    await this.configManager.watchConfig('services/user-service/database', (newConfig) => {
      console.log('Database config updated:', newConfig);
      this.updateDatabaseConnection(newConfig);
    });
    
    await this.configManager.watchConfig('services/user-service/features', (newConfig) => {
      console.log('Feature flags updated:', newConfig);
      this.updateFeatureFlags(newConfig);
    });
  }
  
  updateDatabaseConnection(dbConfig) {
    // 重新配置数据库连接
    this.config.database = dbConfig;
  }
  
  updateFeatureFlags(features) {
    // 更新功能开关
    this.config.features = features;
  }
  
  isFeatureEnabled(featureName) {
    return this.config.features?.[featureName] === true;
  }
}
```

## Eureka 服务发现

### 1. Eureka 客户端实现

```javascript
// Eureka 服务注册与发现
const eureka = require('eureka-js-client');

class EurekaServiceRegistry {
  constructor(options) {
    this.client = new eureka.Eureka({
      instance: {
        app: options.serviceName.toUpperCase(),
        instanceId: `${options.serviceName}:${options.servicePort}`,
        hostName: options.serviceAddress || 'localhost',
        ipAddr: options.serviceAddress || '127.0.0.1',
        port: {
          '$': options.servicePort,
          '@enabled': true
        },
        vipAddress: options.serviceName,
        dataCenterInfo: {
          '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
          name: 'MyOwn'
        },
        metadata: {
          version: options.version || '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      },
      eureka: {
        host: options.eurekaHost || 'localhost',
        port: options.eurekaPort || 8761,
        servicePath: '/eureka/apps/',
        maxRetries: 3,
        requestRetryDelay: 2000
      }
    });
    
    this.serviceName = options.serviceName;
  }
  
  async start() {
    return new Promise((resolve, reject) => {
      this.client.start((error) => {
        if (error) {
          console.error('Eureka registration failed:', error);
          reject(error);
        } else {
          console.log(`Service registered with Eureka: ${this.serviceName}`);
          resolve();
        }
      });
    });
  }
  
  async stop() {
    return new Promise((resolve) => {
      this.client.stop(() => {
        console.log(`Service deregistered from Eureka: ${this.serviceName}`);
        resolve();
      });
    });
  }
  
  discoverService(serviceName) {
    const instances = this.client.getInstancesByAppId(serviceName.toUpperCase());
    
    return instances.map(instance => ({
      id: instance.instanceId,
      address: instance.ipAddr,
      port: instance.port['$'],
      status: instance.status,
      metadata: instance.metadata
    }));
  }
  
  getHealthyInstances(serviceName) {
    const instances = this.discoverService(serviceName);
    return instances.filter(instance => instance.status === 'UP');
  }
}

// Eureka 服务客户端
class EurekaServiceClient {
  constructor(serviceName, eurekaRegistry) {
    this.serviceName = serviceName;
    this.registry = eurekaRegistry;
    this.loadBalancer = new RoundRobinLoadBalancer();
  }
  
  async request(method, path, data = null) {
    const instances = this.registry.getHealthyInstances(this.serviceName);
    
    if (instances.length === 0) {
      throw new Error(`No healthy instances available for ${this.serviceName}`);
    }
    
    const instance = this.loadBalancer.selectInstance(instances);
    const url = `http://${instance.address}:${instance.port}${path}`;
    
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Request failed to ${this.serviceName}:`, error);
      throw error;
    }
  }
}

class RoundRobinLoadBalancer {
  constructor() {
    this.counters = new Map();
  }
  
  selectInstance(instances) {
    const key = instances.map(i => i.id).sort().join(',');
    let counter = this.counters.get(key) || 0;
    
    const selected = instances[counter % instances.length];
    this.counters.set(key, counter + 1);
    
    return selected;
  }
}
```

## Kubernetes 服务发现

### 1. Kubernetes Service 和 Endpoints

```yaml
# user-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
  labels:
    app: user-service
spec:
  selector:
    app: user-service
  ports:
  - name: http
    port: 80
    targetPort: 3001
    protocol: TCP
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
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
        - name: SERVICE_NAME
          value: "user-service"
        - name: SERVICE_PORT
          value: "3001"
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
```

### 2. Kubernetes API 服务发现

```javascript
// Kubernetes 服务发现客户端
const k8s = require('@kubernetes/client-node');

class KubernetesServiceDiscovery {
  constructor() {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();
    
    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.namespace = process.env.KUBERNETES_NAMESPACE || 'default';
  }
  
  async discoverService(serviceName) {
    try {
      // 获取 Service 信息
      const serviceResponse = await this.k8sApi.readNamespacedService(
        serviceName,
        this.namespace
      );
      
      const service = serviceResponse.body;
      
      // 获取 Endpoints 信息
      const endpointsResponse = await this.k8sApi.readNamespacedEndpoints(
        serviceName,
        this.namespace
      );
      
      const endpoints = endpointsResponse.body;
      
      // 解析服务实例
      const instances = [];
      
      if (endpoints.subsets) {
        endpoints.subsets.forEach(subset => {
          const port = subset.ports?.[0]?.port;
          
          if (subset.addresses) {
            subset.addresses.forEach(address => {
              instances.push({
                id: `${address.ip}:${port}`,
                address: address.ip,
                port: port,
                status: 'ready',
                metadata: {
                  nodeName: address.nodeName,
                  targetRef: address.targetRef
                }
              });
            });
          }
        });
      }
      
      return instances;
    } catch (error) {
      console.error(`Failed to discover service ${serviceName}:`, error);
      return [];
    }
  }
  
  async watchService(serviceName, callback) {
    const watch = new k8s.Watch(this.kc);
    
    // 监听 Endpoints 变化
    const req = await watch.watch(
      `/api/v1/namespaces/${this.namespace}/endpoints`,
      { labelSelector: `app=${serviceName}` },
      (type, obj) => {
        if (obj.metadata.name === serviceName) {
          this.handleEndpointsChange(type, obj, callback);
        }
      },
      (error) => {
        console.error(`Watch error for service ${serviceName}:`, error);
      }
    );
    
    return req;
  }
  
  handleEndpointsChange(type, endpoints, callback) {
    const instances = [];
    
    if (type !== 'DELETED' && endpoints.subsets) {
      endpoints.subsets.forEach(subset => {
        const port = subset.ports?.[0]?.port;
        
        if (subset.addresses) {
          subset.addresses.forEach(address => {
            instances.push({
              id: `${address.ip}:${port}`,
              address: address.ip,
              port: port,
              status: 'ready'
            });
          });
        }
      });
    }
    
    callback(instances);
  }
}

// Kubernetes DNS 服务发现
class KubernetesDNSDiscovery {
  constructor(namespace = 'default') {
    this.namespace = namespace;
  }
  
  getServiceURL(serviceName, port = 80) {
    // Kubernetes 内部 DNS 格式
    return `http://${serviceName}.${this.namespace}.svc.cluster.local:${port}`;
  }
  
  async discoverService(serviceName) {
    const dns = require('dns').promises;
    
    try {
      // 解析服务的 DNS 记录
      const hostname = `${serviceName}.${this.namespace}.svc.cluster.local`;
      const addresses = await dns.resolve4(hostname);
      
      return addresses.map(address => ({
        id: address,
        address: address,
        port: 80, // 默认端口，实际应该从 Service 定义获取
        status: 'ready'
      }));
    } catch (error) {
      console.error(`DNS resolution failed for ${serviceName}:`, error);
      return [];
    }
  }
}
```

## 服务网格中的服务发现

### 1. Istio 服务发现

```yaml
# istio-service-discovery.yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
spec:
  host: user-service
  trafficPolicy:
    loadBalancer:
      simple: ROUND_ROBIN
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
spec:
  hosts:
  - user-service
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: user-service
        subset: v2
      weight: 100
  - route:
    - destination:
        host: user-service
        subset: v1
      weight: 90
    - destination:
        host: user-service
        subset: v2
      weight: 10
```

### 2. Envoy 服务发现配置

```yaml
# envoy-config.yaml
static_resources:
  clusters:
  - name: user-service
    connect_timeout: 0.25s
    type: EDS
    eds_cluster_config:
      eds_config:
        api_config_source:
          api_type: GRPC
          grpc_services:
          - envoy_grpc:
              cluster_name: xds-cluster
    lb_policy: ROUND_ROBIN
    health_checks:
    - timeout: 1s
      interval: 10s
      unhealthy_threshold: 3
      healthy_threshold: 2
      http_health_check:
        path: "/health"
  
  - name: xds-cluster
    connect_timeout: 0.25s
    type: STATIC
    lb_policy: ROUND_ROBIN
    load_assignment:
      cluster_name: xds-cluster
      endpoints:
      - lb_endpoints:
        - endpoint:
            address:
              socket_address:
                address: istiod.istio-system.svc.cluster.local
                port_value: 15010
```

## 最佳实践

### 1. 服务注册策略

- **自注册模式**：服务启动时主动注册
- **第三方注册**：通过部署工具或sidecar注册
- **健康检查**：定期检查服务健康状态
- **优雅关闭**：服务停止时主动注销
- **元数据管理**：包含版本、环境等信息

### 2. 负载均衡策略

- **轮询（Round Robin）**：简单均匀分配
- **加权轮询**：根据服务能力分配
- **最少连接**：选择连接数最少的实例
- **一致性哈希**：保证请求路由的一致性
- **地理位置**：优先选择就近的服务实例

### 3. 故障处理

- **熔断器**：防止级联故障
- **重试机制**：处理临时故障
- **超时控制**：避免长时间等待
- **降级策略**：提供备用方案
- **故障隔离**：隔离有问题的实例

### 4. 监控和观测

- **服务健康监控**：实时监控服务状态
- **发现延迟监控**：监控服务发现性能
- **负载均衡效果**：监控请求分布
- **故障检测时间**：监控故障发现速度
- **配置变更追踪**：记录配置变更历史

## 参考资源

### 官方文档
- [Consul 官方文档](https://www.consul.io/docs)
- [Eureka 官方文档](https://github.com/Netflix/eureka)
- [Kubernetes Service 文档](https://kubernetes.io/docs/concepts/services-networking/service/)
- [Istio 服务发现](https://istio.io/latest/docs/concepts/traffic-management/)

### 工具和框架
- [Consul](https://www.consul.io/) - HashiCorp 服务发现
- [Eureka](https://github.com/Netflix/eureka) - Netflix 服务注册中心
- [etcd](https://etcd.io/) - 分布式键值存储
- [Zookeeper](https://zookeeper.apache.org/) - 分布式协调服务

### 最佳实践文章
- [微服务服务发现模式](https://microservices.io/patterns/service-registry.html)
- [服务发现的挑战与解决方案](https://www.nginx.com/blog/service-discovery-in-a-microservices-architecture/)
- [Kubernetes 服务发现最佳实践](https://kubernetes.io/docs/concepts/services-networking/)

### 社区资源
- [CNCF 服务发现项目](https://landscape.cncf.io/category=service-discovery)
- [微服务架构社区](https://microservices.io/)
- [云原生计算基金会](https://www.cncf.io/)

---

本指南详细介绍了微服务环境中的服务发现与注册机制，包括不同的实现方案、最佳实践和实际应用示例。通过合理选择和配置服务发现方案，可以构建出高可用、可扩展的微服务架构。