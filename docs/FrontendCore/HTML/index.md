---
outline: deep
---

# HTML 知识库

## HTML 基础概念

### 什么是 HTML？

HTML（HyperText Markup Language，超文本标记语言）是创建网页的标准标记语言。它描述了网页的结构，由一系列的元素组成，这些元素告诉浏览器如何展示内容。

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的第一个HTML页面</title>
  <meta charset="UTF-8">
</head>
<body>
  <h1>Hello World!</h1>
  <p>这是一个段落。</p>
</body>
</html>
```

### HTML 文档结构

一个基本的 HTML 文档包含以下部分：

- `<!DOCTYPE html>`: 文档类型声明
- `<html>`: 根元素
- `<head>`: 包含元数据的容器
- `<title>`: 定义文档标题
- `<body>`: 包含可见页面内容的容器

::: tip
HTML5 中的 DOCTYPE 声明非常简单，而在 HTML4 和 XHTML 中则更为复杂。
:::

## HTML 元素与标签

### 基础标签

| 标签 | 描述 |
| --- | --- |
| `<h1>` to `<h6>` | 标题标签，从最重要 (h1) 到最不重要 (h6) |
| `<p>` | 段落标签 |
| `<br>` | 换行标签 |
| `<hr>` | 水平线标签 |
| `<div>` | 块级容器标签 |
| `<span>` | 内联容器标签 |

### 文本格式化标签

```html
<b>粗体文本</b>
<strong>重要文本</strong>
<i>斜体文本</i>
<em>强调文本</em>
<mark>标记文本</mark>
<small>小号文本</small>
<del>删除文本</del>
<ins>插入文本</ins>
<sub>下标文本</sub>
<sup>上标文本</sup>
```

::: warning
虽然 `<b>` 和 `<i>` 标签在视觉上与 `<strong>` 和 `<em>` 相似，但它们的语义不同。前者仅表示视觉样式，后者表示内容的重要性或强调。
:::

## HTML5 语义化标签

语义化标签使 HTML 更具可读性，同时有助于搜索引擎优化 (SEO) 和无障碍性。

```html
<header>网页或区段的头部</header>
<nav>导航链接区域</nav>
<main>文档的主要内容</main>
<article>独立的自包含内容</article>
<section>文档中的节</section>
<aside>侧边栏内容</aside>
<footer>网页或区段的底部</footer>
```

### 语义化布局示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>语义化布局示例</title>
</head>
<body>
  <header>
    <h1>网站标题</h1>
    <nav>
      <ul>
        <li><a href="#">首页</a></li>
        <li><a href="#">关于</a></li>
        <li><a href="#">服务</a></li>
        <li><a href="#">联系</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <h2>文章标题</h2>
      <p>文章内容...</p>
      <section>
        <h3>文章小节</h3>
        <p>小节内容...</p>
      </section>
    </article>

    <aside>
      <h3>相关信息</h3>
      <p>侧边栏内容...</p>
    </aside>
  </main>

  <footer>
    <p>版权信息 &copy; 2023</p>
  </footer>
</body>
</html>
```

## HTML 链接与多媒体

### 链接

```html
<!-- 基本链接 -->
<a href="https://www.example.com">访问示例网站</a>

<!-- 新窗口打开 -->
<a href="https://www.example.com" target="_blank">在新窗口中打开</a>

<!-- 页面内部链接 -->
<a href="#section1">跳转到第一节</a>
<h2 id="section1">第一节</h2>

<!-- 电子邮件链接 -->
<a href="mailto:example@example.com">发送邮件</a>
```

### 图片

```html
<!-- 基本图片 -->
<img src="image.jpg" alt="图片描述">

<!-- 设置宽度和高度 -->
<img src="image.jpg" alt="图片描述" width="500" height="300">

<!-- 图片链接 -->
<a href="https://www.example.com">
  <img src="button.jpg" alt="点击按钮">
</a>
```

::: tip
始终为图片添加 `alt` 属性，这对于无障碍性和 SEO 都很重要。
:::

### 音频和视频

```html
<!-- 音频 -->
<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持音频标签。
</audio>

<!-- 视频 -->
<video width="320" height="240" controls>
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
  您的浏览器不支持视频标签。
</video>
```

## HTML 表单

表单用于收集用户输入，是网页交互的重要组成部分。

### 基本表单结构

```html
<form action="/submit-form" method="post">
  <label for="username">用户名：</label>
  <input type="text" id="username" name="username" required>

  <label for="password">密码：</label>
  <input type="password" id="password" name="password" required>

  <input type="submit" value="提交">
</form>
```

### 常用表单元素

```html
<!-- 文本输入 -->
<input type="text" placeholder="请输入文本">

<!-- 密码输入 -->
<input type="password">

<!-- 单选按钮 -->
<input type="radio" id="male" name="gender" value="male">
<label for="male">男</label>
<input type="radio" id="female" name="gender" value="female">
<label for="female">女</label>

<!-- 复选框 -->
<input type="checkbox" id="bike" name="vehicle" value="Bike">
<label for="bike">自行车</label>
<input type="checkbox" id="car" name="vehicle" value="Car">
<label for="car">汽车</label>

<!-- 下拉列表 -->
<select name="cars">
  <option value="volvo">沃尔沃</option>
  <option value="saab">萨博</option>
  <option value="mercedes">奔驰</option>
  <option value="audi">奥迪</option>
</select>

<!-- 文本区域 -->
<textarea name="message" rows="10" cols="30">请在此输入内容...</textarea>

<!-- 按钮 -->
<button type="button">点击我</button>
```

### HTML5 新增表单元素和属性

```html
<!-- 日期选择器 -->
<input type="date">

<!-- 颜色选择器 -->
<input type="color">

<!-- 范围滑块 -->
<input type="range" min="0" max="100" value="50">

<!-- 电子邮件输入 -->
<input type="email" placeholder="请输入邮箱">

<!-- 数字输入 -->
<input type="number" min="1" max="100">

<!-- 自动完成 -->
<input type="text" list="browsers">
<datalist id="browsers">
  <option value="Chrome">
  <option value="Firefox">
  <option value="Safari">
  <option value="Edge">
</datalist>
```

::: info
HTML5 引入了多种新的输入类型和属性，使表单验证和用户体验更加友好。
:::

## HTML 表格

表格用于展示结构化数据。

```html
<table border="1">
  <caption>月度销售数据</caption>
  <thead>
    <tr>
      <th>月份</th>
      <th>销售额</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>一月</td>
      <td>$100</td>
    </tr>
    <tr>
      <td>二月</td>
      <td>$150</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>总计</td>
      <td>$250</td>
    </tr>
  </tfoot>
</table>
```

### 表格结构标签

- `<table>`: 定义表格
- `<caption>`: 表格标题
- `<thead>`: 表头部分
- `<tbody>`: 表格主体部分
- `<tfoot>`: 表格底部
- `<tr>`: 表格行
- `<th>`: 表头单元格
- `<td>`: 表格数据单元格

## HTML5 新特性

### Canvas 绘图

```html
<canvas id="myCanvas" width="200" height="100"></canvas>

<script>
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0, 0, 150, 75);
</script>
```

### SVG 矢量图形

```html
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>
```

### 地理定位

```html
<button onclick="getLocation()">获取位置</button>
<p id="demo"></p>

<script>
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      document.getElementById("demo").innerHTML = "该浏览器不支持地理定位。";
    }
  }

  function showPosition(position) {
    document.getElementById("demo").innerHTML = "纬度: " + position.coords.latitude +
    "<br>经度: " + position.coords.longitude;
  }
</script>
```

### Web 存储

```html
<script>
  // localStorage - 没有过期时间的数据存储
  localStorage.setItem("name", "John");
  document.getElementById("result").innerHTML = localStorage.getItem("name");

  // sessionStorage - 针对一个会话的数据存储
  sessionStorage.setItem("name", "John");
  document.getElementById("result").innerHTML = sessionStorage.getItem("name");
</script>
```

## HTML 最佳实践

### 无障碍性 (Accessibility)

```html
<!-- 使用语义化标签 -->
<nav>
  <ul>
    <li><a href="#">首页</a></li>
    <li><a href="#">关于</a></li>
  </ul>
</nav>

<!-- 为图片添加替代文本 -->
<img src="logo.png" alt="公司标志">

<!-- 使用 ARIA 属性 -->
<div role="alert" aria-live="assertive">重要通知！</div>

<!-- 表单标签关联 -->
<label for="username">用户名：</label>
<input type="text" id="username" name="username">
```

### 响应式设计基础

```html
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>响应式网页</title>
</head>
<body>
  <h1>响应式设计示例</h1>
  <p>调整浏览器窗口大小查看效果。</p>

  <picture>
    <source media="(min-width: 650px)" srcset="img_large.jpg">
    <source media="(min-width: 450px)" srcset="img_medium.jpg">
    <img src="img_small.jpg" alt="响应式图片" style="width:auto;">
  </picture>
</body>
</html>
```

### SEO 优化技巧
