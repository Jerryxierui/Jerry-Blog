# 图片优化与处理

## 简介
### 🚀 什么是图片优化

图片优化是指通过各种技术手段减少图片文件大小、提升加载速度、改善用户体验的过程。图片通常占据网页总大小的很大比例，优化图片是提升网站性能的重要手段。

### 核心优势
- **减少带宽消耗**：降低服务器和用户的流量成本
- **提升加载速度**：更快的页面渲染和用户体验
- **改善 SEO**：搜索引擎偏好加载速度快的网站
- **节省存储空间**：减少服务器存储成本
- **提升转化率**：更快的加载速度带来更高的用户留存

### 优化策略
- **格式选择**：选择最适合的图片格式
- **压缩优化**：无损和有损压缩
- **尺寸适配**：响应式图片和多尺寸适配
- **懒加载**：按需加载图片
- **CDN 加速**：全球分发网络
- **现代格式**：WebP、AVIF 等新格式

## 图片格式选择
### 格式对比分析

```javascript
// 图片格式分析工具
class ImageFormatAnalyzer {
  constructor() {
    this.formats = {
      jpeg: {
        name: 'JPEG',
        extension: ['.jpg', '.jpeg'],
        compression: 'lossy',
        transparency: false,
        animation: false,
        bestFor: ['photos', 'complex-images'],
        browserSupport: 100,
        averageCompression: 0.7
      },
      png: {
        name: 'PNG',
        extension: ['.png'],
        compression: 'lossless',
        transparency: true,
        animation: false,
        bestFor: ['logos', 'icons', 'simple-graphics'],
        browserSupport: 100,
        averageCompression: 0.9
      },
      webp: {
        name: 'WebP',
        extension: ['.webp'],
        compression: 'both',
        transparency: true,
        animation: true,
        bestFor: ['all-types'],
        browserSupport: 95,
        averageCompression: 0.5
      },
      avif: {
        name: 'AVIF',
        extension: ['.avif'],
        compression: 'both',
        transparency: true,
        animation: true,
        bestFor: ['all-types'],
        browserSupport: 75,
        averageCompression: 0.3
      },
      svg: {
        name: 'SVG',
        extension: ['.svg'],
        compression: 'vector',
        transparency: true,
        animation: true,
        bestFor: ['icons', 'simple-graphics', 'logos'],
        browserSupport: 98,
        averageCompression: 0.2
      },
      gif: {
        name: 'GIF',
        extension: ['.gif'],
        compression: 'lossless',
        transparency: true,
        animation: true,
        bestFor: ['simple-animations'],
        browserSupport: 100,
        averageCompression: 0.8
      }
    }
  }
  
  // 推荐最佳格式
  recommendFormat(imageType, requirements = {}) {
    const {
      needsTransparency = false,
      needsAnimation = false,
      isPhoto = false,
      targetBrowserSupport = 95,
      prioritizeSize = true
    } = requirements
    
    let candidates = Object.entries(this.formats)
      .filter(([, format]) => {
        if (needsTransparency && !format.transparency) return false
        if (needsAnimation && !format.animation) return false
        if (format.browserSupport < targetBrowserSupport) return false
        return true
      })
    
    if (isPhoto) {
      candidates = candidates.filter(([, format]) => 
        format.bestFor.includes('photos') || format.bestFor.includes('all-types')
      )
    }
    
    if (prioritizeSize) {
      candidates.sort(([, a], [, b]) => a.averageCompression - b.averageCompression)
    }
    
    return candidates.length > 0 ? candidates[0][0] : 'jpeg'
  }
  
  // 生成多格式配置
  generateMultiFormatConfig(originalFormat, requirements) {
    const primary = this.recommendFormat('photo', requirements)
    const fallback = originalFormat === 'png' ? 'png' : 'jpeg'
    
    return {
      primary,
      fallback,
      sources: [
        { format: 'avif', condition: 'modern-browsers' },
        { format: 'webp', condition: 'webp-support' },
        { format: primary, condition: 'default' }
      ]
    }
  }
  
  // 检测浏览器支持
  detectBrowserSupport() {
    const support = {
      webp: false,
      avif: false,
      jpeg2000: false,
      jpegxr: false
    }
    
    // WebP 检测
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    support.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    
    // AVIF 检测（需要异步）
    this.detectAVIFSupport().then(supported => {
      support.avif = supported
    })
    
    return support
  }
  
  async detectAVIFSupport() {
    return new Promise(resolve => {
      const avif = new Image()
      avif.onload = () => resolve(true)
      avif.onerror = () => resolve(false)
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })
  }
}

// 使用示例
const formatAnalyzer = new ImageFormatAnalyzer()

// 推荐格式
const recommendation = formatAnalyzer.recommendFormat('photo', {
  needsTransparency: false,
  isPhoto: true,
  prioritizeSize: true
})

console.log('Recommended format:', recommendation)

// 生成多格式配置
const multiFormat = formatAnalyzer.generateMultiFormatConfig('jpeg', {
  needsTransparency: false,
  isPhoto: true
})

console.log('Multi-format config:', multiFormat)
```

### 响应式图片实现

```html
<!-- 现代响应式图片实现 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>响应式图片示例</title>
</head>
<body>
  <!-- 1. 基础 picture 元素 -->
  <picture>
    <source srcset="hero-image.avif" type="image/avif">
    <source srcset="hero-image.webp" type="image/webp">
    <img src="hero-image.jpg" alt="Hero Image" loading="lazy">
  </picture>
  
  <!-- 2. 多尺寸响应式图片 -->
  <picture>
    <source 
      media="(min-width: 1200px)"
      srcset="hero-large.avif 1200w, hero-xlarge.avif 1600w"
      type="image/avif">
    <source 
      media="(min-width: 768px)"
      srcset="hero-medium.avif 768w, hero-large.avif 1200w"
      type="image/avif">
    <source 
      srcset="hero-small.avif 480w, hero-medium.avif 768w"
      type="image/avif">
    
    <source 
      media="(min-width: 1200px)"
      srcset="hero-large.webp 1200w, hero-xlarge.webp 1600w"
      type="image/webp">
    <source 
      media="(min-width: 768px)"
      srcset="hero-medium.webp 768w, hero-large.webp 1200w"
      type="image/webp">
    <source 
      srcset="hero-small.webp 480w, hero-medium.webp 768w"
      type="image/webp">
    
    <img 
      src="hero-medium.jpg"
      srcset="hero-small.jpg 480w, hero-medium.jpg 768w, hero-large.jpg 1200w"
      sizes="(min-width: 1200px) 1200px, (min-width: 768px) 768px, 480px"
      alt="Responsive Hero Image"
      loading="lazy">
  </picture>
  
  <!-- 3. 艺术方向响应式图片 -->
  <picture>
    <source 
      media="(orientation: portrait)"
      srcset="portrait-image.webp"
      type="image/webp">
    <source 
      media="(orientation: landscape)"
      srcset="landscape-image.webp"
      type="image/webp">
    <img src="default-image.jpg" alt="Art Direction Example">
  </picture>
  
  <!-- 4. 高 DPI 显示器适配 -->
  <picture>
    <source 
      srcset="image-1x.webp 1x, image-2x.webp 2x, image-3x.webp 3x"
      type="image/webp">
    <img 
      src="image-1x.jpg"
      srcset="image-1x.jpg 1x, image-2x.jpg 2x, image-3x.jpg 3x"
      alt="High DPI Image">
  </picture>
</body>
</html>
```

```javascript
// 响应式图片管理器
class ResponsiveImageManager {
  constructor() {
    this.breakpoints = {
      xs: 480,
      sm: 768,
      md: 1024,
      lg: 1200,
      xl: 1600
    }
    
    this.densities = [1, 1.5, 2, 3]
    this.formats = ['avif', 'webp', 'jpg']
    
    this.observer = null
    this.setupIntersectionObserver()
  }
  
  // 生成响应式图片配置
  generateResponsiveConfig(imageName, options = {}) {
    const {
      sizes = 'auto',
      artDirection = false,
      lazyLoad = true
    } = options
    
    const config = {
      sources: [],
      fallback: null,
      attributes: {}
    }
    
    // 生成不同格式的 source
    for (const format of this.formats) {
      const source = {
        type: `image/${format}`,
        srcset: this.generateSrcSet(imageName, format),
        sizes: sizes === 'auto' ? this.generateSizes() : sizes
      }
      
      config.sources.push(source)
    }
    
    // 生成 fallback img
    config.fallback = {
      src: `${imageName}-md.jpg`,
      srcset: this.generateSrcSet(imageName, 'jpg'),
      sizes: config.sources[0].sizes,
      alt: options.alt || '',
      loading: lazyLoad ? 'lazy' : 'eager'
    }
    
    return config
  }
  
  generateSrcSet(imageName, format) {
    const srcset = []
    
    for (const [breakpoint, width] of Object.entries(this.breakpoints)) {
      for (const density of this.densities) {
        const actualWidth = Math.round(width * density)
        const filename = `${imageName}-${breakpoint}${density > 1 ? `@${density}x` : ''}.${format}`
        srcset.push(`${filename} ${actualWidth}w`)
      }
    }
    
    return srcset.join(', ')
  }
  
  generateSizes() {
    const sizes = []
    
    for (const [breakpoint, width] of Object.entries(this.breakpoints).reverse()) {
      if (breakpoint === 'xs') {
        sizes.push(`${width}px`)
      } else {
        sizes.push(`(min-width: ${width}px) ${width}px`)
      }
    }
    
    return sizes.join(', ')
  }
  
  // 创建响应式图片元素
  createElement(imageName, options = {}) {
    const config = this.generateResponsiveConfig(imageName, options)
    
    const picture = document.createElement('picture')
    
    // 添加 source 元素
    config.sources.forEach(sourceConfig => {
      const source = document.createElement('source')
      source.srcset = sourceConfig.srcset
      source.type = sourceConfig.type
      source.sizes = sourceConfig.sizes
      
      if (sourceConfig.media) {
        source.media = sourceConfig.media
      }
      
      picture.appendChild(source)
    })
    
    // 添加 img 元素
    const img = document.createElement('img')
    Object.assign(img, config.fallback)
    picture.appendChild(img)
    
    return picture
  }
  
  // 懒加载实现
  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target)
            this.observer.unobserve(entry.target)
          }
        })
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      })
    }
  }
  
  loadImage(img) {
    if (img.dataset.src) {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    }
    
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset
      img.removeAttribute('data-srcset')
    }
    
    // 处理 picture 元素中的 source
    const picture = img.closest('picture')
    if (picture) {
      const sources = picture.querySelectorAll('source[data-srcset]')
      sources.forEach(source => {
        source.srcset = source.dataset.srcset
        source.removeAttribute('data-srcset')
      })
    }
    
    img.classList.add('loaded')
  }
  
  // 启用懒加载
  enableLazyLoading(selector = 'img[data-src], img[loading="lazy"]') {
    if (!this.observer) return
    
    const images = document.querySelectorAll(selector)
    images.forEach(img => {
      this.observer.observe(img)
    })
  }
  
  // 预加载关键图片
  preloadCriticalImages(imageUrls) {
    imageUrls.forEach(url => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
    })
  }
}

// 使用示例
const imageManager = new ResponsiveImageManager()

// 生成响应式图片
const heroImage = imageManager.createElement('hero', {
  alt: 'Hero Image',
  sizes: '(min-width: 1200px) 1200px, (min-width: 768px) 768px, 100vw'
})

document.body.appendChild(heroImage)

// 启用懒加载
imageManager.enableLazyLoading()

// 预加载关键图片
imageManager.preloadCriticalImages([
  'hero-lg.webp',
  'logo.svg'
])
```

## 图片压缩优化
### 自动化压缩工具

```javascript
// 图片压缩工具
const sharp = require('sharp')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const imageminAvif = require('imagemin-avif')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const imageminSvgo = require('imagemin-svgo')
const fs = require('fs').promises
const path = require('path')

class ImageOptimizer {
  constructor(options = {}) {
    this.options = {
      inputDir: options.inputDir || 'src/images',
      outputDir: options.outputDir || 'dist/images',
      quality: options.quality || 80,
      progressive: options.progressive !== false,
      generateWebP: options.generateWebP !== false,
      generateAVIF: options.generateAVIF !== false,
      generateResponsive: options.generateResponsive !== false,
      breakpoints: options.breakpoints || [480, 768, 1024, 1200, 1600],
      densities: options.densities || [1, 2],
      ...options
    }
    
    this.stats = {
      processed: 0,
      originalSize: 0,
      optimizedSize: 0,
      errors: []
    }
  }
  
  // 主要优化方法
  async optimize() {
    try {
      console.log('Starting image optimization...')
      
      await this.ensureDirectories()
      const images = await this.getImageFiles()
      
      for (const imagePath of images) {
        await this.processImage(imagePath)
      }
      
      this.printStats()
    } catch (error) {
      console.error('Optimization failed:', error)
    }
  }
  
  async ensureDirectories() {
    await fs.mkdir(this.options.outputDir, { recursive: true })
  }
  
  async getImageFiles() {
    const files = await fs.readdir(this.options.inputDir)
    return files
      .filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file))
      .map(file => path.join(this.options.inputDir, file))
  }
  
  async processImage(imagePath) {
    try {
      const filename = path.basename(imagePath, path.extname(imagePath))
      const ext = path.extname(imagePath).toLowerCase()
      
      console.log(`Processing: ${filename}${ext}`)
      
      // 获取原始文件大小
      const originalStats = await fs.stat(imagePath)
      this.stats.originalSize += originalStats.size
      
      // 处理不同格式
      if (ext === '.svg') {
        await this.optimizeSVG(imagePath)
      } else {
        await this.optimizeRasterImage(imagePath, filename, ext)
      }
      
      this.stats.processed++
    } catch (error) {
      console.error(`Error processing ${imagePath}:`, error)
      this.stats.errors.push({ file: imagePath, error: error.message })
    }
  }
  
  async optimizeSVG(imagePath) {
    const filename = path.basename(imagePath)
    const outputPath = path.join(this.options.outputDir, filename)
    
    await imagemin([imagePath], {
      destination: path.dirname(outputPath),
      plugins: [
        imageminSvgo({
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeDimensions', active: true },
            { name: 'removeComments', active: true },
            { name: 'removeMetadata', active: true }
          ]
        })
      ]
    })
    
    const optimizedStats = await fs.stat(outputPath)
    this.stats.optimizedSize += optimizedStats.size
  }
  
  async optimizeRasterImage(imagePath, filename, ext) {
    const image = sharp(imagePath)
    const metadata = await image.metadata()
    
    // 生成响应式尺寸
    if (this.options.generateResponsive) {
      await this.generateResponsiveSizes(image, filename, metadata)
    }
    
    // 生成现代格式
    if (this.options.generateWebP) {
      await this.generateWebP(imagePath, filename)
    }
    
    if (this.options.generateAVIF) {
      await this.generateAVIF(imagePath, filename)
    }
    
    // 优化原格式
    await this.optimizeOriginalFormat(imagePath, filename, ext)
  }
  
  async generateResponsiveSizes(image, filename, metadata) {
    for (const breakpoint of this.options.breakpoints) {
      if (breakpoint >= metadata.width) continue
      
      for (const density of this.options.densities) {
        const width = Math.round(breakpoint * density)
        const suffix = density > 1 ? `@${density}x` : ''
        
        // JPEG
        await image
          .clone()
          .resize(width)
          .jpeg({ 
            quality: this.options.quality,
            progressive: this.options.progressive
          })
          .toFile(path.join(this.options.outputDir, `${filename}-${breakpoint}${suffix}.jpg`))
        
        // WebP
        if (this.options.generateWebP) {
          await image
            .clone()
            .resize(width)
            .webp({ quality: this.options.quality })
            .toFile(path.join(this.options.outputDir, `${filename}-${breakpoint}${suffix}.webp`))
        }
        
        // AVIF
        if (this.options.generateAVIF) {
          await image
            .clone()
            .resize(width)
            .avif({ quality: this.options.quality })
            .toFile(path.join(this.options.outputDir, `${filename}-${breakpoint}${suffix}.avif`))
        }
      }
    }
  }
  
  async generateWebP(imagePath, filename) {
    const outputPath = path.join(this.options.outputDir, `${filename}.webp`)
    
    await imagemin([imagePath], {
      destination: path.dirname(outputPath),
      plugins: [
        imageminWebp({
          quality: this.options.quality,
          method: 6
        })
      ]
    })
    
    const stats = await fs.stat(outputPath)
    this.stats.optimizedSize += stats.size
  }
  
  async generateAVIF(imagePath, filename) {
    const outputPath = path.join(this.options.outputDir, `${filename}.avif`)
    
    await imagemin([imagePath], {
      destination: path.dirname(outputPath),
      plugins: [
        imageminAvif({
          quality: this.options.quality,
          speed: 6
        })
      ]
    })
    
    const stats = await fs.stat(outputPath)
    this.stats.optimizedSize += stats.size
  }
  
  async optimizeOriginalFormat(imagePath, filename, ext) {
    let outputPath
    let plugins = []
    
    if (ext === '.jpg' || ext === '.jpeg') {
      outputPath = path.join(this.options.outputDir, `${filename}.jpg`)
      plugins = [
        imageminMozjpeg({
          quality: this.options.quality,
          progressive: this.options.progressive
        })
      ]
    } else if (ext === '.png') {
      outputPath = path.join(this.options.outputDir, `${filename}.png`)
      plugins = [
        imageminPngquant({
          quality: [0.6, 0.8],
          speed: 1
        })
      ]
    }
    
    if (plugins.length > 0) {
      await imagemin([imagePath], {
        destination: path.dirname(outputPath),
        plugins
      })
      
      const stats = await fs.stat(outputPath)
      this.stats.optimizedSize += stats.size
    }
  }
  
  printStats() {
    const savings = this.stats.originalSize - this.stats.optimizedSize
    const percentage = ((savings / this.stats.originalSize) * 100).toFixed(2)
    
    console.log('\n=== Optimization Results ===')
    console.log(`Processed: ${this.stats.processed} images`)
    console.log(`Original size: ${this.formatBytes(this.stats.originalSize)}`)
    console.log(`Optimized size: ${this.formatBytes(this.stats.optimizedSize)}`)
    console.log(`Savings: ${this.formatBytes(savings)} (${percentage}%)`)
    
    if (this.stats.errors.length > 0) {
      console.log(`\nErrors: ${this.stats.errors.length}`)
      this.stats.errors.forEach(error => {
        console.log(`  ${error.file}: ${error.error}`)
      })
    }
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// Webpack 插件版本
class ImageOptimizationPlugin {
  constructor(options = {}) {
    this.options = {
      test: /\.(jpe?g|png|gif|svg)$/i,
      quality: 80,
      generateWebP: true,
      generateAVIF: false,
      ...options
    }
  }
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('ImageOptimizationPlugin', (compilation, callback) => {
      const promises = []
      
      Object.keys(compilation.assets).forEach(filename => {
        if (this.options.test.test(filename)) {
          const asset = compilation.assets[filename]
          const source = asset.source()
          
          promises.push(this.optimizeAsset(filename, source, compilation))
        }
      })
      
      Promise.all(promises)
        .then(() => callback())
        .catch(callback)
    })
  }
  
  async optimizeAsset(filename, source, compilation) {
    try {
      const ext = path.extname(filename).toLowerCase()
      const name = path.basename(filename, ext)
      
      if (ext === '.svg') {
        // SVG 优化
        const optimized = await imagemin.buffer(source, {
          plugins: [imageminSvgo()]
        })
        
        compilation.assets[filename] = {
          source: () => optimized,
          size: () => optimized.length
        }
      } else {
        // 栅格图片优化
        await this.optimizeRasterAsset(filename, source, compilation)
      }
    } catch (error) {
      console.error(`Failed to optimize ${filename}:`, error)
    }
  }
  
  async optimizeRasterAsset(filename, source, compilation) {
    const ext = path.extname(filename).toLowerCase()
    const name = path.basename(filename, ext)
    
    // 优化原格式
    let optimized
    
    if (ext === '.jpg' || ext === '.jpeg') {
      optimized = await imagemin.buffer(source, {
        plugins: [imageminMozjpeg({ quality: this.options.quality })]
      })
    } else if (ext === '.png') {
      optimized = await imagemin.buffer(source, {
        plugins: [imageminPngquant({ quality: [0.6, 0.8] })]
      })
    }
    
    if (optimized) {
      compilation.assets[filename] = {
        source: () => optimized,
        size: () => optimized.length
      }
    }
    
    // 生成 WebP
    if (this.options.generateWebP) {
      const webpBuffer = await imagemin.buffer(source, {
        plugins: [imageminWebp({ quality: this.options.quality })]
      })
      
      compilation.assets[`${name}.webp`] = {
        source: () => webpBuffer,
        size: () => webpBuffer.length
      }
    }
    
    // 生成 AVIF
    if (this.options.generateAVIF) {
      const avifBuffer = await imagemin.buffer(source, {
        plugins: [imageminAvif({ quality: this.options.quality })]
      })
      
      compilation.assets[`${name}.avif`] = {
        source: () => avifBuffer,
        size: () => avifBuffer.length
      }
    }
  }
}

// 使用示例
const optimizer = new ImageOptimizer({
  inputDir: 'src/assets/images',
  outputDir: 'dist/images',
  quality: 85,
  generateWebP: true,
  generateAVIF: true,
  generateResponsive: true,
  breakpoints: [480, 768, 1024, 1200, 1600]
})

optimizer.optimize()

// Webpack 配置
module.exports = {
  plugins: [
    new ImageOptimizationPlugin({
      quality: 80,
      generateWebP: true,
      generateAVIF: false
    })
  ]
}
```

### 在线压缩服务

```javascript
// 在线图片压缩服务集成
class OnlineImageOptimizer {
  constructor() {
    this.services = {
      tinypng: {
        name: 'TinyPNG',
        apiUrl: 'https://api.tinify.com/shrink',
        supportedFormats: ['png', 'jpg', 'jpeg'],
        maxSize: 5 * 1024 * 1024, // 5MB
        requiresAuth: true
      },
      kraken: {
        name: 'Kraken.io',
        apiUrl: 'https://api.kraken.io/v1/upload',
        supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        maxSize: 32 * 1024 * 1024, // 32MB
        requiresAuth: true
      },
      imageoptim: {
        name: 'ImageOptim API',
        apiUrl: 'https://im2.io/api/upload',
        supportedFormats: ['png', 'jpg', 'jpeg', 'gif', 'svg'],
        maxSize: 10 * 1024 * 1024, // 10MB
        requiresAuth: false
      }
    }
    
    this.apiKeys = {
      tinypng: process.env.TINYPNG_API_KEY,
      kraken: {
        key: process.env.KRAKEN_API_KEY,
        secret: process.env.KRAKEN_API_SECRET
      }
    }
  }
  
  // 选择最佳服务
  selectBestService(fileSize, format) {
    const availableServices = Object.entries(this.services)
      .filter(([name, service]) => {
        // 检查格式支持
        if (!service.supportedFormats.includes(format.toLowerCase())) {
          return false
        }
        
        // 检查文件大小限制
        if (fileSize > service.maxSize) {
          return false
        }
        
        // 检查 API 密钥
        if (service.requiresAuth && !this.apiKeys[name]) {
          return false
        }
        
        return true
      })
    
    // 优先选择 TinyPNG（质量最好）
    const tinypng = availableServices.find(([name]) => name === 'tinypng')
    if (tinypng) return tinypng[0]
    
    // 其次选择 Kraken
    const kraken = availableServices.find(([name]) => name === 'kraken')
    if (kraken) return kraken[0]
    
    // 最后选择免费服务
    return availableServices.length > 0 ? availableServices[0][0] : null
  }
  
  // 使用 TinyPNG 压缩
  async compressWithTinyPNG(imageBuffer) {
    const response = await fetch('https://api.tinify.com/shrink', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`api:${this.apiKeys.tinypng}`).toString('base64')}`,
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    })
    
    if (!response.ok) {
      throw new Error(`TinyPNG API error: ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // 下载压缩后的图片
    const compressedResponse = await fetch(result.output.url)
    const compressedBuffer = await compressedResponse.arrayBuffer()
    
    return {
      buffer: Buffer.from(compressedBuffer),
      originalSize: result.input.size,
      compressedSize: result.output.size,
      ratio: result.output.ratio
    }
  }
  
  // 使用 Kraken.io 压缩
  async compressWithKraken(imageBuffer, options = {}) {
    const formData = new FormData()
    formData.append('auth', JSON.stringify(this.apiKeys.kraken))
    formData.append('wait', 'true')
    formData.append('lossy', options.lossy !== false)
    formData.append('quality', options.quality || 80)
    formData.append('file', new Blob([imageBuffer]))
    
    const response = await fetch('https://api.kraken.io/v1/upload', {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(`Kraken.io API error: ${result.message}`)
    }
    
    // 下载压缩后的图片
    const compressedResponse = await fetch(result.kraked_url)
    const compressedBuffer = await compressedResponse.arrayBuffer()
    
    return {
      buffer: Buffer.from(compressedBuffer),
      originalSize: result.original_size,
      compressedSize: result.kraked_size,
      ratio: result.saved_bytes / result.original_size
    }
  }
  
  // 通用压缩方法
  async compress(imageBuffer, format, options = {}) {
    const service = this.selectBestService(imageBuffer.length, format)
    
    if (!service) {
      throw new Error('No suitable compression service available')
    }
    
    console.log(`Using ${this.services[service].name} for compression`)
    
    switch (service) {
      case 'tinypng':
        return await this.compressWithTinyPNG(imageBuffer)
      case 'kraken':
        return await this.compressWithKraken(imageBuffer, options)
      default:
        throw new Error(`Service ${service} not implemented`)
    }
  }
  
  // 批量压缩
  async compressBatch(images, options = {}) {
    const results = []
    const concurrency = options.concurrency || 3
    
    for (let i = 0; i < images.length; i += concurrency) {
      const batch = images.slice(i, i + concurrency)
      
      const batchPromises = batch.map(async (image) => {
        try {
          const result = await this.compress(image.buffer, image.format, options)
          return {
            ...image,
            ...result,
            success: true
          }
        } catch (error) {
          return {
            ...image,
            error: error.message,
            success: false
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
      
      // 避免 API 限制
      if (i + concurrency < images.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return results
  }
}

// 使用示例
const onlineOptimizer = new OnlineImageOptimizer()

// 单个图片压缩
const fs = require('fs').promises

async function compressImage() {
  try {
    const imageBuffer = await fs.readFile('input.jpg')
    const result = await onlineOptimizer.compress(imageBuffer, 'jpg')
    
    await fs.writeFile('output.jpg', result.buffer)
    
    console.log(`Compressed: ${result.originalSize} -> ${result.compressedSize} bytes`)
    console.log(`Savings: ${(result.ratio * 100).toFixed(2)}%`)
  } catch (error) {
    console.error('Compression failed:', error)
  }
}

// 批量压缩
async function compressBatch() {
  const images = [
    { name: 'image1.jpg', buffer: await fs.readFile('image1.jpg'), format: 'jpg' },
    { name: 'image2.png', buffer: await fs.readFile('image2.png'), format: 'png' }
  ]
  
  const results = await onlineOptimizer.compressBatch(images, {
    quality: 85,
    concurrency: 2
  })
  
  for (const result of results) {
    if (result.success) {
      await fs.writeFile(`compressed_${result.name}`, result.buffer)
      console.log(`${result.name}: ${result.originalSize} -> ${result.compressedSize} bytes`)
    } else {
      console.error(`${result.name}: ${result.error}`)
    }
  }
}
```

## 懒加载实现
### 原生懒加载

```html
<!-- 原生懒加载支持 -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>图片懒加载示例</title>
  <style>
    .image-container {
      margin: 20px 0;
      min-height: 200px;
      background: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lazy-image {
      max-width: 100%;
      height: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .lazy-image.loaded {
      opacity: 1;
    }
    
    .loading-placeholder {
      width: 100%;
      height: 200px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  </style>
</head>
<body>
  <!-- 1. 原生 loading="lazy" -->
  <div class="image-container">
    <img src="image1.jpg" alt="Native Lazy Loading" loading="lazy">
  </div>
  
  <!-- 2. 带占位符的懒加载 -->
  <div class="image-container">
    <img 
      class="lazy-image"
      data-src="image2.jpg"
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ELoading...%3C/text%3E%3C/svg%3E"
      alt="Placeholder Lazy Loading">
  </div>
  
  <!-- 3. 渐进式 JPEG -->
  <div class="image-container">
    <img 
      class="lazy-image"
      data-src="progressive-image.jpg"
      src="low-quality-placeholder.jpg"
      alt="Progressive Loading">
  </div>
  
  <!-- 4. 响应式懒加载 -->
  <div class="image-container">
    <picture>
      <source 
        data-srcset="image-large.webp" 
        media="(min-width: 768px)" 
        type="image/webp">
      <source 
        data-srcset="image-small.webp" 
        type="image/webp">
      <img 
        class="lazy-image"
        data-src="image-small.jpg"
        data-srcset="image-small.jpg 480w, image-large.jpg 768w"
        sizes="(min-width: 768px) 768px, 480px"
        src="placeholder.jpg"
        alt="Responsive Lazy Loading">
    </picture>
  </div>
</body>
</html>
```

```javascript
// 高级懒加载实现
class AdvancedLazyLoader {
  constructor(options = {}) {
    this.options = {
      root: options.root || null,
      rootMargin: options.rootMargin || '50px 0px',
      threshold: options.threshold || 0.01,
      enableNativeLazy: options.enableNativeLazy !== false,
      fadeInDuration: options.fadeInDuration || 300,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      ...options
    }
    
    this.observer = null
    this.loadedImages = new Set()
    this.failedImages = new Set()
    this.retryCount = new Map()
    
    this.init()
  }
  
  init() {
    // 检查原生懒加载支持
    if (this.options.enableNativeLazy && 'loading' in HTMLImageElement.prototype) {
      this.setupNativeLazyLoading()
    } else {
      this.setupIntersectionObserver()
    }
  }
  
  setupNativeLazyLoading() {
    // 为支持原生懒加载的浏览器设置
    const images = document.querySelectorAll('img[data-src]')
    
    images.forEach(img => {
      img.loading = 'lazy'
      img.src = img.dataset.src
      img.removeAttribute('data-src')
      
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset
        img.removeAttribute('data-srcset')
      }
    })
  }
  
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // 降级到立即加载
      this.loadAllImages()
      return
    }
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target)
        }
      })
    }, {
      root: this.options.root,
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold
    })
    
    this.observeImages()
  }
  
  observeImages() {
    const images = document.querySelectorAll('img[data-src], picture source[data-srcset]')
    
    images.forEach(element => {
      if (element.tagName === 'IMG') {
        this.observer.observe(element)
      } else {
        // 对于 picture 元素，观察 img 元素
        const img = element.closest('picture').querySelector('img')
        if (img && !this.observer.root || !this.observer.root.contains(img)) {
          this.observer.observe(img)
        }
      }
    })
  }
  
  async loadImage(img) {
    if (this.loadedImages.has(img) || this.failedImages.has(img)) {
      return
    }
    
    try {
      // 显示加载状态
      this.showLoadingState(img)
      
      // 预加载图片
      await this.preloadImage(img)
      
      // 更新图片源
      this.updateImageSources(img)
      
      // 标记为已加载
      this.loadedImages.add(img)
      
      // 显示图片
      this.showImage(img)
      
      // 停止观察
      if (this.observer) {
        this.observer.unobserve(img)
      }
      
      // 触发加载完成事件
      this.dispatchLoadEvent(img, 'loaded')
      
    } catch (error) {
      await this.handleLoadError(img, error)
    }
  }
  
  preloadImage(img) {
    return new Promise((resolve, reject) => {
      const preloader = new Image()
      
      preloader.onload = () => resolve(preloader)
      preloader.onerror = () => reject(new Error('Image load failed'))
      
      // 设置源
      if (img.dataset.srcset) {
        preloader.srcset = img.dataset.srcset
      }
      preloader.src = img.dataset.src
    })
  }
  
  updateImageSources(img) {
    // 更新 picture 元素中的 source
    const picture = img.closest('picture')
    if (picture) {
      const sources = picture.querySelectorAll('source[data-srcset]')
      sources.forEach(source => {
        source.srcset = source.dataset.srcset
        source.removeAttribute('data-srcset')
      })
    }
    
    // 更新 img 元素
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset
      img.removeAttribute('data-srcset')
    }
    
    img.src = img.dataset.src
    img.removeAttribute('data-src')
  }
  
  showLoadingState(img) {
    img.classList.add('loading')
    
    // 添加加载动画
    if (!img.style.backgroundImage) {
      img.style.backgroundImage = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)'
      img.style.backgroundSize = '200% 100%'
      img.style.animation = 'loading 1.5s infinite'
    }
  }
  
  showImage(img) {
    img.classList.remove('loading')
    img.classList.add('loaded')
    
    // 清除加载动画
    img.style.backgroundImage = ''
    img.style.backgroundSize = ''
    img.style.animation = ''
    
    // 淡入效果
    if (this.options.fadeInDuration > 0) {
      img.style.opacity = '0'
      img.style.transition = `opacity ${this.options.fadeInDuration}ms ease`
      
      requestAnimationFrame(() => {
        img.style.opacity = '1'
      })
    }
  }
  
  async handleLoadError(img, error) {
    const retryCount = this.retryCount.get(img) || 0
    
    if (retryCount < this.options.retryAttempts) {
      // 重试加载
      this.retryCount.set(img, retryCount + 1)
      
      console.warn(`Image load failed, retrying (${retryCount + 1}/${this.options.retryAttempts}):`, img.dataset.src)
      
      await new Promise(resolve => 
        setTimeout(resolve, this.options.retryDelay * (retryCount + 1))
      )
      
      return this.loadImage(img)
    } else {
      // 标记为失败
      this.failedImages.add(img)
      img.classList.add('load-error')
      
      // 显示错误占位符
      this.showErrorPlaceholder(img)
      
      // 触发错误事件
      this.dispatchLoadEvent(img, 'error', error)
      
      console.error('Image load failed after retries:', img.dataset.src, error)
    }
  }
  
  showErrorPlaceholder(img) {
    const errorSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage not available%3C/text%3E%3C/svg%3E`
    
    img.src = errorSvg
    img.alt = 'Image not available'
  }
  
  dispatchLoadEvent(img, type, error = null) {
    const event = new CustomEvent(`lazyload:${type}`, {
      detail: {
        img,
        src: img.dataset.src || img.src,
        error
      }
    })
    
    img.dispatchEvent(event)
  }
  
  loadAllImages() {
    // 降级方案：立即加载所有图片
    const images = document.querySelectorAll('img[data-src]')
    
    images.forEach(img => {
      this.updateImageSources(img)
      this.loadedImages.add(img)
    })
  }
  
  // 手动触发加载
  loadImageManually(img) {
    if (this.observer) {
      this.observer.unobserve(img)
    }
    
    this.loadImage(img)
  }
  
  // 重新观察新添加的图片
  refresh() {
    if (this.observer) {
      this.observeImages()
    }
  }
  
  // 销毁
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
    
    this.loadedImages.clear()
    this.failedImages.clear()
    this.retryCount.clear()
  }
  
  // 获取统计信息
  getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
      pending: document.querySelectorAll('img[data-src]').length
    }
  }
}

// 使用示例
const lazyLoader = new AdvancedLazyLoader({
  rootMargin: '100px 0px',
  threshold: 0.1,
  fadeInDuration: 500,
  retryAttempts: 3
})

// 监听加载事件
document.addEventListener('lazyload:loaded', (event) => {
  console.log('Image loaded:', event.detail.src)
})

document.addEventListener('lazyload:error', (event) => {
  console.error('Image load error:', event.detail.src, event.detail.error)
})

// 动态添加图片后刷新
function addNewImage() {
  const img = document.createElement('img')
  img.dataset.src = 'new-image.jpg'
  img.alt = 'New Image'
  document.body.appendChild(img)
  
  lazyLoader.refresh()
}
```

## CDN 和缓存优化
### CDN 配置策略

```javascript
// CDN 图片优化管理器
class CDNImageOptimizer {
  constructor(options = {}) {
    this.options = {
      cdnDomain: options.cdnDomain || 'https://cdn.example.com',
      enableAutoFormat: options.enableAutoFormat !== false,
      enableAutoQuality: options.enableAutoQuality !== false,
      defaultQuality: options.defaultQuality || 80,
      enableWebP: options.enableWebP !== false,
      enableAVIF: options.enableAVIF !== false,
      cacheTTL: options.cacheTTL || 31536000, // 1年
      ...options
    }
    
    this.formatSupport = this.detectFormatSupport()
  }
  
  detectFormatSupport() {
    const support = {
      webp: false,
      avif: false
    }
    
    // WebP 检测
    const webpCanvas = document.createElement('canvas')
    webpCanvas.width = 1
    webpCanvas.height = 1
    support.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    
    // AVIF 检测（简化版）
    support.avif = CSS.supports('image', 'url(data:image/avif;base64,)')
    
    return support
  }
  
  // 生成优化的图片 URL
  generateOptimizedUrl(imagePath, options = {}) {
    const {
      width,
      height,
      quality = this.options.defaultQuality,
      format = 'auto',
      fit = 'cover',
      dpr = window.devicePixelRatio || 1
    } = options
    
    const params = new URLSearchParams()
    
    // 尺寸参数
    if (width) {
      params.set('w', Math.round(width * dpr))
    }
    
    if (height) {
      params.set('h', Math.round(height * dpr))
    }
    
    // 质量参数
    if (this.options.enableAutoQuality) {
      params.set('q', this.calculateOptimalQuality(quality, dpr))
    } else {
      params.set('q', quality)
    }
    
    // 格式参数
    if (format === 'auto') {
      if (this.options.enableAVIF && this.formatSupport.avif) {
        params.set('f', 'avif')
      } else if (this.options.enableWebP && this.formatSupport.webp) {
        params.set('f', 'webp')
      }
    } else if (format !== 'original') {
      params.set('f', format)
    }
    
    // 裁剪模式
    params.set('fit', fit)
    
    // 缓存控制
    params.set('cache', this.options.cacheTTL)
    
    return `${this.options.cdnDomain}/${imagePath}?${params.toString()}`
  }
  
  calculateOptimalQuality(baseQuality, dpr) {
    // 根据设备像素比调整质量
    if (dpr >= 3) {
      return Math.max(60, baseQuality - 20)
    } else if (dpr >= 2) {
      return Math.max(70, baseQuality - 10)
    }
    return baseQuality
  }
  
  // 生成响应式图片集
  generateResponsiveSet(imagePath, breakpoints = [480, 768, 1024, 1200]) {
    const srcset = []
    
    breakpoints.forEach(width => {
      const url = this.generateOptimizedUrl(imagePath, { width })
      srcset.push(`${url} ${width}w`)
    })
    
    return srcset.join(', ')
  }
  
  // 预加载关键图片
  preloadCriticalImages(images) {
    images.forEach(({ path, options = {} }) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = this.generateOptimizedUrl(path, options)
      document.head.appendChild(link)
    })
  }
}

// 使用示例
const cdnOptimizer = new CDNImageOptimizer({
  cdnDomain: 'https://images.example.com',
  enableAutoFormat: true,
  enableAutoQuality: true,
  defaultQuality: 85
})

// 生成优化的图片 URL
const optimizedUrl = cdnOptimizer.generateOptimizedUrl('hero-image.jpg', {
  width: 1200,
  height: 600,
  quality: 80,
  format: 'auto'
})

// 生成响应式图片集
const responsiveSrcset = cdnOptimizer.generateResponsiveSet('hero-image.jpg')

// 预加载关键图片
cdnOptimizer.preloadCriticalImages([
  { path: 'hero-image.jpg', options: { width: 1200 } },
  { path: 'logo.png', options: { width: 200 } }
])
```

### 缓存策略配置

```nginx
# Nginx 图片缓存配置
server {
    listen 80;
    server_name images.example.com;
    
    # 图片缓存目录
    location ~* \.(jpg|jpeg|png|gif|webp|avif|svg)$ {
        # 设置缓存时间
        expires 1y;
        add_header Cache-Control "public, immutable";
        
        # 启用 gzip 压缩
        gzip on;
        gzip_vary on;
        gzip_types
            image/svg+xml;
        
        # 设置 ETag
        etag on;
        
        # 跨域设置
        add_header Access-Control-Allow-Origin *;
        
        # 安全头
        add_header X-Content-Type-Options nosniff;
        
        # 图片优化处理
        location ~ ^/(.+)\.(jpg|jpeg|png|gif)$ {
            set $image_path $1;
            set $image_ext $2;
            
            # WebP 支持
            if ($http_accept ~* "webp") {
                set $webp_suffix ".webp";
            }
            
            # 尝试 WebP 版本
            try_files /${image_path}${webp_suffix} /${image_path}.${image_ext} =404;
        }
    }
    
    # 图片处理 API
    location /api/image/ {
        proxy_pass http://image-processing-service;
        proxy_cache image_cache;
        proxy_cache_valid 200 1y;
        proxy_cache_key "$scheme$request_method$host$request_uri";
        
        # 缓存头
        add_header X-Cache-Status $upstream_cache_status;
    }
}

# 缓存配置
proxy_cache_path /var/cache/nginx/images
    levels=1:2
    keys_zone=image_cache:100m
    max_size=10g
    inactive=1y
    use_temp_path=off;
```

```javascript
// Service Worker 图片缓存
class ImageCacheManager {
  constructor() {
    this.cacheName = 'image-cache-v1'
    this.maxCacheSize = 100 * 1024 * 1024 // 100MB
    this.maxCacheAge = 30 * 24 * 60 * 60 * 1000 // 30天
  }
  
  async install() {
    // 预缓存关键图片
    const criticalImages = [
      '/images/logo.svg',
      '/images/hero-small.webp',
      '/images/placeholder.svg'
    ]
    
    const cache = await caches.open(this.cacheName)
    await cache.addAll(criticalImages)
  }
  
  async handleImageRequest(request) {
    const cache = await caches.open(this.cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      // 检查缓存是否过期
      const cacheDate = new Date(cachedResponse.headers.get('date'))
      const now = new Date()
      
      if (now - cacheDate < this.maxCacheAge) {
        return cachedResponse
      }
    }
    
    try {
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        // 缓存新响应
        await this.cacheResponse(cache, request, networkResponse.clone())
      }
      
      return networkResponse
    } catch (error) {
      // 网络失败时返回缓存版本
      if (cachedResponse) {
        return cachedResponse
      }
      
      // 返回占位符图片
      return this.getPlaceholderResponse()
    }
  }
  
  async cacheResponse(cache, request, response) {
    // 检查缓存大小
    await this.manageCacheSize(cache)
    
    // 只缓存成功的图片响应
    if (response.status === 200 && this.isImageRequest(request)) {
      await cache.put(request, response)
    }
  }
  
  async manageCacheSize(cache) {
    const keys = await cache.keys()
    let totalSize = 0
    
    // 计算当前缓存大小
    for (const key of keys) {
      const response = await cache.match(key)
      if (response) {
        const size = parseInt(response.headers.get('content-length') || '0')
        totalSize += size
      }
    }
    
    // 如果超过限制，删除最旧的缓存
    if (totalSize > this.maxCacheSize) {
      const sortedKeys = keys.sort((a, b) => {
        // 按 URL 排序（简化的 LRU 实现）
        return a.url.localeCompare(b.url)
      })
      
      // 删除前 20% 的缓存
      const deleteCount = Math.floor(sortedKeys.length * 0.2)
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(sortedKeys[i])
      }
    }
  }
  
  isImageRequest(request) {
    return /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(request.url)
  }
  
  getPlaceholderResponse() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">
        Image unavailable
      </text>
    </svg>`
    
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache'
      }
    })
  }
}

// Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
}

// sw.js
const imageCacheManager = new ImageCacheManager()

self.addEventListener('install', (event) => {
  event.waitUntil(imageCacheManager.install())
})

self.addEventListener('fetch', (event) => {
  if (imageCacheManager.isImageRequest(event.request)) {
    event.respondWith(imageCacheManager.handleImageRequest(event.request))
  }
})
```

## 性能监控与分析
### 图片性能指标

```javascript
// 图片性能监控器
class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalSize: 0,
      loadTimes: [],
      formatDistribution: {},
      sizeDistribution: {},
      errors: []
    }
    
    this.observer = null
    this.startTime = performance.now()
    
    this.init()
  }
  
  init() {
    this.setupPerformanceObserver()
    this.monitorExistingImages()
    this.setupMutationObserver()
  }
  
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.initiatorType === 'img') {
            this.recordImageLoad(entry)
          }
        })
      })
      
      this.observer.observe({ entryTypes: ['resource'] })
    }
  }
  
  monitorExistingImages() {
    const images = document.querySelectorAll('img')
    
    images.forEach(img => {
      this.metrics.totalImages++
      
      if (img.complete) {
        if (img.naturalWidth > 0) {
          this.metrics.loadedImages++
          this.analyzeImage(img)
        } else {
          this.metrics.failedImages++
        }
      } else {
        this.attachImageListeners(img)
      }
    })
  }
  
  setupMutationObserver() {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const images = node.tagName === 'IMG' 
              ? [node] 
              : node.querySelectorAll('img')
            
            images.forEach(img => {
              this.metrics.totalImages++
              this.attachImageListeners(img)
            })
          }
        })
      })
    })
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    })
  }
  
  attachImageListeners(img) {
    const startTime = performance.now()
    
    img.addEventListener('load', () => {
      const loadTime = performance.now() - startTime
      this.metrics.loadedImages++
      this.metrics.loadTimes.push(loadTime)
      this.analyzeImage(img)
    }, { once: true })
    
    img.addEventListener('error', (event) => {
      this.metrics.failedImages++
      this.metrics.errors.push({
        src: img.src,
        error: 'Load failed',
        timestamp: Date.now()
      })
    }, { once: true })
  }
  
  recordImageLoad(entry) {
    const loadTime = entry.responseEnd - entry.startTime
    this.metrics.loadTimes.push(loadTime)
    this.metrics.totalSize += entry.transferSize || 0
  }
  
  analyzeImage(img) {
    // 分析图片格式
    const format = this.getImageFormat(img.src)
    this.metrics.formatDistribution[format] = 
      (this.metrics.formatDistribution[format] || 0) + 1
    
    // 分析图片尺寸
    const sizeCategory = this.getSizeCategory(img.naturalWidth, img.naturalHeight)
    this.metrics.sizeDistribution[sizeCategory] = 
      (this.metrics.sizeDistribution[sizeCategory] || 0) + 1
  }
  
  getImageFormat(src) {
    const url = new URL(src, window.location.href)
    const pathname = url.pathname.toLowerCase()
    
    if (pathname.includes('.webp')) return 'webp'
    if (pathname.includes('.avif')) return 'avif'
    if (pathname.includes('.jpg') || pathname.includes('.jpeg')) return 'jpeg'
    if (pathname.includes('.png')) return 'png'
    if (pathname.includes('.gif')) return 'gif'
    if (pathname.includes('.svg')) return 'svg'
    
    return 'unknown'
  }
  
  getSizeCategory(width, height) {
    const pixels = width * height
    
    if (pixels < 50000) return 'small' // < 50K pixels
    if (pixels < 500000) return 'medium' // < 500K pixels
    if (pixels < 2000000) return 'large' // < 2M pixels
    return 'xlarge' // >= 2M pixels
  }
  
  // 获取性能报告
  getPerformanceReport() {
    const now = performance.now()
    const totalTime = now - this.startTime
    
    const report = {
      summary: {
        totalImages: this.metrics.totalImages,
        loadedImages: this.metrics.loadedImages,
        failedImages: this.metrics.failedImages,
        successRate: this.metrics.totalImages > 0 
          ? (this.metrics.loadedImages / this.metrics.totalImages * 100).toFixed(2) + '%'
          : '0%',
        totalSize: this.formatBytes(this.metrics.totalSize),
        averageSize: this.metrics.loadedImages > 0
          ? this.formatBytes(this.metrics.totalSize / this.metrics.loadedImages)
          : '0 B'
      },
      
      timing: {
        totalTime: totalTime.toFixed(2) + 'ms',
        averageLoadTime: this.metrics.loadTimes.length > 0
          ? (this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length).toFixed(2) + 'ms'
          : '0ms',
        slowestLoad: this.metrics.loadTimes.length > 0
          ? Math.max(...this.metrics.loadTimes).toFixed(2) + 'ms'
          : '0ms',
        fastestLoad: this.metrics.loadTimes.length > 0
          ? Math.min(...this.metrics.loadTimes).toFixed(2) + 'ms'
          : '0ms'
      },
      
      distribution: {
        formats: this.metrics.formatDistribution,
        sizes: this.metrics.sizeDistribution
      },
      
      errors: this.metrics.errors,
      
      recommendations: this.generateRecommendations()
    }
    
    return report
  }
  
  generateRecommendations() {
    const recommendations = []
    
    // 检查现代格式使用率
    const modernFormats = ['webp', 'avif']
    const modernCount = modernFormats.reduce((count, format) => 
      count + (this.metrics.formatDistribution[format] || 0), 0
    )
    const modernRatio = this.metrics.loadedImages > 0 
      ? modernCount / this.metrics.loadedImages 
      : 0
    
    if (modernRatio < 0.5) {
      recommendations.push({
        type: 'format',
        priority: 'high',
        message: `只有 ${(modernRatio * 100).toFixed(1)}% 的图片使用现代格式（WebP/AVIF），建议增加现代格式的使用`
      })
    }
    
    // 检查大图片比例
    const largeImages = (this.metrics.sizeDistribution.large || 0) + 
                       (this.metrics.sizeDistribution.xlarge || 0)
    const largeRatio = this.metrics.loadedImages > 0 
      ? largeImages / this.metrics.loadedImages 
      : 0
    
    if (largeRatio > 0.3) {
      recommendations.push({
        type: 'size',
        priority: 'medium',
        message: `${(largeRatio * 100).toFixed(1)}% 的图片尺寸较大，建议使用响应式图片和适当的压缩`
      })
    }
    
    // 检查加载时间
    const averageLoadTime = this.metrics.loadTimes.length > 0
      ? this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length
      : 0
    
    if (averageLoadTime > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `平均图片加载时间为 ${averageLoadTime.toFixed(0)}ms，建议优化图片大小和使用 CDN`
      })
    }
    
    // 检查失败率
    const failureRate = this.metrics.totalImages > 0 
      ? this.metrics.failedImages / this.metrics.totalImages 
      : 0
    
    if (failureRate > 0.05) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `图片加载失败率为 ${(failureRate * 100).toFixed(1)}%，建议检查图片 URL 和网络连接`
      })
    }
    
    return recommendations
  }
  
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // 导出报告
  exportReport(format = 'json') {
    const report = this.getPerformanceReport()
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2)
    } else if (format === 'csv') {
      return this.convertToCSV(report)
    }
    
    return report
  }
  
  convertToCSV(report) {
    const rows = [
      ['Metric', 'Value'],
      ['Total Images', report.summary.totalImages],
      ['Loaded Images', report.summary.loadedImages],
      ['Failed Images', report.summary.failedImages],
      ['Success Rate', report.summary.successRate],
      ['Total Size', report.summary.totalSize],
      ['Average Size', report.summary.averageSize],
      ['Average Load Time', report.timing.averageLoadTime],
      ['Slowest Load', report.timing.slowestLoad],
      ['Fastest Load', report.timing.fastestLoad]
    ]
    
    return rows.map(row => row.join(',')).join('\n')
  }
  
  // 重置统计
  reset() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalSize: 0,
      loadTimes: [],
      formatDistribution: {},
      sizeDistribution: {},
      errors: []
    }
    
    this.startTime = performance.now()
  }
  
  // 销毁监控器
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}

// 使用示例
const imageMonitor = new ImagePerformanceMonitor()

// 定期生成报告
setInterval(() => {
  const report = imageMonitor.getPerformanceReport()
  console.log('Image Performance Report:', report)
  
  // 发送到分析服务
  if (report.recommendations.length > 0) {
    console.warn('Performance Recommendations:', report.recommendations)
  }
}, 30000) // 每30秒

// 页面卸载时导出最终报告
window.addEventListener('beforeunload', () => {
  const finalReport = imageMonitor.exportReport('json')
  
  // 发送到分析服务
  navigator.sendBeacon('/api/image-performance', finalReport)
})
```

## 最佳实践
### 图片优化清单

```markdown
## 图片优化最佳实践清单

### 📋 格式选择
- [ ] 照片使用 JPEG 格式
- [ ] 图标和简单图形使用 SVG
- [ ] 需要透明度的图片使用 PNG
- [ ] 支持现代浏览器时优先使用 WebP/AVIF
- [ ] 使用 `<picture>` 元素提供多格式支持

### 🗜️ 压缩优化
- [ ] JPEG 质量设置在 75-85 之间
- [ ] PNG 使用工具进行无损压缩
- [ ] SVG 移除不必要的元数据和注释
- [ ] 启用渐进式 JPEG
- [ ] 使用自动化工具进行批量优化

### 📱 响应式适配
- [ ] 提供多种尺寸的图片
- [ ] 使用 `srcset` 和 `sizes` 属性
- [ ] 考虑设备像素比（DPR）
- [ ] 实现艺术方向响应式
- [ ] 移动端优先的图片策略

### ⚡ 加载优化
- [ ] 关键图片使用 `preload`
- [ ] 非关键图片使用懒加载
- [ ] 设置合适的 `loading` 属性
- [ ] 提供有意义的 `alt` 文本
- [ ] 使用占位符避免布局偏移

### 🌐 CDN 和缓存
- [ ] 使用 CDN 分发图片
- [ ] 设置合适的缓存头
- [ ] 启用 HTTP/2 推送
- [ ] 实现智能缓存策略
- [ ] 监控 CDN 性能

### 📊 性能监控
- [ ] 监控图片加载时间
- [ ] 跟踪图片大小分布
- [ ] 分析格式使用情况
- [ ] 监控加载失败率
- [ ] 定期性能审计
```

### 错误处理策略

```javascript
// 图片错误处理和降级策略
class ImageErrorHandler {
  constructor() {
    this.fallbackStrategies = [
      'retry',
      'fallback-format',
      'fallback-size',
      'placeholder'
    ]
    
    this.retryAttempts = 3
    this.retryDelay = 1000
    
    this.init()
  }
  
  init() {
    // 全局图片错误处理
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        this.handleImageError(event.target)
      }
    }, true)
  }
  
  async handleImageError(img) {
    const originalSrc = img.src
    const retryCount = parseInt(img.dataset.retryCount || '0')
    
    console.warn(`Image load failed: ${originalSrc}`, {
      retryCount,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight
    })
    
    // 尝试不同的降级策略
    for (const strategy of this.fallbackStrategies) {
      try {
        const success = await this.applyStrategy(img, strategy, retryCount)
        if (success) {
          break
        }
      } catch (error) {
        console.error(`Strategy ${strategy} failed:`, error)
      }
    }
  }
  
  async applyStrategy(img, strategy, retryCount) {
    switch (strategy) {
      case 'retry':
        return await this.retryLoad(img, retryCount)
      
      case 'fallback-format':
        return await this.tryFallbackFormat(img)
      
      case 'fallback-size':
        return await this.tryFallbackSize(img)
      
      case 'placeholder':
        return this.showPlaceholder(img)
      
      default:
        return false
    }
  }
  
  async retryLoad(img, retryCount) {
    if (retryCount >= this.retryAttempts) {
      return false
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const newImg = new Image()
        
        newImg.onload = () => {
          img.src = newImg.src
          img.removeAttribute('data-retry-count')
          resolve(true)
        }
        
        newImg.onerror = () => {
          img.dataset.retryCount = (retryCount + 1).toString()
          resolve(false)
        }
        
        // 添加缓存破坏参数
        const url = new URL(img.src)
        url.searchParams.set('retry', retryCount + 1)
        newImg.src = url.toString()
      }, this.retryDelay * (retryCount + 1))
    })
  }
  
  async tryFallbackFormat(img) {
    const originalSrc = img.src
    const fallbackFormats = ['jpg', 'png', 'gif']
    
    for (const format of fallbackFormats) {
      const fallbackSrc = originalSrc.replace(/\.[^.]+$/, `.${format}`)
      
      if (fallbackSrc !== originalSrc) {
        const success = await this.testImageLoad(fallbackSrc)
        if (success) {
          img.src = fallbackSrc
          return true
        }
      }
    }
    
    return false
  }
  
  async tryFallbackSize(img) {
    const originalSrc = img.src
    const sizeSuffixes = ['-medium', '-small', '']
    
    for (const suffix of sizeSuffixes) {
      const fallbackSrc = originalSrc.replace(
        /(-large|-xl|-xxl)?(\.\w+)$/,
        `${suffix}$2`
      )
      
      if (fallbackSrc !== originalSrc) {
        const success = await this.testImageLoad(fallbackSrc)
        if (success) {
          img.src = fallbackSrc
          return true
        }
      }
    }
    
    return false
  }
  
  testImageLoad(src) {
    return new Promise((resolve) => {
      const testImg = new Image()
      testImg.onload = () => resolve(true)
      testImg.onerror = () => resolve(false)
      testImg.src = src
    })
  }
  
  showPlaceholder(img) {
    const width = img.getAttribute('width') || 400
    const height = img.getAttribute('height') || 300
    
    const placeholderSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial, sans-serif'%3EImage not available%3C/text%3E%3C/svg%3E`
    
    img.src = placeholderSvg
    img.alt = 'Image not available'
    img.classList.add('image-error')
    
    return true
  }
}

// 初始化错误处理
const imageErrorHandler = new ImageErrorHandler()
```

## 故障排除
### 常见问题解决

```javascript
// 图片问题诊断工具
class ImageDiagnostics {
  constructor() {
    this.issues = []
  }
  
  // 运行完整诊断
  async runDiagnostics() {
    console.log('🔍 开始图片诊断...')
    
    await this.checkImageFormats()
    await this.checkImageSizes()
    await this.checkLoadingPerformance()
    await this.checkAccessibility()
    await this.checkSEO()
    
    return this.generateReport()
  }
  
  async checkImageFormats() {
    const images = document.querySelectorAll('img')
    const formatCounts = {}
    
    images.forEach(img => {
      const format = this.getImageFormat(img.src)
      formatCounts[format] = (formatCounts[format] || 0) + 1
      
      // 检查是否使用了现代格式
      if (!['webp', 'avif'].includes(format) && !img.closest('picture')) {
        this.addIssue({
          type: 'format',
          severity: 'medium',
          element: img,
          message: `图片 ${img.src} 未使用现代格式，建议提供 WebP/AVIF 版本`
        })
      }
    })
    
    console.log('📊 图片格式分布:', formatCounts)
  }
  
  async checkImageSizes() {
    const images = document.querySelectorAll('img')
    
    for (const img of images) {
      if (img.complete && img.naturalWidth > 0) {
        const displayWidth = img.offsetWidth
        const displayHeight = img.offsetHeight
        const naturalWidth = img.naturalWidth
        const naturalHeight = img.naturalHeight
        
        // 检查是否过度缩放
        const scaleRatio = naturalWidth / displayWidth
        
        if (scaleRatio > 2) {
          this.addIssue({
            type: 'size',
            severity: 'high',
            element: img,
            message: `图片 ${img.src} 尺寸过大，实际尺寸 ${naturalWidth}x${naturalHeight}，显示尺寸 ${displayWidth}x${displayHeight}，缩放比例 ${scaleRatio.toFixed(1)}x`
          })
        }
        
        // 检查是否缺少响应式属性
        if (!img.srcset && !img.closest('picture') && displayWidth > 300) {
          this.addIssue({
            type: 'responsive',
            severity: 'medium',
            element: img,
            message: `图片 ${img.src} 缺少响应式属性（srcset），建议添加多尺寸支持`
          })
        }
      }
    }
  }
  
  async checkLoadingPerformance() {
    const images = document.querySelectorAll('img')
    
    images.forEach(img => {
      // 检查懒加载设置
      const isAboveFold = img.getBoundingClientRect().top < window.innerHeight
      
      if (isAboveFold && img.loading === 'lazy') {
        this.addIssue({
          type: 'loading',
          severity: 'medium',
          element: img,
          message: `首屏图片 ${img.src} 使用了懒加载，可能影响 LCP`
        })
      }
      
      if (!isAboveFold && img.loading !== 'lazy') {
        this.addIssue({
          type: 'loading',
          severity: 'low',
          element: img,
          message: `非首屏图片 ${img.src} 未使用懒加载，建议添加 loading="lazy"`
        })
      }
      
      // 检查预加载
      const isLCP = img.classList.contains('lcp-image') || 
                    img.dataset.priority === 'high'
      
      if (isLCP && !document.querySelector(`link[rel="preload"][href*="${img.src.split('/').pop()}"]`)) {
        this.addIssue({
          type: 'preload',
          severity: 'high',
          element: img,
          message: `关键图片 ${img.src} 未设置预加载，建议添加 <link rel="preload">`
        })
      }
    })
  }
  
  async checkAccessibility() {
    const images = document.querySelectorAll('img')
    
    images.forEach(img => {
      // 检查 alt 属性
      if (!img.alt && !img.getAttribute('aria-hidden')) {
        this.addIssue({
          type: 'accessibility',
          severity: 'high',
          element: img,
          message: `图片 ${img.src} 缺少 alt 属性，影响可访问性`
        })
      }
      
      // 检查装饰性图片
      if (img.alt === '' && !img.getAttribute('role')) {
        this.addIssue({
          type: 'accessibility',
          severity: 'low',
          element: img,
          message: `装饰性图片 ${img.src} 建议添加 role="presentation"`
        })
      }
    })
  }
  
  async checkSEO() {
    const images = document.querySelectorAll('img')
    
    images.forEach(img => {
      // 检查文件名
      const filename = img.src.split('/').pop().split('?')[0]
      
      if (/^(img|image|photo)\d+\.(jpg|png|gif)$/i.test(filename)) {
        this.addIssue({
          type: 'seo',
          severity: 'low',
          element: img,
          message: `图片 ${img.src} 文件名不够描述性，建议使用有意义的文件名`
        })
      }
      
      // 检查 title 属性
      if (img.alt && !img.title && img.alt.length > 50) {
        this.addIssue({
          type: 'seo',
          severity: 'low',
          element: img,
          message: `图片 ${img.src} 可以考虑添加 title 属性提供更多信息`
        })
      }
    })
  }
  
  addIssue(issue) {
    this.issues.push({
      ...issue,
      timestamp: Date.now()
    })
  }
  
  getImageFormat(src) {
    const url = new URL(src, window.location.href)
    const pathname = url.pathname.toLowerCase()
    
    if (pathname.includes('.webp')) return 'webp'
    if (pathname.includes('.avif')) return 'avif'
    if (pathname.includes('.jpg') || pathname.includes('.jpeg')) return 'jpeg'
    if (pathname.includes('.png')) return 'png'
    if (pathname.includes('.gif')) return 'gif'
    if (pathname.includes('.svg')) return 'svg'
    
    return 'unknown'
  }
  
  generateReport() {
    const severityCounts = {
      high: 0,
      medium: 0,
      low: 0
    }
    
    const typeCounts = {}
    
    this.issues.forEach(issue => {
      severityCounts[issue.severity]++
      typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1
    })
    
    const report = {
      summary: {
        totalIssues: this.issues.length,
        highSeverity: severityCounts.high,
        mediumSeverity: severityCounts.medium,
        lowSeverity: severityCounts.low
      },
      
      byType: typeCounts,
      
      issues: this.issues.map(issue => ({
        type: issue.type,
        severity: issue.severity,
        message: issue.message,
        element: {
          tagName: issue.element.tagName,
          src: issue.element.src,
          alt: issue.element.alt,
          className: issue.element.className
        }
      })),
      
      recommendations: this.generateRecommendations()
    }
    
    console.log('📋 图片诊断报告:', report)
    return report
  }
  
  generateRecommendations() {
    const recommendations = []
    
    if (this.issues.some(issue => issue.type === 'format')) {
      recommendations.push('考虑使用现代图片格式（WebP/AVIF）以减少文件大小')
    }
    
    if (this.issues.some(issue => issue.type === 'size')) {
      recommendations.push('优化图片尺寸，避免在客户端进行大幅缩放')
    }
    
    if (this.issues.some(issue => issue.type === 'responsive')) {
      recommendations.push('实现响应式图片以适配不同设备和屏幕尺寸')
    }
    
    if (this.issues.some(issue => issue.type === 'loading')) {
      recommendations.push('优化图片加载策略，合理使用懒加载和预加载')
    }
    
    if (this.issues.some(issue => issue.type === 'accessibility')) {
      recommendations.push('改善图片可访问性，确保所有图片都有适当的 alt 文本')
    }
    
    return recommendations
  }
}

// 使用示例
const diagnostics = new ImageDiagnostics()

// 运行诊断
diagnostics.runDiagnostics().then(report => {
  if (report.summary.totalIssues > 0) {
    console.warn(`发现 ${report.summary.totalIssues} 个图片相关问题`)
    
    if (report.summary.highSeverity > 0) {
      console.error(`其中 ${report.summary.highSeverity} 个高优先级问题需要立即处理`)
    }
  } else {
    console.log('✅ 未发现图片相关问题')
  }
})
```

## 参考资源

### 📚 学习资源
- [Web.dev - Fast load times](https://web.dev/fast/)
- [MDN - Responsive images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Google Developers - Image optimization](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/image-optimization)

### 🛠️ 工具推荐
- **压缩工具**: TinyPNG, ImageOptim, Squoosh
- **格式转换**: Sharp, ImageMagick, FFMPEG
- **性能分析**: Lighthouse, WebPageTest, GTmetrix
- **自动化**: Webpack plugins, Gulp tasks, GitHub Actions

### 📖 最佳实践指南
- [Core Web Vitals](https://web.dev/vitals/)
- [Image CDN best practices](https://web.dev/image-cdns/)
- [Modern image formats](https://web.dev/serve-images-webp/)
- [Lazy loading best practices](https://web.dev/lazy-loading-best-practices/)