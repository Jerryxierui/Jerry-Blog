# Docker 容器化部署

## 简介
### 🐳 什么是 Docker

Docker 是一个开源的容器化平台，允许开发者将应用程序及其依赖项打包到轻量级、可移植的容器中。

### 核心概念
- **镜像（Image）**：应用程序的只读模板
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：构建镜像的指令文件
- **仓库（Registry）**：存储和分发镜像的服务
- **编排（Orchestration）**：管理多容器应用

### 核心优势
- **环境一致性**：开发、测试、生产环境完全一致
- **快速部署**：秒级启动和停止
- **资源高效**：比虚拟机更轻量
- **易于扩展**：水平扩展简单
- **版本控制**：镜像版本化管理

## 基础使用
### 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS (使用 Homebrew)
brew install --cask docker

# Windows
# 下载 Docker Desktop for Windows

# 验证安装
docker --version
docker run hello-world
```

### 基础命令

```bash
# 镜像管理
docker images                    # 列出本地镜像
docker pull nginx:latest         # 拉取镜像
docker build -t myapp:v1.0 .    # 构建镜像
docker rmi image_id             # 删除镜像
docker tag myapp:v1.0 myapp:latest  # 标记镜像

# 容器管理
docker ps                       # 列出运行中的容器
docker ps -a                    # 列出所有容器
docker run -d --name web nginx  # 运行容器
docker stop container_id        # 停止容器
docker start container_id       # 启动容器
docker rm container_id          # 删除容器
docker exec -it container_id bash  # 进入容器

# 日志和监控
docker logs container_id        # 查看容器日志
docker stats                    # 查看容器资源使用
docker inspect container_id     # 查看容器详细信息
```

## Dockerfile 编写
### 前端应用 Dockerfile

```dockerfile
# 多阶段构建 - 前端应用
# 构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动命令
CMD ["nginx", "-g", "daemon off;"]
```

### 后端应用 Dockerfile

```dockerfile
# Node.js 后端应用
FROM node:18-alpine

# 创建应用用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache libc6-compat

# 复制 package 文件
COPY package*.json ./
COPY yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile --production
RUN rm -rf ./.next/cache

# 复制源代码
COPY --chown=nextjs:nodejs . .

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令
CMD ["node", "server.js"]
```

### Python 应用 Dockerfile

```dockerfile
# Python 应用
FROM python:3.11-slim

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# 安装系统依赖
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        && rm -rf /var/lib/apt/lists/*

# 创建应用用户
RUN useradd --create-home --shell /bin/bash app

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY --chown=app:app . .

# 切换到应用用户
USER app

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health/ || exit 1

# 启动命令
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app.wsgi:application"]
```

## Docker Compose
### 基础配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 前端服务
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped

  # 数据库服务
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network
    restart: unless-stopped

  # Redis 缓存
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network
    restart: unless-stopped

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

### 开发环境配置

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - CHOKIDAR_USEPOLLING=true
    command: npm run dev

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DEBUG=1
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp_dev
    command: python manage.py runserver 0.0.0.0:8000

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_dev_data:
```

### 生产环境配置

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: myapp/frontend:${VERSION:-latest}
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    image: myapp/backend:${VERSION:-latest}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@db:5432/myapp
      - SECRET_KEY=${SECRET_KEY}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
    secrets:
      - db_password
      - secret_key

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD_FILE=/run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    secrets:
      - db_password
    deploy:
      placement:
        constraints:
          - node.role == manager

secrets:
  db_password:
    external: true
  secret_key:
    external: true

volumes:
  postgres_data:
    external: true
```

## 容器编排
### Docker Swarm

```bash
# 初始化 Swarm 集群
docker swarm init

# 添加工作节点
docker swarm join --token <token> <manager-ip>:2377

# 部署服务栈
docker stack deploy -c docker-compose.prod.yml myapp

# 管理服务
docker service ls
docker service ps myapp_backend
docker service scale myapp_backend=5
docker service update --image myapp/backend:v2.0 myapp_backend

# 管理密钥
echo "mysecretpassword" | docker secret create db_password -
docker secret ls
```

### Kubernetes 部署

```yaml
# k8s-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-backend
  labels:
    app: myapp-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp-backend
  template:
    metadata:
      labels:
        app: myapp-backend
    spec:
      containers:
      - name: backend
        image: myapp/backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: secret-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health/
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready/
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-backend-service
spec:
  selector:
    app: myapp-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: ClusterIP
```

## 镜像优化
### 多阶段构建优化

```dockerfile
# 优化的 Node.js 应用
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### 镜像大小优化

```dockerfile
# 使用 distroless 镜像
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 使用 distroless 运行时
FROM gcr.io/distroless/nodejs18-debian11
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["dist/server.js"]
```

## 安全最佳实践
### 安全配置

```dockerfile
# 安全的 Dockerfile
FROM node:18-alpine

# 更新系统包
RUN apk update && apk upgrade

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# 设置工作目录
WORKDIR /app

# 复制文件并设置权限
COPY --chown=nextjs:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --chown=nextjs:nodejs . .

# 移除不必要的包
RUN apk del build-dependencies

# 切换到非 root 用户
USER nextjs

# 只暴露必要端口
EXPOSE 3000

# 使用 exec 形式的 CMD
CMD ["node", "server.js"]
```

### 容器安全扫描

```bash
# 使用 Trivy 扫描镜像
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image myapp:latest

# 使用 Snyk 扫描
snyk container test myapp:latest

# 使用 Docker Scout
docker scout cves myapp:latest
```

## 监控与日志
### 容器监控

```yaml
# monitoring.yml
version: '3.8'

services:
  # Prometheus 监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  # Grafana 可视化
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources

  # cAdvisor 容器监控
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    devices:
      - /dev/kmsg

volumes:
  prometheus_data:
  grafana_data:
```

### 日志管理

```yaml
# logging.yml
version: '3.8'

services:
  # ELK Stack
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  # Filebeat 日志收集
  filebeat:
    image: docker.elastic.co/beats/filebeat:8.5.0
    user: root
    volumes:
      - ./filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash

volumes:
  elasticsearch_data:
```

## 故障排除
### 常见问题

```bash
# 容器调试
docker logs container_name
docker exec -it container_name sh
docker inspect container_name

# 网络问题
docker network ls
docker network inspect network_name

# 存储问题
docker volume ls
docker volume inspect volume_name

# 资源使用
docker stats
docker system df
docker system prune

# 镜像问题
docker history image_name
docker image inspect image_name
```

### 性能优化

```bash
# 清理未使用的资源
docker system prune -a

# 限制容器资源
docker run --memory="512m" --cpus="1.0" myapp

# 使用 BuildKit
export DOCKER_BUILDKIT=1
docker build --progress=plain -t myapp .

# 并行构建
docker build --build-arg BUILDKIT_INLINE_CACHE=1 -t myapp .
```

## 参考资源
### 官方文档

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Docker 安全指南](https://docs.docker.com/engine/security/)

### 学习资源

- [Docker 最佳实践](https://docs.docker.com/develop/best-practices/)
- [容器化应用设计模式](https://kubernetes.io/blog/2018/03/principles-of-container-app-design/)
- [12-Factor App](https://12factor.net/)

---

> 💡 **提示**：Docker 容器化是现代应用部署的标准方式，掌握容器技术对于现代开发者至关重要！