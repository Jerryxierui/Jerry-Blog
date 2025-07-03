# Git 版本控制

## 简介

Git 是目前世界上最先进的分布式版本控制系统，由 Linux 之父 Linus Torvalds 开发，广泛应用于软件开发项目的版本管理。

## 核心概念

### 🎯 基本概念
- **仓库（Repository）**：存储项目文件和版本历史的地方
- **工作区（Working Directory）**：当前正在编辑的文件目录
- **暂存区（Staging Area）**：准备提交的文件临时存储区
- **提交（Commit）**：保存文件快照到版本历史
- **分支（Branch）**：独立的开发线路
- **合并（Merge）**：将不同分支的更改合并到一起

### Git 工作流程
```
工作区 → 暂存区 → 本地仓库 → 远程仓库
  ↓        ↓        ↓        ↓
 edit → add → commit → push
```

## 基础命令

### 仓库初始化
```bash
# 初始化新仓库
git init

# 克隆远程仓库
git clone <url>

# 添加远程仓库
git remote add origin <url>
```

### 基本操作
```bash
# 查看状态
git status

# 添加文件到暂存区
git add <file>          # 添加单个文件
git add .               # 添加所有文件
git add -A              # 添加所有文件（包括删除）

# 提交更改
git commit -m "提交信息"
git commit -am "提交信息"  # 添加并提交已跟踪文件

# 查看提交历史
git log
git log --oneline       # 简洁格式
git log --graph         # 图形化显示
```

### 文件操作
```bash
# 查看文件差异
git diff                # 工作区与暂存区差异
git diff --cached       # 暂存区与最新提交差异
git diff HEAD           # 工作区与最新提交差异

# 撤销更改
git checkout -- <file>  # 撤销工作区更改
git reset HEAD <file>   # 撤销暂存区更改
git reset --hard HEAD   # 撤销所有更改

# 删除文件
git rm <file>           # 删除文件并暂存
git rm --cached <file>  # 从暂存区删除但保留工作区
```

## 分支管理

### 分支操作
```bash
# 查看分支
git branch              # 查看本地分支
git branch -r           # 查看远程分支
git branch -a           # 查看所有分支

# 创建分支
git branch <branch-name>
git checkout -b <branch-name>  # 创建并切换

# 切换分支
git checkout <branch-name>
git switch <branch-name>       # Git 2.23+

# 删除分支
git branch -d <branch-name>     # 删除已合并分支
git branch -D <branch-name>     # 强制删除分支
```

### 合并分支
```bash
# 合并分支
git merge <branch-name>

# 变基合并
git rebase <branch-name>

# 解决冲突后
git add <conflicted-file>
git commit
```

## 远程操作

### 远程仓库
```bash
# 查看远程仓库
git remote -v

# 获取远程更新
git fetch origin
git pull origin <branch>   # fetch + merge

# 推送到远程
git push origin <branch>
git push -u origin <branch>  # 设置上游分支

# 删除远程分支
git push origin --delete <branch>
```

## 高级功能

### 标签管理
```bash
# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "版本 1.0.0"

# 查看标签
git tag
git show v1.0.0

# 推送标签
git push origin v1.0.0
git push origin --tags

# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### 储藏功能
```bash
# 储藏当前工作
git stash
git stash save "储藏信息"

# 查看储藏列表
git stash list

# 应用储藏
git stash apply
git stash pop           # 应用并删除

# 删除储藏
git stash drop
git stash clear         # 清空所有储藏
```

### 重写历史
```bash
# 修改最后一次提交
git commit --amend

# 交互式变基
git rebase -i HEAD~3

# 重置提交
git reset --soft HEAD~1   # 保留更改在暂存区
git reset --mixed HEAD~1  # 保留更改在工作区
git reset --hard HEAD~1   # 丢弃所有更改
```

## Git 配置

### 全局配置
```bash
# 用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 编辑器
git config --global core.editor "code --wait"

# 别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

# 查看配置
git config --list
git config user.name
```

### .gitignore 文件
```gitignore
# 依赖目录
node_modules/
dist/
build/

# 日志文件
*.log
logs/

# 环境变量
.env
.env.local

# IDE 文件
.vscode/
.idea/
*.swp
*.swo

# 操作系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
*.temp
```

## 工作流模式

### Git Flow
```bash
# 主要分支
- master/main: 生产环境代码
- develop: 开发环境代码

# 辅助分支
- feature/*: 功能开发分支
- release/*: 发布准备分支
- hotfix/*: 紧急修复分支
```

### GitHub Flow
```bash
# 简化流程
1. 从 main 分支创建功能分支
2. 在功能分支上开发
3. 创建 Pull Request
4. 代码审查和测试
5. 合并到 main 分支
6. 部署到生产环境
```

## 最佳实践

### 提交规范
```bash
# 提交信息格式
<type>(<scope>): <subject>

# 类型说明
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动

# 示例
feat(auth): 添加用户登录功能
fix(api): 修复数据获取错误
docs(readme): 更新安装说明
```

### 分支命名
```bash
# 功能分支
feature/user-authentication
feature/shopping-cart

# 修复分支
fix/login-error
hotfix/critical-security-issue

# 发布分支
release/v1.2.0
```

### 代码审查
1. **小而频繁的提交**：便于审查和回滚
2. **清晰的提交信息**：说明更改的目的和内容
3. **使用 Pull Request**：进行代码审查和讨论
4. **自动化测试**：确保代码质量

## 故障排除

### 常见问题
```bash
# 合并冲突
git status              # 查看冲突文件
# 手动解决冲突后
git add <file>
git commit

# 撤销合并
git merge --abort

# 找回丢失的提交
git reflog
git checkout <commit-hash>

# 清理未跟踪文件
git clean -fd
```

### 性能优化
```bash
# 垃圾回收
git gc

# 压缩仓库
git repack -ad

# 检查仓库完整性
git fsck
```

## 图形化工具

### 推荐工具
- **SourceTree**：免费的 Git 图形化客户端
- **GitKraken**：功能强大的 Git GUI
- **GitHub Desktop**：GitHub 官方客户端
- **VS Code Git**：VS Code 内置 Git 功能
- **Tower**：专业的 Git 客户端（付费）

## 参考资源

- [Git 官方文档](https://git-scm.com/doc)
- [Pro Git 书籍](https://git-scm.com/book)
- [Git 教程 - 廖雪峰](https://www.liaoxuefeng.com/wiki/896043488029600)
- [GitHub 帮助文档](https://docs.github.com/)
- [Git 命令参考](https://git-scm.com/docs)

---

> 💡 **提示**：Git 是现代软件开发的基础工具，掌握 Git 的使用对于团队协作和项目管理至关重要！