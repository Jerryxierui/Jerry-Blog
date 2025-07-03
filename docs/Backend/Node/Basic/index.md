# Node.js 基础

## 简介

Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 能够在服务器端运行。它采用事件驱动、非阻塞 I/O 模型，使其轻量且高效，特别适合构建数据密集型的实时应用程序。

### 核心特性

- **事件驱动架构**：基于事件循环的异步编程模型
- **非阻塞 I/O**：高效处理并发请求
- **单线程模型**：主线程单线程，I/O 操作多线程
- **跨平台**：支持 Windows、macOS、Linux
- **丰富的生态系统**：npm 包管理器和庞大的第三方库
- **快速执行**：基于 V8 引擎的高性能 JavaScript 执行

### 适用场景

- Web 应用程序和 API 服务
- 实时应用（聊天应用、游戏服务器）
- 微服务架构
- 命令行工具
- 桌面应用程序（Electron）
- IoT 应用程序

## 环境搭建

### 安装 Node.js

```bash
# 使用官方安装包
# 访问 https://nodejs.org 下载 LTS 版本

# 使用 nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts

# 使用 Homebrew (macOS)
brew install node

# 使用包管理器 (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 验证安装

```bash
# 检查 Node.js 版本
node --version
# 或
node -v

# 检查 npm 版本
npm --version
# 或
npm -v

# 检查安装路径
which node
which npm
```

### 项目初始化

```bash
# 创建项目目录
mkdir my-node-app
cd my-node-app

# 初始化 package.json
npm init -y

# 或交互式初始化
npm init
```

## 核心概念

### 1. 模块系统

#### CommonJS 模块

```javascript
// math.js - 导出模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// 导出方式 1：逐个导出
exports.add = add;
exports.subtract = subtract;

// 导出方式 2：批量导出
module.exports = {
  add,
  subtract,
  multiply,
  divide
};

// 导出方式 3：导出单个函数或类
module.exports = class Calculator {
  static add(a, b) {
    return a + b;
  }
  
  static subtract(a, b) {
    return a - b;
  }
  
  static multiply(a, b) {
    return a * b;
  }
  
  static divide(a, b) {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }
};
```

```javascript
// app.js - 导入模块
const math = require('./math');
const { add, subtract } = require('./math');
const Calculator = require('./math');

// 使用导入的模块
console.log('Addition:', math.add(5, 3));
console.log('Subtraction:', subtract(5, 3));
console.log('Multiplication:', Calculator.multiply(5, 3));

// 导入内置模块
const fs = require('fs');
const path = require('path');
const http = require('http');

// 导入第三方模块
const express = require('express');
const lodash = require('lodash');
```

#### ES6 模块 (ESM)

```javascript
// math.mjs - ES6 模块
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

export function multiply(a, b) {
  return a * b;
}

export function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

// 默认导出
export default class Calculator {
  static add(a, b) {
    return a + b;
  }
  
  static subtract(a, b) {
    return a - b;
  }
}

// 批量导出
const PI = 3.14159;
const E = 2.71828;

export { PI, E };
```

```javascript
// app.mjs - 导入 ES6 模块
import Calculator, { add, subtract, PI } from './math.mjs';
import * as math from './math.mjs';

// 使用导入的模块
console.log('Addition:', add(5, 3));
console.log('Calculator:', Calculator.add(5, 3));
console.log('PI:', PI);
console.log('All math functions:', math);

// 动态导入
async function loadMath() {
  const mathModule = await import('./math.mjs');
  console.log('Dynamic import:', mathModule.add(2, 3));
}

loadMath();
```

### 2. 事件循环

```javascript
// 事件循环示例
console.log('Start');

// 宏任务：setTimeout
setTimeout(() => {
  console.log('Timeout 1');
}, 0);

setTimeout(() => {
  console.log('Timeout 2');
}, 0);

// 微任务：Promise
Promise.resolve().then(() => {
  console.log('Promise 1');
}).then(() => {
  console.log('Promise 2');
});

// 立即执行：setImmediate
setImmediate(() => {
  console.log('Immediate 1');
});

// 下一个事件循环：process.nextTick
process.nextTick(() => {
  console.log('Next Tick 1');
});

process.nextTick(() => {
  console.log('Next Tick 2');
});

console.log('End');

// 输出顺序：
// Start
// End
// Next Tick 1
// Next Tick 2
// Promise 1
// Promise 2
// Timeout 1
// Timeout 2
// Immediate 1
```

### 3. 异步编程

#### 回调函数

```javascript
const fs = require('fs');

// 回调函数示例
function readFileCallback(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, data);
  });
}

// 使用回调函数
readFileCallback('example.txt', (err, data) => {
  if (err) {
    console.error('Error reading file:', err.message);
    return;
  }
  console.log('File content:', data);
});

// 回调地狱示例
fs.readFile('file1.txt', 'utf8', (err1, data1) => {
  if (err1) throw err1;
  
  fs.readFile('file2.txt', 'utf8', (err2, data2) => {
    if (err2) throw err2;
    
    fs.readFile('file3.txt', 'utf8', (err3, data3) => {
      if (err3) throw err3;
      
      console.log('All files read:', { data1, data2, data3 });
    });
  });
});
```

#### Promise

```javascript
const fs = require('fs').promises;

// Promise 示例
function readFilePromise(filename) {
  return fs.readFile(filename, 'utf8');
}

// 使用 Promise
readFilePromise('example.txt')
  .then(data => {
    console.log('File content:', data);
  })
  .catch(err => {
    console.error('Error reading file:', err.message);
  });

// Promise 链
readFilePromise('file1.txt')
  .then(data1 => {
    console.log('File 1:', data1);
    return readFilePromise('file2.txt');
  })
  .then(data2 => {
    console.log('File 2:', data2);
    return readFilePromise('file3.txt');
  })
  .then(data3 => {
    console.log('File 3:', data3);
  })
  .catch(err => {
    console.error('Error:', err.message);
  });

// Promise.all - 并行执行
Promise.all([
  readFilePromise('file1.txt'),
  readFilePromise('file2.txt'),
  readFilePromise('file3.txt')
])
  .then(([data1, data2, data3]) => {
    console.log('All files:', { data1, data2, data3 });
  })
  .catch(err => {
    console.error('Error reading files:', err.message);
  });

// Promise.allSettled - 等待所有 Promise 完成
Promise.allSettled([
  readFilePromise('file1.txt'),
  readFilePromise('nonexistent.txt'),
  readFilePromise('file3.txt')
])
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`File ${index + 1}:`, result.value);
      } else {
        console.error(`File ${index + 1} error:`, result.reason.message);
      }
    });
  });
```

#### Async/Await

```javascript
const fs = require('fs').promises;

// async/await 示例
async function readFileAsync(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return data;
  } catch (err) {
    throw new Error(`Failed to read ${filename}: ${err.message}`);
  }
}

// 使用 async/await
async function main() {
  try {
    const data = await readFileAsync('example.txt');
    console.log('File content:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// 顺序读取文件
async function readFilesSequentially() {
  try {
    const data1 = await readFileAsync('file1.txt');
    console.log('File 1:', data1);
    
    const data2 = await readFileAsync('file2.txt');
    console.log('File 2:', data2);
    
    const data3 = await readFileAsync('file3.txt');
    console.log('File 3:', data3);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// 并行读取文件
async function readFilesParallel() {
  try {
    const [data1, data2, data3] = await Promise.all([
      readFileAsync('file1.txt'),
      readFileAsync('file2.txt'),
      readFileAsync('file3.txt')
    ]);
    
    console.log('All files:', { data1, data2, data3 });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// 错误处理
async function readFilesWithErrorHandling() {
  const files = ['file1.txt', 'nonexistent.txt', 'file3.txt'];
  
  for (const file of files) {
    try {
      const data = await readFileAsync(file);
      console.log(`${file}:`, data);
    } catch (err) {
      console.error(`Failed to read ${file}:`, err.message);
      // 继续处理下一个文件
    }
  }
}

main();
readFilesSequentially();
readFilesParallel();
readFilesWithErrorHandling();
```

## 内置模块

### 1. 文件系统 (fs)

```javascript
const fs = require('fs');
const path = require('path');

// 同步读取文件
try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log('Sync read:', data);
} catch (err) {
  console.error('Sync read error:', err.message);
}

// 异步读取文件
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Async read error:', err.message);
    return;
  }
  console.log('Async read:', data);
});

// Promise 版本
const fsPromises = require('fs').promises;

async function fileOperations() {
  try {
    // 读取文件
    const data = await fsPromises.readFile('example.txt', 'utf8');
    console.log('Promise read:', data);
    
    // 写入文件
    await fsPromises.writeFile('output.txt', 'Hello, Node.js!', 'utf8');
    console.log('File written successfully');
    
    // 追加文件
    await fsPromises.appendFile('output.txt', '\nAppended text', 'utf8');
    console.log('Text appended successfully');
    
    // 检查文件是否存在
    try {
      await fsPromises.access('output.txt', fs.constants.F_OK);
      console.log('File exists');
    } catch {
      console.log('File does not exist');
    }
    
    // 获取文件信息
    const stats = await fsPromises.stat('output.txt');
    console.log('File stats:', {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      modified: stats.mtime
    });
    
    // 创建目录
    await fsPromises.mkdir('new-directory', { recursive: true });
    console.log('Directory created');
    
    // 读取目录
    const files = await fsPromises.readdir('.');
    console.log('Directory contents:', files);
    
    // 删除文件
    await fsPromises.unlink('output.txt');
    console.log('File deleted');
    
    // 删除目录
    await fsPromises.rmdir('new-directory');
    console.log('Directory deleted');
    
  } catch (err) {
    console.error('File operation error:', err.message);
  }
}

fileOperations();

// 文件流操作
const readStream = fs.createReadStream('large-file.txt', { encoding: 'utf8' });
const writeStream = fs.createWriteStream('copy.txt');

readStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length, 'bytes');
  writeStream.write(chunk);
});

readStream.on('end', () => {
  console.log('File reading completed');
  writeStream.end();
});

readStream.on('error', (err) => {
  console.error('Read stream error:', err.message);
});

writeStream.on('finish', () => {
  console.log('File writing completed');
});

writeStream.on('error', (err) => {
  console.error('Write stream error:', err.message);
});

// 使用管道
const sourceStream = fs.createReadStream('source.txt');
const destinationStream = fs.createWriteStream('destination.txt');

sourceStream.pipe(destinationStream);

sourceStream.on('error', (err) => {
  console.error('Source stream error:', err.message);
});

destinationStream.on('error', (err) => {
  console.error('Destination stream error:', err.message);
});

destinationStream.on('finish', () => {
  console.log('Pipe operation completed');
});
```

### 2. 路径处理 (path)

```javascript
const path = require('path');

// 路径操作示例
const filePath = '/users/john/documents/file.txt';

console.log('Path operations:');
console.log('Directory name:', path.dirname(filePath)); // /users/john/documents
console.log('Base name:', path.basename(filePath)); // file.txt
console.log('Extension:', path.extname(filePath)); // .txt
console.log('File name without extension:', path.basename(filePath, path.extname(filePath))); // file

// 路径拼接
const joinedPath = path.join('/users', 'john', 'documents', 'file.txt');
console.log('Joined path:', joinedPath); // /users/john/documents/file.txt

// 绝对路径解析
const resolvedPath = path.resolve('documents', 'file.txt');
console.log('Resolved path:', resolvedPath); // 当前工作目录/documents/file.txt

// 相对路径
const relativePath = path.relative('/users/john', '/users/john/documents/file.txt');
console.log('Relative path:', relativePath); // documents/file.txt

// 路径解析
const parsedPath = path.parse('/users/john/documents/file.txt');
console.log('Parsed path:', parsedPath);
// {
//   root: '/',
//   dir: '/users/john/documents',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 路径格式化
const formattedPath = path.format({
  dir: '/users/john/documents',
  name: 'file',
  ext: '.txt'
});
console.log('Formatted path:', formattedPath); // /users/john/documents/file.txt

// 平台相关
console.log('Path separator:', path.sep); // Unix: '/', Windows: '\\'
console.log('Path delimiter:', path.delimiter); // Unix: ':', Windows: ';'

// 规范化路径
const normalizedPath = path.normalize('/users/john/../john/documents/./file.txt');
console.log('Normalized path:', normalizedPath); // /users/john/documents/file.txt

// 检查是否为绝对路径
console.log('Is absolute:', path.isAbsolute('/users/john/file.txt')); // true
console.log('Is absolute:', path.isAbsolute('documents/file.txt')); // false
```

### 3. HTTP 模块

```javascript
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  console.log(`${req.method} ${pathname}`);
  console.log('Query parameters:', query);
  console.log('Headers:', req.headers);
  
  // 设置响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 路由处理
  if (pathname === '/' && req.method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: 'Welcome to Node.js server',
      timestamp: new Date().toISOString()
    }));
  } else if (pathname === '/api/users' && req.method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ]
    }));
  } else if (pathname === '/api/users' && req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const userData = JSON.parse(body);
        console.log('Received user data:', userData);
        
        res.statusCode = 201;
        res.end(JSON.stringify({
          message: 'User created successfully',
          user: { id: Date.now(), ...userData }
        }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({
          error: 'Invalid JSON data'
        }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({
      error: 'Not Found',
      message: `Cannot ${req.method} ${pathname}`
    }));
  }
});

// 错误处理
server.on('error', (err) => {
  console.error('Server error:', err.message);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// HTTP 客户端示例
function makeHttpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(body)
          };
          resolve(response);
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 使用 HTTP 客户端
async function testHttpClient() {
  try {
    // GET 请求
    const getResponse = await makeHttpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('GET Response:', getResponse);
    
    // POST 请求
    const postResponse = await makeHttpRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: 'Alice Johnson',
      email: 'alice@example.com'
    });
    
    console.log('POST Response:', postResponse);
    
  } catch (err) {
    console.error('HTTP Client Error:', err.message);
  }
}

// 延迟执行客户端测试
setTimeout(testHttpClient, 1000);
```

### 4. 事件发射器 (EventEmitter)

```javascript
const EventEmitter = require('events');

// 创建事件发射器
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// 注册事件监听器
myEmitter.on('message', (data) => {
  console.log('Received message:', data);
});

myEmitter.on('error', (err) => {
  console.error('Error occurred:', err.message);
});

// 一次性事件监听器
myEmitter.once('startup', () => {
  console.log('Application started (this will only run once)');
});

// 发射事件
myEmitter.emit('message', 'Hello, World!');
myEmitter.emit('message', { type: 'info', content: 'System ready' });
myEmitter.emit('startup');
myEmitter.emit('startup'); // 这个不会触发，因为是 once

// 移除事件监听器
const messageHandler = (data) => {
  console.log('Message handler:', data);
};

myEmitter.on('message', messageHandler);
myEmitter.emit('message', 'Test message');

myEmitter.removeListener('message', messageHandler);
// 或者使用 off 方法
// myEmitter.off('message', messageHandler);

// 实际应用示例：文件处理器
class FileProcessor extends EventEmitter {
  constructor() {
    super();
    this.files = [];
  }
  
  addFile(filename) {
    this.files.push(filename);
    this.emit('fileAdded', filename);
  }
  
  processFiles() {
    this.emit('processingStarted', this.files.length);
    
    this.files.forEach((file, index) => {
      setTimeout(() => {
        // 模拟文件处理
        if (Math.random() > 0.8) {
          this.emit('fileError', file, new Error('Processing failed'));
        } else {
          this.emit('fileProcessed', file);
        }
        
        if (index === this.files.length - 1) {
          this.emit('processingCompleted');
        }
      }, (index + 1) * 100);
    });
  }
  
  clearFiles() {
    const count = this.files.length;
    this.files = [];
    this.emit('filesCleared', count);
  }
}

// 使用文件处理器
const processor = new FileProcessor();

processor.on('fileAdded', (filename) => {
  console.log(`File added: ${filename}`);
});

processor.on('processingStarted', (count) => {
  console.log(`Started processing ${count} files`);
});

processor.on('fileProcessed', (filename) => {
  console.log(`✓ Processed: ${filename}`);
});

processor.on('fileError', (filename, error) => {
  console.error(`✗ Error processing ${filename}:`, error.message);
});

processor.on('processingCompleted', () => {
  console.log('All files processed');
});

processor.on('filesCleared', (count) => {
  console.log(`Cleared ${count} files`);
});

// 添加文件并处理
processor.addFile('document1.pdf');
processor.addFile('image1.jpg');
processor.addFile('data.csv');
processor.addFile('report.docx');

processor.processFiles();

// 错误处理
processor.on('error', (err) => {
  console.error('Processor error:', err.message);
});

// 设置最大监听器数量
processor.setMaxListeners(20);

// 获取监听器信息
console.log('Event names:', processor.eventNames());
console.log('Listener count for fileProcessed:', processor.listenerCount('fileProcessed'));
```

## 包管理

### npm 基础

```bash
# 初始化项目
npm init -y

# 安装依赖
npm install express
npm install lodash --save
npm install nodemon --save-dev
npm install -g typescript

# 安装特定版本
npm install express@4.18.0
npm install lodash@^4.17.21
npm install moment@~2.29.0

# 卸载依赖
npm uninstall express
npm uninstall nodemon --save-dev
npm uninstall -g typescript

# 更新依赖
npm update
npm update express
npm outdated

# 查看依赖
npm list
npm list --depth=0
npm list -g --depth=0

# 清理缓存
npm cache clean --force

# 审计安全漏洞
npm audit
npm audit fix

# 发布包
npm login
npm publish
npm unpublish package-name@version
```

### package.json 配置

```json
{
  "name": "my-node-app",
  "version": "1.0.0",
  "description": "A sample Node.js application",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "build": "webpack --mode production",
    "clean": "rm -rf dist",
    "prestart": "npm run build",
    "postinstall": "echo 'Installation completed'"
  },
  "keywords": [
    "nodejs",
    "javascript",
    "backend"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "lodash": "^4.17.21",
    "mongoose": "^7.0.0",
    "dotenv": "^16.0.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "jest": "^29.5.0",
    "eslint": "^8.36.0",
    "prettier": "^2.8.4",
    "webpack": "^5.76.0"
  },
  "engines": {
    "node": ">=16.0.0",
    "npm": ">=8.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/username/my-node-app.git"
  },
  "bugs": {
    "url": "https://github.com/username/my-node-app/issues"
  },
  "homepage": "https://github.com/username/my-node-app#readme"
}
```

### 环境变量管理

```javascript
// .env 文件
// NODE_ENV=development
// PORT=3000
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=myapp
// DB_USER=admin
// DB_PASSWORD=secret123
// JWT_SECRET=your-secret-key
// API_KEY=your-api-key

// config.js
require('dotenv').config();

const config = {
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    name: process.env.DB_NAME || 'myapp',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // 安全配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // API 配置
  api: {
    key: process.env.API_KEY,
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com'
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'app.log'
  }
};

// 验证必需的环境变量
const requiredEnvVars = ['DB_PASSWORD', 'JWT_SECRET', 'API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

module.exports = config;
```

## 调试和测试

### 调试技巧

```javascript
// 使用 console 调试
console.log('Basic log');
console.info('Info message');
console.warn('Warning message');
console.error('Error message');
console.debug('Debug message');

// 对象和数组调试
const user = { id: 1, name: 'John', email: 'john@example.com' };
console.log('User object:', user);
console.table([user, { id: 2, name: 'Jane', email: 'jane@example.com' }]);

// 性能测试
console.time('operation');
// 执行一些操作
for (let i = 0; i < 1000000; i++) {
  Math.random();
}
console.timeEnd('operation');

// 堆栈跟踪
console.trace('Trace point');

// 断言
console.assert(1 === 1, 'This will not print');
console.assert(1 === 2, 'This will print an error');

// 分组
console.group('User Operations');
console.log('Creating user...');
console.log('Validating user...');
console.groupEnd();

// 使用 Node.js 调试器
// 在代码中添加断点
debugger;

// 启动调试：node --inspect-brk app.js
// 或者：node --inspect app.js

// 使用 util.inspect 进行深度检查
const util = require('util');

const complexObject = {
  user: {
    id: 1,
    profile: {
      name: 'John',
      settings: {
        theme: 'dark',
        notifications: true
      }
    }
  }
};

console.log(util.inspect(complexObject, { 
  depth: null, 
  colors: true,
  showHidden: false
}));
```

### 单元测试 (Jest)

```javascript
// math.js - 被测试的模块
function add(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a + b;
}

function subtract(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a - b;
}

function multiply(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  return a * b;
}

function divide(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Both arguments must be numbers');
  }
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }
  return a / b;
}

module.exports = { add, subtract, multiply, divide };
```

```javascript
// math.test.js - 测试文件
const { add, subtract, multiply, divide } = require('./math');

describe('Math functions', () => {
  describe('add', () => {
    test('should add two positive numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
    
    test('should add positive and negative numbers', () => {
      expect(add(5, -3)).toBe(2);
    });
    
    test('should add decimal numbers', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3);
    });
    
    test('should throw error for non-number inputs', () => {
      expect(() => add('2', 3)).toThrow('Both arguments must be numbers');
      expect(() => add(2, null)).toThrow('Both arguments must be numbers');
    });
  });
  
  describe('subtract', () => {
    test('should subtract two numbers', () => {
      expect(subtract(5, 3)).toBe(2);
    });
    
    test('should handle negative results', () => {
      expect(subtract(3, 5)).toBe(-2);
    });
  });
  
  describe('multiply', () => {
    test('should multiply two numbers', () => {
      expect(multiply(4, 3)).toBe(12);
    });
    
    test('should handle zero multiplication', () => {
      expect(multiply(5, 0)).toBe(0);
    });
  });
  
  describe('divide', () => {
    test('should divide two numbers', () => {
      expect(divide(10, 2)).toBe(5);
    });
    
    test('should handle decimal division', () => {
      expect(divide(1, 3)).toBeCloseTo(0.333, 3);
    });
    
    test('should throw error for division by zero', () => {
      expect(() => divide(5, 0)).toThrow('Division by zero is not allowed');
    });
  });
});

// 异步测试示例
const fs = require('fs').promises;

describe('File operations', () => {
  test('should read file content', async () => {
    const content = await fs.readFile('package.json', 'utf8');
    const packageData = JSON.parse(content);
    expect(packageData).toHaveProperty('name');
    expect(packageData).toHaveProperty('version');
  });
  
  test('should handle file not found', async () => {
    await expect(fs.readFile('nonexistent.txt', 'utf8'))
      .rejects
      .toThrow();
  });
});

// Mock 示例
const axios = require('axios');
jest.mock('axios');
const mockedAxios = axios;

describe('API calls', () => {
  test('should fetch user data', async () => {
    const userData = { id: 1, name: 'John Doe' };
    mockedAxios.get.mockResolvedValue({ data: userData });
    
    const result = await fetchUser(1);
    
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/1');
    expect(result).toEqual(userData);
  });
});

async function fetchUser(id) {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
}
```

## 性能优化

### 1. 内存管理

```javascript
// 监控内存使用
function logMemoryUsage() {
  const usage = process.memoryUsage();
  console.log('Memory Usage:');
  console.log(`RSS: ${Math.round(usage.rss / 1024 / 1024)} MB`);
  console.log(`Heap Total: ${Math.round(usage.heapTotal / 1024 / 1024)} MB`);
  console.log(`Heap Used: ${Math.round(usage.heapUsed / 1024 / 1024)} MB`);
  console.log(`External: ${Math.round(usage.external / 1024 / 1024)} MB`);
  console.log('---');
}

// 定期监控内存
setInterval(logMemoryUsage, 5000);

// 避免内存泄漏
class EventManager {
  constructor() {
    this.listeners = new Map();
  }
  
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }
  
  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      
      // 清理空的事件集合
      if (this.listeners.get(event).size === 0) {
        this.listeners.delete(event);
      }
    }
  }
  
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        callback(data);
      });
    }
  }
  
  // 清理所有监听器
  cleanup() {
    this.listeners.clear();
  }
}

// 使用 WeakMap 避免内存泄漏
const cache = new WeakMap();

function processObject(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  
  const result = expensiveOperation(obj);
  cache.set(obj, result);
  return result;
}

function expensiveOperation(obj) {
  // 模拟昂贵的操作
  return { processed: true, data: obj };
}
```

### 2. 异步优化

```javascript
// 并发控制
class ConcurrencyController {
  constructor(maxConcurrency = 5) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
  }
  
  async execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // 处理队列中的下一个任务
    }
  }
}

// 使用并发控制
const controller = new ConcurrencyController(3);

async function fetchData(url) {
  return controller.execute(async () => {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    return `Data from ${url}`;
  });
}

// 批量处理
async function processBatch() {
  const urls = Array.from({ length: 10 }, (_, i) => `https://api.example.com/data/${i}`);
  
  const results = await Promise.all(
    urls.map(url => fetchData(url))
  );
  
  console.log('Batch results:', results);
}

processBatch();

// 流式处理大数据
const { Transform } = require('stream');

class DataProcessor extends Transform {
  constructor(options) {
    super({ objectMode: true, ...options });
    this.processedCount = 0;
  }
  
  _transform(chunk, encoding, callback) {
    try {
      // 处理数据块
      const processed = this.processChunk(chunk);
      this.processedCount++;
      
      if (this.processedCount % 1000 === 0) {
        console.log(`Processed ${this.processedCount} items`);
      }
      
      callback(null, processed);
    } catch (error) {
      callback(error);
    }
  }
  
  processChunk(data) {
    // 模拟数据处理
    return {
      ...data,
      processed: true,
      timestamp: Date.now()
    };
  }
}

// 使用流处理
const processor = new DataProcessor();

processor.on('data', (processedData) => {
  // 处理结果
});

processor.on('end', () => {
  console.log('Stream processing completed');
});

processor.on('error', (err) => {
  console.error('Stream processing error:', err);
});
```

## 最佳实践

### 1. 错误处理

```javascript
// 全局错误处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // 记录错误日志
  // 优雅关闭应用
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 记录错误日志
});

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field) {
    super(message, 400);
    this.field = field;
    this.name = 'ValidationError';
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

// 错误处理中间件
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: 'Validation Error',
      message: err.message,
      field: err.field
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(err.statusCode).json({
      error: 'Not Found',
      message: err.message
    });
  }
  
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      error: 'Application Error',
      message: err.message
    });
  }
  
  // 未知错误
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong'
  });
}

// 异步错误包装器
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 使用示例
const express = require('express');
const app = express();

app.get('/users/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(id)) {
    throw new ValidationError('Invalid user ID', 'id');
  }
  
  const user = await findUserById(id);
  
  if (!user) {
    throw new NotFoundError('User');
  }
  
  res.json(user);
}));

app.use(errorHandler);

async function findUserById(id) {
  // 模拟数据库查询
  if (id === '1') {
    return { id: 1, name: 'John Doe' };
  }
  return null;
}
```

### 2. 安全最佳实践

```javascript
// 输入验证和清理
const validator = require('validator');

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', 'email');
  }
  
  if (!validator.isEmail(email)) {
    throw new ValidationError('Invalid email format', 'email');
  }
  
  return validator.normalizeEmail(email);
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required', 'password');
  }
  
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters', 'password');
  }
  
  if (!validator.isStrongPassword(password)) {
    throw new ValidationError('Password is not strong enough', 'password');
  }
  
  return password;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  // 移除 HTML 标签
  return validator.escape(input.trim());
}

// 环境变量验证
function validateEnvironment() {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_CONNECTION_STRING',
    'JWT_SECRET'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // 验证特定格式
  if (!validator.isPort(process.env.PORT)) {
    throw new Error('Invalid PORT environment variable');
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
}

// 速率限制
class RateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
    
    // 定期清理过期记录
    setInterval(() => {
      this.cleanup();
    }, this.windowMs);
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // 移除过期请求
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }
  
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

const limiter = new RateLimiter(10, 60000); // 10 requests per minute

function rateLimitMiddleware(req, res, next) {
  const identifier = req.ip || req.connection.remoteAddress;
  
  if (!limiter.isAllowed(identifier)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded'
    });
  }
  
  next();
}
```

## 参考资源

- [Node.js 官方文档](https://nodejs.org/docs/)
- [npm 官方文档](https://docs.npmjs.com/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js 官方文档](https://expressjs.com/)
- [Jest 测试框架](https://jestjs.io/)
- [Node.js 设计模式](https://www.nodejsdesignpatterns.com/)

---

本指南涵盖了 Node.js 的核心概念、基础知识和最佳实践，为 Node.js 开发提供了全面的技术指导。