# GraphQL API 设计与实现

## 简介

GraphQL 是一种用于 API 的查询语言和运行时，由 Facebook 开发。它提供了一种更高效、强大和灵活的替代 REST 的方案，允许客户端精确地请求所需的数据。

### 核心特性

- **精确数据获取**：客户端可以指定需要的确切数据
- **单一端点**：所有操作通过一个 URL 端点进行
- **强类型系统**：使用 Schema 定义 API 结构
- **实时订阅**：支持实时数据推送
- **内省能力**：API 可以描述自身的结构

### 适用场景

- 移动应用（减少网络请求）
- 复杂的前端应用
- 微服务架构的 API 网关
- 需要实时数据的应用
- 多客户端应用（Web、移动、桌面）

## GraphQL 核心概念

### 1. Schema 定义

Schema 是 GraphQL API 的核心，定义了可用的操作和数据结构。

```graphql
# 基础类型定义
type User {
  id: ID!
  username: String!
  email: String!
  firstName: String
  lastName: String
  age: Int
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  excerpt: String
  status: PostStatus!
  author: User!
  category: Category
  tags: [Tag!]!
  comments: [Comment!]!
  publishedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  parent: Comment
  replies: [Comment!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Category {
  id: ID!
  name: String!
  description: String
  slug: String!
  posts: [Post!]!
}

type Tag {
  id: ID!
  name: String!
  posts: [Post!]!
}

# 枚举类型
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

# 自定义标量类型
scalar DateTime
scalar Email
scalar URL

# 输入类型
input CreateUserInput {
  username: String!
  email: Email!
  password: String!
  firstName: String
  lastName: String
  age: Int
}

input UpdateUserInput {
  username: String
  email: Email
  firstName: String
  lastName: String
  age: Int
}

input CreatePostInput {
  title: String!
  content: String!
  excerpt: String
  status: PostStatus = DRAFT
  categoryId: ID
  tagIds: [ID!]
}

input PostFilter {
  status: PostStatus
  authorId: ID
  categoryId: ID
  tagIds: [ID!]
  search: String
  publishedAfter: DateTime
  publishedBefore: DateTime
}

input PaginationInput {
  first: Int
  after: String
  last: Int
  before: String
}

# 分页结果类型
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}
```

### 2. 查询（Query）

查询用于读取数据，类似于 REST 中的 GET 请求。

```graphql
# 根查询类型
type Query {
  # 用户查询
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
  me: User
  
  # 文章查询
  post(id: ID!): Post
  posts(
    filter: PostFilter
    pagination: PaginationInput
    orderBy: PostOrderBy
  ): PostConnection!
  
  # 分类和标签
  categories: [Category!]!
  tags: [Tag!]!
  
  # 搜索
  search(query: String!, type: SearchType): SearchResult!
}

# 排序输入
input PostOrderBy {
  field: PostOrderField!
  direction: OrderDirection!
}

enum PostOrderField {
  CREATED_AT
  UPDATED_AT
  PUBLISHED_AT
  TITLE
}

enum OrderDirection {
  ASC
  DESC
}

# 搜索相关
enum SearchType {
  ALL
  POSTS
  USERS
  CATEGORIES
}

union SearchResult = Post | User | Category
```

### 3. 变更（Mutation）

变更用于修改数据，类似于 REST 中的 POST、PUT、DELETE 请求。

```graphql
type Mutation {
  # 用户操作
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
  
  # 认证操作
  login(email: Email!, password: String!): LoginPayload!
  logout: LogoutPayload!
  refreshToken(token: String!): RefreshTokenPayload!
  
  # 文章操作
  createPost(input: CreatePostInput!): CreatePostPayload!
  updatePost(id: ID!, input: UpdatePostInput!): UpdatePostPayload!
  deletePost(id: ID!): DeletePostPayload!
  publishPost(id: ID!): PublishPostPayload!
  
  # 评论操作
  createComment(input: CreateCommentInput!): CreateCommentPayload!
  updateComment(id: ID!, input: UpdateCommentInput!): UpdateCommentPayload!
  deleteComment(id: ID!): DeleteCommentPayload!
  
  # 分类和标签操作
  createCategory(input: CreateCategoryInput!): CreateCategoryPayload!
  createTag(input: CreateTagInput!): CreateTagPayload!
}

# Payload 类型（包含结果和错误信息）
type CreateUserPayload {
  user: User
  errors: [UserError!]
}

type UpdateUserPayload {
  user: User
  errors: [UserError!]
}

type DeleteUserPayload {
  deletedUserId: ID
  errors: [UserError!]
}

type LoginPayload {
  user: User
  token: String
  refreshToken: String
  errors: [AuthError!]
}

# 错误类型
interface Error {
  message: String!
  code: String!
}

type UserError implements Error {
  message: String!
  code: String!
  field: String
}

type AuthError implements Error {
  message: String!
  code: String!
}

type ValidationError implements Error {
  message: String!
  code: String!
  field: String!
}
```

### 4. 订阅（Subscription）

订阅用于实时数据推送。

```graphql
type Subscription {
  # 文章相关订阅
  postCreated: Post!
  postUpdated(id: ID): Post!
  postDeleted: ID!
  
  # 评论相关订阅
  commentAdded(postId: ID!): Comment!
  commentUpdated(postId: ID): Comment!
  
  # 用户相关订阅
  userOnline: User!
  userOffline: ID!
  
  # 通知订阅
  notification(userId: ID!): Notification!
}

type Notification {
  id: ID!
  type: NotificationType!
  title: String!
  message: String!
  data: JSON
  read: Boolean!
  createdAt: DateTime!
}

enum NotificationType {
  COMMENT
  LIKE
  FOLLOW
  SYSTEM
}

scalar JSON
```

## GraphQL 服务器实现

### 1. Node.js + Apollo Server 实现

```javascript
// GraphQL 服务器实现
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const express = require('express')
const http = require('http')
const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

// 创建发布订阅实例
const pubsub = new PubSub()

// 类型定义（从上面的 schema 导入）
const typeDefs = require('./schema.graphql')

// 解析器实现
class GraphQLResolvers {
  constructor(dataSources) {
    this.dataSources = dataSources
  }

  // 查询解析器
  getQueryResolvers() {
    return {
      // 用户查询
      user: async (parent, { id }, context) => {
        return await this.dataSources.userAPI.getUserById(id)
      },

      users: async (parent, { first, after }, context) => {
        return await this.dataSources.userAPI.getUsers({ first, after })
      },

      me: async (parent, args, context) => {
        if (!context.user) {
          throw new Error('Authentication required')
        }
        return await this.dataSources.userAPI.getUserById(context.user.id)
      },

      // 文章查询
      post: async (parent, { id }, context) => {
        return await this.dataSources.postAPI.getPostById(id)
      },

      posts: async (parent, { filter, pagination, orderBy }, context) => {
        return await this.dataSources.postAPI.getPosts({
          filter,
          pagination,
          orderBy
        })
      },

      // 搜索
      search: async (parent, { query, type }, context) => {
        return await this.dataSources.searchAPI.search(query, type)
      }
    }
  }

  // 变更解析器
  getMutationResolvers() {
    return {
      // 用户创建
      createUser: async (parent, { input }, context) => {
        try {
          const user = await this.dataSources.userAPI.createUser(input)
          return {
            user,
            errors: []
          }
        } catch (error) {
          return {
            user: null,
            errors: [{
              message: error.message,
              code: 'USER_CREATION_FAILED',
              field: error.field
            }]
          }
        }
      },

      // 用户登录
      login: async (parent, { email, password }, context) => {
        try {
          const user = await this.dataSources.authAPI.authenticate(email, password)
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          )
          const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
          )

          return {
            user,
            token,
            refreshToken,
            errors: []
          }
        } catch (error) {
          return {
            user: null,
            token: null,
            refreshToken: null,
            errors: [{
              message: error.message,
              code: 'AUTHENTICATION_FAILED'
            }]
          }
        }
      },

      // 文章创建
      createPost: async (parent, { input }, context) => {
        if (!context.user) {
          return {
            post: null,
            errors: [{
              message: 'Authentication required',
              code: 'AUTHENTICATION_REQUIRED'
            }]
          }
        }

        try {
          const post = await this.dataSources.postAPI.createPost({
            ...input,
            authorId: context.user.id
          })

          // 发布订阅事件
          pubsub.publish('POST_CREATED', { postCreated: post })

          return {
            post,
            errors: []
          }
        } catch (error) {
          return {
            post: null,
            errors: [{
              message: error.message,
              code: 'POST_CREATION_FAILED',
              field: error.field
            }]
          }
        }
      },

      // 评论创建
      createComment: async (parent, { input }, context) => {
        if (!context.user) {
          throw new Error('Authentication required')
        }

        const comment = await this.dataSources.commentAPI.createComment({
          ...input,
          authorId: context.user.id
        })

        // 发布订阅事件
        pubsub.publish('COMMENT_ADDED', {
          commentAdded: comment,
          postId: input.postId
        })

        return {
          comment,
          errors: []
        }
      }
    }
  }

  // 订阅解析器
  getSubscriptionResolvers() {
    return {
      postCreated: {
        subscribe: () => pubsub.asyncIterator(['POST_CREATED'])
      },

      postUpdated: {
        subscribe: (parent, { id }) => {
          if (id) {
            return pubsub.asyncIterator([`POST_UPDATED_${id}`])
          }
          return pubsub.asyncIterator(['POST_UPDATED'])
        }
      },

      commentAdded: {
        subscribe: (parent, { postId }) => {
          return pubsub.asyncIterator([`COMMENT_ADDED_${postId}`])
        },
        resolve: (payload, { postId }) => {
          if (payload.postId === postId) {
            return payload.commentAdded
          }
          return null
        }
      },

      notification: {
        subscribe: (parent, { userId }, context) => {
          if (!context.user || context.user.id !== userId) {
            throw new Error('Unauthorized')
          }
          return pubsub.asyncIterator([`NOTIFICATION_${userId}`])
        }
      }
    }
  }

  // 字段解析器
  getFieldResolvers() {
    return {
      User: {
        posts: async (user, args, context) => {
          return await this.dataSources.postAPI.getPostsByAuthor(user.id, args)
        },
        
        fullName: (user) => {
          return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
      },

      Post: {
        author: async (post, args, context) => {
          return await this.dataSources.userAPI.getUserById(post.authorId)
        },

        category: async (post, args, context) => {
          if (!post.categoryId) return null
          return await this.dataSources.categoryAPI.getCategoryById(post.categoryId)
        },

        tags: async (post, args, context) => {
          return await this.dataSources.tagAPI.getTagsByPostId(post.id)
        },

        comments: async (post, args, context) => {
          return await this.dataSources.commentAPI.getCommentsByPostId(post.id, args)
        },

        wordCount: (post) => {
          return post.content.split(/\s+/).length
        },

        readingTime: (post) => {
          const wordsPerMinute = 200
          const wordCount = post.content.split(/\s+/).length
          return Math.ceil(wordCount / wordsPerMinute)
        }
      },

      Comment: {
        author: async (comment, args, context) => {
          return await this.dataSources.userAPI.getUserById(comment.authorId)
        },

        post: async (comment, args, context) => {
          return await this.dataSources.postAPI.getPostById(comment.postId)
        },

        parent: async (comment, args, context) => {
          if (!comment.parentId) return null
          return await this.dataSources.commentAPI.getCommentById(comment.parentId)
        },

        replies: async (comment, args, context) => {
          return await this.dataSources.commentAPI.getReplies(comment.id, args)
        }
      },

      Category: {
        posts: async (category, args, context) => {
          return await this.dataSources.postAPI.getPostsByCategory(category.id, args)
        }
      },

      Tag: {
        posts: async (tag, args, context) => {
          return await this.dataSources.postAPI.getPostsByTag(tag.id, args)
        }
      },

      // 联合类型解析
      SearchResult: {
        __resolveType(obj) {
          if (obj.title && obj.content) {
            return 'Post'
          }
          if (obj.username && obj.email) {
            return 'User'
          }
          if (obj.name && obj.slug) {
            return 'Category'
          }
          return null
        }
      }
    }
  }

  // 获取所有解析器
  getAllResolvers() {
    return {
      Query: this.getQueryResolvers(),
      Mutation: this.getMutationResolvers(),
      Subscription: this.getSubscriptionResolvers(),
      ...this.getFieldResolvers()
    }
  }
}

// 数据源类
class DataSources {
  constructor() {
    this.userAPI = new UserAPI()
    this.postAPI = new PostAPI()
    this.commentAPI = new CommentAPI()
    this.categoryAPI = new CategoryAPI()
    this.tagAPI = new TagAPI()
    this.authAPI = new AuthAPI()
    this.searchAPI = new SearchAPI()
  }
}

// 上下文创建函数
function createContext({ req, connection }) {
  // WebSocket 连接（订阅）
  if (connection) {
    return {
      user: connection.context.user,
      dataSources: new DataSources()
    }
  }

  // HTTP 请求
  let user = null
  const authHeader = req.headers.authorization

  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      user = { id: decoded.userId, email: decoded.email }
    } catch (error) {
      // Token 无效，用户保持为 null
    }
  }

  return {
    user,
    dataSources: new DataSources()
  }
}

// 服务器设置
async function startServer() {
  const app = express()
  const httpServer = http.createServer(app)

  // 创建 GraphQL schema
  const dataSources = new DataSources()
  const resolvers = new GraphQLResolvers(dataSources)
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers.getAllResolvers()
  })

  // 创建 Apollo Server
  const server = new ApolloServer({
    schema,
    context: createContext,
    plugins: [
      // 查询复杂度分析
      {
        requestDidStart() {
          return {
            didResolveOperation({ request, document }) {
              const complexity = getComplexity({
                estimators: [
                  fieldExtensionsEstimator(),
                  simpleEstimator({ maximumComplexity: 1000 })
                ],
                schema,
                query: document,
                variables: request.variables
              })

              if (complexity > 1000) {
                throw new Error(`Query complexity ${complexity} exceeds maximum complexity 1000`)
              }
            }
          }
        }
      },
      
      // 查询深度限制
      {
        requestDidStart() {
          return {
            didResolveOperation({ request, document }) {
              const depth = depthLimit(10)
              depth(document)
            }
          }
        }
      }
    ],
    
    // 开发环境启用 GraphQL Playground
    introspection: process.env.NODE_ENV !== 'production',
    playground: process.env.NODE_ENV !== 'production'
  })

  await server.start()
  server.applyMiddleware({ app, path: '/graphql' })

  // WebSocket 服务器用于订阅
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
  })

  useServer(
    {
      schema,
      context: async (ctx) => {
        // WebSocket 认证
        const token = ctx.connectionParams?.authorization?.replace('Bearer ', '')
        let user = null

        if (token) {
          try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            user = { id: decoded.userId, email: decoded.email }
          } catch (error) {
            throw new Error('Invalid token')
          }
        }

        return {
          user,
          dataSources: new DataSources()
        }
      }
    },
    wsServer
  )

  const PORT = process.env.PORT || 4000
  httpServer.listen(PORT, () => {
    console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`)
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.graphqlPath}`)
  })
}

// 启动服务器
startServer().catch(error => {
  console.error('Error starting server:', error)
})
```

### 2. 数据加载器（DataLoader）

```javascript
// DataLoader 实现，解决 N+1 查询问题
const DataLoader = require('dataloader')

class DataLoaders {
  constructor(dataSources) {
    this.dataSources = dataSources
    
    // 用户数据加载器
    this.userLoader = new DataLoader(
      async (userIds) => {
        const users = await this.dataSources.userAPI.getUsersByIds(userIds)
        return userIds.map(id => users.find(user => user.id === id) || null)
      },
      {
        cache: true,
        maxBatchSize: 100
      }
    )
    
    // 文章数据加载器
    this.postLoader = new DataLoader(
      async (postIds) => {
        const posts = await this.dataSources.postAPI.getPostsByIds(postIds)
        return postIds.map(id => posts.find(post => post.id === id) || null)
      }
    )
    
    // 按作者加载文章
    this.postsByAuthorLoader = new DataLoader(
      async (authorIds) => {
        const postsByAuthor = await this.dataSources.postAPI.getPostsByAuthors(authorIds)
        return authorIds.map(authorId => postsByAuthor[authorId] || [])
      }
    )
    
    // 按文章加载评论
    this.commentsByPostLoader = new DataLoader(
      async (postIds) => {
        const commentsByPost = await this.dataSources.commentAPI.getCommentsByPosts(postIds)
        return postIds.map(postId => commentsByPost[postId] || [])
      }
    )
    
    // 按文章加载标签
    this.tagsByPostLoader = new DataLoader(
      async (postIds) => {
        const tagsByPost = await this.dataSources.tagAPI.getTagsByPosts(postIds)
        return postIds.map(postId => tagsByPost[postId] || [])
      }
    )
  }
  
  // 清除缓存
  clearCache() {
    this.userLoader.clearAll()
    this.postLoader.clearAll()
    this.postsByAuthorLoader.clearAll()
    this.commentsByPostLoader.clearAll()
    this.tagsByPostLoader.clearAll()
  }
  
  // 清除特定缓存
  clearUserCache(userId) {
    this.userLoader.clear(userId)
  }
  
  clearPostCache(postId) {
    this.postLoader.clear(postId)
  }
}

// 在上下文中使用 DataLoader
function createContextWithDataLoaders({ req, connection }) {
  const dataSources = new DataSources()
  const dataLoaders = new DataLoaders(dataSources)
  
  // ... 认证逻辑
  
  return {
    user,
    dataSources,
    dataLoaders
  }
}

// 在解析器中使用 DataLoader
const resolversWithDataLoader = {
  Post: {
    author: async (post, args, { dataLoaders }) => {
      return await dataLoaders.userLoader.load(post.authorId)
    },
    
    tags: async (post, args, { dataLoaders }) => {
      return await dataLoaders.tagsByPostLoader.load(post.id)
    },
    
    comments: async (post, args, { dataLoaders }) => {
      return await dataLoaders.commentsByPostLoader.load(post.id)
    }
  },
  
  User: {
    posts: async (user, args, { dataLoaders }) => {
      return await dataLoaders.postsByAuthorLoader.load(user.id)
    }
  },
  
  Comment: {
    author: async (comment, args, { dataLoaders }) => {
      return await dataLoaders.userLoader.load(comment.authorId)
    },
    
    post: async (comment, args, { dataLoaders }) => {
      return await dataLoaders.postLoader.load(comment.postId)
    }
  }
}
```

## 客户端实现

### 1. Apollo Client 实现

```javascript
// Apollo Client 配置
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

// HTTP 链接
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql'
})

// WebSocket 链接（用于订阅）
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('authToken')
      return {
        authorization: token ? `Bearer ${token}` : ''
      }
    }
  })
)

// 认证链接
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('authToken')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// 分割链接（HTTP 用于查询和变更，WebSocket 用于订阅）
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

// 创建 Apollo Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          posts: {
            keyArgs: ['filter'],
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges]
              }
            }
          }
        }
      },
      Post: {
        fields: {
          comments: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all'
    },
    query: {
      errorPolicy: 'all'
    }
  }
})

export default client
```

### 2. React Hooks 使用示例

```javascript
// GraphQL 查询和变更 Hooks
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client'
import { useState, useEffect } from 'react'

// 查询定义
const GET_POSTS = gql`
  query GetPosts($filter: PostFilter, $pagination: PaginationInput) {
    posts(filter: $filter, pagination: $pagination) {
      edges {
        node {
          id
          title
          excerpt
          status
          author {
            id
            username
            firstName
            lastName
          }
          category {
            id
            name
          }
          tags {
            id
            name
          }
          publishedAt
          createdAt
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      title
      content
      excerpt
      status
      author {
        id
        username
        firstName
        lastName
        email
      }
      category {
        id
        name
        description
      }
      tags {
        id
        name
      }
      comments {
        id
        content
        author {
          id
          username
        }
        createdAt
        replies {
          id
          content
          author {
            id
            username
          }
          createdAt
        }
      }
      publishedAt
      createdAt
      updatedAt
    }
  }
`

// 变更定义
const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      post {
        id
        title
        content
        status
        author {
          id
          username
        }
      }
      errors {
        message
        code
        field
      }
    }
  }
`

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      comment {
        id
        content
        author {
          id
          username
        }
        createdAt
      }
      errors {
        message
        code
        field
      }
    }
  }
`

// 订阅定义
const COMMENT_ADDED = gql`
  subscription CommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
      id
      content
      author {
        id
        username
      }
      createdAt
    }
  }
`

// React 组件示例
function PostList() {
  const [filter, setFilter] = useState({})
  const [hasMore, setHasMore] = useState(true)
  
  const { data, loading, error, fetchMore } = useQuery(GET_POSTS, {
    variables: {
      filter,
      pagination: { first: 10 }
    },
    notifyOnNetworkStatusChange: true
  })
  
  const loadMore = () => {
    if (!hasMore || loading) return
    
    fetchMore({
      variables: {
        pagination: {
          first: 10,
          after: data.posts.pageInfo.endCursor
        }
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        
        setHasMore(fetchMoreResult.posts.pageInfo.hasNextPage)
        
        return {
          posts: {
            ...fetchMoreResult.posts,
            edges: [
              ...prev.posts.edges,
              ...fetchMoreResult.posts.edges
            ]
          }
        }
      }
    })
  }
  
  if (loading && !data) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      <h1>Posts ({data?.posts.totalCount})</h1>
      
      {/* 过滤器 */}
      <div>
        <select 
          value={filter.status || ''} 
          onChange={(e) => setFilter({ ...filter, status: e.target.value || undefined })}
        >
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>
      
      {/* 文章列表 */}
      <div>
        {data?.posts.edges.map(({ node: post }) => (
          <div key={post.id} className="post-item">
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <div>
              <span>By {post.author.firstName} {post.author.lastName}</span>
              {post.category && <span> in {post.category.name}</span>}
              <span> on {new Date(post.publishedAt).toLocaleDateString()}</span>
            </div>
            <div>
              {post.tags.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* 加载更多 */}
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

function PostDetail({ postId }) {
  const { data, loading, error } = useQuery(GET_POST, {
    variables: { id: postId }
  })
  
  const [createComment] = useMutation(CREATE_COMMENT, {
    update(cache, { data: { createComment } }) {
      if (createComment.comment) {
        // 更新缓存
        const existingPost = cache.readQuery({
          query: GET_POST,
          variables: { id: postId }
        })
        
        if (existingPost) {
          cache.writeQuery({
            query: GET_POST,
            variables: { id: postId },
            data: {
              post: {
                ...existingPost.post,
                comments: [
                  ...existingPost.post.comments,
                  createComment.comment
                ]
              }
            }
          })
        }
      }
    }
  })
  
  // 订阅新评论
  useSubscription(COMMENT_ADDED, {
    variables: { postId },
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data) {
        // 评论已通过 mutation 的 update 函数处理
        console.log('New comment received:', subscriptionData.data.commentAdded)
      }
    }
  })
  
  const [commentContent, setCommentContent] = useState('')
  
  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!commentContent.trim()) return
    
    try {
      const { data } = await createComment({
        variables: {
          input: {
            postId,
            content: commentContent
          }
        }
      })
      
      if (data.createComment.errors.length === 0) {
        setCommentContent('')
      } else {
        console.error('Comment creation errors:', data.createComment.errors)
      }
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!data?.post) return <div>Post not found</div>
  
  const { post } = data
  
  return (
    <article>
      <header>
        <h1>{post.title}</h1>
        <div>
          <span>By {post.author.firstName} {post.author.lastName}</span>
          {post.category && <span> in {post.category.name}</span>}
          <span> on {new Date(post.publishedAt).toLocaleDateString()}</span>
        </div>
        <div>
          {post.tags.map(tag => (
            <span key={tag.id} className="tag">{tag.name}</span>
          ))}
        </div>
      </header>
      
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      
      <section>
        <h3>Comments ({post.comments.length})</h3>
        
        {/* 评论表单 */}
        <form onSubmit={handleSubmitComment}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows={4}
          />
          <button type="submit">Post Comment</button>
        </form>
        
        {/* 评论列表 */}
        <div>
          {post.comments.map(comment => (
            <div key={comment.id} className="comment">
              <div>
                <strong>{comment.author.username}</strong>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p>{comment.content}</p>
              
              {/* 回复 */}
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply">
                  <div>
                    <strong>{reply.author.username}</strong>
                    <span>{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p>{reply.content}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}

export { PostList, PostDetail }
```

## 性能优化

### 1. 查询优化

```javascript
// 查询复杂度分析和限制
const { costAnalysis, maximumCost } = require('graphql-cost-analysis')
const depthLimit = require('graphql-depth-limit')
const { createRateLimitRule } = require('graphql-rate-limit')

// 复杂度分析配置
const costAnalysisOptions = {
  maximumCost: 1000,
  defaultCost: 1,
  scalarCost: 1,
  objectCost: 1,
  listFactor: 10,
  introspectionCost: 1000,
  createError: (max, actual) => {
    return new Error(`Query cost ${actual} exceeds maximum cost ${max}`)
  }
}

// 查询深度限制
const depthLimitRule = depthLimit(10)

// 速率限制
const rateLimitRule = createRateLimitRule({
  identifyContext: (context) => context.user?.id || context.req.ip,
  formatError: ({ fieldName, max, window, count }) => {
    return new Error(`Rate limit exceeded for field ${fieldName}. Max: ${max}, Window: ${window}ms, Current: ${count}`)
  }
})

// 字段级别的速率限制
const fieldRateLimits = {
  Query: {
    posts: { max: 100, window: 60000 }, // 每分钟最多 100 次
    search: { max: 20, window: 60000 }   // 每分钟最多 20 次
  },
  Mutation: {
    createPost: { max: 10, window: 60000 },    // 每分钟最多创建 10 篇文章
    createComment: { max: 30, window: 60000 }   // 每分钟最多创建 30 条评论
  }
}

// 应用到 Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [
    depthLimitRule,
    rateLimitRule,
    costAnalysis(costAnalysisOptions)
  ],
  plugins: [
    {
      requestDidStart() {
        return {
          didResolveOperation({ request, document }) {
            // 自定义查询分析
            const operationName = request.operationName
            const queryComplexity = analyzeQueryComplexity(document)
            
            console.log(`Operation: ${operationName}, Complexity: ${queryComplexity}`)
            
            if (queryComplexity > 1000) {
              throw new Error('Query too complex')
            }
          }
        }
      }
    }
  ]
})
```

### 2. 缓存策略

```javascript
// Redis 缓存实现
const Redis = require('ioredis')
const redis = new Redis(process.env.REDIS_URL)

class GraphQLCache {
  constructor() {
    this.redis = redis
    this.defaultTTL = 300 // 5 分钟
  }
  
  // 生成缓存键
  generateCacheKey(operation, variables, userId) {
    const key = `graphql:${operation}:${JSON.stringify(variables)}`
    return userId ? `${key}:user:${userId}` : key
  }
  
  // 获取缓存
  async get(operation, variables, userId) {
    const key = this.generateCacheKey(operation, variables, userId)
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }
  
  // 设置缓存
  async set(operation, variables, userId, data, ttl = this.defaultTTL) {
    const key = this.generateCacheKey(operation, variables, userId)
    await this.redis.setex(key, ttl, JSON.stringify(data))
  }
  
  // 删除缓存
  async delete(pattern) {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
  
  // 清除用户相关缓存
  async clearUserCache(userId) {
    await this.delete(`graphql:*:user:${userId}`)
  }
  
  // 清除特定操作缓存
  async clearOperationCache(operation) {
    await this.delete(`graphql:${operation}:*`)
  }
}

// 缓存中间件
class CacheMiddleware {
  constructor() {
    this.cache = new GraphQLCache()
    this.cacheableOperations = new Set([
      'GetPosts',
      'GetPost',
      'GetUser',
      'GetCategories',
      'GetTags'
    ])
  }
  
  // 缓存解析器包装器
  wrapResolver(resolver, operation, ttl) {
    return async (parent, args, context, info) => {
      // 检查是否应该缓存
      if (!this.shouldCache(operation, context)) {
        return await resolver(parent, args, context, info)
      }
      
      // 尝试从缓存获取
      const cached = await this.cache.get(
        operation,
        args,
        context.user?.id
      )
      
      if (cached) {
        return cached
      }
      
      // 执行解析器
      const result = await resolver(parent, args, context, info)
      
      // 缓存结果
      if (result) {
        await this.cache.set(
          operation,
          args,
          context.user?.id,
          result,
          ttl
        )
      }
      
      return result
    }
  }
  
  shouldCache(operation, context) {
    // 不缓存已认证用户的个人数据
    if (operation === 'GetUser' && context.user) {
      return false
    }
    
    return this.cacheableOperations.has(operation)
  }
  
  // 缓存失效处理
  async invalidateCache(operation, relatedOperations = []) {
    await this.cache.clearOperationCache(operation)
    
    for (const related of relatedOperations) {
      await this.cache.clearOperationCache(related)
    }
  }
}

// 在解析器中使用缓存
const cacheMiddleware = new CacheMiddleware()

const cachedResolvers = {
  Query: {
    posts: cacheMiddleware.wrapResolver(
      async (parent, args, context) => {
        return await context.dataSources.postAPI.getPosts(args)
      },
      'GetPosts',
      600 // 10 分钟
    ),
    
    post: cacheMiddleware.wrapResolver(
      async (parent, { id }, context) => {
        return await context.dataSources.postAPI.getPostById(id)
      },
      'GetPost',
      1800 // 30 分钟
    )
  },
  
  Mutation: {
    createPost: async (parent, args, context) => {
      const result = await context.dataSources.postAPI.createPost(args.input)
      
      // 清除相关缓存
      await cacheMiddleware.invalidateCache('CreatePost', [
        'GetPosts',
        'GetPost'
      ])
      
      return result
    },
    
    updatePost: async (parent, { id, input }, context) => {
      const result = await context.dataSources.postAPI.updatePost(id, input)
      
      // 清除特定文章缓存
      await cacheMiddleware.cache.delete(`graphql:GetPost:*${id}*`)
      await cacheMiddleware.invalidateCache('UpdatePost', ['GetPosts'])
      
      return result
    }
  }
}
```

## 安全性

### 1. 查询安全

```javascript
// 查询安全措施
class GraphQLSecurity {
  // 查询白名单
  static queryWhitelist = new Set([
    'GetPosts',
    'GetPost',
    'GetUser',
    'CreatePost',
    'UpdatePost',
    'Login',
    'Register'
  ])
  
  // 验证查询是否在白名单中
  static validateQuery(operationName) {
    if (process.env.NODE_ENV === 'production') {
      if (!operationName || !this.queryWhitelist.has(operationName)) {
        throw new Error('Operation not allowed')
      }
    }
  }
  
  // 禁用内省（生产环境）
  static disableIntrospection() {
    return process.env.NODE_ENV === 'production'
  }
  
  // 字段级权限检查
  static checkFieldPermissions(fieldName, context) {
    const permissions = {
      'User.email': ['self', 'admin'],
      'User.password': ['never'],
      'Post.draft': ['author', 'admin'],
      'adminOnlyField': ['admin']
    }
    
    const requiredPermissions = permissions[fieldName]
    if (!requiredPermissions) return true
    
    if (requiredPermissions.includes('never')) {
      throw new Error('Field access denied')
    }
    
    if (requiredPermissions.includes('admin') && context.user?.role !== 'admin') {
      throw new Error('Admin access required')
    }
    
    if (requiredPermissions.includes('self') && !context.user) {
      throw new Error('Authentication required')
    }
    
    return true
  }
  
  // 输入验证
  static validateInput(input, rules) {
    const errors = []
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = input[field]
      
      if (rule.required && !value) {
        errors.push(`${field} is required`)
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field} exceeds maximum length`)
      }
      
      if (value && rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} format is invalid`)
      }
    })
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }
  }
  
  // SQL 注入防护
  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.replace(/[';"\\]/g, '')
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item))
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized = {}
      Object.keys(input).forEach(key => {
        sanitized[key] = this.sanitizeInput(input[key])
      })
      return sanitized
    }
    
    return input
  }
}

// 安全中间件
const securityMiddleware = {
  requestDidStart() {
    return {
      didResolveOperation({ request, document }) {
        // 验证操作名称
        GraphQLSecurity.validateQuery(request.operationName)
        
        // 记录查询日志
        console.log(`GraphQL Operation: ${request.operationName}`, {
          variables: request.variables,
          timestamp: new Date().toISOString()
        })
      },
      
      willSendResponse({ response, context }) {
        // 添加安全头
        if (context.res) {
          context.res.setHeader('X-Content-Type-Options', 'nosniff')
          context.res.setHeader('X-Frame-Options', 'DENY')
          context.res.setHeader('X-XSS-Protection', '1; mode=block')
        }
      }
    }
  }
}
```

## 测试

### GraphQL 测试示例

```javascript
// GraphQL 测试工具
const { createTestClient } = require('apollo-server-testing')
const { gql } = require('apollo-server-express')
const { ApolloServer } = require('apollo-server-express')

// 测试服务器设置
function createTestServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      user: req.user,
      dataSources: new MockDataSources()
    })
  })
  
  return createTestClient(server)
}

// 模拟数据源
class MockDataSources {
  constructor() {
    this.users = [
      { id: '1', username: 'testuser', email: 'test@example.com' }
    ]
    this.posts = [
      { id: '1', title: 'Test Post', content: 'Test content', authorId: '1' }
    ]
  }
  
  getUserById(id) {
    return this.users.find(user => user.id === id)
  }
  
  getPostById(id) {
    return this.posts.find(post => post.id === id)
  }
}

// 测试用例
describe('GraphQL API Tests', () => {
  let testClient
  
  beforeEach(() => {
    testClient = createTestServer()
  })
  
  describe('Queries', () => {
    test('should get user by ID', async () => {
      const GET_USER = gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
            email
          }
        }
      `
      
      const { data, errors } = await testClient.query({
        query: GET_USER,
        variables: { id: '1' }
      })
      
      expect(errors).toBeUndefined()
      expect(data.user).toEqual({
        id: '1',
        username: 'testuser',
        email: 'test@example.com'
      })
    })
    
    test('should get post with author', async () => {
      const GET_POST = gql`
        query GetPost($id: ID!) {
          post(id: $id) {
            id
            title
            content
            author {
              id
              username
            }
          }
        }
      `
      
      const { data, errors } = await testClient.query({
        query: GET_POST,
        variables: { id: '1' }
      })
      
      expect(errors).toBeUndefined()
      expect(data.post).toEqual({
        id: '1',
        title: 'Test Post',
        content: 'Test content',
        author: {
          id: '1',
          username: 'testuser'
        }
      })
    })
    
    test('should handle non-existent user', async () => {
      const GET_USER = gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            username
          }
        }
      `
      
      const { data, errors } = await testClient.query({
        query: GET_USER,
        variables: { id: '999' }
      })
      
      expect(errors).toBeUndefined()
      expect(data.user).toBeNull()
    })
  })
  
  describe('Mutations', () => {
    test('should create user', async () => {
      const CREATE_USER = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            user {
              id
              username
              email
            }
            errors {
              message
              code
              field
            }
          }
        }
      `
      
      const { data, errors } = await testClient.mutate({
        mutation: CREATE_USER,
        variables: {
          input: {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123'
          }
        }
      })
      
      expect(errors).toBeUndefined()
      expect(data.createUser.errors).toHaveLength(0)
      expect(data.createUser.user).toMatchObject({
        username: 'newuser',
        email: 'newuser@example.com'
      })
    })
    
    test('should handle validation errors', async () => {
      const CREATE_USER = gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            user {
              id
              username
            }
            errors {
              message
              code
              field
            }
          }
        }
      `
      
      const { data, errors } = await testClient.mutate({
        mutation: CREATE_USER,
        variables: {
          input: {
            username: '',
            email: 'invalid-email',
            password: '123'
          }
        }
      })
      
      expect(errors).toBeUndefined()
      expect(data.createUser.user).toBeNull()
      expect(data.createUser.errors.length).toBeGreaterThan(0)
    })
  })
  
  describe('Subscriptions', () => {
    test('should receive post creation events', (done) => {
      const POST_CREATED = gql`
        subscription PostCreated {
          postCreated {
            id
            title
            author {
              username
            }
          }
        }
      `
      
      const subscription = testClient.subscribe({
        query: POST_CREATED
      })
      
      subscription.subscribe({
        next: ({ data }) => {
          expect(data.postCreated).toBeDefined()
          expect(data.postCreated.title).toBe('New Post')
          done()
        },
        error: done
      })
      
      // 触发事件
      setTimeout(() => {
        pubsub.publish('POST_CREATED', {
          postCreated: {
            id: '2',
            title: 'New Post',
            author: { username: 'testuser' }
          }
        })
      }, 100)
    })
  })
  
  describe('Error Handling', () => {
    test('should handle authentication errors', async () => {
      const ME_QUERY = gql`
        query Me {
          me {
            id
            username
          }
        }
      `
      
      const { data, errors } = await testClient.query({
        query: ME_QUERY
      })
      
      expect(errors).toBeDefined()
      expect(errors[0].message).toContain('Authentication required')
    })
    
    test('should handle field-level errors', async () => {
      const GET_USER_EMAIL = gql`
        query GetUserEmail($id: ID!) {
          user(id: $id) {
            id
            username
            email
          }
        }
      `
      
      const { data, errors } = await testClient.query({
        query: GET_USER_EMAIL,
        variables: { id: '1' }
      })
      
      // 应该返回部分数据，但 email 字段有错误
      expect(data.user.id).toBe('1')
      expect(data.user.username).toBe('testuser')
      expect(errors).toBeDefined()
      expect(errors[0].path).toContain('email')
    })
  })
})
```

## 错误处理

### 1. 错误类型定义

```javascript
// 自定义错误类
class GraphQLError extends Error {
  constructor(message, code, extensions = {}) {
    super(message)
    this.name = 'GraphQLError'
    this.code = code
    this.extensions = extensions
  }
}

class ValidationError extends GraphQLError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', { field })
    this.name = 'ValidationError'
  }
}

class AuthenticationError extends GraphQLError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

class AuthorizationError extends GraphQLError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

class NotFoundError extends GraphQLError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', { resource, id })
    this.name = 'NotFoundError'
  }
}

// 错误格式化
function formatError(error) {
  // 记录错误
  console.error('GraphQL Error:', {
    message: error.message,
    code: error.extensions?.code,
    path: error.path,
    locations: error.locations,
    stack: error.stack
  })
  
  // 生产环境隐藏敏感信息
  if (process.env.NODE_ENV === 'production') {
    if (error.extensions?.code === 'INTERNAL_ERROR') {
      return new Error('Internal server error')
    }
  }
  
  return {
    message: error.message,
    code: error.extensions?.code || 'UNKNOWN_ERROR',
    path: error.path,
    locations: error.locations,
    extensions: error.extensions
  }
}
```

### 2. 错误处理中间件

```javascript
// 错误处理解析器包装器
function withErrorHandling(resolver) {
  return async (parent, args, context, info) => {
    try {
      return await resolver(parent, args, context, info)
    } catch (error) {
      // 数据库错误
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ValidationError('Duplicate entry', 'unique_constraint')
      }
      
      // 网络错误
      if (error.code === 'ECONNREFUSED') {
        throw new GraphQLError('Service unavailable', 'SERVICE_UNAVAILABLE')
      }
      
      // 重新抛出已知错误
      if (error instanceof GraphQLError) {
        throw error
      }
      
      // 未知错误
      throw new GraphQLError('Internal server error', 'INTERNAL_ERROR')
    }
  }
}

// 应用错误处理
const errorHandledResolvers = {
  Query: {
    user: withErrorHandling(async (parent, { id }, context) => {
      const user = await context.dataSources.userAPI.getUserById(id)
      if (!user) {
        throw new NotFoundError('User', id)
      }
      return user
    }),
    
    me: withErrorHandling(async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      return await context.dataSources.userAPI.getUserById(context.user.id)
    })
  },
  
  Mutation: {
    createPost: withErrorHandling(async (parent, { input }, context) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      
      // 输入验证
      if (!input.title || input.title.trim().length === 0) {
        throw new ValidationError('Title is required', 'title')
      }
      
      if (input.title.length > 200) {
        throw new ValidationError('Title too long', 'title')
      }
      
      return await context.dataSources.postAPI.createPost({
        ...input,
        authorId: context.user.id
      })
    })
  }
}
```

## 最佳实践

### 1. Schema 设计原则

```graphql
# 1. 使用描述性的类型和字段名
type BlogPost {  # 而不是 Post
  id: ID!
  title: String!
  publishedAt: DateTime  # 而不是 published
  isPublished: Boolean!  # 布尔字段使用 is/has 前缀
}

# 2. 使用枚举而不是字符串
enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

# 3. 为复杂查询提供过滤和排序
input PostFilter {
  status: PostStatus
  authorId: ID
  categoryId: ID
  publishedAfter: DateTime
  publishedBefore: DateTime
  search: String
}

input PostSort {
  field: PostSortField!
  direction: SortDirection!
}

# 4. 使用连接模式进行分页
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

# 5. 为变更提供丰富的返回类型
type CreatePostPayload {
  post: Post
  errors: [UserError!]!
  clientMutationId: String
}

# 6. 使用接口和联合类型
interface Node {
  id: ID!
}

type User implements Node {
  id: ID!
  # ... 其他字段
}

type Post implements Node {
  id: ID!
  # ... 其他字段
}

union SearchResult = User | Post | Category
```

### 2. 性能优化策略

```javascript
// 1. 使用 DataLoader 解决 N+1 问题
class OptimizedResolvers {
  constructor(dataLoaders) {
    this.dataLoaders = dataLoaders
  }
  
  // 批量加载用户
  async getUsers(userIds) {
    return await this.dataLoaders.userLoader.loadMany(userIds)
  }
  
  // 预加载相关数据
  async getPostsWithAuthors(postIds) {
    const posts = await this.dataLoaders.postLoader.loadMany(postIds)
    const authorIds = posts.map(post => post.authorId)
    const authors = await this.dataLoaders.userLoader.loadMany(authorIds)
    
    return posts.map(post => ({
      ...post,
      author: authors.find(author => author.id === post.authorId)
    }))
  }
}

// 2. 查询优化
class QueryOptimizer {
  // 分析查询字段
  static analyzeQuery(info) {
    const selections = info.fieldNodes[0].selectionSet.selections
    const requestedFields = selections.map(selection => selection.name.value)
    return requestedFields
  }
  
  // 条件加载
  static async loadConditionally(info, loader, fallback) {
    const fields = this.analyzeQuery(info)
    
    if (fields.includes('author')) {
      return await loader()
    }
    
    return fallback
  }
}

// 3. 缓存策略
class CacheStrategy {
  static getCacheTTL(operationType, fieldName) {
    const cacheTTLs = {
      Query: {
        posts: 300,      // 5 分钟
        post: 1800,      // 30 分钟
        user: 600,       // 10 分钟
        categories: 3600 // 1 小时
      },
      Mutation: {
        // 变更操作不缓存
      }
    }
    
    return cacheTTLs[operationType]?.[fieldName] || 0
  }
  
  static shouldCache(context, operationType) {
    // 不缓存已认证用户的个人数据
    if (context.user && operationType === 'me') {
      return false
    }
    
    // 不缓存实时数据
    if (operationType.includes('live') || operationType.includes('real-time')) {
      return false
    }
    
    return true
  }
}
```

### 3. 安全最佳实践

```javascript
// 1. 输入验证和清理
class InputValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email')
    }
  }
  
  static validatePassword(password) {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters', 'password')
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain uppercase, lowercase and number', 'password')
    }
  }
  
  static sanitizeHtml(html) {
    // 使用 DOMPurify 或类似库清理 HTML
    return DOMPurify.sanitize(html)
  }
  
  static validateFileUpload(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type', 'file')
    }
    
    if (file.size > maxSize) {
      throw new ValidationError('File too large', 'file')
    }
  }
}

// 2. 权限控制
class PermissionChecker {
  static canReadPost(post, user) {
    // 公开文章任何人都可以读
    if (post.status === 'PUBLISHED') {
      return true
    }
    
    // 草稿只有作者和管理员可以读
    if (post.status === 'DRAFT') {
      return user && (user.id === post.authorId || user.role === 'admin')
    }
    
    return false
  }
  
  static canEditPost(post, user) {
    if (!user) return false
    
    // 作者和管理员可以编辑
    return user.id === post.authorId || user.role === 'admin'
  }
  
  static canDeletePost(post, user) {
    if (!user) return false
    
    // 只有管理员可以删除
    return user.role === 'admin'
  }
}

// 3. 速率限制
class RateLimiter {
  constructor() {
    this.requests = new Map()
  }
  
  checkLimit(identifier, limit, window) {
    const now = Date.now()
    const windowStart = now - window
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }
    
    const userRequests = this.requests.get(identifier)
    
    // 清理过期请求
    const validRequests = userRequests.filter(time => time > windowStart)
    
    if (validRequests.length >= limit) {
      throw new GraphQLError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED')
    }
    
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
  }
}
```

## 监控和调试

### 1. 性能监控

```javascript
// 性能监控插件
const performanceMonitoringPlugin = {
  requestDidStart() {
    const startTime = Date.now()
    
    return {
      didResolveOperation({ request, document }) {
        console.log(`Operation: ${request.operationName} started`)
      },
      
      didEncounterErrors({ errors }) {
        errors.forEach(error => {
          console.error('GraphQL Error:', {
            message: error.message,
            path: error.path,
            extensions: error.extensions
          })
        })
      },
      
      willSendResponse({ response }) {
        const duration = Date.now() - startTime
        
        console.log(`Operation completed in ${duration}ms`)
        
        // 记录慢查询
        if (duration > 1000) {
          console.warn(`Slow query detected: ${duration}ms`)
        }
        
        // 添加性能头
        response.http.headers.set('X-Response-Time', `${duration}ms`)
      }
    }
  }
}

// 查询复杂度监控
const complexityMonitoringPlugin = {
  requestDidStart() {
    return {
      didResolveOperation({ request, document }) {
        const complexity = calculateComplexity(document)
        
        console.log(`Query complexity: ${complexity}`)
        
        if (complexity > 500) {
          console.warn(`High complexity query: ${complexity}`)
        }
      }
    }
  }
}
```

### 2. 调试工具

```javascript
// GraphQL 调试工具
class GraphQLDebugger {
  static logQuery(operationName, variables, context) {
    console.log('GraphQL Query:', {
      operation: operationName,
      variables,
      user: context.user?.id,
      timestamp: new Date().toISOString()
    })
  }
  
  static logResolver(fieldName, args, result) {
    console.log(`Resolver ${fieldName}:`, {
      args,
      resultType: typeof result,
      resultLength: Array.isArray(result) ? result.length : undefined
    })
  }
  
  static analyzeDataLoaderUsage(dataLoaders) {
    Object.keys(dataLoaders).forEach(loaderName => {
      const loader = dataLoaders[loaderName]
      console.log(`DataLoader ${loaderName}:`, {
        cacheSize: loader._cache.size,
        cacheHitRatio: loader._cacheHits / (loader._cacheHits + loader._cacheMisses)
      })
    })
  }
}

// 开发环境调试中间件
const debugMiddleware = {
  requestDidStart() {
    return {
      didResolveOperation({ request, document, context }) {
        if (process.env.NODE_ENV === 'development') {
          GraphQLDebugger.logQuery(request.operationName, request.variables, context)
        }
      }
    }
  }
}
```

## 参考资源

### 官方文档
- [GraphQL 官方规范](https://graphql.org/learn/)
- [Apollo Server 文档](https://www.apollographql.com/docs/apollo-server/)
- [Apollo Client 文档](https://www.apollographql.com/docs/react/)

### 工具和库
- **服务器端**：Apollo Server, GraphQL Yoga, Mercurius
- **客户端**：Apollo Client, Relay, urql
- **工具**：GraphQL Playground, GraphiQL, Apollo Studio
- **代码生成**：GraphQL Code Generator

### 最佳实践文章
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Production Ready GraphQL](https://book.productionreadygraphql.com/)
- [Apollo GraphQL Guide](https://www.apollographql.com/docs/)

### 社区资源
- [GraphQL Weekly](https://graphqlweekly.com/)
- [GraphQL 中文社区](https://graphql.cn/)
- [Awesome GraphQL](https://github.com/chentsulin/awesome-graphql)

这个 GraphQL 指南涵盖了从基础概念到高级实践的完整内容，包括 Schema 设计、服务器实现、客户端使用、性能优化、安全性、测试、错误处理和监控调试等方面，为开发者提供了全面的 GraphQL API 开发参考。