# Service Mesh 服务网格架构

## 简介

Service Mesh（服务网格）是一个专用的基础设施层，用于处理微服务架构中服务间的通信。它通过轻量级网络代理（通常以 sidecar 模式部署）来管理服务间的所有网络通信，提供负载均衡、服务发现、故障恢复、指标收集和安全策略等功能。

### 核心特性

- **透明代理**：对应用程序透明的网络代理
- **流量管理**：智能路由、负载均衡、故障注入
- **安全策略**：mTLS、访问控制、身份验证
- **可观测性**：指标收集、分布式追踪、日志聚合
- **策略执行**：速率限制、熔断、重试机制
- **多协议支持**：HTTP、gRPC、TCP、WebSocket

### 适用场景

- 大规模微服务架构
- 多语言技术栈
- 复杂的服务间通信
- 严格的安全要求
- 需要细粒度的流量控制
- 跨云和混合云部署

## Istio 服务网格

### 1. Istio 架构概述

```yaml
# Istio 核心组件
apiVersion: v1
kind: Namespace
metadata:
  name: istio-system
  labels:
    istio-injection: enabled
---
# Istio 控制平面
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: control-plane
  namespace: istio-system
spec:
  values:
    global:
      meshID: mesh1
      multiCluster:
        clusterName: cluster1
      network: network1
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
    ingressGateways:
    - name: istio-ingressgateway
      enabled: true
      k8s:
        service:
          type: LoadBalancer
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
    egressGateways:
    - name: istio-egressgateway
      enabled: true
```

### 2. 服务部署配置

```yaml
# 应用部署示例
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
  namespace: blog
  labels:
    app: blog-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-api
      version: v1
  template:
    metadata:
      labels:
        app: blog-api
        version: v1
      annotations:
        sidecar.istio.io/inject: "true"
    spec:
      containers:
      - name: blog-api
        image: blog/api:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          value: "mongodb://mongo:27017/blog"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: blog-api
  namespace: blog
  labels:
    app: blog-api
spec:
  selector:
    app: blog-api
  ports:
  - port: 8080
    targetPort: 8080
    name: http
---
# 用户服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: blog
  labels:
    app: user-service
    version: v1
spec:
  replicas: 2
  selector:
    matchLabels:
      app: user-service
      version: v1
  template:
    metadata:
      labels:
        app: user-service
        version: v1
      annotations:
        sidecar.istio.io/inject: "true"
    spec:
      containers:
      - name: user-service
        image: blog/user-service:v1.0.0
        ports:
        - containerPort: 9090
        env:
        - name: REDIS_URL
          value: "redis://redis:6379"
---
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: blog
  labels:
    app: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 9090
    targetPort: 9090
    name: grpc
```

### 3. 流量管理

```yaml
# Gateway 配置
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: blog-gateway
  namespace: blog
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - blog.example.com
    tls:
      httpsRedirect: true
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: blog-tls-secret
    hosts:
    - blog.example.com
---
# VirtualService 路由配置
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: blog-api-routes
  namespace: blog
spec:
  hosts:
  - blog.example.com
  gateways:
  - blog-gateway
  http:
  # API 路由
  - match:
    - uri:
        prefix: /api/v1/
    route:
    - destination:
        host: blog-api
        port:
          number: 8080
    timeout: 30s
    retries:
      attempts: 3
      perTryTimeout: 10s
  # 用户服务路由
  - match:
    - uri:
        prefix: /api/users/
    route:
    - destination:
        host: user-service
        port:
          number: 9090
  # 静态资源路由
  - match:
    - uri:
        prefix: /static/
    route:
    - destination:
        host: static-files
        port:
          number: 80
  # 默认路由到前端
  - route:
    - destination:
        host: blog-frontend
        port:
          number: 3000
---
# 金丝雀部署
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: blog-api-canary
  namespace: blog
spec:
  hosts:
  - blog-api
  http:
  - match:
    - headers:
        canary:
          exact: "true"
    route:
    - destination:
        host: blog-api
        subset: v2
  - route:
    - destination:
        host: blog-api
        subset: v1
      weight: 90
    - destination:
        host: blog-api
        subset: v2
      weight: 10
---
# DestinationRule 配置
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: blog-api
  namespace: blog
spec:
  host: blog-api
  trafficPolicy:
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
    circuitBreaker:
      consecutiveErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
  subsets:
  - name: v1
    labels:
      version: v1
    trafficPolicy:
      portLevelSettings:
      - port:
          number: 8080
        loadBalancer:
          simple: ROUND_ROBIN
  - name: v2
    labels:
      version: v2
    trafficPolicy:
      portLevelSettings:
      - port:
          number: 8080
        loadBalancer:
          simple: RANDOM
```

### 4. 安全策略

```yaml
# PeerAuthentication - mTLS 配置
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: blog
spec:
  mtls:
    mode: STRICT
---
# 特定服务的 mTLS 配置
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: user-service-mtls
  namespace: blog
spec:
  selector:
    matchLabels:
      app: user-service
  mtls:
    mode: STRICT
  portLevelMtls:
    9090:
      mode: STRICT
---
# AuthorizationPolicy - 访问控制
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: blog-api-authz
  namespace: blog
spec:
  selector:
    matchLabels:
      app: blog-api
  rules:
  # 允许来自前端的请求
  - from:
    - source:
        principals: ["cluster.local/ns/blog/sa/blog-frontend"]
  # 允许来自网关的请求
  - from:
    - source:
        namespaces: ["istio-system"]
  # 允许特定操作
  - to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/v1/*"]
    when:
    - key: request.headers[authorization]
      values: ["Bearer *"]
---
# JWT 认证
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: blog
spec:
  selector:
    matchLabels:
      app: blog-api
  jwtRules:
  - issuer: "https://auth.example.com"
    jwksUri: "https://auth.example.com/.well-known/jwks.json"
    audiences:
    - "blog-api"
    forwardOriginalToken: true
---
# 基于 JWT 的授权
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: jwt-authz
  namespace: blog
spec:
  selector:
    matchLabels:
      app: blog-api
  rules:
  - from:
    - source:
        requestPrincipals: ["https://auth.example.com/*"]
    to:
    - operation:
        methods: ["POST", "PUT", "DELETE"]
    when:
    - key: request.auth.claims[role]
      values: ["admin", "editor"]
  # 只读操作不需要认证
  - to:
    - operation:
        methods: ["GET"]
        paths: ["/api/v1/articles", "/api/v1/articles/*"]
```

### 5. 可观测性配置

```yaml
# Telemetry 配置
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: blog-metrics
  namespace: blog
spec:
  metrics:
  - providers:
    - name: prometheus
  - overrides:
    - match:
        metric: ALL_METRICS
      tagOverrides:
        request_id:
          value: "%{REQUEST_ID}"
        user_id:
          value: "%{REQUEST_HEADERS['x-user-id']}"
---
# 分布式追踪
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: blog-tracing
  namespace: blog
spec:
  tracing:
  - providers:
    - name: jaeger
  - customTags:
      user_id:
        header:
          name: x-user-id
      request_id:
        header:
          name: x-request-id
---
# 访问日志
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: blog-access-logs
  namespace: blog
spec:
  accessLogging:
  - providers:
    - name: otel
  - format:
      text: |
        [%START_TIME%] "%REQ(:METHOD)% %REQ(X-ENVOY-ORIGINAL-PATH?:PATH)% %PROTOCOL%"
        %RESPONSE_CODE% %RESPONSE_FLAGS% %BYTES_RECEIVED% %BYTES_SENT%
        %DURATION% %RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)% "%REQ(X-FORWARDED-FOR)%"
        "%REQ(USER-AGENT)%" "%REQ(X-REQUEST-ID)%" "%REQ(:AUTHORITY)%" "%UPSTREAM_HOST%"
---
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: istio-proxy
  namespace: blog
  labels:
    app: istio-proxy
spec:
  selector:
    matchLabels:
      app: istio-proxy
  endpoints:
  - port: http-monitoring
    interval: 15s
    path: /stats/prometheus
```

## Linkerd 服务网格

### 1. Linkerd 安装配置

```bash
# 安装 Linkerd CLI
curl -sL https://run.linkerd.io/install | sh
export PATH=$PATH:$HOME/.linkerd2/bin

# 检查集群兼容性
linkerd check --pre

# 安装 Linkerd 控制平面
linkerd install | kubectl apply -f -

# 验证安装
linkerd check

# 安装可视化组件
linkerd viz install | kubectl apply -f -
```

### 2. 服务注入配置

```yaml
# 命名空间级别注入
apiVersion: v1
kind: Namespace
metadata:
  name: blog
  annotations:
    linkerd.io/inject: enabled
---
# 应用部署
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
  namespace: blog
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-api
  template:
    metadata:
      labels:
        app: blog-api
      annotations:
        linkerd.io/inject: enabled
    spec:
      containers:
      - name: blog-api
        image: blog/api:v1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
---
# 手动注入（如果需要）
# kubectl get deploy blog-api -o yaml | linkerd inject - | kubectl apply -f -
```

### 3. 流量策略

```yaml
# TrafficSplit - 金丝雀部署
apiVersion: split.smi-spec.io/v1alpha1
kind: TrafficSplit
metadata:
  name: blog-api-split
  namespace: blog
spec:
  service: blog-api
  backends:
  - service: blog-api-v1
    weight: 90
  - service: blog-api-v2
    weight: 10
---
# HTTPRouteGroup - 路由规则
apiVersion: specs.smi-spec.io/v1alpha1
kind: HTTPRouteGroup
metadata:
  name: blog-api-routes
  namespace: blog
spec:
  matches:
  - name: articles
    pathRegex: "/api/v1/articles.*"
    methods:
    - GET
    - POST
  - name: users
    pathRegex: "/api/v1/users.*"
    methods:
    - GET
    - PUT
---
# TrafficTarget - 访问控制
apiVersion: access.smi-spec.io/v1alpha1
kind: TrafficTarget
metadata:
  name: blog-api-access
  namespace: blog
spec:
  destination:
    kind: ServiceAccount
    name: blog-api
    namespace: blog
  rules:
  - kind: HTTPRouteGroup
    name: blog-api-routes
    matches:
    - articles
    - users
  sources:
  - kind: ServiceAccount
    name: blog-frontend
    namespace: blog
  - kind: ServiceAccount
    name: api-gateway
    namespace: blog
```

### 4. 服务配置文件

```yaml
# ServiceProfile - 服务配置
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: blog-api.blog.svc.cluster.local
  namespace: blog
spec:
  routes:
  - name: get_articles
    condition:
      method: GET
      pathRegex: "/api/v1/articles"
    timeout: 30s
    retryBudget:
      retryRatio: 0.2
      minRetriesPerSecond: 10
      ttl: 10s
  - name: create_article
    condition:
      method: POST
      pathRegex: "/api/v1/articles"
    timeout: 60s
  - name: get_article
    condition:
      method: GET
      pathRegex: "/api/v1/articles/[^/]+"
    timeout: 15s
    retryBudget:
      retryRatio: 0.1
      minRetriesPerSecond: 5
      ttl: 10s
  retryBudget:
    retryRatio: 0.1
    minRetriesPerSecond: 10
    ttl: 10s
  dstOverrides:
  - authority: user-service.blog.svc.cluster.local:9090
    weight: 100
---
# 外部服务配置
apiVersion: linkerd.io/v1alpha2
kind: ServiceProfile
metadata:
  name: api.github.com
  namespace: blog
spec:
  routes:
  - name: github_api
    condition:
      pathRegex: "/.*"
    timeout: 30s
    retryBudget:
      retryRatio: 0.1
      minRetriesPerSecond: 1
      ttl: 10s
```

## Consul Connect

### 1. Consul Connect 配置

```yaml
# Consul 服务器配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: consul-config
  namespace: consul
data:
  server.hcl: |
    datacenter = "dc1"
    data_dir = "/consul/data"
    log_level = "INFO"
    server = true
    bootstrap_expect = 3
    bind_addr = "0.0.0.0"
    client_addr = "0.0.0.0"
    retry_join = ["consul-0.consul", "consul-1.consul", "consul-2.consul"]
    
    connect {
      enabled = true
    }
    
    ports {
      grpc = 8502
    }
    
    ui_config {
      enabled = true
    }
---
# Consul Connect 代理配置
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blog-api
  namespace: blog
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blog-api
  template:
    metadata:
      labels:
        app: blog-api
      annotations:
        consul.hashicorp.com/connect-inject: "true"
        consul.hashicorp.com/connect-service: "blog-api"
        consul.hashicorp.com/connect-service-port: "8080"
    spec:
      containers:
      - name: blog-api
        image: blog/api:v1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: USER_SERVICE_URL
          value: "http://localhost:9091"
---
# 服务意图配置
apiVersion: consul.hashicorp.com/v1alpha1
kind: ServiceIntentions
metadata:
  name: blog-api-intentions
  namespace: blog
spec:
  destination:
    name: blog-api
  sources:
  - name: blog-frontend
    action: allow
  - name: api-gateway
    action: allow
  - name: "*"
    action: deny
---
# 上游服务配置
apiVersion: consul.hashicorp.com/v1alpha1
kind: ServiceDefaults
metadata:
  name: user-service
  namespace: blog
spec:
  protocol: grpc
  upstreamConfig:
    defaults:
      connectTimeoutMs: 5000
      protocol: grpc
---
# 服务分割器
apiVersion: consul.hashicorp.com/v1alpha1
kind: ServiceSplitter
metadata:
  name: blog-api
  namespace: blog
spec:
  splits:
  - weight: 90
    service: blog-api
    serviceSubset: v1
  - weight: 10
    service: blog-api
    serviceSubset: v2
---
# 服务解析器
apiVersion: consul.hashicorp.com/v1alpha1
kind: ServiceResolver
metadata:
  name: blog-api
  namespace: blog
spec:
  defaultSubset: v1
  subsets:
    v1:
      filter: "Service.Meta.version == v1"
    v2:
      filter: "Service.Meta.version == v2"
  connectTimeout: 15s
  requestTimeout: 30s
```

## 监控和可观测性

### 1. Prometheus 监控配置

```yaml
# Prometheus 配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
    - "/etc/prometheus/rules/*.yml"
    
    scrape_configs:
    # Istio 控制平面监控
    - job_name: 'istio-mesh'
      kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
          - istio-system
      relabel_configs:
      - source_labels: [__meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
        action: keep
        regex: istio-telemetry;prometheus
    
    # Istio 代理监控
    - job_name: 'istio-proxy'
      kubernetes_sd_configs:
      - role: pod
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_container_name]
        action: keep
        regex: istio-proxy
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
      - action: labelmap
        regex: __meta_kubernetes_pod_label_(.+)
      - source_labels: [__meta_kubernetes_namespace]
        action: replace
        target_label: namespace
      - source_labels: [__meta_kubernetes_pod_name]
        action: replace
        target_label: pod_name
    
    # 应用程序监控
    - job_name: 'blog-services'
      kubernetes_sd_configs:
      - role: pod
        namespaces:
          names:
          - blog
      relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
        action: replace
        target_label: __metrics_path__
        regex: (.+)
      - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
        target_label: __address__
---
# 告警规则
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  service-mesh.yml: |
    groups:
    - name: service-mesh
      rules:
      # 高错误率告警
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(istio_requests_total{reporter="destination",response_code!~"2.."}[5m]))
            /
            sum(rate(istio_requests_total{reporter="destination"}[5m]))
          ) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} for service {{ $labels.destination_service_name }}"
      
      # 高延迟告警
      - alert: HighLatency
        expr: |
          histogram_quantile(0.99,
            sum(rate(istio_request_duration_milliseconds_bucket{reporter="destination"}[5m]))
            by (destination_service_name, le)
          ) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "99th percentile latency is {{ $value }}ms for service {{ $labels.destination_service_name }}"
      
      # 服务不可用告警
      - alert: ServiceDown
        expr: |
          up{job="istio-proxy"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "Service {{ $labels.pod_name }} in namespace {{ $labels.namespace }} is down"
```

### 2. Grafana 仪表板

```json
{
  "dashboard": {
    "id": null,
    "title": "Service Mesh Overview",
    "tags": ["istio", "service-mesh"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(istio_requests_total{reporter=\"destination\"}[5m])) by (destination_service_name)",
            "legendFormat": "{{ destination_service_name }}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests/sec"
          }
        ]
      },
      {
        "id": 2,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(istio_requests_total{reporter=\"destination\",response_code!~\"2..\"}[5m])) by (destination_service_name) / sum(rate(istio_requests_total{reporter=\"destination\"}[5m])) by (destination_service_name)",
            "legendFormat": "{{ destination_service_name }}"
          }
        ],
        "yAxes": [
          {
            "label": "Error Rate",
            "max": 1,
            "min": 0
          }
        ]
      },
      {
        "id": 3,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, sum(rate(istio_request_duration_milliseconds_bucket{reporter=\"destination\"}[5m])) by (destination_service_name, le))",
            "legendFormat": "{{ destination_service_name }} (p50)"
          },
          {
            "expr": "histogram_quantile(0.95, sum(rate(istio_request_duration_milliseconds_bucket{reporter=\"destination\"}[5m])) by (destination_service_name, le))",
            "legendFormat": "{{ destination_service_name }} (p95)"
          },
          {
            "expr": "histogram_quantile(0.99, sum(rate(istio_request_duration_milliseconds_bucket{reporter=\"destination\"}[5m])) by (destination_service_name, le))",
            "legendFormat": "{{ destination_service_name }} (p99)"
          }
        ],
        "yAxes": [
          {
            "label": "Duration (ms)"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
```

### 3. Jaeger 分布式追踪

```yaml
# Jaeger 部署
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
  namespace: istio-system
spec:
  strategy: production
  storage:
    type: elasticsearch
    elasticsearch:
      nodeCount: 3
      storage:
        storageClassName: fast-ssd
        size: 100Gi
      resources:
        requests:
          memory: 2Gi
          cpu: 500m
        limits:
          memory: 4Gi
          cpu: 1
  collector:
    replicas: 3
    resources:
      requests:
        memory: 512Mi
        cpu: 200m
      limits:
        memory: 1Gi
        cpu: 500m
  query:
    replicas: 2
    resources:
      requests:
        memory: 256Mi
        cpu: 100m
      limits:
        memory: 512Mi
        cpu: 200m
---
# 应用程序追踪配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: jaeger-config
  namespace: blog
data:
  config.yaml: |
    service_name: blog-api
    sampler:
      type: probabilistic
      param: 0.1
    reporter:
      log_spans: true
      buffer_flush_interval: 1s
      queue_size: 1000
    headers:
      jaeger_debug_header: jaeger-debug-id
      jaeger_baggage_header: jaeger-baggage
      trace_context_header_name: uber-trace-id
```

## 最佳实践

### 1. 性能优化

```yaml
# 资源限制和请求
apiVersion: v1
kind: ConfigMap
metadata:
  name: istio-proxy-config
  namespace: istio-system
data:
  mesh: |
    defaultConfig:
      proxyStatsMatcher:
        inclusionRegexps:
        - ".*circuit_breakers.*"
        - ".*upstream_rq_retry.*"
        - ".*_cx_.*"
        exclusionRegexps:
        - ".*osconfig.*"
      concurrency: 2
      resources:
        requests:
          cpu: 100m
          memory: 128Mi
        limits:
          cpu: 200m
          memory: 256Mi
---
# 代理配置优化
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: control-plane
spec:
  meshConfig:
    defaultConfig:
      # 减少统计信息收集
      proxyStatsMatcher:
        inclusionRegexps:
        - ".*circuit_breakers.*"
        - ".*upstream_rq_retry.*"
        exclusionRegexps:
        - ".*osconfig.*"
      # 优化并发设置
      concurrency: 2
      # 禁用不必要的功能
      holdApplicationUntilProxyStarts: true
  values:
    global:
      proxy:
        # 资源配置
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi
```

### 2. 安全最佳实践

```yaml
# 网络策略
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: blog-network-policy
  namespace: blog
spec:
  podSelector:
    matchLabels:
      app: blog-api
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    - podSelector:
        matchLabels:
          app: blog-frontend
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: user-service
    ports:
    - protocol: TCP
      port: 9090
  - to: []
    ports:
    - protocol: TCP
      port: 443
---
# 安全策略
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: blog
spec:
  # 默认拒绝所有请求
---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-frontend
  namespace: blog
spec:
  selector:
    matchLabels:
      app: blog-api
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/blog/sa/blog-frontend"]
    to:
    - operation:
        methods: ["GET", "POST"]
```

### 3. 故障排除

```bash
# Istio 故障排除命令
# 检查代理配置
istioctl proxy-config cluster blog-api-xxx -n blog
istioctl proxy-config listener blog-api-xxx -n blog
istioctl proxy-config route blog-api-xxx -n blog
istioctl proxy-config endpoint blog-api-xxx -n blog

# 检查代理状态
istioctl proxy-status

# 分析配置
istioctl analyze -n blog

# 查看代理日志
kubectl logs blog-api-xxx -c istio-proxy -n blog

# 检查 mTLS 状态
istioctl authn tls-check blog-api.blog.svc.cluster.local

# 验证策略
istioctl authz check blog-api-xxx -n blog

# Linkerd 故障排除
# 检查代理状态
linkerd check --proxy

# 查看服务拓扑
linkerd viz top deploy/blog-api -n blog

# 查看实时流量
linkerd viz tap deploy/blog-api -n blog

# 检查服务配置文件
linkerd viz profile --tap deploy/blog-api -n blog
```

## 参考资源

### 官方文档
- [Istio 官方文档](https://istio.io/latest/docs/)
- [Linkerd 官方文档](https://linkerd.io/docs/)
- [Consul Connect 文档](https://www.consul.io/docs/connect)
- [Service Mesh Interface (SMI)](https://smi-spec.io/)

### 工具和插件
- [Kiali](https://kiali.io/) - Istio 服务网格可视化
- [Jaeger](https://www.jaegertracing.io/) - 分布式追踪
- [Prometheus](https://prometheus.io/) - 监控和告警
- [Grafana](https://grafana.com/) - 可视化仪表板

### 最佳实践文章
- [Istio Best Practices](https://istio.io/latest/docs/ops/best-practices/)
- [Service Mesh Patterns](https://www.manning.com/books/service-mesh-patterns)
- [Microservices Security](https://www.oreilly.com/library/view/microservices-security-in/9781492027515/)

### 社区资源
- [Istio Community](https://istio.io/latest/about/community/)
- [CNCF Service Mesh Working Group](https://github.com/cncf/sig-network)
- [Service Mesh Hub](https://servicemesh.io/)

---

本指南涵盖了 Service Mesh 的核心概念、主流实现方案（Istio、Linkerd、Consul Connect）的配置和使用，以及监控、安全和故障排除的最佳实践。通过遵循这些指导原则，你可以构建一个强大、安全、可观测的微服务通信基础设施。