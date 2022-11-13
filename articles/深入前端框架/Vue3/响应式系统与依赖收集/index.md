# Vue3 基于 Proxy 的响应式基础思想

## 正文

### 指导思想

代理一个数据对象，当依赖需要收集它对应的副作用 effect 时，将此副作用挂载到全局的`currentEffect`，当读取此依赖时，被陷阱函数`get`捕捉到，将`currentEffect`保存到此依赖的 effect 列表里，当依赖改变了（被赋新的值），被陷阱函数`set`捕捉到，将此依赖的 effect 列表全量执行，从而保证依赖派生的内容最新。

基本思想和 Vue2 相同，只不过 Vue2 使用 ES5 的`Object.defineProperty`而 Vue3 使用 ES6 的`new Proxy`。

Vue3 依赖收集基本关系图：
![alt theBasicOfHowVue3ReactionWorks](./imgs/the%20basic%20of%20how%20vue3%20reaction%20works.jpg)

> from https://www.vuemastery.com/courses/vue-3-reactivity/vue3-reactivity - P1

### 基础实现

参见：[test.html](./test.html)

## 与 Vue2 对比

1. 提高了响应式化的性能，一个结构复杂的数据对象在 Vue2 的响应式系统下会创造很多的 getter 和 setter 从而需要很多额外的内存开销，而 Proxy 不存在此问题
2. 数组的响应式化一直是 Vue2 的一个硬伤，因此 Vue2 巧妙地采用劫持数组的原生方法让数组响应式化，而 Proxy 不存在此问题
3. Vue2 的响应式系统不能监听一个对象属性的添加和删除，而 Proxy 不存在此问题
4. Proxy 是 ES6 的语法特性，不能被 polyfill，因此 Vue3 不再支持 IE（让它沉睡吧）
5. Vue2 的基于 defineProperty 的响应式化叫做数据劫持，Vue3 的基于 Proxy 的响应式化叫做数据代理，其实都是同一个目的
6. Vue2 需要预先全量地响应式化一个数据对象（把它的全部属性转成对应 getter 和 setter），而 Vue3 是惰性的，只有需要用到一个依赖的时候才对此依赖进行响应式化
7. ...
