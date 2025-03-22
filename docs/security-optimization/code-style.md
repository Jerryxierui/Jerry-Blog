---
layout: doc
---

# 代码规范

## 核心原则

- 遵循ESLint + Prettier统一规范
- 严格的TypeScript类型约束
- 语义化的Git提交信息
- 组件化的代码组织方式

## 最佳实践

1. 函数不超过50行
2. 组件props类型明确定义
3. 避免any类型使用
4. 重要逻辑添加TSDoc注释

## 自动化检查

```bash
# 安装依赖
pnpm add -D eslint prettier

# 运行检查
eslint --ext .ts,.vue src/
```
