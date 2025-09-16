<template>
  <Transition name="back-to-top">
    <button
      v-if="show"
      class="back-to-top-btn"
      @click="scrollToTop"
      aria-label="回到顶部"
    >
      <div class="btn-content">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="arrow-icon"
        >
          <path d="m18 15-6-6-6 6"/>
        </svg>
        <div class="progress-ring">
          <svg class="progress-svg" width="50" height="50">
            <circle
              class="progress-circle"
              cx="25"
              cy="25"
              r="20"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>
        </div>
      </div>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const show = ref(false);
const scrollProgress = ref(0);
let ticking = false;

const circumference = computed(() => 2 * Math.PI * 20);
const progressOffset = computed(() => {
  return circumference.value - (scrollProgress.value / 100) * circumference.value;
});

const handleScroll = () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      
      scrollProgress.value = Math.min(100, Math.max(0, progress));
      show.value = scrollTop > 300;
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
.back-to-top-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  color: var(--vp-c-brand-1);
  border: 2px solid var(--vp-c-brand-1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
}

.dark .back-to-top-btn {
  background: rgba(26, 26, 26, 0.9);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.back-to-top-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.back-to-top-btn:active {
  transform: translateY(-1px) scale(1.02);
}

.btn-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.back-to-top-btn:hover .arrow-icon {
  transform: translateY(-2px);
}

.progress-ring {
  position: absolute;
  top: -1px;
  left: -1px;
  width: 52px;
  height: 52px;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-circle {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
  opacity: 0.3;
}

.back-to-top-btn:hover .progress-circle {
  opacity: 0.8;
  stroke-width: 3;
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
</style>