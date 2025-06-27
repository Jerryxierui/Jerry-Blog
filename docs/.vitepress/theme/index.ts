// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from "./Layout.vue"
import Confetti from './components/Confetti.vue'
import './style.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    });
  },
  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component("Confetti", Confetti)
    
    // 路由守卫 - 页面切换时的处理
    router.onBeforeRouteChange = (to) => {
      // 可以在这里添加页面切换的逻辑
      if (typeof window !== 'undefined') {
        // 页面切换时滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    
    // 全局配置
    app.config.globalProperties.$siteData = siteData;
  }
} satisfies Theme
