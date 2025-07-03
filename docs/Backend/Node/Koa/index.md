# Koa.js 框架开发指南

## 简介

Koa.js 是由 Express.js 团队开发的下一代 Node.js Web 框架，旨在成为一个更小、更富有表现力、更健壮的 Web 应用和 API 开发基础。Koa 通过利用 async 函数，丢弃回调函数，并有力地增强错误处理。

### 核心特性

- **基于 async/await**：原生支持异步编程，避免回调地狱
- **轻量级内核**：极简的核心，功能通过中间件扩展
- **洋葱模型**：优雅的中间件执行模型
- **更好的错误处理**：统一的错误处理机制
- **Context 对象**：封装 request 和 response 的上下文对象
- **无内置中间件**：保持核心简洁，按需添加功能
- **更好的流处理**：原生支持 Node.js 流

### 与 Express 的区别

| 特性 | Koa | Express |
|------|-----|----------|
| 异步处理 | 原生 async/await | 回调函数 |
| 中间件模型 | 洋葱模型 | 线性模型 |
| 内置功能 | 极简核心 | 丰富的内置功能 |
| 错误处理 | 统一的 try/catch | 回调错误处理 |
| 学习曲线 | 相对陡峭 | 相对平缓 |
| 生态系统 | 较新，正在发展 | 成熟丰富 |

### 适用场景

- 现代 Web API 开发
- 微服务架构
- 需要精细控制的应用
- 异步密集型应用
- 对性能要求较高的应用
- 团队熟悉 async/await 的项目

## 快速开始

### 1. 项目初始化

```bash
# 创建项目目录
mkdir koa-blog-api
cd koa-blog-api

# 初始化 npm 项目
npm init -y

# 安装 Koa
npm install koa

# 安装开发依赖
npm install --save-dev nodemon

# 安装常用中间件
npm install @koa/cors @koa/router koa-bodyparser
npm install koa-helmet koa-logger koa-compress
npm install koa-static koa-mount koa-json
npm install koa-ratelimit koa-session

# 安装数据库和工具
npm install mongoose redis ioredis
npm install bcryptjs jsonwebtoken
npm install dotenv joi
```

### 2. 基础应用

```javascript
// app.js
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const compress = require('koa-compress');
const serve = require('koa-static');
const mount = require('koa-mount');
const json = require('koa-json');
require('dotenv').config();

const app = new Koa();
const router = new Router();

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error:', err);
    
    ctx.status = err.status || err.statusCode || 500;
    
    if (process.env.NODE_ENV === 'development') {
      ctx.body = {
        error: err.message,
        stack: err.stack,
        details: err
      };
    } else {
      ctx.body = {
        error: ctx.status === 500 ? 'Internal Server Error' : err.message
      };
    }
    
    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
});

// 应用级错误监听
app.on('error', (err, ctx) => {
  console.error('Application error:', err);
  // 这里可以添加日志记录、错误报告等逻辑
});

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: (ctx) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    const origin = ctx.request.header.origin;
    return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(logger());
}

// 压缩中间件
app.use(compress({
  filter: (content_type) => {
    return /text/i.test(content_type);
  },
  threshold: 2048,
  gzip: {
    flush: require('zlib').constants.Z_SYNC_FLUSH
  },
  deflate: {
    flush: require('zlib').constants.Z_SYNC_FLUSH,
  },
  br: false
}));

// JSON 美化中间件
app.use(json({ pretty: process.env.NODE_ENV === 'development' }));

// 请求体解析中间件
app.use(bodyParser({
  jsonLimit: '10mb',
  formLimit: '10mb',
  textLimit: '10mb',
  enableTypes: ['json', 'form', 'text'],
  onerror: (err, ctx) => {
    ctx.throw(422, 'Body parse error', { detail: err.message });
  }
}));

// 静态文件服务
app.use(mount('/static', serve('./public')));

// 健康检查路由
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: process.memoryUsage(),
    version: process.version
  };
});

// API 路由
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');

router.use('/api/v1/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/api/v1/articles', articleRoutes.routes(), articleRoutes.allowedMethods());
router.use('/api/v1/users', userRoutes.routes(), userRoutes.allowedMethods());
router.use('/api/v1/comments', commentRoutes.routes(), commentRoutes.allowedMethods());

// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());

// 404 处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    error: 'Route not found',
    message: `Cannot ${ctx.method} ${ctx.path}`
  };
});

// 启动服务器
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
```

### 3. 项目目录结构

```
koa-blog-api/
├── app.js                 # 主应用文件
├── package.json
├── .env                   # 环境变量
├── .gitignore
├── README.md
├── config/
│   ├── database.js        # 数据库配置
│   ├── redis.js          # Redis 配置
│   └── index.js          # 应用配置
├── controllers/
│   ├── authController.js
│   ├── articleController.js
│   ├── userController.js
│   └── commentController.js
├── middleware/
│   ├── auth.js           # 认证中间件
│   ├── validation.js     # 验证中间件
│   ├── rateLimiter.js    # 限流中间件
│   └── upload.js         # 文件上传中间件
├── models/
│   ├── User.js
│   ├── Article.js
│   └── Comment.js
├── routes/
│   ├── auth.js
│   ├── articles.js
│   ├── users.js
│   └── comments.js
├── services/
│   ├── authService.js
│   ├── emailService.js
│   └── uploadService.js
├── utils/
│   ├── logger.js
│   ├── helpers.js
│   └── constants.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
└── public/
    ├── images/
    ├── css/
    └── js/
```

## 中间件系统

### 1. 洋葱模型

```javascript
// 洋葱模型示例
const Koa = require('koa');
const app = new Koa();

// 中间件 1
app.use(async (ctx, next) => {
  console.log('1. 开始');
  await next(); // 调用下一个中间件
  console.log('1. 结束');
});

// 中间件 2
app.use(async (ctx, next) => {
  console.log('2. 开始');
  await next();
  console.log('2. 结束');
});

// 中间件 3
app.use(async (ctx, next) => {
  console.log('3. 开始');
  ctx.body = 'Hello Koa';
  console.log('3. 结束');
});

// 执行顺序：
// 1. 开始
// 2. 开始
// 3. 开始
// 3. 结束
// 2. 结束
// 1. 结束

app.listen(3000);
```

### 2. 自定义中间件

```javascript
// middleware/responseTime.js
// 响应时间中间件
module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  };
};

// middleware/requestId.js
// 请求 ID 中间件
const { v4: uuidv4 } = require('uuid');

module.exports = () => {
  return async (ctx, next) => {
    const requestId = ctx.get('X-Request-ID') || uuidv4();
    ctx.state.requestId = requestId;
    ctx.set('X-Request-ID', requestId);
    await next();
  };
};

// middleware/auth.js
// 认证中间件
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = () => {
  return async (ctx, next) => {
    try {
      const token = ctx.get('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        ctx.throw(401, 'No token provided');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        ctx.throw(401, 'Invalid token');
      }
      
      ctx.state.user = user;
      await next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        ctx.throw(401, 'Invalid token');
      }
      if (err.name === 'TokenExpiredError') {
        ctx.throw(401, 'Token expired');
      }
      throw err;
    }
  };
};

// middleware/validation.js
// 验证中间件
const Joi = require('joi');

module.exports = (schema, property = 'body') => {
  return async (ctx, next) => {
    try {
      const data = property === 'body' ? ctx.request.body : 
                   property === 'query' ? ctx.query : 
                   property === 'params' ? ctx.params : ctx.request[property];
      
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });
      
      if (error) {
        const details = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context.value
        }));
        
        ctx.throw(400, 'Validation failed', { details });
      }
      
      // 将验证后的数据重新赋值
      if (property === 'body') {
        ctx.request.body = value;
      } else if (property === 'query') {
        ctx.query = value;
      } else if (property === 'params') {
        ctx.params = value;
      }
      
      await next();
    } catch (err) {
      throw err;
    }
  };
};

// 使用中间件
const responseTime = require('./middleware/responseTime');
const requestId = require('./middleware/requestId');
const auth = require('./middleware/auth');
const validation = require('./middleware/validation');

app.use(responseTime());
app.use(requestId());

// 在需要认证的路由上使用
router.get('/protected', auth(), async (ctx) => {
  ctx.body = {
    message: 'Protected route',
    user: ctx.state.user
  };
});

// 在需要验证的路由上使用
const userSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120)
});

router.post('/users', validation(userSchema), async (ctx) => {
  // ctx.request.body 已经被验证和清理
  const user = await User.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = user;
});
```

### 3. 错误处理中间件

```javascript
// middleware/errorHandler.js
module.exports = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // 记录错误
      console.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        url: ctx.url,
        method: ctx.method,
        ip: ctx.ip,
        userAgent: ctx.get('User-Agent'),
        requestId: ctx.state.requestId
      });
      
      // 设置状态码
      ctx.status = err.status || err.statusCode || 500;
      
      // 错误响应
      const errorResponse = {
        error: err.message || 'Internal Server Error',
        requestId: ctx.state.requestId,
        timestamp: new Date().toISOString()
      };
      
      // 开发环境显示详细错误信息
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
        errorResponse.details = err.details || null;
      }
      
      // 特定错误类型处理
      if (err.name === 'ValidationError') {
        ctx.status = 400;
        errorResponse.error = 'Validation Error';
        errorResponse.details = err.details;
      } else if (err.name === 'CastError') {
        ctx.status = 400;
        errorResponse.error = 'Invalid ID format';
      } else if (err.code === 11000) {
        ctx.status = 409;
        errorResponse.error = 'Duplicate entry';
      }
      
      ctx.body = errorResponse;
      
      // 触发应用级错误事件
      ctx.app.emit('error', err, ctx);
    }
  };
};

// 使用错误处理中间件
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler());
```

## 路由系统

### 1. 基础路由

```javascript
// routes/articles.js
const Router = require('@koa/router');
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const Joi = require('joi');

const router = new Router();

// 验证模式
const createArticleSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  content: Joi.string().required().min(10),
  summary: Joi.string().max(500),
  tags: Joi.array().items(Joi.string()).max(10),
  category: Joi.string().required(),
  published: Joi.boolean().default(false)
});

const updateArticleSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  content: Joi.string().min(10),
  summary: Joi.string().max(500),
  tags: Joi.array().items(Joi.string()).max(10),
  category: Joi.string(),
  published: Joi.boolean()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title').default('-createdAt'),
  category: Joi.string(),
  tags: Joi.string(),
  search: Joi.string().max(100),
  published: Joi.boolean()
});

// 路由定义
router.get('/', validation(querySchema, 'query'), articleController.getArticles);
router.get('/:id', articleController.getArticleById);
router.post('/', auth(), validation(createArticleSchema), articleController.createArticle);
router.put('/:id', auth(), validation(updateArticleSchema), articleController.updateArticle);
router.delete('/:id', auth(), articleController.deleteArticle);
router.post('/:id/like', auth(), articleController.likeArticle);
router.delete('/:id/like', auth(), articleController.unlikeArticle);

module.exports = router;
```

### 2. 路由参数和查询

```javascript
// 路径参数
router.get('/users/:id', async (ctx) => {
  const { id } = ctx.params;
  ctx.body = { userId: id };
});

// 多个参数
router.get('/users/:userId/articles/:articleId', async (ctx) => {
  const { userId, articleId } = ctx.params;
  ctx.body = { userId, articleId };
});

// 查询参数
router.get('/search', async (ctx) => {
  const { q, page = 1, limit = 10 } = ctx.query;
  ctx.body = { query: q, page: Number(page), limit: Number(limit) };
});

// 请求体
router.post('/users', async (ctx) => {
  const userData = ctx.request.body;
  ctx.body = { received: userData };
});

// 文件上传
const multer = require('@koa/multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file;
  ctx.body = {
    filename: file.filename,
    originalname: file.originalname,
    size: file.size
  };
});
```

### 3. 路由前缀和嵌套

```javascript
// 路由前缀
const apiRouter = new Router({ prefix: '/api/v1' });

apiRouter.get('/users', async (ctx) => {
  ctx.body = 'Users API';
});

// 嵌套路由
const userRouter = new Router();
const profileRouter = new Router();

profileRouter.get('/', async (ctx) => {
  ctx.body = 'User profile';
});

profileRouter.put('/', async (ctx) => {
  ctx.body = 'Update profile';
});

userRouter.use('/:userId/profile', profileRouter.routes());

app.use(userRouter.routes());
app.use(apiRouter.routes());
```

## 控制器

### 1. 文章控制器

```javascript
// controllers/articleController.js
const Article = require('../models/Article');
const User = require('../models/User');
const { paginate, buildQuery } = require('../utils/helpers');

class ArticleController {
  // 获取文章列表
  static async getArticles(ctx) {
    try {
      const {
        page,
        limit,
        sort,
        category,
        tags,
        search,
        published
      } = ctx.query;
      
      // 构建查询条件
      const query = buildQuery({
        category,
        tags: tags ? { $in: tags.split(',') } : undefined,
        published,
        $or: search ? [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { summary: { $regex: search, $options: 'i' } }
        ] : undefined
      });
      
      // 分页查询
      const options = {
        page,
        limit,
        sort,
        populate: [
          { path: 'author', select: 'name email avatar' },
          { path: 'category', select: 'name slug' }
        ]
      };
      
      const result = await paginate(Article, query, options);
      
      ctx.body = {
        success: true,
        data: result.docs,
        pagination: {
          page: result.page,
          pages: result.pages,
          limit: result.limit,
          total: result.total,
          hasNext: result.hasNext,
          hasPrev: result.hasPrev
        }
      };
    } catch (error) {
      ctx.throw(500, 'Failed to fetch articles', { detail: error.message });
    }
  }
  
  // 获取单篇文章
  static async getArticleById(ctx) {
    try {
      const { id } = ctx.params;
      
      const article = await Article.findById(id)
        .populate('author', 'name email avatar')
        .populate('category', 'name slug')
        .populate('comments');
      
      if (!article) {
        ctx.throw(404, 'Article not found');
      }
      
      // 增加浏览量
      await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });
      
      ctx.body = {
        success: true,
        data: article
      };
    } catch (error) {
      if (error.name === 'CastError') {
        ctx.throw(400, 'Invalid article ID');
      }
      throw error;
    }
  }
  
  // 创建文章
  static async createArticle(ctx) {
    try {
      const articleData = {
        ...ctx.request.body,
        author: ctx.state.user._id
      };
      
      const article = new Article(articleData);
      await article.save();
      
      await article.populate('author', 'name email avatar');
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: article,
        message: 'Article created successfully'
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        ctx.throw(400, 'Validation failed', { details });
      }
      throw error;
    }
  }
  
  // 更新文章
  static async updateArticle(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      
      const article = await Article.findById(id);
      
      if (!article) {
        ctx.throw(404, 'Article not found');
      }
      
      // 检查权限
      if (article.author.toString() !== ctx.state.user._id.toString()) {
        ctx.throw(403, 'Not authorized to update this article');
      }
      
      const updatedArticle = await Article.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('author', 'name email avatar');
      
      ctx.body = {
        success: true,
        data: updatedArticle,
        message: 'Article updated successfully'
      };
    } catch (error) {
      if (error.name === 'CastError') {
        ctx.throw(400, 'Invalid article ID');
      }
      if (error.name === 'ValidationError') {
        const details = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        ctx.throw(400, 'Validation failed', { details });
      }
      throw error;
    }
  }
  
  // 删除文章
  static async deleteArticle(ctx) {
    try {
      const { id } = ctx.params;
      
      const article = await Article.findById(id);
      
      if (!article) {
        ctx.throw(404, 'Article not found');
      }
      
      // 检查权限
      if (article.author.toString() !== ctx.state.user._id.toString()) {
        ctx.throw(403, 'Not authorized to delete this article');
      }
      
      await Article.findByIdAndDelete(id);
      
      ctx.status = 204;
    } catch (error) {
      if (error.name === 'CastError') {
        ctx.throw(400, 'Invalid article ID');
      }
      throw error;
    }
  }
  
  // 点赞文章
  static async likeArticle(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user._id;
      
      const article = await Article.findById(id);
      
      if (!article) {
        ctx.throw(404, 'Article not found');
      }
      
      // 检查是否已经点赞
      if (article.likes.includes(userId)) {
        ctx.throw(400, 'Article already liked');
      }
      
      article.likes.push(userId);
      await article.save();
      
      ctx.body = {
        success: true,
        data: {
          likes: article.likes.length,
          liked: true
        },
        message: 'Article liked successfully'
      };
    } catch (error) {
      if (error.name === 'CastError') {
        ctx.throw(400, 'Invalid article ID');
      }
      throw error;
    }
  }
  
  // 取消点赞
  static async unlikeArticle(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user._id;
      
      const article = await Article.findById(id);
      
      if (!article) {
        ctx.throw(404, 'Article not found');
      }
      
      // 检查是否已经点赞
      if (!article.likes.includes(userId)) {
        ctx.throw(400, 'Article not liked yet');
      }
      
      article.likes = article.likes.filter(
        like => like.toString() !== userId.toString()
      );
      await article.save();
      
      ctx.body = {
        success: true,
        data: {
          likes: article.likes.length,
          liked: false
        },
        message: 'Article unliked successfully'
      };
    } catch (error) {
      if (error.name === 'CastError') {
        ctx.throw(400, 'Invalid article ID');
      }
      throw error;
    }
  }
}

module.exports = ArticleController;
```

### 2. 认证控制器

```javascript
// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');
const crypto = require('crypto');

class AuthController {
  // 用户注册
  static async register(ctx) {
    try {
      const { name, email, password } = ctx.request.body;
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        ctx.throw(409, 'User already exists with this email');
      }
      
      // 创建用户
      const user = new User({
        name,
        email,
        password: await bcrypt.hash(password, 12)
      });
      
      await user.save();
      
      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // 发送欢迎邮件
      await sendEmail({
        to: email,
        subject: 'Welcome to our platform',
        template: 'welcome',
        data: { name }
      });
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
          },
          token
        },
        message: 'User registered successfully'
      };
    } catch (error) {
      if (error.code === 11000) {
        ctx.throw(409, 'User already exists');
      }
      throw error;
    }
  }
  
  // 用户登录
  static async login(ctx) {
    try {
      const { email, password } = ctx.request.body;
      
      // 查找用户
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        ctx.throw(401, 'Invalid email or password');
      }
      
      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        ctx.throw(401, 'Invalid email or password');
      }
      
      // 检查账户状态
      if (!user.isActive) {
        ctx.throw(401, 'Account is deactivated');
      }
      
      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await user.save();
      
      ctx.body = {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role
          },
          token
        },
        message: 'Login successful'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 获取当前用户信息
  static async getMe(ctx) {
    try {
      const user = ctx.state.user;
      
      ctx.body = {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 忘记密码
  static async forgotPassword(ctx) {
    try {
      const { email } = ctx.request.body;
      
      const user = await User.findOne({ email });
      if (!user) {
        ctx.throw(404, 'User not found with this email');
      }
      
      // 生成重置令牌
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      
      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 分钟
      await user.save();
      
      // 发送重置邮件
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        data: {
          name: user.name,
          resetUrl,
          expiresIn: '10 minutes'
        }
      });
      
      ctx.body = {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 重置密码
  static async resetPassword(ctx) {
    try {
      const { token, password } = ctx.request.body;
      
      // 哈希令牌
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // 查找用户
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
      });
      
      if (!user) {
        ctx.throw(400, 'Token is invalid or has expired');
      }
      
      // 更新密码
      user.password = await bcrypt.hash(password, 12);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      // 生成新的 JWT
      const jwtToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      ctx.body = {
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar
          },
          token: jwtToken
        },
        message: 'Password reset successful'
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 修改密码
  static async changePassword(ctx) {
    try {
      const { currentPassword, newPassword } = ctx.request.body;
      const user = await User.findById(ctx.state.user._id).select('+password');
      
      // 验证当前密码
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      
      if (!isCurrentPasswordValid) {
        ctx.throw(400, 'Current password is incorrect');
      }
      
      // 更新密码
      user.password = await bcrypt.hash(newPassword, 12);
      await user.save();
      
      ctx.body = {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthController;
```

## 数据模型

### 1. 用户模型

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // 默认不返回密码字段
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  profile: {
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    website: String,
    location: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    }
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      }
    }
  },
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
    facebook: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      return ret;
    }
  }
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'profile.location': 1 });

// 虚拟字段
userSchema.virtual('fullProfile').get(function() {
  return {
    ...this.profile,
    name: this.name,
    email: this.email,
    avatar: this.avatar
  };
});

// 实例方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 分钟
  
  return resetToken;
};

// 静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.getActiveUsers = function() {
  return this.find({ isActive: true });
};

// 中间件
userSchema.pre('save', async function(next) {
  // 只有密码被修改时才进行哈希
  if (!this.isModified('password')) return next();
  
  // 哈希密码
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  // 确保 passwordChangedAt 在 JWT 创建之前
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

module.exports = mongoose.model('User', userSchema);
```

### 2. 文章模型

```javascript
// models/Article.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  summary: {
    type: String,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  readingTime: {
    type: Number, // 分钟
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引
articleSchema.index({ slug: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ published: 1, publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ title: 'text', content: 'text', summary: 'text' });

// 虚拟字段
articleSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

articleSchema.virtual('commentsCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug}`;
});

// 实例方法
articleSchema.methods.generateSlug = function() {
  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'";!:@]/g
  });
};

articleSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
};

articleSchema.methods.isLikedBy = function(userId) {
  return this.likes.includes(userId);
};

// 静态方法
articleSchema.statics.findPublished = function() {
  return this.find({ published: true, status: 'published' })
    .sort({ publishedAt: -1 });
};

articleSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, published: true });
};

articleSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag, published: true });
};

articleSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    published: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// 中间件
articleSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.generateSlug();
  }
  
  if (this.isModified('content')) {
    this.calculateReadingTime();
  }
  
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
    this.status = 'published';
  }
  
  next();
});

articleSchema.pre(/^find/, function(next) {
  // 默认不查询已删除的文章
  this.find({ status: { $ne: 'archived' } });
  next();
});

module.exports = mongoose.model('Article', articleSchema);
```

## 测试

### 1. 单元测试

```javascript
// tests/unit/controllers/authController.test.js
const request = require('supertest');
const app = require('../../../app');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
      
      // 验证用户已保存到数据库
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });
    
    it('should not register user with existing email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      // 先创建一个用户
      await User.create(userData);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);
      
      expect(response.body.error).toContain('already exists');
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      await user.save();
    });
    
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      
      // 验证 JWT
      const decoded = jwt.verify(response.body.data.token, process.env.JWT_SECRET);
      expect(decoded.userId).toBeDefined();
    });
    
    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body.error).toContain('Invalid email or password');
    });
  });
  
  describe('GET /api/v1/auth/me', () => {
    let user, token;
    
    beforeEach(async () => {
      user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });
      await user.save();
      
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    });
    
    it('should get current user info with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(user.email);
    });
    
    it('should not get user info without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
      
      expect(response.body.error).toContain('No token provided');
    });
  });
});
```

### 2. 集成测试

```javascript
// tests/integration/articles.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Article = require('../../models/Article');
const Category = require('../../models/Category');
const jwt = require('jsonwebtoken');

describe('Articles API', () => {
  let user, token, category;
  
  beforeEach(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    await Category.deleteMany({});
    
    // 创建测试用户
    user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    
    // 创建测试分类
    category = new Category({
      name: 'Technology',
      slug: 'technology'
    });
    await category.save();
    
    // 生成 JWT
    token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  });
  
  describe('GET /api/v1/articles', () => {
    beforeEach(async () => {
      // 创建测试文章
      const articles = [
        {
          title: 'First Article',
          content: 'This is the first article content',
          author: user._id,
          category: category._id,
          published: true,
          publishedAt: new Date()
        },
        {
          title: 'Second Article',
          content: 'This is the second article content',
          author: user._id,
          category: category._id,
          published: true,
          publishedAt: new Date()
        }
      ];
      
      await Article.insertMany(articles);
    });
    
    it('should get all published articles', async () => {
      const response = await request(app)
        .get('/api/v1/articles')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
       expect(response.body.pagination).toBeDefined();
     });
     
     it('should filter articles by category', async () => {
       const response = await request(app)
         .get(`/api/v1/articles?category=${category._id}`)
         .expect(200);
       
       expect(response.body.success).toBe(true);
       expect(response.body.data).toHaveLength(2);
     });
     
     it('should search articles', async () => {
       const response = await request(app)
         .get('/api/v1/articles?search=first')
         .expect(200);
       
       expect(response.body.success).toBe(true);
       expect(response.body.data).toHaveLength(1);
       expect(response.body.data[0].title).toContain('First');
     });
   });
   
   describe('POST /api/v1/articles', () => {
     it('should create a new article', async () => {
       const articleData = {
         title: 'New Test Article',
         content: 'This is a test article content',
         category: category._id,
         tags: ['test', 'article'],
         published: true
       };
       
       const response = await request(app)
         .post('/api/v1/articles')
         .set('Authorization', `Bearer ${token}`)
         .send(articleData)
         .expect(201);
       
       expect(response.body.success).toBe(true);
       expect(response.body.data.title).toBe(articleData.title);
       expect(response.body.data.author.email).toBe(user.email);
     });
     
     it('should not create article without authentication', async () => {
       const articleData = {
         title: 'New Test Article',
         content: 'This is a test article content',
         category: category._id
       };
       
       const response = await request(app)
         .post('/api/v1/articles')
         .send(articleData)
         .expect(401);
       
       expect(response.body.error).toContain('No token provided');
     });
   });
 });
```

## 性能优化

### 1. 缓存策略

```javascript
// middleware/cache.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

module.exports = (ttl = 300) => {
  return async (ctx, next) => {
    // 只缓存 GET 请求
    if (ctx.method !== 'GET') {
      return await next();
    }
    
    const key = `cache:${ctx.url}`;
    
    try {
      // 尝试从缓存获取
      const cached = await redis.get(key);
      
      if (cached) {
        ctx.body = JSON.parse(cached);
        ctx.set('X-Cache', 'HIT');
        return;
      }
      
      // 执行下一个中间件
      await next();
      
      // 缓存响应
      if (ctx.status === 200 && ctx.body) {
        await redis.setex(key, ttl, JSON.stringify(ctx.body));
        ctx.set('X-Cache', 'MISS');
      }
    } catch (error) {
      console.error('Cache error:', error);
      await next();
    }
  };
};

// 使用缓存中间件
const cache = require('./middleware/cache');

// 缓存文章列表 5 分钟
router.get('/articles', cache(300), articleController.getArticles);

// 缓存单篇文章 10 分钟
router.get('/articles/:id', cache(600), articleController.getArticleById);
```

### 2. 数据库优化

```javascript
// utils/database.js
const mongoose = require('mongoose');

// 连接池配置
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10, // 最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket 超时
      bufferMaxEntries: 0, // 禁用缓冲
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    // 优雅关闭
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

// 查询优化示例
class ArticleService {
  static async getArticlesOptimized(query, options) {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      category,
      tags,
      search
    } = options;
    
    // 构建聚合管道
    const pipeline = [];
    
    // 匹配阶段
    const matchStage = { published: true };
    
    if (category) {
      matchStage.category = new mongoose.Types.ObjectId(category);
    }
    
    if (tags) {
      matchStage.tags = { $in: tags.split(',') };
    }
    
    if (search) {
      matchStage.$text = { $search: search };
    }
    
    pipeline.push({ $match: matchStage });
    
    // 查找阶段
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { name: 1, email: 1, avatar: 1 } }]
      }
    });
    
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category',
        pipeline: [{ $project: { name: 1, slug: 1 } }]
      }
    });
    
    // 展开数组
    pipeline.push({ $unwind: '$author' });
    pipeline.push({ $unwind: '$category' });
    
    // 添加计算字段
    pipeline.push({
      $addFields: {
        likesCount: { $size: '$likes' },
        commentsCount: { $size: '$comments' }
      }
    });
    
    // 排序
    const sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }
    pipeline.push({ $sort: sortObj });
    
    // 分页
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });
    
    // 执行聚合查询
    const [articles, totalCount] = await Promise.all([
      Article.aggregate(pipeline),
      Article.countDocuments(matchStage)
    ]);
    
    return {
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    };
  }
}
```

### 3. 压缩和静态资源优化

```javascript
// middleware/compression.js
const compress = require('koa-compress');
const { createBrotliCompress, createGzip, createDeflate } = require('zlib');

module.exports = () => {
  return compress({
    filter: (content_type) => {
      return /text|javascript|json|xml|svg/i.test(content_type);
    },
    threshold: 1024, // 只压缩大于 1KB 的响应
    gzip: {
      flush: require('zlib').constants.Z_SYNC_FLUSH
    },
    deflate: {
      flush: require('zlib').constants.Z_SYNC_FLUSH
    },
    br: {
      flush: require('zlib').constants.BROTLI_OPERATION_FLUSH,
      params: {
        [require('zlib').constants.BROTLI_PARAM_QUALITY]: 4
      }
    }
  });
};

// 静态资源缓存
const serve = require('koa-static');
const mount = require('koa-mount');

// 静态文件服务配置
app.use(mount('/static', serve('./public', {
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 天缓存
  gzip: true,
  brotli: true,
  setHeaders: (res, path) => {
    // 设置缓存策略
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 年
    } else if (path.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 天
    }
  }
})));
```

## 安全最佳实践

### 1. 安全中间件配置

```javascript
// middleware/security.js
const helmet = require('koa-helmet');
const rateLimit = require('koa-ratelimit');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL);

// Helmet 安全配置
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
});

// 限流配置
const rateLimitConfig = {
  driver: 'redis',
  db: redis,
  duration: 60000, // 1 分钟
  errorMessage: 'Rate limit exceeded',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100, // 每分钟最多 100 个请求
  disableHeader: false
};

// API 限流
const apiRateLimit = rateLimit({
  ...rateLimitConfig,
  max: 60, // API 更严格的限制
  id: (ctx) => {
    // 对认证用户使用用户 ID，否则使用 IP
    return ctx.state.user ? ctx.state.user._id : ctx.ip;
  }
});

// 登录限流
const loginRateLimit = rateLimit({
  ...rateLimitConfig,
  max: 5, // 每分钟最多 5 次登录尝试
  duration: 15 * 60 * 1000, // 15 分钟
  id: (ctx) => `login:${ctx.ip}`
});

module.exports = {
  helmet: helmetConfig,
  rateLimit: rateLimit(rateLimitConfig),
  apiRateLimit,
  loginRateLimit
};
```

### 2. 输入验证和清理

```javascript
// middleware/sanitize.js
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');

module.exports = () => {
  return async (ctx, next) => {
    // MongoDB 注入防护
    if (ctx.request.body) {
      ctx.request.body = mongoSanitize.sanitize(ctx.request.body);
    }
    
    if (ctx.query) {
      ctx.query = mongoSanitize.sanitize(ctx.query);
    }
    
    if (ctx.params) {
      ctx.params = mongoSanitize.sanitize(ctx.params);
    }
    
    // XSS 防护
    if (ctx.request.body && typeof ctx.request.body === 'object') {
      sanitizeObject(ctx.request.body);
    }
    
    await next();
  };
};

function sanitizeObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = xss(obj[key], {
        whiteList: {
          p: [],
          br: [],
          strong: [],
          em: [],
          u: [],
          code: [],
          pre: [],
          blockquote: [],
          h1: [],
          h2: [],
          h3: [],
          h4: [],
          h5: [],
          h6: [],
          ul: [],
          ol: [],
          li: [],
          a: ['href', 'title'],
          img: ['src', 'alt', 'title']
        },
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
```

### 3. JWT 安全配置

```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JWTService {
  static generateTokens(payload) {
    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );
    
    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      }
    );
    
    return { accessToken, refreshToken };
  }
  
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
  
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE
      });
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
  
  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}

module.exports = JWTService;
```

## 监控和日志

### 1. 日志系统

```javascript
// utils/logger.js
const winston = require('winston');
const path = require('path');

// 自定义日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 创建 logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'koa-blog-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // 错误日志
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // 组合日志
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
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
});

// 开发环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;

// middleware/requestLogger.js
const logger = require('../utils/logger');

module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();
    
    // 记录请求信息
    const requestInfo = {
      method: ctx.method,
      url: ctx.url,
      ip: ctx.ip,
      userAgent: ctx.get('User-Agent'),
      requestId: ctx.state.requestId,
      userId: ctx.state.user?.id
    };
    
    logger.info('Request started', requestInfo);
    
    try {
      await next();
      
      const duration = Date.now() - start;
      
      // 记录响应信息
      logger.info('Request completed', {
        ...requestInfo,
        status: ctx.status,
        duration: `${duration}ms`,
        responseSize: ctx.length || 0
      });
      
    } catch (error) {
      const duration = Date.now() - start;
      
      // 记录错误信息
      logger.error('Request failed', {
        ...requestInfo,
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });
      
      throw error;
    }
  };
};
```

### 2. 健康检查和监控

```javascript
// routes/health.js
const Router = require('@koa/router');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const os = require('os');
const fs = require('fs').promises;

const router = new Router();
const redis = new Redis(process.env.REDIS_URL);

// 基础健康检查
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };
});

// 详细健康检查
router.get('/health/detailed', async (ctx) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: checkMemory(),
    disk: await checkDisk(),
    cpu: checkCPU()
  };
  
  const isHealthy = Object.values(checks).every(check => check.status === 'OK');
  
  ctx.status = isHealthy ? 200 : 503;
  ctx.body = {
    status: isHealthy ? 'OK' : 'UNHEALTHY',
    timestamp: new Date().toISOString(),
    checks
  };
});

// 数据库检查
async function checkDatabase() {
  try {
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const duration = Date.now() - start;
    
    return {
      status: 'OK',
      responseTime: `${duration}ms`,
      connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    };
  } catch (error) {
    return {
      status: 'ERROR',
      error: error.message
    };
  }
}

// Redis 检查
async function checkRedis() {
  try {
    const start = Date.now();
    await redis.ping();
    const duration = Date.now() - start;
    
    return {
      status: 'OK',
      responseTime: `${duration}ms`,
      connection: redis.status
    };
  } catch (error) {
    return {
      status: 'ERROR',
      error: error.message
    };
  }
}

// 内存检查
function checkMemory() {
  const usage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100;
  
  return {
    status: memoryUsagePercent > 90 ? 'WARNING' : 'OK',
    process: {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    },
    system: {
      total: `${Math.round(totalMemory / 1024 / 1024)}MB`,
      free: `${Math.round(freeMemory / 1024 / 1024)}MB`,
      used: `${Math.round(usedMemory / 1024 / 1024)}MB`,
      usagePercent: `${memoryUsagePercent.toFixed(2)}%`
    }
  };
}

// 磁盘检查
async function checkDisk() {
  try {
    const stats = await fs.stat('.');
    return {
      status: 'OK',
      accessible: true
    };
  } catch (error) {
    return {
      status: 'ERROR',
      accessible: false,
      error: error.message
    };
  }
}

// CPU 检查
function checkCPU() {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  
  return {
    status: loadAvg[0] > cpus.length * 0.8 ? 'WARNING' : 'OK',
    cores: cpus.length,
    model: cpus[0].model,
    loadAverage: {
      '1min': loadAvg[0].toFixed(2),
      '5min': loadAvg[1].toFixed(2),
      '15min': loadAvg[2].toFixed(2)
    }
  };
}

module.exports = router;
```

## 部署和运维

### 1. Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 生产阶段
FROM node:18-alpine AS production

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S koa -u 1001

# 设置工作目录
WORKDIR /app

# 复制依赖
COPY --from=builder --chown=koa:nodejs /app/node_modules ./node_modules

# 复制应用代码
COPY --chown=koa:nodejs . .

# 创建日志目录
RUN mkdir -p logs && chown koa:nodejs logs

# 切换到非 root 用户
USER koa

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "app.js"]
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
      - MONGODB_URI=mongodb://mongo:27017/blog
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - app-network

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=blog
    volumes:
      - mongo-data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - app-network

volumes:
  mongo-data:
  redis-data:

networks:
  app-network:
    driver: bridge
```

### 2. 进程管理

```javascript
// ecosystem.config.js (PM2 配置)
module.exports = {
  apps: [{
    name: 'koa-blog-api',
    script: 'app.js',
    instances: 'max', // 使用所有 CPU 核心
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};
```

## 最佳实践

### 1. 项目结构最佳实践

- **分层架构**：控制器、服务、数据访问层分离
- **模块化**：按功能模块组织代码
- **配置管理**：环境变量和配置文件分离
- **错误处理**：统一的错误处理机制
- **日志记录**：结构化日志和监控

### 2. 性能最佳实践

- **数据库优化**：索引、查询优化、连接池
- **缓存策略**：Redis 缓存、HTTP 缓存
- **压缩**：Gzip/Brotli 压缩
- **静态资源**：CDN 和缓存策略
- **负载均衡**：集群模式和负载均衡

### 3. 安全最佳实践

- **输入验证**：严格的数据验证和清理
- **认证授权**：JWT 和 RBAC
- **限流**：API 限流和 DDoS 防护
- **HTTPS**：SSL/TLS 加密
- **安全头**：Helmet 安全中间件

### 4. 运维最佳实践

- **监控**：应用监控和日志分析
- **备份**：数据库备份策略
- **部署**：CI/CD 和蓝绿部署
- **扩展**：水平扩展和微服务
- **文档**：API 文档和运维手册

## 参考资源

### 官方文档
- [Koa.js 官方文档](https://koajs.com/)
- [Koa.js GitHub](https://github.com/koajs/koa)
- [Node.js 官方文档](https://nodejs.org/)

### 中间件生态
- [@koa/router](https://github.com/koajs/router) - 路由中间件
- [koa-bodyparser](https://github.com/koajs/bodyparser) - 请求体解析
- [koa-helmet](https://github.com/venables/koa-helmet) - 安全中间件
- [@koa/cors](https://github.com/koajs/cors) - CORS 中间件
- [koa-compress](https://github.com/koajs/compress) - 压缩中间件

### 学习资源
- [Koa.js 实战教程](https://github.com/guo-yu/koa-guide)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [JavaScript 异步编程](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous)

### 工具和库
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Redis](https://redis.io/) - 内存数据库
- [Winston](https://github.com/winstonjs/winston) - 日志库
- [Joi](https://joi.dev/) - 数据验证
- [Jest](https://jestjs.io/) - 测试框架