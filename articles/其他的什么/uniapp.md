# uniapp 基本思想

`mp` = `miniprogram`。

## mp 的基本架构概述

mp 是一个【与本地 APP 高度耦合】的 webview。且对它内置的 webview 暴露了一个名叫一些`JSBridge`接口，使得在网页端能够唤起本地设备的功能。

## 概述（配合 Vue2 举例）

uniapp = 值内容让 Vue 管理 + 视图依旧（也只能）由 mp 管理

uniapp = 编译时（将 Vue-like 项目转成符合 mp 格式的项目） + 运行时（代理 mp 的一些行为，比如，代理 mp 的事件和生命钩子）

## 总结

此时 Vue 的 patch 只有一个目的：对比两次状态的不同，得出最小内容变化量 patch，再一次性 `setData`。

Vue 不再需要真正的 `patch`，也不需要 VNode 也不需要 render 函数及其他有关的内容，降低了 30% 的 Vue 代码量。

## uniapp 套件

- "@dcloudio/uni-mp-vue": "^2.0.1-34920220630001" 已修改的 Vue，简称 uni-vue2
- "@dcloudio/uni-template-compiler": "^2.0.1-34920220630001" 已修改的 vue-template-compiler
- "@dcloudio/uni-mp-weixin": "^2.0.1-34920220630001" 微信平台下的 mp 运行时代理
