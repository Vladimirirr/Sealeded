# 组合式语法与自定义 Hook

## 组合式语法

Vue3 的组合式语法借鉴自 React16 的 Hook 语法，都是**一种更合理地<font color="red">组织组件内的数据与行为</font>以及<font color="red">组件公共逻辑复用</font>的编程方式**。

受 React16 的 Hook 语法启发，而且越来越多的前端框架（比如 Preact10、Vue3）放弃基于类（代表 React15）或配置选项（代表 Vue2）的组件编写方式转而使用基于 Hook 或类似的编写方式，由此前端框架的编程思想从面向对象演变为面向函数。**（根本原因：`UI = Render(CurrentState)`，即 UI 是 Render 函数根据 CurrentState 变量的演绎）**

### React 的基于类的组件和基于函数的组件的对比

基于类的组件：

```tsx
/**
 * 状态切换的组件公共逻辑的混入，一个 mixin 工厂函数
 * @param component 被混入的组件
 * @param value 初始值
 * @param prefix 混入的名字，防止命名冲突
 */
const mixinToggle = (component: Object, value: boolean, prefix: string) => {
  // 即便可以传入 prefix 来自定义混入功能的名字的前缀（功能依旧受限，不能完全自定义名字），但这无疑增加了编写和使用混入的心智负担
  // 取得 prefix
  prefix = prefix || 'toggle'
  // 放置值
  const toggleValueName = `${prefix}Value`
  this.state[toggleValueName] = value
  // 放置操作方法
  this[prefix] = () =>
    component.setState({ [toggleValueName]: (value = !value) })
  this[`${prefix}True`] = () =>
    component.setState({ [toggleValueName]: (value = true) })
  this[`${prefix}False`] = () =>
    component.setState({ [toggleValueName]: (value = false) })
  // 其他的副作用，混入编写者需要小心翼翼地组合新的副作用与已经存在的副作用
  const originComponentDidMount = component.componentDidMount
  component.componentDidMount = () => {
    console.log('mounted and mixinToggle has been set.')
    // 执行原来的钩子（如果有的话）
    originComponentDidMount && originComponentDidMount.call(component) // 让 this 指向正确
  }
}
class Foo extends React.Component {
  constructor() {
    super()
    this.state = { count: 0 }
    // 使用混入来复用组件的公共逻辑（数据和方法）
    mixinToggle(this)
  }
  setCount() {
    this.setState({ count: this.state.count + 1 })
  }
  componentDidMount() {
    // 设置一个计时器
    this.timer = window.setInterval(() => {
      // do something effect like updating view
      this.setCount()
    }, 1e3)
  }
  componentDidUnmount() {
    // 不要忘记当组件卸载的时候，要取消计时器，防止内存泄漏
    window.clearInterval(this.timer)
  }
  render() {
    return <h1>count is {this.count}.</h1>
  }
}
// 使用高阶组件来复用组件的公共逻辑
class HOCWrapWithDivTag extends React.Component {
  constructor(component) {
    super()
    // 给component塞入一些数据和方法
    component.state.somethingState = somethingValue
    component.somethingFunction = somethingFunction
    // 保存此component
    this.component = component
  }
  render() {
    // 包装传入的组件的render函数
    return <div style="text-align: center;">{this.component.render()}</div>
  }
}
const FooEnhanced = HOCWrapWithDivTag(Foo)
```

缺点：

1. 相同功能的代码被分割，上述代码里，【设置与清除定时器】被分割到两个独立的钩子里，【值 count 和它的方法 setCount】也被分割开（不过可以把方法 setCount 定义在构造函数里，这样就和它的值 count 紧密在一起，不过构造器的代码量会快速膨胀）
2. 多个混入导致的【同名的功能被覆盖】、【一个功能的来源无法快速定位】、【团队合作带来的高心智负担】、等等的混乱问题，即便可以传入 prefix 但是也是功能受限的命名冲突解决方案
3. 多个高阶组件来装饰一个组件，也会存在【多个混入导致的问题】，还存在嵌套过深的情况
4. 还可以使用不常用的对象继承来复用组件的公共逻辑，不过与上面的 UI 公式理念不符

使用 Hook 方式优化：

基于函数的组件（Hook 依赖的宿主是函数）：

```tsx
// 定义一个自定义 hook，也就是对一些组件的公共逻辑封装为一个 hook
const useToggle = (defaultValue: boolean) => {
  // 这里的状态和方法名字可以任意定义，它们受限于当前的函数作用域，不会外溢！
  const [value, setValue] = React.useState(defaultValue)
  const toggle = React.useCallback(() => setValue(!value), [value])
  const toggleTrue = React.useCallback(() => setValue(true), [])
  const toggleFalse = React.useCallback(() => setValue(false), [])
  // 注册一个 effect hook
  useEffect(() => {
    console.log('mounted and useToggle has been set.')
  }, [])
  // 把需要暴露出去的状态和方法返回出去，外部在接收这些值时（比如使用数组的解构赋值）可以完全地自定义变量的名字
  return [value, toggle, toggleTrue, toggleFalse]
}
const Foo = () => {
  const [count, setCount] = React.useState(0) // 内置 hook，为基于函数的组件提供状态的功能
  const timer = React.useRef(null) // 内置 hook，代表一个静态的值，不当作组件的依赖而存在
  const [value, toggle, toggleTrue, toggleFalse] = useToggle(false) // 复用 toggle 逻辑，可以随意取名，不需要担心混入带来的同名覆盖问题
  const [value2, toggle2, toggleTrue2, toggleFalse2] = useToggle(false) // 再一次的复用 toggle 逻辑
  // 内置 hook，依赖数组为空，表示只在挂载和卸载时执行
  React.useEffect(() => {
    // 挂载时
    timer.current = window.setInterval(() => {
      setCount(count + 1)
    }, 1e3)
    return () => {
      // 卸载时
      window.clearInterval(timer.current)
    }
  }, [])
  return <h1>count is {this.count}.</h1>
}
```

解决缺点：

1. 相同的功能不再被分割，上述的【设置计时器和清除计时器】、【count 和 setCount 定义在一起】被紧密地定义在一起
2. 清晰的组件公共逻辑复用方式，useToggle 编写时不需要考虑是否已经存在同名的状态或方法以及其他边缘情况，因为 useToggle 里的状态和方法都在它自己的函数作用域里，而且 useToggle 使用解构赋值来在主组件里创建状态和方法，无需担心同名的问题（因为名字可以随意命名）

### Vue 的基于选项式的组件和基于组合式的组件的对比

基于选项式：

```ts
// 普通的 mixin 很笨重
const mixinToggle = {
  data() {
    return {
      toggleValue: false,
    }
  },
  methods: {
    toggle() {
      this.toggle = !this.toggle
    },
    toggleTrue() {
      this.toggle = true
    },
    toggleFalse() {
      this.toggle = false
    },
  },
  mounted() {
    console.log('mounted and mixinToggle has been set.')
  },
}
// 和 React 一样的使用 prefix 的 mixin，一个 mixin 工厂函数
const mixinToggle2 = (value: boolean, prefix: string) => {
  prefix = prefix || 'toggle'
  const toggleValueName = `${prefix}Value`
  return {
    data() {
      return {
        [toggleValueName]: value,
      }
    },
    methods: {
      [prefix]() {
        this[toggleValueName] = !this[toggleValueName]
      },
      [`${prefix}True`]() {
        this[toggleValueName] = true
      },
      [`${prefix}False`]() {
        this[toggleValueName] = false
      },
    },
    mounted() {
      console.log('mounted and mixinToggle has been set.')
    },
  }
}
const Foo = {
  // 使用混入来复用组件的公共逻辑
  mixins: [mixinToggle, mixinToggle2(true, 'toggleHaha')],
  data() {
    return {
      count: 0,
    }
  },
  methods: {
    setCount() {
      this.count++
    },
  },
  mounted() {
    // 设置一个计时器，和上面的一样
  },
  unmounted() {
    // 也不要忘记取消计时器
  },
  template: '<h1>{{count}}</div>', // 也可以使用JSX手写对应的render函数
}
```

基于组合式优化：

```ts
// 定义一个自定义 hook，也就是对一些组件的公共逻辑封装为一个 hook
const useToggle = (defaultValue: boolean) => {
  const value = Vue.ref(defaultValue)
  const toggle = () => (value.value = !value.value)
  const toggleTrue = () => (value.value = true)
  const toggleFalse = () => (value.value = false)
  // 注册一个钩子，会自动与目前存在的同名钩子组合
  Vue.onMounted(() => {
    console.log('mounted and useToggle has been set.')
  })
  return [value, toggle, toggleTrue, toggleFalse]
}
const Foo = {
  setup() {
    // 组件的 setup 函数只执行一次（即初始化组件，安装组件全部的配置项），不同于 React 的每次执行
    const count = Vue.ref(0)
    const setCount = () => count.value++
    const [value, toggle, toggleTrue, toggleFalse] = useToggle(false) // 复用 toggle 逻辑
    const [value2, toggle2, toggleTrue2, toggleFalse2] = useToggle(false) // 再一次复用 toggle 逻辑
    return {
      count,
    }
  },
  template: '<h1>{{count}}</div>', // 模板中的count不需要写.value（Vue能自动处理），也支持JSX语法
  mounted() {
    // 设置一个计时器
  },
  unmounted() {
    // 取消计时器
  },
}
```

缺点：

1. 相同功能的代码被分割，与 React 一样的问题
2. 多个混入带来的混乱问题，与 React 一样的问题

解决缺点：

1. 相同功能的代码不再被分割，与 React 一样地解决问题
2. 使用独立的函数来复用一段公共逻辑，不需要考虑边缘情况，与 React 一样地解决问题

### 基于 Hook 或基于组合式的缺点

1. 代码需要高度抽象，尽可能多地抽象出自定义 Hook，否则一个函数里的代码量将快速膨胀，而且高度耦合，极可能出现牵一发而动全身的情况
2. 需要团队高度遵守编写规范
3. 初学者不能很好地控制自定义 Hook 的抽象能力，上手难度较高

但是，总体和长远来说，基于 Hook 的组件编写方式是目前的最优解。

## 自定义 Hook 的本质

### React

React 一直是基于 `state > render > vdom > diff > patch > view` 思想的工作方式，React16 及其后续版本提出的异步与并发渲染也只是把 diff 阶段变地可中断，整体工作方式依旧不变。

React 传统的基于类和类实例的组件编写方式能将组件的状态和方法都放在类实例上，但是基于函数的组件是无状态的（函数本身就不能保存状态，一旦函数执行结束，它的执行栈和作用域都将销毁），所以 React 为基于函数的组件引入了 Hook 技术，**本意是将状态钩入组件的手段**（比如 useState），所以叫做 Hook，同时也能将一些副作用钩入组件（比如基于组件更新的 useEffect 钩子），还能将一些工具方法钩入（比如 useCallback，缓存一个函数以及它的闭包）。

受到这些钩子启发，React 尝试使用自定义的 Hook 来复用组件的公共逻辑，因为自定义组件有自己的函数作用域，它与使用它的组件或其他自定义 Hook 的函数作用域互不影响，而且基于解构赋值的变量声明也完美地解决了混入和高阶组件带来的一些列问题，自定义 Hook 一发布，便迅速获得大量的用户支持。

从此，就像 LLVM 一样不再指代一个虚拟机而是指代一个编译器架构，Hook 不再指代让基于函数的组件有了状态、副作用和其他工具的技术，而是一种更加广泛的公共逻辑复用技术：

1. useState：内置的复用状态的技术
2. useCallback：内置的复用上一次函数的技术
3. useEffect：内置的复用组件更新时机的技术
4. useRef：内置的复用不参与组件更新的值的技术
5. useToggle：自定义的复用布尔值状态改变的技术

React 的每次状态更新，都会导致对应的组件函数和它的子组件函数全部重新执行，即重新得到一颗最新的 VNode 树，函数里面的代码（包括全部 Hook）都将重新执行。

### Vue

Vue 一直走的是基于响应式的组件更新方式，提出 Vue3 主要是因为 Vue2 存在下面几个问题：

1. Vue2 基于 Object.defineProperty 对整个对象和数组做拦截，考虑都了很多边缘情况，而且效率不高
2. Vue2 的 TypeScript 支持很弱（Vue2 本身使用 JavaScript with Flow 编写而非 TypeScript），由于 Vue2 最开始立项的时候同时存在 TypeScript(MicroSoft) 和 Flow(Facebook) 两个为 JavaScript 增强静态能力的方案，不过 Vue2 选错了 Flow
3. 选项式配置项的方式很容易造成相同功能的代码被分割，而且基于混入的复用方式真的很不好用

所以，Vue3 的底层完全重构：

1. 使用 ES6 标准的 Proxy 做数据拦截，效率直接提高
2. 使用 TypeScript 编写，对 TypeScript 支持直接提高
3. 使用组合式语法编写组件，受 React Hook 启发

不过高层的使用方法和 Vue2 相差无几，同时兼容 Vue2 的选项式语法（Vue3 初始化时会将选项式语法转成组合式语法）。

Vue3 依旧围绕依赖收集订阅者与依赖触发订阅者的基本思想：

```ts
// Vue3的组件编写本质还是一个选项对象（最终也将实例化为一个Vue组件），只不过状态和对应的方法以及副作用都收敛到了setup函数里（就好像React的基于函数的组件一样）
const Foo = {
  setup() {
    // 此处相当于beforeCreate
    const count = Vue.ref(0) // 得到一个响应式化的数字，本质是Vue.reactive({ value: 0 })
    const setCount = () => count.value++
    const [toggleValue, toggle, toggleTrue, toggleFalse] = useToggle(false) // 复用toggle逻辑
    // 此处相当于created
    return {
      // 这些导出的值和方法都将保存到此Foo组件的组件实例上
      count,
      toggleValue,
      toggle,
    }
  },
  // 模板使用到了count值，那么count值（也就是依赖）就会收集此渲染函数（也就是订阅者，即渲染函数订阅了count依赖的变化）
  // 同理，自定义Hook（比如上面的useToggle）的执行结果导出一些状态、方法以及副作用，而这些导出的东西最终融合到了setup函数里面！导出的toggleValue依赖也会收集此渲染函数！
  template: '<h1>{{count}} and {{toggleValue}}</div>',
  mounted() {},
}
```

## 自定义 Hook 核心总结

### React 自定义 Hook

基于函数的组件按需接收自定义 Hook 导出的值、方法和副作用，当下次更新来临时，**继续执行此自定义 Hook**，从而拿到它导出的最新的值来渲染最新的 JSX。

### Vue 自定义 Hook

组件的 setup 函数按需接收自定义 Hook 导出的值、方法和副作用，**将这些值融合到自己的 setup 里面去**，最终都通过 setup 函数的 return 关键字暴露给组件实例。

### 广义总结

**Hook 就是一个有状态的函数**，它能在任何能使用函数的地方，不过这也增加了对 JS 函数的编写心智负担：JS 函数本身不具备任何状态，Hook 借助一些方法（比如把状态统一保存在外部的状态管理工具里）使得函数有状态。

每一个被使用到的 Hook 都会创建**一个独立的函数作用域**，**此函数作用域内的数据和逻辑与主组件和其他 Hook 完全隔离**，而且**基于解构赋值**的值、方法和副作用导出就像定义变量一样，可以自由组合和使用。
