# Jerry's Blog

基于VitePress构建的技术博客，提供清晰的文档结构和现代化的阅读体验。

## ✨ 特性
- 📚 使用VitePress快速构建静态站点
- 🎨 支持Markdown扩展语法及自定义主题
- 🚀 内置GitHub Actions自动化部署流程
- 🔍 集成Algolia文档搜索功能

## 🚀 快速开始

### 前置条件
- Node.js 18+
- pnpm

### 本地开发
```bash
pnpm install
pnpm run docs:dev
```

### 构建生产版本
```bash
pnpm run docs:build
```

### 本地预览
```bash
pnpm run docs:preview
```

## 📦 项目结构
```
├── docs
│   ├── .vitepress      # 主题配置
│   ├── public          # 静态资源
│   ├── api-examples.md # API示例
│   └── index.md        # 首页
├── .github/workflows   # CI/CD配置
└── package.json        # 依赖管理
```

## 📄 文档规范
- 使用标准Markdown语法
- 代码块需包含语言标识
- 遵循VitePress的frontmatter格式

## 🌐 部署流程
自动通过GitHub Actions部署到GitHub Pages，详见[部署配置](.github/workflows/deploy.yml)

## 📜 许可证
[MIT License](LICENSE)
