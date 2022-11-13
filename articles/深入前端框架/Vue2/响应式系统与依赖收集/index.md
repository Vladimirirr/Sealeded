# 响应式系统与依赖收集

## 基本思想

将一个普通数据对象的全部键值对使用 Object.defineProperty 重写为对应 getter 和 setter 的存取器。

### getter 与依赖收集

需要让一个值在它变化时能响应一个行为，需要将此值转换成响应式的值，再让此行为携带着此值去执行，当行为读取此值时，就会触发此值的 getter，而 getter 将把此行为保存到此值对应的行为列表里，意味着此行为订阅了此值的变化。

一个行为就是一个副作用（比如更新视图），所以，行为叫做副作用 effect。

再 Vue 里，副作用 effect 在执行时读取一个值的过程叫做`touch a property`。

### setter 与重新执行（即更新）

当值变化时，对应的 setter 就会执行，它会将此值 effect 列表里的全部 effect 执行，从而更新需要更新的东西。

### 简单的代码实现

```ts
// Vue中的currentEffect保存在一个数组里，这是因为父子组件的存在，当执行子组件的依赖收集时，将子组件的渲染函数入栈，子组件结束就将子组件的渲染函数出栈，继续回到父组件，此时依旧还能找到父组件当前的渲染函数（即currentEffect）
// 此处简单处理，只做演示
let currentEffect: Function | null = null

/**
 * effect 副作用
 * data 响应式化的数据
 */
const autorun = (effect: Function, data: Object) => {
  currentEffect = effect
  effect(data)
  currentEffect = null
}

/**
 * data 需要被响应式化的对象
 */
const reactify = (data: Object) => {
  // 此处不考虑嵌套的对象以及数组，只做简单的演示，具体对嵌套对象以及数组的响应式化和它们的边缘情况处理，参见我写的Rue框架的响应式化的代码（有详细的注释）
  Object.keys(data).forEach((key) => {
    // 此匿名函数就充当了下面getter和setter的闭包存储区
    const dependences = new Set() // 订阅此数据的全部订阅者，即effect
    let value = data[key] // 数据的值
    data.defineProperty(data, key, {
      getter(key) {
        if (currentEffect) {
          // 如果存在currentEffect，表示此值需要被一个effect依赖
          // Set集合能有效地避免收集相同的effect
          dependences.add(currentEffect)
        }
        return value
      },
      setter(key, newValue) {
        if (value !== newValue) {
          // 只有值改变了才进行更新，比较算法不唯一，还可以使用`Object.is`方法
          value = newValue
          // 执行全部的effect
          dependences.forEach((effect) => effect())
        }
        return value
      },
    })
  })
}

// 示例
// 数据对象
const userInfo = reactify({
  name: 'jack',
  age: '22',
})

// 此副作用很简单，向控制台输出当前的userInfo的信息
const userInfoChangeEffect = (userInfo) => {
  console.log(`Hello, I am ${userInfo.name} and ${userInfo.age} years old.`)
}

// 进行依赖收集
autorun(userInfoChangeEffect, userInfo)

// 验证数据对象变化是否能自动执行收集的副作用
userInfo.age++ // 控制台重新输出userInfo信息
```

## Vue 响应式系统的重点概念

- 被用到的数据就是依赖（比如 Vue 组件的模板使用到的 data 里的数据、自定义 watcher 的键路径），在依赖的 getter 中收集它的订阅者（也就是观察者，即 Vue 的 watcher 对象，而每个 watcher 对象带有自己的副作用，比如 renderWatcher 的副作用就是更新组件的视图），在依赖的 setter 中执行它已经收集的订阅者（执行订阅者就是执行订阅者的副作用）
- 数据变化时（依赖变化时），对应依赖的 setter 就通知它 dep（由 Dep 类实例化过来，管理此依赖的全部订阅者），接着 dep 执行它全部的 watcher
- 当前激活的 watcher 把自己放到全局的一个位置，以便被需要它的依赖收集

## 响应式化的基本流程

observe（响应式化一个数据对象） -> Observer（遍历此对象） -> defineReactive（劫持此对象的每个数据） -> observe（递归子对象） ...

## renderWatcher

Vue1.x 的响应式更新以 dom 节点为单位进行更新，在渲染模板时遇到插值表达式或指令就会实例化对应的 watcher，这是一种细粒度的更新，而 Vue2.x 以组件为单位进行更新，传入 watcher 的不再是表达式字符串而是组件对应的渲染函数，这是一种中粒度的更新。

Vue1.x 的细颗粒更新的主要缺点：

1. 无法支撑大型应用，因为依赖越多需要的 watcher 实例越多，还包括其他用户自定义的 watcher（watch 和 computed），造成大量的内存消耗
2. 由于操作的都是 dom 对象，也仅支持 web 端

在 Vue2.x 中，更新以组件为单位，一个组件只有一个渲染 watcher，每个依赖的 dep 都收集了此渲染 watcher，此渲染 watcher 产生此组件的虚拟 dom，在组件内对新旧虚拟 dom 进行 diff + patch，最终使得视图最新，从而有效地解决了 Vue1.x 的 2 个主要缺点：

1. 每个依赖不再有自己独立的 watcher，而是都收集了同一个渲染 watcher，降低内存开销
2. 引入了虚拟 dom，使得跨平台得到了保证
