<template>
  <div class="animated-background">
    <div class="floating-shapes">
      <div 
        v-for="i in 6" 
        :key="i" 
        class="shape" 
        :class="`shape-${i}`"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 纯CSS动画，无需JavaScript逻辑
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(45deg, 
    rgba(var(--vp-c-brand-1), 0.1), 
    rgba(var(--vp-c-brand-2), 0.1));
  animation: float-around 20s infinite linear;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 25s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 15%;
  animation-delay: -5s;
  animation-duration: 30s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 30%;
  left: 20%;
  animation-delay: -10s;
  animation-duration: 35s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 25%;
  animation-delay: -15s;
  animation-duration: 28s;
}

.shape-5 {
  width: 70px;
  height: 70px;
  top: 50%;
  left: 50%;
  animation-delay: -20s;
  animation-duration: 32s;
}

.shape-6 {
  width: 90px;
  height: 90px;
  top: 70%;
  right: 40%;
  animation-delay: -25s;
  animation-duration: 26s;
}

@keyframes float-around {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0.3;
  }
  25% {
    transform: translate(30px, -30px) rotate(90deg);
    opacity: 0.6;
  }
  50% {
    transform: translate(-20px, 20px) rotate(180deg);
    opacity: 0.4;
  }
  75% {
    transform: translate(-40px, -10px) rotate(270deg);
    opacity: 0.7;
  }
  100% {
    transform: translate(0, 0) rotate(360deg);
    opacity: 0.3;
  }
}

/* 深色模式下的调整 */
.dark .shape {
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.05), 
    rgba(var(--vp-c-brand-1), 0.1));
}
</style>