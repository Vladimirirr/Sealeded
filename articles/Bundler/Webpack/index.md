# Webpack

最早也是最成熟的 Web 平台打包器。

它把任何一个文件都看作一个模块，默认地，它只认识 JavaScript 和 JSON 模块，其他模块需要各自的载入器来把这些模块最终转换到 JavaScript，比如 CSS，需要一个叫做 css-loader 的载入器，来把 CSS 代码转成 JavaScript（JavaScript 包装而成的 CSS 字符串）。

最早，Webpack 的配置项巨复杂，因此出现了一个叫做 Parcel 的打包器，它的口号是“零配置打包工具”，且抢占了较多的 Webpack 市场，也因此，Webpack@4 起，内置了很多默认的配置，不再需要繁琐的配置项了。

Webpack@5 引入了模块联邦概念，进一步将公共模块发挥到极致。

目前，有很多工具试图去代替 Webpack，也成功了很多，包括，SWC、ESBuild、Vite、TurboPack，它们的发出点都是让其他更高效的语言（主要是 Golang 和 Rust）代替 JavaScript 语言。或许，Webpack 在将来会消失，但是 Webpack 开创和发扬了 Web 前端的打包概念，它的影响意义深远。

官网：<https://webpack.js.org/>

## 核心概念（设计思想）

### Entry

指定打包的入口，指示 Webpack 让此模块作为【依赖图】构建的开始模块。

### Output

指定结果输出的位置，包括结果文件的路径、名字、格式、等等。

### Mode

Different modes can enable different webpack's built-in optimizations.

不同的打包模式：

1. `development`：开发模式，对输出结果做有意义的命名，同时尽可能地保留原始代码
2. `production`：生产模式，对输出结果做最小化的命名，同时尽可能地压缩原始代码

### Loader

Webpack only understands JavaScript and JSON files, but Loaders can help webpack to understand other types and convert them into JavaScript modules.

非 JavaScript 文件的载入器，从而让 Webpack 知道该如何处理此文件。

#### 种类

按优先级：

- `pre loader`：前置 loader
- `normal loader`：普通 loader
- `inline loader`：内联 loader，写在请求地址里的，从右往左，例如 `style-loader!css-loader?modules!./css/index.css`
- `post loader`：后置 loader

即：[`resource`, `pre loader`, `normal loader`, `inline loader`, `post loader`, `return back to webpack`]

##### 内联 loader

覆盖方式：

1. 前缀 `!`，即 `!loader1!loader2`，表示禁掉已配置的 `normal loader`
2. 前缀 `!!`，即 `!!loader1!loader2`，表示禁掉已配置的全部 loader，包括 `pre loader` `normal loader` `post loader`
3. 前缀 `-!`，即 `-!loader1!loader2`，表示禁掉已配置的 `pre loader` `normal loader`

传递参数：

可以传递查询参数（包括 JSON），比如 `loader?key1&key2=&key3=value3&key4={"aa": 11, "bb": true}`

#### 本质

一个 Loader 本质上是一个函数，接受需要被处理的内容（字符串或 buffer），输出结果（字符串或 buffer）。

```js
// Loader 和它的 pitch 都不能是箭头函数，因为 this 会被 webpack 绑定转换时需要的信息对象

// Loader 的内容处理函数
async function myLoader(content) {
  // do something on the resource content
  const result = content.trim()
  return result
}
myLoader.raw = true // 是否让 webpack 以 raw 的方式读取文件的内容，raw = buffer，默认 false 以文本的方式读取

// Loader 的请求拦截函数（可选）
myLoader.pitch = async function (
  remainingLoaders,
  previousLoaders,
  sharedData
) {
  // sharedData 是一个空对象，可往这个对象里放内容，这个值会最终传给 loader 本体（即 myLoader）
  // 在这里，可修改 resource 的请求地址，例如
  // './aaaa.json5' -> './aaaa.json'
  // './demo.vue?type=script&lang=js' -> 'babel-loader!vue-loader!./demo.vue?type=script&lang=js'
  // 返回 undefined 表示继续
  // 返回 字符串 表示替换当前的 resource request，并直接转到它的下一个 loader 本体
}

// The order of Loaders: [loader1.pitch, loader2.pitch, resource, loader2, loader1]

export default myLoader
```

#### 例子

处理 `.scss` 文件的 loaders 配置：

```js
export default {
  module: {
    rules: [
      {
        // 正则表达式，此处只匹配 sass 和 scss 文件（scss 和 sass 是同一个东西的不同写法）
        test: /(\.sass|\.scss)$/,
        // 指定 loaders
        // style.pitch -> css.pitch -> sass.pitch -> request file and get content -> sass.loader -> css.loader -> style.loader
        use: [
          {
            // 把 CSS 字符串的代码包裹在插入器里，插入器 `document.head.append(theStyleNodeContainingCssCode)`
            loader: 'style-loader', // 或者一个绝对路径（比如 `path.resolve('./myLoaders/style.js')`）
          },
          {
            // css-loader 会处理 CSS 代码里的导入（即 `@import` 和 `@url()`）
            loader: 'css-loader',
          },
          {
            // sass-loader 能读 sass 和 scss 文件并将其转换到合格的 CSS 代码
            loader: 'sass-loader',
            // 一些传给此 Loader 的配置参数
            options: {
              // 选择 sass 的实现（需要在 package.json 里安装），此处选择了 dart-sass compiler，其他的还有 node-sass
              implementation: 'dart-sass',
            },
          },
        ],
      },
    ],
  },
}
```

### Plugin

Plugins can be leveraged to perform a wider range of tasks like bundle optimization, asset management and injection of environment variables.

Loader 只做类型转换（非 JavaScript 转 JavaScript），而 Plugin 的功能更强大，它能拦截 webpack 在打包时各个的生命点，操控着 webpack 的打包过程。

例子：

```js
class MyPlugin {
  constructor(options) {
    this.options = options
  }
  apply(compilation) {
    // compilation 对象是 webpack 暴露的 webpack 打包过程的详细信息
    // 在此对象上可以安装各个时候的生命钩子，和其他操作
  }
}
```

### Chunk

一些名词的概念：

1. module：JavaScript 的模块，即 `import` 语法引入的东西
2. chunk：webpack 打包时对同类型 module 分组的集合，有两种，参考下面
3. bundle：webpack 打包的结果，一个 chunk 对一个 bundle，而 bundle 通常都是含有宿主环境的运行时胶水代码，且可能被转译、压缩和混淆

在 webpack 里，chuck 表示一组模块的集合，有两种（同步 chunk 和非同步 chunk）:

1. `initial`：即从入口模块开始，全部同步引入的模块的集合
2. `non-initial`：懒载入模块，入口模块开始的，任何非同步引入的模块的集合，即 `import()` 引入的

目前有如下产生 chuck 的方式：

1. 入口文件，即 `entry` 配置
2. 懒载入模块，即 `import()` 载入的模块
3. 代码分割：即 `SplitChunksPlugin` 内置插件的配置

对非主 chunk，webpack runtime 会在需要的时候，在浏览器下按 JSONP 的方式动态载入它们。

### Dependency Graph

模块之间的相引关系图，根是入口模块。

### HMR(Hot Module Replacement)

一项替换模块关系图中的任意一个模块，而不会导致再全量打包的过程，只是增量打包。

### Module Federation

与其他 Webpack 项目共享 Chunk 的技术。

## 优化

### Code Splitting

Webpack 的内置插件 SplitChunksPlugin 能让你自定义配置如何进行代码分割，SplitChunksPlugin 插件已经集成到了 Webpack 配置项 `optimization.splitChunks`。

代码分割的主要目的：

1. 大块代码的分割
2. 小块代码的聚合
3. 提取公共代码（降低重复）

代码分割的目标是 chunk，即代码分割的本质是，分割一个 chunk 里的模块们。

默认的 SplitChunksPlugin 配置：

```js
export default {
  optimization: {
    splitChunks: {
      // 只对 async(non-initial) 的 chunk 做代码分割
      chunks: 'async', // 值 'initial'（只对入口 chunk）、'async'、'all'（对全部 chunk）

      // 下面的配置都是针对匹配的 chunk 做检查，从而细化地分割此 chunk 里面的 modules（从而得到一些子 chunks）
      // 一个模块要至少 20000 字节才会尝试被分割
      minSize: 20000,
      // 一个模块至少被多少个 chunks 引入才会尝试被分割
      minChunks: 1,

      // 定义此分组，即【目标chunk】分割出来的【子chunk】都会归类到下面的【分组】里，重组成最终需要的 chunks（此处即两个）
      // 一个模块可能会被多个组匹配，最终根据 priority 决定
      groups: {
        vendors: {
          // 继承自上述的全部配置
          // 下面的配置项是分组特有的
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true, // 如果已存在此 chunk，就不再生成此 chunk，而是直接取已存在的
          name: 'node_modules_chunk', // 指定名字
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
}
```

### Tree Sharking

Tree Sharking = 树摇，摇晃一棵树从而去掉死去的枝叶。

检测死代码的技术，从而消除这些没有意义的代码。

早在 Webpack2 时，已经存在了检测死模块的技术，会报告未被任何东西依赖的模块（即死模块）。随着 ES Module 出现（静态模块机制），Rollup 将 TreeSharking 发扬到极致。接着，Webpack4 升级了它的 Tree Sharking。

## 深入打包结果

[传送门](./output.example.md)
