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
      document.getElementById("demo").innerHTML = "浏览器不支持地理定位";
    }
  }
</script>
```

::: warning 地理定位注意事项
- 需要用户明确授权才能获取位置信息
- HTTPS 环境下才能正常工作
- 移动设备上的精度通常比桌面设备更高
- 考虑隐私保护，不要过度收集位置信息
:::

### 本地存储

```html
<script>
  // localStorage - 持久存储
  function saveToLocal() {
    const data = {
      username: 'jerry',
      preferences: {
        theme: 'dark',
        language: 'zh-CN'
      }
    };
    localStorage.setItem('userData', JSON.stringify(data));
  }

  function loadFromLocal() {
    const data = localStorage.getItem('userData');
    if (data) {
      const userData = JSON.parse(data);
      console.log('用户数据:', userData);
    }
  }

  // sessionStorage - 会话存储
  function saveToSession() {
    sessionStorage.setItem('tempData', '临时数据');
  }

  function loadFromSession() {
    const tempData = sessionStorage.getItem('tempData');
    console.log('临时数据:', tempData);
  }

  // 监听存储变化
  window.addEventListener('storage', function(e) {
    console.log('存储发生变化:', e.key, e.oldValue, e.newValue);
  });

  // 清理存储
  function clearStorage() {
    localStorage.clear();
    sessionStorage.clear();
  }
</script>
```

### Web Workers

```html
<!-- 主线程 -->
<script>
  // 创建 Web Worker
  if (typeof(Worker) !== "undefined") {
    const worker = new Worker('worker.js');
    
    // 发送消息给 Worker
    worker.postMessage({command: 'start', data: [1, 2, 3, 4, 5]});
    
    // 接收 Worker 消息
    worker.onmessage = function(e) {
      console.log('Worker 返回:', e.data);
      document.getElementById('result').innerHTML = e.data;
    };
    
    // 处理错误
    worker.onerror = function(error) {
      console.error('Worker 错误:', error);
    };
    
    // 终止 Worker
    // worker.terminate();
  } else {
    console.log('浏览器不支持 Web Workers');
  }
</script>

<!-- worker.js 文件内容 -->
<script type="text/plain" id="worker-code">
  // 监听主线程消息
  self.onmessage = function(e) {
    const {command, data} = e.data;
    
    if (command === 'start') {
      // 执行耗时计算
      let result = 0;
      for (let i = 0; i < data.length; i++) {
        result += data[i] * data[i];
        
        // 报告进度
        self.postMessage({
          type: 'progress',
          progress: (i + 1) / data.length * 100
        });
      }
      
      // 返回结果
      self.postMessage({
        type: 'result',
        result: result
      });
    }
  };
</script>
```

## 现代 HTML 特性

### Web Components

```html
<!-- 自定义元素定义 -->
<script>
class CustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        button {
          background: var(--primary-color, #007bff);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          opacity: 0.8;
        }
      </style>
      <button><slot></slot></button>
    `;
  }
}

customElements.define('custom-button', CustomButton);
</script>

<!-- 使用自定义元素 -->
<custom-button>点击我</custom-button>
```

### HTML 模板

```html
<!-- 模板定义 -->
<template id="user-card-template">
  <div class="user-card">
    <img class="avatar" src="" alt="">
    <h3 class="name"></h3>
    <p class="email"></p>
    <button class="follow-btn">关注</button>
  </div>
</template>

<script>
// 使用模板
function createUserCard(user) {
  const template = document.getElementById('user-card-template');
  const clone = template.content.cloneNode(true);
  
  clone.querySelector('.avatar').src = user.avatar;
  clone.querySelector('.name').textContent = user.name;
  clone.querySelector('.email').textContent = user.email;
  
  return clone;
}

// 创建用户卡片
const user = { name: 'Jerry', email: 'jerry@example.com', avatar: 'avatar.jpg' };
const userCard = createUserCard(user);
document.body.appendChild(userCard);
</script>
```

### 现代表单特性

```html
<!-- 高级表单验证 -->
<form novalidate>
  <!-- 自定义验证消息 -->
  <input 
    type="email" 
    required 
    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
    title="请输入有效的邮箱地址"
    oninvalid="this.setCustomValidity('邮箱格式不正确')"
    oninput="this.setCustomValidity('')"
  >
  
  <!-- 数字输入范围 -->
  <input 
    type="range" 
    min="0" 
    max="100" 
    step="5" 
    value="50"
    oninput="document.getElementById('range-value').textContent = this.value"
  >
  <span id="range-value">50</span>
  
  <!-- 颜色选择器 -->
  <input type="color" value="#ff0000">
  
  <!-- 日期时间选择 -->
  <input type="datetime-local" min="2024-01-01T00:00" max="2024-12-31T23:59">
  
  <!-- 文件上传增强 -->
  <input 
    type="file" 
    multiple 
    accept="image/*,.pdf,.doc,.docx"
    capture="environment"
  >
  
  <!-- 数据列表 -->
  <input list="browsers" placeholder="选择浏览器">
  <datalist id="browsers">
    <option value="Chrome">
    <option value="Firefox">
    <option value="Safari">
    <option value="Edge">
  </datalist>
</form>
```

### 语义化增强

```html
<!-- 文章结构 -->
<article>
  <header>
    <h1>文章标题</h1>
    <p>发布于 <time datetime="2024-01-15">2024年1月15日</time></p>
    <address>作者：<a href="mailto:jerry@example.com">Jerry</a></address>
  </header>
  
  <section>
    <h2>章节标题</h2>
    <p>章节内容...</p>
    
    <!-- 引用 -->
    <blockquote cite="https://example.com">
      <p>这是一段引用文字。</p>
      <footer>— <cite>引用来源</cite></footer>
    </blockquote>
  </section>
  
  <aside>
    <h3>相关链接</h3>
    <ul>
      <li><a href="#">相关文章1</a></li>
      <li><a href="#">相关文章2</a></li>
    </ul>
  </aside>
  
  <footer>
    <p>标签：
      <span class="tag">HTML</span>
      <span class="tag">前端</span>
    </p>
  </footer>
</article>

<!-- 导航结构 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/" aria-current="page">首页</a></li>
    <li><a href="/about">关于</a></li>
    <li><a href="/contact">联系</a></li>
  </ul>
</nav>

<!-- 面包屑导航 -->
<nav aria-label="面包屑">
  <ol>
    <li><a href="/">首页</a></li>
    <li><a href="/category">分类</a></li>
    <li aria-current="page">当前页面</li>
  </ol>
</nav>
```

## 无障碍访问 (Accessibility)

### ARIA 属性

```html
<!-- 角色和状态 -->
<button 
  aria-expanded="false" 
  aria-controls="menu"
  aria-haspopup="true"
  onclick="toggleMenu()"
>
  菜单
</button>

<ul id="menu" role="menu" aria-hidden="true">
  <li role="menuitem"><a href="#">选项1</a></li>
  <li role="menuitem"><a href="#">选项2</a></li>
</ul>

<!-- 表单标签关联 -->
<label for="username">用户名：</label>
<input 
  id="username" 
  type="text" 
  aria-describedby="username-help"
  aria-required="true"
>
<div id="username-help">请输入3-20个字符</div>

<!-- 错误提示 -->
<input 
  type="email" 
  aria-invalid="true" 
  aria-describedby="email-error"
>
<div id="email-error" role="alert">邮箱格式不正确</div>

<!-- 进度指示器 -->
<div 
  role="progressbar" 
  aria-valuenow="32" 
  aria-valuemin="0" 
  aria-valuemax="100"
  aria-label="文件上传进度"
>
  <div style="width: 32%"></div>
</div>

<!-- 标签页 -->
<div role="tablist">
  <button 
    role="tab" 
    aria-selected="true" 
    aria-controls="panel1"
    id="tab1"
  >
    标签1
  </button>
  <button 
    role="tab" 
    aria-selected="false" 
    aria-controls="panel2"
    id="tab2"
  >
    标签2
  </button>
</div>

<div role="tabpanel" id="panel1" aria-labelledby="tab1">
  标签1的内容
</div>
```

### 键盘导航

```html
<!-- 跳过链接 -->
<a href="#main-content" class="skip-link">跳到主内容</a>

<!-- 焦点管理 -->
<div class="modal" role="dialog" aria-labelledby="modal-title">
  <h2 id="modal-title">对话框标题</h2>
  <p>对话框内容</p>
  <button onclick="closeModal()">关闭</button>
</div>

<script>
// 焦点陷阱
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });
}
</script>
```

## 性能优化

### 资源加载优化

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="hero-image.jpg" as="image">
<link rel="preload" href="main.js" as="script">

<!-- 预连接到外部域名 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://api.example.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预获取下一页资源 -->
<link rel="prefetch" href="/next-page.html">
<link rel="prefetch" href="/images/next-page-hero.jpg">

<!-- 模块预加载 -->
<link rel="modulepreload" href="/modules/app.js">
```

### 图片优化

```html
<!-- 响应式图片 -->
<picture>
  <source 
    media="(min-width: 800px)" 
    srcset="large.webp" 
    type="image/webp"
  >
  <source 
    media="(min-width: 800px)" 
    srcset="large.jpg"
  >
  <source 
    srcset="small.webp" 
    type="image/webp"
  >
  <img 
    src="small.jpg" 
    alt="描述文字"
    loading="lazy"
    decoding="async"
  >
</picture>

<!-- 高密度屏幕适配 -->
<img 
  src="image.jpg" 
  srcset="image.jpg 1x, image@2x.jpg 2x, image@3x.jpg 3x"
  alt="描述文字"
>

<!-- 懒加载 -->
<img 
  src="placeholder.jpg" 
  data-src="actual-image.jpg"
  loading="lazy"
  class="lazy-load"
  alt="描述文字"
>

<!-- 关键图片优先加载 -->
<img 
  src="hero-image.jpg" 
  fetchpriority="high"
  alt="英雄图片"
>
```

### 脚本优化

```html
<!-- 异步加载非关键脚本 -->
<script src="analytics.js" async></script>

<!-- 延迟加载脚本 -->
<script src="non-critical.js" defer></script>

<!-- 模块化脚本 -->
<script type="module" src="app.js"></script>
<script nomodule src="app-legacy.js"></script>

<!-- 内联关键脚本 -->
<script>
  // 关键的内联 JavaScript
  document.documentElement.className = 'js';
</script>
```

## 安全性

### 内容安全策略

```html
<!-- CSP 头部 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'">

<!-- 防止点击劫持 -->
<meta http-equiv="X-Frame-Options" content="DENY">

<!-- 防止 MIME 类型嗅探 -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">

<!-- XSS 保护 -->
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

### 表单安全

```html
<!-- CSRF 保护 -->
<form method="post" action="/submit">
  <input type="hidden" name="_token" value="{{ csrf_token }}">
  
  <!-- 防止自动填充敏感信息 -->
  <input type="password" autocomplete="new-password">
  
  <!-- 输入验证 -->
  <input 
    type="text" 
    pattern="[A-Za-z0-9]+" 
    maxlength="50"
    required
  >
</form>
```

## 最佳实践

### 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>页面标题 - 网站名称</title>
  
  <!-- SEO 元数据 -->
  <meta name="description" content="页面描述，不超过160个字符">
  <meta name="keywords" content="关键词1,关键词2,关键词3">
  <meta name="author" content="作者名称">
  
  <!-- Open Graph -->
  <meta property="og:title" content="页面标题">
  <meta property="og:description" content="页面描述">
  <meta property="og:image" content="https://example.com/image.jpg">
  <meta property="og:url" content="https://example.com/page">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="页面标题">
  <meta name="twitter:description" content="页面描述">
  <meta name="twitter:image" content="https://example.com/image.jpg">
  
  <!-- 图标 -->
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  
  <!-- 样式表 -->
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- 跳过链接 -->
  <a href="#main" class="skip-link">跳到主内容</a>
  
  <!-- 页头 -->
  <header role="banner">
    <nav role="navigation" aria-label="主导航">
      <!-- 导航内容 -->
    </nav>
  </header>
  
  <!-- 主内容 -->
  <main id="main" role="main">
    <!-- 页面主要内容 -->
  </main>
  
  <!-- 侧边栏 -->
  <aside role="complementary">
    <!-- 辅助内容 -->
  </aside>
  
  <!-- 页脚 -->
  <footer role="contentinfo">
    <!-- 页脚内容 -->
  </footer>
  
  <!-- 脚本 -->
  <script src="app.js"></script>
</body>
</html>
```

### 代码规范

```html
<!-- 良好的代码风格 -->
<article class="blog-post" data-post-id="123">
  <header class="blog-post__header">
    <h1 class="blog-post__title">文章标题</h1>
    <time class="blog-post__date" datetime="2024-01-15">
      2024年1月15日
    </time>
  </header>
  
  <div class="blog-post__content">
    <p>文章内容段落...</p>
    
    <!-- 使用语义化标签 -->
    <figure class="blog-post__image">
      <img src="image.jpg" alt="图片描述">
      <figcaption>图片说明</figcaption>
    </figure>
  </div>
  
  <footer class="blog-post__footer">
    <div class="blog-post__tags">
      <span class="tag">HTML</span>
      <span class="tag">前端</span>
    </div>
  </footer>
</article>
```

## 总结

HTML 是 Web 开发的基础，掌握语义化标签、表单处理、多媒体集成等核心概念对于构建现代 Web 应用至关重要。随着 HTML5 的普及，新的 API 和特性为开发者提供了更多可能性。现代 HTML 开发还需要关注无障碍访问、性能优化和安全性等方面，以构建更好的用户体验。
