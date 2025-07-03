# VS Code 开发工具

## 简介

Visual Studio Code（VS Code）是微软开发的一款免费、开源的现代化代码编辑器，具有强大的功能和丰富的扩展生态系统。

## 核心特性

### 🚀 主要优势
- **轻量级**：启动速度快，占用资源少
- **跨平台**：支持 Windows、macOS、Linux
- **智能感知**：强大的代码补全和语法高亮
- **集成终端**：内置终端，无需切换窗口
- **Git 集成**：原生支持版本控制
- **丰富扩展**：海量插件生态系统

## 基础配置

### 用户设置
```json
{
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "editor.formatOnSave": true,
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000
}
```

### 工作区设置
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## 必备扩展

### 前端开发
- **ES7+ React/Redux/React-Native snippets**：React 代码片段
- **Auto Rename Tag**：自动重命名配对标签
- **Bracket Pair Colorizer**：括号配对着色
- **Live Server**：本地开发服务器
- **Prettier**：代码格式化
- **ESLint**：代码质量检查

### 通用工具
- **GitLens**：增强 Git 功能
- **Path Intellisense**：路径智能提示
- **Auto Import**：自动导入模块
- **Thunder Client**：API 测试工具
- **Todo Highlight**：TODO 高亮显示

## 快捷键

### 常用快捷键
| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 命令面板 | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| 快速打开文件 | `Ctrl+P` | `Cmd+P` |
| 分割编辑器 | `Ctrl+\` | `Cmd+\` |
| 切换侧边栏 | `Ctrl+B` | `Cmd+B` |
| 切换终端 | `Ctrl+`` | `Cmd+`` |
| 多光标选择 | `Ctrl+D` | `Cmd+D` |

### 编辑快捷键
| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 复制行 | `Shift+Alt+↓` | `Shift+Option+↓` |
| 移动行 | `Alt+↑/↓` | `Option+↑/↓` |
| 删除行 | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| 注释切换 | `Ctrl+/` | `Cmd+/` |
| 块注释 | `Shift+Alt+A` | `Shift+Option+A` |

## 代码片段

### 自定义代码片段
```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "const $1 = () => {",
      "  return (",
      "    <div>",
      "      $2",
      "    </div>",
      "  );",
      "};",
      "",
      "export default $1;"
    ],
    "description": "React Functional Component"
  }
}
```

## 调试配置

### launch.json 配置
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    },
    {
      "name": "Debug Node.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/app.js"
    }
  ]
}
```

## 主题和图标

### 推荐主题
- **One Dark Pro**：流行的暗色主题
- **Material Theme**：Material Design 风格
- **Dracula**：经典的暗色主题
- **GitHub Theme**：GitHub 官方主题

### 图标主题
- **Material Icon Theme**：Material 风格图标
- **VSCode Icons**：丰富的文件图标

## 性能优化

### 提升性能的设置
```json
{
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/dist/**": true
  }
}
```

## 最佳实践

### 工作区管理
1. **使用工作区文件**：保存项目特定配置
2. **合理组织文件夹**：使用文件夹结构管理项目
3. **利用多根工作区**：同时管理多个项目

### 代码质量
1. **配置 ESLint 和 Prettier**：保持代码风格一致
2. **使用 TypeScript**：提供类型检查
3. **编写单元测试**：确保代码质量

### 团队协作
1. **共享配置文件**：统一团队开发环境
2. **使用 Live Share**：实时协作编程
3. **配置 Git 钩子**：自动化代码检查

## 故障排除

### 常见问题
1. **扩展冲突**：禁用不必要的扩展
2. **性能问题**：检查文件监听和搜索排除设置
3. **智能感知失效**：重启 TypeScript 服务

### 重置设置
```bash
# 重置用户设置
rm -rf ~/.vscode/settings.json

# 清除扩展缓存
rm -rf ~/.vscode/extensions
```

## 参考资源

- [VS Code 官方文档](https://code.visualstudio.com/docs)
- [VS Code 扩展市场](https://marketplace.visualstudio.com/)
- [VS Code 快捷键参考](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf)
- [VS Code 技巧和窍门](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)

---

> 💡 **提示**：VS Code 是现代前端开发的必备工具，合理配置和使用扩展可以大大提升开发效率！