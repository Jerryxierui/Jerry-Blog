---
outline: deep
---

# CSS 知识库

## CSS 基础概念

### 什么是 CSS？

CSS（Cascading Style Sheets，层叠样式表）是用于设置网页样式的语言。它描述了 HTML 元素应该如何在屏幕、纸张或其他媒体上显示的规则。

```css
/* 基本CSS语法 */
selector {
  property: value;
  property: value;
}
```

### CSS 引入方式

```html
<!-- 内联样式 -->
<div style="color: blue; font-size: 16px;">内联样式</div>

<!-- 内部样式表 -->
<head>
  <style>
    p {
      color: red;
      font-size: 18px;
    }
  </style>
</head>

<!-- 外部样式表 -->
<head>
  <link rel="stylesheet" href="styles.css">
</head>
```

::: tip
外部样式表是最推荐的方式，它可以提高代码的可维护性和复用性。
:::

## CSS 选择器

### 基础选择器

| 选择器 | 描述 | 示例 |
| --- | --- | --- |
| 元素选择器 | 选择所有指定元素 | `p { color: red; }` |
| 类选择器 | 选择所有带有指定类的元素 | `.info { color: blue; }` |
| ID选择器 | 选择具有指定ID的元素 | `#header { color: green; }` |
| 通用选择器 | 选择所有元素 | `* { margin: 0; }` |

### 组合选择器

```css
/* 后代选择器 */
div p { color: red; }

/* 子元素选择器 */
div > p { color: blue; }

/* 相邻兄弟选择器 */
h1 + p { color: green; }

/* 通用兄弟选择器 */
h1 ~ p { color: purple; }
```

### 伪类和伪元素

```css
/* 伪类 */
a:hover { color: red; }
p:first-child { font-weight: bold; }

/* 伪元素 */
p::first-line { color: blue; }
p::before { content: "→ "; }
p::after { content: " ←"; }
```

::: warning
伪类使用单冒号（:），而伪元素在CSS3中使用双冒号（::）。但为了兼容性，有些伪元素也可以使用单冒号。
:::

### 属性选择器

```css
/* 具有特定属性的元素 */
input[type] { border: 1px solid gray; }

/* 具有特定属性值的元素 */
input[type="text"] { background-color: white; }

/* 属性值包含特定词的元素 */
a[href*="example"] { color: green; }

/* 属性值以特定词开头的元素 */
a[href^="https"] { color: green; }

/* 属性值以特定词结尾的元素 */
a[href$=".pdf"] { color: red; }
```

## CSS 盒模型

### 标准盒模型与怪异盒模型

```css
/* 标准盒模型 */
.box {
  box-sizing: content-box; /* 默认值 */
  width: 100px;
  padding: 10px;
  border: 5px solid black;
  margin: 20px;
}
/* 总宽度 = width + padding-left + padding-right + border-left + border-right = 130px */

/* 怪异盒模型（IE盒模型） */
.box {
  box-sizing: border-box;
  width: 100px;
  padding: 10px;
  border: 5px solid black;
  margin: 20px;
}
/* 总宽度 = width = 100px（padding和border包含在width内） */
```

::: tip
现代开发中，通常会使用 `box-sizing: border-box;` 使元素更容易布局。
:::

### 盒模型属性

```css
.box {
  /* 内容区域 */
  width: 300px;
  height: 200px;

  /* 内边距 */
  padding-top: 10px;
  padding-right: 20px;
  padding-bottom: 10px;
  padding-left: 20px;
  /* 简写 */
  padding: 10px 20px; /* 上下 左右 */
  padding: 10px 20px 15px 25px; /* 上 右 下 左 */

  /* 边框 */
  border-width: 2px;
  border-style: solid;
  border-color: black;
  /* 简写 */
  border: 2px solid black;
  border-radius: 5px; /* 圆角 */

  /* 外边距 */
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
  /* 简写 */
  margin: 10px 20px; /* 上下 左右 */
  margin: 10px 20px 15px 25px; /* 上 右 下 左 */
  margin: 0 auto; /* 水平居中 */
}
```

### 外边距折叠

当两个垂直相邻的块级元素的外边距相遇时，它们会形成一个外边距，这个外边距的高度等于两个发生折叠的外边距中较大的那个。

```css
.box1 {
  margin-bottom: 20px;
}

.box2 {
  margin-top: 30px;
}
/* 两个盒子之间的实际间距是30px，而不是50px */
```

## CSS 布局技术

### 浮动布局

```css
.left {
  float: left;
  width: 30%;
}

.right {
  float: right;
  width: 65%;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

::: warning
浮动元素会脱离正常文档流，可能导致父元素高度塌陷。使用 `clearfix` 技术可以解决这个问题。
:::

### Flexbox 布局

Flexbox 是一维布局模型，适用于一行或一列的布局。

```css
.container {
  display: flex;
  flex-direction: row; /* row | row-reverse | column | column-reverse */
  flex-wrap: wrap; /* nowrap | wrap | wrap-reverse */
  justify-content: space-between; /* flex-start | flex-end | center | space-between | space-around | space-evenly */
  align-items: center; /* flex-start | flex-end | center | baseline | stretch */
  align-content: space-around; /* flex-start | flex-end | center | space-between | space-around | stretch */
  gap: 10px; /* 项目之间的间隙 */
}

.item {
  flex-grow: 1; /* 定义项目的放大比例，默认为0 */
  flex-shrink: 0; /* 定义项目的缩小比例，默认为1 */
  flex-basis: auto; /* 定义项目在分配空间之前的初始大小 */
  /* 简写 */
  flex: 1 0 auto; /* grow shrink basis */
  align-self: flex-end; /* 覆盖容器的align-items */
  order: 2; /* 定义项目的排列顺序，数值越小，排列越靠前 */
}
```

### Grid 布局

Grid 是二维布局模型，适用于行和列的布局。

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr; /* 定义列的大小 */
  grid-template-rows: 100px auto 100px; /* 定义行的大小 */
  grid-template-areas:
    "header header header"
    "sidebar content content"
    "footer footer footer";
  grid-gap: 10px; /* 网格间隙 */
  justify-items: center; /* 水平对齐网格项 */
  align-items: center; /* 垂直对齐网格项 */
}

.item {
  grid-column: 1 / 3; /* 从第1条网格线到第3条网格线 */
  grid-row: 2 / 3; /* 从第2条网格线到第3条网格线 */
  /* 或者使用区域名称 */
  grid-area: header;
  justify-self: center; /* 单个项目的水平对齐 */
  align-self: center; /* 单个项目的垂直对齐 */
}
```

### 定位

```css
/* 静态定位（默认） */
.static {
  position: static;
}

/* 相对定位 */
.relative {
  position: relative;
  top: 10px;
  left: 20px;
}

/* 绝对定位 */
.absolute {
  position: absolute;
  top: 30px;
  left: 30px;
}

/* 固定定位 */
.fixed {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

/* 粘性定位 */
.sticky {
  position: sticky;
  top: 0;
}
```

::: tip
绝对定位元素相对于最近的已定位祖先元素定位。如果没有已定位的祖先元素，则相对于文档的初始包含块（通常是视口）。
:::

## CSS 响应式设计

### 媒体查询

```css
/* 基本媒体查询 */
@media screen and (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}

/* 多条件媒体查询 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .container {
    padding: 20px;
  }
}

/* 不同媒体类型 */
@media print {
  .no-print {
    display: none;
  }
}
```

### 视口单位

```css
.responsive-element {
  width: 50vw; /* 视口宽度的50% */
  height: 20vh; /* 视口高度的20% */
  font-size: calc(16px + 1vw); /* 响应式字体大小 */
  padding: 2vmin; /* 视口较小尺寸的2% */
}
```

### 响应式图片

```css
/* 基本响应式图片 */
img {
  max-width: 100%;
  height: auto;
}

/* 使用picture元素 */
<picture>
  <source media="(min-width: 1200px)" srcset="large.jpg">
  <source media="(min-width: 768px)" srcset="medium.jpg">
  <img src="small.jpg" alt="响应式图片">
</picture>
```

## CSS 颜色与背景

### 颜色表示方法

```css
.color-examples {
  /* 颜色名称 */
  color: red;

  /* RGB和RGBA */
  color: rgb(255, 0, 0);
  color: rgba(255, 0, 0, 0.5); /* 带透明度 */

  /* HEX */
  color: #ff0000;
  color: #f00; /* 简写 */

  /* HSL和HSLA */
  color: hsl(0, 100%, 50%);
  color: hsla(0, 100%, 50%, 0.5); /* 带透明度 */

  /* 现代浏览器支持 */
  color: color(display-p3 1 0 0); /* 更广的色域 */
}
```

### 背景属性

```css
.background-examples {
  /* 背景颜色 */
  background-color: #f0f0f0;

  /* 背景图片 */
  background-image: url('image.jpg');
  background-repeat: no-repeat; /* repeat | repeat-x | repeat-y | no-repeat */
  background-position: center center;
  background-size: cover; /* auto | cover | contain | 具体尺寸 */
  background-attachment: fixed; /* scroll | fixed | local */

  /* 简写 */
  background: #f0f0f0 url('image.jpg') no-repeat center center / cover fixed;

  /* 多重背景 */
  background:
    url('overlay.png') no-repeat center center / 100%,
    url('background.jpg') no-repeat center center / cover;
}
```

## CSS 文本与字体

### 文本样式

```css
.text-styling {
  /* 文本颜色 */
  color: #333;

  /* 文本对齐 */
  text-align: center; /* left | right | center | justify */

  /* 文本装饰 */
  text-decoration: none; /* none | underline | overline | line-through */

  /* 文本转换 */
  text-transform: capitalize; /* none | capitalize | uppercase | lowercase */

  /* 文本缩进 */
  text-indent: 2em;

  /* 字母间距 */
  letter-spacing: 1px;

  /* 单词间距 */
  word-spacing: 2px;

  /* 行高 */
  line-height: 1.5;

  /* 文本阴影 */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  /* 文本溢出处理 */
  white-space: nowrap; /* normal | nowrap | pre | pre-wrap | pre-line */
  overflow: hidden;
  text-overflow: ellipsis; /* 文本溢出显示省略号 */

  /* 文本换行 */
  word-wrap: break-word; /* normal | break-word */
  word-break: break-all; /* normal | break-all | keep-all */
}

/* 多行文本溢出省略号 */
.multiline-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 显示的行数 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

### 字体样式

```css
.font-styling {
  /* 字体族 */
  font-family: 'Helvetica', Arial, sans-serif; /* 字体族列表，按优先级排序 */

  /* 字体大小 */
  font-size: 16px; /* 也可以使用em, rem, %, vw等单位 */

  /* 字体粗细 */
  font-weight: bold; /* normal | bold | bolder | lighter | 100-900 */

  /* 字体样式 */
  font-style: italic; /* normal | italic | oblique */

  /* 字体变体 */
  font-variant: small-caps; /* normal | small-caps */

  /* 字体简写 */
  font: italic bold 16px/1.5 'Helvetica', Arial, sans-serif; /* style weight size/line-height family */
}
```

### Web 字体

```css
/* 使用@font-face引入自定义字体 */
@font-face {
  font-family: 'MyCustomFont';
  src: url('fonts/custom-font.woff2') format('woff2'),
       url('fonts/custom-font.woff') format('woff');
  font-weight: normal;
  font-style: normal;
  font-display: swap; /* auto | block | swap | fallback | optional */
}

/* 使用Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.custom-font {
  font-family: 'MyCustomFont', sans-serif;
}

.google-font {
  font-family: 'Roboto', sans-serif;
}
```

::: tip
使用 `font-display: swap` 可以在字体加载期间先使用后备字体，提高用户体验。
:::

## CSS 过渡与动画

### 过渡

```css
.transition-example {
  width: 100px;
  height: 100px;
  background-color: blue;

  /* 单个属性过渡 */
  transition-property: background-color; /* 指定过渡的CSS属性 */
  transition-duration: 0.5s; /* 过渡持续时间 */
  transition-timing-function: ease-in-out; /* 过渡时间函数 */
  transition-delay: 0.1s; /* 过渡延迟时间 */

  /* 简写 */
  transition: background-color 0.5s ease-in-out 0.1s;

  /* 多属性过渡 */
  transition:
    background-color 0.5s ease-in-out,
    transform 0.3s ease;
}

.transition-example:hover {
  background-color: red;
  transform: scale(1.2);
}
```

### 关键帧动画

```css
/* 定义关键帧 */
@keyframes slide-in {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.animation-example {
  /* 单个动画 */
  animation-name: slide-in; /* 动画名称 */
  animation-duration: 1s; /* 动画持续时间 */
  animation-timing-function: ease-out; /* 动画时间函数 */
  animation-delay: 0.2s; /* 动画延迟时间 */
  animation-iteration-count: 1; /* 动画重复次数，infinite为无限循环 */
  animation-direction: normal; /* normal | reverse | alternate | alternate-reverse */
  animation-fill-mode: forwards; /* none | forwards | backwards | both */
  animation-play-state: running; /* running | paused */

  /* 简写 */
  animation: slide-in 1s ease-out 0.2s 1 normal forwards;

  /* 多个动画 */
  animation:
    slide-in 1s ease-out,
    pulse 2s ease-in-out infinite;
}
```

::: tip
- `animation-fill-mode: forwards` 使元素在动画结束后保持最后一帧的状态。
- `animation-play-state` 可以通过JavaScript动态控制动画的播放和暂停。
:::

## CSS 变换

```css
.transform-examples {
  /* 2D变换 */
  transform: translateX(20px); /* X轴平移 */
  transform: translateY(20px); /* Y轴平移 */
  transform: translate(20px, 20px); /* X和Y轴平移 */

  transform: scale(1.5); /* 等比例缩放 */
  transform: scaleX(1.5); /* 仅X轴缩放 */
  transform: scaleY(1.5); /* 仅Y轴缩放 */
  transform: scale(1.5, 2); /* X和Y轴不同比例缩放 */

  transform: rotate(45deg); /* 旋转 */

  transform: skewX(10deg); /* X轴倾斜 */
  transform: skewY(10deg); /* Y轴倾斜 */
  transform: skew(10deg, 5deg); /* X和Y轴倾斜 */

  /* 组合变换（从右到左应用） */
  transform: translateX(20px) rotate(45deg) scale(1.5);

  /* 3D变换 */
  transform: rotateX(45deg); /* 绕X轴旋转 */
  transform: rotateY(45deg); /* 绕Y轴旋转 */
  transform: rotateZ(45deg); /* 绕Z轴旋转 */
  transform: rotate3d(1, 1, 1, 45deg); /* 绕自定义轴旋转 */

  transform: translateZ(20px); /* Z轴平移 */
  transform: translate3d(10px, 20px, 30px); /* X、Y和Z轴平移 */

  /* 变换原点 */
  transform-origin: center center; /* 默认值 */
  transform-origin: top left; /* 左上角 */
  transform-origin: 50px 50px; /* 具体坐标 */

  /* 3D空间设置 */
  perspective: 1000px; /* 透视距离 */
  perspective-origin: center center; /* 透视原点 */
  transform-style: preserve-3d; /* flat | preserve-3d */
  backface-visibility: hidden; /* visible | hidden */
}
```

::: warning
多个变换函数的应用顺序会影响最终结果，因为它们不是可交换的。例如，先旋转后平移与先平移后旋转的结果是不同的。
:::

## CSS 滤镜与混合模式

### 滤镜效果

```css
.filter-examples {
  /* 基本滤镜 */
  filter: blur(5px); /* 模糊 */
  filter: brightness(150%); /* 亮度 */
  filter: contrast(200%); /* 对比度 */
  filter: grayscale(100%); /* 灰度 */
  filter: hue-rotate(90deg); /* 色相旋转 */
  filter: invert(100%); /* 反色 */
  filter: opacity(50%); /* 透明度 */
  filter: saturate(200%); /* 饱和度 */
  filter: sepia(100%); /* 褐色 */

  /* 阴影效果 */
  filter: drop-shadow(5px 5px 5px rgba(0, 0, 0, 0.5));

  /* 组合滤镜 */
  filter: contrast(150%) brightness(120%) blur(2px);

  /* 使用SVG滤镜 */
  filter: url(#my-filter);
}
```

### 混合模式

```css
/* 背景混合模式 */
.blend-background {
  background-image: url('top-image.jpg');
  background-color: blue;
  background-blend-mode: multiply; /* 混合背景图片和背景颜色 */
}

/* 元素混合模式 */
.blend-element {
  mix-blend-mode: overlay; /* 与下层元素混合 */
}

/* 可用的混合模式值 */
.blend-modes {
  /* 基本混合模式 */
  mix-blend-mode: normal;
  mix-blend-mode: multiply;
  mix-blend-mode: screen;
  mix-blend-mode: overlay;

  /* 暗化混合模式 */
  mix-blend-mode: darken;
  mix-blend-mode: color-burn;

  /* 亮化混合模式 */
  mix-blend-mode: lighten;
  mix-blend-mode: color-dodge;

  /* 对比混合模式 */
  mix-blend-mode: hard-light;
  mix-blend-mode: soft-light;

  /* 差值混合模式 */
  mix-blend-mode: difference;
  mix-blend-mode: exclusion;

  /* 颜色混合模式 */
  mix-blend-mode: hue;
  mix-blend-mode: saturation;
  mix-blend-mode: color;
  mix-blend-mode: luminosity;
}
```

## CSS 变量与计算

### CSS 变量（自定义属性）

```css
:root {
  /* 全局变量 */
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --font-size-base: 16px;
  --spacing-unit: 8px;
}

.component {
  /* 局部变量 */
  --component-padding: 20px;

  /* 使用变量 */
  color: var(--primary-color);
  padding: var(--component-padding);
  font-size: var(--font-size-base);
  margin-bottom: calc(var(--spacing-unit) * 2);

  /* 带默认值的变量 */
  border-color: var(--border-color, #ddd);
}

/* 媒体查询中修改变量 */
@media (max-width: 768px) {
  :root {
    --font-size-base: 14px;
    --spacing-unit: 4px;
  }
}
```

### calc() 函数

```css
.calc-examples {
  /* 基本计算 */
  width: calc(100% - 40px);
  height: calc(100vh - 80px);

  /* 混合单位计算 */
  margin-top: calc(2rem + 5px);

  /* 嵌套计算 */
  padding: calc(var(--spacing-unit) * 2);

  /* 复杂计算 */
  font-size: calc(14px + 0.5vw);
  width: calc((100% - (var(--spacing-unit) * 3)) / 4);
}
```

## CSS 网格系统

### 基于Grid的网格系统

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 20px;
}

.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-5 { grid-column: span 5; }
.col-6 { grid-column: span 6; }
.col-7 { grid-column: span 7; }
.col-8 { grid-column: span 8; }
.col-9 { grid-column: span 9; }
.col-10 { grid-column: span 10; }
.col-11 { grid-column: span 11; }
.col-12 { grid-column: span 12; }

/* 响应式网格 */
@media (max-width: 768px) {
  .col-md-1 { grid-column: span 1; }
  .col-md-2 { grid-column: span 2; }
  .col-md-3 { grid-column: span 3; }
  .col-md-4 { grid-column: span 4; }
  .col-md-6 { grid-column: span 6; }
  .col-md-12 { grid-column: span 12; }
}
```

### 基于Flexbox的网格系统

```css
.flex-container {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -10px; /* 抵消列间距 */
}

.flex-column {
  padding: 0 10px;
  box-sizing: border-box;
}

.flex-column-1 { flex: 0 0 8.333%; }
.flex-column-2 { flex: 0 0 16.666%; }
.flex-column-3 { flex: 0 0 25%; }
.flex-column-4 { flex: 0 0 33.333%; }
.flex-column-5 { flex: 0 0 41.666%; }
.flex-column-6 { flex: 0 0 50%; }
.flex-column-7 { flex: 0 0 58.333%; }
.flex-column-8 { flex: 0 0 66.666%; }
.flex-column-9 { flex: 0 0 75%; }
.flex-column-10 { flex: 0 0 83.333%; }
.flex-column-11 { flex: 0 0 91.666%; }
.flex-column-12 { flex: 0 0 100%; }

/* 响应式列 */
@media (max-width: 768px) {
  .flex-column-md-6 { flex: 0 0 50%; }
  .flex-column-md-12 { flex: 0 0 100%; }
}
```

## CSS 优化与性能

### 选择器优化

```css
/* 避免使用通配符选择器 */
/* 不推荐 */
* { margin: 0; padding: 0; }

/* 推荐 */
body, h1, h2, h3, p, ul, ol { margin: 0; padding: 0; }

/* 避免过度嵌套选择器 */
/* 不推荐 */
nav ul li a span { color: red; }

/* 推荐 */
.nav-link span { color: red; }
```

### 减少重排和重绘

```css
/* 使用transform和opacity进行动画，而不是改变布局属性 */
/* 不推荐 */
.animation-bad {
  animation: move-bad 1s ease;
}
@keyframes move-bad {
  0% { top: 0; left: 0; }
  100% { top: 100px; left: 100px; }
}

/* 推荐 */
.animation-good {
  animation: move-good 1s ease;
}
@keyframes move-good {
  0% { transform: translate(0, 0); }
  100% { transform: translate(100px, 100px); }
}

/* 批量修改DOM */
.batch-changes {
  /* 使用类切换一次性应用多个样式变化 */
  transition: all 0.3s ease;
}
.batch-changes.active {
  color: red;
  background-color: yellow;
  transform: scale(1.1);
}
```

### 关键渲染路径优化

```css
/* 使用媒体查询延迟加载非关键CSS */
<link rel="stylesheet" href="critical.css"> <!-- 关键CSS立即加载 -->
<link rel="stylesheet" href="non-critical.css" media="print" onload="this.media='all'"> <!-- 非关键CSS延迟加载 -->

/* 内联关键CSS */
<style>
  /* 首屏渲染所需的关键样式 */
  header { ... }
  .hero { ... }
</style>
```

::: tip
- 使用 `will-change` 属性提前告知浏览器元素将要发生变化，但要谨慎使用，过度使用会适得其反。
- 避免使用 `@import`，它会阻塞渲染并创建额外的网络请求。
- 考虑使用 CSS 内容分割，只加载当前页面需要的样式。
:::

## CSS 预处理器与后处理器

### Sass/SCSS

```scss
// 变量
$primary-color: #3498db;
$spacing: 20px;

// 嵌套
nav {
  background: #fff;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-block;
    margin-right: $spacing;

    a {
      color: $primary-color;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 混合宏
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.centered-box {
  @include flex-center;
  height: 200px;
}

// 继承
%button-base {
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.primary-button {
  @extend %button-base;
  background-color: $primary-color;
  color: white;
}

// 函数
@function calculate-width($col, $total: 12) {
  @return percentage($col / $total);
}

.sidebar {
  width: calculate-width(3); // 25%
}
```

### Less

```less
// 变量
@primary-color: #3498db;
@spacing: 20px;

// 嵌套
nav {
  background: #fff;

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    display: inline-block;
    margin-right: @spacing;

    a {
      color: @primary-color;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 混合
.flex-center() {
  display: flex;
  justify-content: center;
  align-items: center;
}

.centered-box {
  .flex-center();
  height: 200px;
}

// 函数
.calculate-width(@col, @total: 12) {
  width: percentage(@col / @total);
}

.sidebar {
  .calculate-width(3); // 25%
}
```

### PostCSS

```css
/* 使用未来的CSS特性 */
.future-css {
  /* 使用嵌套 - 需要postcss-nested插件 */
  & .child {
    color: blue;
  }

  /* 使用自定义属性集 - 需要postcss-custom-properties插件 */
  @custom-media --small-viewport (max-width: 30em);
  @media (--small-viewport) {
    font-size: 14px;
  }

  /* 使用颜色函数 - 需要postcss-color-function插件 */
  color: color-mod(#3498db alpha(80%));
}
```

::: tip
- 预处理器提高了CSS的可维护性和可重用性，但要注意生成的CSS大小和复杂性。
- PostCSS是一个用JavaScript转换CSS的工具，可以通过插件实现各种功能，如自动添加浏览器前缀、压缩CSS等。
:::

## CSS 架构与方法论

### BEM (Block, Element, Modifier)

```css
/* 块 */
.card { }

/* 元素 */
.card__title { }
.card__image { }
.card__content { }

/* 修饰符 */
.card--featured { }
.card__title--large { }
```

### OOCSS (Object Oriented CSS)

```css
/* 结构与皮肤分离 */
.btn { /* 结构 */
  display: inline-block;
  padding: 5px 10px;
  border-radius: 3px;
}

.btn-primary { /* 皮肤 */
  background-color: blue;
  color: white;
}

/* 容器与内容分离 */
.header-title { /* 避免这样写 */
  font-size: 24px;
  font-weight: bold;
  color: blue;
}

.title { /* 推荐这样写 */
  font-size: 24px;
  font-weight: bold;
}

.header .title { /* 在特定上下文中应用样式 */
  color: blue;
}
```

### SMACSS (Scalable and Modular Architecture for CSS)

```css
/* 基础规则 */
body, h1, h2, p { margin: 0; padding: 0; }

/* 布局规则 */
.l-header { width: 100%; }
.l-sidebar { width: 25%; float: left; }
.l-content { width: 75%; float: right; }

/* 模块规则 */
.modal { }
.modal-header { }
.modal-content { }

/* 状态规则 */
.is-active { }
.is-hidden { }

/* 主题规则 */
.theme-dark .modal { background-color: #333; }
.theme-light .modal { background-color: #fff; }
```

### Atomic CSS / Utility-First CSS

```css
/* 单一用途的工具类 */
.flex { display: flex; }
.justify-center { justify-content: center; }
.items-center { align-items: center; }
.p-4 { padding: 1rem; }
.m-2 { margin: 0.5rem; }
.text-lg { font-size: 1.125rem; }
.font-bold { font-weight: bold; }
.text-center { text-align: center; }
.bg-blue-500 { background-color: #3b82f6; }
.text-white { color: white; }
.rounded { border-radius: 0.25rem; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
```

::: tip
- BEM提供了清晰的命名约定，适合大型项目和团队协作。
- OOCSS强调可重用性和组合，减少代码重复。
- SMACSS提供了一种组织CSS的方法，将样式分为不同的类别。
- Atomic CSS/Utility-First CSS (如Tailwind CSS)通过组合小型、单一用途的类来构建界面，减少了CSS的总体大小，但可能导致HTML标记变得冗长。
:::

## CSS 兼容性与浏览器前缀

```css
.cross-browser {
  /* 标准属性 */
  border-radius: 10px;

  /* 带浏览器前缀的属性 */
  -webkit-border-radius: 10px; /* Safari, Chrome */
  -moz-border-radius: 10px; /* Firefox */
  -ms-border-radius: 10px; /* IE */
  -o-border-radius: 10px; /* Opera */

  /* 渐变 */
  background: linear-gradient(to bottom, #fff, #ddd);
  background: -webkit-linear-gradient(top, #fff, #ddd);
  background: -moz-linear-gradient(top, #fff, #ddd);
  background: -ms-linear-gradient(top, #fff, #ddd);
  background: -o-linear-gradient(top, #fff, #ddd);

  /* 变换 */
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
  -moz-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  -o-transform: rotate(45deg);
}
```

::: tip
- 现代开发中，通常使用Autoprefixer等工具自动添加必要的浏览器前缀。
- 可以使用 `@supports` 规则检测浏览器是否支持特定的CSS特性。
```css
@supports (display: grid) {
  .container {
    display: grid;
  }
}

@supports not (display: grid) {
  .container {
    display: flex;
  }
}
```
:::

## CSS Houdini API

CSS Houdini是一组低级API，允许开发者直接访问CSS引擎，扩展CSS的功能和创建新的CSS特性。

### Paint API

```js
// 注册一个自定义画笔
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-size', '--checkerboard-color'];
  }

  paint(ctx, size, properties) {
    // 获取CSS自定义属性
    const checkerboardSize = parseInt(properties.get('--checkerboard-size').toString()) || 10;
    const checkerboardColor = properties.get('--checkerboard-color').toString() || 'black';

    // 绘制棋盘格
    for (let y = 0; y < size.height; y += checkerboardSize) {
      for (let x = 0; x < size.width; x += checkerboardSize) {
        if ((x / checkerboardSize + y / checkerboardSize) % 2 === 0) {
          ctx.fillStyle = checkerboardColor;
          ctx.fillRect(x, y, checkerboardSize, checkerboardSize);
        }
      }
    }
  }
}

// 注册画笔
registerPaint('checkerboard', CheckerboardPainter);
```

```css
/* 使用自定义画笔 */
.custom-background {
  --checkerboard-size: 20px;
  --checkerboard-color: #3498db;
  background-image: paint(checkerboard);
}
```

### Layout API

```js
// 注册一个自定义布局
class MasonryLayout {
  static get inputProperties() {
    return ['--masonry-gap'];
  }

  async intrinsicSizes() { /* ... */ }

  async layout(children, edges, constraints, styleMap) {
    const gap = parseInt(styleMap.get('--masonry-gap').toString()) || 10;
    let columnWidth = 0;
    let columnHeights = [];

    // 计算列宽
    columnWidth = (constraints.fixedInlineSize - (gap * (columnCount - 1))) / columnCount;

    // 初始化列高度
    for (let i = 0; i < columnCount; i++) {
      columnHeights.push(0);
    }

    // 布局子元素
    const childFragments = [];
    for (const child of children) {
      // 找到最短的列
      const minHeightIndex = columnHeights.indexOf(Math.min(...columnHeights));

      // 布局子元素
      const childFragment = await child.layoutNextFragment({
        fixedInlineSize: columnWidth
      });

      // 设置子元素位置
      childFragment.inlineOffset = minHeightIndex * (columnWidth + gap);
      childFragment.blockOffset = columnHeights[minHeightIndex];

      // 更新列高度
      columnHeights[minHeightIndex] += childFragment.blockSize + gap;

      childFragments.push(childFragment);
    }

    return {childFragments};
  }
}

// 注册布局
registerLayout('masonry', MasonryLayout);
```

```css
.masonry-container {
  display: layout(masonry);
  --masonry-gap: 16px;
}
```

### Properties and Values API

```js
// 注册自定义属性
CSS.registerProperty({
  name: '--theme-color',
  syntax: '<color>',
  inherits: true,
  initialValue: '#3498db'
});
```

```css
/* 使用注册的自定义属性 */
:root {
  --theme-color: #3498db;
}

.button {
  background-color: var(--theme-color);
  transition: background-color 0.3s; /* 可以对注册的自定义属性进行动画过渡 */
}

.dark-theme {
  --theme-color: #2980b9;
}
```

::: tip
- CSS Houdini API仍在发展中，浏览器支持有限。
- 使用Houdini可以创建以前只能通过JavaScript实现的复杂效果。
- Houdini API包括：Paint API、Layout API、Properties and Values API、Animation API、Parser API、Typed OM等。
:::

## CSS 打印样式与可访问性

### 打印样式

```css
/* 打印样式 */
@media print {
  /* 隐藏不需要打印的元素 */
  nav, footer, .sidebar, .ads, .comments, .no-print {
    display: none !important;
  }

  /* 确保文本是黑色的，背景是白色的 */
  body {
    color: #000;
    background: #fff;
    font-size: 12pt;
    line-height: 1.5;
    font-family: "Times New Roman", Times, serif;
  }

  /* 确保链接文本可读 */
  a {
    color: #000;
    text-decoration: none;
  }

  /* 显示链接URL */
  a[href]:after {
    content: " (" attr(href) ")";
    font-size: 90%;
  }

  /* 不显示内部链接的URL */
  a[href^="#"]:after {
    content: "";
  }

  /* 避免在新页面打印表格行 */
  tr, img {
    page-break-inside: avoid;
  }

  /* 在新页面打印标题 */
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }

  /* 控制分页 */
  .page-break {
    page-break-before: always;
  }

  /* 设置页边距 */
  @page {
    margin: 2cm;
  }
}
```

### 可访问性

```css
/* 高对比度模式 */
@media (prefers-contrast: high) {
  body {
    color: #000;
    background: #fff;
  }

  a {
    color: #0000EE;
    text-decoration: underline;
  }

  button, .button {
    border: 2px solid #000;
    color: #000;
    background: #fff;
  }
}

/* 减少动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }

  .carousel, .slider {
    scroll-behavior: auto !important;
  }
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
  body {
    color: #f0f0f0;
    background: #121212;
  }

  a {
    color: #90caf9;
  }

  img {
    filter: brightness(0.8);
  }
}

/* 焦点样式 */
:focus {
  outline: 3px solid #4d90fe;
  outline-offset: 2px;
}

/* 跳过导航链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: #000;
  color: #fff;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* 屏幕阅读器专用内容 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

::: tip
- 打印样式可以优化网页在打印时的显示效果，节省墨水并提高可读性。
- 可访问性样式确保所有用户，包括使用辅助技术的用户，都能有效地使用网站。
- 使用媒体查询可以针对不同的用户偏好（如减少动画、高对比度、暗色模式）提供不同的样式。
- 确保焦点样式清晰可见，这对键盘用户导航非常重要。
:::

## CSS 最佳实践

### 代码组织

```css
/* 1. 使用注释组织代码 */
/* ==========================================================================
   主导航
   ========================================================================== */

.main-nav { /* ... */ }

/* ==========================================================================
   页脚
   ========================================================================== */

.footer { /* ... */ }

/* 2. 按组件分割文件 */
/* 在大型项目中，可以按组件分割CSS文件 */
/* 例如：nav.css, buttons.css, forms.css, etc. */

/* 3. 使用一致的命名约定 */
/* 例如使用BEM命名约定 */
.block {}
.block__element {}
.block--modifier {}

/* 4. 属性排序 */
.element {
  /* 定位 */
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;

  /* 盒模型 */
  display: flex;
  width: 100px;
  height: 100px;
  padding: 10px;
  margin: 10px;

  /* 视觉效果 */
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  /* 排版 */
  color: #333;
  font-family: Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  text-align: center;

  /* 其他 */
  cursor: pointer;
  transition: all 0.3s ease;
}
```

### 性能优化

```css
/* 1. 避免使用昂贵的属性 */
/* 避免 */
.expensive {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  filter: blur(5px);
  opacity: 0.8;
  transform: scale(1.1) rotate(10deg);
}

/* 2. 使用简写属性 */
/* 避免 */
.verbose {
  margin-top: 10px;
  margin-right: 20px;
  margin-bottom: 10px;
  margin-left: 20px;
}

/* 推荐 */
.concise {
  margin: 10px 20px;
}

/* 3. 避免过度使用通配符和深层次选择器 */
/* 避免 */
.container * { /* 性能差 */ }
.container ul li a span { /* 性能差 */ }

/* 推荐 */
.container-link { /* 性能好 */ }

/* 4. 使用CSS而不是JavaScript进行动画 */
/* 推荐 */
.animated {
  transition: transform 0.3s ease;
}

.animated:hover {
  transform: scale(1.1);
}
```

### 响应式设计

```css
/* 1. 使用相对单位 */
body {
  font-size: 16px; /* 基准字体大小 */
}

.container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
}

.text {
  font-size: 1rem; /* 相对于根元素的字体大小 */
  line-height: 1.5;
  padding: 1em; /* 相对于元素自身的字体大小 */
}

/* 2. 媒体查询 */
/* 移动优先设计 */
.container {
  width: 100%;
  padding: 10px;
}

/* 平板设备 */
@media (min-width: 768px) {
  .container {
    width: 750px;
    padding: 20px;
  }
}

/* 桌面设备 */
@media (min-width: 992px) {
  .container {
    width: 970px;
  }
}

/* 大屏幕设备 */
@media (min-width: 1200px) {
  .container {
    width: 1170px;
  }
}

/* 3. 使用Flexbox和Grid进行响应式布局 */
.flex-container {
  display: flex;
  flex-wrap: wrap;
}

.flex
