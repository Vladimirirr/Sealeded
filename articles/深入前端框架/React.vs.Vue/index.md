# React 和 Vue 的基本思想

## 两者的基本思想

两者的基本思想都是：`view = render(state)`

组件的渲染函数`render`根据组件当前状态`state`得出组件最新的视图`view`。

渲染函数得出的视图是 VNode 树结构，它与平台无关，每次更新都会生成一颗最新的 VNode 树，再照着新树修改旧树，最终旧树与新树相同，此过程就是 patch。而 patch 过程由各自的平台渲染器（以 React 举例，React 在 Web 平台的渲染器是 ReactDOM，在移动平台的渲染器是 ReactNative，在服务端平台的渲染器是 ReactServer）实现。

一个组件就是封装了结构`VNode`、行为`JavaScript`和样式`CSS`的对象或函数，由`JavaScript`维持着组件当前的状态并控制着组件当前的结构和样式。

## 框架与心智模型(mental model)

框架 = 基于编程语言的 (DSL + API) 构成的特定语法

### Vue

心智模型：基于**依赖跟踪**的**面向对象**模型

Vue2 的组件就是一个配置对象，Vue 内部使用`mergeOptions`方法让此配置对象继承 Vue 构造器（根组件类）的内置数据，再使用`Vue.extend`方法将此组件从对象转成组件构造函数，最终使用`new`构造组件的实例。

Vue3 的组件其实依旧是一个配置对象，只不过被组合式语法隐藏起来了，使用`setup`方法（包括`setup`语法糖）暴露出来的对象其实就是一个配置对象，简单地说，Vue3 就是使用 JavaScript 来描述配置对象，这就好比 grunt(Vue2) 与 gulp(Vue3)，本质都是一样的东西（都是脚本自动化工具）。

因为所有的依赖都是响应式的（或者说都是可被观察的），依赖本身可以自由变化（即 mutable state），所以它们只需要初始化一次即可，之后将它们保存在某处（比如闭包里面(Vue3)或实例上(Vue2)），修改依赖就能触发对应的副作用（比如重新渲染）。

Vue2 把依赖以及与依赖相关的操作（比如 methods、lilecycle）和副作用（比如 computed、watch、renderFunction）都定义在组件配置对象上，它们与组件就好像是**强绑定关系**，基于这个准则，复用手段只有不好驾驭的混入（混入是一个很经典的复用技术，只不过它的上手难度很高），当然可以不遵守此准则，把一个组件的依赖传递到其他组件，以收集其他组件的副作用，但需要 hack 到 Vue2 内部。

而 Vue3 则直接把依赖的级别提升，**依赖可以不再具体属于一个组件（弱绑定关系）**，一个依赖可以单独定义而又在多个组件（的副作用）里使用，只需要选择一个合适的响应式语法（ref 或 reactive 或 computed）定义好一个依赖，每次组件的`setup`方法执行时它里面的依赖都会收集它需要的当前的组件的副作用，**自定义 Hook 就是独立于多个组件但是又收集了多个组件的副作用（比如 computed、watch、watchEffect、renderFunction）的依赖与它内部的副作用的集合**。

假设有一门 Vue 语言，它的伪代码：

```jsx
/**
 * props: the properties from its parent
 * emit: a event trigger function to its parent that may carry some data
 */
Component Foo(props, emit) = { // 强调是一个对象
  reactive age = 22 // 定义一个响应式类型（使用关键字reactive）的依赖，OOP里的数据
  computed doubleAge = age * 2 // 定义一个computed（使用关键字computed），依赖于age，也叫做age依赖的副作用
  watch doubleAge = (){
    // 定义一个副作用函数，依赖于age，也叫做age依赖的副作用
    // do something
  }
  addAge(){ // OOP里的方法
    return ++age // 直接访问
  }
  lifecycle mounted(){
    // do something
  }
  render(){
    // 组件的渲染函数，依赖于age，也叫做age依赖的副作用
    return <b onClick={addAge}>{age}</b>
  }
}
```

### React

由于 React15 的心智模型与 Vue2 一样，下面只讨论 React Hook 时代的心智模型，React 的 Hook 必将代替 React 的 Class（因为 React16 以后，React 从底层开始彻底走向函数式风格）。

心智模型：**副作用受限**于函数执行上下文的**纯函数**（使用代数效应抵消副作用带来的心智负担）

React 组件的每次渲染都是一次函数调用，更详细地说，是一次副作用受控（基于各种内置 Hook）的函数调用。

因为纯函数是不能有任何副作用的（包括它内部也不能使用其他带有副作用的函数），也必须是幂等的（也叫引用透明），这也保证每次纯函数执行的结果严格一致，而 React 组件函数内部的 useState 每次得到的结果不一样，这就污染了组件函数，因此，React 提出了代数效应来解决这些在组件函数里的副作用。

假设有一门 React 语言，它的伪代码：

```jsx
Component Foo(props) => {
  @context.state('age') => { // 定义一个仅在Foo组件上下文的副作用，即useState
    // some prepared operations
    return props.age || 22
  }
  @context.useMemorized('doubleAge', ['age']) => {
    const originAge = @context.get('age')
    return originAge * 2
  }
  @context.useEffect('effect11', ['doubleAge']) => { // useEffect的名字可选
    // do something
  }
  return (ctx) => { // render是一个纯函数，副作用都被抽离到上面单独定义了
    return <b>{ ctx.get('doubleAge') }</b>
  }
}

```

从思想方向解释了为什么 React 的 Hook 不允许嵌套，因为每个 Hook 本质都是一个受限于此组件函数执行上下文的副作用。

## React 的基本工作思想

### 基本思想

React 每次的重新渲染都从状态发生改变的组件开始，对此组件的新旧 VNode 进行 patch，从而保证组件树一直最新。

### JSX 语法

React 使用 JSX(JavaScript XML) 这个特定的 DSL 来描述 VNode，它是 JavaScript 的子集：

```jsx
const name = 'nat'
// 花括号里面的内容将被视作JavaScript表达式
const greeting = <p style={{ color: 'red' }}>hello {name}</p>
```

JSX 的本质是 JavaScript 表达式，上述的 JSX 经过编译得到如下的 JavaScript 代码：

```javascript
const { createElement: h } = React
// 社区习惯性地将createElement（创建VNode的函数）称为h函数，因为VNode的思想最早来源于hyperscript（地址：https://github.com/hyperhype/hyperscript）
const name = 'nat'
const greeting = h(
  'p',
  {
    style: {
      color: 'red',
    },
  },
  `hello ${name}`
)
```

组件拥有并维持着它的状态，如下：

```jsx
const { Component } = React
class ListItem extends Component {
  constructor(props) {
    super(props) // 子类必须调用父类构造
  }
  render() {
    const { title, content } = this.props
    return (
      <template>
        <p>
          {title}：{content}
        </p>
      </template>
    )
  }
}
class List extends Component {
  constructor(props) {
    super(props)
    this.state = {} // 创建组件的状态
    this.state.dataSource = []
    this.getDataSource = function (event) {
      // mock
      fetch(Date.now()).then((result) =>
        this.setState({ dataSource: result?.data ?? [] })
      )
    }.bind(this) // 事件处理器必须要绑定组件本身this，因为获取和更新状态都要从组件本身着手
    this.clearDataSource = () => this.setState({ dataSource: [] }) // 也可以使用箭头函数解决this绑定的问题
  }
  render() {
    // 返回本组件当前最新的视图，即VNode
    return (
      <template>
        <h1>here are the lists</h1>
        <div>
          <button onClick={this.getDataSource}>click and get data</button>
        </div>
        {/* 由于JSX本质上就是调用h函数的JavaScript表达式，故而可以使用JavaScript表达式的全部特性，相当灵活 */}
        {this.state.dataSource.map(({ title, content }) => (
          {/* 向子组件传递状态（由表达式计算而来），表达式可以是任何合法的JavaScript表达式，甚至可以传入 VNode 或 render函数 */}
          {/* 向子组件传递父组件的方法，从而达到在子组件修改父组件状态的能力（闭包特性） */}
          <ListItem title={title} content={content} clear={this.clearDataSource} />
        ))}
      </template>
    )
  }
  componentDidMount() {
    // 组件挂载完成，开始获取数据
    this.getDataSource(Date.now())
  }
}
```

上述这种使用**类**的方式描述组件很形象，组件拥有并维护着自己的状态，组件拥有改变状态的方法，组件通过 render 函数输出组件当前状态的视图，但是存在一些缺陷：

1. 面向类、对象的 OOP 编程思想强调的是：封装、继承、多态，而组件只是很纯粹的描述当前状态下的视图，通常不存在多层继承，也用不到多态，仅仅用到了封装
2. JavaScript 归根到底是原型继承，ES6 的 class 也只是语法糖（当然`ES2022`推出的私有字段已不再是语法糖），JavaScript 更适合走函数式编程的风格
3. 在使用类的时候会经常用到 this 关键字，而 this 关键字在 JavaScript 很具有误导性，它与传统 Java 的 this 截然不同
4. 大量的类实例也需要大量的内存开销
5. 使用 高阶组件 HOC(High Order Component) 或 混入 的方式来复用组件的公共逻辑的维护性很差
6. ...

所以从 React 16 版本开始引入了 hooks 的概念，使用函数代替类来描述组件，开始走向函数式编程：

```jsx
// 由于函数没有实例，从而引入 hooks，使得函数变得有状态
// 从广义来讲，hook 本质就是维持一些状态或提供一些特定功能的解决方案，那么自然而然就能复用组件公共的逻辑，这便是自定义 hook
const { useState, useEffect } = React
function ListItem(props) {
  const { title, content } = props
  return (
    <template>
      <p>
        {title}：{content}
      </p>
    </template>
  )
}
function List(props) {
  const [dataSource, setDataSource] = useState([])
  function getDataSource(event) {
    fetch(Date.now()).then((result) => setDataSource(result?.data ?? []))
  }
  useEffect(function () {
    // 函数组件不再具有具体的生命周期，而是以渲染为单位，每次渲染（浏览器的paint）结束会调用对应的副作用函数
    this.getDataSource(Date.now())
  }, []) // 第二个参数传入依赖数组，决定了此次渲染结束后是否要调用此副作用，空数组表示：副作用只有在此组件首次渲染和被卸载的时候触发
  return (
    <template>
      <h1>here are the lists</h1>
      <div>
        <button onClick={this.getDataSource}>click and get data</button>
      </div>
      {this.state.dataSource.map(({ title, content }) => (
        <ListItem title={title} content={content} />
      ))}
    </template>
  )
}
```

### 基本工作流程总结

React 的一个组件触发更新，此组件执行它的 render 函数得出最新的 VNode 树，再进入 patch，使得渲染目标保持最新，可以使用 shouldComponentUpdate（对于类组件）或 memo（对于函数组件）跳过其中某一个子组件的更新。由于 VNode 是树结构，使用递归来进行 patch，不过一旦树的结构过于复杂，递归就很消耗性能，造成界面的卡顿甚至是短时间的无响应，从而影响用户的体验，而且 JSX 本质是 JavaScript 代码，过于灵活，无法在组件编译时对它的 render 函数进行静态优化（对比于 Vue 的 Template 语法），导致了 React 必须在运行时进行优化（动态优化）。

为此，React 15 到 React 16 重构的目的就是实现一套 可中断（快照）、可恢复（回到中断前的快照） 且 支持任务优先级 的更新机制：

1. 把长时间运行的 JavaScript 任务拆成多份运行（时间切片），把 JavaScript 引擎控制权交还给浏览器，从而保证页面的流畅
2. 对于紧急的任务（比如响应用户的点击操作）赋予高优先级，让它能中断当前低优先级的任务（即抢占 JavaScript 引擎的控制权），从而提高交互的体验

而 React 15 的传统树结构 VNode 无法中断的主要原因是：

1. VNode 树是递归地边比较边修改 dom，如果进行到一半被中断，那用户将看到一个断层的、不完整的、毫无意义的中间界面
2. 每个 VNode 节点只保存了 children 节点，一旦被中断，无法再找到它的 parent 节点

解决上述问题：

1. 比较的时候不修改对应的 dom，而是将需要改变的地方都记录下来，等比较完成一次性修改 dom，所以 React 把一次渲染变成了 reconcile + commit，reconcile 阶段记录需要改变的地方（这个过程可以被中断，由 React 的任务调度系统 scheduler 安排），commit 阶段一次性修改 dom，最终一次渲染 = render(reconcile + scheduler) + commit
2. 提出新的 [fiber](https://github.com/acdlite/react-fiber-architecture) 架构以代替传统的树结构的 VNode，新架构下的 React 会把 render 函数输出的 VNode 树转成对应的 fiber 结构，简而言之，fiber 结构就是将原本需要递归比较 VNode 的树结构变成了循环比较的类链表结构

接下来 React 在 fiber 基础上实现：时间切片、中断和恢复、优先级、并发、等等的高级特性。

在 React 16 实现了时间切片、中断恢复和基于过期算法的优先级调度系统，在用户代理空闲的时候进行 patch（参考 [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)），当用户代理需要响应用户操作的时候中断当前 patch 任务（因为响应用户操作是最高优先级任务），再在下次空闲的时候恢复之前被中断的 patch 任务，新发生的高优先级任务将中断当前的低优先级任务，比如响应用户的输入框输入，这种任务优先级抢占模型就是并发模型的基础，从而也开启了 React 并发模型的旅程。

并发让 React 能够同时准备多个 UI 版本，从而提升用户体验。

多个 UI 版本从何而来？
答：比如，当前正在进行一个普通渲染任务，这时，插进来一个高优先级渲染任务抢占了普通渲染任务的渲染权，那么这时，React 就维护着两份 UI 版本。

在 React 17 优先级调度系统基于 lanes 算法进行了重构，从而健壮了 React 的并发模型（详情参见此 [PR](https://github.com/facebook/react/pull/18796)）。

在 React 18 进一步完善和优化了并发模型，同时暴露出一些特定的底层 API 给下游框架（比如 `next.js`、`umijs`）使用，现在 React 俨然发展成了一个更加注重底层的框架（或者说一个小型的操作系统），应用开发不应该再直接基于 React 本身，而是使用基于 React 的下游框架进行开发。

## Vue 的基本工作思想 - Vue2

### 基本思想

1. 观察者模式（发布订阅模型）：一个解耦对象之间消息通信的范式，前端常见的设计模式
2. 依赖收集：一个组件`template`、`computed`使用到的和`watch`指定的状态就是依赖，观察者观察这些依赖的变化从而做出对应的响应，比如`template`的依赖改变了就通知对应的组件进行更新
3. 响应式化的对象：每个组件的状态是一个数据对象，Vue2 使用 ES5 的 `Object.defineProperty` 方法递归地将对象的全部属性转换为对应的 getter 和 setter 从而实现数据的劫持，在 getter 中把当前的 watcher 收集到当前的依赖的 watchers 列表里，在 setter 中触发当前依赖的 watchers 里的全部 watcher

### Template 模板语法

和 JSX 一样，也是一种描述 VNode 树结构的 DSL，语法借鉴了著名的模板引擎 mustache，它不像 JSX 那么灵活，但是它为 vue-template-compiler 提供了静态优化的能力，当 compiler 把 template 编译成由 h 函数组成的 render 函数时，可以将静态不发生改变的 VNode 结构固定，在新旧 VNode 对比时，跳过被固定的 VNode 结构从而提高性能。

```vue
<template>
  <div>
    <!-- 状态name被视图template（即在render函数执行的时候读取了此name的值）使用到了，那么它就成为了视图的一个依赖，它会收集视图的 render watcher 到它的watchers里，当此依赖被修改时将触发它已经收集的watchers，也就使得组件被重新渲染了 -->
    <p style="color: red;">hello {{ name }}</p>
    <DisplayPanel v-on:click="resetName">
      <div slot="content" slot-scope="result">the content of DisplayPanel</div>
    </DisplayPanel>
    <slot name="footer">defaultSlotValue</slot>
  </div>
</template>
<script lang="javascript">
export default{
  name: 'demo',
  data(){
    // 简单工厂模式，返回本组件需要的数据对象
    return {
      name: 'nat',
    }
  },
  methods: {
    resetName(){
      this.name = 'nat'
    }
  },
}
</script>
```

等于（被 vue-template-compiler 转换为对应的 render 函数）

```javascript
function anonymous() {
  // this 是组件实例
  // _c = createElement = h
  // _v = createTextVNode
  // _s = toString
  // _u = resolveScopedSlots 格式化传入的数组
  // _t = renderSlot 生成此slot对应的VNode
  with (this) {
    return _c(
      'div',
      [
        _c('p', { staticStyle: { color: 'red' } }, [_v('hello ' + _s(name))]),
        _c('DisplayPanel', {
          // 和 React 把父组件的方法传递给子组件一样
          // 此处就能清晰的看出：子组件 $emit 触发的是组件自身的对应方法（$emit 是在组件自身上找对应的方法），而这些方法是父组件传来的
          // 使用模板的写法，很容易理解为：子组件和父组件真的有一套消息机制，子组件 $emit 把事件传到了父组件，父组件响应这个事件，不过，对于只是使用 Vue 而不去研究它底层的话，这样的理解是相当棒的，它使父组件向子组件的通信高度抽象
          on: { click: resetName },
          scopedSlots: _u([
            {
              key: 'content',
              // Vue 的插槽相当于 React 的 父组件直接向子组件传递 render 函数（动态插槽） 或 VNode（静态插槽）
              fn: function (result) {
                return _c('div', {}, [_v('the content of DisplayPanel')])
              },
            },
          ]),
        }),
        _t('footer', function () {
          // 在传给此组件的scopedSlots（渲染render数组）和slots（VNode数组）中寻找对应的slot映射，没找到就返回默认内容
          return [_v('defaultSlotValue')]
        }),
      ],
      2
    )
  }
}
```

### 基本工作流程总结

每个 Vue 组件是一个配置对象（选项式 API 语法），配置对象描述了组件的初始数据、方法、render 函数、计算属性、生命周期、等等，当组件实例首次渲染时，会将 render 函数包裹在一个 watcher 里面（这个 watcher 就是 render watcher）并执行此 watcher，在 render 函数里面使用到的数据在被读取时将触发它的 getter，在 getter 里面将当前的 watcher 收集到它的 watchers 列表里，render 函数返回的 VNode 树在首次渲染时被生成对应的 dom 并保存到组件的`$el`上，将来，依赖（数据）改变了会导致它的 setter 被执行，setter 将它已经收集的 watchers 都执行，当执行到了 render watcher 也就使得组件重新渲染，新旧 VNode 树进入 patch 过程，最终保持组件的 `$el` 最新，这也意味着 Vue2 的更新颗粒度是组件级别的，而非 React 发生改变的组件和它的全部子组件。

一个依赖可能收集了多个组件的 render watcher，比如使用 provide 注入的响应式依赖，当此依赖改变时，对应的全部组件也都将触发更新。

Vue 的每个组件管理着自己对应的 dom，它的子组件在 patch 时对其赋最新值（比如对 props 赋最新值），让子组件根据新旧值决定自己是否需要更新，需要的话安排对应的更新到本次更新队列里面。

每个组件的组件实例被附加在各自生成的 VNode 上，下次渲染的时候从 oldVNode 取到此组件的实例进行本次渲染，同时赋值给 newVNode，从而将此组件实例延续下去。

当一个组件的 `v-if` 是假值的时候，它就应该从父组件的 `$el` 移除，那么最简单的方法就是这个子组件直接返回一个注释节点即可`document.createComment(' because v-if is false ')`：

```vue
<template>
  <div>
    <p>Hello</p>
    <p v-if="false">Hello Again</p>
  </div>
</template>
```

对应的 render 函数：

```javascript
function anonymous() {
  with (this) {
    return _c('div', [
      _c('p', [_v('Hello')]),
      // 可以看出 v-if 指令就是简单的条件表达式
      // 当 false 时执行 _e() 返回一个注释节点
      false ? _c('p', [_v('Hello Again')]) : _e(),
    ])
  }
}
```

内置组件`keep-alive`和`component`基本工作方式：

```vue
<template>
  <!-- keep-alive可以指定最多的缓存数量，使用的是LRU算法 -->
  <!-- keep-alive还可以指定黑白名单 -->
  <keep-alive>
    <!-- currentComponent可以是一个已经被注册过的组件名，也可以是一个组件配置对象 -->
    <component :is="currentComponent"></component>
  </keep-alive>
</template>
```

对应的 render 函数：

```javascript
function anonymous() {
  with (this) {
    // 可以看出，内置组件component只是很简单地将is对应的值传给createElement函数，再使用tag标记它来自于内置组件component
    return _c('keep-alive', [_c(currentComponent, { tag: 'component' })], 1)
  }
}
```

内置组件`keep-alive`将保存传给它的第一个子节点的 VNode 树，而 VNode 上存在它对应的组件实例（如果缓存的是组件），从而实现对应 dom 的缓存。
