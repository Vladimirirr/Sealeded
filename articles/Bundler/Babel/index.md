# Babel

Babel 是一个 JavaScript 转译器（把 JavaScript ES5+ 转换到 ES5 或 ES6）。

官网：<https://babel.dev/>

## 配置文件

配置文件 `babel.config.js` 指示着 Babel 如何工作，具体配置信息可参考官网。

## 插件

插件提供了 Babel 转译过程中的功能扩展。

从表现形式上来看，一个插件是一个函数，导出一个 Babel 插件对象。

## 预设

预设是【一组插件】和【配置选项】的可共享集合。

从表现形式上来看，一个预设是一个函数，导出一个 Babel 配置对象。

### @babel/preset-env

转译 ES6+ 语法。此预设包含的内容（即 `@babel/preset-env@7.22/package.json/dependencies`，相似内容将只保留一个）：

- `@babel/compat-data`：compat = compatibility，此预设（即 v7.22）包含的对各个目标平台的兼容性信息（浏览器、node、deno、electron、rhino、等等）
- `@babel/helper-compilation-targets`：得到当前环境的兼容性信息
- `@babel/helper-plugin-utils`：与插件相关的工具方法
- `@babel/helper-validator-option`：验证传入插件的配置选项
- `@babel/plugin-bugfix-safari-id-destructuring-collision-in-function-expression`：目标平台的 bugfix 插件
- `@babel/plugin-syntax-nullish-coalescing-operator`：语法插件，让 babel 知道此语法的含义
- `@babel/plugin-transform-nullish-coalescing-operator`：转换插件，让 babel 知道如何转换此语法从而兼容旧代码，因此转换插件必须包含它相对的语法插件
- `babel-plugin-polyfill-corejs`：ES6+ APIs Polyfill
- `babel-plugin-polyfill-regenerator`：ES6+ Generator Polyfill

基本配置:

```json
{
  "presets": [
    [
      "@babel/preset-env",
      // 给 @babel/preset-env 预设套件的参数
      {
        "useBuiltIns": "usage", // 如何处理载入的 polyfill（目前默认是 corejs），值有 'entry' | 'usage' 和 false
        // entry：参考设置的兼容性，来按需地替换对 corejs 的直接引入
        // usage：参考设置的兼容性和实际的代码情况，来按需地替换对 corejs 的直接引入，真正的按需引入
        // false：不对载入的 corejs 做任何处理，需要自己引入需要的 corejs/xxxx 或直接全量引入 corejs
        "corejs": "3.02", // 指定 corejs@3.02，默认 2.0，要和你已安装的 corejs 匹配
        "targets": ["chrome > 69", "node > 9"], // 指定兼容性（输出的目标环境）
        "modules": false, // 采取何种方式来引入 helpers，值：amd umd systemjs commonjs cjs auto false
        // false 表示关闭任何非标准的模块引入，采取 ESM 模块引入方式
        // commonjs 和 cjs 两者同一个东西
        // auto 根据当前环境决定，比如 package.json 里的一些参数
        "bugfixs": false, // 是否激活 bugfix plugins
        "loose": false, // loose 模式，不严格按照语言实施标准转译从而降低输出的代码体积量
        "debug": false // output all enabled plugins when transforming
      }
    ]
  ]
}
```

### @babel/preset-react

转译 JSX。

### @babel/preset-typescript

转译 TypeScript。

### @babel/preset-flow

转译 Flow。

## 集成包

与 @babel/core 一同发布的包。

### @babel/cli

A built-in CLI.

### @babel/polyfill

此包等于：

```js
import 'core-js/stable' // v2
import 'regenerator-runtime/runtime' // regenerator 转换了的生成器代码需要的 runtime helpers
```

This package has been **deprecated** from v7.4.0 in favor of directly including `core-js/stable` and `regenerator-runtime/runtime`.

### @babel/register

Another way to use the Babel by require hooks in Node.js.

### @babel/standalon

Provide a standalone build of Babel for use in browsers and other non-Node.js environments.

体积信息(`https://unpkg.com/@babel/standalone@7.23.8/`)：

- `babel.js` = 4.9mb
- `babel.min.js` = 2.9mb

基本：

```html
<!-- 安装依赖 -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- 内联形式 -->
<!-- 参数借 dataset 传入 -->
<!-- data-type="module"：转译的结果以 script[type="module"] 插入 -->
<!-- data-presets="env, react"：激活的预设，有 env、react、typescript、flow、等，全部内置的预设从 `Babel.availablePresets` 获取 -->
<!-- data-plugins="transform-class-properties"：激活的插件，全部内置的插件从 `Babel.availablePlugins` 获取 -->
<!-- 对于 插件 和 预设 的参数，没有提供相对的 dataset 来传入，而是需要自己创建一个额外的预设，在此预设里向这些插件和预设传入参数，参考下面的【创建插件与预设】 -->
<script type="text/babel">
  // The Babel will read and transform the script's content, and then inject the result into current document by a new script node.
  const getMessage = (v) => v ?? 'hello world'
  console.log('getMessage', getMessage())
</script>

<!-- 外联形式 -->
<!-- 载入（转译）一个外部 js 文件，Babel 能处理设置在此标签上的 async，但不能处理 defer -->
<script type="text/babel" src="./foo.js" async></script>

<!-- 可编程形式 Use Babel's APIs -->
<script>
  const input = "const getMessage = (v) => v ?? 'hello world'"
  const output = Babel.transform(input, { presets: ['env'] }).code
</script>
```

创建插件和预设：

```html
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<script>
  // define a new babel plugin
  function sayHi() {
    return {
      visitor: {
        Identifier(path) {
          path.node.name = 'hi'
        },
      },
    }
  }
  Babel.registerPlugin('sayHi', sayHi)

  // define a new babel preset
  Babel.registerPreset('env-plus', {
    presets: [
      [
        Babel.availablePresets['env'],
        {
          // 在这里，向预设 @babel/preset-env 传入参数
          loose: true,
        },
      ],
    ],
    plugins: [
      // 也可以传入一些额外的插件
      // [Babel.availablePlugins['proposal-decorators'], { version: '2023-01' }],
    ],
  })
</script>

<!-- use above registered things with script -->
<script
  type="text/babel"
  src="./foo.js"
  data-plugins="sayHi"
  data-presets="env-plus"
></script>

<!-- use above registered things with APIs  -->
<script>
  const input = "const getMessage = (v) => v ?? 'hello world'"
  const output = Babel.transform(input, {
    presets: ['env-plus'],
    plugins: ['sayHI'],
  })
</script>
```

### @babel/plugin-transform-runtime

将 Babel 填入的一些 runtime helpers 从 @babel/runtime 这个包里引入，而非内联的方式，降低重复的代码，从而缩小输出产物的体积。

## 工具包

### @babel/core

The core transform APIs:

1. transform
2. transformSync
3. transformAsync
4. transformFile
5. transformFileSync
6. transformFileAsync
7. transformFromAst
8. transformFromAstSync
9. transformFromAstAsync
10. parse
11. parseSync
12. parseAsync

### @babel/parser

A code parser that parse the JavaScript code to AST.

### @babel/generator

A code generator that generate the AST to JavaScript code.

### @babel/traverse

Traverse a AST tree and modify its nodes if needed.

### @babel/types

创建或检查一个 AST Node。

### @babel/runtime

Contain Babel runtime helpers.

Babel 转译时需要的一些运行时的帮忙代码。

### @babel/code-frame

代码位置指示信息。

### @babel/template

This is known as an implementation of quasiquotes in computer science.

## Babel 对填入 Polyfill 的将来计划

把代码从 ES6+ 转到 ES6 甚至是 ES5，除了必要的语法转换，还需要填入目标平台缺少的 APIs，例如：

- corejs：当前最成熟最广泛的 polyfill，也是目前 Babel 的默认方案
- polyfill.io：一个根据设置的兼容信息和访问的浏览器的 UA 信息来生成需要的 polyfill 的在线平台
- es6-shims：一个 es6 的 polyfill
- bluebrid：一个 Promise 的 polyfill
- fetch：一个 fetch 的 polyfill
- 等等

目前填入 polyfill 的配置都集中在 @babel/preset-env 预设里，有两种填入方式（即 entry 和 usage），但是它们都有污染性：

```js
// 引入的这些 polyfills 直接污染了当前环境的 String.prototype window.Promise
import 'core-js/modules/es7.string.pad-end.js'
import 'core-js/modules/es6.promise.js'

var aa = 'abcd'.padEnd(10, '0')
var bb = Promise.resolve(true)
```

这样的污染很不适合开发一个 library，因此，@babel/-transform-runtime 提供了下面的参数：

```js
// 配置：`plugins: ["@babel/transform-runtime", { "corejs": 3 }]`
// 其中 corejs 的值有下面三个
// false: @babel/runtime only
// 2: @babel/runtime-corejs2 = @babel/runtime + corejs2 with pure functions
// 3: @babel/runtime-corejs3
// 其中 with corejs 的 runtime 表示非污染的方式引入 corejs 函数

// 没有污染当前环境
var $context
import $padEndInstanceProperty from '@babel/runtime-corejs3/core-js-stable/instance/pad-end'
import $Promise from '@babel/runtime-corejs3/core-js-stable/promise'

var aa = $padEndInstanceProperty(($context = 'abcd')).call($context, 10, '0')
var bb = $Promise.resolve(true)
```

**但是**这样的方式，已经严重割裂了【填入 Polyfill】这个单一的功能，让这个功能离散在了 @babel/preset-env 和 @babel/plugin-transform-runtime 两个地方，它们两者的参数可能不一样，两者也不一定能共享参数。而且 @babel/plugin-transform-runtime 本意仅仅只是转换 babel runtime helpers，现在还要负责【填入 Polyfill】。

因此，还在 alpha 测试的 Babel v8 在尝试更合理的配置方式：

```json
// babel.config.
// 下面的配置是试验性的
{
  "targets": ["chrome > 79"],
  "presets": ["@babel/env"], // @babel/preset-env 预设不再处理 polyfill
  // 现在对 polyfill 的处理都统一到了一个配置项里，更合理了，不再离散了
  "polyfills": [
    [
      // 选择 corejs3 做此项目的 polyfill 方案
      // 此处的 corejs3 = @babel/babel-polyfills/babel-plugin-polyfill-corejs3，注意不是 @babel/polyfill
      // 目前 @babel/babel-polyfills 提供四个 Polyfill 供选择：
      // babel-plugin-polyfill-corejs2
      // babel-plugin-polyfill-corejs3
      // babel-plugin-polyfill-es-shims
      // babel-plugin-polyfill-regenerator
      // 你也可以传入一个你自己的 polyfill provider 插件来提供自定义的 polyfill 填入
      "corejs3",
      // 参数
      {
        // 填入方式
        // entry-global = 老的 useBuiltIns: entry
        // usage-global = 老的 useBuiltIns: useage
        // usage-pure = 老的 useBuiltIns: usage + 老的 transform-runtime: corejs3
        "method": "usage-pure",
        // 接受处于提案的特性
        "proposals": true
      }
    ]
    // 这个配置项是一个数组，意味着你可传入多个 polyfill provider
  ]
}
```

### 自定义 Polyfill Provider

你可能不想采取 Babel 默认的 corejs Polyfill 方案，现在 Babel v8 能让你自定义你自己的 Polyfill Provider，详细参考 @babel/helper-define-polyfill-provider 此包。

## Polyfill 和 Shim

这两者是很相似的概念，通常都指示同一个东西：填入当前平台缺少的功能（这些功能都是能被旧的功能尽可能地模拟出来的），比如 `Object.entries` 方法，但是注意语言或语法特性是不能被模拟的，比如 `for of` 语句。
