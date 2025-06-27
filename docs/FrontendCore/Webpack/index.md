---
outline: deep
---

# Webpack 模块打包工具

## 简介

Webpack 是一个现代 JavaScript 应用程序的静态模块打包器。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个 bundle。

Webpack 的核心概念包括入口(entry)、输出(output)、加载器(loaders)、插件(plugins)和模式(mode)。

## 特性

- **模块化支持**：支持 ES6、CommonJS、AMD 等模块系统
- **代码分割**：支持按需加载和代码分割
- **资源处理**：可以处理 JavaScript、CSS、图片等各种资源
- **开发服务器**：内置开发服务器，支持热更新
- **插件系统**：丰富的插件生态系统
- **优化功能**：代码压缩、Tree Shaking、作用域提升等
- **配置灵活**：高度可配置的构建流程
- **生态丰富**：大量的 loader 和 plugin

## 安装和基础配置

### 安装 Webpack

```bash
# 本地安装（推荐）
npm install --save-dev webpack webpack-cli

# 全局安装
npm install -g webpack webpack-cli

# 使用 yarn
yarn add --dev webpack webpack-cli
```

### 基础配置文件

**webpack.config.js：**
```javascript
const path = require('path');

module.exports = {
  // 入口文件
  entry: './src/index.js',
  
  // 输出配置
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true // 清理输出目录
  },
  
  // 模式
  mode: 'development', // 'development' | 'production' | 'none'
  
  // 开发工具
  devtool: 'inline-source-map',
  
  // 开发服务器
  devServer: {
    static: './dist',
    hot: true,
    open: true,
    port: 8080
  }
};
```

### package.json 脚本

```json
{
  "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development",
    "start": "webpack serve --mode=development",
    "watch": "webpack --watch"
  }
}
```

## 核心概念

### 1. 入口 (Entry)

```javascript
module.exports = {
  // 单个入口
  entry: './src/index.js',
  
  // 多个入口
  entry: {
    app: './src/app.js',
    admin: './src/admin.js'
  },
  
  // 动态入口
  entry: () => {
    return {
      app: './src/app.js',
      admin: './src/admin.js'
    };
  }
};
```

### 2. 输出 (Output)

```javascript
module.exports = {
  output: {
    // 输出文件名
    filename: '[name].[contenthash].js',
    
    // 输出路径
    path: path.resolve(__dirname, 'dist'),
    
    // 公共路径
    publicPath: '/assets/',
    
    // 清理输出目录
    clean: true,
    
    // 库配置
    library: {
      name: 'MyLibrary',
      type: 'umd'
    },
    
    // 环境配置
    environment: {
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false
    }
  }
};
```

### 3. 加载器 (Loaders)

```javascript
module.exports = {
  module: {
    rules: [
      // JavaScript/TypeScript
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      
      // CSS
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      
      // SCSS/Sass
      {
        test: /\.(scss|sass)$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      
      // 图片
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      
      // 字体
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      },
      
      // 数据文件
      {
        test: /\.(csv|tsv)$/i,
        use: ['csv-loader']
      },
      
      {
        test: /\.xml$/i,
        use: ['xml-loader']
      }
    ]
  }
};
```

### 4. 插件 (Plugins)

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    // HTML 插件
    new HtmlWebpackPlugin({
      title: 'My App',
      template: './src/index.html',
      filename: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true
      }
    }),
    
    // CSS 提取插件
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css'
    }),
    
    // 清理插件
    new CleanWebpackPlugin(),
    
    // 定义插件
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    
    // 热更新插件
    new webpack.HotModuleReplacementPlugin()
  ]
};
```

## 开发环境配置

### 开发服务器

```javascript
module.exports = {
  devServer: {
    // 静态文件目录
    static: {
      directory: path.join(__dirname, 'public'),
      publicPath: '/static'
    },
    
    // 端口
    port: 8080,
    
    // 主机
    host: 'localhost',
    
    // 自动打开浏览器
    open: true,
    
    // 热更新
    hot: true,
    
    // 实时重载
    liveReload: true,
    
    // 压缩
    compress: true,
    
    // 历史路由支持
    historyApiFallback: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    
    // HTTPS
    https: true,
    
    // 客户端配置
    client: {
      logging: 'info',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    }
  }
};
```

### 源码映射

```javascript
module.exports = {
  // 开发环境
  devtool: 'eval-source-map', // 快速重建
  
  // 生产环境
  devtool: 'source-map', // 高质量源码映射
  
  // 其他选项
  // 'eval' - 最快，但只映射到转换后的代码
  // 'cheap-source-map' - 较快，但只映射行
  // 'inline-source-map' - 内联到 bundle 中
  // 'hidden-source-map' - 不在 bundle 中引用
  // 'nosources-source-map' - 不包含源码内容
};
```

### 热模块替换 (HMR)

```javascript
// webpack.config.js
module.exports = {
  devServer: {
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};

// 在应用代码中
if (module.hot) {
  module.hot.accept('./print.js', function() {
    console.log('Accepting the updated printMe module!');
    printMe();
  });
}

// React 热更新
if (module.hot) {
  module.hot.accept();
}
```

## 生产环境优化

### 代码分割

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // 公共代码
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        },
        
        // CSS 文件
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true
        }
      }
    },
    
    // 运行时代码分离
    runtimeChunk: {
      name: 'runtime'
    }
  }
};
```

### 动态导入

```javascript
// 动态导入模块
function getComponent() {
  return import('lodash')
    .then(({ default: _ }) => {
      const element = document.createElement('div');
      element.innerHTML = _.join(['Hello', 'webpack'], ' ');
      return element;
    })
    .catch(error => 'An error occurred while loading the component');
}

// 使用 async/await
async function getComponent() {
  try {
    const { default: _ } = await import('lodash');
    const element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    return element;
  } catch (error) {
    console.error('An error occurred while loading the component');
  }
}

// 预加载和预获取
import(/* webpackPreload: true */ 'ChartingLibrary');
import(/* webpackPrefetch: true */ 'LoginModal');

// 魔法注释
import(
  /* webpackChunkName: "my-chunk-name" */
  /* webpackMode: "lazy" */
  /* webpackExports: ["default", "named"] */
  './my-module'
);
```

### 压缩和优化

```javascript
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      // JavaScript 压缩
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
            drop_debugger: true, // 移除 debugger
            pure_funcs: ['console.log'] // 移除特定函数
          },
          mangle: {
            safari10: true // 修复 Safari 10 bug
          },
          format: {
            comments: false // 移除注释
          }
        },
        extractComments: false
      }),
      
      // CSS 压缩
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ],
    
    // Tree Shaking
    usedExports: true,
    sideEffects: false
  }
};
```

### Tree Shaking

```javascript
// package.json
{
  "sideEffects": false,
  // 或者指定有副作用的文件
  "sideEffects": [
    "./src/polyfills.js",
    "*.css"
  ]
}

// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    sideEffects: false
  }
};

// 在代码中标记纯函数
/*#__PURE__*/ function pureFunction() {
  return 'This function has no side effects';
}
```

## 常用 Loader

### Babel Loader

```bash
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                useBuiltIns: 'usage',
                corejs: 3
              }],
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      }
    ]
  }
};
```

### CSS Loader

```bash
npm install --save-dev css-loader style-loader mini-css-extract-plugin
```

```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          // 开发环境使用 style-loader
          process.env.NODE_ENV === 'production'
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]'
              },
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ]
};
```

### File Loader 和 URL Loader

```javascript
module.exports = {
  module: {
    rules: [
      // Webpack 5 资源模块
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]'
        }
      },
      
      // 小文件内联
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb
          }
        }
      },
      
      // 字体文件
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]'
        }
      }
    ]
  }
};
```

### PostCSS Loader

```bash
npm install --save-dev postcss-loader postcss autoprefixer
```

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default'
    })
  ]
};

// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  ['autoprefixer', {}]
                ]
              }
            }
          }
        ]
      }
    ]
  }
};
```

## 常用插件

### HTML Webpack Plugin

```bash
npm install --save-dev html-webpack-plugin
```

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      title: 'My App',
      template: './src/index.html',
      filename: 'index.html',
      inject: 'body',
      scriptLoading: 'defer',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    
    // 多页面应用
    new HtmlWebpackPlugin({
      filename: 'admin.html',
      template: './src/admin.html',
      chunks: ['admin']
    })
  ]
};
```

### Copy Webpack Plugin

```bash
npm install --save-dev copy-webpack-plugin
```

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: 'assets',
          globOptions: {
            ignore: ['**/index.html']
          }
        },
        {
          from: 'src/assets/images',
          to: 'images'
        }
      ]
    })
  ]
};
```

### Bundle Analyzer

```bash
npm install --save-dev webpack-bundle-analyzer
```

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
};
```

### DefinePlugin

```javascript
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.API_URL': JSON.stringify('https://api.example.com'),
      VERSION: JSON.stringify('1.0.0'),
      PRODUCTION: JSON.stringify(true),
      BROWSER_SUPPORTS_HTML5: true,
      'typeof window': JSON.stringify('object')
    })
  ]
};
```

## 多环境配置

### 配置文件分离

**webpack.common.js：**
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Production',
      template: './src/index.html'
    })
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  }
};
```

**webpack.dev.js：**
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
    hot: true,
    open: true
  }
});
```

**webpack.prod.js：**
```javascript
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ],
    splitChunks: {
      chunks: 'all'
    }
  }
});
```

### 环境变量

```javascript
// webpack.config.js
module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode,
    entry: './src/index.js',
    output: {
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(argv.mode),
        'process.env.API_URL': JSON.stringify(
          isProduction ? 'https://api.prod.com' : 'http://localhost:3000'
        )
      })
    ]
  };
};
```

```json
{
  "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development",
    "start": "webpack serve --mode=development --env development"
  }
}
```

## 性能优化

### 构建性能优化

```javascript
module.exports = {
  // 缓存
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
  
  // 解析优化
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'components': path.resolve(__dirname, 'src/components')
    }
  },
  
  // 模块解析优化
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  
  // 外部依赖
  externals: {
    jquery: 'jQuery',
    lodash: '_'
  }
};
```

### 运行时性能优化

```javascript
module.exports = {
  optimization: {
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    
    // 运行时分离
    runtimeChunk: 'single',
    
    // 模块 ID 优化
    moduleIds: 'deterministic',
    
    // Tree Shaking
    usedExports: true,
    sideEffects: false
  },
  
  // 输出优化
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js'
  }
};
```

### 懒加载

```javascript
// 路由懒加载
const Home = React.lazy(() => import('./components/Home'));
const About = React.lazy(() => import('./components/About'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// 条件加载
if (condition) {
  import('./heavy-module').then(module => {
    // 使用模块
  });
}

// 预加载
const LazyComponent = React.lazy(() => 
  import(/* webpackPreload: true */ './LazyComponent')
);
```

## 调试和分析

### 构建分析

```bash
# 生成统计文件
npx webpack --profile --json > stats.json

# 使用 webpack-bundle-analyzer
npx webpack-bundle-analyzer stats.json

# 使用官方分析工具
# 上传 stats.json 到 https://webpack.github.io/analyse/
```

### 调试配置

```javascript
module.exports = {
  // 详细输出
  stats: {
    colors: true,
    modules: true,
    reasons: true,
    errorDetails: true
  },
  
  // 性能提示
  performance: {
    hints: 'warning',
    maxEntrypointSize: 250000,
    maxAssetSize: 250000
  },
  
  // 监听配置
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 300,
    poll: 1000
  }
};
```

### 错误处理

```javascript
module.exports = {
  // 忽略错误继续构建
  ignoreWarnings: [
    /warning from compiler/,
    (warning) => true
  ],
  
  // 错误时停止构建
  bail: true,
  
  // 开发服务器错误覆盖
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  }
};
```

## 高级特性

### 模块联邦 (Module Federation)

```javascript
const ModuleFederationPlugin = require('@module-federation/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: {
        mfe1: 'mfe1@http://localhost:3001/remoteEntry.js'
      }
    })
  ]
};

// 远程模块
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'mfe1',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button'
      }
    })
  ]
};
```

### Web Workers

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' }
      }
    ]
  }
};

// worker.js
self.onmessage = function(e) {
  const result = e.data[0] * e.data[1];
  self.postMessage(result);
};

// main.js
import Worker from './worker.worker.js';

const worker = new Worker();
worker.postMessage([2, 3]);
worker.onmessage = function(e) {
  console.log('Result:', e.data);
};
```

### PWA 支持

```bash
npm install --save-dev workbox-webpack-plugin
```

```javascript
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  plugins: [
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache'
          }
        }
      ]
    })
  ]
};
```

## 最佳实践

### 1. 项目结构

```
project/
├── src/
│   ├── components/
│   ├── utils/
│   ├── assets/
│   └── index.js
├── public/
├── dist/
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
└── package.json
```

### 2. 配置管理

```javascript
// config/webpack.base.js
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
      'components': path.resolve(__dirname, '../src/components'),
      'utils': path.resolve(__dirname, '../src/utils')
    }
  }
};

// config/webpack.dev.js
const { merge } = require('webpack-merge');
const base = require('./webpack.base');

module.exports = merge(base, {
  mode: 'development',
  // 开发配置
});
```

### 3. 性能监控

```javascript
module.exports = {
  plugins: [
    // 构建进度
    new webpack.ProgressPlugin(),
    
    // 构建时间分析
    new (require('speed-measure-webpack-plugin'))(),
    
    // 包大小分析
    new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)({
      analyzerMode: process.env.ANALYZE ? 'server' : 'disabled'
    })
  ]
};
```

### 4. 代码质量

```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: ['eslint-loader'],
        exclude: /node_modules/
      }
    ]
  }
};
```

## 故障排除

### 常见问题

**1. 模块解析失败：**
```javascript
module.exports = {
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    symlinks: false
  }
};
```

**2. 内存溢出：**
```bash
# 增加内存限制
node --max-old-space-size=4096 node_modules/.bin/webpack

# package.json
{
  "scripts": {
    "build": "node --max-old-space-size=4096 node_modules/.bin/webpack --mode=production"
  }
}
```

**3. 构建速度慢：**
```javascript
module.exports = {
  // 启用缓存
  cache: {
    type: 'filesystem'
  },
  
  // 减少解析范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        use: 'babel-loader'
      }
    ]
  }
};
```

### 调试技巧

```bash
# 详细输出
npx webpack --stats verbose

# 分析构建时间
npx webpack --profile

# 监听模式调试
npx webpack --watch --progress

# 开发服务器调试
npx webpack serve --open --hot
```

## 相关资源

- [Webpack 官方文档](https://webpack.js.org/)
- [Webpack 配置指南](https://webpack.js.org/configuration/)
- [Awesome Webpack](https://github.com/webpack-contrib/awesome-webpack)
- [Webpack 示例](https://github.com/webpack/webpack/tree/main/examples)
- [Webpack 分析工具](https://webpack.github.io/analyse/)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

## 总结

Webpack 是现代前端开发中最重要的构建工具之一。通过合理配置和使用 Webpack，可以实现高效的模块打包、代码分割、资源优化等功能。

关键要点：
1. 理解核心概念：入口、输出、加载器、插件
2. 区分开发和生产环境配置
3. 合理使用代码分割和懒加载
4. 优化构建性能和运行时性能
5. 利用插件生态系统扩展功能
6. 监控和分析构建结果
7. 遵循最佳实践和项目结构