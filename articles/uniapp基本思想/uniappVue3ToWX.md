# `uniapp(vue3) -> 微信小程序` 打包输出的项目源码分析

不管是 Vue2 还是 Vue3 版本的 uniapp，它们的基本思想只有：

1. Vue 只维持数据以及响应数据的变化
2. 将数据改变以最小量使用 setData 发送出去，让渲染层进行实际的 diff+patch

故，改造 Vue2 和 Vue3 最终使得：

数据改变 -> 触发更新 -> 进入 diff -> 找出最小的数据改变量 -> 进入 patch（patch 已经被改写，只剩下 setData 相关的操作） -> 执行微信小程序的 setData

## Vue 组件初始化与依赖建立

uniapp3 对 Vue 组件的 setup 执行延迟到了对应的 attached 钩子里。

attached 钩子里面的 this 就是当前微信小程序的实例对象，使用 createComponent 来对 vueComponentOptions（exportVueSfc 方法导出的对象）生成 Vue 组件实例，把这个 vueInstance 挂载到 wxInstance 上，同时也会把 wxInstance 传入 createComponent 使得 vueInstance 也挂载上对应的 wxInstance，最终形成相互绑定关系。

在首次初始化 Vue 实例时，会执行 componentUpdateFn（相当于 Vue2 的 componentUpdate 方法），会执行 vueInstance.render 方法（就是 setup 返回的函数），得到当前最新的状态，进入 patch，最后 setData。

依赖改变重新触发 compoentUpdateFn 方法。

## 空模板编译的结果

uniappvue3 目录结构与 uniappvue2 相同。

项目使用 vite 打包，而非 webpack：

1. 基于 rollup 打包，具有极强的 tree-shaking（模块使用 ES 规范）
2. 基于 esbuild 编译，具有极强的 JS 和 TS 文件编译速度（与 SWC 相同），不过打包还是不太稳定

```js
// vite.config.js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni' // 一套适用于uniapp在vite下的插件集合

export default defineConfig({
  plugins: [uni()],
})
```

生成的对应小程序项目目录结构：

`/common/vendor.js`:

1. uniapp-mp-vue 针对小程序(mp = miniprogram)定制的 Vue3 框架
2. uniapp-mp-weixin 运行时代理
3. 其他默认的包，比如 uniapp-componens、vue-i18n
4. 其他第三方包，比如 dayjs

`/pages/index/index.js`

source:

```html
<script setup>
  import { ref } from 'vue'
  const title = ref('hello JS')
  const fnfn = (...args) => console.log('event', args)
</script>
```

transformed:

```js
'use strict'
// 微信小程序使用的是 CJS 模块标准
var common_vendor = require('../../common/vendor.js')

// vue组件（基于steup的组合式api）
const _sfc_main = {
  __name: 'index', // 'index.vue'
  setup(__props) {
    // 执行一次setup函数，注意，这里return的是一个函数！
    // 把这个return的函数保存起来，但每次依赖变化就调用这个函数！
    // 这个函数就相当于是render函数了！
    const title = common_vendor.ref('hello JS')
    const fnfn = (...args) => console.log('event', args)
    return (__ctx, __cache) => {
      // 在这里读取了响应式对象的值，即依赖收集
      return {
        title: common_vendor.formatRef(title.value), // toString
        fnfn: common_vendor.formatEventHandler(($event) =>
          fnfn(11, 22, title.value, $event)
        ), // 返回此事件处理器的唯一标识符
      }
      // 最终返回 { title: 'hello JS', fnfn: 'e0' }
      // e0将放在对应微信小程序元素的bindtap上，e0以及它的值将被挂载到wxInstance上
    }
  },
}

var page = common_vendor.exportVueSfc(_sfc_main, [
  ['__file', 'C:/Users/yang/Desktop/test/uniappvue3/pages/index/index.vue'],
])
// 最终得到vue3的基于setup语法的组件配置对象
// {
//   setup: Function,
//   __file: '/path/index.vue',
//   __name: 'index',
//   __scopedId: 'data-v-27181812'
// }

// Page(parsePage(vuePageOptions))
// wx是微信原生的全局对象，wx.createPage由uniapp-mp-weixin运行时代理挂载
wx.createPage(page)
```

事件预处理器的细节（组件配置对象的 setup 函数在此 Page 的 attached 钩子里执行）：

1. `return formatEventHandler(userEventHandler)`
2. `const currentVueInstance = getCurrentInstance()`
3. `const eventHandlerUniqName = 'e' + currentVueInstance.eid++`
4. `const wxInstance = currentVueInstance.$wxInstance`
5. `!wxInstance[eventHandlerUniqName] && wxInstance[eventHandlerUniqName] = createHandler(userEventHandler)`

   1. `const wrappedHandler = wrapHandler(handler) // wrappedHandler 将作为事件处理器传给微信小程序对应的事件，接收来自于微信小程序的原生事件对象，当做$event参数名传给originHandler，同时在此wrappedHandler会对参数做格式化等等的转换操作，即事件的运行时代理`
   2. `wrappedHandler.originHandler = handler`
   3. `return wrappedHandler`

6. `return eventHandlerUniqName`

`/pages/index/index.wxml`

source:

```xml
<template>
  <view class="content">
    <view class="text-area" @click="fnfn(11, 22, title, $event)">
      <text class="title">{{title}}</text>
    </view>
  </view>
</template>
```

编译为小程序的模板是：

```xml
<view class="content">
  <view class="text-area" bindtap="e0">
    <text class="title">{{title}}</text>
  </view>
</view>
```

`/pages/index/index.wxss`
`/pages/index/index.json`
`/static`
`app.js` 来自 App.vue 的 script + main.js

```js
const _sfc_main = {
  // from App.vue#script
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
// exportVueSfc来自univue3
// 简单地把第二个参数使用toParis扩展到_sfc_main对象上
var App = common_vendor.exportVueSfc(_sfc_main, [
  ['__file', 'C:/Users/yang/Desktop/test/uniappvue3/App.vue'],
])
// 因为不需要Vue3来接管diff+patch，只需要createSSRApp即可，也不需要引入dom相关操作的代码
common_vendor.createSSRApp(App)
```

`app.json`
`app.wxss` 来自 App.vue 的 style
`project.config.json`
`project.private.config.json`
`sitemap.json`
