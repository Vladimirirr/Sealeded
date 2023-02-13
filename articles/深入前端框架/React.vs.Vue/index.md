# React 和 Vue 的基本思想

## 两者的基本思想

两者的基本思想都是：`view = render(state)`

组件的渲染函数`render`根据组件当前状态`state`得出组件最新的视图`view`。

渲染函数得出的视图是 VNode 树结构，它与平台无关，每次更新都会生成一颗最新的 VNode 树，再照着新树修改旧树，最终旧树与新树相同，此过程就是 patch。而 patch 过程由各自的平台渲染器（以 React 举例，React 在 Web 平台的渲染器是 ReactDOM，在移动平台的渲染器是 ReactNative）实现。

一个组件就是封装了结构`VNode`、行为`JavaScript`和样式`CSS`的对象或函数，由`JavaScript`维持着组件当前的状态同时控制着组件当前的结构和样式。

## 框架与心智模型(mental model)

框架 = 在编程语言的基础上构成的特定语法 (DSL + API)

### React

（省略与 essence 相同的）

由于 React15 的心智模型与 Vue2 相似，只不过使用手动的 setState 方法触发更新，下面下面只讨论 React16 Hook 的思想。

心智模型：**副作用受限**于函数执行上下文的**纯函数**（使用代数效应抵消副作用带来的心智负担）

### Vue

（省略与 essence 相同的）

心智模型：使用了**依赖跟踪**技术的**对象**

## React 的基本工作思想

### 基本思想

React 每次的重新渲染都从状态发生改变的组件开始，对此组件的新旧 VNode 树进行 patch，从而保证组件树一直最新。

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

组件结构如下：

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
      fetch(`/mock/${Date.now()}`).then((result) =>
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
    this.getDataSource()
  }
}
```

上述这种使用**类**的方式描述组件很形象，组件维持着自己的状态，组件也有改变状态的方法，组件通过 render 函数输出组件当前状态的视图，但是存在一些缺陷：

1. 面向类、对象的 OOP 编程思想强调的是：封装、继承、多态，而组件只是很纯粹的描述当前状态下的视图，通常不存在多层继承，也用不到多态，仅仅用到了封装
2. JavaScript 归根到底是原型继承，更适合走函数式编程
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
    fetch(`/mock/${Date.now()}`).then((result) =>
      setDataSource(result?.data ?? [])
    )
  }
  useEffect(function () {
    // 函数组件不再具有具体的生命周期，而是以渲染为单位，每次渲染（浏览器的paint）结束会调用对应的副作用函数
    this.getDataSource()
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

参见`https://github.com/Vladimirirr/HowVueWorksSealeded`

### 基本思想

### 基本工作流程总结
