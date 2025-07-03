# Tree Shaking 优化指南

## 简介

Tree Shaking 是一种通过静态分析消除 JavaScript 应用程序中未使用代码的优化技术。它的名称来源于摇树的比喻：摇动树木使枯叶掉落，只保留健康的枝叶。

### 核心特性

- **静态分析**：在构建时分析代码依赖关系
- **死代码消除**：移除未被引用的代码
- **模块级优化**：基于 ES6 模块的静态结构
- **体积减少**：显著减小最终打包文件大小
- **性能提升**：减少代码解析和执行时间

### 适用场景

- **大型应用程序**：包含大量第三方库和工具函数
- **组件库开发**：提供按需导入的能力
- **微前端架构**：优化各个子应用的体积
- **移动端应用**：对包体积敏感的场景
- **性能敏感应用**：需要快速加载的应用

### 性能指标

```javascript
// Tree Shaking 效果评估指标
class TreeShakingMetrics {
  constructor() {
    this.originalSize = 0
    this.optimizedSize = 0
    this.removedModules = []
    this.retainedModules = []
  }

  // 计算优化比例
  getOptimizationRatio() {
    return ((this.originalSize - this.optimizedSize) / this.originalSize * 100).toFixed(2)
  }

  // 分析模块使用情况
  analyzeModuleUsage(bundleStats) {
    const totalModules = bundleStats.modules.length
    const usedModules = bundleStats.modules.filter(module => module.used)
    const unusedModules = bundleStats.modules.filter(module => !module.used)

    return {
      total: totalModules,
      used: usedModules.length,
      unused: unusedModules.length,
      usageRate: (usedModules.length / totalModules * 100).toFixed(2)
    }
  }

  // 生成优化报告
  generateReport() {
    return {
      originalSize: this.formatSize(this.originalSize),
      optimizedSize: this.formatSize(this.optimizedSize),
      savedSize: this.formatSize(this.originalSize - this.optimizedSize),
      optimizationRatio: this.getOptimizationRatio() + '%',
      removedModulesCount: this.removedModules.length,
      retainedModulesCount: this.retainedModules.length
    }
  }

  formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}
```

## 核心概念

### Tree Shaking 原理

Tree Shaking 基于 ES6 模块的静态结构特性，通过分析模块的导入和导出关系，识别并移除未使用的代码。

```javascript
// ES6 模块的静态结构示例

// utils.js - 工具函数模块
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

export function multiply(a, b) {
  return a * b
}

export function divide(a, b) {
  return a / b
}

// main.js - 主模块
import { add, multiply } from './utils.js'

// 只使用了 add 和 multiply 函数
const result1 = add(5, 3)
const result2 = multiply(4, 2)

// subtract 和 divide 函数未被使用，会被 Tree Shaking 移除
```

### 静态分析过程

```javascript
// Tree Shaking 分析器示例
class TreeShakingAnalyzer {
  constructor() {
    this.dependencyGraph = new Map()
    this.usedExports = new Set()
    this.unusedExports = new Set()
  }

  // 构建依赖图
  buildDependencyGraph(modules) {
    modules.forEach(module => {
      const dependencies = this.extractDependencies(module)
      this.dependencyGraph.set(module.id, dependencies)
    })
  }

  // 提取模块依赖
  extractDependencies(module) {
    const dependencies = []
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(module.source)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim())
      const modulePath = match[2]

      dependencies.push({
        modulePath,
        imports
      })
    }

    return dependencies
  }

  // 标记使用的导出
  markUsedExports(entryModule) {
    const visited = new Set()
    const queue = [entryModule]

    while (queue.length > 0) {
      const currentModule = queue.shift()

      if (visited.has(currentModule)) {
        continue
      }

      visited.add(currentModule)
      const dependencies = this.dependencyGraph.get(currentModule)

      if (dependencies) {
        dependencies.forEach(dep => {
          dep.imports.forEach(importName => {
            this.usedExports.add(`${dep.modulePath}:${importName}`)
          })
          queue.push(dep.modulePath)
        })
      }
    }
  }

  // 识别未使用的导出
  identifyUnusedExports(allExports) {
    allExports.forEach(exportItem => {
      const exportKey = `${exportItem.module}:${exportItem.name}`
      if (!this.usedExports.has(exportKey)) {
        this.unusedExports.add(exportKey)
      }
    })
  }

  // 生成优化建议
  generateOptimizationSuggestions() {
    const suggestions = []

    this.unusedExports.forEach(unusedExport => {
      const [module, exportName] = unusedExport.split(':')
      suggestions.push({
        type: 'remove_unused_export',
        module,
        export: exportName,
        description: `移除未使用的导出: ${exportName} from ${module}`
      })
    })

    return suggestions
  }
}
```

### 副作用检测

```javascript
// 副作用检测和处理
class SideEffectDetector {
  constructor() {
    this.sideEffectPatterns = [
      /console\./,
      /window\./,
      /document\./,
      /localStorage\./,
      /sessionStorage\./,
      /fetch\(/,
      /XMLHttpRequest/,
      /addEventListener/,
      /removeEventListener/
    ]
  }

  // 检测模块是否有副作用
  hasSideEffects(moduleSource) {
    // 检查是否包含副作用模式
    for (const pattern of this.sideEffectPatterns) {
      if (pattern.test(moduleSource)) {
        return true
      }
    }

    // 检查顶层执行的代码
    if (this.hasTopLevelExecution(moduleSource)) {
      return true
    }

    // 检查修改全局对象的代码
    if (this.modifiesGlobalObject(moduleSource)) {
      return true
    }

    return false
  }

  // 检测顶层执行代码
  hasTopLevelExecution(source) {
    // 移除函数和类定义
    const withoutFunctions = source.replace(/function\s+\w+\s*\([^)]*\)\s*{[^}]*}/g, '')
    const withoutClasses = withoutFunctions.replace(/class\s+\w+\s*{[^}]*}/g, '')
    const withoutExports = withoutClasses.replace(/export\s+[^;]+;/g, '')

    // 检查是否还有执行语句
    const executableStatements = withoutExports
      .split('\n')
      .filter(line => {
        const trimmed = line.trim()
        return trimmed &&
               !trimmed.startsWith('//') &&
               !trimmed.startsWith('/*') &&
               !trimmed.startsWith('import') &&
               !trimmed.startsWith('export')
      })

    return executableStatements.length > 0
  }

  // 检测全局对象修改
  modifiesGlobalObject(source) {
    const globalModificationPatterns = [
      /window\.[\w$]+\s*=/,
      /global\.[\w$]+\s*=/,
      /globalThis\.[\w$]+\s*=/,
      /Object\.defineProperty\(\s*(window|global|globalThis)/
    ]

    return globalModificationPatterns.some(pattern => pattern.test(source))
  }

  // 标记安全的模块
  markAsSideEffectFree(modulePath) {
    // 在 package.json 中标记
    return {
      sideEffects: false,
      // 或者指定具体的文件
      // sideEffects: ["./src/polyfills.js"]
    }
  }
}
```

## Webpack Tree Shaking

### 基础配置

```javascript
// webpack.config.js - Tree Shaking 基础配置
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  mode: 'production', // 启用生产模式
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },

  // 优化配置
  optimization: {
    // 启用 Tree Shaking
    usedExports: true,

    // 启用副作用标记
    sideEffects: false,

    // 代码压缩
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            // 移除未使用的代码
            dead_code: true,
            // 移除未使用的函数参数
            unused: true,
            // 移除 console 语句
            drop_console: true,
            // 移除 debugger 语句
            drop_debugger: true
          },
          mangle: {
            // 混淆变量名
            toplevel: true
          }
        }
      })
    ],

    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\/]node_modules[\\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },

  // 模块解析
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // 优先使用 ES6 模块版本
    mainFields: ['module', 'main']
  },

  // 模块规则
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                // 保持 ES6 模块语法
                modules: false
              }]
            ]
          }
        }
      }
    ]
  },

  // 插件
  plugins: [
    // 分析打包结果
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'bundle-report.html'
    })
  ]
}
```

### 高级配置

```javascript
// webpack.config.advanced.js - 高级 Tree Shaking 配置
class AdvancedTreeShakingPlugin {
  constructor(options = {}) {
    this.options = {
      // 自定义副作用检测
      customSideEffectDetection: true,
      // 深度分析
      deepAnalysis: true,
      // 生成报告
      generateReport: true,
      ...options
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AdvancedTreeShakingPlugin', (compilation) => {
      // 在模块构建完成后进行分析
      compilation.hooks.finishModules.tap('AdvancedTreeShakingPlugin', (modules) => {
        this.analyzeModules(modules, compilation)
      })
    })
  }

  analyzeModules(modules, compilation) {
    const analyzer = new TreeShakingAnalyzer()
    const sideEffectDetector = new SideEffectDetector()

    modules.forEach(module => {
      // 分析模块依赖
      if (module.source) {
        const source = module.source.source()

        // 检测副作用
        if (this.options.customSideEffectDetection) {
          const hasSideEffects = sideEffectDetector.hasSideEffects(source)
          if (hasSideEffects) {
            module.factoryMeta = module.factoryMeta || {}
            module.factoryMeta.sideEffectFree = false
          }
        }

        // 深度分析
        if (this.options.deepAnalysis) {
          this.performDeepAnalysis(module, source)
        }
      }
    })

    // 生成报告
    if (this.options.generateReport) {
      this.generateOptimizationReport(modules, compilation)
    }
  }

  performDeepAnalysis(module, source) {
    // 分析函数调用链
    const functionCalls = this.extractFunctionCalls(source)

    // 分析变量使用
    const variableUsage = this.analyzeVariableUsage(source)

    // 分析导出使用情况
    const exportUsage = this.analyzeExportUsage(source)

    module.treeShakingInfo = {
      functionCalls,
      variableUsage,
      exportUsage
    }
  }

  extractFunctionCalls(source) {
    const functionCallRegex = /(\w+)\s*\(/g
    const calls = []
    let match

    while ((match = functionCallRegex.exec(source)) !== null) {
      calls.push(match[1])
    }

    return [...new Set(calls)] // 去重
  }

  analyzeVariableUsage(source) {
    const variableRegex = /(?:var|let|const)\s+(\w+)/g
    const variables = []
    let match

    while ((match = variableRegex.exec(source)) !== null) {
      variables.push(match[1])
    }

    return variables
  }

  analyzeExportUsage(source) {
    const exportRegex = /export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+)|class\s+(\w+)|{([^}]+)})/g
    const exports = []
    let match

    while ((match = exportRegex.exec(source)) !== null) {
      if (match[1]) exports.push(match[1]) // function
      if (match[2]) exports.push(match[2]) // const
      if (match[3]) exports.push(match[3]) // class
      if (match[4]) { // named exports
        const namedExports = match[4].split(',').map(exp => exp.trim())
        exports.push(...namedExports)
      }
    }

    return exports
  }

  generateOptimizationReport(modules, compilation) {
    const report = {
      timestamp: new Date().toISOString(),
      totalModules: modules.length,
      analyzedModules: 0,
      potentialOptimizations: [],
      sideEffectModules: [],
      unusedExports: []
    }

    modules.forEach(module => {
      if (module.treeShakingInfo) {
        report.analyzedModules++

        // 检查潜在优化
        if (module.treeShakingInfo.exportUsage.length === 0) {
          report.potentialOptimizations.push({
            module: module.identifier(),
            type: 'no_exports',
            suggestion: '该模块没有导出，可能可以移除'
          })
        }
      }

      if (module.factoryMeta && module.factoryMeta.sideEffectFree === false) {
        report.sideEffectModules.push(module.identifier())
      }
    })

    // 输出报告
    compilation.assets['tree-shaking-report.json'] = {
      source: () => JSON.stringify(report, null, 2),
      size: () => JSON.stringify(report, null, 2).length
    }
  }
}

// 使用高级插件
module.exports = {
  // ... 其他配置
  plugins: [
    new AdvancedTreeShakingPlugin({
      customSideEffectDetection: true,
      deepAnalysis: true,
      generateReport: true
    })
  ]
}
```

### package.json 配置

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "src/index.js",
  "sideEffects": false,
  "scripts": {
    "build": "webpack --mode=production",
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  },
  "devDependencies": {
    "webpack": "^5.0.0",
    "webpack-cli": "^4.0.0",
    "terser-webpack-plugin": "^5.0.0",
    "webpack-bundle-analyzer": "^4.0.0"
  }
}
```

## Rollup Tree Shaking

### 基础配置

```javascript
// rollup.config.js - Rollup Tree Shaking 配置
import { defineConfig } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { visualizer } from 'rollup-plugin-visualizer'
import analyze from 'rollup-plugin-analyzer'

export default defineConfig({
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true
    }
  ],

  // Tree Shaking 配置
  treeshake: {
    // 启用 Tree Shaking
    moduleSideEffects: false,

    // 属性读取优化
    propertyReadSideEffects: false,

    // 未知全局变量处理
    unknownGlobalSideEffects: false,

    // 自定义 Tree Shaking 规则
    preset: 'recommended'
  },

  plugins: [
    // 解析 node_modules
    nodeResolve({
      preferBuiltins: false,
      browser: true
    }),

    // 转换 CommonJS
    commonjs(),

    // 代码压缩
    terser({
      compress: {
        dead_code: true,
        unused: true,
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    }),

    // 可视化分析
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }),

    // 分析插件
    analyze({
      summaryOnly: true,
      limit: 10
    })
  ],

  // 外部依赖
  external: ['react', 'react-dom', 'lodash']
})
```

### 高级 Tree Shaking 配置

```javascript
// rollup.config.advanced.js - 高级配置
import { createFilter } from '@rollup/pluginutils'

// 自定义 Tree Shaking 插件
function advancedTreeShaking(options = {}) {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'advanced-tree-shaking',

    buildStart() {
      this.treeShakingStats = {
        removedModules: [],
        keptModules: [],
        sideEffectModules: []
      }
    },

    resolveId(id, importer) {
      // 自定义模块解析逻辑
      if (options.customResolver) {
        return options.customResolver(id, importer)
      }
      return null
    },

    load(id) {
      if (!filter(id)) return null

      // 自定义加载逻辑
      if (options.customLoader) {
        return options.customLoader(id)
      }
      return null
    },

    transform(code, id) {
      if (!filter(id)) return null

      // 分析代码副作用
      const hasSideEffects = this.analyzeSideEffects(code)

      if (hasSideEffects) {
        this.treeShakingStats.sideEffectModules.push(id)
      }

      // 标记纯函数
      const transformedCode = this.markPureFunctions(code)

      return {
        code: transformedCode,
        map: null
      }
    },

    generateBundle(outputOptions, bundle) {
      // 分析最终 bundle
      Object.keys(bundle).forEach(fileName => {
        const chunk = bundle[fileName]
        if (chunk.type === 'chunk') {
          this.analyzeChunk(chunk)
        }
      })

      // 生成报告
      this.generateReport(outputOptions)
    },

    analyzeSideEffects(code) {
      const sideEffectPatterns = [
        /console\./,
        /window\./,
        /document\./,
        /process\./,
        /global\./
      ]

      return sideEffectPatterns.some(pattern => pattern.test(code))
    },

    markPureFunctions(code) {
      // 标记纯函数以帮助 Tree Shaking
      return code.replace(
        /function\s+(\w+)\s*\([^)]*\)\s*{/g,
        (match, funcName) => {
          if (this.isPureFunction(funcName, code)) {
            return `/*#__PURE__*/ ${match}`
          }
          return match
        }
      )
    },

    isPureFunction(funcName, code) {
      // 简单的纯函数检测
      const funcRegex = new RegExp(`function\s+${funcName}\s*\([^)]*\)\s*{([^}]*)}`, 'g')
      const match = funcRegex.exec(code)

      if (match) {
        const funcBody = match[1]
        // 检查是否包含副作用
        return !this.analyzeSideEffects(funcBody)
      }

      return false
    },

    analyzeChunk(chunk) {
      // 分析 chunk 内容
      const moduleIds = Object.keys(chunk.modules)

      moduleIds.forEach(moduleId => {
        const module = chunk.modules[moduleId]
        if (module.removedExports && module.removedExports.length > 0) {
          this.treeShakingStats.removedModules.push({
            id: moduleId,
            removedExports: module.removedExports
          })
        } else {
          this.treeShakingStats.keptModules.push(moduleId)
        }
      })
    },

    generateReport(outputOptions) {
      const report = {
        timestamp: new Date().toISOString(),
        outputFile: outputOptions.file,
        treeShakingStats: this.treeShakingStats,
        summary: {
          totalModules: this.treeShakingStats.keptModules.length + this.treeShakingStats.removedModules.length,
          keptModules: this.treeShakingStats.keptModules.length,
          removedModules: this.treeShakingStats.removedModules.length,
          sideEffectModules: this.treeShakingStats.sideEffectModules.length
        }
      }

      // 输出报告文件
      const reportPath = outputOptions.file.replace(/\.[^.]+$/, '.tree-shaking-report.json')
      require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2))

      console.log('Tree Shaking Report:')
      console.log(`- Total modules: ${report.summary.totalModules}`)
      console.log(`- Kept modules: ${report.summary.keptModules}`)
      console.log(`- Removed modules: ${report.summary.removedModules}`)
      console.log(`- Side effect modules: ${report.summary.sideEffectModules}`)
    }
  }
}

// 使用高级插件
export default defineConfig({
  // ... 其他配置
  plugins: [
    advancedTreeShaking({
      include: ['src/**/*.js'],
      exclude: ['node_modules/**'],
      customResolver: (id, importer) => {
        // 自定义解析逻辑
        return null
      },
      customLoader: (id) => {
        // 自定义加载逻辑
        return null
      }
    })
  ]
})
```

## Vite Tree Shaking

### 基础配置

```javascript
// vite.config.js - Vite Tree Shaking 配置
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  // 构建配置
  build: {
    // 启用 Tree Shaking
    minify: 'terser',

    // Terser 配置
    terserOptions: {
      compress: {
        dead_code: true,
        unused: true,
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    },

    // Rollup 配置
    rollupOptions: {
      // Tree Shaking 配置
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false
      },

      // 外部依赖
      external: ['react', 'react-dom'],

      // 输出配置
      output: {
        // 手动分包
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'moment']
        }
      }
    },

    // 生成源码映射
    sourcemap: true,

    // 报告压缩后的文件大小
    reportCompressedSize: true
  },

  // 插件配置
  plugins: [
    // 可视化分析
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],

  // 优化配置
  optimizeDeps: {
    // 预构建包含的依赖
    include: ['react', 'react-dom'],

    // 预构建排除的依赖
    exclude: ['@vite/client', '@vite/env']
  }
})
```

### 自定义 Vite Tree Shaking 插件

```javascript
// vite-tree-shaking-plugin.js
import { createFilter } from '@rollup/pluginutils'
import MagicString from 'magic-string'

export function viteTreeShakingPlugin(options = {}) {
  const filter = createFilter(options.include, options.exclude)

  return {
    name: 'vite-tree-shaking',

    configResolved(config) {
      this.isProduction = config.command === 'build'
      this.treeShakingEnabled = this.isProduction && options.enabled !== false
    },

    transform(code, id) {
      if (!this.treeShakingEnabled || !filter(id)) {
        return null
      }

      const magicString = new MagicString(code)
      let hasChanges = false

      // 移除未使用的导入
      hasChanges = this.removeUnusedImports(code, magicString) || hasChanges

      // 标记纯函数
      hasChanges = this.markPureFunctions(code, magicString) || hasChanges

      // 移除死代码
      hasChanges = this.removeDeadCode(code, magicString) || hasChanges

      if (hasChanges) {
        return {
          code: magicString.toString(),
          map: magicString.generateMap({ hires: true })
        }
      }

      return null
    },

    removeUnusedImports(code, magicString) {
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g
      let hasChanges = false
      let match

      while ((match = importRegex.exec(code)) !== null) {
        const imports = match[1].split(',').map(imp => imp.trim())
        const modulePath = match[2]
        const usedImports = []

        imports.forEach(importName => {
          const cleanImportName = importName.replace(/\s+as\s+\w+/, '')
          const usageRegex = new RegExp(`\\b${cleanImportName}\\b`, 'g')
          const usageCount = (code.match(usageRegex) || []).length

          // 如果使用次数大于1（导入声明本身算一次），则保留
          if (usageCount > 1) {
            usedImports.push(importName)
          }
        })

        if (usedImports.length === 0) {
          // 移除整个导入语句
          magicString.remove(match.index, match.index + match[0].length)
          hasChanges = true
        } else if (usedImports.length < imports.length) {
          // 只保留使用的导入
          const newImportStatement = `import { ${usedImports.join(', ')} } from '${modulePath}'`
          magicString.overwrite(match.index, match.index + match[0].length, newImportStatement)
          hasChanges = true
        }
      }

      return hasChanges
    },

    markPureFunctions(code, magicString) {
      const functionRegex = /(?:export\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/g
      let hasChanges = false
      let match

      while ((match = functionRegex.exec(code)) !== null) {
        const funcName = match[1]

        if (this.isPureFunction(funcName, code)) {
          const pureComment = '/*#__PURE__*/ '
          magicString.prependLeft(match.index, pureComment)
          hasChanges = true
        }
      }

      return hasChanges
    },

    isPureFunction(funcName, code) {
      // 简化的纯函数检测
      const funcRegex = new RegExp(`function\s+${funcName}\s*\([^)]*\)\s*{([^}]*)}`, 'g')
      const match = funcRegex.exec(code)

      if (match) {
        const funcBody = match[1]

        // 检查是否包含副作用
        const sideEffectPatterns = [
          /console\./,
          /window\./,
          /document\./,
          /localStorage\./,
          /sessionStorage\./
        ]

        return !sideEffectPatterns.some(pattern => pattern.test(funcBody))
      }

      return false
    },

    removeDeadCode(code, magicString) {
      let hasChanges = false

      // 移除永远不会执行的代码
      const deadCodePatterns = [
        /if\s*\(\s*false\s*\)\s*{[^}]*}/g,
        /if\s*\(\s*0\s*\)\s*{[^}]*}/g,
        /if\s*\(\s*null\s*\)\s*{[^}]*}/g,
        /if\s*\(\s*undefined\s*\)\s*{[^}]*}/g
      ]

      deadCodePatterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(code)) !== null) {
          magicString.remove(match.index, match.index + match[0].length)
          hasChanges = true
        }
      })

      return hasChanges
    }
  }
}

// 使用插件
export default defineConfig({
  plugins: [
    viteTreeShakingPlugin({
      include: ['src/**/*.js', 'src/**/*.ts'],
      exclude: ['node_modules/**'],
      enabled: true
    })
  ]
})
```

## 第三方库优化

### Lodash 优化

```javascript
// 传统方式 - 导入整个 lodash
import _ from 'lodash'

const result = _.map([1, 2, 3], x => x * 2)
const filtered = _.filter([1, 2, 3, 4], x => x > 2)

// 优化方式1 - 按需导入
import map from 'lodash/map'
import filter from 'lodash/filter'

const result = map([1, 2, 3], x => x * 2)
const filtered = filter([1, 2, 3, 4], x => x > 2)

// 优化方式2 - 使用 lodash-es
import { map, filter } from 'lodash-es'

const result = map([1, 2, 3], x => x * 2)
const filtered = filter([1, 2, 3, 4], x => x > 2)

// 优化方式3 - 使用 babel-plugin-lodash
// .babelrc
{
  "plugins": [
    ["lodash", { "id": ["lodash", "recompose"] }]
  ]
}

// 代码会自动转换为按需导入
import { map, filter } from 'lodash'
// 转换为 ↓
import map from 'lodash/map'
import filter from 'lodash/filter'
```

### Moment.js 优化

```javascript
// 传统方式 - 包含所有语言包
import moment from 'moment'

// 优化方式1 - 只导入需要的语言包
import moment from 'moment'
import 'moment/locale/zh-cn'

moment.locale('zh-cn')

// 优化方式2 - 使用 Day.js 替代
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 优化方式3 - 使用 date-fns
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const formatted = format(parseISO('2023-01-01'), 'yyyy年MM月dd日', {
  locale: zhCN
})
```

### Ant Design 优化

```javascript
// 传统方式 - 导入整个组件库
import { Button, Input, Table } from 'antd'
import 'antd/dist/antd.css'

// 优化方式1 - 按需导入
import Button from 'antd/es/button'
import Input from 'antd/es/input'
import Table from 'antd/es/table'
import 'antd/es/button/style/css'
import 'antd/es/input/style/css'
import 'antd/es/table/style/css'

// 优化方式2 - 使用 babel-plugin-import
// .babelrc
{
  "plugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": "css"
    }]
  ]
}

// 代码会自动转换
import { Button, Input, Table } from 'antd'
// 转换为 ↓
import Button from 'antd/es/button'
import 'antd/es/button/style/css'
// ...

// 优化方式3 - 使用 unplugin-auto-import
// vite.config.js
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [AntDesignVueResolver()]
    }),
    Components({
      resolvers: [AntDesignVueResolver()]
    })
  ]
})
```

### 自定义库优化

```javascript
// utils/index.js - 工具库主文件
// 不推荐的方式 - 导出所有函数
export * from './array'
export * from './object'
export * from './string'
export * from './date'
export * from './math'

// 推荐的方式 - 分别导出
export { default as arrayUtils } from './array'
export { default as objectUtils } from './object'
export { default as stringUtils } from './string'
export { default as dateUtils } from './date'
export { default as mathUtils } from './math'

// utils/array.js - 数组工具
export function chunk(array, size) {
  // 实现
}

export function flatten(array) {
  // 实现
}

export function unique(array) {
  // 实现
}

// 使用时按需导入
import { chunk, unique } from './utils/array'
// 而不是
import { chunk, unique } from './utils'

// package.json 配置
{
  "name": "my-utils",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "sideEffects": false,
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js"
    },
    "./array": {
      "import": "./dist/array.esm.js",
      "require": "./dist/array.cjs.js"
    },
    "./object": {
      "import": "./dist/object.esm.js",
      "require": "./dist/object.cjs.js"
    }
  }
}
```

## 最佳实践

### 编写 Tree Shaking 友好的代码

```javascript
// ✅ 推荐：使用 ES6 模块
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

// ❌ 不推荐：使用 CommonJS
module.exports = {
  add: function(a, b) {
    return a + b
  },
  subtract: function(a, b) {
    return a - b
  }
}

// ✅ 推荐：避免副作用
export const PI = 3.14159

export function calculateArea(radius) {
  return PI * radius * radius
}

// ❌ 不推荐：包含副作用
console.log('Math utils loaded') // 副作用

export const PI = 3.14159

export function calculateArea(radius) {
  console.log('Calculating area') // 副作用
  return PI * radius * radius
}

// ✅ 推荐：使用纯函数
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

// ❌ 不推荐：依赖外部状态
let defaultCurrency = 'USD'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: defaultCurrency // 依赖外部状态
  }).format(amount)
}

// ✅ 推荐：明确的导入导出
import { specific, functions } from './module'

// ❌ 不推荐：动态导入（在某些情况下）
const moduleName = 'utils'
import(`./${moduleName}`).then(module => {
  // 动态导入可能影响 Tree Shaking
})
```

### 性能优化策略

```javascript
// Tree Shaking 性能优化管理器
class TreeShakingOptimizer {
  constructor() {
    this.optimizationStrategies = new Map()
    this.performanceMetrics = new Map()
    this.setupStrategies()
  }

  setupStrategies() {
    // 策略1：模块分析优化
    this.optimizationStrategies.set('module-analysis', {
      name: '模块分析优化',
      execute: this.optimizeModuleAnalysis.bind(this),
      priority: 1
    })

    // 策略2：依赖图优化
    this.optimizationStrategies.set('dependency-graph', {
      name: '依赖图优化',
      execute: this.optimizeDependencyGraph.bind(this),
      priority: 2
    })

    // 策略3：副作用检测优化
    this.optimizationStrategies.set('side-effect-detection', {
      name: '副作用检测优化',
      execute: this.optimizeSideEffectDetection.bind(this),
      priority: 3
    })

    // 策略4：代码分割优化
    this.optimizationStrategies.set('code-splitting', {
      name: '代码分割优化',
      execute: this.optimizeCodeSplitting.bind(this),
      priority: 4
    })
  }

  // 模块分析优化
  optimizeModuleAnalysis(modules) {
    const startTime = performance.now()

    // 并行分析模块
    const analysisPromises = modules.map(module => {
      return this.analyzeModuleInWorker(module)
    })

    return Promise.all(analysisPromises).then(results => {
      const endTime = performance.now()
      this.recordMetric('module-analysis', endTime - startTime)

      return results
    })
  }

  // 在 Worker 中分析模块
  analyzeModuleInWorker(module) {
    return new Promise((resolve) => {
      const worker = new Worker('/workers/module-analyzer.js')

      worker.postMessage({
        type: 'ANALYZE_MODULE',
        module: module
      })

      worker.onmessage = (event) => {
        const { result } = event.data
        worker.terminate()
        resolve(result)
      }
    })
  }

  // 依赖图优化
  optimizeDependencyGraph(dependencyGraph) {
    const startTime = performance.now()

    // 使用图算法优化依赖关系
    const optimizedGraph = this.applyGraphOptimizations(dependencyGraph)

    // 检测循环依赖
    const circularDependencies = this.detectCircularDependencies(optimizedGraph)

    if (circularDependencies.length > 0) {
      console.warn('检测到循环依赖:', circularDependencies)
    }

    const endTime = performance.now()
    this.recordMetric('dependency-graph', endTime - startTime)

    return optimizedGraph
  }

  applyGraphOptimizations(graph) {
    // 拓扑排序优化
    const sortedNodes = this.topologicalSort(graph)

    // 移除冗余边
    const optimizedEdges = this.removeRedundantEdges(graph)

    return {
      nodes: sortedNodes,
      edges: optimizedEdges
    }
  }

  topologicalSort(graph) {
    const visited = new Set()
    const result = []

    function visit(node) {
      if (visited.has(node)) return
      visited.add(node)

      const dependencies = graph.get(node) || []
      dependencies.forEach(dep => visit(dep))

      result.push(node)
    }

    graph.forEach((_, node) => visit(node))

    return result
  }

  detectCircularDependencies(graph) {
    const visiting = new Set()
    const visited = new Set()
    const cycles = []

    function visit(node, path = []) {
      if (visiting.has(node)) {
        // 发现循环
        const cycleStart = path.indexOf(node)
        cycles.push(path.slice(cycleStart).concat(node))
        return
      }

      if (visited.has(node)) return

      visiting.add(node)
      const dependencies = graph.get(node) || []

      dependencies.forEach(dep => {
        visit(dep, path.concat(node))
      })

      visiting.delete(node)
      visited.add(node)
    }

    graph.forEach((_, node) => visit(node))

    return cycles
  }

  // 副作用检测优化
  optimizeSideEffectDetection(modules) {
    const startTime = performance.now()

    // 缓存副作用检测结果
    const cache = new Map()

    const results = modules.map(module => {
      const cacheKey = this.generateCacheKey(module)

      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)
      }

      const hasSideEffects = this.detectSideEffects(module)
      cache.set(cacheKey, hasSideEffects)

      return hasSideEffects
    })

    const endTime = performance.now()
    this.recordMetric('side-effect-detection', endTime - startTime)

    return results
  }

  generateCacheKey(module) {
    // 基于模块内容生成缓存键
    const content = module.source || ''
    return this.hashCode(content)
  }

  hashCode(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return hash
  }

  detectSideEffects(module) {
    const sideEffectPatterns = [
      /console\./,
      /window\./,
      /document\./,
      /localStorage\./,
      /sessionStorage\./,
      /fetch\(/,
      /XMLHttpRequest/
    ]

    const source = module.source || ''
    return sideEffectPatterns.some(pattern => pattern.test(source))
  }

  // 代码分割优化
  optimizeCodeSplitting(chunks) {
    const startTime = performance.now()

    // 分析 chunk 大小和依赖关系
    const chunkAnalysis = this.analyzeChunks(chunks)

    // 优化 chunk 分割策略
    const optimizedChunks = this.optimizeChunkStrategy(chunkAnalysis)

    const endTime = performance.now()
    this.recordMetric('code-splitting', endTime - startTime)

    return optimizedChunks
  }

  analyzeChunks(chunks) {
    return chunks.map(chunk => ({
      id: chunk.id,
      size: chunk.size,
      modules: chunk.modules,
      dependencies: chunk.dependencies,
      sharedModules: this.findSharedModules(chunk, chunks)
    }))
  }

  findSharedModules(targetChunk, allChunks) {
    const sharedModules = []

    targetChunk.modules.forEach(module => {
      const sharingChunks = allChunks.filter(chunk =>
        chunk.id !== targetChunk.id &&
        chunk.modules.includes(module)
      )

      if (sharingChunks.length > 0) {
        sharedModules.push({
          module,
          sharedWith: sharingChunks.map(chunk => chunk.id)
        })
      }
    })

    return sharedModules
  }

  optimizeChunkStrategy(chunkAnalysis) {
    // 基于分析结果优化分割策略
    const optimizations = []

    chunkAnalysis.forEach(chunk => {
      // 如果 chunk 过大，建议进一步分割
      if (chunk.size > 500 * 1024) { // 500KB
        optimizations.push({
          type: 'split-large-chunk',
          chunkId: chunk.id,
          currentSize: chunk.size,
          suggestion: '建议将大型 chunk 进一步分割'
        })
      }

      // 如果有很多共享模块，建议提取公共 chunk
      if (chunk.sharedModules.length > 5) {
        optimizations.push({
          type: 'extract-common-chunk',
          chunkId: chunk.id,
          sharedModulesCount: chunk.sharedModules.length,
          suggestion: '建议提取公共模块到单独的 chunk'
        })
      }
    })

    return optimizations
  }

  // 记录性能指标
  recordMetric(strategy, duration) {
    if (!this.performanceMetrics.has(strategy)) {
      this.performanceMetrics.set(strategy, [])
    }

    this.performanceMetrics.get(strategy).push({
      timestamp: Date.now(),
      duration
    })
  }

  // 执行所有优化策略
  async optimizeAll(data) {
    const strategies = Array.from(this.optimizationStrategies.values())
    strategies.sort((a, b) => a.priority - b.priority)

    let result = data

    for (const strategy of strategies) {
      console.log(`执行优化策略: ${strategy.name}`)
      result = await strategy.execute(result)
    }

    return result
  }

  // 生成性能报告
  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      strategies: {}
    }

    this.performanceMetrics.forEach((metrics, strategy) => {
      const durations = metrics.map(m => m.duration)

      report.strategies[strategy] = {
        executionCount: metrics.length,
        averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        totalDuration: durations.reduce((a, b) => a + b, 0)
      }
    })

    return report
  }
}

// 使用示例
const optimizer = new TreeShakingOptimizer()

// 优化构建过程
optimizer.optimizeAll({
  modules: [], // 模块列表
  dependencyGraph: new Map(), // 依赖图
  chunks: [] // chunk 列表
}).then(result => {
  console.log('优化完成:', result)

  // 生成性能报告
  const report = optimizer.generatePerformanceReport()
  console.log('性能报告:', report)
})
```

### 错误处理与降级策略

```javascript
// Tree Shaking 错误处理管理器
class TreeShakingErrorHandler {
  constructor() {
    this.errorHandlers = new Map()
    this.fallbackStrategies = new Map()
    this.setupErrorHandlers()
  }

  setupErrorHandlers() {
    // 模块解析错误
    this.errorHandlers.set('MODULE_RESOLUTION_ERROR', {
      handler: this.handleModuleResolutionError.bind(this),
      fallback: this.fallbackToCommonJS.bind(this)
    })

    // 循环依赖错误
    this.errorHandlers.set('CIRCULAR_DEPENDENCY_ERROR', {
      handler: this.handleCircularDependencyError.bind(this),
      fallback: this.breakCircularDependency.bind(this)
    })

    // 副作用检测错误
    this.errorHandlers.set('SIDE_EFFECT_DETECTION_ERROR', {
      handler: this.handleSideEffectDetectionError.bind(this),
      fallback: this.conservativeSideEffectHandling.bind(this)
    })
  }

  // 处理模块解析错误
  handleModuleResolutionError(error, context) {
    console.warn('模块解析错误:', error.message)

    // 尝试不同的解析策略
    const alternativeStrategies = [
      () => this.resolveWithExtensions(context.modulePath),
      () => this.resolveFromNodeModules(context.modulePath),
      () => this.resolveRelativePath(context.modulePath, context.basePath)
    ]

    for (const strategy of alternativeStrategies) {
      try {
        const resolved = strategy()
        if (resolved) {
          console.log('使用替代解析策略成功:', resolved)
          return resolved
        }
      } catch (e) {
        continue
      }
    }

    return this.errorHandlers.get('MODULE_RESOLUTION_ERROR').fallback(context)
  }

  // 降级到 CommonJS
  fallbackToCommonJS(context) {
    console.log('降级到 CommonJS 模块处理')

    return {
      type: 'commonjs',
      path: context.modulePath,
      exports: ['default'],
      sideEffects: true
    }
  }

  // 处理错误的主方法
  handleError(errorType, error, context) {
    const handler = this.errorHandlers.get(errorType)

    if (handler) {
      try {
        return handler.handler(error, context)
      } catch (handlerError) {
        console.error('错误处理器失败:', handlerError)
        return handler.fallback(context)
      }
    } else {
      console.error('未知错误类型:', errorType)
      return this.defaultErrorHandler(error, context)
    }
  }

  defaultErrorHandler(error, context) {
    return {
      handled: false,
      error: error.message,
      context: context,
      suggestion: '请检查配置和代码'
    }
  }
}
```

## 实际应用案例

### 电商平台优化案例

```javascript
// 电商平台 Tree Shaking 优化实践
class ECommerceTreeShakingOptimizer {
  constructor() {
    this.moduleCategories = {
      core: ['user', 'auth', 'router'],
      product: ['catalog', 'search', 'filter'],
      cart: ['shopping-cart', 'checkout', 'payment'],
      admin: ['dashboard', 'analytics', 'management']
    }
    this.optimizationResults = new Map()
  }

  // 基于用户角色的代码分割
  optimizeByUserRole(userRole) {
    const requiredModules = this.getRequiredModulesByRole(userRole)

    return {
      entry: './src/main.js',
      optimization: {
        splitChunks: {
          cacheGroups: {
            core: {
              test: this.createModuleTest(this.moduleCategories.core),
              name: 'core',
              chunks: 'all',
              priority: 30
            },
            userSpecific: {
              test: this.createModuleTest(requiredModules),
              name: `${userRole}-modules`,
              chunks: 'all',
              priority: 20
            },
            vendor: {
              test: /[\\\/]node_modules[\\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10
            }
          }
        }
      }
    }
  }

  getRequiredModulesByRole(role) {
    const roleModuleMap = {
      customer: [...this.moduleCategories.product, ...this.moduleCategories.cart],
      admin: [...this.moduleCategories.admin, ...this.moduleCategories.product],
      guest: [...this.moduleCategories.product]
    }

    return roleModuleMap[role] || []
  }

  createModuleTest(modules) {
    const modulePattern = modules.join('|')
    return new RegExp(`[\\\/](${modulePattern})[\\\/]`)
  }

  // 基于页面的动态导入优化
  optimizePageModules() {
    return {
      // 产品页面
      product: () => import(/* webpackChunkName: "product" */ './pages/Product'),

      // 购物车页面
      cart: () => import(/* webpackChunkName: "cart" */ './pages/Cart'),

      // 结账页面
      checkout: () => import(/* webpackChunkName: "checkout" */ './pages/Checkout'),

      // 管理后台
      admin: () => import(/* webpackChunkName: "admin" */ './pages/Admin')
    }
  }

  // 第三方库优化
  optimizeThirdPartyLibraries() {
    return {
      // 按需导入 UI 组件库
      antd: {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css'
      },

      // 优化工具库
      lodash: {
        libraryName: 'lodash',
        libraryDirectory: '',
        camel2DashComponentName: false
      },

      // 图表库优化
      echarts: {
        libraryName: 'echarts',
        libraryDirectory: 'lib',
        camel2DashComponentName: false
      }
    }
  }

  // 性能监控和报告
  generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      optimizations: [],
      metrics: {
        bundleSize: {
          before: 0,
          after: 0,
          reduction: 0
        },
        loadTime: {
          before: 0,
          after: 0,
          improvement: 0
        }
      }
    }

    // 分析各个模块的优化效果
    Object.keys(this.moduleCategories).forEach(category => {
      const modules = this.moduleCategories[category]
      const optimization = this.analyzeModuleOptimization(modules)

      report.optimizations.push({
        category,
        modules,
        ...optimization
      })
    })

    return report
  }

  analyzeModuleOptimization(modules) {
    // 模拟分析逻辑
    const totalSize = modules.length * 50 * 1024 // 假设每个模块 50KB
    const optimizedSize = totalSize * 0.7 // 假设优化后减少 30%

    return {
      originalSize: totalSize,
      optimizedSize: optimizedSize,
      reduction: totalSize - optimizedSize,
      reductionPercentage: ((totalSize - optimizedSize) / totalSize * 100).toFixed(2)
    }
  }
}

// 使用示例
const ecommerceOptimizer = new ECommerceTreeShakingOptimizer()

// 为客户用户优化
const customerConfig = ecommerceOptimizer.optimizeByUserRole('customer')
console.log('客户端配置:', customerConfig)

// 生成优化报告
const report = ecommerceOptimizer.generateOptimizationReport()
console.log('优化报告:', report)
```

### 组件库开发案例

```javascript
// 组件库 Tree Shaking 优化
class ComponentLibraryOptimizer {
  constructor(libraryName) {
    this.libraryName = libraryName
    this.components = new Map()
    this.dependencies = new Map()
  }

  // 注册组件
  registerComponent(name, component, dependencies = []) {
    this.components.set(name, component)
    this.dependencies.set(name, dependencies)
  }

  // 生成按需导入的入口文件
  generateEntryFiles() {
    const entryFiles = new Map()

    this.components.forEach((component, name) => {
      const entryContent = this.generateComponentEntry(name, component)
      entryFiles.set(`${name}/index.js`, entryContent)
    })

    return entryFiles
  }

  generateComponentEntry(name, component) {
    const dependencies = this.dependencies.get(name) || []
    const imports = dependencies.map(dep =>
      `import '${this.getComponentPath(dep)}'`
    ).join('\n')

    return `${imports}
export { default } from './${name}'
export * from './${name}'
`
  }

  getComponentPath(componentName) {
    return `../${componentName}`
  }

  // 生成 package.json 配置
  generatePackageConfig() {
    const exports = {}

    // 主入口
    exports['.'] = {
      import: './es/index.js',
      require: './lib/index.js'
    }

    // 各组件入口
    this.components.forEach((_, name) => {
      exports[`./${name}`] = {
        import: `./es/${name}/index.js`,
        require: `./lib/${name}/index.js`
      }
    })

    return {
      name: this.libraryName,
      main: 'lib/index.js',
      module: 'es/index.js',
      sideEffects: false,
      exports
    }
  }

  // 生成 Babel 插件配置
  generateBabelPluginConfig() {
    return {
      libraryName: this.libraryName,
      libraryDirectory: 'es',
      camel2DashComponentName: false,
      transformToDefaultImport: {
        [this.libraryName]: '^[A-Z]'
      }
    }
  }

  // 分析组件依赖关系
  analyzeDependencies() {
    const dependencyGraph = new Map()

    this.components.forEach((_, name) => {
      const deps = this.dependencies.get(name) || []
      dependencyGraph.set(name, {
        directDependencies: deps,
        allDependencies: this.getAllDependencies(name, new Set())
      })
    })

    return dependencyGraph
  }

  getAllDependencies(componentName, visited = new Set()) {
    if (visited.has(componentName)) {
      return [] // 避免循环依赖
    }

    visited.add(componentName)
    const directDeps = this.dependencies.get(componentName) || []
    const allDeps = [...directDeps]

    directDeps.forEach(dep => {
      const subDeps = this.getAllDependencies(dep, visited)
      allDeps.push(...subDeps)
    })

    return [...new Set(allDeps)] // 去重
  }

  // 优化建议
  generateOptimizationSuggestions() {
    const suggestions = []
    const dependencyGraph = this.analyzeDependencies()

    dependencyGraph.forEach((info, componentName) => {
      // 检查是否有过多依赖
      if (info.allDependencies.length > 5) {
        suggestions.push({
          type: 'high_dependency_count',
          component: componentName,
          dependencyCount: info.allDependencies.length,
          suggestion: '考虑拆分组件或减少依赖'
        })
      }

      // 检查是否有循环依赖
      const hasCircular = this.hasCircularDependency(componentName)
      if (hasCircular) {
        suggestions.push({
          type: 'circular_dependency',
          component: componentName,
          suggestion: '存在循环依赖，需要重构'
        })
      }
    })

    return suggestions
  }

  hasCircularDependency(componentName, visited = new Set(), path = []) {
    if (path.includes(componentName)) {
      return true
    }

    if (visited.has(componentName)) {
      return false
    }

    visited.add(componentName)
    const deps = this.dependencies.get(componentName) || []

    for (const dep of deps) {
      if (this.hasCircularDependency(dep, visited, [...path, componentName])) {
        return true
      }
    }

    return false
  }
}

// 使用示例
const libOptimizer = new ComponentLibraryOptimizer('my-ui-lib')

// 注册组件
libOptimizer.registerComponent('Button', 'Button', ['Icon'])
libOptimizer.registerComponent('Input', 'Input', ['Icon'])
libOptimizer.registerComponent('Modal', 'Modal', ['Button', 'Icon'])
libOptimizer.registerComponent('Icon', 'Icon', [])

// 生成配置
const packageConfig = libOptimizer.generatePackageConfig()
const babelConfig = libOptimizer.generateBabelPluginConfig()
const suggestions = libOptimizer.generateOptimizationSuggestions()

console.log('Package 配置:', packageConfig)
console.log('Babel 配置:', babelConfig)
console.log('优化建议:', suggestions)
```

## 故障排除

### 常见问题和解决方案

```javascript
// Tree Shaking 故障排除工具
class TreeShakingTroubleshooter {
  constructor() {
    this.commonIssues = new Map()
    this.diagnosticTools = new Map()
    this.setupCommonIssues()
    this.setupDiagnosticTools()
  }

  setupCommonIssues() {
    // 问题1：Tree Shaking 不生效
    this.commonIssues.set('tree-shaking-not-working', {
      symptoms: [
        '打包后文件体积没有减小',
        '未使用的代码仍然存在于最终 bundle 中',
        'webpack-bundle-analyzer 显示未使用的模块'
      ],
      causes: [
        '使用了 CommonJS 模块',
        'package.json 中 sideEffects 配置错误',
        'Babel 配置将 ES6 模块转换为 CommonJS',
        '代码中存在副作用'
      ],
      solutions: [
        '确保使用 ES6 模块语法',
        '正确配置 package.json 中的 sideEffects',
        '配置 Babel 保持 ES6 模块语法',
        '移除或标记副作用代码'
      ]
    })

    // 问题2：意外的代码被移除
    this.commonIssues.set('unexpected-code-removal', {
      symptoms: [
        '运行时出现 undefined 错误',
        '某些功能在生产环境中不工作',
        '动态导入的模块找不到'
      ],
      causes: [
        '代码被错误地标记为未使用',
        '动态导入没有被正确识别',
        '副作用代码被意外移除'
      ],
      solutions: [
        '使用 /*#__PURE__*/ 注释标记纯函数',
        '正确配置动态导入',
        '在 package.json 中正确标记副作用文件'
      ]
    })

    // 问题3：第三方库 Tree Shaking 失效
    this.commonIssues.set('third-party-tree-shaking-failed', {
      symptoms: [
        '第三方库的整个包都被打包进来',
        '按需导入不生效',
        'lodash、antd 等库体积过大'
      ],
      causes: [
        '第三方库不支持 Tree Shaking',
        '导入方式不正确',
        '缺少相应的 Babel 插件'
      ],
      solutions: [
        '使用支持 Tree Shaking 的库版本',
        '使用正确的导入语法',
        '配置 babel-plugin-import 等插件'
      ]
    })
  }

  setupDiagnosticTools() {
    // 诊断工具1：模块分析
    this.diagnosticTools.set('module-analysis', {
      name: '模块分析工具',
      execute: this.analyzeModules.bind(this)
    })

    // 诊断工具2：依赖检查
    this.diagnosticTools.set('dependency-check', {
      name: '依赖检查工具',
      execute: this.checkDependencies.bind(this)
    })

    // 诊断工具3：配置验证
    this.diagnosticTools.set('config-validation', {
      name: '配置验证工具',
      execute: this.validateConfig.bind(this)
    })
  }

  // 诊断 Tree Shaking 问题
  diagnose(projectPath) {
    const diagnosticResults = {
      timestamp: new Date().toISOString(),
      projectPath,
      issues: [],
      recommendations: []
    }

    // 运行所有诊断工具
    this.diagnosticTools.forEach((tool, name) => {
      try {
        const result = tool.execute(projectPath)
        diagnosticResults[name] = result

        if (result.issues && result.issues.length > 0) {
          diagnosticResults.issues.push(...result.issues)
        }

        if (result.recommendations && result.recommendations.length > 0) {
          diagnosticResults.recommendations.push(...result.recommendations)
        }
      } catch (error) {
        diagnosticResults[name] = {
          error: error.message,
          status: 'failed'
        }
      }
    })

    return diagnosticResults
  }

  // 分析模块
  analyzeModules(projectPath) {
    const result = {
      status: 'success',
      issues: [],
      recommendations: [],
      moduleStats: {
        total: 0,
        es6Modules: 0,
        commonjsModules: 0,
        sideEffectModules: 0
      }
    }

    try {
      // 模拟模块分析
      const modules = this.scanModules(projectPath)
      result.moduleStats.total = modules.length

      modules.forEach(module => {
        if (module.type === 'es6') {
          result.moduleStats.es6Modules++
        } else if (module.type === 'commonjs') {
          result.moduleStats.commonjsModules++
          result.issues.push({
            type: 'commonjs-module',
            file: module.path,
            message: '使用了 CommonJS 模块，可能影响 Tree Shaking'
          })
        }

        if (module.hasSideEffects) {
          result.moduleStats.sideEffectModules++
          result.recommendations.push({
            type: 'side-effect-optimization',
            file: module.path,
            message: '考虑移除副作用或在 package.json 中正确标记'
          })
        }
      })
    } catch (error) {
      result.status = 'error'
      result.error = error.message
    }

    return result
  }

  // 扫描模块（模拟实现）
  scanModules(projectPath) {
    // 这里应该实际扫描项目文件
    return [
      { path: 'src/utils.js', type: 'es6', hasSideEffects: false },
      { path: 'src/legacy.js', type: 'commonjs', hasSideEffects: true },
      { path: 'src/components/Button.js', type: 'es6', hasSideEffects: false }
    ]
  }

  // 检查依赖
  checkDependencies(projectPath) {
    const result = {
      status: 'success',
      issues: [],
      recommendations: [],
      dependencyStats: {
        total: 0,
        treeShakable: 0,
        nonTreeShakable: 0
      }
    }

    try {
      const packageJson = this.readPackageJson(projectPath)
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }

      result.dependencyStats.total = Object.keys(dependencies).length

      Object.keys(dependencies).forEach(dep => {
        const isTreeShakable = this.checkIfTreeShakable(dep)

        if (isTreeShakable) {
          result.dependencyStats.treeShakable++
        } else {
          result.dependencyStats.nonTreeShakable++
          result.recommendations.push({
            type: 'dependency-optimization',
            dependency: dep,
            message: `考虑使用支持 Tree Shaking 的替代方案`
          })
        }
      })
    } catch (error) {
      result.status = 'error'
      result.error = error.message
    }

    return result
  }

  // 读取 package.json（模拟实现）
  readPackageJson(projectPath) {
    return {
      dependencies: {
        'lodash': '^4.17.21',
        'lodash-es': '^4.17.21',
        'antd': '^4.16.0'
      },
      devDependencies: {
        'webpack': '^5.0.0'
      }
    }
  }

  // 检查依赖是否支持 Tree Shaking
  checkIfTreeShakable(dependency) {
    const treeShakableDeps = [
      'lodash-es',
      'antd',
      'date-fns',
      'ramda'
    ]

    return treeShakableDeps.includes(dependency)
  }

  // 验证配置
  validateConfig(projectPath) {
    const result = {
      status: 'success',
      issues: [],
      recommendations: [],
      configChecks: {
        webpack: { valid: false, issues: [] },
        babel: { valid: false, issues: [] },
        packageJson: { valid: false, issues: [] }
      }
    }

    // 检查 webpack 配置
    const webpackConfig = this.readWebpackConfig(projectPath)
    result.configChecks.webpack = this.validateWebpackConfig(webpackConfig)

    // 检查 babel 配置
    const babelConfig = this.readBabelConfig(projectPath)
    result.configChecks.babel = this.validateBabelConfig(babelConfig)

    // 检查 package.json 配置
    const packageJson = this.readPackageJson(projectPath)
    result.configChecks.packageJson = this.validatePackageJsonConfig(packageJson)

    return result
  }

  validateWebpackConfig(config) {
    const validation = { valid: true, issues: [] }

    if (!config.mode || config.mode !== 'production') {
      validation.issues.push('未设置生产模式')
      validation.valid = false
    }

    if (!config.optimization || !config.optimization.usedExports) {
      validation.issues.push('未启用 usedExports')
      validation.valid = false
    }

    return validation
  }

  validateBabelConfig(config) {
    const validation = { valid: true, issues: [] }

    const envPreset = config.presets?.find(preset =>
      Array.isArray(preset) && preset[0].includes('@babel/preset-env')
    )

    if (envPreset && envPreset[1]?.modules !== false) {
      validation.issues.push('Babel 配置可能将 ES6 模块转换为 CommonJS')
      validation.valid = false
    }

    return validation
  }

  validatePackageJsonConfig(packageJson) {
    const validation = { valid: true, issues: [] }

    if (packageJson.sideEffects === undefined) {
      validation.issues.push('未配置 sideEffects 字段')
      validation.valid = false
    }

    if (!packageJson.module) {
      validation.issues.push('未配置 module 字段')
      validation.valid = false
    }

    return validation
  }

  // 读取配置文件（模拟实现）
  readWebpackConfig(projectPath) {
    return {
      mode: 'production',
      optimization: {
        usedExports: true,
        sideEffects: false
      }
    }
  }

  readBabelConfig(projectPath) {
    return {
      presets: [
        ['@babel/preset-env', { modules: false }]
      ]
    }
  }

  // 生成修复建议
  generateFixSuggestions(diagnosticResults) {
    const suggestions = []

    diagnosticResults.issues.forEach(issue => {
      const commonIssue = this.findCommonIssue(issue)
      if (commonIssue) {
        suggestions.push({
          issue: issue.type,
          solutions: commonIssue.solutions,
          priority: this.calculatePriority(issue)
        })
      }
    })

    return suggestions.sort((a, b) => b.priority - a.priority)
  }

  findCommonIssue(issue) {
    for (const [key, commonIssue] of this.commonIssues) {
      if (issue.type.includes(key) ||
          commonIssue.symptoms.some(symptom =>
            issue.message.toLowerCase().includes(symptom.toLowerCase())
          )) {
        return commonIssue
      }
    }
    return null
  }

  calculatePriority(issue) {
    const priorityMap = {
      'commonjs-module': 9,
      'side-effect': 7,
      'config-error': 8,
      'dependency-issue': 6
    }

    return priorityMap[issue.type] || 5
  }
}

// 使用示例
const troubleshooter = new TreeShakingTroubleshooter()

// 诊断项目
const diagnosticResults = troubleshooter.diagnose('./my-project')
console.log('诊断结果:', diagnosticResults)

// 生成修复建议
const fixSuggestions = troubleshooter.generateFixSuggestions(diagnosticResults)
console.log('修复建议:', fixSuggestions)
```

## 参考资源

### 官方文档

- [Webpack Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Rollup Tree Shaking](https://rollupjs.org/guide/en/#tree-shaking)
- [Vite Tree Shaking](https://vitejs.dev/guide/features.html#tree-shaking)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

### 工具和插件

- [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) - Bundle 分析工具
- [babel-plugin-import](https://github.com/ant-design/babel-plugin-import) - 按需导入插件
- [rollup-plugin-analyzer](https://github.com/doesdev/rollup-plugin-analyzer) - Rollup 分析插件
- [terser-webpack-plugin](https://github.com/webpack-contrib/terser-webpack-plugin) - 代码压缩插件

### 最佳实践文章

- [Tree Shaking 最佳实践](https://developers.google.com/web/fundamentals/performance/optimizing-javascript/tree-shaking)
- [如何优化 JavaScript Bundle](https://web.dev/reduce-javascript-payloads-with-tree-shaking/)
- [现代 JavaScript 打包优化](https://web.dev/publish-modern-javascript/)

### 社区资源

- [Tree Shaking 示例项目](https://github.com/webpack/webpack/tree/master/examples/tree-shaking)
- [Rollup 示例配置](https://github.com/rollup/rollup-starter-lib)
- [Vite 优化指南](https://github.com/vitejs/vite/tree/main/docs)

---

通过本指南，你应该能够：

1. **理解 Tree Shaking 的工作原理**和核心概念
2. **掌握各种构建工具**的 Tree Shaking 配置方法
3. **优化第三方库**的使用，实现按需导入
4. **编写 Tree Shaking 友好的代码**
5. **解决常见的 Tree Shaking 问题**
6. **监控和分析优化效果**

Tree Shaking 是现代前端性能优化的重要技术，正确使用可以显著减少应用程序的体积，提升加载性能和用户体验。
