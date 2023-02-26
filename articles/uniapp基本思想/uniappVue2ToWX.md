# `uniapp(vue2) -> 微信小程序` 打包输出的项目源码分析

环境：

- HBuilder 3.4.18.20220630

uniapp 编译器版本：

- "@dcloudio/uni-mp-vue": "^2.0.1-34920220630001" 修改版的 Vue，下面简称 uni-vue2
- "@dcloudio/uni-template-compiler": "^2.0.1-34920220630001" 依赖 vue-template-compiler，编译 .vue 文件
- "@dcloudio/uni-mp-weixin": "^2.0.1-34920220630001" uniapp 在微信小程序的运行时（运行时代理）

微信开发者工具 1.06.2206090，基本库 2.25.1

## 原生微信小程序的空模板目录

`/pages/demo/index.js.json.wxml.wxss`: demo 页面的目录，都以 index 命名的四个文件：
`index.wxml`

```xml
<!--index.wxml-->
<view class="indexContainer">
  <button bindtap="tapHandler">测试setData</button>
</view>
```

`index.js`

```js
// index.js
const app = getApp() // 得到小程序全局唯一的 App 实例，即 App 构造函数返回的对象

Page({
  data: {
    username: 'nat',
  },
  tapHandler() {
    this.setData({
      // 1. 同步改变当前组件实例的username值
      // 2. 同步发送一个更新请求到渲染线程（渲染线程对每个更新请求都单独处理，不会自动地合并多个更新请求，当渲染线程正忙时，多出来的更新请求将排队等待）
      username: 'jack',
    })
  },
  onLoad() {},
})
```

`index.wxss`

```css
/**index.wxss**/
.indexContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: red;
}
.username {
  color: black;
}
```

`index.json`

```json
{
  "navigationBarTitleText": "小程序的title",
  "usingComponents": {} // 自定义组件注册列表，key组件名，value组件路径，随后，就可以直接在wxml里使用
}
```

`/pages/demo2/demo2.js.json.wxml.wxss`: 同上，也可以是和目录名相同的四个文件

`/utils/utils.js`: 一些工具方法，使用 cjs 的模块导出语法，其他 js 文件导入的时候也需要 cjs 的模块导入语法

`/app.js`: 小程序启动的入口，执行`App({ ...options })`初始化小程序

`/app.json`: 小程序的全局配置，比如【页面路由表】和【导航栏的颜色】

`/app.wxss`: 小程序的全局样式

`/project.config.json`: 项目配置文件

`/project.private.config.json`: 私有项目配置文件，类似于.env.local

`/sitemap.json`: 对微信小程序搜索平台的爬虫开放的信息，类似于网站的 robots.txt

## uniapp(vue2) 空模板项目

`/pages/index/index.vue`: 普通页面，vue 单文件的`template`、`script`和`style`将生成对应的`.wxml`、`.js`和`.wxss`微信小程序文件

`/main.js`: uniapp 的入口，定义 Vue 的全局组件、过滤器、混入，安装插件，以及其他初始化操作，最终初始化得到一个 vue 实例

`/App.vue`: `script`的代码将当作微信小程序的 app.js，`style`的代码将当作微信小程序的 app.wxss

`/pages.json`: 页面路由配置表

`/uni.scss`: 基础的样式变量，比如`$primary-color: #3F51B5`，此文件不会被打包，它只在编译时做静态替换

`/manifest.json`: 应用的配置文件，里面包含了公共配置、APP 和各端小程序的配置集合，微信小程序的配置项为`mp-weixin`

`/unpackage/dist`: 打包的目录地址

`/static`: 静态文件目录

`/.hbuilderx`: 类似于.vscode

`/.hbuilderx/launch.json`: 在 HBuilder 里启动项目相关的配置

`/index.html`: 只有当使用 uniapp 开发 h5 时才有效

对 main.js 和 App.vue 的详细说明：

main.js 和 App.vue 的`script`都将编译到`/common/main.js`，**此 main.js 会调用微信小程序的 `App` 构造函数**，以初始化整个微信小程序。

由于 App.vue 的 `script` 导出的对象最终作为小程序 App 构造函数的参数，故 `script` 导出的对象要是合法的 App 构造函数的配置对象。

App.vue 的`style`字段将编译到`/common/main.wxss`（此文件会被 app.wxss 导入），这里包含一些能共用的全局样式（比如`.flexCol: { display: flex; flex-direction: column; align-items: center; justify-content: space-between; }`），不要使用`scoped`。

## 空模板编译的结果

`/common/runtime.js`: 初始化 uni-app 的运行时，初始化运行时的全局方法和常量，安装 webpack 的 jsonp 加载器，以动态加载分包(chunk.js)

`/common/vender.js`: node_modules 依赖，默认的包：

1. 适用于微信小程序的运行时`@dcloudio/uni-mp-weixin`，包括：
   1. 一些 polyfill（比如`Promise.finally`）和工具方法（比如`promiseify`）
   2. 得到当前小程序需要的国际化支持（比如得到当前的语言）
   3. 对微信小程序 api 的一些高层封装
   4. 对 uni-vue2 做修改，以支持不同设备不同小程序版本，初始化 Vue（比如挂载工具方法到 Vue.prototype）
   5. 生成一份关于当前小程序和它的运行环境的清单列表（比如`appName`、`osVersion`）
2. 国际化支持`@dcloudio/uni-i18n`
3. 基于 vue2.6.10 改装的适用于微信小程序的`@dcloudio/vue-cli-plugin-uni/packages/mp-vue`框架，即 uni-vue2
4. 一个 vue2-sfc-compiler，`@dcloudio/vue-cli-plugin-uni/packages/vue-loader`

`/common/main.js`: 入口，将相当于微信小程序的 app.js，在这里会调用微信小程序的 App 构造函数来初始化整个小程序

`/common/main.wxss`: 全局样式，来自于 uniapp 项目的 App.vue 的 style，以及其他页面不带 scoped 的样式

`/pages/index`: index 页面的目录，由 vue 文件使用`@dcloudio/uni-template-compiler`编译而来

`/pages/index/index.wxml`: 页面的结构，vue 的 template 的 -> wxml

`/pages/index/index.js`: 逻辑

`/pages/index/index.wxss`: 样式

`/pages/index/index.json`: 配置

`/static`

`/app.js`: `require('./commom/runtime.js'); require('./commom/vendor.js'); require('./commom/main.js');`

`/app.json`

`/app.wxss`: `@import './common/main.wxss'; [data-hidden]{ display: none !important; }`

`/project.config.json`

`/project.private.config.json`

`/sitemap.json`

每个 vue 的 template 编译行为：

```vue
<template>
  <view class="content">
    <image class="logo" src="/static/logo.png"></image>
    <view class="contentaArea">
      <text class="title" v-model="title">{{ title + '!' }}</text>
      <button @click="titleChange()">clickme</button>
      <view v-if="title === 'hello'">v-if test</view>
      <view v-show="title === 'hello'">v-show test</view>
      <view v-for="i in 5" v-text="i"></view>
    </view>
  </view>
</template>
```

根据此 template 的 render 函数编译得到微信小程序的模板：

```xml
<view class="content">
  <image class="logo" src="/static/logo.png"></image>
  <view class="contentaArea">
    <text
      value="{{title}}"
      data-event-opts="{{[['input',[['__set_model',['','title','$event',[]]]]]]}}"
      bindinput="__e"
      class="title"
    >
      {{title+'!'}}
    </text>
    <!-- attr里面的{{}}相当于vue的v-bind:attr，{{}}里面的值将当作表达式 -->
    <!-- [['tap',[['titleChange']]]].toString() === 'tap,titleChange' -->
    <!-- button的data-event-opts值是'tap,titleChange' -->
    <button data-event-opts="{{[['tap',[['titleChange']]]]}}" bindtap="__e">clickme</button>
    <!-- block组件相当于React的Fragment组件 -->
    <block wx:if="{{title==='hello'}}">
      <view>v-if test</view>
    </block>
    <view hidden="{{!(title==='hello')}}">v-show test</view>
    <block wx:for="{{5}}" wx:for-item="i" wx:for-index="__i0__">
      <view>{{i}}</view>
    </block>
  </view>
</view>
```

事件注册的格式：

```js
;[
  [
    'tap',
    [
      ['handler1', [arg1, arg2]],
      ['handler2', []],
    ],
  ],
]
// tap事件有两个处理器，handler1接收两个参数，handler不接收任何参数
```

这样的写法（事件信息以字符串的形式挂载在元素的 dataset 上），导致了在 wxml 定义的事件处理器的参数必须是合法的 JSON（能字符串化）。
不过一些无法被 JSON 的值可以放在 data 上，再在模板里使用这个值，比如：

```vue
<view @tap="handler1(10, key)"></view>
```

编译得到的对应 wxml 的元素的 dataset 的值为`tap,handler1,10,$0;key`，当微信小程序发生了 tap 事件，就由`__e`事件代理执行，而在事件代理里面，通过 `wxInstance.$vue`得到对应的 vue 组件实例，再用`vueInstance.key`的值替换 $0，最终执行 vue 组件里的 methods 对应的方法。

每个 vue 的 script 编译行为：根据 script 导出的组件，对此组件执行来自于 uni-mp-weixin 的 createPage 方法（传入此组件）：

```js
const createPage = (vuePageOptions) => Page(parsePage(vuePageOptions))
```

parsePage：得到一个符合微信小程序 Component 构造器的配置项
Page：得到一个微信小程序的页面组件

所以 index.vue 打包的 index.js 里的第一个依赖模块直接使用 IIFE 执行了一次微信小程序的 Page 构造函数。

`/common/main.js` 的第一个也是 IIFE，它将执行 createApp 方法：

```js
const vueVm = new Vue({ ...options, ...defaultOptions })
const createApp = (vueVm) => App(parseApp(vueVm))
```

parseApp：得到符合 App 构造函数的配置项

## CSS scoped 的改变

将唯一的哈希值从 dataset 移到 className，如下：

```css
<style scoped>
.foo{
  color: red;
}
</style>
```

编译为：

```css
.foo.data-v-472cff63 {
  color: red;
}
```

适用于：

```html
<view class="foo data-v-472cff63">hello</view>
```

## 自定义组件

微信自定义的组件需要在它的 json 配置文件写明`component: true`，表示是一个自定义组件（自定义组件渲染的元素有一个 is 属性，表明了此组件的来源（路径地址））。

微信的页面组件（构造函数 Page）也属于自定义组件（构造函数 Component），只不过它拥有页面级别的生命周期钩子和方法，但没有自定义组件灵活，而且现在当自定义组件充当页面时（需要微信基础库 1.6.3），微信也会向它提供页面级别的生命周期钩子和方法。

需要导入自定义组件的组件（或页面）要在 json 配置文件写明，随后便可以直接在 wxml 里面使用：

```json
{
  "usingComponents": {
    "component-name": "/path/to/component/component-name"
  }
}
```

在 uniapp 使用 vue 写的自定义组件：

```js
global.webpackJsonp.push([
  '/path/to/component/compoent-name',
  createComponent(componentOptions),
])
```

createComponent 来自于 uni-mp-weixin：

```js
const createComponent = (vueOptions) => Component(parseComponent(vueOptions))
```

在引入此组件的页面或其他自定义组件的配置项文件里的 usingComponents 字段注册此组件。
