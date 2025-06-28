# NextJS

## 简介

Next.js 是一个基于 React 的全栈 Web 应用框架，由 Vercel 开发和维护。它提供了生产级别的功能，如服务端渲染 (SSR)、静态站点生成 (SSG)、API 路由等，让开发者能够快速构建高性能的 Web 应用。

### 核心特性

- **零配置**: 开箱即用，无需复杂配置
- **混合渲染**: 支持 SSR、SSG、ISR 和 CSR
- **文件系统路由**: 基于文件结构的自动路由
- **API 路由**: 内置 API 端点支持
- **性能优化**: 自动代码分割、图片优化等
- **TypeScript 支持**: 原生 TypeScript 支持
- **CSS 支持**: 支持 CSS Modules、Sass、CSS-in-JS

## 安装与项目创建

### 创建新项目

```bash
# 使用 create-next-app
npx create-next-app@latest my-app
cd my-app
npm run dev

# 使用 TypeScript
npx create-next-app@latest my-app --typescript

# 使用 App Router (推荐)
npx create-next-app@latest my-app --app
```

### 手动安装

```bash
npm install next@latest react@latest react-dom@latest
```

```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 项目结构

### App Router (Next.js 13+)

```
my-app/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── about/
│   │   └── page.tsx
│   └── api/
│       └── users/
│           └── route.ts
├── public/
├── next.config.js
└── package.json
```

### Pages Router (传统方式)

```
my-app/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.tsx
│   ├── about.tsx
│   └── api/
│       └── users.ts
├── public/
├── styles/
├── next.config.js
└── package.json
```

## 路由系统

### App Router

#### 基础路由

```tsx
// app/page.tsx - 首页
export default function HomePage() {
  return <h1>Welcome to Next.js!</h1>
}

// app/about/page.tsx - /about 页面
export default function AboutPage() {
  return <h1>About Us</h1>
}

// app/blog/[slug]/page.tsx - 动态路由
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Blog Post: {params.slug}</h1>
}
```

#### 布局组件

```tsx
// app/layout.tsx - 根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>Navigation</nav>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  )
}

// app/blog/layout.tsx - 嵌套布局
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="blog-layout">
      <aside>Blog Sidebar</aside>
      <div>{children}</div>
    </div>
  )
}
```

#### 路由组和并行路由

```tsx
// app/dashboard/@analytics/page.tsx
export default function Analytics() {
  return <div>Analytics Dashboard</div>
}

// app/dashboard/@team/page.tsx
export default function Team() {
  return <div>Team Dashboard</div>
}

// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div>
      {children}
      {analytics}
      {team}
    </div>
  )
}
```

### Pages Router

```tsx
// pages/index.tsx
export default function Home() {
  return <h1>Home Page</h1>
}

// pages/blog/[slug].tsx
import { useRouter } from 'next/router'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query
  
  return <h1>Blog Post: {slug}</h1>
}

// pages/blog/[...slug].tsx - 捕获所有路由
export default function CatchAll() {
  const router = useRouter()
  const { slug } = router.query
  
  return <h1>Path: {Array.isArray(slug) ? slug.join('/') : slug}</h1>
}
```

## 渲染模式

### 静态站点生成 (SSG)

```tsx
// 静态生成
export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts').then(res => res.json())
  
  return posts.map((post: any) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`)
    .then(res => res.json())
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  )
}
```

### 服务端渲染 (SSR)

```tsx
// App Router - 默认是 SSR
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store' // 禁用缓存，确保每次都是最新数据
  })
  const result = await data.json()
  
  return <div>{result.message}</div>
}

// Pages Router
export async function getServerSideProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()
  
  return {
    props: { data }
  }
}

export default function Page({ data }: { data: any }) {
  return <div>{data.message}</div>
}
```

### 增量静态再生 (ISR)

```tsx
// App Router
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 } // 60秒后重新验证
  })
  const result = await data.json()
  
  return <div>{result.message}</div>
}

// Pages Router
export async function getStaticProps() {
  const res = await fetch('https://api.example.com/data')
  const data = await res.json()
  
  return {
    props: { data },
    revalidate: 60 // 60秒后重新生成
  }
}
```

## API 路由

### App Router API

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await fetch('https://api.example.com/users')
  const data = await users.json()
  
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // 处理创建用户逻辑
  const newUser = await createUser(body)
  
  return NextResponse.json(newUser, { status: 201 })
}

// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserById(params.id)
  
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }
  
  return NextResponse.json(user)
}
```

### Pages Router API

```tsx
// pages/api/users.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const users = await fetch('https://api.example.com/users')
    const data = await users.json()
    res.status(200).json(data)
  } else if (req.method === 'POST') {
    const newUser = await createUser(req.body)
    res.status(201).json(newUser)
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
```

## 数据获取

### 客户端数据获取

```tsx
'use client'

import { useState, useEffect } from 'react'

export default function ClientComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <div>Loading...</div>
  
  return <div>{JSON.stringify(data)}</div>
}
```

### 使用 SWR

```tsx
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Profile() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher)
  
  if (error) return <div>Failed to load</div>
  if (isLoading) return <div>Loading...</div>
  
  return <div>Hello {data.name}!</div>
}
```

## 样式处理

### CSS Modules

```css
/* styles/Home.module.css */
.container {
  padding: 0 2rem;
}

.main {
  min-height: 100vh;
  padding: 4rem 0;
}
```

```tsx
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1>Welcome to Next.js!</h1>
      </main>
    </div>
  )
}
```

### Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600">
          Welcome to Next.js!
        </h1>
      </main>
    </div>
  )
}
```

### Styled Components

```tsx
import styled from 'styled-components'

const Container = styled.div`
  padding: 0 2rem;
  min-height: 100vh;
`

const Title = styled.h1`
  font-size: 2rem;
  color: #0070f3;
`

export default function Home() {
  return (
    <Container>
      <Title>Welcome to Next.js!</Title>
    </Container>
  )
}
```

## 性能优化

### 图片优化

```tsx
import Image from 'next/image'

export default function Profile() {
  return (
    <div>
      <Image
        src="/profile.jpg"
        alt="Profile"
        width={500}
        height={500}
        priority // 优先加载
        placeholder="blur" // 模糊占位符
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
      />
    </div>
  )
}
```

### 字体优化

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

### 代码分割

```tsx
import dynamic from 'next/dynamic'

// 动态导入组件
const DynamicComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // 禁用服务端渲染
})

export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <DynamicComponent />
    </div>
  )
}
```

## 中间件

```tsx
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查认证
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 添加自定义头部
  const response = NextResponse.next()
  response.headers.set('X-Custom-Header', 'value')
  
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

## 环境变量

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
// 服务端使用
const dbUrl = process.env.DATABASE_URL

// 客户端使用 (需要 NEXT_PUBLIC_ 前缀)
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

## 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

### 自定义服务器部署

```bash
# 构建应用
npm run build

# 启动生产服务器
npm start
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 最佳实践

### 项目结构组织

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── analytics/
│   └── settings/
├── components/
│   ├── ui/
│   └── forms/
├── lib/
│   ├── utils.ts
│   └── db.ts
└── types/
    └── index.ts
```

### 性能优化建议

1. **使用适当的渲染策略**
   - 静态内容使用 SSG
   - 动态内容使用 SSR
   - 实时数据使用 CSR

2. **优化图片和字体**
   - 使用 Next.js Image 组件
   - 预加载关键字体
   - 使用 WebP 格式

3. **代码分割**
   - 动态导入大型组件
   - 路由级别的代码分割
   - 第三方库的按需加载

### SEO 优化

```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Page Title',
  description: 'Page description for SEO',
  keywords: ['nextjs', 'react', 'seo'],
  openGraph: {
    title: 'My Page Title',
    description: 'Page description for social media',
    images: ['/og-image.jpg'],
  },
}

export default function Page() {
  return <div>Content</div>
}
```

## 常见问题

### 1. 水合错误 (Hydration Error)

**问题**: 服务端和客户端渲染不一致

**解决方案**:
```tsx
import { useEffect, useState } from 'react'

export default function ClientOnlyComponent() {
  const [hasMounted, setHasMounted] = useState(false)
  
  useEffect(() => {
    setHasMounted(true)
  }, [])
  
  if (!hasMounted) {
    return null
  }
  
  return <div>{new Date().toLocaleString()}</div>
}
```

### 2. 静态导出问题

**问题**: 使用了不支持静态导出的功能

**解决方案**:
```js
// next.config.js
module.exports = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}
```

### 3. API 路由 CORS 问题

**解决方案**:
```tsx
import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ message: 'Hello' })
  
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}
```

## 参考资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [Next.js 示例](https://github.com/vercel/next.js/tree/canary/examples)
- [Vercel 部署文档](https://vercel.com/docs)
- [Next.js 学习课程](https://nextjs.org/learn)

## 总结

Next.js 是一个功能强大的 React 框架，提供了完整的全栈开发解决方案。通过其丰富的功能如 SSR、SSG、API 路由等，开发者可以构建高性能、SEO 友好的现代 Web 应用。掌握 Next.js 的核心概念和最佳实践，能够显著提升开发效率和应用性能。
