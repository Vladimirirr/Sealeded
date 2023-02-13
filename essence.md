<h1 style="font-size: 1cm; color: #a71d5d; text-shadow: 0px 6px 4px #ffb8a3; text-align: center;">
《我的前端学习笔记》
</h1>

# 前言

此文章是 articles 目录的重点节选，某章节的详细内容请在 articles 目录里寻找对应的章节目录。

# 目录

[TOC]

# 事件循环

The **EventLoop** model is essentially a **concurrency** model, which is **good at I/O-bound**.
A successful case is **Node.js** while its EventLoop model is a little difference with browser's.

一些注意点：

1. 如果在微任务执行期间又继续设定新的微任务，将导致页面卡顿，因为微任务执行期间必须要把当前的微任务队列执行清空而导致的
2. 如果在 RAF 任务执行期间又继续设定新的 RAF 任务，不会延迟页面渲染，新的 RAF 任务将在下一轮事件循环的 RAF 执行期间再执行

一个经典的题目：

```html
<div class="div1" id="div1">
  <div class="div2" id="div2"></div>
</div>
<script>
  div1.addEventListener('click', () => {
    queueMicrotask(() => console.log('micro in div1'))
    console.log('div1')
  })
  div2.addEventListener('click', () => {
    queueMicrotask(() => console.log('micro in div2'))
    console.log('div2')
  })
</script>
```

Question:

1. Use mouse click the div2, and answer the sequence of these logs
2. Use `div2.click` or `div2.dispatchEvent` method to simulate click on div2, and answer the sequence of these logs

Answer:

1. div2 -> micro in div2 -> div1 -> micro in div1
2. div2 -> div1 -> micro in div2 -> micro in div1

Why:

1. Click Event triggered by mouse meaning a user and truth event, which is a new real macrotask
2. Click Event triggered by any script meaning a non-user and truthless event, which is regarded as a **normal sync function call**

# 搭建私有 npm 仓库

基本工作方式：

1. 设置本机的 npm 源为内网地址：`npm config set registry http://172.31.0.10`
2. 搭建服务器，代理需要的 npm 请求（比如下载、上传）
3. 拦截下载请求，去内部的仓库数据库里查找是否存在此包，存在的话就返回
4. 不存在的话就就查询外网地址（比如 npm 的官方地址），下载和缓存此包再返回
5. 拦截上传请求，将包存放在内部数据库里

包的保存方式：

1. 文件系统：直接放在一个目录里
2. 数据库：保存二进制数据（对包压缩的结果）及其它们的索引信息，比如 MySQL 的各种 BLOB 类型变体
3. 其他存储方式：各种存储解决方案，比如 OSS

可用方案：

1. [verdaccio](https://github.com/verdaccio/verdaccio) 基于文件系统
2. [cnpmcore](https://github.com/cnpm/cnpmcore) 基于数据库的二进制保存方式
3. [nexus](https://www.sonatype.com/products/nexus-repository) 企业级的私有包管理仓库解决方案
4. [artifactory](https://jfrog.com/artifactory) 同上

# 路由与 URL

在 URL 上，你可以位于【一个文件】或【一个目录】，以`\`做区分，而在命令行模式下，你不能位于【一个文件】，永远只能位于【一个目录】，这是 URL 与命令行在路径处理上的最大区别，ReachRouter 使用命令行风格的路径在做路由导航，它忽视末尾的`\`，`\some\where\`被视作`\some\where`。

# axios 核心代码

```js
/**
 * 发送请求的核心axios方法，来自axios.0.19.2
 * @param {Object} config 请求的配置对象，与默认配置进行整合
 * @return {Promise} 返回一个promise对象表示此请求的结果
 */
Axios.prototype.request = function request(config) {
  // get the resolved config
  config = mergeConfig(this.defaults, config)

  // 初始化请求的promise链
  // dispatchRequest在浏览器里就是XMLHttpRequest方法的封装
  // 如果一个promise的then的fulfillment处理器是undefined或null，表示将结果继续传递下去
  // 如果一个promise的then的rejection处理器是undefined或null，表示将错误继续抛出
  var chain = [dispatchRequest, undefined]

  // 初始化表示请求结果的promise
  var promise = Promise.resolve(config)

  // 将此请求的全部请求拦截器（在请求前的中间件）插入到chain前面
  this.interceptors.request.forEach(function unshiftRequestInterceptors(
    interceptor
  ) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  // 将此请求的全部响应拦截器（在响应后的中间件）插入到chain后面
  this.interceptors.response.forEach(function pushResponseInterceptors(
    interceptor
  ) {
    chain.push(interceptor.fulfilled, interceptor.rejected)
  })

  // 激活整个promise链
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }
  // 核心！promise链！
  // return (
  //  Promise.resolve(config)
  //  .then(requestInterceptor_2_fulfillment, requestInterceptor_2_rejection)
  //  .then(requestInterceptor_1_fulfillment, requestInterceptor_1_rejection)
  //  .then(dispatchRequest, undefined)
  //  .then(responseInterceptor_1_fulfillment, responseInterceptor_1_rejection)
  //  .then(responseInterceptor_2_fulfillment, responseInterceptor_2_rejection)
  // )
  // 返回表示请求结果的promise

  return promise
}
```

# React

## 指导思想

基本公式：`view = render(state)`

渲染函数 render 根据目前状态 state 得出的视图 view 是 VNode 树结构，它与平台无关，每次更新都会生成一颗最新的 VNode 树，再照着新树修改旧树，使得旧树与新树相同，此过程叫做 patch。而 patch 由各自的平台渲染器（Web 平台渲染器 ReactDOM，移动平台渲染器 ReactNative，服务端平台渲染器 ReactServer）实现。

**心智模型**：组件 = **副作用受限**于函数执行上下文的**纯函数**

React 组件的每次渲染都是一次全新的副作用受限的函数调用，函数的结果是代表此组件目前视图的 VNode 树。

由于纯函数不能有任何副作用（包括它内部也不能使用其他带有副作用的函数），而 React 组件函数内部的 useState hook 每次得到的结果都可能不一样（还包括其他内置 Hooks），这将污染组件函数，因此，React 提出代数效应来消除这些在组件函数里的副作用。

总结：React 的想法很简单，一个由各种组件构成的 APP 对应一颗 VNode 树，一旦其中的一个组件使用触发更新，将导致 React 重新生成一颗最新的 VNode 树，同时对比这两颗新旧 VNode 树，将变化反馈到真实的 view 中，而在运行时对比两颗复杂的新旧树相当消耗性能，因此 React 提出著名的 concurrent with fiber 架构。

假设有一门 React 语言，它的伪代码：

```jsx
import SubView from '/src/components/SubView' // 子组件
import SomeFeature from '/src/hooks/SomeFeature' // 可复用的公共逻辑块

// 一个特殊的函数（组件函数），使用关键字Component定义，与普通函数Function相区分
Component Foo(props) => {
  // useState in React
  const age: ComponentStateEffect = @context.state(props.age || 22) // 定义一个仅在Foo组件函数上下文的副作用，下同
  // the useMemo in React or the computed in Vue
  const doubleAge: ComponentMemorizedEffect = @context.memorized(() => age * 2, [age])
  // useEffect in React
  const userEffect: ComponentUserEffect = @context.effect(() => {
    // do something when both component updated and the doubleAge changed
  }, [doubleAge])
  // 导入公共逻辑
  const [featureA, featureB] = SomeFeature(/* some parameters if needed */)
  // finally return the view a VNode Tree
  return <div class="Foo"><p>The age * 2 is {doubleAge}</p><SubView age={age}></SubView></div>
}

```

## 为什么 React 的 Hook 必须写顶层？

- 思想上：Hook 本质就是一个**受限于此组件函数执行上下文**的**副作用**
- 实现上：React 把一个组件的全部 Hook 记录到一条**单链表**上，接下来的每次重新执行其实都是**按顺序**地存取值

## Use concurrent to improve the performance of re-render

由于 React 一个组件的 state 变化，将导致它和它子组件全部重新渲染从而得到一颗最新的 VNode 树（单向数据流，从上而下传递），是 recursion 的渲染方式，需要消耗很多的内存和 CPU 资源。

To resolve the problem, the React Team determined to use concurrent mode replaced the traditional recursion mode, which means a high priority render task can interrupt a low priority render task, and the render system works on time slice mode.

And transform the Tree structure VNode to Linked-List structure [Fiber](https://github.com/acdlite/react-fiber-architecture).

## The concurrent apis in React 18

### `useTransition`钩子

Sign: `useTransition(): [isPending: Boolean, startTransition: Function]`

Description: It mark a update as a transition task(a low priority task), which can make UI still response during the expensive state transition.

### `useDeferredValue`钩子

Sign: `useDeferredValue(value: T): copiedValue: T`

Description: It receive a value and return its copy. Update to this value will be regarded as low priority. When an urgent task comes in, this hook will return the old value rendered last time to avoid triggering another unnecessary render during this urgent task. that is, delaying an unimportant render by returning a historical value when an urgent render comes in.

### `useSyncExternalStore`钩子

Sign: `useSyncExternalStore(store.subscribe: (listener) => Function, store.getSnapshot: () => T): T`

参数：

1. subscribe：让一个组件订阅一个状态
2. getSnapshot：获取订阅状态的当前快照，以便让 React 检查自上次渲染以来是否发生了变化，如果返回一个对象，请保证对象引用稳定，因为`{} !== {}`

向外部状态管理器提供的保证组件状态一致的接口。（由于 concurrent mode 导致的 break changing）

情景复现：一个渲染被打断成两段渲染，在第一段渲染的时候读取外部 A 值为 A1，期间由于高优先级渲染迫使打断当前的渲染，同时高优先级渲染还修改 A 值为 A2，继续第二段渲染渲染时又读取 A 值，最终，这次渲染得到的视图是撕裂的（同样都是渲染 A 值，一处是值 A1，另一处是值 A2）。

React 内部的状态都不存在撕裂问题，比如 useState、useContext。

举例：

```jsx
// 一个简单的外部状态管理器
const createStore = (init = []) => {
  const store = new Map(init)
  const listeners = new Set()
  const notify = () => listeners.forEach((i) => i())
  return {
    __store: store,
    __listeners: listeners,
    set(id, data) {
      store.set(id, data)
      notify()
    },
    del(id) {
      store.delete(id)
      notify()
    },
    subscribe(listener) {
      // React将传入一个listener，当状态被修改时要触发这些listeners从而告诉React需要重新获取最新的状态
      // listener = () => {
      //   if (checkIfSnapshotChanged()) { // 当一个listener被触发时，它将检测当前snapshot的值与上一次是否相同（使用`Object.is`）
      //     forceStoreRerender()
      //   }
      // }
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return store // 始终返回闭包里的store，即引用稳定
    },
  }
}
const myStore = createStore([['foo', 12n]])

// 一个简单的封装
const useMyStore = (name) => {
  const value = useSyncExternalStore(
    myStore.subscribe,
    useCallback(() => myStore.getSnapshot().get(name), [name])
  )
  const updateValue = (newValue) => myStore.set(name, newValue) // myStore的set方法将触发全部的listeners，从而让React获取状态的最新值
  return [value, updateValue]
}
```

### `useInsertionEffect`钩子

Sign: `useInsertionEffect(effect: Function): void`

在`useLayoutEffect`前，使得与样式相关的工具能正确地注入样式（比如注入`<style>`到`<head>`里），不能在此期间安排更新和使用 ref。

举例：

```jsx
const useClassName = (cssClassName) => {
  useInsertionEffect(() => {
    if (!isInserted.has(cssClassName)) {
      isInserted.add(cssClassName)
      document.head.appendChild(getStylesbyClassName(cssClassName))
    }
  })
  return cssClassName
}
const Foo = () => {
  const className = useClassName(cssClassName)
  return <div className={className}>Hi Foo</div>
}
```

### `React.lazy`方法

Sign: `React.lazy(() => import('dynamicComponent.jsx'))`

得到一个 React 内置的 Lazy 组件，Lazy 组件将在**整个 App 的组件树**里找到与它最近的 Suspense 组件，如果 Lazy 组件最终都没找到对应的 Suspense 组件，那么整个 App 将被延迟渲染直到 Lazy 组件可用。

### `React.Suspense`组件

指定其中的子组件树还没初始化完成时的加载器。

### React18 多个 UI 版本共存的情况

正在进行一个普通渲染，这时，一个高优先级渲染抢占普通渲染的渲染权，那么，React 就要维持两份 UI 版本（普通渲染和高优先级渲染各自对应的版本），需要注意的是，每份 UI 版本只有完全渲染结束 React 才会最终把它 commit 到视图，防止视图撕裂。

# Vue

## 指导思想

基本公式：`view = render(state)` same with React

**心智模型**：组件 = 使用了**依赖跟踪**技术的**对象**

Vue2 的组件就是一个配置对象，使用`Vue.extend`方法将此组件从对象转成组件构造函数，最终使用`new`构造组件的实例。

Vue3 的组件依旧是一个配置对象，只不过被组合式语法隐藏，使用`setup`函数暴露出来的对象就是一个配置对象，简单地说，Vue3 就是使用 JavaScript 来描述配置对象，这就好比 grunt(Vue2) 与 gulp(Vue3)。

由于全部的依赖（数据）都是响应式的（或者说都是可被观察的），依赖本身可以自由地变化（即 mutable state，与 React 的 immutable state 相对），因此只需要初始化这些依赖一次，再将它们保存在某处（比如实例对象上(Vue2)或闭包里面(Vue3)），修改依赖就能触发其对应的副作用（比如重新渲染）。

Vue2 把依赖及与依赖相关的行为（比如 computed、watch、lifecycle、renderFunction）都定义在组件的配置对象上，**基于对象**，复用手段只有不好驾驭的混入（混入是一个很经典的基于对象的复用技术，只不过很容易出错）。

Vue3 则定义在组件配置对象的 setup 函数的闭包里，**基于函数**，复用手段就相当灵活，任何函数复用的手段都能适用，而且因为函数作用域的存在，不会出现同名标识符覆盖的问题。

总结：组件的依赖收集组件的渲染函数，此时**依赖就是此渲染函数的订阅者**，而**渲染函数就是这些依赖的观察者**，当依赖发生了改变，将触发此依赖收集的渲染函数，使得组件发生更新。将依赖收集的东西扩展，依赖不仅可以收集渲染函数还能收集其他各种观察者，比如 computed 或 watch，依赖的观察者也叫做依赖的副作用，因为每次依赖改变时观察者都将被执行。

假设有一门 Vue 语言，它的伪代码：

```jsx
import SubView from '/src/components/SubView' // 子组件
import SomeFeature from '/src/hooks/SomeFeature' // 可复用的公共逻辑块

// 一个对象，表示 Vue 组件就是一个对象，而非 React 的函数，Vue3 的 setup 函数只是让 Vue 组件看上去像函数一样而已
Component Foo(props) = { // props 是对象的内置值
  name = 'nat' // 定义一个普通值，不参与组件的响应式系统
  track age = 22 // 定义一个依赖，参与组件的响应式系统
  computed doubleAge = this.age * 2 // 定义一个 computed，依赖于 age，也叫做 age 依赖的 effect
  watch age(){
    // 定义一个 watch effect，依赖于 age，也叫做 age 依赖的 effect
    // do something
  }
  method addAge(){
    return ++this.age // 访问和修改
  }
  lifecycle mounted(){
    // do something
  }
  component SubView // 引入一个组件
  include [track featureA, compouted featureB] = SomeFeature(/* pass props or not */) // 导入公共逻辑（关键字 include）
  render(){
    // 组件的渲染函数，依赖于 age，也叫做 age 依赖的 effect
    // 可以从 template 模板语法里编译而来
    return <b onClick={addAge}>{age}</b>
  }
}
```

## 响应式系统与依赖收集

Vue2 using `Object.defineProperty` function to transform all properties of an object into corresponding getter and setter in order to implement property **interception** to make reactive system.

Vue3 using `Proxy` technology to **proxy** an object to make reactive system.

Because Vue2 has a bit of hack in its implementation, there are some edge problems that need special treatment:

1. Unable to respond to set and delete a key on an object on running time, so the alternates are `$set` and `$del` functions
2. The Array needs to hijack its prototype to realize responsiveness
3. The too complex object will cause too many getters and setters, resulting in serious memory consumption
4. Vue2 needs to fully make a data object reactive first(convert all its properties into corresponding getters and setters), while Vue3 is lazy, and just makes a dependency reactive only when it need to be
5. ...

## Template and JSX

Template 语法相比 JSX，它的灵活度低，但能进行静态优化（即 AOT(Ahead Of Time)，与 React 的 JIT(Just In Time) 相对），本质依旧是一个 render 函数。

### The static optimized on Template

#### Test Template

```html
<div>
  <div><span>hello Vue</span></div>
  <p>{{ message }}</p>
</div>
```

#### Vue optimization

当一个模板存在静态节点时，Vue2 codegen 将生成：

```js
function render() {
  with (this) {
    return _c('div', [
      // _c = createElement
      _m(0), // _m = renderStatic
      _c('p', [_v(_s(message))]), // _v = createTextVNode _s = toString
    ])
  }
}
function getStaticRender(index) {
  const staticRenders = [
    function () {
      with (this) {
        return _c('div', [_c('span', [_v('hello vue')])])
      }
    },
  ]
  return staticRenders[index]
}
function renderStatic(index) {
  if (!this.__renderStaticCache[index]) {
    this.__renderStaticCache[index] = getStaticRender(index).call(this)
    this.__renderStaticCache[index].isStatic = true // skip diffing the VNode and just reuse the VNode and its dom on update
  }
  return this.__renderStaticCache[index]
}
```

## `key`的作用（React 同样适用）

key 标识是否要复用当前的元素或组件。

当 key 附在 dom 元素上时，如果两次 diff 的 key 相同，就保留旧的 dom 元素（不再使用 document.createElement 新建此 dom），只对此元素的 attributes、listeners 和子元素做更新。

当 key 附在自定义组件上时，如果两次 diff 的 key 相同，就保留旧的组件实例（不再新建新的组件实例），再进入组件的 prepatch 钩子。

## SSR 与注水

SSR 就是获取 App 某一个时刻的某一个状态的视图快照，一次性或流式交付此快照的文本。

# Hook 与 组合式语法

Vue3 的组合式语法借鉴自 React 的 Hook 语法，都是**一种更合理地组织组件内的数据与行为以及组件公共逻辑复用的编程方式**。

Hook 本意是将一些**特殊功能**（普通函数不具备的功能，比如有状态的数据、渲染钩子、等等）**钩入**到函数组件里，**钩入** -> 导入 -> 融合 -> **组合**，衍生到：将自定义 Hook 暴露的功能【钩入、组合】到组件里，故根本上`Hook === Composition`，只是不同的叫法。

而广义上，Hook **就是一个有状态的函数**，它能在任何能使用函数的地方使用，**或者说 Hook 将状态赋能给普通函数**。

自定义 Hook 对组件来说就像 C 语言的`#include`一样，将一个 Hook 的【数据和逻辑】导入（组合）到组件，是平铺的代码复用方式。

## Hook 解决的问题

以前的基于 mixin and HOC 的复用方式不具备良好的扩展性：

1. 来源模糊：不能快速定位谁的 mixin 或 HOC 注入了此功能 -> 能快速定位谁提供了此功能
2. 命名冲突：不同 mixin 或 HOC 可能存在相同的标识符 -> 能自定义功能需要的标识符
3. 嵌套过深：HOC 的嵌套 -> 平铺而非嵌套
4. 关注分离：相同的逻辑可能被拆离到不同的钩子里（比如，设定计时器和清除计时器） -> 相同逻辑能在一起

# 微前端

Techniques, strategies and recipes for building a modern web app with multiple teams that can ship features independently.

微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：

1. 技术栈无关
   主框架不限制接入的子应用（即微应用）的技术栈，微应用具备完全自主权。

2. 独立开发与部署
   微应用是独立的仓库，前后端可独立开发，每次发版完可以通知主框架同步更新。

3. 增量升级或重构
   在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段。

4. 独立的运行时环境
   主框架会对每个微应用分配独立的全局运行时环境（独立且隔离的 全局对象 window、CSS 样式、JavaScript 脚本、等等）。

# CSS `nth-child` selector

- `:nth-child(n)`：找到它修饰的元素的全部同级兄弟元素，选取其中的第 n 个元素，**注意：n 指定的元素与修饰的元素非一个类型将匹配失败**
- `:nth-last-child(n)`：同上，只不过 n 倒数选取
- `:nth-of-type(n)`：找到它修饰的元素的全部同级的同类型的兄弟元素，选取其中的第 n 个元素
- `:nth-last-of-type(n)`：同上，只不过 n 倒数选取
- `:first-child` === `:nth-child(1)`
- `:last-child` === `:nth-last-child(1)`
- `:first-of-type` === `:nth-of-type(1)`
- `:last-of-type` === `:nth-last-of-type(1)`

# Git

## merge

### fast-forward merge

直接将 main 的指针指向 feature。

### squash merge

传统的 merge commit 存在两个父 commit 引用，使用 squash merge 方式的 merge commit 只存在一个指向 main 的父 commit 引用。

### cherry-pick

Apply one or more commits on current branch's HEAD.

### rebase

自动化的 cherry-pick 操作，使得非线性的传统 merge 变地线性化。
提交历史看上去，feature 就好像直接从 main 开发的一样，也就是变基，即 rebase。

## recover

### reset

1. `reset --soft commit` only reset current worktree
2. `reset --mixed commit` reset both worktree and stage
3. `reset --hard commit` reset all including worktree, stage and library

### revert

**重做**某一次有错误的提交，历史记录永远是前进的，不会像`reset --hard`一样丢失历史提交记录。

`git revert commit`：对当前工作区重做此提交，如果重做操作和当前工作区文件没有冲突将自动提交一个重做 commit，否则需要解决冲突。

### restore

还原文件：`git restore [--worktree] [--staged] [--source fromSource] [files | .]`

- --worktree | -W：将文件还原到工作区，默认选项
- --staged | -S：将文件还原到暂存区
- --source | -s：指定还原文件来源，可选的值有[commitHash, branchName, tagName]

  1. 如果没有指定 source，但是指定了 staged，就从 HEAD 还原暂存区
  2. 如果没有指定 source，也没有指定 staged，就从暂存区还原到工作区

- files：还原文件的列表（空格分隔），或一个 glob 表达式，或一个`.`表示全部

### commit --amend

让新提交的 commit 替换掉上一次提交的 commit（比如上一次 commit 有错误，但是又不想保留上一次的 commit 记录）。

## How works

- 分布式：Git 基于分布式的思想，每个 Git 仓库都是对等体，不像 SVN 的基于集中式思想
- 快照：每一次的提交都是创建变化的文件集合的快照，不像 SVN 的基于文件变化差量的提交

`git add files...`：将工作区的文件放入暂存区（即将被提交的区域）
`git commit -m "comment"`：对当前暂存区生成一个 version 快照（一个 commit object）从而提交到 library

# JavaScript

## 闭包

词法作用域和函数一等公民导致的副作用，闭包是一个**函数**及其引用的父级**作用域**（一个或多个，这些作用域被引擎存活）。
由于词法作用域，闭包在书写函数代码时就被创建。

## Promise

Promise 目的：使异步任务**可控制可信任**且**高效地链式组合**的技术

### 为什么 Promise 本身不能取消或不支持取消？

答：Promise 表示的是【给你一个东西，不过这个东西当前还没有值，但是承诺将来一定会有一个值（可能成功可能失败）】，也就是说一个东西已经给到你了，就不存在取不取消的概念了，即便是取消，也是取消【得到这个值的**过程**】，而不是取消这个值本身，而取消【得到的过程】将导致该 Promise 永远不会被决议，再说，如果一个 Promise 被取消，那么它的父 Promise 要取消吗？

## Generator

一个可以被暂停的函数、一个可以被编程的迭代器，JavaScript 里协程的实现。

## How `==` works

`x == y`的行为：

1. x 和 y 是同类型
   1. x 是 undefined，返回 true
   2. x 是 null，返回 true
   3. x 是数字
      1. x 是 NaN，返回 false
      2. y 是 NaN，返回 false
      3. x 和 y 相等，返回 true
      4. x 是 +0，y 是 -0，返回 true
      5. x 是 -0，y 是 +0，返回 true
   4. x 是字符串，序列和 y 完全相等，返回 true
   5. x 是布尔值，y 是它的同类型，返回 true
   6. x 和 y 都指向一个对象，返回 true
2. x 是 null，y 是 undefined，返回 true
3. x 是 undefined，y 是 null，返回 true
4. x 是数字，y 是字符串，返回 x == toNumber(y)
5. x 是字符串，y 是数字，返回 toNumber(x) == y
6. **x 是布尔值，返回 toNumber(x) == y**
7. **y 是布尔值，返回 x == toNumber(y)**
8. x 是字符串或数字，y 是对象，返回 x == toPrimitive(y)
9. x 是对象，y 是字符串或数字，返回 toPrimitive(x) == y
10. 返回 false

备注 1：+0 即 0

备注 2：此处 toPrimitive 的行为

1. 对象是否存在 valueOf 方法，存在的话，返回其执行结果
2. 对象是否存在 toString 方法，存在的话，返回其执行结果
3. 报错

# How uniapp works on weixin miniprogram

不管是 Vue2 还是 Vue3 的 uniapp，它们的基本思想只有：

1. Vue 只维持数据以及响应数据的变化
2. 使用 setData 将数据改变的最小量发送出去，让小程序自己的渲染器进行实际的 diff+patch
3. 代理小程序的各种事件到对应的 Vue 定义的方法

故，改造 Vue2 和 Vue3 最终使得：

数据改变 -> 触发更新 -> 进入 diff -> 找出最小的数据改变量 -> 进入 patch（patch 已经被改写，只剩下 setData 相关的操作） -> 执行微信小程序的 setData

uniapp's dependencies for using Vue2:

1. `@dcloudio/uni-mp-vue` the modified version of Vue2
2. `@dcloudio/uni-mp-weixin` the runtime proxy system
3. `@dcloudio/uni-template-compiler` the template compiler forked from vue-template-compiler

# WebAssembly

WebAssembly is a low-level assembly-like language that can be compiled into a compact binary format like bytecode of Java, which runs on modern JavaScript engines directly, and also provides languages such as `C/C++`, `Golang` and `Rust` with a cross-compilation target so that they can run on the web.
WebAssembly is designed to complement and run alongside with JavaScript, and they communicate easily.

# WebWorker - DedicatedWorker

创建一个 JavaScript 线程。线程间使用结构化克隆方法传递数据。

# WeakMap and WeakSet

WeakMap 仅接收对象作为键。对象被弱持有，意味着如果对象本身被垃圾回收掉，那么在 WeakMap 中的记录也会被移除。这是代码层面观察不到的。
同理，WeakSet 只是弱持有它的值。

由于随时可能给 GC 回收，故不能得到它当前的 items 长度，也不能迭代它。

# 一个简单的模板引擎的设计 - underscore#template

```js
var userListView = `
  <ol>
  <%for ( let i = 0; i < users.length; i++ ){%>
    <li>
      <a href="<%=users[i].url%>">
        <%=users[i].name%>
        is
        <%=users[i].age%>
        years old.
      </a>
    </li>
  <% } %>
  </ol>
  <b>above total: <%= users.length %></b>
`
var userListData = [
  { name: 'nat', age: 18, url: 'http://localhost:3000/nat' },
  { name: 'jack', age: 22, url: 'http://localhost:3000/jack' },
]
function templateSimple(str) {
  var head = "var p = []; with(data){ p.push('" // the begin push
  var body = str
    .replace(/[\r\n]/g, ' ') // 防止换行导致的 parse failed
    .replace(/<%=(.+?)%>/g, "');p.push($1);p.push('") // 替换表达式，它是<%和%>的特殊例子
    // 下面两行顺序无关紧要，因为被替换的字符串本身不存在交集
    .replace(/%>/g, "p.push('")
    .replace(/<%/g, "');")
  var tail = "');} return p.join('');" // the end push
  return new Function('data', head + body + tail)
}
function template(str) {
  var [interpolate, evaluate] = [/<%=(.+?)%>/g, /<%(.+?)%>/g] // interpolate插值 和 evaluate语句
  var matcher = new RegExp(`${interpolate.source}|${evaluate.source}|$`, 'g')
  var index = 0
  var p = '' // position
  var escapes = {
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
    '\\': '\\',
    "'": "'",
  }
  var escapeRegexp = /[\n\r\u2028\u2029\\']/g
  var escapeChar = (match) => '\\' + escapes[match]
  str.replace(matcher, function (match, interpolate, evaluate, offset) {
    // 正则对象的lastIndex属性只有在开启g标志且在regexp.exec和regexp.test方法有效，指定下次匹配的位置，可读可写，如果方法没找到任何匹配就设0，而在这里，用index来模拟lastIndex的作用
    // 需要注意，matcher最后的`$`目的是匹配字符串结束位置，从而得到结束位置的offset，当`$`发生匹配时，match是空字符串，因为`$`是零宽断言，确实发生匹配但是没有匹配内容，故返回空字符串

    // 使用slice方法取子字符串的副本，确保str保持不变
    // 将本次匹配到的<%=xxx%>或<%xxx%>前面的文本进行特殊字符转义
    p += str.slice(index, offset).replace(escapeRegexp, escapeChar)

    // 记录下次replace匹配的 begin position
    index = offset + match.length

    // 进行替换
    // 这里巧妙利用正则表达式的 捕获分组 和 或运算
    // `/part1(group1)|part2(group2)|part3/g`这是上面matcher的结构，由于或的逻辑关系，只要三者之一匹配成功，整个正则表达式匹配成功，就会执行replace的回调函数，由于group1和group2必然要存在（因为它们写在正则表达式里面），那么其中某一个就得是undefined，如果是part3发生的匹配，那么group1和group2都是undefined
    if (interpolate) {
      p += `' + (${interpolate} || \'\') + '`
    } else if (evaluate) {
      p += `'; ${evaluate} p+='`
    }

    // 把匹配到的字符串原封不动地还回去，确保str保持不变
    return match
  })
  // 给p拼上头部和尾部的代码
  p = "var p = ''; with(data){ p+='" + p + "';} return p;"
  // 可以在`new Function`包上try-catch语句，避免创建函数失败
  return new Function('data', p)
}
```

# 长连接技术

1. 长轮询 use setTimeout or setInterval，the best practices is using sequence request sent by setTimeout one by one in order to avoid appearing the race condition
2. 长轮询 client send a request to server and server hang it up, and response the request when data is prepared in server side, and back and forth
3. SSE, Server Send Event, only server can send message to client, only supporting text format
4. websocket, a full duplex communication technique, supporting binary and text format
