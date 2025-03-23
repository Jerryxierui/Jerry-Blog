import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "锐🐶",
  description: "锐🐶的博客",
  lastUpdated: true,
  cleanUrls: true,
  //启用深色模式
  appearance: "dark",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    i18nRouting: false,

    logo: '/logo.png',

    nav: [
      {
        text: '🎨 前端核心',
        items: [
          { text: 'HTML',link: '/FrontendCore/HTML/'},
          { text: 'CSS',link: '/FrontendCore/CSS/'},
          { text: 'JavaScript',link: '/docs/FrontendCore/JavaScript/index.md'},
          { text: 'TypeScript',link: '/docs/FrontendCore/TypeScript/index.md'},
          { text: 'ES6+',link: '/docs/FrontendCore/ES6+/index.md'}
        ]
      },
      {
        text: '🧩 框架与生态',
        items: [
          { text: 'Vue',link: '/docs/FrameworkAndEcosystem/Vue/index.md'},
          { text: 'React',link: '/docs/FrameworkAndEcosystem/React/index.md'},
          { text: 'Vite',link: '/docs/FrameworkAndEcosystem/Vite/index.md'},
          { text: 'Webpack',link: '/docs/FrameworkAndEcosystem/Webpack/index.md'},
          { text: 'Rollup',link: '/docs/FrameworkAndEcosystem/Rollup/index.md'},
          { text: 'Pinia',link: '/docs/FrameworkAndEcosystem/Pinia/index.md'},
          { text: 'Vuex',link: '/docs/FrameworkAndEcosystem/Vuex/index.md'},
          { text: 'Redux',link: '/docs/FrameworkAndEcosystem/Redux/index.md'},
          { text: 'Vue Router',link: '/docs/FrameworkAndEcosystem/VueRouter/index.md'},
          { text: 'React Router',link: '/docs/FrameworkAndEcosystem/ReactRouter/index.md'},
          { text: 'Axios',link: '/docs/FrameworkAndEcosystem/Axios/index.md'},
          { text: 'Echarts',link: '/docs/FrameworkAndEcosystem/Echarts/index.md'},
          { text: 'D3',link: '/docs/FrameworkAndEcosystem/D3/index.md'},
          { text: 'Three.js',link: '/docs/FrameworkAndEcosystem/Three.js/index.md'},
          { text: 'Mars3d',link: '/docs/FrameworkAndEcosystem/Mars3d/index.md'},
          { text: 'Axios',link: '/docs/FrameworkAndEcosystem/Axios/index.md'},
          { text: 'Cesium',link: '/docs/FrameworkAndEcosystem/Cesium/index.md'},
          { text: 'Mars3D',link: '/docs/FrameworkAndEcosystem/Mars3d/index.md'}
        ]
      },
      {
        text: '⚒️ 开发工具链',
        items: [
          { text: '包管理', link: '/docs/DevToolsChain/PackageManagers/index.md' },
          { text: '构建工具', link: '/docs/DevToolsChain/BuildTools/index.md' },
          { text: '版本控制', link: '/docs/DevToolsChain/VersionControl/index.md' },
          { text: '测试工具', link: '/docs/DevToolsChain/TestingTools/index.md' }
        ]
      },
      {
        text: '📱 跨端开发',
        items: [
          { text: '小程序', link: '/docs/CrossPlatform/MiniProgram/index.md' },
          { text: '移动端', link: '/docs/CrossPlatform/Mobile/index.md' },
          { text: '桌面端', link: '/docs/CrossPlatform/Desktop/index.md' }
        ]
      },
      {
        text: '🗄️ 服务端技术',
        items: [
          { text: '运行时', link: '/docs/ServerTech/Runtime/index.md' },
          { text: '框架', link: '/docs/ServerTech/Frameworks/index.md' },
          { text: '数据库', link: '/docs/ServerTech/Databases/index.md' },
          { text: '通信协议', link: '/docs/ServerTech/Protocols/index.md' }
        ]
      },
      {
        text: '🚀 DevOps',
        items: [
          { text: '容器化', link: '/docs/DevOps/Containerization/index.md' },
          { text: 'CI/CD', link: '/docs/DevOps/CI_CD/index.md' },
          { text: '云服务', link: '/docs/DevOps/CloudServices/index.md' },
          { text: '服务器', link: '/docs/DevOps/Servers/index.md' }
        ]
      },
      {
        text: '🧠 计算机基础',
        items: [
          { text: '操作系统', link: '/docs/CSFundamentals/OS/index.md' },
          { text: '网络协议', link: '/docs/CSFundamentals/Network/index.md' },
          { text: '算法结构', link: '/docs/CSFundamentals/Algorithms/index.md' },
          { text: '设计模式', link: '/docs/CSFundamentals/DesignPatterns/index.md' }
        ]
      },
      {
        text: '🔒 安全优化',
        items: [
          { text: '网络安全', link: '/docs/SecurityOptimization/NetworkSecurity/index.md' },
          { text: '性能优化', link: '/docs/SecurityOptimization/Performance/index.md' },
          { text: '代码规范', link: '/docs/SecurityOptimization/CodeStyle/index.md' },
          { text: '质量监控', link: '/docs/SecurityOptimization/Monitoring/index.md' }
        ]
      }
    ],

    sidebar: {},

    /* 右侧大纲配置 */
    outline: {
      level: [2, 6],
      label: '目录',
    },
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Jerryxierui/Jerry-Blog' }
    ],
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/Jerryxierui/Jerry-Blog/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    returnToTopLabel: "返回顶部",
    // 主题
    darkModeSwitchLabel: "深浅模式",
    // 搜索
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
