# VueToastMessage

ToastMessage 在 Vue2 下的基础实现。

参考了 [iview（已更名 ViewUI）](https://github.com/view-design/ViewUI) 和 [elementui](https://github.com/ElemeFE/element) 两个 UI 组件框里 message 组件的实现，而此处的 message 是轻量级的提示（即 Toast），因此又叫 ToastMessage。

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
      // 传入内容和显示时间（单位：ms），内容默认空字符串，显示时间默认 2 秒
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
