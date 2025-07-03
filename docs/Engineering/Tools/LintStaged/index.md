# lint-staged 增量代码检查工具

## 📖 简介

lint-staged 是一个专门针对 Git 暂存区文件运行代码检查工具的实用程序。它只对即将提交的文件执行检查和格式化，而不是整个项目，这大大提高了代码检查的效率。通常与 Husky 等 Git Hooks 工具配合使用，在代码提交前自动执行质量检查。

### 🚀 核心特性

- **增量检查**：只检查暂存区的文件，提高执行效率
- **多工具支持**：支持 ESLint、Prettier、Stylelint 等各种工具
- **并行执行**：同时运行多个检查任务，节省时间
- **文件过滤**：基于文件扩展名和路径模式精确匹配
- **自动修复**：支持自动修复可修复的代码问题
- **灵活配置**：支持多种配置方式和自定义命令

### 🎯 应用场景

- **代码质量控制**：提交前自动运行 ESLint、TSLint 等检查
- **代码格式化**：自动应用 Prettier、Beautify 等格式化工具
- **样式检查**：对 CSS、SCSS 文件运行 Stylelint 检查
- **图片优化**：压缩和优化即将提交的图片文件
- **测试执行**：对修改的文件运行相关测试用例

## 🏗️ 核心概念

### 工作原理

lint-staged 的工作流程：

1. **检测暂存文件**：获取 `git add` 后的暂存区文件列表
2. **模式匹配**：根据配置的文件模式过滤目标文件
3. **执行命令**：对匹配的文件执行相应的检查命令
4. **处理结果**：根据命令执行结果决定是否允许提交

```bash
# 工作流程示例
git add src/component.js src/styles.css
# ↓ lint-staged 检测到暂存文件
# ↓ 对 .js 文件运行 ESLint
# ↓ 对 .css 文件运行 Stylelint
# ↓ 所有检查通过后允许提交
git commit -m "feat: add new component"
```

### 文件匹配模式

lint-staged 使用 glob 模式匹配文件：

```javascript
{
  // 匹配所有 JavaScript 文件
  "*.js": "eslint --fix",

  // 匹配特定目录下的 TypeScript 文件
  "src/**/*.{ts,tsx}": "eslint --fix",

  // 匹配多种文件类型
  "*.{js,jsx,ts,tsx,json,css,md}": "prettier --write",

  // 排除特定文件
  "!(node_modules|dist)/**/*.js": "eslint --fix"
}
```

## ⚙️ 快速开始

### 安装

```bash
# 使用 npm
npm install lint-staged --save-dev

# 使用 yarn
yarn add lint-staged -D

# 使用 pnpm
pnpm add lint-staged -D
```

### 基本配置

#### package.json 配置

```json
{
  "name": "my-project",
  "scripts": {
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "test": "jest"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ]
  },
  "devDependencies": {
    "lint-staged": "^13.2.0",
    "husky": "^8.0.3"
  }
}
```

#### 独立配置文件

创建 `.lintstagedrc.json`：

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,scss,md}": [
    "prettier --write"
  ],
  "*.{png,jpg,jpeg,gif,svg}": [
    "imagemin-lint-staged"
  ]
}
```

或创建 `.lintstagedrc.js`：

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '*.{json,css,scss,md}': [
    'prettier --write',
  ],
  '*.{png,jpg,jpeg,gif,svg}': [
    'imagemin-lint-staged',
  ],
};
```

### 与 Husky 集成

```bash
# 安装 Husky
npm install husky --save-dev

# 初始化 Husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

创建的 `.husky/pre-commit` 文件：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 🔧 配置详解

### 基础配置选项

```javascript
// .lintstagedrc.js
module.exports = {
  // 基本文件匹配
  '*.js': 'eslint --fix',

  // 多个命令
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],

  // 函数配置（高级用法）
  '*.ts': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
    'tsc --noEmit'
  ],

  // 条件执行
  '*.{ts,tsx}': (filenames) => {
    const commands = ['eslint --fix'];

    if (filenames.some(file => file.includes('.test.'))) {
      commands.push('jest --findRelatedTests');
    }

    return commands;
  }
};
```

### 高级配置

```javascript
// .lintstagedrc.js
const path = require('path');

module.exports = {
  // 相对路径处理
  '*.{js,jsx,ts,tsx}': (filenames) =>
    filenames.map((filename) => `eslint --fix '${filename}'`),

  // 基于文件内容的条件执行
  '*.js': (filenames) => {
    const commands = [];

    // 检查是否包含 React 组件
    const hasReactFiles = filenames.some(filename => {
      const content = require('fs').readFileSync(filename, 'utf8');
      return content.includes('import React') || content.includes('from "react"');
    });

    commands.push('eslint --fix');

    if (hasReactFiles) {
      commands.push('jest --findRelatedTests');
    }

    return commands;
  },

  // 自定义工作目录
  '*.scss': (filenames) => {
    const cwd = path.resolve(__dirname, 'src/styles');
    return `stylelint --fix --cwd ${cwd}`;
  },

  // 忽略特定文件
  '!(dist|build|node_modules)/**/*.{js,ts}': 'eslint --fix'
};
```

## 🔌 工具集成

### ESLint 集成

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ]
  }
}
```

配置 `.eslintrc.js`：

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
```

### Prettier 集成

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

配置 `.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Stylelint 集成

```json
{
  "lint-staged": {
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

配置 `.stylelintrc.json`：

```json
{
  "extends": [
    "stylelint-config-standard",
    "stylelint-config-prettier"
  ],
  "plugins": [
    "stylelint-scss",
    "stylelint-order"
  ],
  "rules": {
    "order/properties-alphabetical-order": true,
    "scss/at-rule-no-unknown": true,
    "color-hex-case": "lower",
    "color-hex-length": "short"
  }
}
```

### Jest 测试集成

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'jest --findRelatedTests --passWithNoTests'
  ]
};
```

或者更精确的测试执行：

```javascript
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const testFiles = filenames.filter(file =>
      file.includes('.test.') || file.includes('.spec.')
    );

    const sourceFiles = filenames.filter(file =>
      !file.includes('.test.') && !file.includes('.spec.')
    );

    const commands = [
      'eslint --fix',
      'prettier --write'
    ];

    if (testFiles.length > 0) {
      commands.push(`jest ${testFiles.join(' ')}`);
    }

    if (sourceFiles.length > 0) {
      commands.push(`jest --findRelatedTests ${sourceFiles.join(' ')}`);
    }

    return commands;
  }
};
```

### TypeScript 集成

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit' // 类型检查
  ]
};
```

更高级的 TypeScript 配置：

```javascript
module.exports = {
  '*.{ts,tsx}': (filenames) => {
    const commands = [
      `eslint --fix ${filenames.join(' ')}`,
      `prettier --write ${filenames.join(' ')}`
    ];

    // 只对修改的文件进行类型检查
    const tsFiles = filenames.filter(file => file.endsWith('.ts') || file.endsWith('.tsx'));
    if (tsFiles.length > 0) {
      commands.push('tsc --noEmit');
    }

    return commands;
  }
};
```

## 🚀 高级用法

### 条件执行

```javascript
// .lintstagedrc.js
const { execSync } = require('child_process');

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = ['eslint --fix', 'prettier --write'];

    // 检查是否在 CI 环境
    if (process.env.CI) {
      commands.push('jest --findRelatedTests --coverage');
    } else {
      commands.push('jest --findRelatedTests');
    }

    // 检查分支名称
    try {
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (branch === 'main' || branch === 'master') {
        commands.push('npm run build'); // 主分支需要构建检查
      }
    } catch (error) {
      console.warn('无法获取分支信息:', error.message);
    }

    return commands;
  }
};
```

### 文件大小检查

```javascript
// .lintstagedrc.js
const fs = require('fs');
const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // 检查文件大小
    const largeFiles = filenames.filter(filename => {
      const stats = fs.statSync(filename);
      return stats.size > 100 * 1024; // 100KB
    });

    if (largeFiles.length > 0) {
      console.warn('⚠️ 发现大文件:', largeFiles);
      console.warn('请考虑拆分或优化这些文件');
    }

    return [
      'eslint --fix',
      'prettier --write'
    ];
  },

  '*.{png,jpg,jpeg,gif}': (filenames) => {
    const commands = [];

    // 检查图片大小
    filenames.forEach(filename => {
      const stats = fs.statSync(filename);
      if (stats.size > 500 * 1024) { // 500KB
        console.warn(`⚠️ 图片文件过大: ${filename} (${Math.round(stats.size / 1024)}KB)`);
        commands.push(`imagemin ${filename} --out-dir=${path.dirname(filename)}`);
      }
    });

    return commands;
  }
};
```

### 自定义验证

```javascript
// .lintstagedrc.js
const fs = require('fs');

function checkForSecrets(filenames) {
  const secretPatterns = [
    /password\s*=\s*["'][^"']+["']/i,
    /api[_-]?key\s*=\s*["'][^"']+["']/i,
    /secret\s*=\s*["'][^"']+["']/i,
    /token\s*=\s*["'][^"']+["']/i
  ];

  const violations = [];

  filenames.forEach(filename => {
    const content = fs.readFileSync(filename, 'utf8');
    secretPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        violations.push(`${filename}: 可能包含敏感信息`);
      }
    });
  });

  if (violations.length > 0) {
    console.error('❌ 安全检查失败:');
    violations.forEach(violation => console.error(`  ${violation}`));
    process.exit(1);
  }

  return 'echo "✅ 安全检查通过"';
}

module.exports = {
  '*.{js,jsx,ts,tsx,json}': (filenames) => [
    checkForSecrets(filenames),
    'eslint --fix',
    'prettier --write'
  ]
};
```

### 并行执行优化

```javascript
// .lintstagedrc.js
module.exports = {
  // 快速检查（并行执行）
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
  ],

  // 慢速检查（串行执行）
  '*.{ts,tsx}': (filenames) => {
    if (filenames.length > 10) {
      // 文件较多时，分批处理
      const batches = [];
      for (let i = 0; i < filenames.length; i += 5) {
        const batch = filenames.slice(i, i + 5);
        batches.push(`tsc --noEmit ${batch.join(' ')}`);
      }
      return batches;
    }

    return `tsc --noEmit ${filenames.join(' ')}`;
  }
};
```

## 🛠️ 最佳实践

### 性能优化

```javascript
// .lintstagedrc.js
module.exports = {
  // 避免重复的 git add
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write'
    // 不需要 'git add'，lint-staged 会自动处理
  ],

  // 使用缓存提高性能
  '*.js': 'eslint --cache --fix',

  // 限制并发数
  '*.{css,scss}': (filenames) => {
    if (filenames.length > 20) {
      return `stylelint --fix ${filenames.slice(0, 20).join(' ')}`;
    }
    return `stylelint --fix ${filenames.join(' ')}`;
  }
};
```

### 错误处理

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const commands = [];

    // ESLint 检查
    commands.push(`eslint --fix ${filenames.join(' ')}`);

    // Prettier 格式化（即使 ESLint 失败也要执行）
    commands.push(`prettier --write ${filenames.join(' ')}`);

    // 类型检查（可选）
    if (process.env.SKIP_TYPE_CHECK !== 'true') {
      commands.push('tsc --noEmit');
    }

    return commands;
  }
};
```

### 团队配置标准化

```javascript
// .lintstagedrc.js
const baseConfig = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix --max-warnings=0',
    'prettier --write'
  ],
  '*.{json,css,scss,md}': [
    'prettier --write'
  ]
};

// 根据项目类型扩展配置
if (require('./package.json').dependencies.react) {
  baseConfig['*.{jsx,tsx}'] = [
    ...baseConfig['*.{js,jsx,ts,tsx}'],
    'jest --findRelatedTests'
  ];
}

if (require('fs').existsSync('./src/styles')) {
  baseConfig['*.{css,scss,less}'] = [
    'stylelint --fix',
    'prettier --write'
  ];
}

module.exports = baseConfig;
```

### 渐进式采用

```json
{
  "scripts": {
    "lint-staged:install": "npm install lint-staged husky --save-dev",
    "lint-staged:init": "npx husky install && npx husky add .husky/pre-commit \"npx lint-staged\"",
    "lint-staged:basic": "echo 'Basic lint-staged setup complete'",
    "lint-staged:advanced": "echo 'Advanced lint-staged setup complete'"
  },
  "lint-staged": {
    // 第一阶段：只格式化
    "*.{js,jsx,ts,tsx,json,css,md}": "prettier --write",

    // 第二阶段：添加 ESLint（注释掉，逐步启用）
    // "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],

    // 第三阶段：添加测试（注释掉，逐步启用）
    // "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write", "jest --findRelatedTests"]
  }
}
```

## 🔄 CI/CD 集成

### GitHub Actions

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]

jobs:
  lint-staged:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v35
        with:
          files: |
            **/*.{js,jsx,ts,tsx,json,css,scss,md}

      - name: Run lint-staged on changed files
        if: steps.changed-files.outputs.any_changed == 'true'
        run: |
          echo "${{ steps.changed-files.outputs.all_changed_files }}" | xargs git add
          npx lint-staged

      - name: Check for changes
        run: |
          if [[ -n $(git status --porcelain) ]]; then
            echo "❌ 代码格式化后有变更，请在本地运行 lint-staged"
            git diff
            exit 1
          fi
```

### GitLab CI

```yaml
stages:
  - quality

lint-staged:
  stage: quality
  image: node:18
  before_script:
    - npm ci
  script:
    - |
      # 获取变更文件
      CHANGED_FILES=$(git diff --name-only $CI_MERGE_REQUEST_TARGET_BRANCH_SHA $CI_COMMIT_SHA)
      if [ -n "$CHANGED_FILES" ]; then
        echo "$CHANGED_FILES" | xargs git add
        npx lint-staged
      else
        echo "没有文件变更"
      fi
  only:
    - merge_requests
  artifacts:
    reports:
      junit: reports/lint-results.xml
```

### 本地开发脚本

```bash
#!/bin/bash
# scripts/setup-lint-staged.sh

echo "🔧 设置 lint-staged 开发环境..."

# 检查依赖
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 设置 Git Hooks
echo "🪝 设置 Git Hooks..."
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# 测试配置
echo "🧪 测试 lint-staged 配置..."
if npx lint-staged --dry-run; then
    echo "✅ lint-staged 配置正确"
else
    echo "❌ lint-staged 配置有误，请检查"
    exit 1
fi

echo "🎉 lint-staged 设置完成！"
echo "💡 现在每次提交时都会自动运行代码检查"
```

## 🐛 故障排除

### 常见问题

#### lint-staged 不执行

```bash
# 检查 Husky 是否正确安装
ls -la .git/hooks/

# 检查 pre-commit hook
cat .husky/pre-commit

# 手动测试 lint-staged
npx lint-staged --debug
```

#### 文件路径问题

```javascript
// .lintstagedrc.js
const path = require('path');

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // 确保使用正确的文件路径
    const files = filenames.map(file => path.relative(process.cwd(), file));
    return [
      `eslint --fix ${files.join(' ')}`,
      `prettier --write ${files.join(' ')}`
    ];
  }
};
```

#### 性能问题

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    // 限制文件数量
    if (filenames.length > 50) {
      console.warn('⚠️ 文件数量过多，建议分批提交');
      return [];
    }

    return [
      'eslint --fix --cache',
      'prettier --write'
    ];
  }
};
```

#### Windows 兼容性

```javascript
// .lintstagedrc.js
const isWindows = process.platform === 'win32';

module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const quote = isWindows ? '"' : "'";
    const files = filenames.map(file => `${quote}${file}${quote}`).join(' ');

    return [
      `eslint --fix ${files}`,
      `prettier --write ${files}`
    ];
  }
};
```

### 调试技巧

#### 启用详细日志

```bash
# 调试模式运行
npx lint-staged --debug

# 查看匹配的文件
npx lint-staged --dry-run

# 详细输出
DEBUG=lint-staged* npx lint-staged
```

#### 测试配置

```bash
# 创建测试脚本
#!/bin/bash
# test-lint-staged.sh

echo "🧪 测试 lint-staged 配置"

# 创建测试文件
echo "const test = 'hello'" > test-file.js
git add test-file.js

# 运行 lint-staged
if npx lint-staged; then
    echo "✅ 配置测试通过"
else
    echo "❌ 配置测试失败"
fi

# 清理
git reset HEAD test-file.js
rm test-file.js
```

#### 性能分析

```javascript
// .lintstagedrc.js
module.exports = {
  '*.{js,jsx,ts,tsx}': (filenames) => {
    const startTime = Date.now();

    console.log(`🔍 处理 ${filenames.length} 个文件`);

    const commands = [
      'eslint --fix',
      'prettier --write'
    ];

    // 添加性能监控
    commands.push(() => {
      const endTime = Date.now();
      console.log(`⏱️ 处理完成，耗时: ${endTime - startTime}ms`);
      return 'echo "性能监控完成"';
    });

    return commands;
  }
};
```

## 📚 参考资源

### 官方文档
- [lint-staged 官方文档](https://github.com/okonet/lint-staged)
- [配置选项](https://github.com/okonet/lint-staged#configuration)
- [API 参考](https://github.com/okonet/lint-staged#api)

### 工具集成
- [Husky 集成](https://typicode.github.io/husky/)
- [ESLint 配置](https://eslint.org/docs/user-guide/getting-started)
- [Prettier 配置](https://prettier.io/docs/en/configuration.html)
- [Stylelint 配置](https://stylelint.io/user-guide/configure)

### 学习资源
- [Git Hooks 最佳实践](https://githooks.com/)
- [代码质量工具链](https://github.com/okonet/lint-staged#examples)
- [团队协作规范](https://github.com/conventional-changelog/commitlint)

### 社区资源
- [GitHub 仓库](https://github.com/okonet/lint-staged)
- [问题讨论](https://github.com/okonet/lint-staged/discussions)
- [示例配置](https://github.com/okonet/lint-staged/tree/master/examples)

### 相关工具
- [pretty-quick](https://github.com/azz/pretty-quick)
- [precise-commits](https://github.com/nrwl/precise-commits)
- [nano-staged](https://github.com/usmanyunusov/nano-staged)
