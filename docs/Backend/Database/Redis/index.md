# Redis 缓存数据库设计与优化

## 简介

Redis（Remote Dictionary Server）是一个开源的内存数据结构存储系统，可以用作数据库、缓存和消息代理。它支持多种数据结构，如字符串、哈希、列表、集合、有序集合等。

### 核心特性

- **内存存储**：所有数据存储在内存中，提供极高的读写性能
- **持久化**：支持 RDB 和 AOF 两种持久化方式
- **数据结构丰富**：支持字符串、哈希、列表、集合、有序集合等
- **原子操作**：所有操作都是原子性的
- **发布订阅**：支持消息发布订阅模式
- **事务支持**：支持事务操作
- **Lua 脚本**：支持 Lua 脚本执行
- **集群支持**：支持主从复制和集群模式

### 适用场景

- **缓存系统**：Web 应用缓存、数据库查询缓存
- **会话存储**：用户会话信息存储
- **实时排行榜**：游戏排行榜、热门文章排序
- **计数器**：网站访问量、点赞数统计
- **消息队列**：异步任务处理
- **分布式锁**：分布式系统中的资源锁定
- **地理位置服务**：附近的人、地理围栏

## 数据类型和使用场景

### 1. 字符串（String）

字符串是 Redis 最基本的数据类型，可以存储文本、数字或二进制数据。

```javascript
// Node.js Redis 客户端示例
const Redis = require('ioredis');
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0
});

// 字符串操作示例
class StringOperations {
  // 基础字符串操作
  static async basicOperations() {
    // 设置和获取
    await redis.set('user:1001:name', 'John Doe');
    const name = await redis.get('user:1001:name');
    console.log('User name:', name);
    
    // 设置过期时间
    await redis.setex('session:abc123', 3600, 'user_data');
    
    // 原子递增
    await redis.incr('page:views');
    await redis.incrby('page:views', 10);
    
    // 批量操作
    await redis.mset(
      'user:1001:email', 'john@example.com',
      'user:1001:age', '30'
    );
    
    const userData = await redis.mget(
      'user:1001:name',
      'user:1001:email',
      'user:1001:age'
    );
    console.log('User data:', userData);
  }
  
  // 计数器实现
  static async counterExample() {
    const today = new Date().toISOString().split('T')[0];
    
    // 每日访问量统计
    const dailyViews = await redis.incr(`views:daily:${today}`);
    
    // 用户点赞计数
    const likeCount = await redis.incr('article:123:likes');
    
    // 限流计数器
    const userRequests = await redis.incr(`rate_limit:user:1001:${Math.floor(Date.now() / 60000)}`);
    await redis.expire(`rate_limit:user:1001:${Math.floor(Date.now() / 60000)}`, 60);
    
    return {
      dailyViews,
      likeCount,
      userRequests
    };
  }
  
  // 缓存实现
  static async cacheExample() {
    const cacheKey = 'article:123:content';
    
    // 尝试从缓存获取
    let article = await redis.get(cacheKey);
    
    if (!article) {
      // 缓存未命中，从数据库获取
      article = await this.getArticleFromDatabase(123);
      
      // 存入缓存，设置1小时过期
      await redis.setex(cacheKey, 3600, JSON.stringify(article));
    } else {
      article = JSON.parse(article);
    }
    
    return article;
  }
  
  static async getArticleFromDatabase(id) {
    // 模拟数据库查询
    return {
      id,
      title: 'Sample Article',
      content: 'Article content...',
      author: 'John Doe'
    };
  }
}
```

### 2. 哈希（Hash）

哈希适合存储对象，每个哈希可以存储多个字段。

```javascript
// 哈希操作示例
class HashOperations {
  // 用户信息存储
  static async userProfileExample() {
    const userId = '1001';
    const userKey = `user:${userId}`;
    
    // 设置用户信息
    await redis.hmset(userKey, {
      'name': 'John Doe',
      'email': 'john@example.com',
      'age': '30',
      'city': 'New York',
      'last_login': Date.now().toString()
    });
    
    // 获取特定字段
    const name = await redis.hget(userKey, 'name');
    const email = await redis.hget(userKey, 'email');
    
    // 获取多个字段
    const userInfo = await redis.hmget(userKey, 'name', 'email', 'city');
    
    // 获取所有字段
    const allUserData = await redis.hgetall(userKey);
    
    // 检查字段是否存在
    const hasAge = await redis.hexists(userKey, 'age');
    
    // 删除字段
    await redis.hdel(userKey, 'last_login');
    
    return {
      name,
      email,
      userInfo,
      allUserData,
      hasAge
    };
  }
  
  // 文章统计信息
  static async articleStatsExample() {
    const articleId = '123';
    const statsKey = `article:${articleId}:stats`;
    
    // 初始化统计信息
    await redis.hmset(statsKey, {
      'views': '0',
      'likes': '0',
      'shares': '0',
      'comments': '0'
    });
    
    // 增加浏览量
    await redis.hincrby(statsKey, 'views', 1);
    
    // 增加点赞数
    await redis.hincrby(statsKey, 'likes', 1);
    
    // 获取当前统计
    const stats = await redis.hgetall(statsKey);
    
    return {
      views: parseInt(stats.views),
      likes: parseInt(stats.likes),
      shares: parseInt(stats.shares),
      comments: parseInt(stats.comments)
    };
  }
  
  // 购物车实现
  static async shoppingCartExample() {
    const userId = '1001';
    const cartKey = `cart:${userId}`;
    
    // 添加商品到购物车
    await redis.hset(cartKey, 'product:123', '2'); // 商品ID:数量
    await redis.hset(cartKey, 'product:456', '1');
    
    // 更新商品数量
    await redis.hincrby(cartKey, 'product:123', 1);
    
    // 获取购物车内容
    const cartItems = await redis.hgetall(cartKey);
    
    // 移除商品
    await redis.hdel(cartKey, 'product:456');
    
    // 清空购物车
    // await redis.del(cartKey);
    
    return cartItems;
  }
}
```

### 3. 列表（List）

列表是有序的字符串集合，支持从两端插入和弹出元素。

```javascript
// 列表操作示例
class ListOperations {
  // 消息队列实现
  static async messageQueueExample() {
    const queueKey = 'task:queue';
    
    // 生产者：添加任务到队列
    const tasks = [
      { id: 1, type: 'email', data: { to: 'user@example.com', subject: 'Welcome' } },
      { id: 2, type: 'sms', data: { phone: '+1234567890', message: 'Verification code: 123456' } },
      { id: 3, type: 'push', data: { userId: '1001', message: 'New message received' } }
    ];
    
    for (const task of tasks) {
      await redis.lpush(queueKey, JSON.stringify(task));
    }
    
    // 消费者：处理队列中的任务
    const processedTasks = [];
    let task;
    
    while ((task = await redis.rpop(queueKey)) !== null) {
      const taskData = JSON.parse(task);
      console.log('Processing task:', taskData);
      processedTasks.push(taskData);
      
      // 模拟任务处理
      await this.processTask(taskData);
    }
    
    return processedTasks;
  }
  
  // 阻塞队列实现
  static async blockingQueueExample() {
    const queueKey = 'blocking:queue';
    
    // 阻塞式消费（等待新任务）
    const consumeTask = async () => {
      while (true) {
        try {
          // 阻塞等待，超时时间为10秒
          const result = await redis.brpop(queueKey, 10);
          
          if (result) {
            const [key, task] = result;
            const taskData = JSON.parse(task);
            console.log('Received task:', taskData);
            await this.processTask(taskData);
          } else {
            console.log('No tasks received, continuing to wait...');
          }
        } catch (error) {
          console.error('Error consuming task:', error);
          break;
        }
      }
    };
    
    // 启动消费者（在实际应用中，这通常在单独的进程中运行）
    // consumeTask();
    
    // 生产者：添加任务
    const newTask = {
      id: Date.now(),
      type: 'notification',
      data: { message: 'Hello from blocking queue!' }
    };
    
    await redis.lpush(queueKey, JSON.stringify(newTask));
  }
  
  // 最近访问记录
  static async recentActivityExample() {
    const userId = '1001';
    const activityKey = `user:${userId}:recent_activity`;
    
    // 添加新的活动记录
    const activities = [
      { action: 'login', timestamp: Date.now() },
      { action: 'view_article', articleId: '123', timestamp: Date.now() + 1000 },
      { action: 'like_article', articleId: '123', timestamp: Date.now() + 2000 }
    ];
    
    for (const activity of activities) {
      await redis.lpush(activityKey, JSON.stringify(activity));
      
      // 保持最近50条记录
      await redis.ltrim(activityKey, 0, 49);
    }
    
    // 获取最近的活动记录
    const recentActivities = await redis.lrange(activityKey, 0, 9); // 最近10条
    
    return recentActivities.map(activity => JSON.parse(activity));
  }
  
  // 分页列表
  static async paginatedListExample() {
    const listKey = 'articles:latest';
    
    // 添加文章ID到列表
    const articleIds = ['123', '124', '125', '126', '127'];
    for (const id of articleIds) {
      await redis.lpush(listKey, id);
    }
    
    // 分页获取
    const page = 1;
    const pageSize = 2;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    
    const pageData = await redis.lrange(listKey, start, end);
    const totalCount = await redis.llen(listKey);
    
    return {
      data: pageData,
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize)
    };
  }
  
  static async processTask(task) {
    // 模拟任务处理延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`Task ${task.id} processed successfully`);
  }
}
```

### 4. 集合（Set）

集合是无序的字符串集合，不允许重复元素。

```javascript
// 集合操作示例
class SetOperations {
  // 标签系统
  static async tagSystemExample() {
    const articleId = '123';
    const tagsKey = `article:${articleId}:tags`;
    
    // 添加标签
    await redis.sadd(tagsKey, 'javascript', 'nodejs', 'redis', 'database');
    
    // 检查标签是否存在
    const hasJavaScript = await redis.sismember(tagsKey, 'javascript');
    const hasPython = await redis.sismember(tagsKey, 'python');
    
    // 获取所有标签
    const allTags = await redis.smembers(tagsKey);
    
    // 获取标签数量
    const tagCount = await redis.scard(tagsKey);
    
    // 随机获取标签
    const randomTag = await redis.srandmember(tagsKey);
    const randomTags = await redis.srandmember(tagsKey, 2);
    
    // 移除标签
    await redis.srem(tagsKey, 'database');
    
    return {
      hasJavaScript,
      hasPython,
      allTags,
      tagCount,
      randomTag,
      randomTags
    };
  }
  
  // 用户关注系统
  static async followSystemExample() {
    const userId1 = '1001';
    const userId2 = '1002';
    const userId3 = '1003';
    
    // 用户1关注用户2和用户3
    await redis.sadd(`user:${userId1}:following`, userId2, userId3);
    
    // 用户2被用户1关注
    await redis.sadd(`user:${userId2}:followers`, userId1);
    
    // 用户3被用户1关注
    await redis.sadd(`user:${userId3}:followers`, userId1);
    
    // 获取关注列表
    const following = await redis.smembers(`user:${userId1}:following`);
    
    // 获取粉丝列表
    const followers = await redis.smembers(`user:${userId2}:followers`);
    
    // 检查关注关系
    const isFollowing = await redis.sismember(`user:${userId1}:following`, userId2);
    
    // 取消关注
    await redis.srem(`user:${userId1}:following`, userId3);
    await redis.srem(`user:${userId3}:followers`, userId1);
    
    return {
      following,
      followers,
      isFollowing
    };
  }
  
  // 共同兴趣推荐
  static async commonInterestsExample() {
    const user1Interests = 'user:1001:interests';
    const user2Interests = 'user:1002:interests';
    
    // 设置用户兴趣
    await redis.sadd(user1Interests, 'javascript', 'nodejs', 'react', 'mongodb');
    await redis.sadd(user2Interests, 'javascript', 'python', 'react', 'postgresql');
    
    // 计算共同兴趣
    const commonInterests = await redis.sinter(user1Interests, user2Interests);
    
    // 计算用户1独有的兴趣
    const user1UniqueInterests = await redis.sdiff(user1Interests, user2Interests);
    
    // 计算所有兴趣的并集
    const allInterests = await redis.sunion(user1Interests, user2Interests);
    
    // 将共同兴趣存储到新集合
    const commonKey = 'users:1001:1002:common_interests';
    await redis.sinterstore(commonKey, user1Interests, user2Interests);
    await redis.expire(commonKey, 3600); // 1小时后过期
    
    return {
      commonInterests,
      user1UniqueInterests,
      allInterests,
      commonCount: commonInterests.length
    };
  }
  
  // 在线用户统计
  static async onlineUsersExample() {
    const onlineUsersKey = 'users:online';
    
    // 用户上线
    const userLogin = async (userId) => {
      await redis.sadd(onlineUsersKey, userId);
      // 设置用户在线状态过期时间
      await redis.expire(`user:${userId}:online`, 300); // 5分钟
    };
    
    // 用户下线
    const userLogout = async (userId) => {
      await redis.srem(onlineUsersKey, userId);
      await redis.del(`user:${userId}:online`);
    };
    
    // 模拟用户上线
    await userLogin('1001');
    await userLogin('1002');
    await userLogin('1003');
    
    // 获取在线用户数量
    const onlineCount = await redis.scard(onlineUsersKey);
    
    // 获取所有在线用户
    const onlineUsers = await redis.smembers(onlineUsersKey);
    
    // 检查特定用户是否在线
    const isUserOnline = await redis.sismember(onlineUsersKey, '1001');
    
    return {
      onlineCount,
      onlineUsers,
      isUserOnline
    };
  }
}
```

### 5. 有序集合（Sorted Set）

有序集合是按分数排序的字符串集合，每个元素都有一个分数。

```javascript
// 有序集合操作示例
class SortedSetOperations {
  // 排行榜系统
  static async leaderboardExample() {
    const leaderboardKey = 'game:leaderboard';
    
    // 添加玩家分数
    const players = [
      { name: 'Alice', score: 1500 },
      { name: 'Bob', score: 1200 },
      { name: 'Charlie', score: 1800 },
      { name: 'David', score: 1350 },
      { name: 'Eve', score: 1650 }
    ];
    
    for (const player of players) {
      await redis.zadd(leaderboardKey, player.score, player.name);
    }
    
    // 更新玩家分数
    await redis.zincrby(leaderboardKey, 100, 'Alice'); // Alice +100分
    
    // 获取排行榜（从高到低）
    const topPlayers = await redis.zrevrange(leaderboardKey, 0, 4, 'WITHSCORES');
    
    // 获取特定玩家的排名（从1开始）
    const aliceRank = await redis.zrevrank(leaderboardKey, 'Alice');
    const aliceScore = await redis.zscore(leaderboardKey, 'Alice');
    
    // 获取分数范围内的玩家
    const midRangePlayers = await redis.zrangebyscore(leaderboardKey, 1300, 1600, 'WITHSCORES');
    
    // 获取排名范围内的玩家
    const top3 = await redis.zrevrange(leaderboardKey, 0, 2, 'WITHSCORES');
    
    return {
      topPlayers: this.parseScoreResult(topPlayers),
      aliceRank: aliceRank + 1, // Redis排名从0开始，转换为从1开始
      aliceScore,
      midRangePlayers: this.parseScoreResult(midRangePlayers),
      top3: this.parseScoreResult(top3)
    };
  }
  
  // 热门文章排序
  static async hotArticlesExample() {
    const hotArticlesKey = 'articles:hot';
    
    // 计算文章热度分数（浏览量 + 点赞数*2 + 评论数*3）
    const calculateHotScore = (views, likes, comments) => {
      return views + (likes * 2) + (comments * 3);
    };
    
    // 添加文章热度
    const articles = [
      { id: '123', views: 1000, likes: 50, comments: 20 },
      { id: '124', views: 800, likes: 80, comments: 15 },
      { id: '125', views: 1200, likes: 30, comments: 25 },
      { id: '126', views: 600, likes: 100, comments: 30 }
    ];
    
    for (const article of articles) {
      const hotScore = calculateHotScore(article.views, article.likes, article.comments);
      await redis.zadd(hotArticlesKey, hotScore, article.id);
    }
    
    // 获取热门文章列表
    const hotArticles = await redis.zrevrange(hotArticlesKey, 0, 9); // 前10篇
    
    // 获取文章热度分数
    const articleScore = await redis.zscore(hotArticlesKey, '123');
    
    // 获取文章排名
    const articleRank = await redis.zrevrank(hotArticlesKey, '123');
    
    // 移除过期文章
    await redis.zrem(hotArticlesKey, '126');
    
    return {
      hotArticles,
      articleScore,
      articleRank: articleRank + 1
    };
  }
  
  // 时间线功能
  static async timelineExample() {
    const timelineKey = 'user:1001:timeline';
    
    // 添加时间线事件（使用时间戳作为分数）
    const events = [
      { id: 'event1', content: 'User logged in', timestamp: Date.now() - 3600000 },
      { id: 'event2', content: 'User posted an article', timestamp: Date.now() - 1800000 },
      { id: 'event3', content: 'User liked a post', timestamp: Date.now() - 900000 },
      { id: 'event4', content: 'User commented on article', timestamp: Date.now() }
    ];
    
    for (const event of events) {
      await redis.zadd(timelineKey, event.timestamp, JSON.stringify({
        id: event.id,
        content: event.content,
        timestamp: event.timestamp
      }));
    }
    
    // 获取最新的时间线事件
    const recentEvents = await redis.zrevrange(timelineKey, 0, 4);
    
    // 获取特定时间范围的事件
    const oneHourAgo = Date.now() - 3600000;
    const eventsLastHour = await redis.zrangebyscore(timelineKey, oneHourAgo, Date.now());
    
    // 清理旧事件（保留最近100条）
    const totalEvents = await redis.zcard(timelineKey);
    if (totalEvents > 100) {
      await redis.zremrangebyrank(timelineKey, 0, totalEvents - 101);
    }
    
    return {
      recentEvents: recentEvents.map(event => JSON.parse(event)),
      eventsLastHour: eventsLastHour.map(event => JSON.parse(event))
    };
  }
  
  // 延迟队列实现
  static async delayedQueueExample() {
    const delayedQueueKey = 'tasks:delayed';
    
    // 添加延迟任务
    const addDelayedTask = async (taskId, taskData, delaySeconds) => {
      const executeTime = Date.now() + (delaySeconds * 1000);
      await redis.zadd(delayedQueueKey, executeTime, JSON.stringify({
        id: taskId,
        data: taskData,
        executeTime
      }));
    };
    
    // 处理到期任务
    const processExpiredTasks = async () => {
      const now = Date.now();
      const expiredTasks = await redis.zrangebyscore(delayedQueueKey, 0, now);
      
      for (const taskJson of expiredTasks) {
        const task = JSON.parse(taskJson);
        console.log('Processing delayed task:', task);
        
        // 处理任务
        await this.processDelayedTask(task);
        
        // 从队列中移除已处理的任务
        await redis.zrem(delayedQueueKey, taskJson);
      }
      
      return expiredTasks.length;
    };
    
    // 添加一些延迟任务
    await addDelayedTask('task1', { type: 'email', recipient: 'user@example.com' }, 10); // 10秒后执行
    await addDelayedTask('task2', { type: 'notification', userId: '1001' }, 30); // 30秒后执行
    
    // 获取待处理任务数量
    const pendingTasksCount = await redis.zcard(delayedQueueKey);
    
    return {
      pendingTasksCount,
      processExpiredTasks
    };
  }
  
  // 解析带分数的结果
  static parseScoreResult(result) {
    const parsed = [];
    for (let i = 0; i < result.length; i += 2) {
      parsed.push({
        member: result[i],
        score: parseFloat(result[i + 1])
      });
    }
    return parsed;
  }
  
  static async processDelayedTask(task) {
    // 模拟任务处理
    console.log(`Processing delayed task ${task.id}:`, task.data);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## 高级功能

### 1. 发布订阅（Pub/Sub）

```javascript
// 发布订阅示例
class PubSubOperations {
  constructor() {
    this.publisher = new Redis();
    this.subscriber = new Redis();
  }
  
  // 实时通知系统
  async setupNotificationSystem() {
    // 订阅者设置
    this.subscriber.subscribe('notifications', 'user:1001:notifications');
    
    this.subscriber.on('message', (channel, message) => {
      console.log(`Received message on ${channel}:`, message);
      
      try {
        const notification = JSON.parse(message);
        this.handleNotification(notification);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });
    
    // 发布通知
    const publishNotification = async (channel, notification) => {
      await this.publisher.publish(channel, JSON.stringify(notification));
    };
    
    // 发送全局通知
    await publishNotification('notifications', {
      type: 'system',
      message: 'System maintenance scheduled for tonight',
      timestamp: Date.now()
    });
    
    // 发送用户特定通知
    await publishNotification('user:1001:notifications', {
      type: 'personal',
      message: 'You have a new message',
      userId: '1001',
      timestamp: Date.now()
    });
  }
  
  // 实时聊天系统
  async setupChatSystem() {
    const chatRooms = ['room:general', 'room:tech', 'room:random'];
    
    // 订阅聊天室
    this.subscriber.subscribe(...chatRooms);
    
    this.subscriber.on('message', (channel, message) => {
      const chatMessage = JSON.parse(message);
      console.log(`[${channel}] ${chatMessage.username}: ${chatMessage.content}`);
      
      // 这里可以将消息推送给连接的WebSocket客户端
      this.broadcastToWebSocketClients(channel, chatMessage);
    });
    
    // 发送聊天消息
    const sendChatMessage = async (room, username, content) => {
      const message = {
        username,
        content,
        timestamp: Date.now(),
        room
      };
      
      await this.publisher.publish(`room:${room}`, JSON.stringify(message));
    };
    
    // 模拟发送消息
    await sendChatMessage('general', 'Alice', 'Hello everyone!');
    await sendChatMessage('tech', 'Bob', 'Anyone working with Redis?');
  }
  
  // 模式订阅
  async setupPatternSubscription() {
    // 订阅所有用户通知
    this.subscriber.psubscribe('user:*:notifications');
    
    this.subscriber.on('pmessage', (pattern, channel, message) => {
      console.log(`Pattern ${pattern} matched channel ${channel}:`, message);
      
      // 提取用户ID
      const userId = channel.split(':')[1];
      const notification = JSON.parse(message);
      
      this.handleUserNotification(userId, notification);
    });
    
    // 发送通知给不同用户
    await this.publisher.publish('user:1001:notifications', JSON.stringify({
      type: 'like',
      message: 'Someone liked your post'
    }));
    
    await this.publisher.publish('user:1002:notifications', JSON.stringify({
      type: 'comment',
      message: 'New comment on your article'
    }));
  }
  
  handleNotification(notification) {
    // 处理通知逻辑
    console.log('Handling notification:', notification);
  }
  
  handleUserNotification(userId, notification) {
    // 处理用户特定通知
    console.log(`Handling notification for user ${userId}:`, notification);
  }
  
  broadcastToWebSocketClients(channel, message) {
    // 这里应该实现WebSocket广播逻辑
    console.log(`Broadcasting to WebSocket clients in ${channel}:`, message);
  }
}
```

### 2. 事务和管道

```javascript
// 事务和管道操作
class TransactionOperations {
  // Redis事务示例
  static async transferPoints() {
    const fromUser = 'user:1001:points';
    const toUser = 'user:1002:points';
    const transferAmount = 100;
    
    // 使用WATCH监控键的变化
    await redis.watch(fromUser, toUser);
    
    // 检查余额
    const fromBalance = parseInt(await redis.get(fromUser) || '0');
    
    if (fromBalance < transferAmount) {
      await redis.unwatch();
      throw new Error('Insufficient balance');
    }
    
    // 开始事务
    const multi = redis.multi();
    multi.decrby(fromUser, transferAmount);
    multi.incrby(toUser, transferAmount);
    
    // 执行事务
    const results = await multi.exec();
    
    if (results === null) {
      throw new Error('Transaction failed due to key modification');
    }
    
    return {
      success: true,
      fromBalance: fromBalance - transferAmount,
      toBalance: parseInt(await redis.get(toUser))
    };
  }
  
  // 管道操作示例
  static async batchOperations() {
    const pipeline = redis.pipeline();
    
    // 批量添加用户数据
    const users = [
      { id: '1001', name: 'Alice', email: 'alice@example.com' },
      { id: '1002', name: 'Bob', email: 'bob@example.com' },
      { id: '1003', name: 'Charlie', email: 'charlie@example.com' }
    ];
    
    users.forEach(user => {
      pipeline.hmset(`user:${user.id}`, {
        name: user.name,
        email: user.email,
        created_at: Date.now().toString()
      });
      pipeline.sadd('users:all', user.id);
      pipeline.incr('stats:total_users');
    });
    
    // 执行所有操作
    const results = await pipeline.exec();
    
    // 检查结果
    const errors = results.filter(([error]) => error !== null);
    if (errors.length > 0) {
      console.error('Pipeline errors:', errors);
    }
    
    return {
      totalOperations: results.length,
      errors: errors.length,
      success: errors.length === 0
    };
  }
  
  // 原子计数器
  static async atomicCounter() {
    const counterKey = 'atomic:counter';
    const lockKey = 'lock:counter';
    
    // 使用SET NX实现简单锁
    const acquireLock = async (timeout = 5000) => {
      const lockValue = Date.now() + timeout;
      const acquired = await redis.set(lockKey, lockValue, 'PX', timeout, 'NX');
      return acquired === 'OK';
    };
    
    const releaseLock = async () => {
      await redis.del(lockKey);
    };
    
    // 安全的计数器增加
    const safeIncrement = async () => {
      if (await acquireLock()) {
        try {
          const currentValue = parseInt(await redis.get(counterKey) || '0');
          const newValue = currentValue + 1;
          await redis.set(counterKey, newValue);
          return newValue;
        } finally {
          await releaseLock();
        }
      } else {
        throw new Error('Could not acquire lock');
      }
    };
    
    return await safeIncrement();
  }
}
```

### 3. Lua 脚本

```javascript
// Lua脚本示例
class LuaScriptOperations {
  // 限流脚本
  static async rateLimitScript() {
    const rateLimitScript = `
      local key = KEYS[1]
      local window = tonumber(ARGV[1])
      local limit = tonumber(ARGV[2])
      local current_time = tonumber(ARGV[3])
      
      -- 清理过期的请求记录
      redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
      
      -- 获取当前窗口内的请求数量
      local current_requests = redis.call('ZCARD', key)
      
      if current_requests < limit then
        -- 添加当前请求
        redis.call('ZADD', key, current_time, current_time)
        redis.call('EXPIRE', key, math.ceil(window / 1000))
        return {1, limit - current_requests - 1}
      else
        return {0, 0}
      end
    `;
    
    // 检查限流
    const checkRateLimit = async (userId, windowMs = 60000, limit = 100) => {
      const key = `rate_limit:${userId}`;
      const currentTime = Date.now();
      
      const result = await redis.eval(
        rateLimitScript,
        1,
        key,
        windowMs,
        limit,
        currentTime
      );
      
      return {
        allowed: result[0] === 1,
        remaining: result[1]
      };
    };
    
    // 测试限流
    const userId = '1001';
    const result1 = await checkRateLimit(userId, 60000, 5); // 每分钟5次
    const result2 = await checkRateLimit(userId, 60000, 5);
    
    return { result1, result2 };
  }
  
  // 分布式锁脚本
  static async distributedLockScript() {
    const lockScript = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      else
        return 0
      end
    `;
    
    const acquireLock = async (lockKey, lockValue, ttl = 10000) => {
      const result = await redis.set(lockKey, lockValue, 'PX', ttl, 'NX');
      return result === 'OK';
    };
    
    const releaseLock = async (lockKey, lockValue) => {
      const result = await redis.eval(lockScript, 1, lockKey, lockValue);
      return result === 1;
    };
    
    // 使用分布式锁
    const lockKey = 'lock:resource:123';
    const lockValue = `${Date.now()}-${Math.random()}`;
    
    if (await acquireLock(lockKey, lockValue)) {
      try {
        // 执行需要锁保护的操作
        console.log('Lock acquired, performing critical operation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return 'Operation completed successfully';
      } finally {
        await releaseLock(lockKey, lockValue);
        console.log('Lock released');
      }
    } else {
      throw new Error('Could not acquire lock');
    }
  }
  
  // 原子性更新脚本
  static async atomicUpdateScript() {
    const updateScript = `
      local key = KEYS[1]
      local field = ARGV[1]
      local increment = tonumber(ARGV[2])
      local max_value = tonumber(ARGV[3])
      
      local current = tonumber(redis.call('HGET', key, field) or 0)
      local new_value = current + increment
      
      if new_value <= max_value then
        redis.call('HSET', key, field, new_value)
        return {1, new_value}
      else
        return {0, current}
      end
    `;
    
    // 原子性增加库存
    const updateInventory = async (productId, quantity, maxStock) => {
      const key = `product:${productId}:inventory`;
      
      const result = await redis.eval(
        updateScript,
        1,
        key,
        'stock',
        quantity,
        maxStock
      );
      
      return {
        success: result[0] === 1,
        newStock: result[1]
      };
    };
    
    // 测试库存更新
    const result1 = await updateInventory('prod123', 10, 100);
    const result2 = await updateInventory('prod123', 95, 100); // 应该失败
    
    return { result1, result2 };
  }
}
```

## 性能优化

### 1. 连接池配置

```javascript
// Redis连接池配置
class RedisConnectionPool {
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0,
      
      // 连接池配置
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxLoadingTimeout: 1000,
      
      // 连接配置
      connectTimeout: 10000,
      commandTimeout: 5000,
      lazyConnect: true,
      
      // 重连配置
      retryDelayOnClusterDown: 300,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      
      // 集群配置（如果使用Redis集群）
      enableOfflineQueue: false,
      
      // 性能配置
      keepAlive: 30000,
      family: 4, // IPv4
      
      // 事件监听
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        return err.message.includes(targetError);
      }
    });
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.redis.on('connect', () => {
      console.log('Redis connected');
    });
    
    this.redis.on('ready', () => {
      console.log('Redis ready');
    });
    
    this.redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    this.redis.on('close', () => {
      console.log('Redis connection closed');
    });
    
    this.redis.on('reconnecting', () => {
      console.log('Redis reconnecting');
    });
  }
  
  // 健康检查
  async healthCheck() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return {
        status: 'healthy',
        latency: `${latency}ms`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  // 获取连接信息
  async getConnectionInfo() {
    const info = await this.redis.info('clients');
    const memory = await this.redis.info('memory');
    
    return {
      clients: this.parseInfo(info),
      memory: this.parseInfo(memory)
    };
  }
  
  parseInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};
    
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value) {
          info[key] = value;
        }
      }
    });
    
    return info;
  }
}
```

### 2. 缓存策略

```javascript
// 缓存策略实现
class CacheStrategy {
  constructor(redis) {
    this.redis = redis;
  }
  
  // Cache-Aside模式
  async cacheAside(key, fetchFunction, ttl = 3600) {
    // 尝试从缓存获取
    let data = await this.redis.get(key);
    
    if (data) {
      return JSON.parse(data);
    }
    
    // 缓存未命中，从数据源获取
    data = await fetchFunction();
    
    if (data) {
      // 存入缓存
      await this.redis.setex(key, ttl, JSON.stringify(data));
    }
    
    return data;
  }
  
  // Write-Through模式
  async writeThrough(key, data, updateFunction, ttl = 3600) {
    // 同时更新缓存和数据源
    await Promise.all([
      this.redis.setex(key, ttl, JSON.stringify(data)),
      updateFunction(data)
    ]);
    
    return data;
  }
  
  // Write-Behind模式
  async writeBehind(key, data, ttl = 3600) {
    // 立即更新缓存
    await this.redis.setex(key, ttl, JSON.stringify(data));
    
    // 异步更新数据源
    setImmediate(async () => {
      try {
        await this.updateDataSource(key, data);
      } catch (error) {
        console.error('Write-behind update failed:', error);
        // 可以实现重试机制
      }
    });
    
    return data;
  }
  
  // 多级缓存
  async multiLevelCache(key, fetchFunction, l1Ttl = 300, l2Ttl = 3600) {
    const l1Key = `l1:${key}`;
    const l2Key = `l2:${key}`;
    
    // L1缓存检查
    let data = await this.redis.get(l1Key);
    if (data) {
      return JSON.parse(data);
    }
    
    // L2缓存检查
    data = await this.redis.get(l2Key);
    if (data) {
      // 回填L1缓存
      await this.redis.setex(l1Key, l1Ttl, data);
      return JSON.parse(data);
    }
    
    // 从数据源获取
    data = await fetchFunction();
    
    if (data) {
      const serializedData = JSON.stringify(data);
      // 同时更新L1和L2缓存
      await Promise.all([
        this.redis.setex(l1Key, l1Ttl, serializedData),
        this.redis.setex(l2Key, l2Ttl, serializedData)
      ]);
    }
    
    return data;
  }
  
  // 缓存预热
  async warmupCache(keys, fetchFunction, ttl = 3600) {
    const pipeline = this.redis.pipeline();
    
    for (const key of keys) {
      try {
        const data = await fetchFunction(key);
        if (data) {
          pipeline.setex(key, ttl, JSON.stringify(data));
        }
      } catch (error) {
        console.error(`Failed to warmup cache for key ${key}:`, error);
      }
    }
    
    await pipeline.exec();
  }
  
  // 缓存失效
  async invalidateCache(pattern) {
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
    
    return keys.length;
  }
  
  async updateDataSource(key, data) {
    // 模拟数据源更新
    console.log(`Updating data source for key ${key}:`, data);
    // 实际实现中，这里应该是数据库更新操作
  }
}
```

### 3. 监控和指标

```javascript
// Redis监控和指标收集
class RedisMonitoring {
  constructor(redis) {
    this.redis = redis;
    this.metrics = {
      commands: new Map(),
      errors: new Map(),
      latency: []
    };
  }
  
  // 包装Redis命令以收集指标
  wrapCommand(commandName) {
    const originalCommand = this.redis[commandName];
    
    this.redis[commandName] = async (...args) => {
      const start = Date.now();
      
      try {
        const result = await originalCommand.apply(this.redis, args);
        
        // 记录成功指标
        this.recordCommandMetric(commandName, Date.now() - start, true);
        
        return result;
      } catch (error) {
        // 记录错误指标
        this.recordCommandMetric(commandName, Date.now() - start, false);
        this.recordError(commandName, error);
        
        throw error;
      }
    };
  }
  
  recordCommandMetric(command, latency, success) {
    // 记录命令统计
    if (!this.metrics.commands.has(command)) {
      this.metrics.commands.set(command, {
        count: 0,
        successCount: 0,
        errorCount: 0,
        totalLatency: 0,
        avgLatency: 0
      });
    }
    
    const metric = this.metrics.commands.get(command);
    metric.count++;
    metric.totalLatency += latency;
    metric.avgLatency = metric.totalLatency / metric.count;
    
    if (success) {
      metric.successCount++;
    } else {
      metric.errorCount++;
    }
    
    // 记录延迟分布
    this.metrics.latency.push({ command, latency, timestamp: Date.now() });
    
    // 保持最近1000条记录
    if (this.metrics.latency.length > 1000) {
      this.metrics.latency.shift();
    }
  }
  
  recordError(command, error) {
    const errorKey = `${command}:${error.message}`;
    
    if (!this.metrics.errors.has(errorKey)) {
      this.metrics.errors.set(errorKey, 0);
    }
    
    this.metrics.errors.set(errorKey, this.metrics.errors.get(errorKey) + 1);
  }
  
  // 获取性能指标
  async getPerformanceMetrics() {
    const info = await this.redis.info();
    const parsedInfo = this.parseRedisInfo(info);
    
    return {
      redis: {
        version: parsedInfo.redis_version,
        uptime: parsedInfo.uptime_in_seconds,
        connected_clients: parsedInfo.connected_clients,
        used_memory: parsedInfo.used_memory_human,
        used_memory_peak: parsedInfo.used_memory_peak_human,
        total_commands_processed: parsedInfo.total_commands_processed,
        instantaneous_ops_per_sec: parsedInfo.instantaneous_ops_per_sec,
        keyspace_hits: parsedInfo.keyspace_hits,
        keyspace_misses: parsedInfo.keyspace_misses,
        hit_rate: this.calculateHitRate(parsedInfo)
      },
      client: {
        commands: Object.fromEntries(this.metrics.commands),
        errors: Object.fromEntries(this.metrics.errors),
        avgLatency: this.calculateAverageLatency(),
        p95Latency: this.calculatePercentileLatency(95),
        p99Latency: this.calculatePercentileLatency(99)
      }
    };
  }
  
  calculateHitRate(info) {
    const hits = parseInt(info.keyspace_hits || 0);
    const misses = parseInt(info.keyspace_misses || 0);
    const total = hits + misses;
    
    return total > 0 ? ((hits / total) * 100).toFixed(2) + '%' : '0%';
  }
  
  calculateAverageLatency() {
    if (this.metrics.latency.length === 0) return 0;
    
    const total = this.metrics.latency.reduce((sum, metric) => sum + metric.latency, 0);
    return (total / this.metrics.latency.length).toFixed(2);
  }
  
  calculatePercentileLatency(percentile) {
    if (this.metrics.latency.length === 0) return 0;
    
    const sorted = this.metrics.latency
      .map(m => m.latency)
      .sort((a, b) => a - b);
    
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }
  
  parseRedisInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};
    
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          info[key] = value;
        }
      }
    });
    
    return info;
  }
  
  // 启动监控
  startMonitoring() {
    // 包装常用命令
    const commandsToWrap = ['get', 'set', 'hget', 'hset', 'lpush', 'rpop', 'zadd', 'zrange'];
    commandsToWrap.forEach(cmd => this.wrapCommand(cmd));
    
    // 定期输出指标
    setInterval(async () => {
      const metrics = await this.getPerformanceMetrics();
      console.log('Redis Metrics:', JSON.stringify(metrics, null, 2));
    }, 60000); // 每分钟输出一次
  }
}
```

## 最佳实践

### 1. 键命名规范

```javascript
// 键命名最佳实践
class RedisKeyNaming {
  static getKeyNamingConventions() {
    return {
      // 使用冒号分隔层级
      good: [
        'user:1001:profile',
        'article:123:stats',
        'cache:user:1001:posts',
        'session:abc123def456',
        'rate_limit:api:user:1001'
      ],
      
      // 避免的命名方式
      bad: [
        'user1001profile',
        'user-1001-profile',
        'getUserProfile1001',
        'USERPROFILE1001'
      ],
      
      // 键命名模式
      patterns: {
        user: 'user:{id}:{field}',
        session: 'session:{token}',
        cache: 'cache:{type}:{id}',
        lock: 'lock:{resource}:{id}',
        queue: 'queue:{name}',
        counter: 'counter:{type}:{period}',
        rate_limit: 'rate_limit:{service}:{user_id}'
      }
    };
  }
  
  // 键生成器
  static generateKey(type, ...parts) {
    return [type, ...parts].join(':');
  }
  
  // 键验证
  static validateKey(key) {
    const rules = {
      maxLength: 512,
      allowedChars: /^[a-zA-Z0-9:_-]+$/,
      noSpaces: !/\s/,
      noSpecialChars: !/[!@#$%^&*()+=\[\]{}|;'"<>?,.\/]/
    };
    
    return {
      valid: key.length <= rules.maxLength &&
             rules.allowedChars.test(key) &&
             rules.noSpaces.test(key) &&
             rules.noSpecialChars.test(key),
      errors: [
        key.length > rules.maxLength ? 'Key too long' : null,
        !rules.allowedChars.test(key) ? 'Invalid characters' : null,
        !rules.noSpaces.test(key) ? 'Contains spaces' : null,
        !rules.noSpecialChars.test(key) ? 'Contains special characters' : null
      ].filter(Boolean)
    };
  }
}
```

### 2. 内存优化

```javascript
// 内存优化策略
class RedisMemoryOptimization {
  constructor(redis) {
    this.redis = redis;
  }
  
  // 数据压缩
  async compressData(key, data, ttl = 3600) {
    const zlib = require('zlib');
    
    try {
      // 压缩数据
      const compressed = zlib.gzipSync(JSON.stringify(data));
      
      // 存储压缩数据
      await this.redis.setex(`compressed:${key}`, ttl, compressed);
      
      return {
        originalSize: JSON.stringify(data).length,
        compressedSize: compressed.length,
        compressionRatio: (compressed.length / JSON.stringify(data).length * 100).toFixed(2) + '%'
      };
    } catch (error) {
      console.error('Compression failed:', error);
      throw error;
    }
  }
  
  // 数据解压
  async decompressData(key) {
    const zlib = require('zlib');
    
    try {
      const compressed = await this.redis.getBuffer(`compressed:${key}`);
      
      if (!compressed) {
        return null;
      }
      
      // 解压数据
      const decompressed = zlib.gunzipSync(compressed);
      return JSON.parse(decompressed.toString());
    } catch (error) {
      console.error('Decompression failed:', error);
      throw error;
    }
  }
  
  // 内存使用分析
  async analyzeMemoryUsage() {
    const info = await this.redis.info('memory');
    const keyspace = await this.redis.info('keyspace');
    
    const memoryInfo = this.parseRedisInfo(info);
    const keyspaceInfo = this.parseRedisInfo(keyspace);
    
    // 获取大键信息
    const bigKeys = await this.findBigKeys();
    
    return {
      memory: {
        used: memoryInfo.used_memory_human,
        peak: memoryInfo.used_memory_peak_human,
        rss: memoryInfo.used_memory_rss_human,
        overhead: memoryInfo.used_memory_overhead,
        dataset: memoryInfo.used_memory_dataset,
        fragmentation_ratio: memoryInfo.mem_fragmentation_ratio
      },
      keyspace: keyspaceInfo,
      bigKeys,
      recommendations: this.getMemoryRecommendations(memoryInfo, bigKeys)
    };
  }
  
  // 查找大键
  async findBigKeys(threshold = 1024 * 1024) { // 1MB
    const bigKeys = [];
    const cursor = '0';
    
    try {
      // 使用SCAN遍历所有键
      const keys = await this.scanAllKeys();
      
      for (const key of keys.slice(0, 100)) { // 限制检查数量
        try {
          const type = await this.redis.type(key);
          let size = 0;
          
          switch (type) {
            case 'string':
              size = await this.redis.strlen(key);
              break;
            case 'list':
              size = await this.redis.llen(key);
              break;
            case 'set':
              size = await this.redis.scard(key);
              break;
            case 'zset':
              size = await this.redis.zcard(key);
              break;
            case 'hash':
              size = await this.redis.hlen(key);
              break;
          }
          
          if (size > threshold) {
            bigKeys.push({ key, type, size });
          }
        } catch (error) {
          console.error(`Error checking key ${key}:`, error);
        }
      }
    } catch (error) {
      console.error('Error finding big keys:', error);
    }
    
    return bigKeys.sort((a, b) => b.size - a.size);
  }
  
  // 扫描所有键
  async scanAllKeys() {
    const keys = [];
    let cursor = '0';
    
    do {
      const result = await this.redis.scan(cursor, 'COUNT', 100);
      cursor = result[0];
      keys.push(...result[1]);
    } while (cursor !== '0' && keys.length < 1000); // 限制总数
    
    return keys;
  }
  
  // 内存优化建议
  getMemoryRecommendations(memoryInfo, bigKeys) {
    const recommendations = [];
    
    // 碎片率检查
    const fragRatio = parseFloat(memoryInfo.mem_fragmentation_ratio);
    if (fragRatio > 1.5) {
      recommendations.push({
        type: 'fragmentation',
        message: `Memory fragmentation ratio is ${fragRatio}. Consider running MEMORY PURGE.`,
        action: 'memory_purge'
      });
    }
    
    // 大键检查
    if (bigKeys.length > 0) {
      recommendations.push({
        type: 'big_keys',
        message: `Found ${bigKeys.length} large keys. Consider splitting or compressing them.`,
        keys: bigKeys.slice(0, 5),
        action: 'optimize_keys'
      });
    }
    
    // 过期键检查
    recommendations.push({
      type: 'expiration',
      message: 'Ensure all cache keys have appropriate TTL values.',
      action: 'set_ttl'
    });
    
    return recommendations;
  }
  
  parseRedisInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};
    
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          info[key] = value;
        }
      }
    });
    
    return info;
  }
}
```

### 3. 安全配置

```javascript
// Redis安全配置
class RedisSecurity {
  static getSecurityBestPractices() {
    return {
      // 连接安全
      connection: {
        // 使用密码认证
        requirepass: 'your-strong-password',
        
        // 绑定到特定IP
        bind: '127.0.0.1',
        
        // 禁用危险命令
        'rename-command': {
          'FLUSHDB': '',
          'FLUSHALL': '',
          'KEYS': '',
          'CONFIG': 'CONFIG_9a90f2b2946b9b5423a9c7c5b74d6da6',
          'DEBUG': '',
          'EVAL': '',
          'SHUTDOWN': ''
        },
        
        // 设置超时
        timeout: 300,
        
        // 限制客户端连接数
        maxclients: 10000
      },
      
      // 网络安全
      network: {
        // 使用TLS/SSL
        tls: {
          enabled: true,
          cert: '/path/to/cert.pem',
          key: '/path/to/key.pem',
          ca: '/path/to/ca.pem'
        },
        
        // 防火墙规则
        firewall: {
          allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
          deniedIPs: ['0.0.0.0/0']
        }
      },
      
      // 数据安全
      data: {
        // 启用持久化加密
        encryption: true,
        
        // 定期备份
        backup: {
          enabled: true,
          interval: '0 2 * * *', // 每天凌晨2点
          retention: 30 // 保留30天
        }
      }
    };
  }
  
  // 安全审计
  static async securityAudit(redis) {
    const audit = {
      timestamp: new Date().toISOString(),
      checks: []
    };
    
    try {
      // 检查配置
      const config = await redis.config('GET', '*');
      const configMap = this.parseConfigArray(config);
      
      // 检查密码设置
      audit.checks.push({
        name: 'Password Protection',
        status: configMap.requirepass ? 'PASS' : 'FAIL',
        message: configMap.requirepass ? 'Password is set' : 'No password protection'
      });
      
      // 检查绑定地址
      audit.checks.push({
        name: 'Bind Address',
        status: configMap.bind && !configMap.bind.includes('0.0.0.0') ? 'PASS' : 'WARN',
        message: `Bound to: ${configMap.bind || 'all interfaces'}`
      });
      
      // 检查危险命令
      const dangerousCommands = ['FLUSHDB', 'FLUSHALL', 'CONFIG', 'DEBUG', 'EVAL'];
      const renamedCommands = dangerousCommands.filter(cmd => 
        configMap[`rename-command-${cmd.toLowerCase()}`]
      );
      
      audit.checks.push({
        name: 'Dangerous Commands',
        status: renamedCommands.length > 0 ? 'PASS' : 'WARN',
        message: `${renamedCommands.length}/${dangerousCommands.length} dangerous commands renamed`
      });
      
      // 检查客户端连接
      const info = await redis.info('clients');
      const clientInfo = this.parseRedisInfo(info);
      
      audit.checks.push({
        name: 'Client Connections',
        status: parseInt(clientInfo.connected_clients) < 1000 ? 'PASS' : 'WARN',
        message: `${clientInfo.connected_clients} clients connected`
      });
      
    } catch (error) {
      audit.checks.push({
        name: 'Audit Error',
        status: 'ERROR',
        message: error.message
      });
    }
    
    return audit;
  }
  
  static parseConfigArray(configArray) {
    const config = {};
    for (let i = 0; i < configArray.length; i += 2) {
      config[configArray[i]] = configArray[i + 1];
    }
    return config;
  }
  
  static parseRedisInfo(infoString) {
    const lines = infoString.split('\r\n');
    const info = {};
    
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, value] = line.split(':');
        if (key && value !== undefined) {
          info[key] = value;
        }
      }
    });
    
    return info;
  }
}
```

## 部署和运维

### 1. Docker 部署

```dockerfile
# Dockerfile
FROM redis:7-alpine

# 复制配置文件
COPY redis.conf /usr/local/etc/redis/redis.conf

# 创建数据目录
RUN mkdir -p /data

# 设置权限
RUN chown -R redis:redis /data

# 暴露端口
EXPOSE 6379

# 启动命令
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  redis:
    build: .
    container_name: redis-server
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf:ro
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    restart: unless-stopped
    networks:
      - redis-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  redis-sentinel:
    image: redis:7-alpine
    container_name: redis-sentinel
    ports:
      - "26379:26379"
    volumes:
      - ./sentinel.conf:/usr/local/etc/redis/sentinel.conf:ro
    command: redis-sentinel /usr/local/etc/redis/sentinel.conf
    depends_on:
      - redis
    networks:
      - redis-network

volumes:
  redis-data:

networks:
  redis-network:
    driver: bridge
```

### 2. 集群配置

```javascript
// Redis集群配置
class RedisCluster {
  constructor() {
    this.cluster = new Redis.Cluster([
      {
        host: 'redis-node-1',
        port: 7000
      },
      {
        host: 'redis-node-2', 
        port: 7001
      },
      {
        host: 'redis-node-3',
        port: 7002
      }
    ], {
      // 集群配置
      enableOfflineQueue: false,
      redisOptions: {
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 10000,
        commandTimeout: 5000
      },
      
      // 重试配置
      retryDelayOnClusterDown: 300,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      
      // 集群发现
      enableReadyCheck: false,
      redisOptions: {
        lazyConnect: true
      }
    });
    
    this.setupClusterEvents();
  }
  
  setupClusterEvents() {
    this.cluster.on('connect', () => {
      console.log('Redis cluster connected');
    });
    
    this.cluster.on('ready', () => {
      console.log('Redis cluster ready');
    });
    
    this.cluster.on('error', (err) => {
      console.error('Redis cluster error:', err);
    });
    
    this.cluster.on('close', () => {
      console.log('Redis cluster connection closed');
    });
    
    this.cluster.on('reconnecting', () => {
      console.log('Redis cluster reconnecting');
    });
    
    this.cluster.on('node error', (err, node) => {
      console.error(`Redis node ${node.options.host}:${node.options.port} error:`, err);
    });
  }
  
  // 集群健康检查
  async healthCheck() {
    try {
      const nodes = this.cluster.nodes('all');
      const nodeStatus = [];
      
      for (const node of nodes) {
        try {
          const start = Date.now();
          await node.ping();
          const latency = Date.now() - start;
          
          nodeStatus.push({
            host: node.options.host,
            port: node.options.port,
            status: 'healthy',
            latency: `${latency}ms`
          });
        } catch (error) {
          nodeStatus.push({
            host: node.options.host,
            port: node.options.port,
            status: 'unhealthy',
            error: error.message
          });
        }
      }
      
      return {
        cluster: 'healthy',
        totalNodes: nodes.length,
        healthyNodes: nodeStatus.filter(n => n.status === 'healthy').length,
        nodes: nodeStatus
      };
    } catch (error) {
      return {
        cluster: 'unhealthy',
        error: error.message
      };
    }
  }
  
  // 集群信息
  async getClusterInfo() {
    try {
      const info = await this.cluster.cluster('info');
      const nodes = await this.cluster.cluster('nodes');
      
      return {
        info: this.parseClusterInfo(info),
        nodes: this.parseClusterNodes(nodes)
      };
    } catch (error) {
      console.error('Error getting cluster info:', error);
      throw error;
    }
  }
  
  parseClusterInfo(info) {
    const lines = info.split('\r\n');
    const parsed = {};
    
    lines.forEach(line => {
      if (line && line.includes(':')) {
        const [key, value] = line.split(':');
        parsed[key] = value;
      }
    });
    
    return parsed;
  }
  
  parseClusterNodes(nodes) {
    const lines = nodes.split('\n').filter(line => line.trim());
    
    return lines.map(line => {
      const parts = line.split(' ');
      return {
        id: parts[0],
        address: parts[1],
        flags: parts[2],
        master: parts[3],
        ping: parts[4],
        pong: parts[5],
        epoch: parts[6],
        state: parts[7],
        slots: parts.slice(8).join(' ')
      };
    });
  }
}
```

## 参考资源

### 官方文档
- [Redis 官方文档](https://redis.io/documentation)
- [Redis 命令参考](https://redis.io/commands)
- [Redis 配置文档](https://redis.io/topics/config)

### 学习资源
- [Redis 设计与实现](http://redisbook.com/)
- [Redis 实战](https://www.manning.com/books/redis-in-action)
- [Redis 深度历险](https://book.douban.com/subject/30386804/)

### 工具和库
- [ioredis](https://github.com/luin/ioredis) - Node.js Redis 客户端
- [Redis Desktop Manager](https://rdm.dev/) - Redis GUI 工具
- [RedisInsight](https://redislabs.com/redis-enterprise/redis-insight/) - Redis 官方 GUI
- [redis-cli](https://redis.io/topics/rediscli) - Redis 命令行工具

### 监控和运维
- [Redis Sentinel](https://redis.io/topics/sentinel) - 高可用解决方案
- [Redis Cluster](https://redis.io/topics/cluster-tutorial) - 集群解决方案
- [Prometheus Redis Exporter](https://github.com/oliver006/redis_exporter) - 监控指标导出
- [Grafana Redis Dashboard](https://grafana.com/grafana/dashboards/763) - 监控面板