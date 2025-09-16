---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Jerry 技术成长之路"
  text: "从零到一，构建现代化前端技术体系"
  tagline: 💡 分享技术心得 | 🚀 探索前沿技术 | 📚 记录成长足迹
  image:
    src: /logo.png
    alt: Jerry个人知识库
  actions:
    - theme: brand
      text: 🎯 开始学习之旅
      link: /Frontend/Core/HTML/
    - theme: alt
      text: ⭐ GitHub 源码
      link: https://github.com/Jerryxierui/Jerry-Blog
    - theme: alt
      text: 📧 联系作者
      link: mailto:jerry@example.com

features:
  - icon: 🎨
    title: 前端核心技术
    details: |
      掌握现代前端开发的核心技术栈，从基础到进阶：

      **🏗️ 基础技术栈**
      • HTML5 语义化标签与无障碍设计
      • CSS3 高级布局（Grid、Flexbox）与动画
      • JavaScript ES6+ 现代语法与异步编程
      • TypeScript 类型系统与工程化实践
    link: /Frontend/Core/HTML/
    linkText: 🚀 开始学习前端技术

  - icon: ⚛️
    title: 前端框架生态
    details: |
      深入学习主流前端框架及其生态系统：

      **🟢 Vue 生态系统**
      • Vue 3 组合式API与响应式原理
      • Vue Router 4 路由管理
      • Pinia 现代状态管理
      • Nuxt.js 全栈框架

      **🔵 React 生态系统**
      • React 18 并发特性与Hooks
      • React Router 路由解决方案
      • Redux Toolkit 状态管理
      • Next.js 生产级框架
    link: /Frontend/VueFrame/Vue3/
    linkText: 🎯 探索框架生态

  - icon: 📱
    title: 移动端开发
    details: |
      全面覆盖移动端开发技术栈：

      **📲 跨平台解决方案**
      • React Native 原生性能体验
      • Flutter 高性能UI框架
      • Uni-app 一套代码多端运行

      **🔧 小程序开发**
      • 微信小程序原生开发
      • 小程序云开发实践
      • 性能优化与最佳实践
    link: /Frontend/MobileDevs/ReactNative/
    linkText: 📱 学习移动开发

  - icon: 🛠️
    title: 工程化实践
    details: |
      现代前端工程化开发的完整解决方案：

      **🔧 开发工具链**
      • VS Code 高效配置与插件
      • Git 版本控制最佳实践
      • ESLint + Prettier 代码规范
      • Husky + lint-staged 提交规范

      **🚀 构建与部署**
      • Vite/Webpack 构建优化
      • Docker 容器化部署
      • CI/CD 自动化流程
      • 性能监控与错误追踪
    link: /Engineering/Tools/VSCode/
    linkText: ⚙️ 探索工程化

  - icon: 🚀
    title: 性能优化
    details: |
      Web应用性能优化策略与实践：

      **⚡ 加载优化**
      • 代码分割与懒加载
      • 资源压缩与缓存策略
      • CDN 与静态资源优化

      **🎯 运行时优化**
      • 虚拟滚动与长列表优化
      • 内存泄漏检测与修复
      • 渲染性能优化技巧
    link: /Engineering/Performance/CodeSplitting/
    linkText: 🚀 提升性能

  - icon: 🌐
    title: 全栈技术
    details: |
      构建完整的全栈开发技能体系：

      **🖥️ 后端技术**
      • Node.js 服务端开发
      • Express/Koa 框架实践
      • RESTful API 设计
      • GraphQL 查询语言

      **🗄️ 数据库技术**
      • MySQL 关系型数据库
      • MongoDB 文档数据库
      • Redis 缓存与会话
      • 数据库设计与优化
    link: /Backend/Node/Basic/
    linkText: 🌐 学习全栈开发

  - icon: 📚
    title: 计算机基础
    details: |
      扎实的计算机基础知识体系：

      **🧮 算法与数据结构**
      • 常用算法实现与分析
      • 数据结构原理与应用
      • 时间复杂度与空间复杂度

      **🌐 网络与系统**
      • HTTP/HTTPS 协议详解
      • TCP/IP 网络原理
      • 操作系统基础概念
      • 浏览器工作原理
    link: /ComputerScience/Algorithm/DataStruct/
    linkText: 📖 夯实基础知识
---

<!-- 个人介绍区域 -->
<div class="personal-intro">
  <div class="intro-container">
    <div class="intro-content">
      <div class="intro-text">
        <h2>👋 Hello, I'm Jerry</h2>
        <p>一名充满激情的全栈开发工程师，专注于现代Web技术栈的探索与实践。从前端到后端，从设计到部署，我致力于构建优雅、高效、用户友好的数字产品。</p>
        <div class="intro-highlights">
          <div class="highlight-item">
            <span class="highlight-icon">🎯</span>
            <span class="highlight-text">专注前端技术深度学习</span>
          </div>
          <div class="highlight-item">
            <span class="highlight-icon">🚀</span>
            <span class="highlight-text">追求代码质量与性能优化</span>
          </div>
          <div class="highlight-item">
            <span class="highlight-icon">📚</span>
            <span class="highlight-text">热衷技术分享与知识传播</span>
          </div>
        </div>
        <div class="intro-stats">
          <div class="stat-item">
            <span class="stat-number">5+</span>
            <span class="stat-label">年开发经验</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">100+</span>
            <span class="stat-label">技术文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">开源项目</span>
          </div>
        </div>
      </div>
      <div class="intro-avatar">
        <div class="avatar-wrapper">
           <img src="/avatar.svg" alt="Jerry" class="avatar-img" />
           <div class="avatar-ring"></div>
         </div>
      </div>
    </div>
  </div>
</div>

<!-- 技术栈展示 -->
<div class="tech-stack">
  <div class="tech-container">
    <h2>🛠️ 技术栈</h2>
    <div class="tech-categories">
      <div class="tech-category">
        <h3>前端框架</h3>
        <div class="tech-items">
          <span class="tech-item vue">Vue.js</span>
          <span class="tech-item react">React</span>
          <span class="tech-item angular">Angular</span>
        </div>
      </div>
      <div class="tech-category">
        <h3>构建工具</h3>
        <div class="tech-items">
          <span class="tech-item vite">Vite</span>
          <span class="tech-item webpack">Webpack</span>
          <span class="tech-item rollup">Rollup</span>
        </div>
      </div>
      <div class="tech-category">
        <h3>后端技术</h3>
        <div class="tech-items">
          <span class="tech-item nodejs">Node.js</span>
          <span class="tech-item nestjs">NestJS</span>
          <span class="tech-item express">Express</span>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 社交链接区域 -->
<div class="social-links">
  <div class="social-container">
    <h2>🌐 联系我</h2>
    <div class="social-items">
      <a href="https://github.com/Jerryxierui" target="_blank" class="social-item github">
        <svg viewBox="0 0 24 24" class="social-icon">
          <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <span>GitHub</span>
      </a>
      <a href="mailto:jerry@example.com" class="social-item email">
        <svg viewBox="0 0 24 24" class="social-icon">
          <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
        <span>Email</span>
      </a>
      <a href="https://blog.jerry.com" target="_blank" class="social-item blog">
        <svg viewBox="0 0 24 24" class="social-icon">
          <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
        <span>博客</span>
      </a>
      <a href="https://twitter.com/jerry" target="_blank" class="social-item twitter">
        <svg viewBox="0 0 24 24" class="social-icon">
          <path fill="currentColor" d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
        </svg>
        <span>Twitter</span>
      </a>
    </div>
  </div>
</div>

<!-- 成就徽章区域 -->
<div class="achievements">
  <div class="achievements-container">
    <h2>🏆 成就徽章</h2>
    <div class="achievement-grid">
      <div class="achievement-item">
        <div class="achievement-icon">🚀</div>
        <div class="achievement-content">
          <h3>前端专家</h3>
          <p>精通现代前端技术栈</p>
        </div>
      </div>
      <div class="achievement-item">
        <div class="achievement-icon">📚</div>
        <div class="achievement-content">
          <h3>技术博主</h3>
          <p>分享50+技术文章</p>
        </div>
      </div>
      <div class="achievement-item">
        <div class="achievement-icon">🛠️</div>
        <div class="achievement-content">
          <h3>开源贡献者</h3>
          <p>维护多个开源项目</p>
        </div>
      </div>
      <div class="achievement-item">
        <div class="achievement-icon">🎯</div>
        <div class="achievement-content">
          <h3>全栈工程师</h3>
          <p>前后端技术全覆盖</p>
        </div>
      </div>
      <div class="achievement-item">
        <div class="achievement-icon">⚡</div>
        <div class="achievement-content">
          <h3>性能优化师</h3>
          <p>专注Web性能优化</p>
        </div>
      </div>
      <div class="achievement-item">
        <div class="achievement-icon">🌟</div>
        <div class="achievement-content">
          <h3>技术导师</h3>
          <p>指导团队技术成长</p>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
/* 全局动画优化 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 个人介绍区域样式 */
.personal-intro {
  margin: 4rem 0;
  padding: 3rem 2rem;
  background: linear-gradient(135deg,
    rgba(var(--vp-c-brand-1), 0.08) 0%,
    rgba(var(--vp-c-brand-2), 0.08) 100%);
  border-radius: 24px;
  border: 1px solid rgba(var(--vp-c-brand-1), 0.2);
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.8s ease-out;
}

.personal-intro::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

.intro-container {
  max-width: 1200px;
  margin: 0 auto;
}

.intro-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  align-items: center;
}

.intro-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.intro-text p {
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}

.intro-highlights {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 2rem;
}

.highlight-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem 1rem;
  background: rgba(var(--vp-c-brand-1), 0.1);
  border-radius: 12px;
  border-left: 3px solid var(--vp-c-brand-1);
  transition: all 0.3s ease;
}

.highlight-item:hover {
  background: rgba(var(--vp-c-brand-1), 0.15);
  transform: translateX(5px);
}

.highlight-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.highlight-text {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
  font-weight: 500;
}

.intro-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: bold;
  color: var(--vp-c-brand-1);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.intro-avatar {
  display: flex;
  justify-content: center;
}

.avatar-wrapper {
  position: relative;
  width: 200px;
  height: 200px;
  animation: float 6s ease-in-out infinite;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--vp-c-brand-1);
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(var(--vp-c-brand-1), 0.3);
}

.avatar-img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(var(--vp-c-brand-1), 0.4);
}

.avatar-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid var(--vp-c-brand-2);
  border-radius: 50%;
  opacity: 0.3;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.05); opacity: 0.6; }
}

/* 技术栈展示样式 */
.tech-stack {
  margin: 4rem 0;
  padding: 3rem 2rem;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.tech-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.tech-container h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tech-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.tech-category {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tech-category::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tech-category:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--vp-c-brand-1), 0.3);
}

.tech-category:hover::before {
  transform: scaleX(1);
}

.tech-category h3 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--vp-c-text-1);
}

.tech-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
}

.tech-item {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tech-item.vue {
  background: rgba(79, 192, 141, 0.1);
  color: #4fc08d;
  border: 1px solid rgba(79, 192, 141, 0.3);
}

.tech-item.react {
  background: rgba(97, 218, 251, 0.1);
  color: #61dafb;
  border: 1px solid rgba(97, 218, 251, 0.3);
}

.tech-item.angular {
  background: rgba(221, 0, 49, 0.1);
  color: #dd0031;
  border: 1px solid rgba(221, 0, 49, 0.3);
}

.tech-item.vite {
  background: rgba(100, 108, 255, 0.1);
  color: #646cff;
  border: 1px solid rgba(100, 108, 255, 0.3);
}

.tech-item.webpack {
  background: rgba(142, 214, 251, 0.1);
  color: #8ed6fb;
  border: 1px solid rgba(142, 214, 251, 0.3);
}

.tech-item.rollup {
  background: rgba(255, 61, 113, 0.1);
  color: #ff3d71;
  border: 1px solid rgba(255, 61, 113, 0.3);
}

.tech-item.nodejs {
  background: rgba(104, 160, 99, 0.1);
  color: #68a063;
  border: 1px solid rgba(104, 160, 99, 0.3);
}

.tech-item.nestjs {
  background: rgba(234, 20, 94, 0.1);
  color: #ea145e;
  border: 1px solid rgba(234, 20, 94, 0.3);
}

.tech-item.express {
  background: rgba(68, 68, 68, 0.1);
  color: #444;
  border: 1px solid rgba(68, 68, 68, 0.3);
}

.tech-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 社交链接样式 */
.social-links {
  margin: 4rem 0;
  padding: 3rem 2rem;
  background: linear-gradient(135deg,
    rgba(var(--vp-c-brand-2), 0.08) 0%,
    rgba(var(--vp-c-brand-1), 0.08) 100%);
  border-radius: 24px;
  border: 1px solid rgba(var(--vp-c-brand-1), 0.2);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.social-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.social-container h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.social-items {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.social-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 50px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.social-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.social-item:hover::before {
  left: 100%;
}

.social-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.social-item.github:hover {
  border-color: #333;
  color: #333;
}

.social-item.email:hover {
  border-color: #ea4335;
  color: #ea4335;
}

.social-item.blog:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.social-item.twitter:hover {
  border-color: #1da1f2;
  color: #1da1f2;
}

.social-icon {
  width: 24px;
  height: 24px;
}

/* 成就徽章样式 */
.achievements {
  margin: 4rem 0;
  padding: 3rem 2rem;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.achievements-container h2 {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.achievement-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.achievement-item:hover::before {
  transform: scaleX(1);
}

.achievement-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--vp-c-brand-1), 0.3);
}

.achievement-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(var(--vp-c-brand-1), 0.3);
}

.achievement-content {
  text-align: left;
}

.achievement-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: var(--vp-c-text-1);
}

.achievement-content p {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .intro-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .intro-highlights {
    margin-bottom: 1.5rem;
  }

  .highlight-item {
    padding: 0.6rem 0.8rem;
  }

  .highlight-item:hover {
    transform: translateY(-2px);
  }

  .intro-stats {
    justify-content: center;
    gap: 1.5rem;
  }

  .tech-categories {
    grid-template-columns: 1fr;
  }

  .personal-intro,
  .tech-stack,
  .social-links,
  .achievements {
    padding: 2rem 1rem;
  }

  .social-items {
    gap: 1rem;
  }

  .social-item {
    padding: 0.8rem 1.5rem;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .achievement-item {
    flex-direction: column;
    text-align: center;
  }

  .achievement-content {
    text-align: center;
  }
}
</style>

---

<Confetti />

## 🎯 学习路径推荐

### 🌱 前端入门路径
1. **基础三剑客** → HTML5 + CSS3 + JavaScript ES6+
2. **现代工具链** → TypeScript + Vite + Git
3. **框架选择** → Vue 3 或 React 18
4. **工程化实践** → 代码规范 + 性能优化 + 部署上线

### 🚀 进阶发展路径
- **全栈方向** → Node.js + 数据库 + 服务端渲染
- **移动端方向** → React Native / Flutter / 小程序
- **工程化方向** → 构建优化 + 微前端 + DevOps
- **架构方向** → 设计模式 + 系统设计 + 技术选型

## 📊 技术栈覆盖

| 技术领域 | 核心技术 | 进阶技术 | 实战项目 |
|---------|---------|---------|----------|
| **前端基础** | HTML/CSS/JS | TypeScript/ES6+ | 响应式网站 |
| **Vue生态** | Vue3/Router/Pinia | Nuxt.js/Vite | SPA应用 |
| **React生态** | React18/Hooks/Redux | Next.js/SSR | 企业级应用 |
| **移动开发** | 小程序/H5 | RN/Flutter/Uni-app | 跨平台应用 |
| **后端技术** | Node.js/Express | 数据库/缓存 | API服务 |
| **工程化** | 构建工具/代码规范 | 性能优化/部署 | CI/CD流程 |

## 🎉 特色亮点

- 📝 **系统性学习** - 从基础到进阶的完整知识体系
- 💡 **实战导向** - 理论结合实践，注重动手能力
- 🔄 **持续更新** - 跟随技术发展，保持内容新鲜度
- 🎯 **最佳实践** - 分享行业标准和开发经验
- 📱 **移动优先** - 完美适配各种设备和屏幕

## 🤝 参与贡献

这个知识库是开源的，欢迎大家参与贡献！

- 🐛 **发现问题** → [提交Issue](https://github.com/Jerryxierui/Jerry-Blog/issues)
- 💡 **改进建议** → [讨论区交流](https://github.com/Jerryxierui/Jerry-Blog/discussions)
- 🔧 **代码贡献** → [提交PR](https://github.com/Jerryxierui/Jerry-Blog/pulls)
- ⭐ **支持项目** → [给个Star](https://github.com/Jerryxierui/Jerry-Blog)

---

> 💪 **持续学习，永不止步！** 在技术的海洋中，我们都是永远的学习者。让我们一起在前端开发的道路上不断探索、成长和进步！
