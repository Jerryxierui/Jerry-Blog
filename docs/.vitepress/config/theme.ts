export const themeConfig = {
  // 站点标题和描述
  siteTitle: 'Jerry Blog',
  logo: '/logo.svg',
  
  // 搜索配置
  search: {
    provider: 'local',
    options: {
      locales: {
        zh: {
          translations: {
            button: {
              buttonText: '搜索文档',
              buttonAriaLabel: '搜索文档'
            },
            modal: {
              noResultsText: '无法找到相关结果',
              resetButtonTitle: '清除查询条件',
              footer: {
                selectText: '选择',
                navigateText: '切换'
              }
            }
          }
        }
      }
    }
  },

  // 社交链接
  socialLinks: [
    { icon: 'github', link: 'https://github.com/Jerry-Blog' },
    { icon: 'twitter', link: 'https://twitter.com/Jerry-Blog' }
  ],

  // 页脚配置
  footer: {
    message: 'Released under the MIT License.',
    copyright: 'Copyright © 2024 Jerry Blog'
  },

  // 编辑链接
  editLink: {
    pattern: 'https://github.com/Jerry-Blog/Jerry-Blog/edit/main/docs/:path',
    text: '在 GitHub 上编辑此页面'
  },

  // 最后更新时间
  lastUpdated: {
    text: '最后更新于',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'medium'
    }
  },

  // 文档页脚
  docFooter: {
    prev: '上一页',
    next: '下一页'
  },

  // 大纲配置
  outline: {
    level: [2, 3] as [number, number],
    label: '页面导航'
  },

  // 返回顶部
  returnToTopLabel: '回到顶部',

  // 外部链接图标
  externalLinkIcon: true,

  // 深色模式切换
  darkModeSwitchLabel: '主题',
  lightModeSwitchTitle: '切换到浅色模式',
  darkModeSwitchTitle: '切换到深色模式',

  // 侧边栏菜单标签
  sidebarMenuLabel: '菜单',

  // 移动端配置
  mobileBreakpoint: 768
};