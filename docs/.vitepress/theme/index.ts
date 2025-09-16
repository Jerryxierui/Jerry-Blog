import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import BackToTop from './components/BackToTop.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import AnimatedBackground from './components/AnimatedBackground.vue'
import Confetti from './components/Confetti.vue'
import './custom.css'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BackToTop', BackToTop)
    app.component('ReadingProgress', ReadingProgress)
    app.component('AnimatedBackground', AnimatedBackground)
    app.component('Confetti', Confetti)
  }
}
