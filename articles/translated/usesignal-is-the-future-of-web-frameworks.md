# useSignal() 是前端框架的未来

> 文章 [useSignal() is the Future of Web Frameworks.](https://www.builder.io/blog/usesignal-is-the-future-of-web-frameworks) 的中文翻译。

```txt
            useState()
            + useRef()
           + useMemo()
- constant rerendering
------------------------
         = useSignal()
```

此处的 constant 是【重复】的意思。

signal（信号）是软件运行时存储状态的一种方式，类似 React 里的 useState。但是，有一些关键的不同让 signal 更占优。

## 什么是 signal

```txt
useState() = value + setter
useSignal() = getter + setter // 相当 Vue3 的 ref()
```

signal 和 state 关键的不同是 signal 是【一对 getter 和 setter】，而非响应式系统里的 useState 是【值与它的 setter】。

## state vs. state

词 **state** 含有两个独立的概念：

- **state-reference**：the value's reference
- **state-value**：the value itself

返回一个【getter】要比返回一个【值】好，它可以隔离 state-reference 的传递与 state-value 的读取。

就像 Solid.js 一样：

```jsx
const Counter = () => {
  const [getCount, setCount] = createSignal(0)
  const view = (
    <button onClick={() => setCount(getCount() + 1)}>
      current: {getCount()}
    </button>
  )
  return view
}
```

- `createSignal(0)`：得到一个`StateStorage`同时将其置`0`
- `getCount`：一个可传递的指向`StateStorage`的 reference
- `getCount()`：尝试从`StateStorage`取值

## 不懂？接着读下去

上面阐述了 signal 与 state 的不同，但没有阐述我们为什么需要关心这点。

signal 是响应式的！意味着，它们需要跟踪（订阅）对状态感兴趣的东西。如果状态发生了变化，就要告知订阅者状态变化的信息。

因此，signal 必须收集谁对它的值感兴趣。通过观察 signal 在谁的上下文被读取来得到这个信息，而在 getter 里取值，就可告诉 signal 目前的上下文对你感兴趣，如果值变化，需要重审此上下文以保证视图与状态一致。**换句话，执行了一次 getter 从而创建了一个订阅。**

这便是为什么传递 state-getter 而非 state-value 是如此的重要。传递 state-value 不会向 signal 提供有关此值真正被读取的地方和任何其他信息。这也就是为什么在 signal 里相区 state-reference 和 state-value 是如此的重要。

下面是 Qwik 框架的相同示例。注意，getter 和 setter 被替换成一个带有 property `value` 的对象（也代表 getter 和 setter）。语法表现不同而已，内部一样：

```jsx
const Counter = () => {
  const count = createSignal(0)
  const view = (
    <button onClick$={() => count.value++}>current: {count.value}</button>
  )
  return view
}
```

重要的是，当点击按钮增值时，框架只需改变此文本节点。可以这样做，是建立在首次渲染模板时，这个 signal 已经知道它的值在一个文本节点里被读取，因此，它也知道了当此值改变时，它只需更新此文本节点即可，而不需要关心其他的地方。（Quik 框架是细颗粒的更新）

## useState 的不足

举一个 React 的示例：

```jsx
const Counter = () => {
  const [count, setCount] = useState(0)
  const view = (
    <button onClick={() => setCount(count + 1)}>current: {count}</button>
  )
  return view
}
```

React 的 useState 返回一个 state-value。意味着，useState 不知道到底是组件的什么地方读取了 state-value。也就意味着，一旦一个组件通过 setCount 告知 React 它的状态发生了变化，React 也不能知道是组件的谁变化了，因此必须重现整个组件的渲染树。这在运行时是非常昂贵的，因此 React 提出了 concurrent with fiber 的模型（好耶！React 没有倒向响应式阵营）。

## useRef 不触发渲染

React 的 useRef 类似 useSignal，但是它不会导致重渲染。下面的示例看起来与 useSignal 很像，但是不起效果：

```jsx
const Counter = () => {
  const count = useRef(0)
  const view = (
    <button onClick={() => count.value++}>current: {count.value}</button>
  )
  return view
}
```

useRef 是一个根本不同的概念。即便 useRef 也是传递的是 state-reference 而非 state-value。但是 useRef 缺失的是订阅与告知。

好在构建在 signal 基础上的框架里，useSignal 和 useRef 是一样的。useSignal 可以做 useRef 能做的事情同时还能订阅跟踪。这极大简化了这些框架的 API 表象。

## 内置的 useMemo

signal 很少需要缓存组件的技术，它已经帮我们做了很多这方面的事情。

考虑下面两个计数器及它两个子组件的示例：

```jsx
const Counter = () => {
  console.log('Counter')
  const countA = useSignal(0)
  const countB = useSignal(0)
  const view = (
    <div>
      <button onClick={() => countA.value++}>INC A</button>
      <button onClick={() => countB.value++}>INC B</button>
      <Display count={countA.value}></Display>
      <Display count={countB.value}></Display>
    </div>
  )
  return view
}
const Display = ({ count }) => {
  console.log(`Display ${count}`)
  return <p>{count}</p>
}
```

在上面的示例里，同一时间只有两个 Display 组件里的其中一个将被更新，而在 React 里要做到这一点，必须要缓存组件以最小化重渲染的次数：

```jsx
const Counter = () => {
  console.log('Counter')
  const [countA, setCountA] = useState(0)
  const [countB, setCountB] = useState(0)
  const view = (
    <div>
      <button onClick={() => setCountA(countA + 1)}>INC A</button>
      <button onClick={() => setCountB(countB + 1)}>INC b</button>
      <MemoDisplay count={countA}></MemoDisplay>
      <MemoDisplay count={countB}></MemoDisplay>
    </div>
  )
  return view
}

const Display = memo(({ count }) => {
  console.log(`Display ${count}`)
  return <p>{count}</p>
})
```

如果 React 不缓存组件，两个 Display 组件都会发生更新。

这相比 signal 要做的工作多得多。signal 帮你缓存了全部需要缓存的东西，因此你自己不再需要缓存任何东西。

## props 下沉

我们来看一个实现购物车的常规写法：

```jsx
const App = () => {
  console.log('App')
  const [cart, setCart] = useState([])
  const view = (
    <div>
      <Main setCard={setCart}></Main>
      <NavBar cart={cart}></NavBar>
    </div>
  )
  return view
}

const Main = ({ setCart }) => {
  console.log('Main')
  const view = (
    <div>
      <Product setCart={setCart}></Product>
    </div>
  )
  return view
}
const Product = ({ setCart }) => {
  console.log('Product')
  const view = (
    <div>
      <button onClick={() => setCart(thisProduct)}>Add to cart</button>
    </div>
  )
  return view
}

const NavBar = ({ cart }) => {
  console.log('Product')
  const view = (
    <div>
      <Cart cart={cart}></Cart>
    </div>
  )
  return view
}
const Cart = ({ cart }) => {
  console.log('Cart')
  const view = <div>Cart: {cart.toString()}</div>
  return view
}
```

购物车的状态通常提到【购买按钮】和【物品卡片】的最高公共父级（【购买按钮】和【物品卡片】在 DOM 中相距很远），此共同父级组件有两个下支：

- 一个将购买方法一直传递下去直到需要它的【购买按钮】
- 一个将物品状态一直传递下去直到需要它的【物品卡片】

问题就在这，每一次点击【购买按钮】，有大量的组件树被重新渲染，导致如下的输出：

```txt
// buy-button clicked
App
Main
Product
NavBar
Cart
```

如果采取`memo`缓存，也只能避免 setCart 的下沉而不能避免 cart 的，输出如下：

```txt
// buy-button clicked
App
NavBar
Cart
```

但是，如果是 signal，输出就变成：

```txt
// buy-button clicked
Cart
```

这极大减少了需要执行的代码量。

## signal 的框架

Vue(ShadowRef)、Preact(version 10 and later)、Solid、Qwik、等。

signal 不是什么新鲜的东西，早在 Knockout 里就存在了，只是与现在最不同的是，现在的 signal 能通过智能的转译器和模板深度集成。signal 极大地增强了它的 DX，使得在代码书写中非常简单，就如同 【async + await】 简化了 【Promise + Generator】 的代码书写。

## 总结

signal 是响应式的，意味着它需要跟踪（订阅）谁对它的状态感兴趣，同时在状态变化时告知它的订阅者，相反，React 的 useStatue 只是返回 state-value，意味着它不知道具体变化的地方，只能重现整个组件。

现在，signal 已经增强了 DX，它的书写方式很简单了。

建议在这些点的基础上，您的下一代框架得是响应式的，且基于 signal 模型的。

**一句话：Vue（它的响应式系统） + React（它的组件函数化思想） = 前端框架的发展方向**

## 二次总结（译者）

本文主要突出的是响应式系统能精细地跟踪到需要变化的节点，而非响应式的系统只能全量检查来发现变化的内容，因此响应式系统在运行时只会执行很少的 JavaScript，而非响应式系统在运行时需要执行很多的 JavaScript（即 vDOM 的 diff 和 patch），但是任何东西都有好坏，响应式系统就需要较多的内存消耗（每一个响应式的值都要建立相对的依赖关系，比如 Vue 里的 Watcher 对象）。

## 框架发展变化（译者）

王牌框架：

| 框架    | 更新视图的思想变化     | 书写格式的变化                                                                  |
| ------- | ---------------------- | ------------------------------------------------------------------------------- |
| React   | 视图快照的增量检测     | 面向类 -> 面向函数 （真正的函数）                                               |
| Vue     | 对象的响应式跟踪       | 面向配置项 -> 面向函数 （表面的函数，内在依旧是配置项，毕竟响应式的基础是对象） |
| Angular | 批量检查 -> 尝试响应式 | OOP(MVC) -> 尝试 OOP with signal                                                |

新兴框架：

Solid.js：类似 React 的语法（内在是 signal ）
Svelte：类似 Vue 的语法（内在是 signal ）
Preact：Preact 10 前模仿 React，10 引入了 signal 拓展包

## 我的看法（译者）

在我看来 Vue 2 & 3 在【更新范围】上找到了一个最佳的平衡点，它既不是粗颗粒的（比如，React）也不是细颗粒的（比如，Solid.js、Vue1.x），它的更新建立在组件的基础上。我很喜欢它。

同时，我又很佩服 React 对前端框架的探索，包括它的 Hook 与 Concurrent 都在前端领域造成了很深很深的影响，毫不夸张地说，它是跨时代的。
