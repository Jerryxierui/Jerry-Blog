import { defineConfig } from 'vitepress'
import type { VitePressConfig } from './config/types'
import { nav } from './config/nav'
import { sidebar } from './config/sidebar'
import { themeConfig } from './config/theme'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Jerry Blog",
  description: "Jerry's personal blog about frontend development",
  lang: 'zh-CN',
  base: '/',
  lastUpdated: true,
  cleanUrls: true,
  appearance: "dark",

  // Head 配置
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'keywords', content: 'frontend, javascript, vue, react, typescript, web development' }],
    ['meta', { name: 'author', content: 'Jerry' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap', rel: 'stylesheet' }]
  ],

  // Markdown 配置
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    toc: {
      level: [2, 3]
    }
  },

  // Vite 配置
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./theme/variables.scss";`
        }
      }
    },
    optimizeDeps: {
      exclude: ['vitepress']
    }
  },

  // 站点地图
  sitemap: {
    hostname: 'https://jerry-blog.com'
  },

  // 主题配置
  themeConfig: {
    ...themeConfig,
    nav,
    sidebar,

    // 其他主题配置
    i18nRouting: false,
    logo: '/logo.png'
  }
})
