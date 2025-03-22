import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "锐🐶",
  description: "锐🐶的博客",
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    i18nRouting: false,

    logo: '/logo.png',

    nav: [
      { text: '🎨 前端核心', link: '/frontend-core' },
      { text: '🧩 框架与生态', link: '/framework-ecosystem' },
      { text: '⚒️ 开发工具链', link: '/dev-toolchain' },
      { text: '📱 跨端开发', link: '/cross-platform' },
      { text: '🗄️ 服务端技术', link: '/server-tech' },
      { text: '🚀 DevOps', link: '/devops' },
      { text: '🧠 计算机基础', link: '/cs-fundamentals' },
      { text: '🔒 安全优化', link: '/security-optimization' }
    ],

    sidebar: {
      '/frontend-core': [{
        text: '🎨 前端核心',
        items: [
          { text: '📄 HTML5', link: '/frontend-core/html' },
          { text: 'CSS3/Sass/Less', link: '/frontend-core/css' },
          { text: 'JavaScript(ES6+)', link: '/frontend-core/javascript' },
          { text: 'TypeScript', link: '/frontend-core/typescript' },
          { text: 'Web API', link: '/frontend-core/webapi' }
        ]
      }],

      '/framework-ecosystem': [{
        text: '🧩 框架与生态',
        items: [
          { text: '🖖 Vue', link: '/framework-ecosystem/vue' },
          { text: 'React', link: '/framework-ecosystem/react' },
          { text: 'Vite/Webpack/Rollup', link: '/framework-ecosystem/toolchain' },
          { text: '状态管理', link: '/framework-ecosystem/state-management' },
          { text: '数据可视化', link: '/framework-ecosystem/visualization' }
        ]
      }],

      '/dev-toolchain': [{
        text: '⚒️ 开发工具链',
        items: [
          { text: '📦 包管理器', link: '/dev-toolchain/package-manager' },
          { text: '构建工具', link: '/dev-toolchain/build-tools' },
          { text: '版本控制', link: '/dev-toolchain/version-control' },
          { text: '测试工具', link: '/dev-toolchain/testing-tools' }
        ]
      }],

      '/cross-platform': [{
        text: '跨端开发',
        items: [
          { text: '小程序开发', link: '/cross-platform/miniprogram' },
          { text: '移动端开发', link: '/cross-platform/mobile' },
          { text: '桌面端开发', link: '/cross-platform/desktop' }
        ]
      }],

      '/server-tech': [{
        text: '服务端技术',
        items: [
          { text: '运行时', link: '/server-tech/runtime' },
          { text: '服务端框架', link: '/server-tech/frameworks' },
          { text: '数据库', link: '/server-tech/database' },
          { text: '通信协议', link: '/server-tech/protocols' }
        ]
      }],

      '/devops': [{
        text: 'DevOps',
        items: [
          { text: '容器化', link: '/devops/containerization' },
          { text: 'CI/CD', link: '/devops/cicd' },
          { text: '云服务', link: '/devops/cloud' },
          { text: '服务器', link: '/devops/servers' }
        ]
      }],

      '/cs-fundamentals': [{
        text: '计算机基础',
        items: [
          { text: '操作系统', link: '/cs-fundamentals/os' },
          { text: '网络协议', link: '/cs-fundamentals/network' },
          { text: '算法结构', link: '/cs-fundamentals/algorithms' },
          { text: '设计模式', link: '/cs-fundamentals/design-patterns' }
        ]
      }],

      '/security-optimization': [{
        text: '🔒 安全优化',
        items: [
          { text: '🛡️ 网络安全', link: '/security-optimization/security' },
          { text: '性能优化', link: '/security-optimization/performance' },
          { text: '代码规范', link: '/security-optimization/code-style' },
          { text: '质量监控', link: '/security-optimization/monitoring' }
        ]
      }]
    },

    /* 右侧大纲配置 */
    outline: {
      level: 'deep',
      label: '目录',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Jerryxierui/Jerry-Blog' }
    ],
    editLink: {
      pattern: 'https://github.com/Jerryxierui/Jerry-Blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          }
        }
      }
    },
    footer: {
      message: '基于 MIT 协议发布 | 转载请注明来源',
      copyright: 'Copyright © 2024-present Jerry Xie'
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    docFooter: {
      prev: '← 上一篇',
      next: '下一篇 →'
    }
  }
})
