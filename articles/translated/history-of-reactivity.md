# 响应式的发展史

> 文章 [A Brief History of Reactivity.](https://www.builder.io/blog/history-of-reactivity) 的中文翻译。

引入：

```js
// first
// manually
{
  const model = Backbone.Model.extend({
    defaults: {
      name: 'jack',
    },
    initialize: function () {
      this.on('name', this.onNameChange)
    },
    onNameChange: function () {
      console.log(`Name is ${this.get('name')}`)
    },
  })
}

// second
// automatically
{
  // ref is a kind of signal.
  // ref means a reference to a pair of getter and setter for the value.
  const name = Vue.ref('jack')
  watchEffect(() => {
    console.log(`Name is ${name.value}`)
  })
}

// third
// ?
```

这文章不是权威的响应式发展史，而是我自己的经验和看法。

## Adobe Flex

Adobe Flex 是 ActionScript 的一个框架，它是 ECMAScript4 的实现（与 JavaScript 同门），但它有能让一个字段当作订阅者的关键词：

```as
class MyComponent {
  [Bindable] public var name: string;
}
```

`Bindable`将创建一个响应式的依赖关系，Flex 附带了构建渲染 UI 的模板（细粒度）：

```xml
<mx:Application xmlns:mx="http://www.adobe.com/2006/mxml">
  <mx:MyComponent>
    <mx:Label text="{name}"></mx:Label>
  </mx:MyComponent>
</mx:Applicatio>
```

我怀疑 Flex 是最早存在响应式的地方，这也是我最早遇到的响应式。

在 Flex 里，响应式是一种难堪，因为它很容易创建更新风暴，有时，这会进入死循环。

## AngularJS

AngularJS 最早的目标是增强 HTML，以便设计者们可以简单地构建 web app，因此 AngularJS 最终选择了 HTML 语法来描述模板。Proxy、getter & setters 和 Object.observe 在当时都不是选项（对设计者们来说略显复杂）。因此，唯一可行的方案是全量检查 (Dirty Checking)。

此检查在每一次浏览器的一些宏任务结束时（比如，定时器、网络请求、UIEvents）读取模板中全部的依赖（以保证模板与状态一致）。

```html
<!DOCTYPE html>
<html ng-app>
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  </head>
  <body>
    <div>
      <label>Name:</label>
      <input type="text" ng-model="yourName" placeholder="Enter a name here" />
      <hr />
      <h1>Hello {{yourName}}!</h1>
    </div>
  </body>
</html>
```

这种方法的好处是实现简单，而且更新可以正常工作。

缺点是每一次更新都必须执行大量 JavaScript。AngularJS 不知道什么时候可能发生了变化，因此它运行全量检查的频率要比理论上必要的要高。

## React

React 出现在 AngularJS 同时（但在 Angular 前），对它有一些改良。

React 引入了 setState，这让 React 知道什么时候要对 vDOM 进行检查。这样做的好处是，与 AngularJS 不同，AngularJS 对每一个宏任务都会尝试检查，而 React 只在告诉它的时候才去检查。因此，即使 React vDOM 在检查上比 AngularJS 要昂贵，但它运行的频率更低。

```jsx
function Counter() {
  const [count, setCount] = useState()
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

## 粗颗粒

React 和 AngularJS 都是粗粒响应式的。这意味着数据的变化将触发大量的 JavaScript 执行，框架最终会将全部的变化统筹到 UI。这意味着一些快速变化的特性将导致性能问题（比如，JavaScript 模拟 CSS 的 animation 或 transition）。

## 细颗粒

上述问题的解决方案是改成细颗粒的响应式，其中状态的变化仅更新与它相关的节点，但是这最困难的是如何以良好 DX 的方式响应特性的变化。

## Backbone.js

Backbone.js 在 AngularJS 前，它具有细粒度的响应式，但语法非常冗长。

```js
var MyModel = Backbone.Model.extend({
  initialize: function () {
    // listen to the change of name on itself
    this.on('change:name', this.onNameChange)
  },
  onNameChange: function (model, value) {
    console.log('Model: Name was changed to:', value)
  },
})
var myModel = new MyModel()
myModel.set('name', 'jack')
```

在我看来，冗长的语法是 AngularJS 和 React 等框架代替它的根本，因为可以很简单地使用点符号来访问和设置状态，而不是一组很复杂的函数组合。

## Knockout

与 AngularJS 同时出现。我从未写过它的代码，但我的理解是，它也受到了更新风暴的影响。虽然这是对 Backbone.js 的一个改良，但它采取的可观察特性依旧很笨拙，这也是为什么没战胜 AngularJS 和 React 的重要一点。

但是 Knockout 有一个有趣的创新 —— computed，这可能以前就存在过，但这是我最早的真正了解到此功能。

它们会自创建输入的订阅：

```js
var ViewModel = function (first, last) {
  this.firstName = ko.observable(first)
  this.lastName = ko.observable(last)
  this.fullName = ko.pureComputed(function () {
    // Knockout tracks dependencies automatically.
    // It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
    return this.firstName() + ' ' + this.lastName()
  }, this)
}
```

注意，`ko.pureComputed` 执行 `this.firstName` 时，将隐式创建一个订阅。这是通过 `ko.pureComputed` 设置一个变量实现的，该变量允许这个 `firstName` 与 `ko.purecompute` 通信，同时将订阅信息传递给它，而不需要任何额外的工作。

## Svelte

Svelte 采取转译器的 AOT 同时结合了响应式。这里亮点是转译器，语法可以是你想要的任何内容，Svelte 组件有天生的响应式语法。 Svelte 不会转译非 .svelte 的文件，如果你想在未转译的文件引入响应，Svelte 提供了一个 API，但它缺乏转译的支持，且需要特定的订阅和取消订阅方法以显式表达，例如：

```js
const count = writable(0)
const unsubscribe = count.subscribe((value) => {
  countValue = value
})
```

在我看来，以两种不同的方式去做同一件事是不理想的，你必须在思维里保留两种不同的心智模型，因此最好采用单一的方式。

## RxJS

RxJS 是一个响应式工具包，不与任何渲染框架相关联。这似乎是一个亮点，但也有其不利之处。跳转到一个新页面需要拆除现有的 UI 再构建一个新的 UI，对 RxJS 来说，意味着需要许多的订阅和取消订阅。这种多出的工作意味着粗粒度的响应式系统在这种情况下更快，因为拆卸只是丢掉 UI（和一些必要的垃圾收集）。我们需要的是一种批量订阅和取消订阅的方式。

```js
const observable1 = interval(400)
const observable2 = interval(200)
const subscription = observable1.subscribe((x) =>
  console.log('[first](https://rxjs.dev/api/index/function/first): ' + x)
)
const childSubscription = observable2.subscribe((x) =>
  console.log('second: ' + x)
)
subscription.add(childSubscription)
setTimeout(() => {
  // unsubscribes BOTH subscription and childSubscription
  subscription.unsubscribe()
}, 1000)
```

## Vue3 and MobX

大约在同一时间，Vue 和 MobX 都尝试试验建立在代理基础上的响应式。代理的优点是，你可以得到干净的点语法，且有与 Knockout 相同的方式来创建自订阅的依赖。

```vue
<template>
  <!-- Vue模板的转译器让你省略了 count.value++ -->
  <button @click="count++">{{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(1)
</script>
```

上面的示例，模板通过在渲染时读取计数值来创建对计数的订阅（自订阅的），而不需要做任何其他的工作。

代理的缺点是不能传递 getter 的 reference。你可以传递整个代理或它其中的值，但你不能剥离其中一个值的 getter 而传递它。以下面的问题为例：

```jsx
function App() {
  const state = createStateProxy({ count: 1 })
  return (
    <div>
      <button onClick={() => state.count++}>+1</button>
      <Wrapper value={state.count} />
    </div>
  )
}

function Wrapper(props) {
  return <Display value={state.value} />
}
function Display(props) {
  return <span>Count: {props.value}</span>
}
```

当读取 state.count 时，得到的是基本值（数字），不再可观察，这意味着 Wrapper 和 Child 都需要重新呈现 state.count 的变化，我们失去了细粒度的响应式。理想情况下，只需要更新 `Count：xxxx` 此文本节点。我们需要的是一种将 reference 传递而不是值传递的方法。

## 走入信号

信号让你不仅持有此值，还让你持有此值的 getter 和 setter（或叫做 reference）。因此，你可以采取信号解决上述问题：

```tsx
function App() {
  const [count, setCount] = createSignal(1)
  return (
    <div>
      <button onClick={() => setCount(count() + 1)}>+1</button>
      <Wrapper value={count} />
    </div>
  )
}
function Wrapper(props: { value: Accessor<number> }) {
  return <Display value={props.value} />
}
function Display(props: { value: Accessor<number> }) {
  return <span>Count: {props.value}</span>
}
```

这个方案的好处是，我们传递的不是值，而是一个 getter。意味着，当计数的值发生变化时，我们不必经过 Wrapper 和 Display 而可以直接对此节点更新。它的工作方式与 Knockout 非常相似，但在语法上与 Vue 和 MobX 相似。

但这有一个 DX 问题，假设我们需要的是一个常量：

```tsx
<Display value={10} />
```

这将没效果，因为 Display 被定义为 Accessor：

```tsx
function Display(props: { value: Accessor<number> }) {}
```

这很不幸，组件的作者现在定义了消费者是否可以发送 getter 或值。不论作者选择什么，总会有一个案例没有被涵盖，这两者都是合理的做法：

```tsx
<Display value={10}/>
<Display value={createSignal(10)}/>
```

以上是 Display 的两种有效书写，但它们不可能同时存在！我们需要的是一种方法，将类型定义基本值：

```tsx
function App() {
  const [count, setCount] = createSignal(1)
  return (
    <>
      <button onClick={() => setCount(count() + 1)}>+1</button>
      <Wrapper value={count()} />
    </>
  )
}
function Wrapper(props: { value: number }) {
  return <Display value={props.value} />
}
function Display(props: { value: number }) {
  return <span>Count: {props.value}</span>
}
```

注意，我们定义了一个数字，而不是一个 getter。意味着，代码将正常工作：

```tsx
<Display value={10}/>
<Display value={createSignal(10)()}/> // Notice the extra ()
```

但这是否意味着我们现在已经破坏了响应式？答案是肯定的，只是我们可以让转译器执行一个技巧来恢复我们的响应式，在这一行：

```tsx
<Wrapper value={count()} />
```

执行 count 将得到基本值同时创建订阅，因此转译器会这样做。

```tsx
Wrapper({
  get value() {
    return count()
  },
})
```

通过将 count 以特性传递给子组件时将其封装在 getter 里，转译器成功地将 count 的执行延迟足够长的时间，直到节点真正需要它为止，对我们的书写来说这似乎是传递了一个值：

好处:

- 干净的语法
- 自订阅和取消订阅
- 组件不必在基本值和访问器之间抉择
- 即便将访问器转换到基本值，响应式也会起作用

## Reactivity and rendering

让我们想象这种情况：一个带有购买按钮和购物车的产品页面。

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F462fa726ceaa45bbac48c9a1a6e7714b" />

在上面的例子里，我们有一颗组件树。购买者可能采取的一种方式是点击购买按钮，这需要更新购物车。对于需要执行的代码，有两种不同的结果。

在一个粗粒度的响应系统里，它是这样的：

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fa04cf84ae4864600874910b1349ce9fb" />

我们必须找到 Buy 和 Cart 组件的共同根，这是最有可能附上状态的地方。然后，在更改状态时，与该状态相关联的树必须重现。采取缓存，可以将树修剪成两个最小的路径，如上图。但是仍有许多代码需要执行，特别是当组件树变得复杂时。

在细粒度的响应系统中，它看起来是这样的：

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F958e7be34d234dcfa7c90ca17e8d3858" />

请注意，只有目的地 Cart 需要执行。不需要查看状态定义的位置或共同根是什么，也不需要采取缓存来修剪树。细粒度响应式系统的好处在，我们不需要付出任何工作，即可在运行时执行最少的代码！

细颗粒响应系统如同精湛的外科医生。而且细颗粒使它非常适合代码的延迟执行，系统只需要执行状态的监视器（在我们的情况下是 Cart）。

但细粒度的响应系统有一个性能问题，需要给系统至少建立一次响应式关系依赖图，必须要执行全部的组件以建立！一旦建立起来，外科医生就可以上场了。这是最早执行的样子：

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F5523a7449125407c910a564412acaac1" />

看到问题了吗？我们希望降低这些在浏览器里下载和执行的组件的性能损失，但依赖图的首次建立迫使这些组件需要完整地下载和执行。

## Qwik

这就是 Qwik 的使武之地。Qwik 是细粒度的响应框架，类似 SolidJS，意味着状态的变化会直接更新节点（在某些情况下，Qwik 可能需要重现整个组件）。但 Qwik 有一个诀窍，还记得细粒度响应式要求全部组件至少执行一次以创建响应式依赖关系图吗？Qwik 采取了这样的方式，即，组件已经在 SSR/SSG 时执行了，Qwik 可以将此图放入 HTML 结果里，这让浏览器能直接跳过 “执行全部组件以了解响应式关系图”。我们叫做自恢复的水合，因为组件的这些代码不会在浏览器里下载再执行，因此 Qwik 的好处是立即活跃一个页面，接下来，响应式系统就是一位精湛的外科医生，精细地更新每一个节点。

## 结论

前端领域，我们见证了许多响应式的迭代。从最早的粗粒响应系统，因为它的思想很简单，但我们一直在追求细粒响应系统的性能，且在一段时间内逐渐解决了这个问题。最新一代的框架解决了围绕书写此类框架代码的体验、更新风暴和状态管理的诸多问题。我不知道你会选择的框架，但我敢打赌它将是细粒的响应式框架！
