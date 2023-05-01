# React 设计思想

> 参考自：https://react.dev/learn

## 纯函数

React 的组件是一个纯函数（对相同的输入，组件必须总是返回相同的 JSX），纯函数能最大地降低代码的出错性，但是全是纯函数的程式没有意义，一个程式只有造成副效果（与外部系统交互，比如，绘制画面、播放音频）才有意义，因此，React 需要一个方案，来将副效果引入到纯函数里（状态持久化、一些优化方式、与外部系统交互），此方案即 Hook。

Hooks 指的是采取 use 起始的函数，它们只能在组件或其他 Hook 里的顶级出现。Hook 是函数，但是更好地抽象是：此组件需要的额外功能的定义，就像顶级的 import 导入语法一样。

注意，在每次执行 Hook 时，都没有传入一个类似指定唯一 Hook 信息的标识符，这里没有任何 magic。在一个组件的每次渲染时，我们必须始终保证全部的 Hooks 要按次执行，便要求你的 Hook 必须只能出现在顶级，这种小小的限制，保证了组件的健壮性。简单来说 "React Hooks is not a magic but just an array."。

最重要的是，副效果不能在组件渲染时发生，可以在渲染前（比如，useState），也可以在渲染结束（比如，useEffect）。

### 复查模式

React 存在一个复查模式（组件 `<React.strictMode>` 包裹你需要复查的组件树），它会执行一个组件函数两次，采取重复执行组件函数来帮我们找到任何违反纯函数的组件。

### 小结

React 热衷纯函数的理由（纯函数要求恪守一些标准，从而铸造健壮的系统）：

1. 你的组件可在诸多环境下执行，比如 ServerRender、ReactNative，甚至是一些构建在 quickjs 的物联网设备上，而不仅仅是 Web 下
2. 你可直接对输入不变的组件跳过重新渲染，提高性能，这很安全（它们都是纯函数）
3. 函数式的等式相等保证了多路渲染(concurrent rendering)的可行性和安全性

## 受控组件与纯函数

React 全权接管了表单控件的输入（比如，`<input type="text">`），它接管了浏览器默认的输入行为，表单控件的内容完全由 React 给它指定的值控制。

以 React@16 举例：

```jsx
const Foo = () => {
  const constantMsg = 'hi'
  return <input type="text" value={constantMsg} />
}

ReactDOM.render(
  <div id="app">
    <Foo></Foo>
  </div>,
  document.getElementById('example')
)
```

将输出下列内容：

```txt
Warning: A bad property has been set: You provided a `value` property to a form field without any change handler such as onChange. This will render a read only field. Use `defaultValue` instead if the field should be mutable. Otherwise, set either `onChange` or `readOnly`.
  in input
  in Foo
  in div (from react-dom.development.js)
```

同时，你不能修改输入框控件的内容。

深入：

React 在 document 上挂载了 change input keydown keyup 等一系列与交互相关的事件处理器，以此来检查不该发生的 DOM 突变同时纠正它（纯函数不能存在这些副效果！）。

比如，当上面的 input 输入了内容，触发 input 事件，ReactDom 会在内部默认事件处理器结束时，对它的值恢复到最早的值。

## Why is mutating state not recommended in React?

There are some reasons:

1. **Debugging**: Your past logs won't get clobbered by the more recent state changes if you use `console.log` and don't mutate state. So you can clearly see how state has changed between renders.
2. **Optimizations**: Common React optimization strategies rely on skipping work if previous props or state are the same as the next ones. It is very fast to check whether there were any changes if you never mutate state. You can be sure that nothing could have changed inside of it if `prevObj === obj`.
3. **New Features**: The new React features we're building rely on state being treated like a snapshot. That may prevent you from using the new features if you're mutating past versions of state.
4. **Requirement Changes**: Some application features, like implementing Undo and Redo, showing a history of changes, or letting the user reset a form to earlier values, are easier to do when nothing is mutated. This is because you can keep past copies of state in memory, and reuse them when appropriate. Features like this can be difficult to add later on if you start with a mutative approach.
5. **Simpler Implementation**: It does not need to do anything special with your objects because React does not rely on mutation. It does not need to hijack their properties, always wrap them into Proxies, or do other work at initialization as many "reactive" solutions do. This is also why React lets you put any object into state, no matter how large, without additional performance or correctness pitfalls.

In practice, you can often "get away" with mutating state in React, but we strongly advise you not to do that so that you can use new React features developed with this approach in mind. Future contributors and perhaps even your future self will thank you!

## 不存在的多根节点

一颗 JSX 有且只能有一个根节点，或者采取 `<React.Fragment>` 标签包裹多个“根”节点。JavaScript 的函数不能返回多个对象（你只能把多个对象放入到一个数组里），JSX 也是如此。

## 设计组件状态的指导方针

1. 耦合相关的状态：如果经常在同一时刻更新多个状态，请考虑将它们耦合在一起
2. 不要出现相冲突的状态：如果一个状态的变化会导致其他状态相冲突，需要重新设计它们，不然将埋下隐患
3. 不要出现冗余的状态：如果此状态可从 props 或其他 state 派生而来，就移除它
4. 不要重复：如果一个相同的值出现在多个状态里，或出现在一个状态的多个键里，这会很难在各种变化里让它们保持一致，减少重复的值，即 DRY(Don't Repeat Yourself)
5. 深嵌套：不要让一个对象出现很深的嵌套关系，将可能把它们拍平（或者采取 useImmer 来避免）

这些就像 DB 里表结构的范式一样。

## 逃生舱

useEffect 是 React 纯函数的逃生舱，它能让你走出 React 去和外部系统交互一些东西，减少非必要的 useEffect 来提高你代码的稳定性，从而提高代码的可读性和效率。

useRef 是 React 响应式的逃生舱，它的修改不受 React 控制，你可将一些与 React 组件渲染不相干的信息保存到此处，比如，定时器号码、DOM 节点、等等。

## useReducer

useReducer 的两个目的

1. 减少 useState 代码量
2. 与 reduce 方法一致：如果你的 reducer 恪守纯函数与不可变性，你甚至可以在 initialState 上重放一些 actions 从而得到未来的视图，即 reduce the actions to get the final view

## useImmer 代替 useState 降低对象不可变的样例代码

```jsx
const App = () => {
  // 采取 useImmer 来定义对象状态
  const [userinfo, updateUserinfo] = useImmer({
    name: 'ryzz',
    age: 24,
    langs: ['JavaScript', 'C', 'PHP', 'VB'],
    photo: '/user/resources/ryzz/photo/default',
  })

  const handleClick = () => {
    updateUserinfo((draft) => {
      // 这里的 draft 是 userinfo 值的一个 proxy，它观察和记录下修改的值
      // useImmer 深拷贝当前的值，在它的基础上重放这些修改
      draft.photo = '/user/resources/ryzz/photo/2023010101'
      draft.langs.push('Bash')
    })
  }

  // 省略 jsx 代码
}
```

## JSX 与模板

Vue3 提出了带转译时（即 Template 转到 Render）信息的 VNodes，Vue3 此框架将 compiling 和 running 两个环境相结合，极大地提高了框架的渲染效率，但是，这也带来了强入侵性。因此，它的适应性和灵活性远不足 JSX，但是足够简单和高效。

## 结语

React 不仅仅只是一个 Libaray（或 Framework），它更代表的是一个构建 UI 的思考方向。

UI 其实就是一个有限状态机（从页面 open 一直到 close），设计者画出的设计稿就是状态机的各个状态，即 state 派生出 UI。
