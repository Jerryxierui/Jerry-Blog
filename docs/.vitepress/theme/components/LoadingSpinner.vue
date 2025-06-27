<template>
  <Transition name="loading">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vitepress';

interface Props {
  text?: string;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  text: '加载中...',
  duration: 500
});

const isLoading = ref(false);
const loadingText = ref(props.text);
const router = useRouter();

let loadingTimer: number | null = null;

const showLoading = () => {
  isLoading.value = true;
  if (loadingTimer) {
    clearTimeout(loadingTimer);
  }
  loadingTimer = setTimeout(() => {
    isLoading.value = false;
  }, props.duration);
};

const hideLoading = () => {
  isLoading.value = false;
  if (loadingTimer) {
    clearTimeout(loadingTimer);
    loadingTimer = null;
  }
};

// 监听路由变化
const handleRouteChange = () => {
  showLoading();
};

onMounted(() => {
  if (router) {
    router.onBeforeRouteChange = handleRouteChange;
  }
});

onUnmounted(() => {
  hideLoading();
});

// 暴露方法供外部调用
defineExpose({
  show: showLoading,
  hide: hideLoading
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--vp-c-divider);
  border-top: 3px solid var(--vp-c-brand-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.loading-enter-active,
.loading-leave-active {
  transition: all 0.3s ease;
}

.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}

/* 深色模式适配 */
.dark .loading-overlay {
  background: rgba(0, 0, 0, 0.8);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .spinner {
    width: 32px;
    height: 32px;
    border-width: 2px;
  }
  
  .loading-text {
    font-size: 0.8rem;
  }
}

/* 减少动画效果（用户偏好） */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
  
  .loading-enter-active,
  .loading-leave-active {
    transition: none;
  }
}
</style>