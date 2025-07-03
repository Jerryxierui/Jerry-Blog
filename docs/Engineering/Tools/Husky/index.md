# Husky Git Hooks 工具

## 📖 简介

Husky 是一个强大的 Git Hooks 管理工具，它让在项目中设置和管理 Git 钩子变得简单易用。通过 Husky，开发团队可以在代码提交、推送等关键节点自动执行代码检查、测试、格式化等任务，确保代码质量和团队协作规范。

### 🚀 核心特性

- **简单配置**：通过 package.json 或配置文件轻松设置 Git Hooks
- **团队共享**：确保所有团队成员使用相同的代码质量标准
- **自动化流程**：在关键节点自动执行检查和格式化
- **灵活扩展**：支持各种工具和自定义脚本集成
- **跨平台支持**：在 Windows、macOS、Linux 上一致工作
- **零依赖**：轻量级工具，不会增加项目负担

### 🎯 应用场景

- **代码质量控制**：提交前自动运行 ESLint、Prettier 等工具
- **测试自动化**：推送前自动运行单元测试和集成测试
- **提交规范**：强制执行 Conventional Commits 等提交规范
- **安全检查**：扫描敏感信息和安全漏洞
- **构建验证**：确保代码能够正常构建

## 🏗️ 核心概念

### Git Hooks 简介

Git Hooks 是 Git 在特定事件发生时自动执行的脚本：

- **pre-commit**：提交前执行，用于代码检查和格式化
- **commit-msg**：提交信息验证，确保提交规范
- **pre-push**：推送前执行，运行测试和构建
- **post-merge**：合并后执行，更新依赖或清理缓存
- **post-checkout**：切换分支后执行

### Husky 工作原理

```bash
# Husky 在 .git/hooks/ 目录中创建钩子脚本
# 这些脚本会调用 .husky/ 目录中的配置文件

.git/hooks/pre-commit -> .husky/pre-commit
.git/hooks/commit-msg -> .husky/commit-msg
.git/hooks/pre-push -> .husky/pre-push
```

## ⚙️ 快速开始

### 安装

```bash
# 使用 npm
npm install husky --save-dev

# 使用 yarn
yarn add husky -D

# 使用 pnpm
pnpm add husky -D
```

### 初始化

```bash
# 初始化 Husky
npx husky install

# 设置 package.json 脚本（可选）
npm pkg set scripts.prepare="husky install"
```

### 创建第一个 Hook

```bash
# 创建 pre-commit hook
npx husky add .husky/pre-commit "npm test"

# 创建 commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### 基本项目结构

```
my-project/
├── .husky/
│   ├── _/
│   │   ├── .gitignore
│   │   └── husky.sh
│   ├── pre-commit
│   ├── commit-msg
│   └── pre-push
├── package.json
└── ...
```

## 🔧 配置详解

### package.json 配置

```json
{
  "name": "my-project",
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "build": "npm run lint && npm run test && npm run build:prod",
    "build:prod": "webpack --mode production"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "lint-staged": "^13.2.0",
    "@commitlint/cli": "^17.4.4",
    "@commitlint/config-conventional": "^17.4.4"
  }
}
```

### 常用 Hooks 配置

#### pre-commit Hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行 lint-staged
npx lint-staged

# 运行类型检查
npm run type-check

# 运行单元测试
npm run test:unit
```

#### commit-msg Hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 验证提交信息格式
npx --no -- commitlint --edit "$1"
```

#### pre-push Hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行完整测试套件
npm run test

# 运行构建检查
npm run build

# 运行安全检查
npm audit --audit-level moderate
```

#### post-merge Hook

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 检查 package.json 是否有变化
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_run() {
  echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

# 如果 package.json 发生变化，重新安装依赖
check_run package.json "npm install"

# 如果有新的迁移文件，运行数据库迁移
check_run "migrations/" "npm run db:migrate"
```

## 🔌 工具集成

### 与 lint-staged 集成

安装 lint-staged：

```bash
npm install lint-staged --save-dev
```

配置 package.json：

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ],
    "*.{png,jpg,jpeg,gif,svg}": [
      "imagemin-lint-staged"
    ]
  }
}
```

更新 pre-commit hook：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### 与 Commitlint 集成

安装 Commitlint：

```bash
npm install @commitlint/cli @commitlint/config-conventional --save-dev
```

创建 commitlint.config.js：

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // 修复
        'docs',     // 文档
        'style',    // 格式
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试
        'chore',    // 构建过程或辅助工具的变动
        'revert',   // 回滚
        'build'     // 构建系统
      ]
    ],
    'subject-max-length': [2, 'always', 50],
    'subject-case': [2, 'always', 'lower-case']
  }
};
```

### 与 ESLint 和 Prettier 集成

```bash
# 安装工具
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier --save-dev
```

创建 .eslintrc.js：

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
    '@typescript-eslint/explicit-function-return-type': 'warn'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  }
};
```

创建 .prettierrc：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 与 Jest 集成

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}'
  ]
};
```

更新 pre-push hook：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行测试并检查覆盖率
npm run test:coverage

# 检查测试覆盖率是否达标
if [ $? -ne 0 ]; then
  echo "❌ 测试覆盖率不达标，请增加测试用例"
  exit 1
fi
```

## 🚀 高级配置

### 条件执行

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 只在特定分支执行
branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$branch" = "main" ] || [ "$branch" = "develop" ]; then
  npm run test:full
else
  npm run test:unit
fi

# 只在文件变化时执行
if git diff --cached --name-only | grep -q "\.js$\|\.ts$"; then
  npm run lint
fi
```

### 跳过 Hooks

```bash
# 跳过 pre-commit hook
git commit -m "fix: urgent hotfix" --no-verify

# 跳过 pre-push hook
git push --no-verify

# 设置环境变量跳过
HUSKY=0 git commit -m "skip hooks"
```

### 自定义脚本

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 检查分支命名规范
branch=$(git rev-parse --abbrev-ref HEAD)
valid_pattern="^(feature|bugfix|hotfix|release)\/[a-z0-9-]+$"

if [[ ! $branch =~ $valid_pattern ]]; then
  echo "❌ 分支名称不符合规范: $branch"
  echo "✅ 正确格式: feature/my-feature, bugfix/fix-issue"
  exit 1
fi

# 检查敏感信息
if git diff --cached --name-only | xargs grep -l "password\|secret\|token" 2>/dev/null; then
  echo "❌ 检测到可能的敏感信息，请检查代码"
  exit 1
fi

# 检查文件大小
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    if [ $size -gt 1048576 ]; then  # 1MB
      echo "❌ 文件过大: $file ($(($size / 1024))KB)"
      exit 1
    fi
  fi
done
```

### 团队配置模板

```bash
# scripts/setup-hooks.sh
#!/bin/bash

echo "🔧 设置项目 Git Hooks..."

# 安装 Husky
npm install

# 初始化 Husky
npx husky install

# 创建 pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 运行代码检查..."
npx lint-staged

echo "🧪 运行单元测试..."
npm run test:unit

echo "✅ Pre-commit 检查通过"
EOF

# 创建 commit-msg hook
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "📝 验证提交信息格式..."
npx --no -- commitlint --edit "$1"
EOF

# 创建 pre-push hook
cat > .husky/pre-push << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 运行推送前检查..."
npm run test
npm run build

echo "✅ Pre-push 检查通过"
EOF

# 设置执行权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push

echo "✅ Git Hooks 设置完成！"
```

## 🛠️ 最佳实践

### 渐进式采用

```json
{
  "scripts": {
    "hooks:install": "husky install",
    "hooks:add-precommit": "husky add .husky/pre-commit \"npm run lint:staged\"",
    "hooks:add-commitmsg": "husky add .husky/commit-msg \"npx commitlint --edit $1\"",
    "hooks:add-prepush": "husky add .husky/pre-push \"npm run test\""
  }
}
```

### 性能优化

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 只检查暂存的文件
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "\.js$\|\.ts$")

if [ "$STAGED_FILES" = "" ]; then
  echo "🎉 没有 JS/TS 文件需要检查"
  exit 0
fi

# 并行执行检查
(
  echo "🔍 运行 ESLint..."
  echo $STAGED_FILES | xargs npx eslint
) &

(
  echo "💅 运行 Prettier..."
  echo $STAGED_FILES | xargs npx prettier --check
) &

# 等待所有后台任务完成
wait
```

### 错误处理

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

set -e  # 遇到错误立即退出

# 定义清理函数
cleanup() {
  echo "🧹 清理临时文件..."
  rm -f /tmp/husky-*
}

# 设置退出时执行清理
trap cleanup EXIT

# 执行检查
echo "🔍 开始代码检查..."

if ! npm run lint; then
  echo "❌ ESLint 检查失败"
  echo "💡 运行 'npm run lint:fix' 自动修复部分问题"
  exit 1
fi

if ! npm run test:unit; then
  echo "❌ 单元测试失败"
  echo "💡 请修复测试用例后重新提交"
  exit 1
fi

echo "✅ 所有检查通过！"
```

### 团队协作规范

```markdown
# Git Hooks 使用指南

## 安装
```bash
npm install
npm run prepare
```

## 提交规范
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建工具或依赖更新

## 绕过 Hooks（紧急情况）
```bash
git commit --no-verify -m "emergency fix"
```

## 常见问题
1. Hook 执行失败：检查 Node.js 版本和依赖安装
2. 权限问题：确保 .husky 目录下文件有执行权限
3. 路径问题：使用 npx 而不是直接调用命令
```

## 🔄 CI/CD 集成

### GitHub Actions

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
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

      - name: Setup Husky
        run: npm run prepare

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm run test:coverage

      - name: Check commit messages
        if: github.event_name == 'pull_request'
        run: |
          npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.event.pull_request.head.sha }} --verbose

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

### GitLab CI

```yaml
stages:
  - validate
  - test
  - build

variables:
  NODE_VERSION: "18"

before_script:
  - npm ci
  - npm run prepare

lint:
  stage: validate
  script:
    - npm run lint
    - npm run format:check
  only:
    - merge_requests
    - main

test:
  stage: test
  script:
    - npm run test:coverage
  coverage: '/Lines\s*:\s*(\d+\.?\d*)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

commit-lint:
  stage: validate
  script:
    - npx commitlint --from $CI_MERGE_REQUEST_TARGET_BRANCH_SHA --to $CI_COMMIT_SHA
  only:
    - merge_requests
```

## 🐛 故障排除

### 常见问题

#### Husky 未安装或初始化

```bash
# 检查 Husky 是否正确安装
ls -la .git/hooks/

# 重新初始化
rm -rf .husky
npx husky install
npx husky add .husky/pre-commit "npm test"
```

#### Hook 权限问题

```bash
# 检查权限
ls -la .husky/

# 设置执行权限
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

#### 路径和环境问题

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 确保使用正确的 Node.js 版本
export PATH="$HOME/.nvm/versions/node/v18.17.0/bin:$PATH"

# 使用 npx 确保找到正确的命令
npx --no-install lint-staged
```

#### Windows 兼容性

```bash
# 在 Windows 上使用 Git Bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 处理路径分隔符
if [ "$OS" = "Windows_NT" ]; then
  export PATH="$PATH:/c/Program Files/nodejs"
fi

npm run lint
```

### 调试技巧

#### 启用详细日志

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

set -x  # 启用调试模式

echo "🔍 当前工作目录: $(pwd)"
echo "🔍 Node.js 版本: $(node --version)"
echo "🔍 npm 版本: $(npm --version)"
echo "🔍 Git 分支: $(git branch --show-current)"

npm run lint
```

#### 测试 Hook

```bash
# 手动测试 pre-commit hook
.husky/pre-commit

# 测试特定文件
git add specific-file.js
.husky/pre-commit

# 模拟提交消息测试
echo "feat: add new feature" | .husky/commit-msg
```

#### 性能分析

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

start_time=$(date +%s)

echo "⏱️ 开始执行 pre-commit hook"

# 执行各项检查并记录时间
echo "🔍 运行 ESLint..."
lint_start=$(date +%s)
npm run lint
lint_end=$(date +%s)
echo "✅ ESLint 完成，耗时: $((lint_end - lint_start))s"

echo "🧪 运行测试..."
test_start=$(date +%s)
npm run test:unit
test_end=$(date +%s)
echo "✅ 测试完成，耗时: $((test_end - test_start))s"

end_time=$(date +%s)
echo "🎉 Hook 执行完成，总耗时: $((end_time - start_time))s"
```

## 📚 参考资源

### 官方文档
- [Husky 官方文档](https://typicode.github.io/husky/)
- [Git Hooks 文档](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [lint-staged 文档](https://github.com/okonet/lint-staged)

### 工具集成
- [Commitlint](https://commitlint.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

### 学习资源
- [Git Hooks 最佳实践](https://githooks.com/)
- [代码质量工具链](https://github.com/typicode/husky)
- [团队协作规范](https://github.com/conventional-changelog/commitlint)

### 社区资源
- [GitHub 仓库](https://github.com/typicode/husky)
- [问题讨论](https://github.com/typicode/husky/discussions)
- [示例配置](https://github.com/typicode/husky/tree/main/docs)

### 相关工具
- [pre-commit (Python)](https://pre-commit.com/)
- [lefthook (Go)](https://github.com/evilmartians/lefthook)
- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)
