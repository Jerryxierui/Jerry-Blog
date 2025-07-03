# Prettier 代码格式化

## 简介

Prettier 是一个固执己见的代码格式化工具，支持多种编程语言，通过解析代码并根据自己的规则重新打印代码来确保一致的代码风格。

## 核心特性

### 🎯 主要优势
- **固执己见**：减少配置选择，专注于代码编写
- **多语言支持**：JavaScript、TypeScript、CSS、HTML、JSON 等
- **编辑器集成**：支持主流编辑器和 IDE
- **零配置**：开箱即用的默认配置
- **团队协作**：统一团队代码风格
- **自动化**：可集成到构建流程和 Git 钩子

### 支持的语言
```
✅ JavaScript (ES5+)
✅ TypeScript
✅ JSX/TSX
✅ CSS/SCSS/Less
✅ HTML
✅ JSON
✅ Markdown
✅ YAML
✅ GraphQL
✅ Vue
✅ Angular
```

## 安装配置

### 安装 Prettier
```bash
# 全局安装
npm install -g prettier

# 项目安装
npm install --save-dev prettier

# 使用 yarn
yarn add --dev prettier

# 使用 pnpm
pnpm add -D prettier
```

### 基本使用
```bash
# 格式化单个文件
prettier --write file.js

# 格式化多个文件
prettier --write "src/**/*.{js,jsx,ts,tsx}"

# 检查格式（不修改文件）
prettier --check "src/**/*.js"

# 输出格式化后的内容
prettier file.js
```

## 配置文件

### .prettierrc.json
```json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### .prettierrc.js
```javascript
module.exports = {
  // 每行最大字符数
  printWidth: 80,
  
  // 缩进空格数
  tabWidth: 2,
  
  // 使用制表符而不是空格
  useTabs: false,
  
  // 语句末尾添加分号
  semi: true,
  
  // 使用单引号
  singleQuote: true,
  
  // 对象属性引号使用策略
  quoteProps: 'as-needed',
  
  // JSX 中使用单引号
  jsxSingleQuote: true,
  
  // 尾随逗号
  trailingComma: 'es5',
  
  // 对象字面量中括号之间的空格
  bracketSpacing: true,
  
  // JSX 标签的反尖括号需要换行
  bracketSameLine: false,
  
  // 箭头函数参数括号
  arrowParens: 'avoid',
  
  // 换行符
  endOfLine: 'lf',
  
  // HTML 空白敏感性
  htmlWhitespaceSensitivity: 'css',
  
  // Vue 文件脚本和样式标签缩进
  vueIndentScriptAndStyle: false
};
```

### package.json 配置
```json
{
  "prettier": {
    "singleQuote": true,
    "semi": false,
    "tabWidth": 2
  }
}
```

## 配置选项详解

### 基础选项
```javascript
{
  // 每行最大字符数（默认：80）
  printWidth: 100,
  
  // 缩进大小（默认：2）
  tabWidth: 4,
  
  // 使用制表符缩进（默认：false）
  useTabs: true
}
```

### 引号和分号
```javascript
{
  // 使用单引号（默认：false）
  singleQuote: true,
  
  // JSX 中使用单引号（默认：false）
  jsxSingleQuote: true,
  
  // 语句末尾分号（默认：true）
  semi: false,
  
  // 对象属性引号策略（默认："as-needed"）
  // "as-needed" | "consistent" | "preserve"
  quoteProps: "consistent"
}
```

### 逗号和括号
```javascript
{
  // 尾随逗号（默认："es5"）
  // "none" | "es5" | "all"
  trailingComma: "all",
  
  // 对象括号间空格（默认：true）
  bracketSpacing: false,
  
  // JSX 标签闭合括号位置（默认：false）
  bracketSameLine: true,
  
  // 箭头函数参数括号（默认："always"）
  // "always" | "avoid"
  arrowParens: "always"
}
```

### 换行和空白
```javascript
{
  // 换行符类型（默认："lf"）
  // "auto" | "lf" | "crlf" | "cr"
  endOfLine: "auto",
  
  // HTML 空白敏感性（默认："css"）
  // "css" | "strict" | "ignore"
  htmlWhitespaceSensitivity: "ignore",
  
  // Vue 文件缩进（默认：false）
  vueIndentScriptAndStyle: true
}
```

## 忽略文件

### .prettierignore
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

# 生成的文件
*.min.js
*.bundle.js

# 文档
CHANGELOG.md

# 特定文件类型
*.svg
*.png
*.jpg
```

### 行内忽略
```javascript
// prettier-ignore
const matrix = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1]
];

/* prettier-ignore */
const uglyFormatted = {
    a   :    1,
    b:2
};
```

```html
<!-- prettier-ignore -->
<div    class="ugly-formatted"     >
    <span>不会被格式化</span>
</div>
```

```css
/* prettier-ignore */
.selector {
    color:red;
    background:blue;
}
```

## 编辑器集成

### VS Code 配置
```json
{
  // 安装 Prettier 扩展后的配置
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.formatOnType": false,
  
  // 特定语言配置
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Prettier 扩展配置
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false
}
```

### WebStorm 配置
1. 打开 Settings → Languages & Frameworks → JavaScript → Prettier
2. 设置 Prettier package 路径
3. 启用 "On save" 和 "On code reformat"
4. 配置文件模式匹配

### Vim/Neovim 配置
```vim
" 使用 vim-prettier 插件
Plug 'prettier/vim-prettier', {
  \ 'do': 'yarn install',
  \ 'for': ['javascript', 'typescript', 'css', 'less', 'scss', 'json', 'graphql', 'markdown', 'vue', 'html'] }

" 保存时自动格式化
let g:prettier#autoformat = 1
let g:prettier#autoformat_require_pragma = 0
```

## 与 ESLint 集成

### 安装依赖
```bash
npm install --save-dev \
  eslint \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier
```

### ESLint 配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier' // 必须放在最后
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error'
  }
};
```

### 简化配置
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended' // 等同于上面的配置
  ]
};
```

## 脚本配置

### package.json 脚本
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:js": "prettier --write 'src/**/*.{js,jsx,ts,tsx}'",
    "format:css": "prettier --write 'src/**/*.{css,scss,less}'",
    "format:json": "prettier --write '**/*.json'",
    "lint:format": "eslint --fix . && prettier --write ."
  }
}
```

### 批量格式化脚本
```bash
#!/bin/bash
# format.sh

echo "格式化 JavaScript 文件..."
prettier --write "src/**/*.{js,jsx,ts,tsx}"

echo "格式化样式文件..."
prettier --write "src/**/*.{css,scss,less}"

echo "格式化配置文件..."
prettier --write "*.{json,yml,yaml}"

echo "格式化 Markdown 文件..."
prettier --write "**/*.md"

echo "格式化完成！"
```

## Git 钩子集成

### 使用 husky 和 lint-staged
```bash
# 安装依赖
npm install --save-dev husky lint-staged

# 初始化 husky
npx husky install

# 添加预提交钩子
npx husky add .husky/pre-commit "npx lint-staged"
```

### lint-staged 配置
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
```

### 简化配置
```json
{
  "lint-staged": {
    "*": "prettier --write --ignore-unknown"
  }
}
```

## CI/CD 集成

### GitHub Actions
```yaml
name: Code Format Check

on: [push, pull_request]

jobs:
  format-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check code formatting
        run: npm run format:check
      
      - name: Check for formatting issues
        run: |
          if ! npm run format:check; then
            echo "Code formatting issues found. Please run 'npm run format' to fix."
            exit 1
          fi
```

### 自动格式化 PR
```yaml
name: Auto Format

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Format code
        run: npm run format
      
      - name: Commit changes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'style: auto format code with prettier'
```

## 高级用法

### 条件格式化
```javascript
// prettier.config.js
module.exports = {
  ...require('./prettier.base.config'),
  // 根据环境变量调整配置
  ...(process.env.NODE_ENV === 'production' && {
    printWidth: 120
  })
};
```

### 多项目配置
```javascript
// prettier.config.js
const baseConfig = {
  singleQuote: true,
  semi: false
};

module.exports = {
  ...baseConfig,
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 4
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 100,
        proseWrap: 'always'
      }
    },
    {
      files: 'legacy/**/*.js',
      options: {
        singleQuote: false,
        semi: true
      }
    }
  ]
};
```

### API 使用
```javascript
const prettier = require('prettier');

// 格式化代码
const formatted = prettier.format('const x=1;', {
  parser: 'babel',
  singleQuote: true
});

// 检查是否已格式化
const isFormatted = prettier.check('const x = 1;', {
  parser: 'babel'
});

// 获取文件信息
const fileInfo = prettier.getFileInfo('file.js');

// 解析配置
const config = prettier.resolveConfig('file.js');
```

## 最佳实践

### 团队协作
1. **统一配置**：团队使用相同的 Prettier 配置
2. **编辑器集成**：确保所有成员都配置了编辑器集成
3. **自动化检查**：在 CI/CD 中添加格式检查
4. **渐进式采用**：逐步在现有项目中引入 Prettier

### 配置建议
1. **保持简单**：使用默认配置，减少自定义选项
2. **一致性优先**：选择团队都能接受的配置
3. **文档化**：记录配置选择的原因
4. **定期更新**：保持 Prettier 版本更新

### 性能优化
1. **使用 .prettierignore**：排除不需要格式化的文件
2. **缓存结果**：在 CI 中使用缓存
3. **并行处理**：使用工具并行格式化文件
4. **增量格式化**：只格式化变更的文件

## 故障排除

### 常见问题
```bash
# 配置文件未生效
prettier --find-config-path file.js

# 检查文件是否被忽略
prettier --check file.js

# 调试配置
prettier --config-precedence file-override --config .prettierrc.js file.js

# 清除编辑器缓存
# VS Code: Ctrl+Shift+P → "Reload Window"
# WebStorm: File → Invalidate Caches and Restart
```

### 配置冲突
1. **ESLint 冲突**：使用 eslint-config-prettier
2. **编辑器配置冲突**：检查 .editorconfig 文件
3. **多配置文件**：确保只有一个配置文件生效
4. **版本不兼容**：检查 Prettier 和插件版本兼容性

## 参考资源

- [Prettier 官方文档](https://prettier.io/docs/)
- [Prettier 配置选项](https://prettier.io/docs/en/options.html)
- [Prettier 编辑器集成](https://prettier.io/docs/en/editors.html)
- [Prettier 与 ESLint 集成](https://prettier.io/docs/en/integrating-with-linters.html)
- [Prettier Playground](https://prettier.io/playground/)

---

> 💡 **提示**：Prettier 通过自动化代码格式化，让团队专注于代码逻辑而不是格式争论，是现代开发工作流的重要组成部分！