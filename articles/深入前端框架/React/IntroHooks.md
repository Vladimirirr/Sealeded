# React Hooks 的出现

地址：<https://reactjs.org/docs/hooks-intro.html>

React Hooks 首次出现在 16.8.0 版本（发布于 2019.2）。

## 无破坏性更改

- 可选的功能
- 与旧代码兼容
- 没有计划移除类组件
- 没有改变 React 的基本思想

## 动机

Hooks 解决了在类组件中遇到的各种实践性问题。

### 难复用

很难在组件之间复用有状态的逻辑（这些逻辑拥有自己的状态并维持着它们）。

React 本身没有提供把一个有状态的逻辑附着在一个组件上的能力，因此，有许多模式尝试去解决这个问题，比如，mixins、higher-order components、render props。但是这些模式都需要以特定的格式重构之前的组件，还会让组件变得臃肿且难以跟踪。这正反应了一个底层问题，即 React 需要一个更好的方法来共享**有状态的逻辑**。

而 Hooks 可以将有状态的逻辑从组件里提取出来，而不更改组件的结构。

### 难理解

难以理解的复杂组件。

大多数组件都从一个简单的展示组件开始，被添加了各种有状态的逻辑和生命钩子函数和其他各种副作用，而且对于每个生命周期钩子会存在关注点分离的问题（这种不一致性很容易导致 bug 的出现）。

### 难捉摸

JavaScript 的类难以捉摸，人 与 机器 都会被它混淆。

学习 JavaScript 的类也是一个难题，因为 JavaScript 的类与许多现代语言的行为不太一致。

此外，类包含一些样板代码，导致压缩工具很难降低生成的代码的体积。

## 基理

Hooks 本质很简单，就是一个记录数组而已。

```jsx
const useState = (initialState) => {
  const instance = currentInstance
  const hookIndex = currentHookIndex
  const hooks = instance.hooks // hooks 只是一个很普通的数组！
  let state, setState
  if (isCurrentHookExisted()) {
    const { value, setter } = hooks[hookIndex]
    state = value
    setState = setter
  } else {
    value = initialState
    const setter = (setState = (newState) => {
      const oldState = hooks[hookIndex].value
      if (oldState !== newState) {
        hooks[hookIndex].value = newState
        callUpdate()
      }
    })
    hooks[hookIndex] = { value, setter }
  }
  currentHookIndex++ // 移到下一个 hook
  return [state, setState]
}

const View = () => {
  const [name, setName] = useState('nat')
  const [age, setAge] = useState(22)
  return <h1> hello hooks </h1>
}
```

Hooks 是一个数组，因此每一个 hook 的调用顺序要和数组顺序严格一致，这也解释了为什么 hooks 必须出现在函数的顶级，而不能出现在 if 语句、for 语句、等等 的带条件的语法里。

## 例子

以复用一段【观察当前窗口宽度】的有状态的逻辑为例子：

### hooks

```js
// A custom hook for observing current window width.
const useWindowWidth = () => {
  const [width, setWidth] = React.useState(window.innerWidth)

  React.useEffect(() => {
    const eventHandler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', eventHandler)
    return () => window.removeEventListener('resize', eventHandler)
  }, [])

  return width
}

// 这下，书写的组件才是真正意义上的声明式！！！！
const View = () => {
  const windowWidth = useWindowWidth()
  return <p>Current window's width is {windowWidth}px.</p>
}
```

一旦看了 hooks 的优雅写法，你会觉得下面的复用方式很繁琐。

### mixins

```jsx
// A mixin for observing current window width.
const mixinWindowWidth = (component) => {
  // 放置需要的状态
  // 双下划线避免与已存在的状态同名，这也暴露出 mixin 的致命缺点（容易发生命名冲突）
  // 当然，此状态名也可通过函数传入，但是又增长了复杂性
  component.state.__windowWidth = window.innerWidth

  // 事件处理器
  const eventHandler = () =>
    component.setState({
      __windowWidth: window.innerWidth,
    })

  // 设置事件，需要小心地处理已经设置的生命钩子，很麻烦
  const oldComponentDidMount = component.componentDidMount
  component.componentDidMount = () => {
    oldComponentDidMount && oldComponentDidMount.call(component)
    window.addEventListener('resize', eventHandler)
  }

  // 取消事件
  const oldComponentWillUnmount = component.componentWillUnmount
  component.componentWillUnmount = () => {
    oldComponentWillUnmount && oldComponentWillUnmount.call(component)
    window.removeEventListener('resize', eventHandler)
  }
}

class View extends React.Component {
  constructor() {
    super()
    this.state = {}
    mixinWindowWidth(this) // 传入本组件对象 this，本质上 mixin 就是扩展此 this 来达到复用的目的
  }
  componentDidMount() {
    console.log('The origin componentDidMount called.')
  }
  render() {
    const windowWidth = this.state.__windowWidth
    return <p>Current window's width is {windowWidth}px.</p>
  }
}
```

### higher-order components

```jsx
// A HOC(higher-order component) for observing current window width.
// 高阶组件，即，输入一个组件，返回一个组件（被增强过的）
const hocWindowWidth = (Component) => {
  // 此处是大写的 Component，表示传入的是 组件构造器（类），而非 组件实例
  // 这里可做一些其他操作
  return class extends React.Component {
    constructor() {
      super()
      this.state = {
        // 由于这里的 state 要直接透传下去，双下划线同样也是避免同名冲突
        __windowWidth: window.innerWidth,
      }
      this.eventHandler = () => {
        // 箭头函数解决 this 绑定的问题，免去了写 eventHandler.bind(this) 的繁琐
        this.setState({
          __windowWidth: window.innerWidth,
        })
      }
    }
    componentDidMount() {
      window.addEventListener('resize', this.eventHandler)
    }
    componentWillUnmount() {
      window.removeEventListener('resize', this.eventHandler)
    }
    render() {
      return <Component {...this.props} {...this.state} />
    }
  }
}

class ViewOrigin extends React.Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    const windowWidth = this.props.__windowWidth
    return <p>Current window's width is {windowWidth}px.</p>
  }
}

const View = hocWindowWidth(ViewOrigin)
```

### render props

侧重 UI 的复用，因此 windowWidth 的例子在此处不太明显。

```jsx
// A render function just for rendering a jsx fragment with its parameters, which is stateless.
const renderWindowWidth = (windowWidth) => {
  // 做一些其他的操作
  return <span>{windowWidth}px</span>
}

class View extends React.Component {
  constructor() {
    super()
    this.state = {
      windowWidth: window.innerWidth,
    }
    this.eventHandler = () =>
      this.setState({
        windowWidth: window.innerWidth,
      })
  }
  componentDidMount() {
    window.addEventListener('resize', this.eventHandler)
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.eventHandler)
  }
  render() {
    const windowWidth = this.state.windowWidth
    const windowWidthFragment = this.props.renderWindowWidth(windowWidth)
    return <p>Current window's width is {windowWidthFragment}.</p>
  }
}

class App extends React.Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    return <View renderWindowWidth={renderWindowWidth} />
  }
}
```

### 总结

看得出，hooks 的写法是最优雅的、最易懂的（最声明式的），代码数量也是最少的。

## 总结

虽然函数简单，而且没有状态，但是我们能通过不断地引入各种 hooks 来强化我们的函数组件，从而达到类组件能做的任何事情，但又比类组件轻巧且灵活。

## 扩展

- [Lifecycles of Class Components](./LifeCycle.md)
