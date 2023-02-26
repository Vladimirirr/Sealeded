# uniapp 基本思想

**下面的小程序指的都是微信小程序。**

**下文及其他文章提到的`mp`指的是`miniprogram`。**

## 微信小程序的基本架构概述

**微信小程序的本质是一个【与微信高度耦合】且【基于微信高度优化】的 webview。**

webview 指代一个完整的浏览器内核，包括最重要的【JS 引擎】和【渲染引擎】。

最早微信对它内置的 webview 暴露了一个名叫`wx`的`JSBridge`接口，使得在网页端能够唤起微信的原生功能，比如：

```js
wx.previewImages({
  // 唤起微信原生的图片浏览器
  default: './fruit.jpg',
  imgs: ['./banana.jpg', './apple.jpg'],
  success: () => {},
  error: () => {},
})
```

传统网页的【JS 执行】和【渲染】是互斥关系，又由于移动端性能普遍较低（微信小程序最早推出是 2015 年，移动端性能都不高），长时间执行的 JS 脚本会使得界面没响应，严重影响用户体验，所以，当时微信小程序提出将【JS 执行】和【渲染】独立出来到各自的线程中，并发运行。

不过，也带来对应的缺点：由于线程相互独立，一次通信的成本较高（下文将提到此问题），在快速交互的情况下（比如快速下滑列表）可能导致页面反应跟不上的问题（下文将提到解决方法）。

由于【JS 引擎】从 webview 单独独立，意味着在微信小程序的 JS 代码里无法访问任何与 dom 和 bom 相关的方法，也就使得著名的 Zepto.js 无法在小程序上运行，同时，iOS 端的 JavaScriptCore 和 Node.js 的 V8 也不尽相同，有些 npm 包可能无法正常运行。

由于【渲染引擎】从 webview 单独独立，意味着在微信小程序的视图发生了交互，无法迅速地执行对应的 JS 逻辑，而是需要先经过消息管道通信到对应的逻辑线程，再由逻辑线程对应的 JS 逻辑执行，最终再将直接结果反馈到视图线程。

什么是微信小程序的 WXS？它是能直接运行在视图层的 JS-like 代码。（从而避免两个引擎通信造成的时间浪费，但是有很多限制，不是特别好用）

不同平台对应的 webview：

| 平台           | 逻辑           | 渲染                       |
| -------------- | -------------- | -------------------------- |
| iOS            | JavaScriptCore | WKwebview                  |
| Android        | V8             | 基于 Chromium webview 定制 |
| 微信开发者工具 | NWJS           | Chrome webview             |

## 概述（配合 Vue2 举例）

uniapp = 数据使用 vue 管理 + 视图依旧（也只能）由小程序管理

uniapp = 编译时（将 vue 编写的项目转成符合微信小程序格式的项目） + 运行时（代理小程序的行为，比如代理小程序的事件和生命周期钩子）

小程序的 setData 用法与 React 的 setState 相同，但是 setData 是同步地修改依赖，**同时<font color="red">立刻</font>向渲染层发送一个更新请求，也就导致了连续多次的 setData 不会合并**。

一次 setData 的过程：

1. 【逻辑线程】改变当前组件对应依赖的值，触发组件的生命周期钩子和其他副作用，发送数据（即一次渲染更新请求）到渲染线程
2. 【逻辑线程 -> 渲染线程】数据 -> 编码数据 -> 传输数据（IPC 通信）
3. 【渲染线程】接受数据 -> 其他渲染请求正在执行 -> 等待 -> 解码数据 -> 对 vdom 进行 diff+patch -> 更新真实 dom

具体的数据编码方式不清楚（官网没有给出），可能是 JSON，或其他的私有实现。

小程序的逻辑线程和视图层相互独立，两者使用 IPC 通信，数据需要经过【编码】 -> 【传输】 -> 【解码】，所以每次 setData 都是一次高成本操作。

如果渲染线程正忙，那么多出的更新请求将保存在消息队列里进行等待，**不会自动合并多个更新请求，渲染线程一次只处理一个更新请求**。

要提高性能，优化 setData 是一个关键，有如下一些优化手段：

1. 减少 setData 的次数，降低通信频率：

   ```js
   setData({ x: 1 })
   setData({ y: 2 })
   ```

   合并两次 setData 为一次

   ```js
   setData({ x: 1, y: 2 })
   ```

2. 减少 setData 一次的数据量，降低通信成本：

   ```js
   const newList = [1, 2]
   setData({
     // 会传递全部的list，其实旧的list里面的元素不需要在再次传递了
     list: [...this.list, ...newList],
   })
   ```

   变成

   ```js
   setData({ // 只值传递新增的值，数组长度length会自动增加
     list[2]: 1,
     list[3]: 2,
   })
   ```

3. 与渲染不相关的数据不要放在 data 里面，可以直接定义在组件实例上，比如`this.staticStore = { key: 'value' }`
4. 和 React 一样，setData 会引起自身和其全部子组件的更新，要控制最小的更新范围，避免过深的状态提升，也可以结合 CSS 的`contain`一起使用来控制更新范围
5. 当小程序切到后台时（onHide 事件）避免 setData 操作，所有需要的更新先记下来，当小程序再次切回前台（onShow 事件）时一次性 setData

运行时的代理举例：

1. 代理小程序的事件（在编译时就被处理了，写在 vue 模板的事件被编译为对应的小程序事件名，再统一代理到事件处理方法`__e`）
   比如 vue 的：
   `<button @click="titleChange()">clickme</button>`
   编译的微信小程序：（在`data-event-opts`上记录【小程序事件名与它对应的 vue 的 methods 定义的事件处理器】的映射表）
   `<button data-event-opts="{{[['tap',[['titleChange']]]]}}" bindtap="__e">clickme</button>`
2. 代理小程序的生命周期（在编译时就被处理了，比如在小程序的 onReady 钩子里还将触发 Vue 的 mounted 钩子）
3. 代理数据的变化，拦截 Vue2 在`flushSchedulerQueue`时的`watcher.run`（因为 vdom 和真实 dom 的 patch 不由 Vue 完成，而是由小程序自己完成）方法，转而对当前 watcher 对应的组件发生改变的数据的最小量统一进行一次小程序的 setData

总结：

此时 Vue 的 patch 只 diff 新旧数据，由于两者的组件实例相互引用，即`vueInstance.$wxInstance <--> wxInstance.$vue`，当 Vue 组件更新时，从`vueInstance.$data`得到最新的新值，从`wxInstance.$data`得到上一次的旧值，新旧值进行 diff，得出最小数据变化量 patch，再一次性执行 `wxInstance.setData`。

由于 Vue 不再执行真正的 diff+patch，不需要 VNode 也不需要 render 函数以及其他有关的操作，降低了 30% 的 Vue 代码量。

## `uniapp(vue2) -> 微信小程序` 打包输出的项目源码分析

[See document.](./uniappVue2ToWX.md)

## `uniapp(vue3) -> 微信小程序` 打包输出的项目源码分析

[See document.](./uniappVue3ToWX.md)
