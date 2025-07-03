# Express.js 框架开发指南

## 简介

Express.js 是 Node.js 最流行的 Web 应用框架，提供了一套简洁而灵活的功能来开发 Web 和移动应用程序。它是一个最小化且灵活的框架，为 Web 和移动应用程序提供了一组强大的功能。

### 核心特性

- **轻量级框架**：最小化的核心功能，可扩展性强
- **中间件系统**：强大的中间件机制处理请求和响应
- **路由系统**：灵活的路由定义和参数处理
- **模板引擎**：支持多种模板引擎（EJS、Pug、Handlebars）
- **静态文件服务**：内置静态文件服务功能
- **错误处理**：完善的错误处理机制
- **HTTP 工具**：丰富的 HTTP 实用工具和方法

### 适用场景

- RESTful API 开发
- Web 应用程序
- 微服务架构
- 单页应用（SPA）后端
- 实时应用程序
- 企业级应用开发

## 快速开始

### 1. 项目初始化

```bash
# 创建项目目录
mkdir blog-api
cd blog-api

# 初始化 npm 项目
npm init -y

# 安装 Express
npm install express

# 安装开发依赖
npm install --save-dev nodemon

# 安装常用中间件
npm install cors helmet morgan compression dotenv
npm install express-rate-limit express-validator
npm install mongoose bcryptjs jsonwebtoken
```

### 2. 基础应用结构

```javascript
// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());

// CORS 配置
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 日志中间件
app.use(morgan('combined'));

// 压缩中间件
app.use(compression());

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/static', express.static('public'));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API 路由
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/articles', require('./routes/articles'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/comments', require('./routes/comments'));

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // 默认错误响应
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 开发环境显示详细错误
  if (process.env.NODE_ENV === 'development') {
    res.status(status).json({
      error: message,
      stack: err.stack,
      details: err
    });
  } else {
    // 生产环境隐藏敏感信息
    if (status === 500) {
      message = 'Internal Server Error';
    }
    res.status(status).json({
      error: message
    });
  }
});

// 启动服务器
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
blog-api/
├── app.js                 # 主应用文件
├── package.json
├── .env                   # 环境变量
├── .gitignore
├── README.md
├── config/
│   ├── database.js        # 数据库配置
│   ├── redis.js          # Redis 配置
│   └── config.js         # 应用配置
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

## 路由系统

### 1. 基础路由

```javascript
// routes/articles.js
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');

// 获取文章列表
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category').optional().isString().trim(),
  query('search').optional().isString().trim(),
  query('sort').optional().isIn(['createdAt', 'updatedAt', 'title', 'views']),
  query('order').optional().isIn(['asc', 'desc']),
  validate
], articleController.getArticles);

// 获取单篇文章
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid article ID'),
  validate
], articleController.getArticle);

// 创建文章（需要认证）
router.post('/', [
  auth.requireAuth,
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag must be less than 30 characters'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  validate
], articleController.createArticle);

// 更新文章
router.put('/:id', [
  auth.requireAuth,
  param('id').isMongoId().withMessage('Invalid article ID'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category must be less than 50 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
  validate
], articleController.updateArticle);

// 删除文章
router.delete('/:id', [
  auth.requireAuth,
  param('id').isMongoId().withMessage('Invalid article ID'),
  validate
], articleController.deleteArticle);

// 文章点赞
router.post('/:id/like', [
  auth.requireAuth,
  param('id').isMongoId().withMessage('Invalid article ID'),
  validate
], articleController.likeArticle);

// 文章浏览量增加
router.post('/:id/view', [
  param('id').isMongoId().withMessage('Invalid article ID'),
  validate
], articleController.incrementViews);

module.exports = router;
```

### 2. 路由参数和查询

```javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// 路由参数示例
router.get('/profile/:username', userController.getUserProfile);

// 多个路由参数
router.get('/:userId/articles/:articleId', userController.getUserArticle);

// 可选参数
router.get('/search/:query?', userController.searchUsers);

// 通配符路由
router.get('/files/*', userController.serveUserFiles);

// 正则表达式路由
router.get(/.*fly$/, userController.handleFlyRoutes);

// 查询参数处理
router.get('/', (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    search,
    role,
    active
  } = req.query;

  // 构建查询条件
  const filter = {};
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) filter.role = role;
  if (active !== undefined) filter.active = active === 'true';

  // 分页和排序
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { [sort]: order === 'desc' ? -1 : 1 }
  };

  userController.getUsers(req, res, { filter, options });
});

module.exports = router;
```

## 中间件系统

### 1. 认证中间件

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT 认证中间件
const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (!user.active) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// 可选认证中间件
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.active) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 忽略认证错误，继续处理请求
    next();
  }
};

// 角色检查中间件
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions.',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// 资源所有者检查
const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found.' });
      }

      // 检查是否是资源所有者或管理员
      if (resource.author?.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Not the owner.' });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error during ownership check.' });
    }
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireOwnership
};
```

### 2. 验证中间件

```javascript
// middleware/validation.js
const { validationResult } = require('express-validator');

// 验证结果处理中间件
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    });
  }

  next();
};

// 自定义验证器
const customValidators = {
  // 检查用户名是否唯一
  isUniqueUsername: async (value, { req }) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({
      username: value,
      _id: { $ne: req.params.id } // 排除当前用户（用于更新操作）
    });

    if (existingUser) {
      throw new Error('Username already exists');
    }
    return true;
  },

  // 检查邮箱是否唯一
  isUniqueEmail: async (value, { req }) => {
    const User = require('../models/User');
    const existingUser = await User.findOne({
      email: value,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }
    return true;
  },

  // 检查密码强度
  isStrongPassword: (value) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(value)) {
      throw new Error('Password must contain at least 8 characters, including uppercase, lowercase, number and special character');
    }
    return true;
  },

  // 检查文件类型
  isValidFileType: (allowedTypes) => {
    return (req, res, next) => {
      if (!req.file) {
        return next();
      }

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid file type',
          allowed: allowedTypes,
          received: req.file.mimetype
        });
      }

      next();
    };
  }
};

module.exports = {
  validate,
  customValidators
};
```

### 3. 限流中间件

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis 客户端
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// 通用限流配置
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 分钟
    max: 100, // 最大请求数
    message: {
      error: 'Too many requests',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args)
    })
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// API 限流
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000, // 每个 IP 最多 1000 次请求
  message: {
    error: 'Too many API requests',
    retryAfter: '15 minutes'
  }
});

// 认证限流
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5, // 最多 5 次登录尝试
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  }
});

// 创建内容限流
const createContentLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 10, // 每小时最多创建 10 篇文章
  message: {
    error: 'Too many content creation requests',
    retryAfter: '1 hour'
  }
});

// 文件上传限流
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 50, // 每小时最多上传 50 个文件
  message: {
    error: 'Too many file upload requests',
    retryAfter: '1 hour'
  }
});

// 基于用户的限流
const userBasedLimiter = (options = {}) => {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      return req.user ? `user:${req.user._id}` : req.ip;
    }
  });
};

// 动态限流（根据用户角色）
const dynamicLimiter = (req, res, next) => {
  let maxRequests = 100; // 默认限制

  if (req.user) {
    switch (req.user.role) {
      case 'admin':
        maxRequests = 10000;
        break;
      case 'premium':
        maxRequests = 1000;
        break;
      case 'user':
        maxRequests = 500;
        break;
    }
  }

  const limiter = createRateLimiter({
    max: maxRequests,
    keyGenerator: (req) => {
      return req.user ? `user:${req.user._id}` : req.ip;
    }
  });

  limiter(req, res, next);
};

module.exports = {
  apiLimiter,
  authLimiter,
  createContentLimiter,
  uploadLimiter,
  userBasedLimiter,
  dynamicLimiter,
  createRateLimiter
};
```

## 控制器层

### 1. 文章控制器

```javascript
// controllers/articleController.js
const Article = require('../models/Article');
const User = require('../models/User');
const { validationResult } = require('express-validator');

class ArticleController {
  // 获取文章列表
  async getArticles(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sort = 'createdAt',
        order = 'desc',
        published = true
      } = req.query;

      // 构建查询条件
      const filter = {};

      // 只有管理员可以查看未发布的文章
      if (req.user?.role !== 'admin') {
        filter.published = true;
      } else if (published !== undefined) {
        filter.published = published === 'true';
      }

      if (category) {
        filter.category = category;
      }

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // 分页选项
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // 最大限制 100
        sort: { [sort]: order === 'desc' ? -1 : 1 },
        populate: [
          {
            path: 'author',
            select: 'username avatar'
          }
        ],
        select: '-__v'
      };

      const result = await Article.paginate(filter, options);

      res.json({
        articles: result.docs,
        pagination: {
          currentPage: result.page,
          totalPages: result.totalPages,
          totalItems: result.totalDocs,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  }

  // 获取单篇文章
  async getArticle(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findById(id)
        .populate('author', 'username avatar bio')
        .populate('comments.author', 'username avatar');

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // 检查文章是否已发布（除非是作者或管理员）
      if (!article.published &&
          (!req.user ||
           (req.user._id.toString() !== article.author._id.toString() &&
            req.user.role !== 'admin'))) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.json(article);
    } catch (error) {
      console.error('Error fetching article:', error);
      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid article ID' });
      }
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  }

  // 创建文章
  async createArticle(req, res) {
    try {
      const {
        title,
        content,
        category,
        tags = [],
        published = false,
        featuredImage
      } = req.body;

      const article = new Article({
        title,
        content,
        category,
        tags,
        published,
        featuredImage,
        author: req.user._id,
        slug: title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      });

      await article.save();
      await article.populate('author', 'username avatar');

      res.status(201).json({
        message: 'Article created successfully',
        article
      });
    } catch (error) {
      console.error('Error creating article:', error);

      if (error.code === 11000) {
        return res.status(400).json({ error: 'Article with this title already exists' });
      }

      res.status(500).json({ error: 'Failed to create article' });
    }
  }

  // 更新文章
  async updateArticle(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // 检查权限
      if (article.author.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to update this article' });
      }

      // 更新 slug 如果标题改变
      if (updates.title && updates.title !== article.title) {
        updates.slug = updates.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      updates.updatedAt = new Date();

      const updatedArticle = await Article.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      ).populate('author', 'username avatar');

      res.json({
        message: 'Article updated successfully',
        article: updatedArticle
      });
    } catch (error) {
      console.error('Error updating article:', error);

      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid article ID' });
      }

      if (error.code === 11000) {
        return res.status(400).json({ error: 'Article with this title already exists' });
      }

      res.status(500).json({ error: 'Failed to update article' });
    }
  }

  // 删除文章
  async deleteArticle(req, res) {
    try {
      const { id } = req.params;

      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // 检查权限
      if (article.author.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Not authorized to delete this article' });
      }

      await Article.findByIdAndDelete(id);

      res.json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error('Error deleting article:', error);

      if (error.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid article ID' });
      }

      res.status(500).json({ error: 'Failed to delete article' });
    }
  }

  // 文章点赞
  async likeArticle(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const article = await Article.findById(id);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const likeIndex = article.likes.indexOf(userId);

      if (likeIndex > -1) {
        // 取消点赞
        article.likes.splice(likeIndex, 1);
      } else {
        // 添加点赞
        article.likes.push(userId);
      }

      await article.save();

      res.json({
        message: likeIndex > -1 ? 'Article unliked' : 'Article liked',
        likes: article.likes.length,
        isLiked: likeIndex === -1
      });
    } catch (error) {
      console.error('Error liking article:', error);
      res.status(500).json({ error: 'Failed to like article' });
    }
  }

  // 增加浏览量
  async incrementViews(req, res) {
    try {
      const { id } = req.params;

      await Article.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );

      res.json({ message: 'Views incremented' });
    } catch (error) {
      console.error('Error incrementing views:', error);
      res.status(500).json({ error: 'Failed to increment views' });
    }
  }
}

module.exports = new ArticleController();
```

### 2. 认证控制器

```javascript
// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

class AuthController {
  // 用户注册
  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          field: existingUser.email === email ? 'email' : 'username'
        });
      }

      // 加密密码
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // 生成邮箱验证令牌
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // 创建用户
      const user = new User({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        emailVerificationToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24小时
      });

      await user.save();

      // 发送验证邮件
      try {
        await emailService.sendVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // 不阻止注册流程
      }

      // 生成 JWT
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          error: `${field} already exists`,
          field
        });
      }

      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      const { email, password, rememberMe = false } = req.body;

      // 查找用户
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 检查账户状态
      if (!user.active) {
        return res.status(401).json({ error: 'Account is deactivated' });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        // 记录失败的登录尝试
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        user.lastLoginAttempt = new Date();

        // 如果尝试次数过多，锁定账户
        if (user.loginAttempts >= 5) {
          user.accountLocked = true;
          user.lockUntil = Date.now() + 30 * 60 * 1000; // 锁定30分钟
        }

        await user.save();

        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // 检查账户是否被锁定
      if (user.accountLocked && user.lockUntil > Date.now()) {
        return res.status(401).json({
          error: 'Account is temporarily locked due to multiple failed login attempts',
          lockUntil: user.lockUntil
        });
      }

      // 重置登录尝试计数
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      // 生成 JWT
      const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // 邮箱验证
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  }

  // 忘记密码
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        // 为了安全，不透露用户是否存在
        return res.json({ message: 'If the email exists, a reset link has been sent' });
      }

      // 生成重置令牌
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1小时
      await user.save();

      // 发送重置邮件
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        return res.status(500).json({ error: 'Failed to send reset email' });
      }

      res.json({ message: 'If the email exists, a reset link has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  // 重置密码
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // 加密新密码
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.loginAttempts = 0;
      user.accountLocked = false;
      user.lockUntil = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Password reset failed' });
    }
  }

  // 更改密码
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user._id;

      const user = await User.findById(userId).select('+password');

      // 验证当前密码
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // 加密新密码
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      user.password = hashedNewPassword;
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }

  // 获取当前用户信息
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // 更新用户资料
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, bio, avatar } = req.body;
      const userId = req.user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          firstName,
          lastName,
          bio,
          avatar,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password');

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // 刷新令牌
  async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user || !user.active) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      // 生成新的访问令牌
      const newToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({ token: newToken });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
}

module.exports = new AuthController();
```

## 数据模型

### 1. 用户模型

```javascript
// models/User.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
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
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name must be less than 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name must be less than 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator', 'premium'],
    default: 'user'
  },
  active: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lockUntil: Date,
  lastLogin: Date,
  lastLoginAttempt: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
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
    }
  },
  socialLinks: {
    twitter: String,
    github: String,
    linkedin: String,
    website: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.__v;
      return ret;
    }
  }
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ active: 1 });
userSchema.index({ createdAt: -1 });

// 虚拟字段
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('isLocked').get(function() {
  return this.accountLocked && this.lockUntil > Date.now();
});

// 中间件
userSchema.pre('save', function(next) {
  // 清理锁定状态
  if (this.lockUntil && this.lockUntil <= Date.now()) {
    this.accountLocked = false;
    this.lockUntil = undefined;
    this.loginAttempts = 0;
  }
  next();
});

// 实例方法
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  delete user.loginAttempts;
  delete user.accountLocked;
  delete user.lockUntil;
  return user;
};

// 静态方法
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ active: true });
};

// 插件
userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', userSchema);
```

### 2. 文章模型

```javascript
// models/Article.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [1000, 'Comment must be less than 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Reply must be less than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title must be at least 1 character'],
    maxlength: [200, 'Title must be less than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt must be less than 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category must be less than 50 characters'],
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag must be less than 30 characters']
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
  comments: [commentSchema],
  readingTime: {
    type: Number, // 预估阅读时间（分钟）
    default: 0
  },
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title must be less than 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description must be less than 160 characters']
    },
    keywords: [String]
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
articleSchema.index({ title: 'text', content: 'text', tags: 'text' });
articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ published: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ views: -1 });
articleSchema.index({ slug: 1 }, { unique: true });

// 虚拟字段
articleSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

articleSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

articleSchema.virtual('url').get(function() {
  return `/articles/${this.slug}`;
});

// 中间件
articleSchema.pre('save', function(next) {
  // 生成摘要
  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '') // 移除 HTML 标签
      .substring(0, 200) + '...';
  }

  // 计算阅读时间（假设每分钟 200 字）
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  // 设置发布时间
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // 生成唯一 slug
  if (this.isModified('title') || !this.slug) {
    let baseSlug = this.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  next();
});

// 静态方法
articleSchema.statics.findPublished = function() {
  return this.find({ published: true }).sort({ publishedAt: -1 });
};

articleSchema.statics.findByCategory = function(category) {
  return this.find({ category, published: true });
};

articleSchema.statics.findByTag = function(tag) {
  return this.find({ tags: tag, published: true });
};

articleSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    published: true
  }).sort({ score: { $meta: 'textScore' } });
};

// 实例方法
articleSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content
  });
  return this.save();
};

articleSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  return this.save();
};

// 插件
articleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Article', articleSchema);
```

## 错误处理

### 1. 全局错误处理

```javascript
// middleware/errorHandler.js
const logger = require('../utils/logger');

// 自定义错误类
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 处理 Cast 错误（无效的 MongoDB ObjectId）
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// 处理重复字段错误
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])((?:(?!\1)[^\\]|\\.)*)\1/)[2];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// 处理验证错误
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// 处理 JWT 错误
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

// 发送开发环境错误
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// 发送生产环境错误
const sendErrorProd = (err, res) => {
  // 操作错误：发送给客户端
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // 编程错误：不泄露错误详情
    logger.error('ERROR 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// 全局错误处理中间件
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = {
  AppError,
  globalErrorHandler
};
```

### 2. 异步错误处理

```javascript
// utils/catchAsync.js
// 异步错误捕获包装器
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;

// 使用示例
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../middleware/errorHandler');

// 在控制器中使用
const getArticle = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const article = await Article.findById(id).populate('author');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  res.json({ article });
});
```

## 测试

### 1. 单元测试

```javascript
// tests/unit/controllers/articleController.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../app');
const Article = require('../../../models/Article');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

describe('Article Controller', () => {
  let authToken;
  let testUser;
  let testArticle;

  beforeAll(async () => {
    // 连接测试数据库
    await mongoose.connect(process.env.TEST_DATABASE_URL);

    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    // 生成认证令牌
    authToken = jwt.sign(
      { userId: testUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // 清理测试数据
    await Article.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // 创建测试文章
    testArticle = await Article.create({
      title: 'Test Article',
      content: 'This is a test article content.',
      author: testUser._id,
      published: true
    });
  });

  afterEach(async () => {
    // 清理每个测试后的数据
    await Article.deleteMany({});
  });

  describe('GET /api/v1/articles', () => {
    it('should return all published articles', async () => {
      const response = await request(app)
        .get('/api/v1/articles')
        .expect(200);

      expect(response.body.articles).toHaveLength(1);
      expect(response.body.articles[0].title).toBe('Test Article');
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter articles by category', async () => {
      await Article.create({
        title: 'Tech Article',
        content: 'Tech content',
        category: 'Technology',
        author: testUser._id,
        published: true
      });

      const response = await request(app)
        .get('/api/v1/articles?category=Technology')
        .expect(200);

      expect(response.body.articles).toHaveLength(1);
      expect(response.body.articles[0].category).toBe('Technology');
    });

    it('should paginate results', async () => {
      // 创建多篇文章
      for (let i = 0; i < 15; i++) {
        await Article.create({
          title: `Article ${i}`,
          content: `Content ${i}`,
          author: testUser._id,
          published: true
        });
      }

      const response = await request(app)
        .get('/api/v1/articles?page=2&limit=10')
        .expect(200);

      expect(response.body.articles).toHaveLength(6); // 15 + 1 (original) - 10 (first page)
      expect(response.body.pagination.currentPage).toBe(2);
    });
  });

  describe('GET /api/v1/articles/:id', () => {
    it('should return a specific article', async () => {
      const response = await request(app)
        .get(`/api/v1/articles/${testArticle._id}`)
        .expect(200);

      expect(response.body.title).toBe('Test Article');
      expect(response.body.author).toBeDefined();
    });

    it('should return 404 for non-existent article', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await request(app)
        .get(`/api/v1/articles/${fakeId}`)
        .expect(404);
    });

    it('should return 400 for invalid article ID', async () => {
      await request(app)
        .get('/api/v1/articles/invalid-id')
        .expect(400);
    });
  });

  describe('POST /api/v1/articles', () => {
    it('should create a new article with valid data', async () => {
      const articleData = {
        title: 'New Article',
        content: 'This is a new article content.',
        category: 'Technology',
        tags: ['javascript', 'nodejs']
      };

      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(articleData)
        .expect(201);

      expect(response.body.article.title).toBe(articleData.title);
      expect(response.body.article.author).toBe(testUser._id.toString());
      expect(response.body.article.slug).toBe('new-article');
    });

    it('should require authentication', async () => {
      const articleData = {
        title: 'New Article',
        content: 'This is a new article content.'
      };

      await request(app)
        .post('/api/v1/articles')
        .send(articleData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'title' }),
          expect.objectContaining({ field: 'content' })
        ])
      );
    });
  });

  describe('PUT /api/v1/articles/:id', () => {
    it('should update article by owner', async () => {
      const updateData = {
        title: 'Updated Article',
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/v1/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.article.title).toBe(updateData.title);
      expect(response.body.article.slug).toBe('updated-article');
    });

    it('should not allow non-owner to update', async () => {
      // 创建另一个用户
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User'
      });

      const otherToken = jwt.sign(
        { userId: otherUser._id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      await request(app)
        .put(`/api/v1/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Title' })
        .expect(403);
    });
  });

  describe('DELETE /api/v1/articles/:id', () => {
    it('should delete article by owner', async () => {
      await request(app)
        .delete(`/api/v1/articles/${testArticle._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedArticle = await Article.findById(testArticle._id);
      expect(deletedArticle).toBeNull();
    });
  });

  describe('POST /api/v1/articles/:id/like', () => {
    it('should like an article', async () => {
      const response = await request(app)
        .post(`/api/v1/articles/${testArticle._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(true);
      expect(response.body.likes).toBe(1);
    });

    it('should unlike an already liked article', async () => {
      // 先点赞
      await request(app)
        .post(`/api/v1/articles/${testArticle._id}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      // 再取消点赞
      const response = await request(app)
        .post(`/api/v1/articles/${testArticle._id}/like`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isLiked).toBe(false);
      expect(response.body.likes).toBe(0);
    });
  });
});
```

### 2. 集成测试

```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const User = require('../../models/User');

describe('Authentication Integration', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('User Registration Flow', () => {
    it('should register, login, and access protected route', async () => {
      // 1. 注册用户
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.token).toBeDefined();
      expect(registerResponse.body.user.email).toBe(userData.email);

      // 2. 使用注册时返回的令牌访问受保护的路由
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${registerResponse.body.token}`)
        .expect(200);

      expect(profileResponse.body.user.username).toBe(userData.username);

      // 3. 登录
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user.email).toBe(userData.email);

      // 4. 使用登录令牌访问受保护的路由
      await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);
    });
  });

  describe('Password Reset Flow', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User'
      });
    });

    it('should complete password reset flow', async () => {
      // 1. 请求密码重置
      await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      // 2. 检查用户是否有重置令牌
      const userWithToken = await User.findById(testUser._id);
      expect(userWithToken.passwordResetToken).toBeDefined();
      expect(userWithToken.passwordResetExpires).toBeDefined();

      // 3. 使用令牌重置密码
      const newPassword = 'NewPassword123!';
      await request(app)
        .post(`/api/v1/auth/reset-password/${userWithToken.passwordResetToken}`)
        .send({ password: newPassword })
        .expect(200);

      // 4. 验证令牌已被清除
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.passwordResetToken).toBeUndefined();
      expect(updatedUser.passwordResetExpires).toBeUndefined();

      // 5. 使用新密码登录
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);
    });
  });
});
```

## 性能优化

### 1. 缓存策略

```javascript
// middleware/cache.js
const Redis = require('ioredis');
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// 缓存中间件
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // 重写 res.json 方法来缓存响应
      const originalJson = res.json;
      res.json = function(data) {
        // 只缓存成功的响应
        if (res.statusCode === 200) {
          redis.setex(key, duration, JSON.stringify(data));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// 清除缓存
const clearCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
    next();
  };
};

// 条件缓存
const conditionalCache = (condition, duration = 300) => {
  return (req, res, next) => {
    if (condition(req)) {
      return cache(duration)(req, res, next);
    }
    next();
  };
};

module.exports = {
  cache,
  clearCache,
  conditionalCache,
  redis
};

// 使用示例
const { cache, clearCache } = require('../middleware/cache');

// 缓存文章列表 5 分钟
router.get('/articles', cache(300), articleController.getArticles);

// 创建文章后清除相关缓存
router.post('/articles',
  auth.requireAuth,
  clearCache('cache:/api/v1/articles*'),
  articleController.createArticle
);
```

### 2. 数据库优化

```javascript
// config/database.js
const mongoose = require('mongoose');

// 数据库连接配置
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      // 连接池配置
      maxPoolSize: 10, // 最大连接数
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket 超时
      bufferMaxEntries: 0, // 禁用缓冲
      bufferCommands: false, // 禁用命令缓冲

      // 性能优化
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
```

### 3. 请求优化

```javascript
// middleware/optimization.js
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 压缩中间件配置
const compressionConfig = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // 压缩级别 (1-9)
  threshold: 1024 // 只压缩大于 1KB 的响应
});

// 安全头配置
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// 响应时间监控
const responseTime = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);

    // 记录慢查询
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });

  next();
};

// 请求大小限制
const requestSizeLimit = (limit = '10mb') => {
  return (req, res, next) => {
    req.on('data', (chunk) => {
      req.rawBody = (req.rawBody || '') + chunk;
      if (req.rawBody.length > parseSize(limit)) {
        res.status(413).json({ error: 'Request entity too large' });
        return;
      }
    });
    next();
  };
};

// 解析大小字符串
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+)(\w+)$/);
  return match ? parseInt(match[1]) * (units[match[2]] || 1) : parseInt(size);
};

module.exports = {
  compressionConfig,
  helmetConfig,
  responseTime,
  requestSizeLimit
};
```

## 部署配置

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
RUN adduser -S nodeuser -u 1001

# 设置工作目录
WORKDIR /app

# 复制依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 更改所有权
RUN chown -R nodeuser:nodejs /app
USER nodeuser

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
      - DATABASE_URL=mongodb://mongo:27017/blog
      - REDIS_HOST=redis
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - blog-network

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped
    networks:
      - blog-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data
    restart: unless-stopped
    networks:
      - blog-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - blog-network

volumes:
  mongo-data:
  redis-data:

networks:
  blog-network:
    driver: bridge
```

### 2. 环境配置

```bash
# .env.example
# 应用配置
NODE_ENV=development
PORT=3000
APP_NAME=Blog API

# 数据库配置
DATABASE_URL=mongodb://localhost:27017/blog
TEST_DATABASE_URL=mongodb://localhost:27017/blog_test

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# 外部服务
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 安全配置
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 日志配置
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 最佳实践

### 1. 代码组织

- **模块化设计**：将功能拆分为独立的模块
- **分层架构**：控制器、服务、数据访问层分离
- **依赖注入**：使用依赖注入提高可测试性
- **配置管理**：集中管理应用配置

### 2. 安全实践

- **输入验证**：严格验证所有用户输入
- **认证授权**：实现完善的认证和授权机制
- **HTTPS**：生产环境强制使用 HTTPS
- **安全头**：设置适当的安全响应头
- **限流**：实现 API 限流防止滥用

### 3. 性能优化

- **缓存策略**：合理使用缓存提高响应速度
- **数据库优化**：优化查询和索引
- **压缩**：启用响应压缩
- **CDN**：使用 CDN 加速静态资源

### 4. 监控和日志

- **结构化日志**：使用结构化日志格式
- **错误追踪**：实现错误追踪和报告
- **性能监控**：监控应用性能指标
- **健康检查**：实现应用健康检查端点

## 参考资源

### 官方文档
- [Express.js 官方文档](https://expressjs.com/)
- [Node.js 官方文档](https://nodejs.org/docs/)
- [MongoDB 官方文档](https://docs.mongodb.com/)
- [Mongoose 文档](https://mongoosejs.com/docs/)

### 中间件和工具
- [Helmet.js](https://helmetjs.github.io/) - 安全中间件
- [Morgan](https://github.com/expressjs/morgan) - 日志中间件
- [Express Validator](https://express-validator.github.io/) - 验证中间件
- [Passport.js](http://www.passportjs.org/) - 认证中间件

### 最佳实践文章
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [RESTful API Design Best Practices](https://restfulapi.net/)

### 社区资源
- [Express.js GitHub](https://github.com/expressjs/express)
- [Node.js Community](https://nodejs.org/en/get-involved/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/express)

---

本指南涵盖了 Express.js 框架的核心概念、实际应用、最佳实践和部署配置。通过遵循这些指导原则，你可以构建高质量、可扩展、安全的 Node.js Web 应用程序。
