# PM2 进程管理

## 简介

PM2 是一个功能强大的 Node.js 应用程序进程管理器，提供了生产环境下的进程管理、负载均衡、监控和日志管理等功能。

### 核心特性
- **进程管理**：启动、停止、重启、删除应用进程
- **集群模式**：自动负载均衡和多核 CPU 利用
- **监控面板**：实时监控应用状态和性能指标
- **日志管理**：集中化日志收集和轮转
- **自动重启**：应用崩溃时自动重启
- **零停机部署**：平滑重启和热重载
- **内存监控**：内存泄漏检测和自动重启

### 应用场景
- **生产环境部署**：稳定的进程管理和监控
- **开发环境**：自动重启和文件监听
- **微服务架构**：多服务进程管理
- **负载均衡**：单机多进程负载分发
- **CI/CD 集成**：自动化部署流程

## 安装与配置

### 全局安装

```bash
# 使用 npm 安装
npm install -g pm2

# 使用 yarn 安装
yarn global add pm2

# 验证安装
pm2 --version

# 查看帮助
pm2 help
```

### 基础配置

```bash
# 设置 PM2 开机自启
pm2 startup

# 保存当前进程列表
pm2 save

# 恢复保存的进程列表
pm2 resurrect

# 更新 PM2
pm2 update
```

## 基础使用

### 启动应用

```bash
# 启动应用
pm2 start app.js

# 指定应用名称
pm2 start app.js --name "my-app"

# 启动并监听文件变化
pm2 start app.js --watch

# 指定启动模式
pm2 start app.js --name "api-server" --instances 4

# 使用集群模式
pm2 start app.js -i max  # 使用所有 CPU 核心
pm2 start app.js -i 4    # 使用 4 个实例

# 启动 TypeScript 应用
pm2 start app.ts --interpreter ts-node

# 启动 Python 应用
pm2 start app.py --interpreter python3
```

### 进程管理

```bash
# 查看所有进程
pm2 list
pm2 ls
pm2 status

# 查看详细信息
pm2 show <app_name|id>
pm2 describe <app_name|id>

# 停止应用
pm2 stop <app_name|id>
pm2 stop all

# 重启应用
pm2 restart <app_name|id>
pm2 restart all

# 重新加载应用（零停机）
pm2 reload <app_name|id>
pm2 reload all

# 删除应用
pm2 delete <app_name|id>
pm2 delete all

# 优雅停止
pm2 gracefulReload <app_name|id>
```

### 日志管理

```bash
# 查看实时日志
pm2 logs
pm2 logs <app_name|id>

# 查看错误日志
pm2 logs --err

# 清空日志
pm2 flush

# 重新加载日志
pm2 reloadLogs

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

## 配置文件管理

### ecosystem.config.js

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      // 基础配置
      name: 'api-server',
      script: './src/app.js',
      cwd: '/var/www/api-server',

      // 实例配置
      instances: 'max', // 或具体数字
      exec_mode: 'cluster', // 或 'fork'

      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        DB_HOST: 'localhost'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 8080,
        DB_HOST: 'prod-db.example.com'
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 8081,
        DB_HOST: 'staging-db.example.com'
      },

      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // 监控配置
      watch: false, // 生产环境建议关闭
      watch_delay: 1000,
      ignore_watch: ['node_modules', 'logs'],

      // 重启配置
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // 其他配置
      node_args: '--max-old-space-size=4096',
      args: '--port=3000',
      interpreter: 'node',
      interpreter_args: '--harmony',

      // 自动重启条件
      autorestart: true,
      cron_restart: '0 2 * * *', // 每天凌晨2点重启

      // 进程间通信
      listen_timeout: 3000,
      kill_timeout: 5000,

      // 源码映射
      source_map_support: true,

      // 合并日志
      merge_logs: true,

      // 时间戳
      time: true
    },

    // 多应用配置
    {
      name: 'worker-service',
      script: './src/worker.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        WORKER_TYPE: 'email'
      },
      env_production: {
        NODE_ENV: 'production',
        WORKER_TYPE: 'email'
      }
    },

    {
      name: 'scheduler',
      script: './src/scheduler.js',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 0 * * *', // 每天重启
      env: {
        NODE_ENV: 'development'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],

  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: ['server1.example.com', 'server2.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:username/repo.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },

    staging: {
      user: 'deploy',
      host: 'staging.example.com',
      ref: 'origin/develop',
      repo: 'git@github.com:username/repo.git',
      path: '/var/www/staging',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env staging'
    }
  }
}
```

### 使用配置文件

```bash
# 启动配置文件中的所有应用
pm2 start ecosystem.config.js

# 指定环境启动
pm2 start ecosystem.config.js --env production

# 重启配置文件中的应用
pm2 restart ecosystem.config.js

# 停止配置文件中的应用
pm2 stop ecosystem.config.js

# 删除配置文件中的应用
pm2 delete ecosystem.config.js
```

## 集群模式与负载均衡

### 集群配置

```javascript
// cluster-app.js
const express = require('express')
const cluster = require('cluster')
const os = require('os')

const app = express()
const PORT = process.env.PORT || 3000

// 添加进程信息到响应
app.use((req, res, next) => {
  res.setHeader('X-Process-ID', process.pid)
  res.setHeader('X-Worker-ID', cluster.worker?.id || 'master')
  next()
})

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from PM2 Cluster!',
    pid: process.pid,
    workerId: cluster.worker?.id,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  })
})

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    pid: process.pid,
    uptime: process.uptime()
  })
})

// 模拟 CPU 密集型任务
app.get('/cpu-intensive', (req, res) => {
  const start = Date.now()

  // 模拟计算
  let result = 0
  for (let i = 0; i < 1000000; i++) {
    result += Math.random()
  }

  res.json({
    result,
    duration: Date.now() - start,
    pid: process.pid
  })
})

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log(`Worker ${process.pid} received SIGINT, shutting down gracefully`)

  server.close(() => {
    console.log(`Worker ${process.pid} closed all connections`)
    process.exit(0)
  })

  // 强制退出超时
  setTimeout(() => {
    console.log(`Worker ${process.pid} force exit`)
    process.exit(1)
  }, 10000)
})

const server = app.listen(PORT, () => {
  console.log(`Worker ${process.pid} listening on port ${PORT}`)
})

module.exports = app
```

### 负载均衡测试

```javascript
// load-test.js
const http = require('http')

class LoadTester {
  constructor(options = {}) {
    this.host = options.host || 'localhost'
    this.port = options.port || 3000
    this.concurrency = options.concurrency || 10
    this.duration = options.duration || 30000 // 30秒
    this.results = {
      requests: 0,
      responses: 0,
      errors: 0,
      pids: new Set(),
      responseTimes: []
    }
  }

  async start() {
    console.log(`开始负载测试: ${this.concurrency} 并发, ${this.duration}ms 持续时间`)

    const startTime = Date.now()
    const workers = []

    // 启动并发工作者
    for (let i = 0; i < this.concurrency; i++) {
      workers.push(this.worker(startTime))
    }

    // 等待所有工作者完成
    await Promise.all(workers)

    this.printResults()
  }

  async worker(startTime) {
    while (Date.now() - startTime < this.duration) {
      try {
        const result = await this.makeRequest()
        this.results.responses++
        this.results.pids.add(result.pid)
        this.results.responseTimes.push(result.responseTime)
      } catch (error) {
        this.results.errors++
      }

      this.results.requests++

      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }

  makeRequest() {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()

      const req = http.request({
        hostname: this.host,
        port: this.port,
        path: '/',
        method: 'GET'
      }, (res) => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          try {
            const responseTime = Date.now() - startTime
            const body = JSON.parse(data)

            resolve({
              pid: body.pid,
              responseTime,
              statusCode: res.statusCode
            })
          } catch (error) {
            reject(error)
          }
        })
      })

      req.on('error', reject)
      req.setTimeout(5000, () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      req.end()
    })
  }

  printResults() {
    const avgResponseTime = this.results.responseTimes.reduce((a, b) => a + b, 0) / this.results.responseTimes.length
    const rps = this.results.responses / (this.duration / 1000)

    console.log('\n=== 负载测试结果 ===')
    console.log(`总请求数: ${this.results.requests}`)
    console.log(`成功响应: ${this.results.responses}`)
    console.log(`错误数量: ${this.results.errors}`)
    console.log(`平均响应时间: ${avgResponseTime.toFixed(2)}ms`)
    console.log(`每秒请求数: ${rps.toFixed(2)} RPS`)
    console.log(`负载均衡到的进程数: ${this.results.pids.size}`)
    console.log(`进程 PIDs: ${Array.from(this.results.pids).join(', ')}`)
  }
}

// 运行测试
if (require.main === module) {
  const tester = new LoadTester({
    concurrency: 20,
    duration: 10000
  })

  tester.start().catch(console.error)
}

module.exports = LoadTester
```

## 监控与性能分析

### 实时监控

```bash
# 实时监控面板
pm2 monit

# 查看进程详情
pm2 show <app_name>

# 查看进程列表
pm2 list

# 查看内存使用
pm2 list --sort memory

# 查看 CPU 使用
pm2 list --sort cpu
```

### Web 监控面板

```bash
# 安装 PM2 Plus（原 Keymetrics）
npm install -g @pm2/pm2-plus-cli

# 连接到 PM2 Plus
pm2 plus

# 或使用本地 Web 界面
pm2 web
```

### 自定义监控脚本

```javascript
// monitor.js
const pm2 = require('pm2')
const fs = require('fs').promises
const path = require('path')

class PM2Monitor {
  constructor(options = {}) {
    this.interval = options.interval || 30000 // 30秒
    this.logFile = options.logFile || './pm2-monitor.log'
    this.alertThresholds = {
      memory: options.memoryThreshold || 500 * 1024 * 1024, // 500MB
      cpu: options.cpuThreshold || 80, // 80%
      restarts: options.restartsThreshold || 5 // 5次重启
    }
  }

  async start() {
    console.log('启动 PM2 监控...')

    // 连接到 PM2
    await new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    // 开始监控循环
    this.monitorLoop()

    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('停止监控...')
      pm2.disconnect()
      process.exit(0)
    })
  }

  async monitorLoop() {
    try {
      const processes = await this.getProcessList()
      const monitorData = await this.collectMetrics(processes)

      await this.checkAlerts(monitorData)
      await this.logMetrics(monitorData)

      console.log(`监控完成 - ${new Date().toISOString()}`)
    } catch (error) {
      console.error('监控错误:', error)
    }

    setTimeout(() => this.monitorLoop(), this.interval)
  }

  getProcessList() {
    return new Promise((resolve, reject) => {
      pm2.list((err, processes) => {
        if (err) reject(err)
        else resolve(processes)
      })
    })
  }

  async collectMetrics(processes) {
    const metrics = {
      timestamp: new Date().toISOString(),
      totalProcesses: processes.length,
      runningProcesses: processes.filter(p => p.pm2_env.status === 'online').length,
      processes: []
    }

    for (const proc of processes) {
      const procMetrics = {
        name: proc.name,
        pid: proc.pid,
        status: proc.pm2_env.status,
        uptime: Date.now() - proc.pm2_env.pm_uptime,
        restarts: proc.pm2_env.restart_time,
        memory: proc.monit.memory,
        cpu: proc.monit.cpu,
        instances: proc.pm2_env.instances || 1
      }

      metrics.processes.push(procMetrics)
    }

    return metrics
  }

  async checkAlerts(metrics) {
    for (const proc of metrics.processes) {
      // 内存告警
      if (proc.memory > this.alertThresholds.memory) {
        await this.sendAlert('HIGH_MEMORY', {
          process: proc.name,
          memory: `${(proc.memory / 1024 / 1024).toFixed(2)}MB`,
          threshold: `${(this.alertThresholds.memory / 1024 / 1024).toFixed(2)}MB`
        })
      }

      // CPU 告警
      if (proc.cpu > this.alertThresholds.cpu) {
        await this.sendAlert('HIGH_CPU', {
          process: proc.name,
          cpu: `${proc.cpu}%`,
          threshold: `${this.alertThresholds.cpu}%`
        })
      }

      // 重启次数告警
      if (proc.restarts > this.alertThresholds.restarts) {
        await this.sendAlert('HIGH_RESTARTS', {
          process: proc.name,
          restarts: proc.restarts,
          threshold: this.alertThresholds.restarts
        })
      }

      // 进程停止告警
      if (proc.status !== 'online') {
        await this.sendAlert('PROCESS_DOWN', {
          process: proc.name,
          status: proc.status
        })
      }
    }
  }

  async sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      data
    }

    console.log(`🚨 告警: ${type}`, data)

    // 这里可以集成邮件、Slack、钉钉等通知
    // await this.sendEmail(alert)
    // await this.sendSlack(alert)
  }

  async logMetrics(metrics) {
    const logEntry = JSON.stringify(metrics) + '\n'
    await fs.appendFile(this.logFile, logEntry)
  }
}

// 启动监控
if (require.main === module) {
  const monitor = new PM2Monitor({
    interval: 10000, // 10秒
    memoryThreshold: 200 * 1024 * 1024, // 200MB
    cpuThreshold: 70 // 70%
  })

  monitor.start().catch(console.error)
}

module.exports = PM2Monitor
```

## 部署与 CI/CD 集成

### 自动化部署脚本

```bash
#!/bin/bash
# deploy.sh

set -e

# 配置变量
APP_NAME="my-app"
APP_DIR="/var/www/my-app"
REPO_URL="git@github.com:username/my-app.git"
BRANCH="main"
NODE_ENV="production"

echo "开始部署 $APP_NAME..."

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "错误: PM2 未安装"
    exit 1
fi

# 进入应用目录
cd $APP_DIR

# 拉取最新代码
echo "拉取最新代码..."
git fetch origin
git reset --hard origin/$BRANCH

# 安装依赖
echo "安装依赖..."
npm ci --production

# 运行测试
echo "运行测试..."
npm test

# 构建应用
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    echo "构建应用..."
    npm run build
fi

# 备份当前进程状态
echo "备份当前进程状态..."
pm2 save

# 重新加载应用（零停机部署）
echo "重新加载应用..."
if pm2 list | grep -q $APP_NAME; then
    pm2 reload $APP_NAME --env $NODE_ENV
else
    pm2 start ecosystem.config.js --env $NODE_ENV
fi

# 等待应用启动
echo "等待应用启动..."
sleep 5

# 健康检查
echo "执行健康检查..."
for i in {1..10}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "健康检查通过"
        break
    fi

    if [ $i -eq 10 ]; then
        echo "健康检查失败，回滚部署"
        pm2 resurrect
        exit 1
    fi

    echo "等待应用启动... ($i/10)"
    sleep 3
done

# 清理旧日志
echo "清理旧日志..."
pm2 flush

# 保存新的进程状态
pm2 save

echo "部署完成！"
pm2 status
```

### GitHub Actions 集成

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Run linting
      run: npm run lint

    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/my-app
          git pull origin main
          npm ci --production
          npm run build
          pm2 reload ecosystem.config.js --env production
          pm2 save

    - name: Health check
      run: |
        sleep 10
        curl -f ${{ secrets.APP_URL }}/health

    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        channel: '#deployments'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

### Docker 集成

```dockerfile
# Dockerfile
FROM node:18-alpine

# 安装 PM2
RUN npm install -g pm2

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# 创建日志目录
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    volumes:
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

## 高级功能

### 内存监控与自动重启

```javascript
// memory-monitor.js
const pm2 = require('pm2')

class MemoryMonitor {
  constructor(options = {}) {
    this.maxMemory = options.maxMemory || 500 * 1024 * 1024 // 500MB
    this.checkInterval = options.checkInterval || 30000 // 30秒
    this.gracePeriod = options.gracePeriod || 60000 // 1分钟
    this.memoryHistory = new Map()
  }

  async start() {
    console.log('启动内存监控...')

    await new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    setInterval(() => this.checkMemory(), this.checkInterval)
  }

  async checkMemory() {
    try {
      const processes = await this.getProcessList()

      for (const proc of processes) {
        if (proc.pm2_env.status !== 'online') continue

        const memoryUsage = proc.monit.memory
        const processName = proc.name

        // 记录内存历史
        if (!this.memoryHistory.has(processName)) {
          this.memoryHistory.set(processName, [])
        }

        const history = this.memoryHistory.get(processName)
        history.push({
          timestamp: Date.now(),
          memory: memoryUsage
        })

        // 保留最近10分钟的数据
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000
        this.memoryHistory.set(
          processName,
          history.filter(h => h.timestamp > tenMinutesAgo)
        )

        // 检查是否需要重启
        if (this.shouldRestart(processName, memoryUsage)) {
          await this.restartProcess(proc)
        }
      }
    } catch (error) {
      console.error('内存检查错误:', error)
    }
  }

  shouldRestart(processName, currentMemory) {
    if (currentMemory < this.maxMemory) return false

    const history = this.memoryHistory.get(processName) || []

    // 检查是否持续超过阈值
    const recentHistory = history.filter(
      h => h.timestamp > Date.now() - this.gracePeriod
    )

    return recentHistory.length > 0 &&
           recentHistory.every(h => h.memory > this.maxMemory)
  }

  async restartProcess(proc) {
    console.log(`重启进程 ${proc.name} (PID: ${proc.pid}) - 内存使用: ${(proc.monit.memory / 1024 / 1024).toFixed(2)}MB`)

    return new Promise((resolve, reject) => {
      pm2.restart(proc.pm_id, (err) => {
        if (err) {
          console.error(`重启失败:`, err)
          reject(err)
        } else {
          console.log(`进程 ${proc.name} 重启成功`)
          resolve()
        }
      })
    })
  }

  getProcessList() {
    return new Promise((resolve, reject) => {
      pm2.list((err, processes) => {
        if (err) reject(err)
        else resolve(processes)
      })
    })
  }
}

// 启动内存监控
if (require.main === module) {
  const monitor = new MemoryMonitor({
    maxMemory: 300 * 1024 * 1024, // 300MB
    checkInterval: 15000, // 15秒
    gracePeriod: 45000 // 45秒
  })

  monitor.start().catch(console.error)
}

module.exports = MemoryMonitor
```

### 自定义指标收集

```javascript
// metrics-collector.js
const pm2 = require('pm2')
const http = require('http')
const url = require('url')

class MetricsCollector {
  constructor(options = {}) {
    this.port = options.port || 9090
    this.interval = options.interval || 5000
    this.metrics = {
      pm2_processes_total: 0,
      pm2_processes_online: 0,
      pm2_processes_stopped: 0,
      pm2_processes_errored: 0,
      pm2_memory_usage_bytes: {},
      pm2_cpu_usage_percent: {},
      pm2_restart_count: {},
      pm2_uptime_seconds: {}
    }

    this.startMetricsCollection()
    this.startHttpServer()
  }

  startMetricsCollection() {
    setInterval(async () => {
      try {
        await this.collectMetrics()
      } catch (error) {
        console.error('指标收集错误:', error)
      }
    }, this.interval)
  }

  async collectMetrics() {
    const processes = await this.getProcessList()

    // 重置计数器
    this.metrics.pm2_processes_total = processes.length
    this.metrics.pm2_processes_online = 0
    this.metrics.pm2_processes_stopped = 0
    this.metrics.pm2_processes_errored = 0

    for (const proc of processes) {
      const name = proc.name
      const status = proc.pm2_env.status

      // 状态统计
      if (status === 'online') {
        this.metrics.pm2_processes_online++
      } else if (status === 'stopped') {
        this.metrics.pm2_processes_stopped++
      } else {
        this.metrics.pm2_processes_errored++
      }

      // 进程指标
      this.metrics.pm2_memory_usage_bytes[name] = proc.monit.memory || 0
      this.metrics.pm2_cpu_usage_percent[name] = proc.monit.cpu || 0
      this.metrics.pm2_restart_count[name] = proc.pm2_env.restart_time || 0
      this.metrics.pm2_uptime_seconds[name] = status === 'online'
        ? Math.floor((Date.now() - proc.pm2_env.pm_uptime) / 1000)
        : 0
    }
  }

  startHttpServer() {
    const server = http.createServer((req, res) => {
      const pathname = url.parse(req.url).pathname

      if (pathname === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(this.formatPrometheusMetrics())
      } else if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ status: 'healthy' }))
      } else {
        res.writeHead(404)
        res.end('Not Found')
      }
    })

    server.listen(this.port, () => {
      console.log(`指标服务器启动在端口 ${this.port}`)
    })
  }

  formatPrometheusMetrics() {
    let output = ''

    // 总进程数
    output += `# HELP pm2_processes_total Total number of PM2 processes\n`
    output += `# TYPE pm2_processes_total gauge\n`
    output += `pm2_processes_total ${this.metrics.pm2_processes_total}\n\n`

    // 在线进程数
    output += `# HELP pm2_processes_online Number of online PM2 processes\n`
    output += `# TYPE pm2_processes_online gauge\n`
    output += `pm2_processes_online ${this.metrics.pm2_processes_online}\n\n`

    // 停止进程数
    output += `# HELP pm2_processes_stopped Number of stopped PM2 processes\n`
    output += `# TYPE pm2_processes_stopped gauge\n`
    output += `pm2_processes_stopped ${this.metrics.pm2_processes_stopped}\n\n`

    // 错误进程数
    output += `# HELP pm2_processes_errored Number of errored PM2 processes\n`
    output += `# TYPE pm2_processes_errored gauge\n`
    output += `pm2_processes_errored ${this.metrics.pm2_processes_errored}\n\n`

    // 内存使用
    output += `# HELP pm2_memory_usage_bytes Memory usage of PM2 processes in bytes\n`
    output += `# TYPE pm2_memory_usage_bytes gauge\n`
    for (const [name, value] of Object.entries(this.metrics.pm2_memory_usage_bytes)) {
      output += `pm2_memory_usage_bytes{name="${name}"} ${value}\n`
    }
    output += '\n'

    // CPU 使用
    output += `# HELP pm2_cpu_usage_percent CPU usage of PM2 processes in percent\n`
    output += `# TYPE pm2_cpu_usage_percent gauge\n`
    for (const [name, value] of Object.entries(this.metrics.pm2_cpu_usage_percent)) {
      output += `pm2_cpu_usage_percent{name="${name}"} ${value}\n`
    }
    output += '\n'

    // 重启次数
    output += `# HELP pm2_restart_count Number of restarts for PM2 processes\n`
    output += `# TYPE pm2_restart_count counter\n`
    for (const [name, value] of Object.entries(this.metrics.pm2_restart_count)) {
      output += `pm2_restart_count{name="${name}"} ${value}\n`
    }
    output += '\n'

    // 运行时间
    output += `# HELP pm2_uptime_seconds Uptime of PM2 processes in seconds\n`
    output += `# TYPE pm2_uptime_seconds gauge\n`
    for (const [name, value] of Object.entries(this.metrics.pm2_uptime_seconds)) {
      output += `pm2_uptime_seconds{name="${name}"} ${value}\n`
    }

    return output
  }

  getProcessList() {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) return reject(err)

        pm2.list((err, processes) => {
          if (err) reject(err)
          else resolve(processes)
        })
      })
    })
  }
}

// 启动指标收集器
if (require.main === module) {
  new MetricsCollector({
    port: 9090,
    interval: 5000
  })
}

module.exports = MetricsCollector
```

## 故障排除

### 常见问题解决

```bash
# PM2 进程无法启动
# 检查日志
pm2 logs <app_name> --err

# 检查配置文件
pm2 prettylist

# 重置 PM2
pm2 kill
pm2 resurrect

# 权限问题
sudo chown -R $USER:$USER ~/.pm2

# 端口占用问题
lsof -i :3000
kill -9 <PID>

# 内存不足
# 检查系统内存
free -h

# 检查 PM2 进程内存
pm2 list --sort memory

# 重启高内存进程
pm2 restart <app_name>

# 文件描述符限制
ulimit -n
ulimit -n 65536

# 永久设置
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

### 调试脚本

```bash
#!/bin/bash
# debug-pm2.sh

echo "=== PM2 调试信息 ==="
echo

echo "1. PM2 版本信息:"
pm2 --version
echo

echo "2. PM2 进程列表:"
pm2 list
echo

echo "3. PM2 配置信息:"
pm2 conf
echo

echo "4. 系统资源使用:"
echo "内存使用:"
free -h
echo
echo "磁盘使用:"
df -h
echo
echo "CPU 负载:"
uptime
echo

echo "5. 网络端口占用:"
netstat -tlnp | grep :3000
echo

echo "6. PM2 日志目录:"
ls -la ~/.pm2/logs/
echo

echo "7. 最近的错误日志:"
pm2 logs --err --lines 20
echo

echo "8. 进程详细信息:"
for app in $(pm2 jlist | jq -r '.[].name' 2>/dev/null); do
    echo "--- $app ---"
    pm2 show $app
    echo
done

echo "调试信息收集完成"
```

## 最佳实践

### 生产环境配置

```javascript
// production.ecosystem.config.js
module.exports = {
  apps: [{
    name: 'production-app',
    script: './dist/app.js',

    // 生产环境推荐配置
    instances: 'max',
    exec_mode: 'cluster',

    // 环境变量
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // 日志配置
    log_file: '/var/log/app/combined.log',
    out_file: '/var/log/app/out.log',
    error_file: '/var/log/app/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 监控配置
    watch: false, // 生产环境关闭文件监听

    // 重启配置
    max_restarts: 5,
    min_uptime: '10s',
    max_memory_restart: '1G',

    // 性能优化
    node_args: '--max-old-space-size=2048',

    // 优雅关闭
    kill_timeout: 5000,
    listen_timeout: 3000,

    // 自动重启
    autorestart: true,

    // 定时重启（可选）
    cron_restart: '0 2 * * *' // 每天凌晨2点重启
  }]
}
```

### 安全配置

```bash
# 创建专用用户
sudo useradd -r -s /bin/false pm2user

# 设置目录权限
sudo mkdir -p /var/www/app
sudo chown pm2user:pm2user /var/www/app

# 限制资源使用
echo "pm2user soft nproc 1024" | sudo tee -a /etc/security/limits.conf
echo "pm2user hard nproc 2048" | sudo tee -a /etc/security/limits.conf
echo "pm2user soft nofile 4096" | sudo tee -a /etc/security/limits.conf
echo "pm2user hard nofile 8192" | sudo tee -a /etc/security/limits.conf

# 使用 systemd 管理 PM2
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u pm2user --hp /home/pm2user
```

### 监控集成

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'pm2'
    static_configs:
      - targets: ['localhost:9090']
    scrape_interval: 5s
    metrics_path: /metrics
```

```yaml
# grafana-dashboard.json
{
  "dashboard": {
    "title": "PM2 监控",
    "panels": [
      {
        "title": "进程状态",
        "type": "stat",
        "targets": [
          {
            "expr": "pm2_processes_online",
            "legendFormat": "在线"
          },
          {
            "expr": "pm2_processes_stopped",
            "legendFormat": "停止"
          }
        ]
      },
      {
        "title": "内存使用",
        "type": "graph",
        "targets": [
          {
            "expr": "pm2_memory_usage_bytes",
            "legendFormat": "{{name}}"
          }
        ]
      },
      {
        "title": "CPU 使用率",
        "type": "graph",
        "targets": [
          {
            "expr": "pm2_cpu_usage_percent",
            "legendFormat": "{{name}}"
          }
        ]
      }
    ]
  }
}
```

## 参考资源

### 📚 学习资源
- [PM2 官方文档](https://pm2.keymetrics.io/docs/)
- [PM2 GitHub 仓库](https://github.com/Unitech/pm2)
- [Node.js 集群模式指南](https://nodejs.org/api/cluster.html)
- [进程管理最佳实践](https://12factor.net/processes)

### 🛠️ 相关工具
- **监控工具**: PM2 Plus, Prometheus, Grafana
- **日志管理**: Winston, Bunyan, ELK Stack
- **负载均衡**: Nginx, HAProxy, AWS ALB
- **容器化**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins

### 📖 进阶主题
- [微服务架构下的进程管理](https://microservices.io/)
- [容器化 vs PM2 对比](https://blog.logrocket.com/pm2-vs-docker/)
- [Node.js 性能优化](https://nodejs.org/en/docs/guides/simple-profiling/)
- [生产环境部署清单](https://github.com/goldbergyoni/nodebestpractices)

---

> 💡 **提示**：PM2 是 Node.js 应用生产环境部署的利器，合理配置和监控能够大大提升应用的稳定性和性能！
