# PostgreSQL 数据库设计与优化

## 简介

PostgreSQL 是一个功能强大的开源对象关系数据库系统，以其可靠性、功能丰富性和性能而闻名。它支持 SQL 标准的大部分功能，并提供了许多现代特性。

### 核心特性

- **ACID 兼容性**：完全支持事务的原子性、一致性、隔离性和持久性
- **多版本并发控制（MVCC）**：高并发性能和数据一致性
- **丰富的数据类型**：支持 JSON、数组、范围类型等
- **扩展性**：支持自定义函数、操作符和数据类型
- **全文搜索**：内置强大的全文搜索功能
- **空间数据支持**：通过 PostGIS 扩展支持地理信息系统

### 适用场景

- 企业级应用系统
- 数据仓库和分析系统
- 地理信息系统（GIS）
- 金融和电商系统
- 内容管理系统
- 实时数据处理

## 数据库设计

### 1. 表结构设计

```sql
-- 用户表设计
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    role user_role DEFAULT 'user',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建枚举类型
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- 文章表设计
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image_url TEXT,
    status article_status DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    reading_time INTEGER, -- 预估阅读时间（分钟）
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 全文搜索向量
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED
);

-- 标签表设计
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- 十六进制颜色代码
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 文章标签关联表
CREATE TABLE article_tags (
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (article_id, tag_id)
);

-- 评论表设计
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户关注关系表
CREATE TABLE user_follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id != following_id)
);
```

### 2. 索引优化策略

```sql
-- 基础索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- 文章相关索引
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_slug ON articles(slug);

-- 复合索引
CREATE INDEX idx_articles_status_published_at ON articles(status, published_at DESC);
CREATE INDEX idx_articles_author_status ON articles(author_id, status);

-- 全文搜索索引
CREATE INDEX idx_articles_search_vector ON articles USING GIN(search_vector);

-- 标签相关索引
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_article_tags_article_id ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON article_tags(tag_id);

-- 评论相关索引
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_approved ON comments(is_approved) WHERE is_approved = true;

-- 关注关系索引
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);

-- 部分索引示例（条件索引）
CREATE INDEX idx_articles_featured ON articles(featured_image_url) 
WHERE featured_image_url IS NOT NULL;

-- 表达式索引
CREATE INDEX idx_users_lower_email ON users(LOWER(email));
CREATE INDEX idx_articles_title_length ON articles(LENGTH(title));
```

### 3. 约束和触发器

```sql
-- 检查约束
ALTER TABLE users ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE articles ADD CONSTRAINT check_reading_time 
CHECK (reading_time > 0 AND reading_time <= 1440); -- 最多24小时

ALTER TABLE comments ADD CONSTRAINT check_content_length 
CHECK (LENGTH(content) >= 1 AND LENGTH(content) <= 10000);

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 统计计数器触发器
CREATE OR REPLACE FUNCTION update_article_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE articles 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.article_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE articles 
        SET comment_count = comment_count - 1 
        WHERE id = OLD.article_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_article_comment_count();

-- 标签使用计数触发器
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags 
        SET usage_count = usage_count - 1 
        WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_tag_usage
    AFTER INSERT OR DELETE ON article_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();
```

## 查询优化

### 1. 高效查询模式

```sql
-- 分页查询优化
-- 使用 OFFSET/LIMIT（适用于小偏移量）
SELECT a.id, a.title, a.excerpt, a.published_at,
       u.username, u.avatar_url
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.status = 'published'
ORDER BY a.published_at DESC
LIMIT 20 OFFSET 0;

-- 游标分页（适用于大偏移量）
SELECT a.id, a.title, a.excerpt, a.published_at,
       u.username, u.avatar_url
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.status = 'published'
  AND a.published_at < '2023-12-01 00:00:00+00'
ORDER BY a.published_at DESC
LIMIT 20;

-- 使用 CTE 进行复杂查询
WITH popular_articles AS (
    SELECT id, title, view_count, like_count,
           (view_count * 0.7 + like_count * 0.3) AS popularity_score
    FROM articles
    WHERE status = 'published'
      AND published_at >= CURRENT_DATE - INTERVAL '30 days'
),
ranked_articles AS (
    SELECT *,
           ROW_NUMBER() OVER (ORDER BY popularity_score DESC) as rank
    FROM popular_articles
)
SELECT a.*, u.username
FROM ranked_articles a
JOIN users u ON a.author_id = u.id
WHERE a.rank <= 10;

-- 窗口函数应用
SELECT 
    a.id,
    a.title,
    a.view_count,
    a.published_at,
    u.username,
    -- 计算排名
    ROW_NUMBER() OVER (ORDER BY a.view_count DESC) as view_rank,
    -- 计算百分位
    PERCENT_RANK() OVER (ORDER BY a.view_count) as view_percentile,
    -- 计算移动平均
    AVG(a.view_count) OVER (
        ORDER BY a.published_at 
        ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING
    ) as moving_avg_views
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.status = 'published'
ORDER BY a.view_count DESC;

-- 全文搜索查询
SELECT 
    a.id,
    a.title,
    a.excerpt,
    ts_rank(a.search_vector, plainto_tsquery('english', $1)) as rank
FROM articles a
WHERE a.search_vector @@ plainto_tsquery('english', $1)
  AND a.status = 'published'
ORDER BY rank DESC, a.published_at DESC
LIMIT 20;

-- 聚合查询优化
SELECT 
    DATE_TRUNC('month', a.published_at) as month,
    COUNT(*) as article_count,
    AVG(a.view_count) as avg_views,
    SUM(a.like_count) as total_likes
FROM articles a
WHERE a.status = 'published'
  AND a.published_at >= CURRENT_DATE - INTERVAL '1 year'
GROUP BY DATE_TRUNC('month', a.published_at)
ORDER BY month DESC;
```

### 2. 查询执行计划分析

```sql
-- 分析查询执行计划
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT a.title, u.username, COUNT(c.id) as comment_count
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN comments c ON a.id = c.article_id AND c.is_approved = true
WHERE a.status = 'published'
  AND a.published_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY a.id, a.title, u.username
HAVING COUNT(c.id) > 5
ORDER BY comment_count DESC;

-- 查看表统计信息
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats
WHERE tablename = 'articles';

-- 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'articles'
ORDER BY idx_scan DESC;

-- 查看慢查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100  -- 平均执行时间超过100ms
ORDER BY mean_time DESC
LIMIT 10;
```

## 性能优化

### 1. 服务器配置优化

```sql
-- postgresql.conf 关键配置

-- 内存配置
shared_buffers = '256MB'          -- 共享缓冲区，通常设为内存的25%
effective_cache_size = '1GB'      -- 操作系统缓存大小估计
work_mem = '4MB'                  -- 排序和哈希操作的内存
maintenance_work_mem = '64MB'     -- 维护操作的内存

-- 检查点配置
checkpoint_completion_target = 0.9
wal_buffers = '16MB'
max_wal_size = '1GB'
min_wal_size = '80MB'

-- 连接配置
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

-- 查询规划器配置
random_page_cost = 1.1           -- SSD 存储建议值
effective_io_concurrency = 200   -- SSD 存储建议值

-- 日志配置
log_min_duration_statement = 1000  -- 记录执行时间超过1秒的查询
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
```

### 2. 连接池配置

```javascript
// Node.js 中使用 pg-pool
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  
  // 连接池配置
  max: 20,                    // 最大连接数
  min: 5,                     // 最小连接数
  idleTimeoutMillis: 30000,   // 空闲连接超时时间
  connectionTimeoutMillis: 2000, // 连接超时时间
  
  // SSL 配置
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  
  // 应用名称（便于监控）
  application_name: 'blog-api'
});

// 连接池事件监听
pool.on('connect', (client) => {
  console.log('New client connected');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// 查询封装
class DatabaseService {
  static async query(text, params) {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error', { text, error: error.message });
      throw error;
    }
  }
  
  static async transaction(callback) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
```

### 3. 缓存策略

```sql
-- 物化视图用于复杂聚合查询
CREATE MATERIALIZED VIEW article_stats AS
SELECT 
    a.id,
    a.title,
    a.view_count,
    a.like_count,
    a.comment_count,
    COUNT(DISTINCT at.tag_id) as tag_count,
    u.username as author_name,
    a.published_at,
    -- 计算热度分数
    (
        a.view_count * 0.4 + 
        a.like_count * 0.3 + 
        a.comment_count * 0.3
    ) * 
    -- 时间衰减因子
    EXP(-EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - a.published_at)) / 86400.0 / 30.0) as hotness_score
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN article_tags at ON a.id = at.article_id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.view_count, a.like_count, a.comment_count, 
         u.username, a.published_at;

-- 创建索引
CREATE INDEX idx_article_stats_hotness ON article_stats(hotness_score DESC);
CREATE INDEX idx_article_stats_published_at ON article_stats(published_at DESC);

-- 定期刷新物化视图
CREATE OR REPLACE FUNCTION refresh_article_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY article_stats;
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（需要 pg_cron 扩展）
SELECT cron.schedule('refresh-article-stats', '*/15 * * * *', 'SELECT refresh_article_stats();');
```

## 事务处理

### 1. 事务隔离级别

```sql
-- 设置事务隔离级别
BEGIN TRANSACTION ISOLATION LEVEL READ COMMITTED;
-- 或
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 或
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- 示例：转账操作
BEGIN;

-- 检查余额
SELECT balance FROM accounts WHERE id = $1 FOR UPDATE;

-- 扣除金额
UPDATE accounts 
SET balance = balance - $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND balance >= $2;

-- 检查更新是否成功
GET DIAGNOSTICS affected_rows = ROW_COUNT;
IF affected_rows = 0 THEN
    ROLLBACK;
    RAISE EXCEPTION 'Insufficient balance';
END IF;

-- 增加金额到目标账户
UPDATE accounts 
SET balance = balance + $2,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $3;

-- 记录交易
INSERT INTO transactions (from_account, to_account, amount, type)
VALUES ($1, $3, $2, 'transfer');

COMMIT;
```

### 2. 死锁预防

```sql
-- 按固定顺序获取锁
CREATE OR REPLACE FUNCTION transfer_funds(
    from_account_id UUID,
    to_account_id UUID,
    amount DECIMAL
) RETURNS void AS $$
DECLARE
    first_id UUID;
    second_id UUID;
BEGIN
    -- 按 ID 排序获取锁，避免死锁
    IF from_account_id < to_account_id THEN
        first_id := from_account_id;
        second_id := to_account_id;
    ELSE
        first_id := to_account_id;
        second_id := from_account_id;
    END IF;
    
    -- 按顺序锁定账户
    PERFORM * FROM accounts WHERE id = first_id FOR UPDATE;
    PERFORM * FROM accounts WHERE id = second_id FOR UPDATE;
    
    -- 执行转账逻辑
    UPDATE accounts SET balance = balance - amount WHERE id = from_account_id;
    UPDATE accounts SET balance = balance + amount WHERE id = to_account_id;
END;
$$ LANGUAGE plpgsql;
```

## 高可用性和扩展性

### 1. 主从复制配置

```sql
-- 主服务器配置 (postgresql.conf)
wal_level = replica
max_wal_senders = 3
max_replication_slots = 3
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'

-- 创建复制用户
CREATE USER replicator REPLICATION LOGIN PASSWORD 'replicator_password';

-- pg_hba.conf 配置
-- host replication replicator 192.168.1.0/24 md5

-- 从服务器配置
-- recovery.conf (PostgreSQL 12 之前) 或 postgresql.conf (PostgreSQL 12+)
standby_mode = 'on'
primary_conninfo = 'host=192.168.1.100 port=5432 user=replicator password=replicator_password'
restore_command = 'cp /var/lib/postgresql/archive/%f %p'
```

### 2. 读写分离实现

```javascript
// Node.js 读写分离实现
class DatabaseCluster {
  constructor() {
    // 主库连接池（写操作）
    this.masterPool = new Pool({
      host: process.env.DB_MASTER_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 10
    });
    
    // 从库连接池（读操作）
    this.slavePool = new Pool({
      host: process.env.DB_SLAVE_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20
    });
  }
  
  async query(text, params, options = {}) {
    const { forcemaster = false } = options;
    
    // 判断是否为写操作
    const isWriteOperation = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i.test(text);
    
    if (isWriteOperation || forcemaster) {
      return this.masterPool.query(text, params);
    } else {
      try {
        return await this.slavePool.query(text, params);
      } catch (error) {
        // 从库失败时回退到主库
        console.warn('Slave query failed, falling back to master:', error.message);
        return this.masterPool.query(text, params);
      }
    }
  }
  
  async transaction(callback) {
    // 事务总是在主库执行
    const client = await this.masterPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// 使用示例
const db = new DatabaseCluster();

// 读操作（自动路由到从库）
const articles = await db.query(
  'SELECT * FROM articles WHERE status = $1 ORDER BY published_at DESC LIMIT 10',
  ['published']
);

// 写操作（自动路由到主库）
const newArticle = await db.query(
  'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING *',
  ['New Article', 'Content...', userId]
);

// 强制使用主库
const freshData = await db.query(
  'SELECT * FROM articles WHERE id = $1',
  [articleId],
  { forcemaster: true }
);
```

### 3. 分区表设计

```sql
-- 按时间分区的文章表
CREATE TABLE articles_partitioned (
    id UUID DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    status article_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
) PARTITION BY RANGE (published_at);

-- 创建分区
CREATE TABLE articles_2023_q1 PARTITION OF articles_partitioned
    FOR VALUES FROM ('2023-01-01') TO ('2023-04-01');

CREATE TABLE articles_2023_q2 PARTITION OF articles_partitioned
    FOR VALUES FROM ('2023-04-01') TO ('2023-07-01');

CREATE TABLE articles_2023_q3 PARTITION OF articles_partitioned
    FOR VALUES FROM ('2023-07-01') TO ('2023-10-01');

CREATE TABLE articles_2023_q4 PARTITION OF articles_partitioned
    FOR VALUES FROM ('2023-10-01') TO ('2024-01-01');

-- 为每个分区创建索引
CREATE INDEX idx_articles_2023_q1_author ON articles_2023_q1(author_id);
CREATE INDEX idx_articles_2023_q2_author ON articles_2023_q2(author_id);
CREATE INDEX idx_articles_2023_q3_author ON articles_2023_q3(author_id);
CREATE INDEX idx_articles_2023_q4_author ON articles_2023_q4(author_id);

-- 自动创建分区的函数
CREATE OR REPLACE FUNCTION create_monthly_partition(
    table_name TEXT,
    start_date DATE
) RETURNS void AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format(
        'CREATE TABLE IF NOT EXISTS %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
        partition_name, table_name, start_date, end_date
    );
    
    -- 创建索引
    EXECUTE format(
        'CREATE INDEX IF NOT EXISTS idx_%s_author ON %I(author_id)',
        partition_name, partition_name
    );
END;
$$ LANGUAGE plpgsql;
```

## 监控和运维

### 1. 性能监控

```sql
-- 启用 pg_stat_statements 扩展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 查看最耗时的查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    stddev_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 查看数据库连接状态
SELECT 
    state,
    COUNT(*) as connection_count,
    MAX(now() - state_change) as max_duration
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY state;

-- 查看表的访问统计
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;

-- 查看索引使用情况
SELECT 
    t.tablename,
    indexname,
    c.reltuples AS num_rows,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::text)) AS table_size,
    pg_size_pretty(pg_relation_size(quote_ident(indexrelname)::text)) AS index_size,
    CASE WHEN indisunique THEN 'Y' ELSE 'N' END AS unique,
    idx_scan AS number_of_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_tables t
LEFT OUTER JOIN pg_class c ON c.relname = t.tablename
LEFT OUTER JOIN (
    SELECT 
        c.relname AS ctablename,
        ipg.relname AS indexname,
        x.indnatts AS number_of_columns,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch,
        indexrelname,
        indisunique
    FROM pg_index x
    JOIN pg_class c ON c.oid = x.indrelid
    JOIN pg_class ipg ON ipg.oid = x.indexrelid
    JOIN pg_stat_all_indexes psai ON x.indexrelid = psai.indexrelid
) AS foo ON t.tablename = foo.ctablename
WHERE t.schemaname = 'public'
ORDER BY 1, 2;
```

### 2. 备份和恢复策略

```bash
#!/bin/bash
# 数据库备份脚本

# 配置变量
DB_NAME="blog_db"
DB_USER="postgres"
BACKUP_DIR="/var/backups/postgresql"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql"
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
echo "Starting backup of database $DB_NAME..."
pg_dump -U $DB_USER -h localhost -d $DB_NAME -f $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_FILE"
    
    # 压缩备份文件
    gzip $BACKUP_FILE
    echo "Backup compressed: ${BACKUP_FILE}.gz"
    
    # 删除旧备份
    find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo "Old backups cleaned up"
else
    echo "Backup failed!"
    exit 1
fi

# 备份 WAL 文件（用于时间点恢复）
echo "Backing up WAL files..."
rsync -av /var/lib/postgresql/12/main/pg_wal/ ${BACKUP_DIR}/wal/

echo "Backup process completed"
```

```sql
-- 时间点恢复示例
-- 1. 停止 PostgreSQL 服务
-- 2. 恢复基础备份
-- 3. 创建 recovery.conf 文件

-- recovery.conf 内容
restore_command = 'cp /var/backups/postgresql/wal/%f %p'
recovery_target_time = '2023-12-01 14:30:00'
recovery_target_action = 'promote'

-- 4. 启动 PostgreSQL 服务
```

### 3. 安全配置

```sql
-- 创建只读用户
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE blog_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- 创建应用用户
CREATE USER app_user WITH PASSWORD 'app_secure_password';
GRANT CONNECT ON DATABASE blog_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 行级安全策略
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的文章
CREATE POLICY user_articles_policy ON articles
    FOR ALL TO app_user
    USING (author_id = current_setting('app.current_user_id')::UUID);

-- 管理员可以访问所有文章
CREATE POLICY admin_articles_policy ON articles
    FOR ALL TO app_user
    USING (current_setting('app.user_role') = 'admin');

-- 审计日志表
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 审计触发器函数
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), 
                current_setting('app.current_user_id', true)::UUID);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW),
                current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_values, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW),
                current_setting('app.current_user_id', true)::UUID);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 应用审计触发器
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_articles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON articles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 故障排除

### 1. 常见问题诊断

```sql
-- 查看当前锁等待
SELECT 
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks 
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;

-- 查看长时间运行的查询
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  AND state = 'active'
ORDER BY duration DESC;

-- 查看数据库大小
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- 查看表大小
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 查看未使用的索引
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 2. 性能问题排查

```sql
-- 查看缓存命中率
SELECT 
    'index hit rate' AS name,
    (sum(idx_blks_hit)) / nullif(sum(idx_blks_hit + idx_blks_read),0) AS ratio
FROM pg_statio_user_indexes
UNION ALL
SELECT 
    'table hit rate' AS name,
    sum(heap_blks_hit) / nullif(sum(heap_blks_hit) + sum(heap_blks_read),0) AS ratio
FROM pg_statio_user_tables;

-- 查看表的膨胀情况
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY dead_tuple_percent DESC;

-- 查看需要 VACUUM 的表
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count
FROM pg_stat_user_tables
WHERE last_autovacuum < now() - interval '1 day'
   OR last_autovacuum IS NULL
ORDER BY last_autovacuum NULLS FIRST;
```

## 最佳实践

### 1. 数据库设计原则

- **规范化设计**：遵循第三范式，避免数据冗余
- **合理使用约束**：利用外键、检查约束保证数据完整性
- **选择合适的数据类型**：使用最小满足需求的数据类型
- **索引策略**：为查询频繁的列创建索引，避免过度索引
- **分区策略**：对大表进行合理分区

### 2. 查询优化技巧

- **避免 SELECT ***：只查询需要的列
- **使用 LIMIT**：限制返回结果集大小
- **合理使用 JOIN**：选择合适的连接类型
- **利用索引**：确保 WHERE 条件能够使用索引
- **批量操作**：使用批量插入/更新减少网络开销

### 3. 运维最佳实践

- **定期备份**：实施完整备份和增量备份策略
- **监控性能**：持续监控数据库性能指标
- **定期维护**：执行 VACUUM、ANALYZE 等维护操作
- **安全配置**：实施最小权限原则，启用审计日志
- **容量规划**：提前规划存储和性能需求

## 参考资源

### 官方文档
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)
- [PostgreSQL Wiki](https://wiki.postgresql.org/)
- [PostgreSQL 性能调优](https://wiki.postgresql.org/wiki/Performance_Optimization)

### 工具和扩展
- [pgAdmin](https://www.pgadmin.org/) - PostgreSQL 管理工具
- [PostGIS](https://postgis.net/) - 地理信息系统扩展
- [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html) - 查询统计扩展
- [pgBouncer](https://www.pgbouncer.org/) - 连接池工具

### 最佳实践文章
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PostgreSQL Security Best Practices](https://www.postgresql.org/docs/current/security.html)
- [PostgreSQL High Availability](https://www.postgresql.org/docs/current/high-availability.html)

### 社区资源
- [PostgreSQL 邮件列表](https://www.postgresql.org/list/)
- [Stack Overflow PostgreSQL](https://stackoverflow.com/questions/tagged/postgresql)
- [Reddit PostgreSQL](https://www.reddit.com/r/PostgreSQL/)
- [PostgreSQL 中文社区](http://www.postgres.cn/)

---

本指南涵盖了 PostgreSQL 数据库设计、查询优化、性能调优、高可用配置和运维监控等各个方面。通过遵循这些最佳实践，你可以构建出高性能、高可用、安全可靠的 PostgreSQL 数据库系统。