# 响应式系统与依赖收集

旧的文章表述略微不准，已移除。（只保留了准的）

新的参见`https://github.com/Vladimirirr/HowVueWorksSealeded`的《响应式系统与副作用》章节

## Vue 响应式系统的重点概念

- 被用到的数据就是依赖（比如 Vue 组件的模板使用到的 data 里的数据、自定义 watcher 的键路径），在依赖的 getter 中收集它的订阅者（也就是观察者，即 Vue 的 watcher 对象，而每个 watcher 对象带有自己的副作用，比如 renderWatcher 的副作用就是更新组件的视图），在依赖的 setter 中执行它已经收集的订阅者（执行订阅者就是执行订阅者的副作用）
- 数据变化时（依赖变化时），对应依赖的 setter 就通知它 dep（由 Dep 类实例化过来，管理此依赖的全部订阅者），接着 dep 执行它全部的 watcher
- 当前激活的 watcher 把自己放到全局的一个位置，以便被需要它的依赖收集

## renderWatcher

Vue1.x 的响应式更新以 dom 节点为单位进行更新，在渲染模板时遇到插值表达式或指令就会实例化对应的 watcher，这是一种细粒度的更新，而 Vue2.x 以组件为单位进行更新，传入 watcher 的不再是表达式字符串而是组件对应的渲染函数，这是一种中粒度的更新。

Vue1.x 的细颗粒更新的主要缺点：

1. 无法支撑大型应用，因为依赖越多需要的 watcher 实例越多，还包括其他用户自定义的 watcher（watch 和 computed），造成大量的内存消耗
2. 由于操作的都是 dom 对象，也仅支持 web 端

在 Vue2.x 中，更新以组件为单位，一个组件只有一个渲染 watcher，每个依赖的 dep 都收集了此渲染 watcher，此渲染 watcher 产生此组件的虚拟 dom，在组件内对新旧虚拟 dom 进行 diff + patch，最终使得视图最新，从而有效地解决了 Vue1.x 的 2 个主要缺点：

1. 每个依赖不再有自己独立的 watcher，而是都收集了同一个渲染 watcher，降低内存开销
2. 引入了虚拟 dom，使得跨平台得到了保证
