# MySQL 数据库设计与优化

## 简介

MySQL 是世界上最流行的开源关系型数据库管理系统之一。它以其高性能、可靠性和易用性而闻名，广泛应用于 Web 应用程序、企业级系统和云服务中。

### 核心特性

- **ACID 事务支持**：保证数据的一致性和完整性
- **多存储引擎**：InnoDB、MyISAM、Memory 等
- **高性能**：优化的查询执行器和索引机制
- **可扩展性**：支持主从复制、分片和集群
- **跨平台**：支持多种操作系统
- **丰富的数据类型**：支持 JSON、地理空间数据等

### 适用场景

- Web 应用程序后端
- 电商平台
- 内容管理系统
- 数据仓库和分析
- 企业级应用
- 微服务架构

## 数据库设计

### 1. 表结构设计

```sql
-- 用户表设计示例
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    birth_date DATE,
    gender ENUM('male', 'female', 'other'),
    status ENUM('active', 'inactive', 'suspended', 'deleted') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 索引设计
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_last_login (last_login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 用户角色表
CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by BIGINT UNSIGNED,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_role (user_id, role_name),
    INDEX idx_role_name (role_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表
CREATE TABLE articles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    author_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    view_count BIGINT UNSIGNED DEFAULT 0,
    like_count BIGINT UNSIGNED DEFAULT 0,
    comment_count BIGINT UNSIGNED DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    INDEX idx_slug (slug),
    INDEX idx_author (author_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_published_at (published_at),
    INDEX idx_view_count (view_count),
    FULLTEXT idx_content (title, content, excerpt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT UNSIGNED NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- 十六进制颜色值
    usage_count BIGINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_usage_count (usage_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章标签关联表
CREATE TABLE article_tags (
    article_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_tag (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    article_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED,
    parent_id BIGINT UNSIGNED NULL,
    content TEXT NOT NULL,
    author_name VARCHAR(100), -- 匿名评论者姓名
    author_email VARCHAR(100), -- 匿名评论者邮箱
    author_ip VARCHAR(45), -- IPv4/IPv6 地址
    status ENUM('pending', 'approved', 'rejected', 'spam') DEFAULT 'pending',
    like_count BIGINT UNSIGNED DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    
    INDEX idx_article (article_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. 索引优化策略

```sql
-- 复合索引设计
-- 查询活跃用户的最新文章
ALTER TABLE articles ADD INDEX idx_author_status_published (
    author_id, status, published_at DESC
);

-- 分页查询优化
ALTER TABLE articles ADD INDEX idx_status_published_id (
    status, published_at DESC, id DESC
);

-- 覆盖索引设计（避免回表查询）
ALTER TABLE articles ADD INDEX idx_list_cover (
    status, published_at DESC, id, title, excerpt, author_id, view_count
);

-- 前缀索引（节省空间）
ALTER TABLE articles ADD INDEX idx_title_prefix (title(50));

-- 函数索引（MySQL 8.0+）
ALTER TABLE users ADD INDEX idx_email_domain ((SUBSTRING_INDEX(email, '@', -1)));

-- 查看索引使用情况
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY,
    INDEX_TYPE
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'your_database_name'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- 查找未使用的索引
SELECT 
    s.TABLE_SCHEMA,
    s.TABLE_NAME,
    s.INDEX_NAME,
    s.COLUMN_NAME
FROM INFORMATION_SCHEMA.STATISTICS s
LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage i
    ON s.TABLE_SCHEMA = i.OBJECT_SCHEMA
    AND s.TABLE_NAME = i.OBJECT_NAME
    AND s.INDEX_NAME = i.INDEX_NAME
WHERE s.TABLE_SCHEMA = 'your_database_name'
    AND i.INDEX_NAME IS NULL
    AND s.INDEX_NAME != 'PRIMARY'
ORDER BY s.TABLE_NAME, s.INDEX_NAME;
```

### 3. 分区表设计

```sql
-- 按时间分区的日志表
CREATE TABLE access_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_url VARCHAR(1000),
    request_method VARCHAR(10),
    response_status INT,
    response_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id, created_at),
    INDEX idx_user_id (user_id),
    INDEX idx_ip_address (ip_address),
    INDEX idx_status (response_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (UNIX_TIMESTAMP(created_at)) (
    PARTITION p202401 VALUES LESS THAN (UNIX_TIMESTAMP('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (UNIX_TIMESTAMP('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (UNIX_TIMESTAMP('2024-04-01')),
    PARTITION p202404 VALUES LESS THAN (UNIX_TIMESTAMP('2024-05-01')),
    PARTITION p202405 VALUES LESS THAN (UNIX_TIMESTAMP('2024-06-01')),
    PARTITION p202406 VALUES LESS THAN (UNIX_TIMESTAMP('2024-07-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 自动分区管理存储过程
DELIMITER //
CREATE PROCEDURE ManagePartitions()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE partition_name VARCHAR(64);
    DECLARE partition_date DATE;
    DECLARE next_month_date DATE;
    DECLARE sql_stmt TEXT;
    
    -- 获取下个月的日期
    SET next_month_date = DATE_ADD(CURDATE(), INTERVAL 1 MONTH);
    SET partition_name = CONCAT('p', DATE_FORMAT(next_month_date, '%Y%m'));
    
    -- 检查分区是否已存在
    SELECT COUNT(*) INTO @partition_exists
    FROM INFORMATION_SCHEMA.PARTITIONS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'access_logs'
        AND PARTITION_NAME = partition_name;
    
    -- 如果分区不存在，则创建
    IF @partition_exists = 0 THEN
        SET sql_stmt = CONCAT(
            'ALTER TABLE access_logs ADD PARTITION (',
            'PARTITION ', partition_name,
            ' VALUES LESS THAN (UNIX_TIMESTAMP("',
            DATE_FORMAT(DATE_ADD(next_month_date, INTERVAL 1 MONTH), '%Y-%m-01'),
            '"))'
        );
        
        SET @sql = sql_stmt;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- 删除超过6个月的旧分区
    SELECT PARTITION_NAME INTO @old_partition
    FROM INFORMATION_SCHEMA.PARTITIONS
    WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'access_logs'
        AND PARTITION_NAME LIKE 'p%'
        AND PARTITION_NAME < CONCAT('p', DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 6 MONTH), '%Y%m'))
    LIMIT 1;
    
    IF @old_partition IS NOT NULL THEN
        SET sql_stmt = CONCAT('ALTER TABLE access_logs DROP PARTITION ', @old_partition);
        SET @sql = sql_stmt;
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END//
DELIMITER ;

-- 创建定时任务（需要开启事件调度器）
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS partition_maintenance
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    CALL ManagePartitions();
```

## 查询优化

### 1. SQL 查询优化

```sql
-- 优化前：低效的查询
SELECT a.*, u.username, u.avatar_url, c.name as category_name
FROM articles a
JOIN users u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.published_at DESC
LIMIT 10 OFFSET 100;

-- 优化后：使用覆盖索引和延迟关联
SELECT a.id, a.title, a.excerpt, a.published_at, a.view_count,
       u.username, u.avatar_url, c.name as category_name
FROM (
    SELECT id, title, excerpt, published_at, view_count, author_id, category_id
    FROM articles
    WHERE status = 'published'
    ORDER BY published_at DESC
    LIMIT 10 OFFSET 100
) a
JOIN users u ON a.author_id = u.id
LEFT JOIN categories c ON a.category_id = c.id;

-- 复杂查询优化：统计每个分类下的文章数量
-- 优化前
SELECT c.name, COUNT(a.id) as article_count
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
GROUP BY c.id, c.name
ORDER BY article_count DESC;

-- 优化后：使用子查询避免大表关联
SELECT c.name, COALESCE(ac.article_count, 0) as article_count
FROM categories c
LEFT JOIN (
    SELECT category_id, COUNT(*) as article_count
    FROM articles
    WHERE status = 'published'
    GROUP BY category_id
) ac ON c.id = ac.category_id
ORDER BY article_count DESC;

-- 全文搜索优化
-- 创建全文索引
ALTER TABLE articles ADD FULLTEXT(title, content);

-- 使用全文搜索
SELECT id, title, excerpt,
       MATCH(title, content) AGAINST('关键词' IN NATURAL LANGUAGE MODE) as relevance
FROM articles
WHERE MATCH(title, content) AGAINST('关键词' IN NATURAL LANGUAGE MODE)
    AND status = 'published'
ORDER BY relevance DESC, published_at DESC
LIMIT 20;

-- 布尔模式全文搜索
SELECT id, title, excerpt
FROM articles
WHERE MATCH(title, content) AGAINST('+MySQL -NoSQL' IN BOOLEAN MODE)
    AND status = 'published'
ORDER BY published_at DESC;
```

### 2. 查询执行计划分析

```sql
-- 使用 EXPLAIN 分析查询
EXPLAIN FORMAT=JSON
SELECT a.title, u.username
FROM articles a
JOIN users u ON a.author_id = u.id
WHERE a.status = 'published'
    AND a.published_at >= '2024-01-01'
ORDER BY a.published_at DESC
LIMIT 10;

-- 分析慢查询
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1; -- 记录执行时间超过1秒的查询
SET GLOBAL log_queries_not_using_indexes = 'ON';

-- 查看慢查询统计
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY query_time DESC
LIMIT 10;

-- 使用 Performance Schema 分析
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_sec,
    MAX_TIMER_WAIT/1000000000 as max_time_sec,
    SUM_ROWS_EXAMINED,
    SUM_ROWS_SENT
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;
```

### 3. 缓存策略

```sql
-- 查询缓存配置（MySQL 5.7 及以下）
SET GLOBAL query_cache_type = ON;
SET GLOBAL query_cache_size = 268435456; -- 256MB

-- 查看查询缓存状态
SHOW STATUS LIKE 'Qcache%';

-- 应用层缓存示例（使用 Redis）
-- 在应用代码中实现缓存逻辑
```

## 性能优化

### 1. 服务器配置优化

```ini
# my.cnf 配置文件优化
[mysqld]
# 基础配置
port = 3306
socket = /var/lib/mysql/mysql.sock
basedir = /usr
datadir = /var/lib/mysql
tmpdir = /tmp

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect = 'SET NAMES utf8mb4'

# 内存配置
innodb_buffer_pool_size = 2G  # 设置为可用内存的70-80%
innodb_buffer_pool_instances = 8
innodb_log_buffer_size = 64M
key_buffer_size = 256M
tmp_table_size = 256M
max_heap_table_size = 256M
read_buffer_size = 2M
read_rnd_buffer_size = 4M
sort_buffer_size = 4M
join_buffer_size = 4M

# 连接配置
max_connections = 500
max_connect_errors = 1000
connect_timeout = 60
wait_timeout = 28800
interactive_timeout = 28800

# InnoDB 配置
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_log_file_size = 512M
innodb_log_files_in_group = 2
innodb_flush_method = O_DIRECT
innodb_io_capacity = 2000
innodb_io_capacity_max = 4000
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_thread_concurrency = 0
innodb_lock_wait_timeout = 50

# 查询缓存（MySQL 5.7 及以下）
query_cache_type = 1
query_cache_size = 256M
query_cache_limit = 2M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1

# 二进制日志
log_bin = /var/log/mysql/mysql-bin.log
binlog_format = ROW
expire_logs_days = 7
max_binlog_size = 100M

# 其他优化
skip_name_resolve = 1
lower_case_table_names = 1
max_allowed_packet = 64M
thread_cache_size = 50
table_open_cache = 4096
open_files_limit = 65535
```

### 2. 监控和诊断

```sql
-- 性能监控查询
-- 查看当前连接状态
SHOW PROCESSLIST;

-- 查看系统状态
SHOW STATUS LIKE '%connection%';
SHOW STATUS LIKE '%thread%';
SHOW STATUS LIKE '%query%';
SHOW STATUS LIKE '%innodb%';

-- 查看表状态
SHOW TABLE STATUS LIKE 'articles';

-- 查看索引使用情况
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    INDEX_NAME,
    STAT_NAME,
    STAT_VALUE
FROM mysql.innodb_index_stats
WHERE TABLE_SCHEMA = 'your_database'
ORDER BY TABLE_NAME, INDEX_NAME;

-- 查看锁等待情况
SELECT 
    r.trx_id waiting_trx_id,
    r.trx_mysql_thread_id waiting_thread,
    r.trx_query waiting_query,
    b.trx_id blocking_trx_id,
    b.trx_mysql_thread_id blocking_thread,
    b.trx_query blocking_query
FROM information_schema.innodb_lock_waits w
INNER JOIN information_schema.innodb_trx b ON b.trx_id = w.blocking_trx_id
INNER JOIN information_schema.innodb_trx r ON r.trx_id = w.requesting_trx_id;

-- 查看表空间使用情况
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Size (MB)',
    ROUND((DATA_FREE / 1024 / 1024), 2) AS 'Free (MB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database'
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

### 3. 备份和恢复策略

```bash
#!/bin/bash
# MySQL 备份脚本

# 配置变量
DB_HOST="localhost"
DB_USER="backup_user"
DB_PASS="backup_password"
DB_NAME="your_database"
BACKUP_DIR="/backup/mysql"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 记录开始时间
echo "[$(date)] Starting backup of database: $DB_NAME" >> $LOG_FILE

# 执行备份
mysqldump \
    --host=$DB_HOST \
    --user=$DB_USER \
    --password=$DB_PASS \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --hex-blob \
    --opt \
    --compress \
    $DB_NAME > $BACKUP_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: $BACKUP_FILE" >> $LOG_FILE
    
    # 压缩备份文件
    gzip $BACKUP_FILE
    echo "[$(date)] Backup compressed: ${BACKUP_FILE}.gz" >> $LOG_FILE
    
    # 删除7天前的备份
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "[$(date)] Old backups cleaned up" >> $LOG_FILE
else
    echo "[$(date)] Backup failed!" >> $LOG_FILE
    exit 1
fi

# 增量备份（基于二进制日志）
#!/bin/bash
# 增量备份脚本

BINLOG_DIR="/var/log/mysql"
INCREMENTAL_BACKUP_DIR="/backup/mysql/incremental"
DATE=$(date +"%Y%m%d_%H%M%S")

# 创建增量备份目录
mkdir -p $INCREMENTAL_BACKUP_DIR

# 刷新二进制日志
mysql -u$DB_USER -p$DB_PASS -e "FLUSH LOGS;"

# 复制二进制日志文件
cp $BINLOG_DIR/mysql-bin.* $INCREMENTAL_BACKUP_DIR/

echo "[$(date)] Incremental backup completed" >> $LOG_FILE
```

```sql
-- 恢复数据库
-- 1. 从完整备份恢复
mysql -u root -p your_database < /backup/mysql/your_database_20240101_120000.sql

-- 2. 应用增量备份（二进制日志）
mysqlbinlog /backup/mysql/incremental/mysql-bin.000001 | mysql -u root -p your_database

-- 3. 点对点恢复（恢复到特定时间点）
mysqlbinlog --start-datetime="2024-01-01 12:00:00" \
            --stop-datetime="2024-01-01 13:00:00" \
            /var/log/mysql/mysql-bin.000001 | mysql -u root -p your_database

-- 4. 基于位置的恢复
mysqlbinlog --start-position=123456 \
            --stop-position=789012 \
            /var/log/mysql/mysql-bin.000001 | mysql -u root -p your_database
```

## 高可用性和扩展性

### 1. 主从复制配置

```sql
-- 主服务器配置
-- 在 my.cnf 中添加
[mysqld]
server-id = 1
log-bin = mysql-bin
binlog-format = ROW
binlog-do-db = your_database

-- 创建复制用户
CREATE USER 'replication'@'%' IDENTIFIED BY 'strong_password';
GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';
FLUSH PRIVILEGES;

-- 获取主服务器状态
SHOW MASTER STATUS;

-- 从服务器配置
-- 在 my.cnf 中添加
[mysqld]
server-id = 2
relay-log = mysql-relay-bin
read-only = 1

-- 配置从服务器
CHANGE MASTER TO
    MASTER_HOST='master_ip',
    MASTER_USER='replication',
    MASTER_PASSWORD='strong_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;

-- 启动从服务器
START SLAVE;

-- 检查从服务器状态
SHOW SLAVE STATUS\G

-- 监控复制延迟
SELECT 
    CHANNEL_NAME,
    SERVICE_STATE,
    LAST_ERROR_MESSAGE,
    LAST_ERROR_TIMESTAMP
FROM performance_schema.replication_connection_status;

SELECT 
    CHANNEL_NAME,
    SERVICE_STATE,
    COUNT_TRANSACTIONS_IN_QUEUE,
    LAST_APPLIED_TRANSACTION_RETRIES_COUNT
FROM performance_schema.replication_applier_status;
```

### 2. 读写分离实现

```javascript
// Node.js 读写分离示例
const mysql = require('mysql2/promise')

class DatabaseManager {
  constructor() {
    // 主数据库连接池（写操作）
    this.masterPool = mysql.createPool({
      host: 'master-db-host',
      user: 'db_user',
      password: 'db_password',
      database: 'your_database',
      connectionLimit: 20,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    })
    
    // 从数据库连接池（读操作）
    this.slavePools = [
      mysql.createPool({
        host: 'slave1-db-host',
        user: 'db_user',
        password: 'db_password',
        database: 'your_database',
        connectionLimit: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      }),
      mysql.createPool({
        host: 'slave2-db-host',
        user: 'db_user',
        password: 'db_password',
        database: 'your_database',
        connectionLimit: 20,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      })
    ]
    
    this.currentSlaveIndex = 0
  }
  
  // 获取写连接
  getMasterConnection() {
    return this.masterPool
  }
  
  // 获取读连接（负载均衡）
  getSlaveConnection() {
    const pool = this.slavePools[this.currentSlaveIndex]
    this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slavePools.length
    return pool
  }
  
  // 执行写操作
  async executeWrite(sql, params = []) {
    const connection = this.getMasterConnection()
    try {
      const [results] = await connection.execute(sql, params)
      return results
    } catch (error) {
      console.error('Write operation failed:', error)
      throw error
    }
  }
  
  // 执行读操作
  async executeRead(sql, params = []) {
    const connection = this.getSlaveConnection()
    try {
      const [results] = await connection.execute(sql, params)
      return results
    } catch (error) {
      console.error('Read operation failed, falling back to master:', error)
      // 从库失败时回退到主库
      return this.executeWrite(sql, params)
    }
  }
  
  // 事务操作（必须使用主库）
  async executeTransaction(operations) {
    const connection = await this.masterPool.getConnection()
    try {
      await connection.beginTransaction()
      
      const results = []
      for (const operation of operations) {
        const [result] = await connection.execute(operation.sql, operation.params)
        results.push(result)
      }
      
      await connection.commit()
      return results
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
  
  // 健康检查
  async healthCheck() {
    const checks = {
      master: false,
      slaves: []
    }
    
    try {
      await this.masterPool.execute('SELECT 1')
      checks.master = true
    } catch (error) {
      console.error('Master health check failed:', error)
    }
    
    for (let i = 0; i < this.slavePools.length; i++) {
      try {
        await this.slavePools[i].execute('SELECT 1')
        checks.slaves[i] = true
      } catch (error) {
        console.error(`Slave ${i} health check failed:`, error)
        checks.slaves[i] = false
      }
    }
    
    return checks
  }
}

// 使用示例
const db = new DatabaseManager()

// 读操作
const users = await db.executeRead(
  'SELECT id, username, email FROM users WHERE status = ?',
  ['active']
)

// 写操作
const result = await db.executeWrite(
  'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
  ['john_doe', 'john@example.com', 'hashed_password']
)

// 事务操作
const transactionResult = await db.executeTransaction([
  {
    sql: 'INSERT INTO users (username, email) VALUES (?, ?)',
    params: ['jane_doe', 'jane@example.com']
  },
  {
    sql: 'INSERT INTO user_roles (user_id, role_name) VALUES (LAST_INSERT_ID(), ?)',
    params: ['user']
  }
])
```

### 3. 分库分表策略

```sql
-- 水平分表示例：按用户ID分表
-- 创建分表
CREATE TABLE user_messages_0 LIKE user_messages;
CREATE TABLE user_messages_1 LIKE user_messages;
CREATE TABLE user_messages_2 LIKE user_messages;
CREATE TABLE user_messages_3 LIKE user_messages;

-- 分表路由函数
DELIMITER //
CREATE FUNCTION GetMessageTableName(user_id BIGINT)
RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE table_suffix INT;
    SET table_suffix = user_id % 4;
    RETURN CONCAT('user_messages_', table_suffix);
END//
DELIMITER ;
```

```javascript
// 应用层分库分表实现
class ShardingManager {
  constructor() {
    this.shardCount = 4
    this.databases = [
      { host: 'shard0-host', database: 'app_shard_0' },
      { host: 'shard1-host', database: 'app_shard_1' },
      { host: 'shard2-host', database: 'app_shard_2' },
      { host: 'shard3-host', database: 'app_shard_3' }
    ]
    
    this.connections = this.databases.map(config => 
      mysql.createPool({
        host: config.host,
        user: 'db_user',
        password: 'db_password',
        database: config.database,
        connectionLimit: 10
      })
    )
  }
  
  // 根据用户ID获取分片
  getShardByUserId(userId) {
    return userId % this.shardCount
  }
  
  // 根据分片索引获取连接
  getConnection(shardIndex) {
    return this.connections[shardIndex]
  }
  
  // 插入用户消息
  async insertUserMessage(userId, message) {
    const shardIndex = this.getShardByUserId(userId)
    const connection = this.getConnection(shardIndex)
    
    const sql = 'INSERT INTO user_messages (user_id, message, created_at) VALUES (?, ?, NOW())'
    const [result] = await connection.execute(sql, [userId, message])
    return result
  }
  
  // 查询用户消息
  async getUserMessages(userId, limit = 20, offset = 0) {
    const shardIndex = this.getShardByUserId(userId)
    const connection = this.getConnection(shardIndex)
    
    const sql = 'SELECT * FROM user_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    const [results] = await connection.execute(sql, [userId, limit, offset])
    return results
  }
  
  // 跨分片查询（需要聚合结果）
  async getRecentMessages(limit = 100) {
    const promises = this.connections.map(connection => 
      connection.execute(
        'SELECT * FROM user_messages ORDER BY created_at DESC LIMIT ?',
        [limit]
      )
    )
    
    const results = await Promise.all(promises)
    const allMessages = results.flatMap(([rows]) => rows)
    
    // 按时间排序并限制结果数量
    return allMessages
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }
}
```

## 安全性

### 1. 用户权限管理

```sql
-- 创建应用专用用户
CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password';
CREATE USER 'app_readonly'@'%' IDENTIFIED BY 'readonly_password';
CREATE USER 'backup_user'@'localhost' IDENTIFIED BY 'backup_password';

-- 授予最小权限
GRANT SELECT, INSERT, UPDATE, DELETE ON your_database.* TO 'app_user'@'%';
GRANT SELECT ON your_database.* TO 'app_readonly'@'%';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON your_database.* TO 'backup_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 查看用户权限
SHOW GRANTS FOR 'app_user'@'%';

-- 撤销权限
REVOKE DELETE ON your_database.* FROM 'app_user'@'%';

-- 删除用户
DROP USER 'old_user'@'%';
```

### 2. 数据加密

```sql
-- 启用 SSL 连接
-- 在 my.cnf 中配置
[mysqld]
ssl-ca=/path/to/ca.pem
ssl-cert=/path/to/server-cert.pem
ssl-key=/path/to/server-key.pem
require_secure_transport=ON

-- 创建需要 SSL 的用户
CREATE USER 'secure_user'@'%' IDENTIFIED BY 'password' REQUIRE SSL;

-- 表级加密（MySQL 8.0+）
CREATE TABLE sensitive_data (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    encrypted_data VARBINARY(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENCRYPTION='Y';

-- 字段级加密
CREATE TABLE user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    -- 使用 AES 加密敏感字段
    encrypted_ssn VARBINARY(255),
    encrypted_phone VARBINARY(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入加密数据
INSERT INTO user_profiles (user_id, encrypted_ssn, encrypted_phone)
VALUES (
    1,
    AES_ENCRYPT('123-45-6789', 'encryption_key'),
    AES_ENCRYPT('555-1234', 'encryption_key')
);

-- 查询解密数据
SELECT 
    user_id,
    AES_DECRYPT(encrypted_ssn, 'encryption_key') as ssn,
    AES_DECRYPT(encrypted_phone, 'encryption_key') as phone
FROM user_profiles
WHERE user_id = 1;
```

### 3. 审计和日志

```sql
-- 启用审计日志（MySQL Enterprise）
INSTALL PLUGIN audit_log SONAME 'audit_log.so';
SET GLOBAL audit_log_policy = ALL;
SET GLOBAL audit_log_format = JSON;

-- 通用查询日志
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/general.log';

-- 创建审计表
CREATE TABLE audit_log (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100),
    host VARCHAR(100),
    command_type VARCHAR(50),
    argument TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user (user_name),
    INDEX idx_timestamp (timestamp),
    INDEX idx_command (command_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建触发器记录数据变更
DELIMITER //
CREATE TRIGGER users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host, command_type, argument)
    VALUES (
        USER(),
        CONNECTION_ID(),
        'INSERT',
        CONCAT('New user created: ', NEW.username, ' (ID: ', NEW.id, ')')
    );
END//

CREATE TRIGGER users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host, command_type, argument)
    VALUES (
        USER(),
        CONNECTION_ID(),
        'UPDATE',
        CONCAT('User updated: ', NEW.username, ' (ID: ', NEW.id, ')')
    );
END//

CREATE TRIGGER users_audit_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_name, host, command_type, argument)
    VALUES (
        USER(),
        CONNECTION_ID(),
        'DELETE',
        CONCAT('User deleted: ', OLD.username, ' (ID: ', OLD.id, ')')
    );
END//
DELIMITER ;
```

## 故障排除

### 1. 常见问题诊断

```sql
-- 查看错误日志
SHOW VARIABLES LIKE 'log_error';

-- 查看当前锁等待
SELECT 
    p1.ID AS blocking_id,
    p1.USER AS blocking_user,
    p1.HOST AS blocking_host,
    p1.DB AS blocking_db,
    p1.COMMAND AS blocking_command,
    p1.TIME AS blocking_time,
    p1.STATE AS blocking_state,
    p1.INFO AS blocking_info,
    p2.ID AS waiting_id,
    p2.USER AS waiting_user,
    p2.HOST AS waiting_host,
    p2.DB AS waiting_db,
    p2.COMMAND AS waiting_command,
    p2.TIME AS waiting_time,
    p2.STATE AS waiting_state,
    p2.INFO AS waiting_info
FROM INFORMATION_SCHEMA.PROCESSLIST p1
INNER JOIN INFORMATION_SCHEMA.PROCESSLIST p2
WHERE p1.ID != p2.ID
    AND p2.STATE LIKE '%waiting%';

-- 查看表锁状态
SHOW OPEN TABLES WHERE In_use > 0;

-- 查看 InnoDB 状态
SHOW ENGINE INNODB STATUS\G

-- 分析表碎片
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'Total Size (MB)',
    ROUND((DATA_FREE / 1024 / 1024), 2) AS 'Free Space (MB)',
    ROUND((DATA_FREE / (DATA_LENGTH + INDEX_LENGTH)) * 100, 2) AS 'Fragmentation %'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'your_database'
    AND DATA_FREE > 0
ORDER BY `Fragmentation %` DESC;

-- 优化表（整理碎片）
OPTIMIZE TABLE articles;
OPTIMIZE TABLE users;

-- 检查表一致性
CHECK TABLE articles;
CHECK TABLE users;

-- 修复表
REPAIR TABLE articles;
```

### 2. 性能问题排查

```sql
-- 查看最耗时的查询
SELECT 
    DIGEST_TEXT,
    COUNT_STAR,
    AVG_TIMER_WAIT/1000000000 as avg_time_sec,
    MAX_TIMER_WAIT/1000000000 as max_time_sec,
    SUM_TIMER_WAIT/1000000000 as total_time_sec,
    SUM_ROWS_EXAMINED,
    SUM_ROWS_SENT
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT IS NOT NULL
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 10;

-- 查看表扫描情况
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    COUNT_READ,
    COUNT_WRITE,
    COUNT_FETCH,
    SUM_TIMER_WAIT/1000000000 as total_time_sec
FROM performance_schema.table_io_waits_summary_by_table
WHERE OBJECT_SCHEMA = 'your_database'
ORDER BY SUM_TIMER_WAIT DESC;

-- 查看索引使用情况
SELECT 
    OBJECT_SCHEMA,
    OBJECT_NAME,
    INDEX_NAME,
    COUNT_FETCH,
    COUNT_INSERT,
    COUNT_UPDATE,
    COUNT_DELETE,
    SUM_TIMER_FETCH/1000000000 as fetch_time_sec
FROM performance_schema.table_io_waits_summary_by_index_usage
WHERE OBJECT_SCHEMA = 'your_database'
ORDER BY SUM_TIMER_FETCH DESC;
```

## 参考资源

### 官方文档
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [MySQL Performance Schema](https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html)
- [MySQL InnoDB 存储引擎](https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html)

### 工具和插件
- [MySQL Workbench](https://www.mysql.com/products/workbench/) - 官方图形化管理工具
- [Percona Toolkit](https://www.percona.com/software/database-tools/percona-toolkit) - MySQL 性能优化工具集
- [pt-query-digest](https://www.percona.com/doc/percona-toolkit/LATEST/pt-query-digest.html) - 慢查询分析工具
- [MySQLTuner](https://github.com/major/MySQLTuner-perl) - MySQL 配置优化建议工具

### 最佳实践文章
- [MySQL High Performance](https://www.oreilly.com/library/view/high-performance-mysql/9781449332471/)
- [Effective MySQL](https://effectivemysql.com/)
- [MySQL Performance Blog](https://www.percona.com/blog/)

### 社区资源
- [MySQL Community](https://www.mysql.com/community/)
- [Stack Overflow MySQL 标签](https://stackoverflow.com/questions/tagged/mysql)
- [Reddit r/MySQL](https://www.reddit.com/r/mysql/)

---

本指南涵盖了 MySQL 数据库设计、优化、高可用性配置和故障排除的各个方面。通过遵循这些最佳实践，你可以构建高性能、可靠的 MySQL 数据库系统，并有效地解决开发和运维过程中遇到的问题。