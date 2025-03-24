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

::: info HTML的发展历史
HTML从1991年诞生至今已经历了多个版本：
- HTML 1.0：1991年发布的最初版本
- HTML 2.0：1995年，第一个标准化版本
- HTML 3.2：1997年，增加了表格和样式表支持
- HTML 4.01：1999年，增加了更多样式和脚本功能
- XHTML：2000年，基于XML的严格版本
- HTML5：2014年正式发布，引入了众多新元素和API
- HTML Living Standard：当前持续更新的版本
:::

### HTML 文档结构

一个基本的 HTML 文档包含以下部分：

- `<!DOCTYPE html>`: 文档类型声明，告诉浏览器使用哪个HTML版本
- `<html>`: 根元素，包含整个HTML文档
- `<head>`: 包含元数据的容器，如标题、字符集、样式、脚本等
- `<title>`: 定义文档标题，显示在浏览器标签页上
- `<body>`: 包含可见页面内容的容器，如文本、图像、链接等

::: tip
HTML5 中的 DOCTYPE 声明非常简单，而在 HTML4 和 XHTML 中则更为复杂。例如，HTML4 Strict的DOCTYPE为：
```html
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
```
:::

### HTML 元素解析

HTML 元素由开始标签、内容和结束标签组成：

```html
<tagname>内容</tagname>
```

例如：`<p>这是一个段落</p>`

某些元素没有内容，称为空元素，它们没有结束标签：

```html
<br> <!-- 换行 -->
<img src="image.jpg" alt="图片"> <!-- 图片 -->
<input type="text"> <!-- 输入框 -->
```

## HTML 元素与标签

### 基础标签

| 标签 | 描述 | 示例 |
| --- | --- | --- |
| `<h1>` to `<h6>` | 标题标签，从最重要 (h1) 到最不重要 (h6) | `<h1>主标题</h1>` |
| `<p>` | 段落标签 | `<p>这是一个段落</p>` |
| `<br>` | 换行标签 | `文本<br>换行` |
| `<hr>` | 水平线标签 | `<hr>` |
| `<div>` | 块级容器标签 | `<div>内容块</div>` |
| `<span>` | 内联容器标签 | `<span>内联内容</span>` |

::: warning 标题层级使用注意事项
- 每个页面应该只有一个 `<h1>` 标签，通常用于主标题
- 标题应按层级顺序使用，不要跳级（如从h1直接到h3）
- 合理的标题结构有助于SEO和无障碍性
:::

### 文本格式化标签

```html
<b>粗体文本</b> <!-- 仅视觉上的粗体 -->
<strong>重要文本</strong> <!-- 语义上的强调，通常显示为粗体 -->
<i>斜体文本</i> <!-- 仅视觉上的斜体 -->
<em>强调文本</em> <!-- 语义上的强调，通常显示为斜体 -->
<mark>标记文本</mark> <!-- 高亮显示 -->
<small>小号文本</small> <!-- 小字体显示 -->
<del>删除文本</del> <!-- 显示为删除线 -->
<ins>插入文本</ins> <!-- 显示为下划线 -->
<sub>下标文本</sub> <!-- 显示为下标 -->
<sup>上标文本</sup> <!-- 显示为上标 -->
<code>代码文本</code> <!-- 显示为等宽字体 -->
<pre>预格式化文本</pre> <!-- 保留空格和换行 -->
<blockquote>引用文本</blockquote> <!-- 缩进显示，表示引用 -->
<q>短引用</q> <!-- 内联引用，通常加引号 -->
<abbr title="超文本标记语言">HTML</abbr> <!-- 缩写，鼠标悬停显示完整文本 -->
```

::: warning
虽然 `<b>` 和 `<i>` 标签在视觉上与 `<strong>` 和 `<em>` 相似，但它们的语义不同。前者仅表示视觉样式，后者表示内容的重要性或强调。在现代HTML中，推荐使用有语义的标签。
:::

### 列表标签

```html
<!-- 无序列表 -->
<ul>
  <li>项目1</li>
  <li>项目2</li>
  <li>项目3</li>
</ul>

<!-- 有序列表 -->
<ol>
  <li>第一步</li>
  <li>第二步</li>
  <li>第三步</li>
</ol>

<!-- 定义列表 -->
<dl>
  <dt>HTML</dt>
  <dd>超文本标记语言</dd>
  <dt>CSS</dt>
  <dd>层叠样式表</dd>
</dl>
```

::: tip 列表嵌套
列表可以嵌套使用，创建多级列表结构：
```html
<ul>
  <li>一级项目1</li>
  <li>一级项目2
    <ul>
      <li>二级项目1</li>
      <li>二级项目2</li>
    </ul>
  </li>
  <li>一级项目3</li>
</ul>
```
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
<figure>独立的流内容（图像、图表等）</figure>
<figcaption>figure的标题</figcaption>
<time>日期或时间</time>
<details>用户可以查看或隐藏的额外细节</details>
<summary>details元素的可见标题</summary>
```

::: info 语义化标签的优势
1. 提高代码可读性和可维护性
2. 有助于搜索引擎理解页面结构和内容
3. 提升无障碍性，屏幕阅读器可以更好地解释页面
4. 在没有CSS的情况下，页面仍然具有良好的结构
:::

### 语义化布局示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>语义化布局示例</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
      <header>
        <h2>文章标题</h2>
        <p>发布日期: <time datetime="2023-09-15">2023年9月15日</time></p>
      </header>
      <p>文章内容...</p>
      <section>
        <h3>文章小节</h3>
        <p>小节内容...</p>
      </section>
      <footer>
        <p>作者: 张三</p>
      </footer>
    </article>

    <aside>
      <h3>相关信息</h3>
      <ul>
        <li><a href="#">相关文章1</a></li>
        <li><a href="#">相关文章2</a></li>
      </ul>
    </aside>
  </main>

  <footer>
    <p>版权信息 &copy; 2023</p>
    <address>
      联系方式: <a href="mailto:info@example.com">info@example.com</a>
    </address>
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
<a href="https://www.example.com" target="_blank" rel="noopener noreferrer">在新窗口中打开</a>

<!-- 页面内部链接 -->
<a href="#section1">跳转到第一节</a>
<h2 id="section1">第一节</h2>

<!-- 电子邮件链接 -->
<a href="mailto:example@example.com?subject=问题咨询&body=您好">发送邮件</a>

<!-- 电话链接 -->
<a href="tel:+8612345678901">拨打电话</a>

<!-- 下载链接 -->
<a href="document.pdf" download="文件名.pdf">下载PDF</a>
```

::: warning 安全提示
当使用 `target="_blank"` 打开新窗口时，应添加 `rel="noopener noreferrer"` 属性，以防止新页面通过 `window.opener` 访问原页面，这是一种安全最佳实践。
:::

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

<!-- 响应式图片 -->
<picture>
  <source media="(min-width: 650px)" srcset="img-large.jpg">
  <source media="(min-width: 450px)" srcset="img-medium.jpg">
  <img src="img-small.jpg" alt="响应式图片" style="width:auto;">
</picture>

<!-- 带有说明的图片 -->
<figure>
  <img src="image.jpg" alt="图片描述">
  <figcaption>图片说明文字</figcaption>
</figure>
```

::: tip
始终为图片添加 `alt` 属性，这对于无障碍性和 SEO 都很重要。当图片无法加载时，浏览器会显示alt文本；屏幕阅读器会读出alt文本；搜索引擎会使用alt文本了解图片内容。
:::

### 音频和视频

```html
<!-- 音频 -->
<audio controls autoplay muted loop>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  您的浏览器不支持音频标签。
</audio>

<!-- 视频 -->
<video width="320" height="240" controls poster="thumbnail.jpg">
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
  <track src="subtitles_en.vtt" kind="subtitles" srclang="en" label="English">
  您的浏览器不支持视频标签。
</video>
```

::: info 音视频属性说明
- `controls`: 显示播放控件
- `autoplay`: 自动播放（注意：大多数浏览器会阻止自动播放带声音的媒体）
- `muted`: 静音播放
- `loop`: 循环播放
- `poster`: 视频加载前显示的图像
- `preload`: 预加载媒体（可选值：none, metadata, auto）
- `track`: 为视频添加字幕或标题
:::

## HTML 表单

表单用于收集用户输入，是网页交互的重要组成部分。

### 基本表单结构

```html
<form action="/submit-form" method="post" enctype="multipart/form-data">
  <fieldset>
    <legend>用户信息</legend>

    <div>
      <label for="username">用户名：</label>
      <input type="text" id="username" name="username" required minlength="3" maxlength="20" placeholder="请输入用户名">
    </div>

    <div>
      <label for="password">密码：</label>
      <input type="password" id="password" name="password" required pattern="^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$">
      <small>密码必须包含大小写字母和数字，至少8位</small>
    </div>

    <div>
      <input type="submit" value="提交">
      <input type="reset" value="重置">
    </div>
  </fieldset>
</form>
```

::: tip 表单属性说明
- `action`: 表单提交的URL
- `method`: 提交方法（get或post）
- `enctype`: 表单数据编码方式，上传文件时必须使用`multipart/form-data`
- `autocomplete`: 是否启用自动完成功能（on或off）
- `novalidate`: 禁用浏览器的自动验证
:::

### 常用表单元素

```html
<!-- 文本输入 -->
<input type="text" placeholder="请输入文本">

<!-- 密码输入 -->
<input type="password">

<!-- 单选按钮 -->
<input type="radio" id="male" name="gender" value="male" checked>
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
  <option value="" disabled selected>请选择</option>
  <option value="volvo">沃尔沃</option>
  <option value="saab">萨博</option>
  <option value="mercedes">奔驰</option>
  <option value="audi">奥迪</option>
</select>

<!-- 多选下拉列表 -->
<select name="fruits" multiple>
  <option value="apple">苹果</option>
  <option value="banana">香蕉</option>
  <option value="orange">橙子</option>
</select>

<!-- 文本区域 -->
<textarea name="message" rows="10" cols="30" placeholder="请在此输入内容..."></textarea>

<!-- 按钮 -->
<button type="button">普通按钮</button>
<button type="submit">提交按钮</button>
<button type="reset">重置按钮</button>

<!-- 文件上传 -->
<input type="file" id="myFile" name="myFile" accept="image/*" multiple>
<label for="myFile">选择文件</label>
```

### HTML5 新增表单元素和属性

```html
<!-- 日期选择器 -->
<input type="date" min="2023-01-01" max="2023-12-31">

<!-- 时间选择器 -->
<input type="time">

<!-- 日期时间选择器 -->
<input type="datetime-local">

<!-- 月份选择器 -->
<input type="month">

<!-- 周选择器 -->
<input type="week">

<!-- 颜色选择器 -->
<input type="color" value="#ff0000">

<!-- 范围滑块 -->
<input type="range" min="0" max="100" value="50" step="5" oninput="this.nextElementSibling.value = this.value">
<output>50</output>

<!-- 电子邮件输入 -->
<input type="email" placeholder="请输入邮箱" multiple>

<!-- 网址输入 -->
<input type="url" placeholder="请输入网址">

<!-- 电话号码输入 -->
<input type="tel" placeholder="请输入电话号码" pattern="[0-9]{11}">

<!-- 搜索框 -->
<input type="search" placeholder="搜索...">

<!-- 数字输入 -->
<input type="number" min="1" max="100" step="1">

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
HTML5 引入了多种新的输入类型和属性，使表单验证和用户体验更加友好。这些新特性在不支持的旧浏览器中会自动降级为普通文本输入框。
:::

### 表单验证

```html
<form>
  <!-- 必填字段 -->
  <input type="text" required>

  <!-- 最小/最大长度 -->
  <input type="text" minlength="3" maxlength="10">

  <!-- 数值范围 -->
  <input type="number" min="1" max="100">

  <!-- 正则表达式模式 -->
  <input type="text" pattern="[A-Za-z]{3}">

  <!-- 自定义验证消息 -->
  <input type="text" required oninvalid="this.setCustomValidity('请填写此字段')" oninput="this.setCustomValidity('')">
</form>
```

## HTML 表格

表格用于展示结构化数据。

```html
<table border="1" cellpadding="5" cellspacing="0">
  <caption>月度销售数据</caption>
  <colgroup>
    <col style="background-color:#f1f1f1">
    <col span="2" style="background-color:#f5f5f5">
  </colgroup>
  <thead>
    <tr>
      <th>月份</th>
      <th>销售额</th>
      <th>利润</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>一月</td>
      <td>$100</td>
      <td>$20</td>
    </tr>
    <tr>
      <td>二月</td>
      <td>$150</td>
      <td>$30</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>总计</td>
      <td>$250</td>
      <td>$50</td>
    </tr>
  </tfoot>
</table>
```

### 表格结构标签

- `<table>`: 定义表格
- `<caption>`: 表格标题
- `<colgroup>`: 列组，用于对列应用样式
- `<col>`: 定义列的属性
- `<thead>`: 表头部分
- `<tbody>`: 表格主体部分
- `<tfoot>`: 表格底部
- `<tr>`: 表格行
- `<th>`: 表头单元格
- `<td>`: 表格数据单元格

### 表格高级特性

```html
<!-- 单元格合并 -->
<table border="1">
  <tr>
    <td rowspan="2">合并行</td>
    <td>行1列2</td>
  </tr>
  <tr>
    <td>行2列2</td>
  </tr>
  <tr>
    <td colspan="2">合并列</td>
  </tr>
</table>

<!-- 表格分组 -->
<table border="1">
  <thead>
    <tr>
      <th>标题1</th>
      <th>标题2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>数据1</td>
      <td>数据2</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>脚注1</td>
      <td>脚注2</td>
    </tr>
  </tfoot>
</table>
```

::: warning 表格使用注意事项
- 不要使用表格进行页面布局，应使用CSS布局
- 表格应该只用于展示表格数据
- 使用`<thead>`, `<tbody>`, `<tfoot>`有助于提高可访问性
- 为复杂表格添加`scope`属性，帮助屏幕阅读器理解表格结构
:::

## HTML5 新特性

### Canvas 绘图

```html
<canvas id="myCanvas" width="200" height="100"></canvas>

<script>
  // 获取Canvas元素和上下文
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");

  // 绘制矩形
  ctx.fillStyle = "#FF0000";
  ctx.fillRect(0, 0, 150, 75);

  // 绘制文本
  ctx.font = "20px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Hello Canvas", 10, 50);

  // 绘制线条
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(200, 100);
  ctx.stroke();

  // 绘制圆形
  ctx.beginPath();
  ctx.arc(100, 50, 40, 0, 2 * Math.PI);
  ctx.stroke();
</script>
```

::: info Canvas应用场景
- 数据可视化和图表
- 动画和游戏开发
- 图像处理和滤镜
- 交互式图形界面
:::

### SVG 矢量图形

```html
<!-- 基本SVG示例 -->
<svg width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>

<!-- 更复杂的SVG示例 -->
<svg width="200" height="100">
  <!-- 矩形 -->
  <rect x="10" y="10" width="80" height="80" fill="blue" />

  <!-- 圆形 -->
  <circle cx="150" cy="50" r="40" fill="red" />

  <!-- 椭圆 -->
  <ellipse cx="150" cy="50" rx="40" ry="20" fill="green" />

  <!-- 线条 -->
  <line x1="0" y1="0" x2="200" y2="100" stroke="black" stroke-width="2" />

  <!-- 多边形 -->
  <polygon points="50,0 100,50 50,100 0,50" fill="purple" />

  <!-- 文本 -->
  <text x="100" y="50" font-size="16" text-anchor="middle" fill="white">SVG文本</text>
</svg>
```

::: tip SVG vs Canvas
- SVG: 基于XML的矢量图形，可缩放而不失真，适合静态图像和交互性较低的场景
- Canvas: 基于像素的位图绘制，适合复杂动画和图像处理
:::

### 地理定位

```html
<button onclick="getLocation()">获取位置</button>
<p id="demo"></p>

<script>
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // 成功回调
        function(position) {
          var latitude = position.coords.latitude;
          var longitude = position.coords.longitude;
          var accuracy = position.coords.accuracy;

          document.getElementById("demo").innerHTML =
            "纬度: " + latitude +
            "<br>经度: " + longitude +
            "<br>精确度: " + accuracy + " 米";

          // 可以使用Google Maps API显示位置
          // var mapUrl = "https://maps.google.com/?q=" + latitude + "," + longitude;
          // window.open(mapUrl);
        },
        // 错误回调
        function(error) {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              document.getElementById("demo").innerHTML = "用户拒绝了位置请求";
              break;
            case error.POSITION_UNAVAILABLE:
              document.getElementById("demo").innerHTML = "位置信息不可用";
              break;
            case error.TIMEOUT:
              document.getElementById("demo").innerHTML = "请求超时";
              break;
            case error.UNKNOWN_ERROR:
              document.getElementById("demo").innerHTML = "未知错误";
              break;
          }
        },
        // 选项
        {
          enableHighAccuracy: true, // 高精度
          timeout: 5000, // 超时时间
          maximumAge: 0 // 缓存时间
        }
      );
    } else {
      document.getElementByI
