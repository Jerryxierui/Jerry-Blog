# ESLint 代码质量检查

## 简介

ESLint 是一个开源的 JavaScript 代码检查工具，用于识别和报告 ECMAScript/JavaScript 代码中的模式，帮助开发者编写更高质量、更一致的代码。

## 核心特性

### 🎯 主要功能
- **语法检查**：检测语法错误和潜在问题
- **代码风格**：统一代码格式和风格
- **最佳实践**：强制执行编程最佳实践
- **自定义规则**：支持自定义检查规则
- **自动修复**：自动修复部分代码问题
- **插件系统**：丰富的插件生态系统

### 工作原理
```
源代码 → AST 解析 → 规则检查 → 问题报告 → 自动修复
```

## 安装配置

### 安装 ESLint
```bash
# 全局安装
npm install -g eslint

# 项目安装
npm install --save-dev eslint

# 使用 yarn
yarn add --dev eslint

# 使用 pnpm
pnpm add -D eslint
```

### 初始化配置
```bash
# 交互式初始化
npx eslint --init

# 或者
npm init @eslint/config
```

### 配置文件格式

#### .eslintrc.js
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks'
  ],
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};
```

#### .eslintrc.json
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"]
  }
}
```

## 常用规则

### 代码质量规则
```javascript
{
  rules: {
    // 禁止未使用的变量
    'no-unused-vars': 'error',
    
    // 禁止未定义的变量
    'no-undef': 'error',
    
    // 禁止重复声明变量
    'no-redeclare': 'error',
    
    // 要求使用 === 和 !==
    'eqeqeq': 'error',
    
    // 禁止在条件中使用赋值操作符
    'no-cond-assign': 'error',
    
    // 禁止不必要的布尔转换
    'no-extra-boolean-cast': 'error'
  }
}
```

### 代码风格规则
```javascript
{
  rules: {
    // 强制使用一致的缩进
    'indent': ['error', 2],
    
    // 强制使用一致的引号
    'quotes': ['error', 'single'],
    
    // 要求或禁止使用分号
    'semi': ['error', 'always'],
    
    // 强制在逗号前后使用一致的空格
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    
    // 强制在对象字面量的属性中键和值之间使用一致的间距
    'key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }],
    
    // 强制在块之前使用一致的空格
    'space-before-blocks': 'error'
  }
}
```

### ES6+ 规则
```javascript
{
  rules: {
    // 要求使用 const 声明那些声明后不再被修改的变量
    'prefer-const': 'error',
    
    // 要求使用箭头函数作为回调
    'prefer-arrow-callback': 'error',
    
    // 要求使用模板字面量而非字符串连接
    'prefer-template': 'error',
    
    // 禁止使用 var
    'no-var': 'error',
    
    // 要求使用 let 或 const 而不是 var
    'no-implicit-globals': 'error'
  }
}
```

## 预设配置

### 官方预设
```javascript
{
  extends: [
    'eslint:recommended',        // ESLint 推荐规则
    'eslint:all'                // 所有可用规则
  ]
}
```

### 流行的扩展配置
```javascript
{
  extends: [
    // Airbnb 风格指南
    'airbnb',
    'airbnb-base',
    
    // Standard 风格
    'standard',
    
    // Google 风格
    'google',
    
    // Prettier 兼容
    'prettier'
  ]
}
```

## React 项目配置

### 安装依赖
```bash
npm install --save-dev \
  eslint \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y
```

### React 配置
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
```

## TypeScript 项目配置

### 安装依赖
```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin
```

### TypeScript 配置
```javascript
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
```

## 命令行使用

### 基本命令
```bash
# 检查单个文件
eslint file.js

# 检查多个文件
eslint src/**/*.js

# 检查并自动修复
eslint --fix src/**/*.js

# 输出格式化结果
eslint --format table src/**/*.js

# 忽略警告，只显示错误
eslint --quiet src/**/*.js
```

### 高级选项
```bash
# 指定配置文件
eslint -c .eslintrc.dev.js src/

# 忽略特定文件
eslint --ignore-path .eslintignore src/

# 输出到文件
eslint -o report.html -f html src/

# 检查特定规则
eslint --rule 'quotes: ["error", "double"]' src/
```

## 忽略文件

### .eslintignore
```gitignore
# 依赖目录
node_modules/

# 构建输出
dist/
build/
coverage/

# 配置文件
*.config.js
webpack.*.js

# 第三方库
vendor/
lib/

# 临时文件
*.tmp
*.log
```

### 行内忽略
```javascript
// 忽略下一行
// eslint-disable-next-line no-console
console.log('debug info');

// 忽略整个文件
/* eslint-disable */

// 忽略特定规则
/* eslint-disable no-unused-vars, no-console */

// 重新启用规则
/* eslint-enable no-console */
```

## 与编辑器集成

### VS Code 配置
```json
{
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.format.enable": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### WebStorm 配置
1. 打开 Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. 选择 "Automatic ESLint configuration"
3. 启用 "Run eslint --fix on save"

## 自定义规则

### 创建自定义规则
```javascript
// rules/no-console-log.js
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'disallow console.log statements'
    },
    fixable: 'code'
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console' &&
          node.callee.property.name === 'log'
        ) {
          context.report({
            node,
            message: 'console.log is not allowed',
            fix(fixer) {
              return fixer.remove(node.parent);
            }
          });
        }
      }
    };
  }
};
```

### 使用自定义规则
```javascript
module.exports = {
  plugins: ['./rules'],
  rules: {
    './rules/no-console-log': 'error'
  }
};
```

## 性能优化

### 缓存配置
```bash
# 启用缓存
eslint --cache src/

# 指定缓存位置
eslint --cache --cache-location .eslintcache src/
```

### 并行处理
```javascript
// package.json
{
  "scripts": {
    "lint": "eslint --cache --max-warnings 0 src/",
    "lint:fix": "eslint --cache --fix src/"
  }
}
```

## CI/CD 集成

### GitHub Actions
```yaml
name: ESLint Check

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
```

### 预提交钩子
```bash
# 安装 husky 和 lint-staged
npm install --save-dev husky lint-staged

# package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

## 最佳实践

### 团队协作
1. **统一配置**：团队使用相同的 ESLint 配置
2. **渐进式采用**：逐步引入更严格的规则
3. **文档化规则**：为自定义规则编写文档
4. **定期更新**：保持 ESLint 和插件的最新版本

### 规则管理
1. **分层配置**：基础规则 + 项目特定规则
2. **合理使用忽略**：避免过度使用 eslint-disable
3. **性能考虑**：避免过于复杂的规则
4. **可读性优先**：规则应该提高而不是降低代码可读性

## 故障排除

### 常见问题
```bash
# 配置文件未找到
eslint --print-config file.js

# 规则冲突
eslint --debug file.js

# 性能问题
eslint --timing file.js

# 清除缓存
rm -rf .eslintcache
```

### 调试技巧
1. **使用 --debug 选项**：查看详细的执行信息
2. **检查配置层级**：确认规则的优先级
3. **测试单个规则**：隔离问题规则
4. **查看 AST**：理解代码的抽象语法树结构

## 参考资源

- [ESLint 官方文档](https://eslint.org/docs/)
- [ESLint 规则参考](https://eslint.org/docs/rules/)
- [Awesome ESLint](https://github.com/dustinspecker/awesome-eslint)
- [ESLint 配置指南](https://eslint.org/docs/user-guide/configuring/)
- [ESLint 插件开发](https://eslint.org/docs/developer-guide/)

---

> 💡 **提示**：ESLint 是保证代码质量和团队协作的重要工具，合理配置可以大大提升开发效率和代码质量！