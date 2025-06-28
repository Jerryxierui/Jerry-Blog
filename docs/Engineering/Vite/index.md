---
outline: deep
---

# Vite 下一代前端构建工具

## 简介

Vite 是一个由 Vue.js 作者尤雨溪开发的下一代前端构建工具。它利用浏览器原生 ES 模块支持和现代 JavaScript 工具（如 esbuild）来提供极快的开发体验。Vite 在开发环境中使用原生 ES 模块，在生产环境中使用 Rollup 进行打包。

Vite 的名字来源于法语单词 "vite"，意思是 "快速"，这正体现了它的核心特性。

## 特性

- **极速的服务启动**：利用原生 ES 模块，无需打包即可启动
- **闪电般的热更新**：基于 ES 模块的 HMR，更新速度与应用大小无关
- **丰富的功能**：开箱即用的 TypeScript、JSX、CSS 等支持
- **优化的构建**：预配置的 Rollup 构建，输出高度优化的静态资源
- **通用的插件**：在开发和构建之间共享 Rollup-superset 插件接口
- **完全类型化的 API**：灵活的 API 和完整的 TypeScript 类型
- **框架无关**：支持 Vue、React、Preact、Svelte 等多种框架
- **现代化**：默认支持现代浏览器，可选择性支持传统浏览器

## 安装和快速开始

### 创建新项目

```bash
# npm
npm create vite@latest my-project
cd my-project
npm install
npm run dev

# yarn
yarn create vite my-project
cd my-project
yarn
yarn dev

# pnpm
pnpm create vite my-project
cd my-project
pnpm install
pnpm dev
```

### 选择模板

```bash
# 指定模板
npm create vite@latest my-vue-app -- --template vue
npm create vite@latest my-react-app -- --template react
npm create vite@latest my-preact-app -- --template preact
npm create vite@latest my-svelte-app -- --template svelte
npm create vite@latest my-vanilla-app -- --template vanilla

# TypeScript 模板
npm create vite@latest my-vue-ts-app -- --template vue-ts
npm create vite@latest my-react-ts-app -- --template react-ts
```

### 手动安装

```bash
# 安装 Vite
npm install --save-dev vite

# 创建基本文件结构
mkdir src
echo 'console.log("Hello Vite!")' > src/main.js
echo '<!DOCTYPE html><html><head><title>Vite App</title></head><body><script type="module" src="/src/main.js"></script></body></html>' > index.html
```

### package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "vite preview"
  }
}
```

## 基础配置

### vite.config.js

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 根目录
  root: process.cwd(),
  
  // 基础公共路径
  base: '/',
  
  // 静态资源服务的文件夹
  publicDir: 'public',
  
  // 存储缓存文件的目录
  cacheDir: 'node_modules/.vite',
  
  // 开发服务器配置
  server: {
    host: 'localhost',
    port: 3000,
    open: true,
    cors: true,
    strictPort: false
  },
  
  // 构建配置
  build: {
    target: 'modules',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'components': resolve(__dirname, 'src/components')
    }
  },
  
  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0')
  }
});
```

### TypeScript 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import type { UserConfig } from 'vite';

export default defineConfig({
  // 配置选项
} as UserConfig);

// 条件配置
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // 开发环境配置
      server: {
        port: 3000
      }
    };
  } else {
    return {
      // 生产环境配置
      build: {
        minify: 'terser'
      }
    };
  }
});
```

## 开发服务器

### 服务器配置

```javascript
export default defineConfig({
  server: {
    // 指定服务器主机名
    host: '0.0.0.0', // 或者 true 设置为 0.0.0.0
    
    // 指定开发服务器端口
    port: 3000,
    
    // 设为 true 时若端口已被占用则会直接退出
    strictPort: false,
    
    // 服务器启动时自动在浏览器中打开应用程序
    open: true,
    
    // 为开发服务器配置 CORS
    cors: true,
    
    // 设置为 true 强制预依赖
    force: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true
      }
    },
    
    // 中间件配置
    middlewareMode: false,
    
    // 文件系统严格性
    fs: {
      strict: true,
      allow: ['..'],
      deny: ['.env', '.env.*', '*.{pem,crt}']
    },
    
    // 预热文件
    warmup: {
      clientFiles: ['./src/components/*.vue']
    }
  }
});
```

### 热模块替换 (HMR)

```javascript
// 在应用代码中使用 HMR API
if (import.meta.hot) {
  // 接受自身更新
  import.meta.hot.accept();
  
  // 接受依赖更新
  import.meta.hot.accept('./dep.js', (newDep) => {
    // 处理更新
  });
  
  // 处理更新
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // 更新逻辑
    }
  });
  
  // 自定义事件
  import.meta.hot.on('custom-event', (data) => {
    console.log('Custom event received:', data);
  });
  
  // 发送自定义事件
  import.meta.hot.send('custom-event', { message: 'Hello' });
  
  // 清理副作用
  import.meta.hot.dispose((data) => {
    // 清理逻辑
    data.cleanup = () => {
      // 清理函数
    };
  });
}

// Vue 3 HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  
  // Vue 组件热更新
  import.meta.hot.accept('./Component.vue', (newModule) => {
    // Vue 会自动处理组件更新
  });
}

// React HMR
if (import.meta.hot) {
  import.meta.hot.accept();
  
  // React Fast Refresh
  import.meta.hot.accept('./App.jsx', () => {
    // React 会自动处理组件更新
  });
}
```

## 静态资源处理

### 导入静态资源

```javascript
// 导入资源作为 URL
import imgUrl from './img.png';
document.getElementById('hero-img').src = imgUrl;

// 显式加载资源为 URL
import assetAsURL from './asset.js?url';

// 加载资源为字符串
import assetAsString from './shader.glsl?raw';

// 加载 Web Workers
import Worker from './worker.js?worker';

// 在运行时动态导入资源
const imgUrl = new URL('./img.png', import.meta.url).href;

// JSON 导入
import data from './data.json';

// 导入 JSON 的命名导出
import { field } from './data.json';
```

### public 目录

```
public/
├── favicon.ico
├── robots.txt
└── images/
    └── logo.png
```

```javascript
// 引用 public 目录中的资源
// 开发环境：http://localhost:3000/favicon.ico
// 生产环境：/favicon.ico
const faviconUrl = '/favicon.ico';
const logoUrl = '/images/logo.png';
```

### 资源内联

```javascript
// 内联为 base64
import inlineAsset from './asset.png?inline';

// 内联为字符串
import rawContent from './file.txt?raw';

// 内联 SVG
import svgContent from './icon.svg?raw';
```

## CSS 处理

### CSS 模块

```css
/* style.module.css */
.red {
  color: red;
}

.bold {
  font-weight: bold;
}
```

```javascript
// 使用 CSS 模块
import styles from './style.module.css';

// styles.red, styles.bold
document.getElementById('foo').className = styles.red;

// 与其他 CSS 预处理器一起使用
import styles from './style.module.scss';
import styles from './style.module.less';
```

### CSS 预处理器

```bash
# 安装预处理器
npm install -D sass
npm install -D less
npm install -D stylus
```

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        math: 'parens-division'
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1)
        }
      }
    }
  }
});
```

### PostCSS

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')
  ]
};

// vite.config.js
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')
      ]
    }
  }
});
```

### CSS-in-JS

```javascript
// 使用 styled-components
import styled from 'styled-components';

const Button = styled.button`
  background: palevioletred;
  border-radius: 3px;
  border: none;
  color: white;
`;

// 使用 emotion
import { css } from '@emotion/react';

const buttonStyle = css`
  background: palevioletred;
  border-radius: 3px;
  border: none;
  color: white;
`;
```

## TypeScript 支持

### 基础配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 类型声明

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

// 环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 静态资源类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}
```

### 客户端类型

```typescript
// 使用 import.meta
const url = import.meta.url;
const env = import.meta.env;
const hot = import.meta.hot;

// 动态导入
const module = await import('./module.js');

// Glob 导入
const modules = import.meta.glob('./dir/*.js');
const eagerModules = import.meta.glob('./dir/*.js', { eager: true });
```

## 环境变量

### .env 文件

```bash
# .env
VITE_APP_TITLE=My App
VITE_API_URL=https://api.example.com

# .env.local
VITE_API_KEY=secret-key

# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://api.production.com
```

### 使用环境变量

```javascript
// 在代码中使用
console.log(import.meta.env.VITE_APP_TITLE);
console.log(import.meta.env.VITE_API_URL);

// 检查环境
if (import.meta.env.DEV) {
  console.log('开发环境');
}

if (import.meta.env.PROD) {
  console.log('生产环境');
}

// 获取模式
console.log(import.meta.env.MODE); // 'development' | 'production'
```

### 配置环境变量

```javascript
// vite.config.js
export default defineConfig({
  // 自定义环境变量前缀
  envPrefix: 'APP_',
  
  // 环境变量目录
  envDir: './env',
  
  // 定义全局常量
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __API_URL__: JSON.stringify(process.env.API_URL)
  }
});
```

## 构建优化

### 构建配置

```javascript
export default defineConfig({
  build: {
    // 构建目标
    target: 'modules', // 'es2015' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'esnext'
    
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 小于此阈值的导入或引用资源将内联为 base64 编码
    assetsInlineLimit: 4096,
    
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    
    // 构建后是否生成 source map 文件
    sourcemap: false,
    
    // 自定义底层的 Rollup 打包配置
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['lodash', 'axios']
        }
      }
    },
    
    // 混淆器
    minify: 'esbuild', // 'terser' | 'esbuild' | false
    
    // 传递给 Terser 的更多 minify 选项
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // 设置为 false 可以避免构建报告中输出过长的 chunk
    reportCompressedSize: false,
    
    // 调整 chunk 大小警告的限制
    chunkSizeWarningLimit: 500,
    
    // 启用/禁用 gzip 压缩大小报告
    brotliSize: false
  }
});
```

### 代码分割

```javascript
// 动态导入实现代码分割
const LazyComponent = lazy(() => import('./LazyComponent'));

// 路由级别的代码分割
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
];

// 手动分割 chunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('src/utils')) {
            return 'utils';
          }
        }
      }
    }
  }
});
```

### 预构建依赖

```javascript
export default defineConfig({
  optimizeDeps: {
    // 强制预构建链接的包
    include: ['linked-dep'],
    
    // 在预构建中强制排除的依赖项
    exclude: ['your-package-name'],
    
    // 在构建时应用的 esbuild 选项
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        // esbuild 插件
      ]
    },
    
    // 强制依赖预构建
    force: true
  }
});
```

## 插件系统

### 官方插件

```bash
# Vue 插件
npm install @vitejs/plugin-vue

# React 插件
npm install @vitejs/plugin-react

# Preact 插件
npm install @vitejs/plugin-preact

# Svelte 插件
npm install @vitejs/plugin-svelte

# Legacy 插件（支持旧浏览器）
npm install @vitejs/plugin-legacy
```

```javascript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    // Vue 支持
    vue(),
    
    // React 支持
    react(),
    
    // 传统浏览器支持
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
});
```

### 社区插件

```bash
# PWA 插件
npm install vite-plugin-pwa

# ESLint 插件
npm install vite-plugin-eslint

# Mock 插件
npm install vite-plugin-mock

# 自动导入插件
npm install unplugin-auto-import

# 组件自动导入
npm install unplugin-vue-components
```

```javascript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import eslint from 'vite-plugin-eslint';
import { viteMockServe } from 'vite-plugin-mock';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [
    // PWA 支持
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
    
    // ESLint 集成
    eslint(),
    
    // Mock 服务
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true
    }),
    
    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true
    }),
    
    // 自动导入组件
    Components({
      dts: true
    })
  ]
});
```

### 自定义插件

```javascript
// 简单插件
function myPlugin() {
  return {
    name: 'my-plugin',
    configResolved(config) {
      // 配置解析完成
    },
    buildStart(opts) {
      // 构建开始
    },
    transform(code, id) {
      // 转换代码
      if (id.endsWith('.special')) {
        return `export default ${JSON.stringify(code)}`;
      }
    }
  };
}

// 带选项的插件
function myPluginWithOptions(options = {}) {
  return {
    name: 'my-plugin-with-options',
    config(config, { command }) {
      if (command === 'build') {
        config.define = config.define || {};
        config.define.__BUILD_TIME__ = JSON.stringify(new Date().toISOString());
      }
    },
    transformIndexHtml(html) {
      return html.replace(
        '<title>',
        `<title>${options.title || 'Default Title'} - `
      );
    }
  };
}

// 使用插件
export default defineConfig({
  plugins: [
    myPlugin(),
    myPluginWithOptions({ title: 'My App' })
  ]
});
```

## 多页面应用

### 配置多页面

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        mobile: resolve(__dirname, 'mobile/index.html')
      }
    }
  }
});
```

### 目录结构

```
project/
├── index.html          # 主页面
├── admin/
│   └── index.html      # 管理页面
├── mobile/
│   └── index.html      # 移动端页面
├── src/
│   ├── main.js         # 主页面入口
│   ├── admin.js        # 管理页面入口
│   └── mobile.js       # 移动端入口
└── vite.config.js
```

## 库模式

### 构建库

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      fileName: 'my-lib'
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
```

### package.json 配置

```json
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

## 框架集成

### Vue 3 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000
  }
});
```

### React 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: `import React from 'react'`
  }
});
```

### Svelte 项目

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()]
});
```

## 性能优化

### 开发时优化

```javascript
export default defineConfig({
  // 预构建优化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'axios',
      'lodash-es'
    ],
    exclude: [
      'your-local-package'
    ]
  },
  
  // 服务器优化
  server: {
    fs: {
      // 限制为工作区 root 路径以外的文件的访问
      strict: false
    },
    // 预热文件以降低启动期间的初始页面加载时间
    warmup: {
      clientFiles: [
        './src/components/*.vue',
        './src/utils/heavy-utils.js'
      ]
    }
  }
});
```

### 构建时优化

```javascript
export default defineConfig({
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // 生成较小的 chunk
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
          'utils': ['lodash-es', 'axios']
        }
      }
    },
    
    // 压缩选项
    minify: 'esbuild',
    
    // 关闭文件大小报告
    reportCompressedSize: false
  }
});
```

## 部署

### 静态部署

```bash
# 构建
npm run build

# 预览构建结果
npm run preview

# 部署到静态服务器
cp -r dist/* /var/www/html/
```

### GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

### Vercel 部署

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify 部署

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 故障排除

### 常见问题

**1. 依赖预构建问题：**
```bash
# 清除缓存
rm -rf node_modules/.vite

# 强制重新预构建
npx vite --force
```

**2. 模块解析问题：**
```javascript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
});
```

**3. 环境变量不生效：**
```javascript
// 确保环境变量以 VITE_ 开头
VITE_API_URL=http://localhost:3000

// 或者自定义前缀
export default defineConfig({
  envPrefix: 'APP_'
});
```

**4. HMR 不工作：**
```javascript
export default defineConfig({
  server: {
    hmr: {
      port: 24678
    }
  }
});
```

### 调试技巧

```bash
# 详细日志
npx vite --debug

# 分析构建
npx vite build --debug

# 检查配置
npx vite --config vite.config.js --mode development
```

## 最佳实践

### 1. 项目结构

```
project/
├── public/              # 静态资源
├── src/
│   ├── assets/         # 项目资源
│   ├── components/     # 组件
│   ├── composables/    # 组合式函数
│   ├── stores/         # 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── .env                # 环境变量
├── index.html          # HTML 模板
├── package.json
└── vite.config.js      # Vite 配置
```

### 2. 配置管理

```javascript
// config/vite.base.js
export const baseConfig = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src')
    }
  }
};

// config/vite.dev.js
export const devConfig = {
  server: {
    port: 3000,
    open: true
  }
};

// vite.config.js
import { defineConfig } from 'vite';
import { baseConfig } from './config/vite.base.js';
import { devConfig } from './config/vite.dev.js';

export default defineConfig(({ mode }) => {
  if (mode === 'development') {
    return { ...baseConfig, ...devConfig };
  }
  return baseConfig;
});
```

### 3. 性能监控

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 分析和优化 chunk 分割
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
```

## 相关资源

- [Vite 官方文档](https://vitejs.dev/)
- [Vite 插件列表](https://github.com/vitejs/awesome-vite)
- [Vite 示例项目](https://github.com/vitejs/vite/tree/main/packages/create-vite)
- [Rollup 文档](https://rollupjs.org/)
- [esbuild 文档](https://esbuild.github.io/)

## 总结

Vite 是现代前端开发的优秀构建工具，它通过利用浏览器原生 ES 模块和现代 JavaScript 工具链，提供了极快的开发体验和优化的生产构建。

关键优势：
1. 极快的冷启动和热更新
2. 开箱即用的现代特性支持
3. 丰富的插件生态系统
4. 优化的生产构建
5. 框架无关的设计
6. 简洁的配置和使用
7. 活跃的社区和持续更新

Vite 特别适合现代前端项目，是 Webpack 的优秀替代方案。