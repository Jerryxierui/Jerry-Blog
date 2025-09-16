<template>
  <Layout>
    <!-- 添加阅读进度条 -->
    <template #layout-top>
      <ReadingProgress />
    </template>
    
    <!-- 添加动态背景 -->
    <template #home-hero-before>
      <AnimatedBackground />
    </template>
    
    <!-- 添加返回顶部按钮 -->
    <template #layout-bottom>
      <BackToTop />
    </template>
    
    <template #doc-footer-before> </template>
    <template #doc-after>
      <div style="margin-top: 24px">
        <Giscus
          :key="page.filePath"
          repo="Jerryxierui/Jerry-Blog"
          repo-id="R_kgDOOMT-Mw"
          category="*"
          category-id="*"
          mapping="pathname"
          strict="0"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="bottom"
          lang="zh-CN"
          crossorigin="anonymous"
          :theme="isDark ? 'dark' : 'light'"
        />
      </div>
    </template>
  </Layout>
</template>

<script lang="ts" setup>
import Giscus from "@giscus/vue";
import DefaultTheme from "vitepress/theme";
import { watch } from "vue";
import { inBrowser, useData } from "vitepress";

const { isDark, page } = useData();

const { Layout } = DefaultTheme;

watch(isDark, (dark) => {
  if (!inBrowser) return;

  const iframe = document
    .querySelector("giscus-widget")
    ?.shadowRoot?.querySelector("iframe");

  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: dark ? "dark" : "light" } } },
    "https://giscus.app"
  );
});
</script>
