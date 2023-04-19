# VueToastMessage

ToastMessage 在 Vue2 下的基础实现。

参考了 [iview（已更名 ViewUI）](https://github.com/view-design/ViewUI) 和 [elementui](https://github.com/ElemeFE/element) 两个 UI 组件框架里 message 组件的实现，而此处的 message 是轻量级的提示（即 Toast），因此又叫 ToastMessage。

其中，配色和图标来自 elementui。

1. ToastMessage1 参考自 iview
2. ToastMessage2 参考自 elementui

两者实现的不同点：

1. iview 是【容器 + Message 组件】的方式，容器在窗口里垂直居中定位，好处是，Message 组件的垂直位置（top 值）被容器接管
2. elementui 是单一的 Message 组件，每一个 Message 组件需要根据目前已经存在的 Message 得出它需要的 top（同时在移除其中一个 Message 时，其余 Message 的 top 都需要重新设置），好处是，更灵活

不过，我个人还是比较喜欢 iview 实现的方式。

## How to uses

在你的 `main.js` 里：

```js
// Vue
import Vue from 'vue'

// 根据你喜欢的实现，导入其中一个即可
import ToastMessage1 from './index.js'
// import ToastMessage2 from './index.js'

Vue.use(ToastMessage1) // 或者 ToastMessage2
```

在你的一个 Vue 组件里：

```vue
<template>
  <div class="Test">
    <button @click="showToastMessage">click me to test</button>
  </div>
</template>
<script>
// ! Vue.version = 2
export default {
  methods: {
    showToastMessage() {
      // 传入内容和显示时间（单位：ms），内容默认空字符串，显示时间默认 3 秒
      // 得到一个函数（不需要传入参数），可以提前关闭此 ToastMessage
      const closeThisMessageNow = this.$tm.success('Test Ok.', 3e3)
      // 剩余的显示类型
      // this.$tm.error('Test Ok.')
      // this.$tm.warning('Test Ok.')
      // this.$tm.tip('Test Ok.')
    },
  },
}
</script>
```

## in Vue3

Vue3 创造根组件由 `Vue.createApp()` 实现，保证每一个根组件是干净的独立的，不会相互污染。而 Vue2 是 `new Vue()`，存在根构造器被污染的情况（向 `Vue.prototype` 修改）。

Vue3 构建的根组件对象的 `VueInstance.mount(target: Element)` 方法必须要传入挂载点，而 Vue2 的 `VueInstance.$mount(target?: Element)` 是可选的。

### iview3 (iview for Vue3)

在转向 Vue3 方面，iview 采取简单粗暴但高效的方式，即直接再构建一个根组件对象，因此 iview3 的 message 会多出一个额外的 `<div data-v-app>`，简化代码如下：

```js
import Vue from 'vue@3'
import ToastMessageContainer from './ToastMessageContainer.js'

let manager = null
const ToastMessageApp = Vue.createApp({
  render() {
    return h(ToastMessageContainer, {
      ref: 'ToastMessageContainerRef',
      // ...configs, // other configs omitted here
    })
  },
  methods: {
    showMessage() {
      // ...
    },
    clear() {
      // ...
    },
  },
  mounted() {
    manager = Vue.getCurrentInstance()
  },
})

// 挂载
const container = document.createElement('div#ToastMessageAppContainer')
document.body.appendChild(container)
ToastMessageApp.mount(container)

// manager.showMessage()
// manager.clear()
```

### element-plus (elementui for Vue3)

不同 iview3 的是，element-plus 没采取此简单粗暴的方法（消耗性能，但是可不计），而是采取 Vue3 暴露出来的一些内置的低级的 apis 来实现，简化代码如下：

```js
import {
  render, // Vue 默认暴露出来的 render 是 DomRender
  h,
} from 'vue@3'

// Message 组件的渲染树，这里仅做演示，真正情况是传入一个 Message 组件到 h 函数里
const messageVNodeTree = h(
  'div',
  {
    class: 'Message Message-Error',
  },
  [h('b', {}, 'Sth error happened.')]
)

// 挂载点
const messageMountTarget = document.createElement('div')

// 渲染 VNodeTree 到 挂载点
render(messageVNodeTree, messageMountTarget) // messageVNodeTree.el === messageMountTarget.children[0]

// 打印
console.log('rendered dom', messageVNodeTree.el) // Message 组件的渲染结果
console.log('component instance', messageVNodeTree.component) // 在这可取得组件 defineExpose 暴露出来的内容

// // 销毁，销毁除了已经渲染的 DOM 外的其他任何内容
// render(null, messageMountTarget)
```
