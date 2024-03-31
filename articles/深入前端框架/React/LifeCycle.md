# React 类式组件生命钩子

观察 React 类式组件生命钩子的变迁，同时也能从这侧面地观察 React 是如何向并发渲染方向进化的。

注意，React 已经不再推崇类式组件，它存在诸多弊端，请转向带 hooks 的函数式组件。

React 类式组件生命钩子演示图示：<https://projects.wojtekmaj.pl/react-lifecycle-methods-diagram/>

## React 15

此时的 React 渲染过程是同步的，因此这些生命钩子能符合预期地工作，但是如果某一个组件很庞大，那么会卡住主线程，因此 React 16.3 开始引入了异步渲染模式。

### 挂载阶段 mounting

1. `constructor(props)`：构造组件，主要用途：初始化 state 对象、给事件处理器做 bind this 操作
2. `componentWillMount()`：组件即将挂载
3. `render()`：输出当前需要渲染的视图
4. `componentDidMount()`：组件已经挂载（DOM 已经提交（插入）到文档里）

### 更新阶段 updating

1. `componentWillReceiveProps(nextProps)`：当父组件重新渲染子组件时，子组件会收到此事件
2. `shouldComponentUpdate(nextProps, nextState)`：决定是否真的需要本次更新，性能优化的地方
3. `componentWillUpdate()`：即将更新
4. `render()`
5. `componentDidUpdate()`：已经更新

### 卸载阶段 unmounting

1. `componentWillUnmount()`：被卸载前（DOM 被移除前）

## React 16.3 之后

引入了可中断的异步渲染模式。

### 挂载阶段 mounting

1. `constructor(props)`
2. `static getDerivedStateFromProps(nextProps, currentState)`：静态方法，因此此方法里取不到 this，它返回的对象会更新 state，如果返回 null 表示不更新
3. `render()`
4. `componentDidMount()`

### 更新阶段 updating

1. `static getDerivedStateFromProps(nextProps, currentState)`
2. `shouldComponentUpdate()`
3. `render()`
4. `getSnapshotBeforeUpdate(prevProps, prevState)`：在上面的 render 输出之后立刻调用，因此这时可以查看在更新提交到文档之前时的 DOM 的信息
5. `componentDidUpdate(prevProps, prevState, snapshot)`：更新已经提交到文档

### 卸载阶段 unmounting

1. `componentWillUnmount()`

### 异步渲染阶段

1. render 阶段：纯净（无副作用），可能被中断或重启，包含：`constructor`、`getDerivedStateFromProps`、`shouldComponentUpdate`、`render`
2. pre-commit 阶段：即将提交更改的 DOM 到文档，包含：`getSnapshotBeforeUpdate`
3. commit 阶段：已经提交更改的 DOM 到文档，包含：`componentDidMount`、`componentDidUpdate`、`componentWillUnmount`

由于现在的 React 更新是可中断的异步渲染模式（但是只有 render 阶段可被中断，其他阶段不能中断而且都是同步的），因此这个阶段的生命钩子不再安全（可能被重复执行）而被废弃。

### 废弃钩子

1. `componentWillMount`
2. `componentWillReceiveProps`
3. `componentWillUpdate`

这些钩子将被标记上 `UNSAFE_` 前缀，试图让开发者尽快更改这部分的业务代码。
