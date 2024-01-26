# Vue-Loader

通过 vue-loader，能让 webpack 正常读取 vue sfc 文件。

## 工作方式简述

一个 vue sfc 其实是这三者的组合体：

- `template`：一块 html-like 的代码
- `script`：一块 js 或 ts 的代码
- `style`：一块 css 或 less 或 scss 或 stylus 的代码

因此，vue-loader 不是一个简单的 source transform loader only，更像是一个 forward loader，它把里面的 blocks 处理为 virtual modules，从而把这些 blocks 转发，并匹配到需要的 loaders 上去：

- `template block` 转发并匹配到 js 的 rule
- `script block` 转发并匹配到 ts 或 js 的 rule
- `style block` 转发并匹配到 css 或 less 或 scss 或 stylus 的 rule

一个 vue sfc 被 vue-loader 首次处理的结果，如下：

```js
// id = 7ba5bd90 = hash('/src/About.vue')
// **The vue sfc code imported itself, but with different request for each block.**

import normalizer from 'vue-loader/runtime/componentNormalizer'

// **简单地看**，下面的针对 vue block 的请求都会被 VueLoaderPlugin 重写（从而引发 webpack 内部请求的重定向）。
// 重写的 loaders 链，是 VueLoaderPlugin 读取 webpack.config.module.rules 中目标语言已配置的 loaders 得到的。
// 注意，重写的请求的首个 loader 依旧是 vue-loader，但是此时的 vue-loader 会得到此 block 的真正内容：
// type=template: template block: process with vue-template-compiler and return a render function as the result
// type=script, type=style: script, style block: return the content itself
import template from './About.vue?vue&type=template&id=7ba5bd90'
// replace to 'babel-loader!vue-loader!./About.vue?vue&type=template&id=7ba5bd90'
import script from './About.vue?vue&type=script&lang=js&id=7ba5bd90'
// replace to 'babel-loader!vue-loader!./About.vue?vue&type=script&lang=js&id=7ba5bd90'
import style0 from './About.vue?vue&type=style&index=0&lang=less&id=7ba5bd90'
// replace to 'vue-style-loader!css-loader!postcss-loader!less-loader!vue-loader./About.vue?vue&type=style&index=0&lang=less&id=7ba5bd90'

// normalize component
var component = normalizer(
  /* scriptExports */ script,
  /* render */ template.render,
  /* staticRenders */ template.staticRenders,
  /* scopeId */ '7ba5bd90'
)
component.options.__file = '/src/About.vue'
component.options.__id = '7ba5bd90'

export default component
```

## 更具体的工作方式

上面很简单地描述了 VueLoaderPlugin 的工作方式，即直截了当的重定向。

但其实，它的真正工作方式很复杂：

1. 在 webpack 进入打包工作前，拷贝了一份已经配置的 rules（vue rule 自己除外）
2. 修改它们，使得 vue sfc 的各个 blocks 能匹配到这些 rules
3. 插入一个带有 pitch 的空 loader（一个 loader 直接返回它接收的东西）
4. 这个 pitch 负责拦截所有的 resource request，从中检测带有 `?vue` 查询参数的请求
5. 把检测到的请求描述成一个 virtual module（例如，`About.vue?vue&type=script&lang=js` 描述 -> `About.vue.js?fromVue`）
6. 最终，使得这个 block request 以 virtual module 的形式匹配到它需要的 rule

但是不管如何的复杂，vue-loader 和它的 plugin 就是为了做一件事，**即“如何让 vue sfc 的各个 blocks 能复用已经配置了的 rules”**。

## 番外

老的 vue-loader 工作方式更简单（而且没有相应的 plugin）：

```js
// webpack.config.js

export default {
  model: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: 'old-vue-loader',
          options: {
            // 你需要自己指定各个 blocks 的 loaders 链
            // 下面是一些默认的值
            template: 'babel-loader',
            script: 'babel-loader',
            style: {
              less: 'vue-style-loader!css-loader!postcss-loader!less-loader',
              css: 'vue-style-loader!css-loader!postcss-loader',
            },
          },
        },
      },
    ],
  },
}
```
