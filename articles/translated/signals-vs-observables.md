# 信号与可观察值

> 文章 [Signals vs. Observables.](https://www.builder.io/blog/signals-vs-observables) 的中文翻译。

框架与信号已经有很多的讨论了。但一个内在的问题是，信号与可观察值有何不同。好吧，这是一个很好的问题，也是本文的目标。

## 如何思考信号和可观察值

我们都知道【值】是什么：

```js
// 定义
const answer = 42
// 输出
console.log(answer)
```

这是信号：

```js
// 定义 方式1
const answer = useSignal(42) // answer.value 是一对 getter 和 setter
// 定义 方式2
const [getAnswer, setAnswer] = createSignal(42) // getAnswer -> getter  setAnswer -> setter
// 输出
console.log(answer.value)
console.log(getAnswer())
```

这是可观察值：

```js
// 定义
const answer = observable.from([42])
// 输出
answer.subscribe((value) => console.log(value))
```

在我看来，可观察值能突出，是因为它是唯一我们不能直接得到值的一种情况。相反，我们被要求创建一个 callback 和一个 subscriber。这是它与信号的核心不同点。

## 类比

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F7b8ddad9e3d34bb3ab35771d91e13d4d" />

假设我们在上图里有一个圆表示的值，我们都知道如何操作它，可以将它（或它的 reference）传递到 APP 的其他地方。

APP 的任何地方都可以读取值，但值不是响应式的！“观察者” 不能 “知道” 值何时发生了变化。因此，虽然处理值很简单，但它缺乏响应性！

信号就像一个包含该值的桶。您可以像将值传递给 APP 的其他地方一样传递桶。传递的是桶，因此 APP 可以随时查看存储桶（读取）或更新存储桶里的内容（写入）。

它是一个桶，因此桶 “知道” 什么时候发生了读或写，也因此，现在 “观察者” 可以 “知道” 什么时候发生了读写。能够 “知道” 何时有读或写是信号响应式的根基！

一个可观察值的与一个普通值或一个信号是截然不同的。可观察值就像一根管道，在任何时候，管道都可以传递。这有多个含义，首先，你不能直接盯着你需要的管道看，相反，您必须传入一个 callback，以等待值出现时以执行它。第二，可观察值随时间传递一系列的值。这个 “时间” 概念是可观察值的核心。（信号没有时间的概念，它只是桶里的东西）

这就是为什么在上面的例子里，我们可以直接读取值或信号，但需要给可观察值创建 callback。此不同（即值的桶与随时间传递值的管道的不同）是信号和可观察值的核心不同点，它会导致很多隐藏的含义。让我们来探讨这些含义。

## 传递 reference 和时间推移

让我们复习一下。

值可以在 APP 里传递，这很常见。

不论是信号还是可观察值，我们都不传递值，而是传递一个包含感兴趣值的容器。这是一个重要的不同，传递容器意味着使您在获得需要传递的值前将其传递给 APP 的其他地方。根本上，传递容器让您设置系统的 “管道”，然后通过管道传递值。

可观察值不是一个值的容器，而是一个随时间变化的值的容器。时间对可观察值的概念非常重要，可观察值随时间而变化，这里没有 “当前值” 的概念，这在可观察值概念里没有意义。相反，您必须传入一个 callback，当最新值出现时，可观察值将把它装入。

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F909d2ca6626144e1a804c3779e9be612" />

## 访问

通过 reference 访问一个值是最基本的，这就是普通的 JavaScript。访问信号的值也很简单，只不过它以 getter 的形式存在：

```js
// retrieving function style
const signalValue = signal()

// retrieving property getter style
const signalValue = signal.value
```

访问可观察值有点复杂，我们不能只研究一个可观察值，因为正如我们之前提到的，可观察值是随着时间推移的值。因此，可观察值要求我们传入一个 callback。

callback 有有趣的含义，这意味着我们的 callback 不会立即以最新值执行（和已经传递的值）。相反，在出现最新值前，什么都不会发生。

**信号是 pull 的，而 observable 是 push 的。**

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F399d1559ae9c470eaef8a780ece8c6a1" />

## 订阅

可以通过 subscribe 方法以传入 callback 来订阅可观察值。这称做 “显式” 订阅。（框架可以代表您来执行订阅）

虽然信号也可以有 “显式” 订阅，但大多数都依赖 “隐式” 订阅。让我们看一下它是如何工作的：

```js
const firstName = useSignal('')
const lastName = useSignal('')
const fullName = useComputed(() => lastName.value + ', ' + firstName.value)
```

在上面的例子里，useComputed 闭包在一个特殊的上下文里执行，此上下文 “观察” 信号读取同时记录它。这其实创建了一个 “隐式” 订阅，而不需要单独监视每一个信号。没有 “显式订阅” API。（许多信号的实现都没有 “显式订阅” 这个 API。）

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F30f2a301c0b24f02968374e68f11ca87" />

## Async Model

Signals are a synchronous execution model. One synchronously reads/writes values from/to the signals. If you want to process async code, most signal implementations have some “effect” APIs that allow you to do so.

The synchronous nature of signals is implicit in that they create “implicit” subscriptions. If the “computed” callback were async, it would not be possible for the context to observe the reads, as it would have no way of knowing how much into the future it should be observing reads/writes.

Observables are very much async in nature. After all, they are “values over time.” Time implies asynchronicity. But observable pipe implementations are often times a combination of sync and async callbacks.

For this reason, it is sort of a hybrid model. Pushing a new value into observable may or may not call the subscription synchronously.

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2Fc078eedc8db24fd1bd040930df2fb399" />

## Reactivity Graph

在可观察值里，通常在 “安装过程” 得到响应式依赖关系图，然后该图往往保持静态（有 API 可以更改它，但大多数人不会这样做）。

而信号往往非静态，以此代码为例：

```js
const location = useSignal('37°46′39″N 122°24′59″W')
const zipCode = useSignal('94103')
const preference = useSignal('location')

const weather = useComputed(() => {
  switch (preference.value) {
    case 'location':
      return lookUpWetherByGeo(location.value)
    case 'zip':
      return lookUpWetherByZip(zipCode.value)
    default:
      return null
  }
})
```

在上面的例子里，天气信号可以订阅 zipCode、location 或两者都不订阅，这取决偏好值。这就是信号的工作方式。

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F4c66e9b06d9c4fdfb59a6984ab317b2e" />

## 选择适合的方式

信号是否比可观察值更好？这是一个错误的问题。它们是独立的概念，是可观察值还是信号取决你试图实现什么样的目标。

如果随时间变化的值是你问题的关键，那么选择可观察值；如果信号的 “时间” 不是需要的，那么选择可观察值反而会更复杂。

在一个极端，你有各种值，它们很简单，但缺乏表现；还有一个极端是可观察值，它可以做任何东西，但需要复杂的 API；中间的便是信号，没有可观察值强大但更直观。

因此，值、信号还是可观察值是复杂性和表达性的权衡，您需要选择适合您的问题的内容。

<img src="https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F616e2864d5b047d4b768ab73942e9a89" />

## 在 UI 方面

如果你的问题领域是构建 UI，我认为可观察值极可能是不需要的。在一些领域，可观察值很突出，但对多数 UI，信号足矣，而且信号具有较简单的 API 设计，这一点在大多数情况下都是最佳的权衡，这便是为什么信号是 web 框架的未来。
