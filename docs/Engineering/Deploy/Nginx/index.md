# Nginx 服务器配置

## 简介
### 🚀 什么是 Nginx

Nginx 是一个高性能的 HTTP 和反向代理服务器，也是一个 IMAP/POP3/SMTP 服务器。由于其高性能、稳定性、丰富的功能集、简单的配置文件和低系统资源消耗而闻名。

### 核心特性
- **高性能**：事件驱动架构，支持高并发
- **反向代理**：负载均衡、SSL 终止
- **静态文件服务**：高效的静态资源服务
- **缓存**：内置缓存机制
- **压缩**：Gzip 压缩减少传输大小
- **安全**：访问控制、限流、防护

### 应用场景
- **Web 服务器**：静态文件服务
- **反向代理**：API 网关、负载均衡
- **缓存服务器**：内容缓存
- **SSL 终止**：HTTPS 处理

## 基础配置
### 主配置文件结构

```nginx
# /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

# 事件模块
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# HTTP 模块
http {
    # 基础设置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

### 基本站点配置

```nginx
# /etc/nginx/sites-available/example.com
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;
    
    # SSL 配置
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 网站根目录
    root /var/www/example.com;
    index index.html index.htm index.php;
    
    # 访问日志
    access_log /var/log/nginx/example.com.access.log;
    error_log /var/log/nginx/example.com.error.log;
    
    # 静态文件处理
    location / {
        try_files $uri $uri/ =404;
    }
    
    # PHP 处理
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## 反向代理配置
### 单应用代理

```nginx
# 反向代理到 Node.js 应用
server {
    listen 80;
    server_name api.example.com;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3000/health;
        access_log off;
    }
}
```

### 负载均衡配置

```nginx
# upstream 定义
upstream backend {
    # 负载均衡方法
    least_conn;  # 最少连接数
    # ip_hash;   # IP 哈希
    # hash $request_uri;  # URL 哈希
    
    # 后端服务器
    server 127.0.0.1:3001 weight=3 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3002 weight=2 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:3003 weight=1 max_fails=3 fail_timeout=30s backup;
    
    # 健康检查
    keepalive 32;
}

server {
    listen 80;
    server_name app.example.com;
    
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 连接池
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
```

### API 网关配置

```nginx
# API 网关配置
map $request_method $cors_method {
    OPTIONS 11;
    GET     1;
    POST    1;
    PUT     1;
    DELETE  1;
    default 0;
}

server {
    listen 80;
    server_name gateway.example.com;
    
    # CORS 处理
    location / {
        if ($cors_method ~ '1') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        }
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # 用户服务
    location /api/users {
        proxy_pass http://user-service:8001;
        include /etc/nginx/proxy_params;
    }
    
    # 订单服务
    location /api/orders {
        proxy_pass http://order-service:8002;
        include /etc/nginx/proxy_params;
    }
    
    # 支付服务
    location /api/payments {
        proxy_pass http://payment-service:8003;
        include /etc/nginx/proxy_params;
    }
    
    # 文件上传服务
    location /api/upload {
        proxy_pass http://upload-service:8004;
        client_max_body_size 100M;
        proxy_request_buffering off;
        include /etc/nginx/proxy_params;
    }
}
```

## 静态文件服务
### 前端应用部署

```nginx
# React/Vue 单页应用配置
server {
    listen 80;
    server_name app.example.com;
    root /var/www/app/dist;
    index index.html;
    
    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_comp_level 9;
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # HTML 文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # SPA 路由处理
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend-api:8080/;
        include /etc/nginx/proxy_params;
    }
    
    # 安全头
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

### CDN 配置

```nginx
# CDN 静态资源服务
server {
    listen 80;
    server_name cdn.example.com;
    root /var/www/cdn;
    
    # 访问日志
    access_log /var/log/nginx/cdn.access.log;
    
    # 跨域设置
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    
    # 图片资源
    location ~* \.(jpg|jpeg|png|gif|webp|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        add_header Vary "Accept-Encoding";
        
        # 图片压缩
        image_filter_buffer 10M;
        image_filter_jpeg_quality 85;
        image_filter_transparency on;
    }
    
    # 字体文件
    location ~* \.(woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin *;
    }
    
    # CSS/JS 文件
    location ~* \.(css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }
    
    # 防盗链
    location ~* \.(jpg|jpeg|png|gif)$ {
        valid_referers none blocked server_names
                       *.example.com example.com
                       *.google.com *.baidu.com;
        if ($invalid_referer) {
            return 403;
        }
    }
}
```

## 缓存配置
### 代理缓存

```nginx
# 缓存配置
proxy_cache_path /var/cache/nginx/proxy
                 levels=1:2
                 keys_zone=api_cache:10m
                 max_size=1g
                 inactive=60m
                 use_temp_path=off;

server {
    listen 80;
    server_name cache.example.com;
    
    # API 缓存
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        
        # 缓存键
        proxy_cache_key $scheme$proxy_host$request_uri$is_args$args;
        
        # 缓存时间
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        
        # 缓存头
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://backend;
        include /etc/nginx/proxy_params;
    }
    
    # 缓存清理接口
    location ~ /purge(/.*) {
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
        
        proxy_cache_purge api_cache $scheme$proxy_host$1$is_args$args;
    }
}
```

### FastCGI 缓存

```nginx
# FastCGI 缓存配置
fastcgi_cache_path /var/cache/nginx/fastcgi
                   levels=1:2
                   keys_zone=php_cache:10m
                   max_size=1g
                   inactive=60m
                   use_temp_path=off;

server {
    listen 80;
    server_name php.example.com;
    root /var/www/php;
    
    # PHP 缓存
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        
        # 缓存设置
        fastcgi_cache php_cache;
        fastcgi_cache_key $scheme$request_method$host$request_uri;
        fastcgi_cache_valid 200 301 302 10m;
        fastcgi_cache_valid 404 1m;
        fastcgi_cache_use_stale error timeout updating invalid_header http_500 http_503;
        fastcgi_cache_background_update on;
        fastcgi_cache_lock on;
        
        # 缓存头
        add_header X-Cache-Status $upstream_cache_status;
        
        # 跳过缓存条件
        set $skip_cache 0;
        if ($request_method = POST) {
            set $skip_cache 1;
        }
        if ($query_string != "") {
            set $skip_cache 1;
        }
        if ($request_uri ~* "/admin/|/wp-admin/|/login") {
            set $skip_cache 1;
        }
        
        fastcgi_cache_bypass $skip_cache;
        fastcgi_no_cache $skip_cache;
    }
}
```

## 安全配置
### SSL/TLS 配置

```nginx
# SSL 最佳实践配置
server {
    listen 443 ssl http2;
    server_name secure.example.com;
    
    # SSL 证书
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;
    
    # SSL 协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # SSL 优化
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # 安全头
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
    
    location / {
        root /var/www/secure;
        index index.html;
    }
}
```

### 访问控制

```nginx
# 访问控制配置
server {
    listen 80;
    server_name admin.example.com;
    
    # IP 白名单
    location /admin {
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;
        
        proxy_pass http://admin-backend;
        include /etc/nginx/proxy_params;
    }
    
    # 基本认证
    location /private {
        auth_basic "Restricted Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://private-backend;
        include /etc/nginx/proxy_params;
    }
    
    # 限流配置
    location /api {
        limit_req zone=api burst=10 nodelay;
        limit_conn conn_limit_per_ip 10;
        
        proxy_pass http://api-backend;
        include /etc/nginx/proxy_params;
    }
}

# 限流区域定义
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
}
```

### 防护配置

```nginx
# 安全防护配置
server {
    listen 80;
    server_name protected.example.com;
    
    # 隐藏 Nginx 版本
    server_tokens off;
    
    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;
    
    # 防止 MIME 类型嗅探
    add_header X-Content-Type-Options "nosniff" always;
    
    # XSS 保护
    add_header X-XSS-Protection "1; mode=block" always;
    
    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止访问备份文件
    location ~* \.(bak|backup|old|orig|original|tmp)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # 禁止执行 PHP 文件的目录
    location /uploads {
        location ~ \.php$ {
            deny all;
        }
    }
    
    # 防止 SQL 注入和 XSS 攻击
    if ($args ~* "(union|select|insert|delete|update|drop|create|alter|exec|script|alert|prompt|confirm)") {
        return 403;
    }
    
    # User-Agent 过滤
    if ($http_user_agent ~* "(nmap|nikto|wikto|sf|sqlmap|bsqlbf|w3af|acunetix|havij|appscan)") {
        return 403;
    }
}
```

## 性能优化
### 连接优化

```nginx
# nginx.conf 性能优化
worker_processes auto;
worker_cpu_affinity auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
    accept_mutex off;
}

http {
    # 连接优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    # 缓冲区优化
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    output_buffers 1 32k;
    postpone_output 1460;
    
    # 超时设置
    client_header_timeout 3m;
    client_body_timeout 3m;
    send_timeout 3m;
    
    # 压缩优化
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 文件缓存
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 监控配置

```nginx
# 状态监控
server {
    listen 8080;
    server_name localhost;
    
    # Nginx 状态
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Prometheus 指标
    location /metrics {
        access_log off;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
        
        content_by_lua_block {
            local prometheus = require "resty.prometheus"
            prometheus:collect()
        }
    }
}
```

## Docker 部署
### Dockerfile

```dockerfile
# Dockerfile
FROM nginx:alpine

# 安装必要工具
RUN apk add --no-cache \
    curl \
    vim \
    tzdata

# 设置时区
RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/
COPY ssl/ /etc/ssl/

# 创建必要目录
RUN mkdir -p /var/cache/nginx/proxy && \
    mkdir -p /var/cache/nginx/fastcgi && \
    mkdir -p /var/log/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  nginx:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./ssl:/etc/ssl:ro
      - ./logs:/var/log/nginx
      - ./cache:/var/cache/nginx
      - ./html:/var/www/html:ro
    environment:
      - TZ=Asia/Shanghai
    networks:
      - web
    restart: unless-stopped
    depends_on:
      - app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  app:
    image: node:16-alpine
    working_dir: /app
    volumes:
      - ./app:/app
    command: npm start
    networks:
      - web
    environment:
      - NODE_ENV=production
    restart: unless-stopped

networks:
  web:
    driver: bridge

volumes:
  nginx_cache:
  nginx_logs:
```

## 故障排除
### 常见问题

```bash
# 检查配置语法
nginx -t

# 重新加载配置
nginx -s reload

# 查看错误日志
tail -f /var/log/nginx/error.log

# 查看访问日志
tail -f /var/log/nginx/access.log

# 检查进程状态
ps aux | grep nginx

# 检查端口占用
netstat -tlnp | grep :80

# 测试上游服务器
curl -I http://backend-server:8080/health

# 检查 SSL 证书
openssl x509 -in /etc/ssl/certs/example.com.crt -text -noout

# 测试 SSL 配置
openssl s_client -connect example.com:443 -servername example.com
```

### 性能调优

```bash
# 系统优化
# /etc/sysctl.conf
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 5000

# 应用优化
sysctl -p

# 文件描述符限制
# /etc/security/limits.conf
nginx soft nofile 65535
nginx hard nofile 65535

# 监控脚本
#!/bin/bash
# monitor.sh
while true; do
    echo "$(date): Active connections: $(curl -s http://localhost:8080/nginx_status | grep 'Active connections' | awk '{print $3}')"
    sleep 10
done
```

## 最佳实践
### 配置管理

1. **模块化配置**
   - 使用 `include` 指令分离配置
   - 按功能组织配置文件
   - 使用变量和映射简化配置

2. **安全配置**
   - 定期更新 SSL 证书
   - 配置安全头
   - 实施访问控制和限流

3. **性能优化**
   - 启用压缩和缓存
   - 优化缓冲区和超时设置
   - 使用 HTTP/2 和 Keep-Alive

4. **监控和日志**
   - 配置结构化日志
   - 实施健康检查
   - 监控关键指标

## 参考资源
### 官方文档

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Nginx 配置指南](https://www.nginx.com/resources/wiki/)
- [SSL 配置生成器](https://ssl-config.mozilla.org/)

### 学习资源

- [Nginx 高性能 Web 服务器详解](https://book.douban.com/subject/26745255/)
- [实战 Nginx](https://book.douban.com/subject/27129519/)
- [Nginx 开发从入门到精通](http://tengine.taobao.org/book/)

---

> 💡 **提示**：Nginx 配置需要根据具体业务场景进行调优，建议在生产环境部署前进行充分的压力测试！