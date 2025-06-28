# React Router

## 简介

React Router 是 React 应用程序的标准路由库。它使你的 UI 与 URL 保持同步，提供了强大的路由功能，包括动态路由匹配、嵌套路由、历史管理等。

### 版本说明

- **React Router v6**：当前主流版本，API 更简洁，性能更好
- **React Router v5**：旧版本，仍在维护中

### 核心概念

- **Router**：路由器组件，为应用提供路由功能
- **Route**：路由组件，定义路径与组件的映射关系
- **Link**：导航链接组件，用于页面跳转
- **Navigate**：编程式导航组件

## 安装与基本配置

### 安装

```bash
npm install react-router-dom
# 或
yarn add react-router-dom
```

### 基本设置

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## 路由配置

### 基础路由

```jsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

### 嵌套路由

```jsx
import { Routes, Route, Outlet } from 'react-router-dom';

// 父组件
function Products() {
  return (
    <div>
      <h1>Products</h1>
      <nav>
        <Link to="featured">Featured</Link>
        <Link to="new">New</Link>
      </nav>
      <Outlet /> {/* 子路由渲染位置 */}
    </div>
  );
}

// 路由配置
function App() {
  return (
    <Routes>
      <Route path="/products" element={<Products />}>
        <Route path="featured" element={<FeaturedProducts />} />
        <Route path="new" element={<NewProducts />} />
        <Route index element={<AllProducts />} /> {/* 默认子路由 */}
      </Route>
    </Routes>
  );
}
```

### 路由参数

```jsx
import { useParams, useSearchParams } from 'react-router-dom';

// URL 参数
function ProductDetail() {
  const { id } = useParams();
  
  return <div>Product ID: {id}</div>;
}

// 查询参数
function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const sort = searchParams.get('sort');
  
  const updateFilters = (newCategory) => {
    setSearchParams({ category: newCategory, sort });
  };
  
  return (
    <div>
      <p>Category: {category}</p>
      <p>Sort: {sort}</p>
      <button onClick={() => updateFilters('electronics')}>
        Electronics
      </button>
    </div>
  );
}
```

## 导航

### 声明式导航

```jsx
import { Link, NavLink } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      {/* 基本链接 */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      
      {/* 带状态的链接 */}
      <NavLink 
        to="/products" 
        className={({ isActive }) => isActive ? 'active' : ''}
      >
        Products
      </NavLink>
      
      {/* 相对链接 */}
      <Link to="../parent">Go to Parent</Link>
      <Link to="child">Go to Child</Link>
    </nav>
  );
}
```

### 编程式导航

```jsx
import { useNavigate, Navigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      setIsLoggedIn(true);
      // 导航到仪表板
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  // 条件重定向
  if (isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <form onSubmit={handleLogin}>
      {/* 表单内容 */}
      <button type="button" onClick={() => navigate(-1)}>
        Go Back
      </button>
    </form>
  );
}
```

## 路由守卫

### 私有路由

```jsx
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isAuthenticated = useAuth(); // 自定义 hook
  const location = useLocation();
  
  if (!isAuthenticated) {
    // 重定向到登录页，并保存当前位置
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

// 使用私有路由
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}
```

### 角色权限路由

```jsx
function RoleBasedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

// 使用
<Route path="/admin" element={
  <RoleBasedRoute requiredRole="admin">
    <AdminPanel />
  </RoleBasedRoute>
} />
```

## 数据加载

### 使用 loader (React Router v6.4+)

```jsx
import { createBrowserRouter, useLoaderData } from 'react-router-dom';

// 数据加载函数
async function productLoader({ params }) {
  const product = await fetch(`/api/products/${params.id}`);
  if (!product.ok) {
    throw new Response('Product not found', { status: 404 });
  }
  return product.json();
}

// 组件
function ProductDetail() {
  const product = useLoaderData();
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
}

// 路由配置
const router = createBrowserRouter([
  {
    path: '/products/:id',
    element: <ProductDetail />,
    loader: productLoader,
    errorElement: <ErrorPage />
  }
]);
```

### 错误处理

```jsx
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';

function ErrorPage() {
  const error = useRouteError();
  
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>{error.status} {error.statusText}</h1>
        <p>{error.data}</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Oops! Something went wrong</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

## 高级特性

### 代码分割与懒加载

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// 懒加载组件
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Products = lazy(() => import('./components/Products'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products/*" element={<Products />} />
      </Routes>
    </Suspense>
  );
}
```

### 路由动画

```jsx
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <Home />
          </motion.div>
        } />
        {/* 其他路由 */}
      </Routes>
    </AnimatePresence>
  );
}
```

## 最佳实践

### 路由结构设计

```jsx
// 推荐的路由结构
const routes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      {
        path: 'products',
        element: <ProductsLayout />,
        children: [
          { index: true, element: <ProductList /> },
          { path: ':id', element: <ProductDetail /> },
          { path: 'new', element: <NewProduct /> }
        ]
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'users', element: <UserManagement /> }
    ]
  }
];
```

### 自定义 Hooks

```jsx
// 面包屑导航 Hook
function useBreadcrumbs() {
  const location = useLocation();
  
  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter(x => x);
    return pathnames.map((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      return { name, path: routeTo };
    });
  }, [location]);
  
  return breadcrumbs;
}

// 查询参数 Hook
function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const setQueryParam = useCallback((key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);
  
  return {
    queryParams: Object.fromEntries(searchParams),
    setQueryParam
  };
}
```

### 性能优化

1. **路由懒加载**：使用 `React.lazy()` 进行代码分割
2. **预加载**：在用户可能访问的路由上使用预加载
3. **缓存策略**：合理使用 loader 缓存
4. **避免不必要的重渲染**：使用 `React.memo` 包装路由组件

## 常见问题

### 路由不匹配

```jsx
// 问题：路由顺序影响匹配
// 错误示例
<Routes>
  <Route path="/users/:id" element={<UserDetail />} />
  <Route path="/users/new" element={<NewUser />} /> {/* 永远不会匹配 */}
</Routes>

// 正确示例
<Routes>
  <Route path="/users/new" element={<NewUser />} />
  <Route path="/users/:id" element={<UserDetail />} />
</Routes>
```

### 嵌套路由问题

```jsx
// 问题：忘记添加 Outlet
// 错误示例
function Layout() {
  return (
    <div>
      <Header />
      {/* 缺少 <Outlet /> */}
      <Footer />
    </div>
  );
}

// 正确示例
function Layout() {
  return (
    <div>
      <Header />
      <Outlet /> {/* 子路由渲染位置 */}
      <Footer />
    </div>
  );
}
```

### 状态丢失问题

```jsx
// 问题：路由切换时状态丢失
// 解决方案：使用状态管理或 sessionStorage
function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  });
  
  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);
  
  return [state, setState];
}
```

## 从 v5 迁移到 v6

### 主要变化

```jsx
// v5 写法
import { Switch, Route, useHistory } from 'react-router-dom';

function App() {
  const history = useHistory();
  
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
    </Switch>
  );
}

// v6 写法
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
```

### 迁移步骤

1. 将 `Switch` 替换为 `Routes`
2. 将 `component` 和 `render` 替换为 `element`
3. 移除 `exact` 属性（v6 默认精确匹配）
4. 将 `useHistory` 替换为 `useNavigate`
5. 更新嵌套路由语法

## 参考资源

- [React Router 官方文档](https://reactrouter.com/)
- [React Router v6 迁移指南](https://reactrouter.com/upgrading/v5)
- [React Router 教程](https://reactrouter.com/start/tutorial)
- [React Router GitHub](https://github.com/remix-run/react-router)

## 总结

React Router 是构建 React 单页应用的重要工具，提供了强大而灵活的路由功能。通过合理使用其特性，可以构建出用户体验良好、性能优秀的应用程序。在使用过程中，要注意路由设计的合理性、性能优化和错误处理，确保应用的稳定性和可维护性。
