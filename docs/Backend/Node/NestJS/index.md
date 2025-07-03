# NestJS 企业级 Node.js 框架开发指南

## 简介

NestJS 是一个用于构建高效、可扩展的 Node.js 服务器端应用程序的框架。它使用现代 JavaScript，完全支持 TypeScript，并结合了 OOP（面向对象编程）、FP（函数式编程）和 FRP（函数响应式编程）的元素。

### 核心特性

- **TypeScript 优先**：完全支持 TypeScript，提供强类型检查
- **装饰器模式**：大量使用装饰器简化开发
- **依赖注入**：内置强大的依赖注入系统
- **模块化架构**：清晰的模块化组织结构
- **微服务支持**：原生支持微服务架构
- **GraphQL 集成**：内置 GraphQL 支持
- **WebSocket 支持**：实时通信支持
- **测试友好**：内置测试工具和最佳实践

### 适用场景

- **企业级应用**：大型、复杂的后端系统
- **微服务架构**：分布式系统开发
- **API 服务**：RESTful API 和 GraphQL API
- **实时应用**：WebSocket 和 Server-Sent Events
- **团队协作**：需要强类型和规范化的项目

## 快速开始

### 1. 项目初始化

```bash
# 安装 NestJS CLI
npm install -g @nestjs/cli

# 创建新项目
nest new blog-api
cd blog-api

# 启动开发服务器
npm run start:dev
```

### 2. 项目结构

```
blog-api/
├── src/
│   ├── app.controller.ts          # 应用控制器
│   ├── app.module.ts               # 根模块
│   ├── app.service.ts              # 应用服务
│   ├── main.ts                     # 应用入口
│   ├── auth/                       # 认证模块
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── local-auth.guard.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── articles/                   # 文章模块
│   │   ├── articles.controller.ts
│   │   ├── articles.module.ts
│   │   ├── articles.service.ts
│   │   ├── dto/
│   │   │   ├── create-article.dto.ts
│   │   │   └── update-article.dto.ts
│   │   └── entities/
│   │       └── article.entity.ts
│   ├── users/                      # 用户模块
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── common/                     # 公共模块
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── middleware/
│   └── config/                     # 配置模块
│       ├── database.config.ts
│       └── app.config.ts
├── test/                           # 测试文件
├── package.json
├── tsconfig.json
├── nest-cli.json
└── .env
```

### 3. 基础应用配置

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 全局前缀
  app.setGlobalPrefix('api');

  // API 版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS 配置
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger 文档
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Blog API')
      .setDescription('博客系统 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', '认证相关')
      .addTag('users', '用户管理')
      .addTag('articles', '文章管理')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
```

## 模块系统

### 1. 根模块

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { DatabaseConfig } from './config/database.config';
import { AppConfig } from './config/app.config';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, DatabaseConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('database.ssl'),
      }),
      inject: [ConfigService],
    }),

    // 缓存模块
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        ttl: configService.get('redis.ttl'),
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('throttle.ttl'),
        limit: configService.get('throttle.limit'),
      }),
      inject: [ConfigService],
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 事件模块
    EventEmitterModule.forRoot(),

    // 业务模块
    AuthModule,
    UsersModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 2. 功能模块

```typescript
// src/articles/articles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article]),
    UsersModule, // 导入用户模块
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService], // 导出服务供其他模块使用
})
export class ArticlesModule {}
```

## 实体和数据传输对象

### 1. 实体定义

```typescript
// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { Article } from '../../articles/entities/article.entity';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column()
  @Exclude() // 在序列化时排除密码字段
  password: string;

  @Column({ length: 50 })
  firstName: string;

  @Column({ length: 50 })
  lastName: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ nullable: true, length: 255 })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];

  // 生命周期钩子
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // 实例方法
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
```

```typescript
// src/articles/entities/article.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('articles')
@Index(['status', 'publishedAt']) // 复合索引
@Index(['slug'], { unique: true }) // 唯一索引
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ nullable: true, length: 500 })
  excerpt: string;

  @Column('text')
  content: string;

  @Column({ nullable: true, length: 255 })
  featuredImage: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ nullable: true, length: 100 })
  category: string;

  @Column({
    type: 'enum',
    enum: ArticleStatus,
    default: ArticleStatus.DRAFT,
  })
  status: ArticleStatus;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ nullable: true })
  readingTime: number; // 预计阅读时间（分钟）

  @Column({ nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.articles, {
    eager: true, // 自动加载关联数据
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('uuid')
  authorId: string;

  // 生命周期钩子
  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.title && !this.slug) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  calculateReadingTime() {
    if (this.content) {
      const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      this.readingTime = Math.ceil(wordCount / 200);
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  setPublishedAt() {
    if (this.status === ArticleStatus.PUBLISHED && !this.publishedAt) {
      this.publishedAt = new Date();
    }
  }
}
```

### 2. 数据传输对象 (DTO)

```typescript
// src/auth/dto/register.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '用户名只能包含字母、数字和下划线',
  })
  @Transform(({ value }) => value.toLowerCase())
  username: string;

  @ApiProperty({
    description: '邮箱地址',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({
    description: '密码',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: '密码必须包含大小写字母、数字和特殊字符',
  })
  password: string;

  @ApiProperty({
    description: '名字',
    example: 'John',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    description: '姓氏',
    example: 'Doe',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    description: '个人简介',
    example: '我是一名开发者',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;
}
```

```typescript
// src/articles/dto/create-article.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArticleStatus } from '../entities/article.entity';

export class CreateArticleDto {
  @ApiProperty({
    description: '文章标题',
    example: 'NestJS 入门指南',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: '文章摘要',
    example: '这是一篇关于 NestJS 的入门指南',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiProperty({
    description: '文章内容',
    example: '# NestJS 简介\n\nNestJS 是一个...',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '特色图片 URL',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的图片 URL' })
  featuredImage?: string;

  @ApiProperty({
    description: '标签列表',
    example: ['nestjs', 'nodejs', 'typescript'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value.map((tag: string) => tag.toLowerCase()))
  tags?: string[];

  @ApiProperty({
    description: '文章分类',
    example: 'Technology',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    description: '文章状态',
    enum: ArticleStatus,
    example: ArticleStatus.DRAFT,
    required: false,
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
```

```typescript
// src/articles/dto/update-article.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {}
```

```typescript
// src/common/dto/pagination.dto.ts
import { IsOptional, IsPositive, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginationResponseDto<T> {
  @ApiPropertyOptional({ description: '数据列表' })
  data: T[];

  @ApiPropertyOptional({ description: '总数量' })
  total: number;

  @ApiPropertyOptional({ description: '当前页码' })
  page: number;

  @ApiPropertyOptional({ description: '每页数量' })
  limit: number;

  @ApiPropertyOptional({ description: '总页数' })
  totalPages: number;

  @ApiPropertyOptional({ description: '是否有下一页' })
  hasNext: boolean;

  @ApiPropertyOptional({ description: '是否有上一页' })
  hasPrev: boolean;
}
```

## 控制器

### 1. 文章控制器

```typescript
// src/articles/articles.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';

import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { Article, ArticleStatus } from './entities/article.entity';

@ApiTags('articles')
@Controller({ path: 'articles', version: '1' })
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: '创建文章' })
  @ApiResponse({
    status: 201,
    description: '文章创建成功',
    type: Article,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: User,
  ): Promise<Article> {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取文章列表' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginationResponseDto<Article>,
  })
  @ApiQuery({ name: 'status', enum: ArticleStatus, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  @ApiQuery({ name: 'tag', type: String, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 缓存 5 分钟
  @Throttle(100, 60) // 每分钟最多 100 次请求
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: ArticleStatus,
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ): Promise<PaginationResponseDto<Article>> {
    return this.articlesService.findAll({
      ...paginationDto,
      status,
      category,
      tag,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文章详情' })
  @ApiParam({ name: 'id', description: '文章 ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: Article,
  })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600) // 缓存 10 分钟
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: '通过 slug 获取文章' })
  @ApiParam({ name: 'slug', description: '文章 slug' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: Article,
  })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600)
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<Article> {
    return this.articlesService.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新文章' })
  @ApiParam({ name: 'id', description: '文章 ID' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: Article,
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() user: User,
  ): Promise<Article> {
    return this.articlesService.update(id, updateArticleDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文章' })
  @ApiParam({ name: 'id', description: '文章 ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.articlesService.remove(id, user);
    return { message: '文章删除成功' };
  }

  @Post(':id/like')
  @ApiOperation({ summary: '点赞/取消点赞文章' })
  @ApiParam({ name: 'id', description: '文章 ID' })
  @ApiResponse({
    status: 200,
    description: '操作成功',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean' },
        likeCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<{ liked: boolean; likeCount: number }> {
    return this.articlesService.toggleLike(id, user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: '增加文章浏览量' })
  @ApiParam({ name: 'id', description: '文章 ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @ApiResponse({ status: 404, description: '文章不存在' })
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60) // 每分钟最多 10 次
  async incrementView(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ): Promise<{ viewCount: number }> {
    const clientIp = req.ip || req.connection.remoteAddress;
    return this.articlesService.incrementView(id, clientIp);
  }

  @Get('author/:authorId')
  @ApiOperation({ summary: '获取指定作者的文章' })
  @ApiParam({ name: 'authorId', description: '作者 ID' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginationResponseDto<Article>,
  })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300)
  async findByAuthor(
    @Param('authorId', ParseUUIDPipe) authorId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<Article>> {
    return this.articlesService.findByAuthor(authorId, paginationDto);
  }

  @Get('admin/all')
  @ApiOperation({ summary: '管理员获取所有文章（包括草稿）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: PaginationResponseDto<Article>,
  })
  @ApiResponse({ status: 403, description: '权限不足' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async findAllForAdmin(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<Article>> {
    return this.articlesService.findAllForAdmin(paginationDto);
  }
}
```

### 2. 认证控制器

```typescript
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({
    status: 201,
    description: '注册成功',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/User' },
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 409, description: '用户已存在' })
  @HttpCode(HttpStatus.CREATED)
  @Throttle(5, 60) // 每分钟最多 5 次注册请求
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/User' },
        access_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60) // 每分钟最多 10 次登录请求
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Get('profile')
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: User,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '忘记密码' })
  @ApiResponse({ status: 200, description: '重置邮件已发送' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @HttpCode(HttpStatus.OK)
  @Throttle(3, 60) // 每分钟最多 3 次请求
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '重置令牌无效或已过期' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password,
    );
  }

  @Patch('change-password')
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 400, description: '当前密码错误' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('verify-email/:token')
  @ApiOperation({ summary: '验证邮箱' })
  @ApiResponse({ status: 200, description: '邮箱验证成功' })
  @ApiResponse({ status: 400, description: '验证令牌无效' })
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: '重新发送验证邮件' })
  @ApiResponse({ status: 200, description: '验证邮件已发送' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(3, 60)
  async resendVerification(@CurrentUser() user: User) {
    return this.authService.resendVerificationEmail(user.id);
  }
}
```

## 服务层

### 1. 文章服务

```typescript
// src/articles/articles.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { Article, ArticleStatus } from './entities/article.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

interface FindAllOptions extends PaginationDto {
  status?: ArticleStatus;
  category?: string;
  tag?: string;
  search?: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && await user.validatePassword(password)) {
      // 更新最后登录时间
      user.lastLoginAt = new Date();
      await this.usersService.update(user.id, { lastLoginAt: user.lastLoginAt });

      return user;
    }

    return null;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // 检查用户是否已存在
    const existingUser = await this.usersService.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );

    if (existingUser) {
      if (existingUser.email === registerDto.email) {
        throw new ConflictException('邮箱已被注册');
      }
      if (existingUser.username === registerDto.username) {
        throw new ConflictException('用户名已被使用');
      }
    }

    // 生成邮箱验证令牌
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // 创建用户
    const user = await this.usersService.create({
      ...registerDto,
      emailVerificationToken,
    });

    // 发送验证邮件
    await this.mailService.sendVerificationEmail(user.email, emailVerificationToken);

    // 发布事件
    this.eventEmitter.emit('user.registered', { user });

    // 生成 JWT
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    // 发布事件
    this.eventEmitter.emit('user.logged_in', { user });

    return {
      user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 小时后过期

    // 更新用户信息
    await this.usersService.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // 发送重置邮件
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    // 发布事件
    this.eventEmitter.emit('user.password_reset_requested', { user });

    return { message: '密码重置邮件已发送' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.usersService.findByPasswordResetToken(token);

    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('重置令牌无效或已过期');
    }

    // 更新密码并清除重置令牌
    await this.usersService.update(user.id, {
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    // 发布事件
    this.eventEmitter.emit('user.password_reset', { user });

    return { message: '密码重置成功' };
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('当前密码错误');
    }

    // 更新密码
    await this.usersService.update(userId, { password: newPassword });

    // 发布事件
    this.eventEmitter.emit('user.password_changed', { user });

    return { message: '密码修改成功' };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmailVerificationToken(token);

    if (!user) {
      throw new BadRequestException('验证令牌无效');
    }

    // 更新用户验证状态
    await this.usersService.update(user.id, {
      emailVerified: true,
      emailVerificationToken: null,
    });

    // 发布事件
    this.eventEmitter.emit('user.email_verified', { user });

    return { message: '邮箱验证成功' };
  }

  async resendVerificationEmail(userId: string): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.emailVerified) {
      throw new BadRequestException('邮箱已验证');
    }

    // 生成新的验证令牌
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    await this.usersService.update(userId, { emailVerificationToken });

    // 发送验证邮件
    await this.mailService.sendVerificationEmail(user.email, emailVerificationToken);

    return { message: '验证邮件已重新发送' };
  }
}
```

## 守卫和装饰器

### 1. JWT 认证守卫

```typescript
// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('访问令牌无效');
    }
    return user;
  }
}
```

### 2. 角色守卫

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return requiredRoles.some((role) => user.role === role);
  }
}
```

### 3. 自定义装饰器

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/auth/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## 中间件和拦截器

### 1. 日志拦截器

```typescript
// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');
        const duration = Date.now() - now;

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${userAgent} ${ip} +${duration}ms`,
        );
      }),
    );
  }
}
```

### 2. 响应转换拦截器

```typescript
// src/common/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

### 3. 异常过滤器

```typescript
// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // 记录错误日志
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json(errorResponse);
  }
}
```

## 管道和验证

### 1. 自定义验证管道

```typescript
// src/common/pipes/parse-uuid.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate as isUuid } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isUuid(value)) {
      throw new BadRequestException('无效的 UUID 格式');
    }
    return value;
  }
}
```

### 2. 文件上传管道

```typescript
// src/common/pipes/file-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

interface FileValidationOptions {
  maxSize?: number; // 字节
  allowedMimeTypes?: string[];
  required?: boolean;
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'],
      required = false,
    } = this.options;

    if (!file) {
      if (required) {
        throw new BadRequestException('文件是必需的');
      }
      return null;
    }

    // 检查文件大小
    if (file.size > maxSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }

    // 检查文件类型
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `不支持的文件类型。允许的类型: ${allowedMimeTypes.join(', ')}`,
      );
    }

    return file;
  }
}
```

## 事件系统

### 1. 事件监听器

```typescript
// src/events/listeners/user.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from '../../mail/mail.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class UserListener {
  private readonly logger = new Logger(UserListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { user: User }) {
    this.logger.log(`User registered: ${payload.user.email}`);

    // 发送欢迎邮件
    await this.mailService.sendWelcomeEmail(
      payload.user.email,
      payload.user.firstName,
    );
  }

  @OnEvent('user.logged_in')
  handleUserLoggedIn(payload: { user: User }) {
    this.logger.log(`User logged in: ${payload.user.email}`);

    // 可以在这里记录登录日志、更新统计信息等
  }

  @OnEvent('user.password_reset')
  handlePasswordReset(payload: { user: User }) {
    this.logger.log(`Password reset for user: ${payload.user.email}`);

    // 可以发送密码重置成功通知邮件
  }

  @OnEvent('user.email_verified')
  async handleEmailVerified(payload: { user: User }) {
    this.logger.log(`Email verified for user: ${payload.user.email}`);

    // 可以发送验证成功邮件或执行其他操作
  }
}
```

### 2. 文章事件监听器

```typescript
// src/events/listeners/article.listener.ts
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';
import { NotificationService } from '../../notifications/notification.service';

@Injectable()
export class ArticleListener {
  private readonly logger = new Logger(ArticleListener.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  @OnEvent('article.created')
  async handleArticleCreated(payload: { article: Article; author: User }) {
    this.logger.log(`Article created: ${payload.article.title}`);

    // 如果文章已发布，通知订阅者
    if (payload.article.status === 'published') {
      await this.notificationService.notifySubscribers(
        payload.author.id,
        payload.article,
      );
    }
  }

  @OnEvent('article.updated')
  handleArticleUpdated(payload: { article: Article; user: User }) {
    this.logger.log(`Article updated: ${payload.article.title}`);

    // 可以在这里处理文章更新后的逻辑
  }

  @OnEvent('article.deleted')
  handleArticleDeleted(payload: { article: Article; user: User }) {
    this.logger.log(`Article deleted: ${payload.article.title}`);

    // 可以在这里清理相关数据
  }
}
```

## 定时任务

### 1. 定时任务服务

```typescript
// src/tasks/tasks.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Article } from '../articles/entities/article.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  // 每天凌晨 2 点清理未验证的用户（注册超过 7 天）
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupUnverifiedUsers() {
    this.logger.log('开始清理未验证用户...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.userRepository.delete({
      emailVerified: false,
      createdAt: LessThan(sevenDaysAgo),
    });

    this.logger.log(`清理了 ${result.affected} 个未验证用户`);
  }

  // 每小时更新文章统计信息
  @Cron(CronExpression.EVERY_HOUR)
  async updateArticleStats() {
    this.logger.log('更新文章统计信息...');

    // 这里可以实现复杂的统计逻辑
    // 例如：计算热门文章、更新排行榜等
  }

  // 每周一上午 9 点发送周报
  @Cron('0 9 * * 1')
  async sendWeeklyReport() {
    this.logger.log('发送周报...');

    // 生成并发送周报邮件
  }

  // 每 30 分钟清理过期的密码重置令牌
  @Cron('*/30 * * * *')
  async cleanupExpiredTokens() {
    this.logger.log('清理过期令牌...');

    const now = new Date();

    const result = await this.userRepository.update(
      {
        passwordResetExpires: LessThan(now),
      },
      {
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    );

    this.logger.log(`清理了 ${result.affected} 个过期令牌`);
  }
}
```

## 配置管理

### 1. 应用配置

```typescript
// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  name: process.env.APP_NAME || 'Blog API',
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  url: process.env.APP_URL || 'http://localhost:3000',

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 限流配置
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    allowedMimeTypes: process.env.ALLOWED_MIME_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
  },
}));
```

### 2. 数据库配置

```typescript
// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  name: process.env.DB_NAME || 'blog',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
}));
```

### 3. Redis 配置

```typescript
// src/config/redis.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  ttl: parseInt(process.env.REDIS_TTL, 10) || 300,
}));
```
    ## 测试

### 1. 单元测试

```typescript
// src/articles/articles.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ArticlesService } from './articles.service';
import { Article } from './entities/article.entity';
import { User } from '../users/entities/user.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: Repository<Article>;
  let cacheManager: any;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
    cacheManager = module.get(CACHE_MANAGER);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        content: 'Test content',
        excerpt: 'Test excerpt',
        tags: ['test'],
        status: 'draft',
      };

      const user = { id: '1', username: 'testuser' } as User;
      const article = { id: '1', ...createArticleDto, author: user } as Article;

      mockRepository.create.mockReturnValue(article);
      mockRepository.save.mockResolvedValue(article);

      const result = await service.create(createArticleDto, user);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createArticleDto,
        author: user,
        slug: expect.any(String),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(article);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('article.created', {
        article,
        author: user,
      });
      expect(result).toEqual(article);
    });
  });

  describe('findOne', () => {
    it('should return an article if found', async () => {
      const article = { id: '1', title: 'Test Article' } as Article;
      mockRepository.findOne.mockResolvedValue(article);

      const result = await service.findOne('1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author', 'tags'],
      });
      expect(result).toEqual(article);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### 2. 集成测试

```typescript
// test/articles.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../src/articles/entities/article.entity';
import { User } from '../src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('ArticlesController (e2e)', () => {
  let app: INestApplication;
  let articleRepository: Repository<Article>;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let authToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    articleRepository = moduleFixture.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();

    // 创建测试用户
    testUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
    });
    await userRepository.save(testUser);

    // 生成认证令牌
    authToken = jwtService.sign({
      sub: testUser.id,
      username: testUser.username,
      email: testUser.email,
      role: testUser.role,
    });
  });

  afterAll(async () => {
    await articleRepository.clear();
    await userRepository.clear();
    await app.close();
  });

  describe('/articles (POST)', () => {
    it('should create a new article', () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'This is a test article content.',
        excerpt: 'Test excerpt',
        tags: ['test', 'article'],
        status: 'published',
      };

      return request(app.getHttpServer())
        .post('/articles')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createArticleDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data.title).toBe(createArticleDto.title);
          expect(res.body.data.content).toBe(createArticleDto.content);
          expect(res.body.data.author.id).toBe(testUser.id);
        });
    });

    it('should return 401 without authentication', () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'This is a test article content.',
      };

      return request(app.getHttpServer())
        .post('/articles')
        .send(createArticleDto)
        .expect(401);
    });
  });

  describe('/articles (GET)', () => {
    it('should return paginated articles', () => {
      return request(app.getHttpServer())
        .get('/articles?page=1&limit=10')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('items');
          expect(res.body.data).toHaveProperty('meta');
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });
  });
});
```
```

## 性能优化

### 1. 数据库查询优化

```typescript
// src/articles/articles.service.ts
export class ArticlesService {
  // 使用查询构建器进行复杂查询
  async findWithFilters(filters: ArticleFiltersDto): Promise<PaginatedResult<Article>> {
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.tags', 'tags');

    // 添加过滤条件
    if (filters.status) {
      queryBuilder.andWhere('article.status = :status', { status: filters.status });
    }

    if (filters.authorId) {
      queryBuilder.andWhere('author.id = :authorId', { authorId: filters.authorId });
    }

    if (filters.tags && filters.tags.length > 0) {
      queryBuilder.andWhere('tags.name IN (:...tags)', { tags: filters.tags });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(article.title ILIKE :search OR article.content ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // 排序
    queryBuilder.orderBy('article.createdAt', 'DESC');

    // 分页
    const [items, total] = await queryBuilder
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return {
      items,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  // 批量操作优化
  async bulkUpdateStatus(ids: string[], status: ArticleStatus): Promise<void> {
    await this.articleRepository
      .createQueryBuilder()
      .update(Article)
      .set({ status })
      .where('id IN (:...ids)', { ids })
      .execute();

    // 清除相关缓存
    await this.clearCacheForArticles(ids);
  }

  private async clearCacheForArticles(ids: string[]): Promise<void> {
    const cacheKeys = ids.map(id => `article:${id}`);
    await Promise.all(cacheKeys.map(key => this.cacheManager.del(key)));
  }
}
```

### 2. 缓存策略

```typescript
// src/common/decorators/cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
export const CacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_METADATA, ttl);

// 组合装饰器
export function Cacheable(key: string, ttl: number = 300) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    CacheKey(key)(target, propertyKey, descriptor);
    CacheTTL(ttl)(target, propertyKey, descriptor);
  };
}
```

```typescript
// src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const finalCacheKey = this.buildCacheKey(cacheKey, request);

    // 尝试从缓存获取
    const cachedResult = await this.cacheManager.get(finalCacheKey);
    if (cachedResult) {
      return of(cachedResult);
    }

    // 执行方法并缓存结果
    return next.handle().pipe(
      tap(async (result) => {
        await this.cacheManager.set(finalCacheKey, result, cacheTTL || 300);
      }),
    );
  }

  private buildCacheKey(template: string, request: any): string {
    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      return request.params[key] || request.query[key] || match;
    });
  }
}
```

## 部署配置

### 1. Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY yarn.lock ./

# 安装依赖
RUN yarn install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN yarn build

# 生产阶段
FROM node:18-alpine AS production

WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 复制 package 文件
COPY package*.json ./
COPY yarn.lock ./

# 安装生产依赖
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# 切换到非 root 用户
USER nestjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# 启动应用
CMD ["node", "dist/main"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=blog_user
      - DB_PASSWORD=blog_password
      - DB_NAME=blog_db
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - blog-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=blog_user
      - POSTGRES_PASSWORD=blog_password
      - POSTGRES_DB=blog_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - '5432:5432'
    restart: unless-stopped
    networks:
      - blog-network

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - blog-network

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - blog-network

volumes:
  postgres_data:
  redis_data:

networks:
  blog-network:
    driver: bridge
```

### 3. 环境配置

```bash
# .env.production
NODE_ENV=production
PORT=3000
APP_NAME=Blog API
APP_URL=https://api.yourdomain.com

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=blog_user
DB_PASSWORD=your_secure_password
DB_NAME=blog_production
DB_SSL=true
DB_SYNCHRONIZE=false
DB_LOGGING=false

# JWT 配置
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=300

# 邮件配置
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=noreply@yourdomain.com

# 文件上传配置
MAX_FILE_SIZE=5242880
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/gif

# 限流配置
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# 监控配置
SENTRY_DSN=your_sentry_dsn
```

## 最佳实践

### 1. 代码组织

- **模块化设计**：按功能划分模块，保持模块间的低耦合
- **依赖注入**：充分利用 NestJS 的 DI 系统，便于测试和维护
- **接口抽象**：定义清晰的接口，便于扩展和替换实现
- **错误处理**：统一的错误处理机制，提供友好的错误信息

### 2. 安全实践

- **输入验证**：使用 DTO 和验证管道确保数据安全
- **认证授权**：实现完善的认证和授权机制
- **HTTPS**：生产环境必须使用 HTTPS
- **安全头**：配置适当的安全响应头

### 3. 性能优化

- **数据库优化**：合理使用索引，优化查询语句
- **缓存策略**：实现多层缓存，减少数据库压力
- **异步处理**：使用队列处理耗时任务
- **资源压缩**：启用 gzip 压缩，优化传输效率

### 4. 监控和日志

- **结构化日志**：使用结构化日志格式，便于分析
- **性能监控**：监控应用性能指标
- **错误追踪**：集成错误追踪服务
- **健康检查**：实现应用健康检查端点

## 参考资源

### 官方文档
- [NestJS 官方文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [Passport.js 文档](http://www.passportjs.org/docs/)

### 工具和插件
- [NestJS CLI](https://docs.nestjs.com/cli/overview)
- [NestJS Swagger](https://docs.nestjs.com/openapi/introduction)
- [NestJS Config](https://docs.nestjs.com/techniques/configuration)
- [NestJS Throttler](https://docs.nestjs.com/security/rate-limiting)

### 最佳实践文章
- [NestJS Best Practices](https://github.com/nestjs/awesome-nestjs)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

### 社区资源
- [NestJS Discord](https://discord.gg/G7Qnnhy)
- [NestJS GitHub](https://github.com/nestjs/nest)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nestjs)

---

本指南涵盖了 NestJS 框架的核心概念、实际应用、最佳实践和部署配置。通过遵循这些实践，你可以构建出高质量、可维护、可扩展的 Node.js 应用程序。
