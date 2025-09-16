<template>
  <div 
    class="reading-progress" 
    :style="{ width: progress + '%' }"
    v-show="showProgress"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { inBrowser } from 'vitepress'

const progress = ref(0)
const showProgress = ref(false)

const updateProgress = () => {
  if (!inBrowser) return
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const scrollPercent = (scrollTop / scrollHeight) * 100
  
  progress.value = Math.min(100, Math.max(0, scrollPercent))
  showProgress.value = scrollTop > 100
}

onMounted(() => {
  if (inBrowser) {
    window.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()
  }
})

onUnmounted(() => {
  if (inBrowser) {
    window.removeEventListener('scroll', updateProgress)
  }
})
</script>

<style scoped>
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  z-index: 1001;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(var(--vp-c-brand-1), 0.5);
}

.dark .reading-progress {
  box-shadow: 0 0 10px rgba(var(--vp-c-brand-1), 0.8);
}
</style>