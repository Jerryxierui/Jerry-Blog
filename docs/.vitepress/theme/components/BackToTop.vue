<template>
  <Transition name="back-to-top">
    <button
      v-if="isVisible"
      class="back-to-top"
      @click="scrollToTop"
      :title="$t?.('backToTop') || '返回顶部'"
      aria-label="返回顶部"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
      </svg>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);
let ticking = false;

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      isVisible.value = window.scrollY > 300;
      ticking = false;
    });
    ticking = true;
  }
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  background: var(--vp-c-brand-2);
}

.back-to-top:active {
  transform: translateY(0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-to-top {
    bottom: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
  }
}

/* 过渡动画 */
.back-to-top-enter-active,
.back-to-top-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-to-top-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

/* 深色模式适配 */
.dark .back-to-top {
  background: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dark .back-to-top:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}
</style>