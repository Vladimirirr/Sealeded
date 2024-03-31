# Promise APIs

## Basic API

### Promise.resolve

语法：`Promise.resolve(value: any): Promise`

将传入的值决议（包装）为一个 Promise 对象：

1. 如果传入的已经是 Promise，直接返回它本身
2. 如果传入的是 Thenable，调用它的 then 方法（传入 resolve 和 reject），此 then 方法的返回值在此处没有意义
3. 返回此值 fulfilled 决议的 Promise

是 `new Promise((resolve, reject) => resolve(value))` 的简写形式。

### Promise.reject

语法：`Promise.reject(reason: Error | any): Promise`

返回一个 rejected 决议的 Promise 对象，reason 是传入的值（通常是一个 `Error` 对象）。

是 `new Promise((resolve, reject) => reject(reason))` 的简写形式。

与 `Promise.resolve` 不同，它总是将传入的值当作这个被拒绝的 Promise 的 reason，即便此值本身已经是一个 Promise 了，即：

```js
const okPromise = Promise.resolve()
const errPromise = Promise.reject(okPromise)

console.log(errPromise === okPromise) // false

errPromise.catch((reason) => {
  console.log(reason === okPromise) // true
})
```

### Promise Constructor

语法：`new Promise((resolve, reject) => void): Promise<any>`

构造一个 Promise 对象，传入一个函数，一旦此 Promise 对象已构造，会立刻同步地执行此函数，忽略此函数的返回值。在函数体内，你需要在特定的时间点调用 resolve 或 reject 来保证此 Promise 对象决议。

此函数体内的任何错误抛出，会立刻中止此函数的执行，但不会冒泡出去，意味着仅仅只是中止此函数，不会导致当前的整个执行栈中止，此错误会被设置为构造的 Promise 对象被拒绝的 reason。

如果 Promise 对象已经决议（执行了 resolve 或 reject 方法），在继续执行的途中却又发生了错误，此错误不会使此 Promise 对象的状态发生变化，因为决议不能撤销。

注意：

- resolve：传入非 Promise 值会使此 Promise fulfilled，传入 Promise 则根据此 Promise 的决议而决议（如果传入的 Promise 已经或变得 rejected，那么此 Promise 也将是 rejected）
- reject：不管传入什么都直接使此 Promise rejected

唯一需要 Promise 构造器的场景是，将 callback-based API 转换到 promise-based API：

```js
// 将 callback-based 的 setTimeout 转换到 promise-based 的 delay 方法
const delay = (time) => new Promise((resolve) => setTimeout(resolve, time))
```

不能 resolve 自己：

```js
const foo = new Promise((resolve) => {
  // The resolve has to be called asynchronously, so the foo variable is ready.
  setTimeout(() => resolve(foo))
  // Chrome = TypeError: Chaining cycle detected for promise.
  // FF     = TypeError: A promise cannot be resolved with itself.
})
```

## Status API

### Promise.prototype.then

语法：`then(onFulfilled?: Function = (v) => v, onRejected?: Function = (reason) => { throw reason }): Promise<any>`

此方法将一对回调函数注册到此 Promise 上，并立刻（同步地）返回一个新的 Promise，此 Promise 由传入的其中一个回调函数的结果决议。

注意，then 对传入的回调调用是非同步的，Promise 决议的检查永远在一次事件循环结束时的微任务阶段，意味着，即使当前 then 的 Promise 早已经决议，它也不会立刻同步地调用传入的回调函数。

then 返回的 Promise 的决议情况根据不同的回调执行结果而不同：

1. 返回一个非 Promise 的值：此 Promise 被 fulfilled 为此值
2. 无返回值：此 Promise 被 fulfilled 为 `undefined`
3. 回调抛出错误：此 Promise 被 rejected 为此错误
4. 返回一个 resolved Promise：此 Promise 被返回的 Promise 的值决议
5. 返回一个 rejected Promise：此 Promise 被返回的 Promise 的错误决议
6. 返回一个 pending Promise：此 Promise 随着返回的 Promise 的决议而决议

### Promise.prototype.catch

语法：`catch(onRejected?: Function = (reason) => { throw reason }): Promise<any>`

此方法是 `Promise.prototype.then(undefined, onRejected)` 的简写。

### Promise.prototype.finally

语法：`finally(onFinally?: Function = () => {}): Promise<any>`

当一个 Promise 决议时，它能减少在 onFulfilled 和 onRejected 里相同的代码，从而降低代码的冗余。

它很像 `.then(onFinally, onFinally)` 但是有一些小区别：

1. onFinally 函数不会被传入任何的参数，通常此处理器不需要关注决议的状态
2. onFinally 函数如果返回拒绝的 Promise 或抛出错误，那么它返回的 Promise 也会被拒绝，否则它返回的 Promise 与它监听的 Promise 具有相同的决议结果
3. onFinally 不能消除未处理的拒绝的 Promise 的检查报告

示例：

```js
const testPromise = Promise.resolve(10)

// 下面的 finally 即刻返回的 Promise 状态是 pending，在本轮 EventLoop 的 microtask 阶段会检查所有的 Promise（一个 fulfilled，四个 pending）
// testPromise 已经 fulfilled，而且存在 new handlers，即下面的 4 个 onFinally
// 执行这些 onFinally，最终
// tesd1Promise -> fulfilled with testPromise's status
// tesd2Promise -> fulfilled with testPromise's status
// tesd3Promise -> rejected with its returned rejected Promise's status
// tesd4Promise -> rejected with its thrown error

setTimeout(
  console.log, // log: Promise{ fulfilled: 10 }
  0,
  testPromise.finally(() => 20) // tesd1Promise
)

setTimeout(
  console.log, // log: Promise{ fulfilled: 10 }
  0,
  testPromise.finally(() => Promise.resolve(20)) // tesd2Promise
)

setTimeout(
  console.log, // log: Promise{ reject: 20 }
  0,
  testPromise.finally(() => {
    throw 20
  }) // tesd3Promise
)

setTimeout(
  console.log, // log: Promise{ reject: 20 }
  0,
  testPromise.finally(() => Promise.reject(20)) // tesd4Promise
)
```

## Concurrency API

这些方法是关于多个 Promise 相互竞争（并发）的竟态方法。

参数注意：

- 下面代码里的输入参数都是一个 Promise 数组，但是标准里此输入参数其实是一个 Promise 迭代器
- 当 Promise 迭代器输出非 Promise 时，会被 `Promise.resolve` 包装

### Promise.all

语法：`Promise.all(Array<Promise<any> | any>): Promise<Array<any>> | Promise<{ status: 'rejected', reason: Error | any }>`

等待所有 Promise 决议，输出的数组依次是这些 Promise 的决议值。

返回值：

- **already fulfilled**：传入空数组
- **asynchronously fulfilled**：传入的 Promise 数组都已经或变得 fulfilled
- **asynchronously rejected**：传入的 Promise 数组有一个已经或变得 rejected

注意：

- 如果传入的其中一个 Promise 被拒绝，整个 `Promise.all` 也随之被拒绝，同时忽略所有其他的 Promise 和它们的结果，当然，其他的 Promise 仍在进行（因为 Promise 不能被取消），但是它们的结果不再被 `Promise.all` 关注

### Promise.allSettled

语法：`Promise.allSettled(Array<Promise<any> | any>): Promise<Array<{ status: 'fulfilled' | 'rejected', value: any, reason: Error | any }>>`

等待所有 Promise 决议，但不论结果如何，意味着，即使存在拒绝决议的 Promise，仍对其他的感兴趣。

返回值：

- **already fulfilled**：传入空数组
- **asynchronously fulfilled**：传入的 Promise 数组都已经或变得决议（不论是 fulfilled 还是 rejected）

它的 Polyfill：

```js
const allSettled = (promises) => {
  const resolve = (value) => ({ status: 'fulfilled', value })
  const reject = (reason) => ({ status: 'rejected', reason })
  const process = (p) => Promise.resolve(p).then(resolve, reject)
  const promises2 = promises.map(process)
  return Promise.all(promises2)
}
```

### Promise.race

语法：`Promise.race(Array<Promise | any>): Promise`

只等待首个决议的 Promise 而不论它是什么状态，一旦有决议的，其他的 Promise 不论什么状态都将被忽略。

返回值：

- **always pending**：入空数组
- **asynchronously settled**：传入的 Promise 数组有一个已经或变得 settled

### Promise.any

只等待首个成功决议的 Promise，如果所有 Promise 都拒绝，返回一个 reason 是 AggregateError 错误的拒绝的 Promise（此错误对象的 `errors` 属性中保存着所有拒绝的 Promise 的 reason）。

此 API 具备短路特性，如同 JavaScript 语言的操作符 `||` 一样。

返回值：

- **already rejected**：传入空数组
- **asynchronously fulfilled**：传入的 Promise 数组有一个已经或变得 fulfilled
- **asynchronously rejected**：传入的 Promise 数组都已经或变得 rejected

#### 示例：AggregateError

```js
const a = Promise.any([Promise.reject(1), Promise.reject(2)])
setTimeout(() => console.log(a))

// in Chrome
// Promise { status: "rejected", reason: AggregateError{message: "All promises were rejected.", errors: [1, 2]} }
// in FF
// Promise { status: "rejected", reason: AggregateError{message: "No Promise in Promise.any was resolved.", errors: [1, 2]} }
```

#### 示例：检测请求是否已经超时

```js
/**
 * @param {() => Promise<any>} request
 * @param {number} timeout
 * @return {Promise<any>}
 */
const requestWithTimeout = (request, timeout) => {
  const timeouter = new Promise((resolve, reject) =>
    setTimeout(reject, timeout, new Error('Request timed out.'))
  )
  return Promise.race([request(), timeouter])
}
```

#### 示例：检测一个 Promise 当前的状态

```js
/**
 * @param {Promise<any>} promise
 * @return {Promise<any>}
 */
const getPromiseStatus = (promise) => {
  const pending = { status: 'pending' }
  return Promise.race([promise, pending]).then(
    (v) => (v === pending ? v : { status: 'fulfilled', value: v }),
    (err) => ({ status: 'rejected', reason: err })
  )
}
// The getPromiseStatus function still runs asynchronously, because there is no way to synchronously get a promise's value, even when it is already settled.
// The getPromiseStatus function always fulfills within one tick and never actually waits for any promise's settlement.
```

## Helper API

### Promise.withResolvers

语法：`Promise.withResolvers(void): Object({ promise: Promise, resolve: Function, reject: Function })`

此函数其实是下面样板代码的简写方法：

```js
const getPromiseResolvers = () => {
  let resolve, reject
  const promise = new Promise((resolve0, reject0) => {
    resolve = resolve0
    reject = reject0
  })
  return { promise, resolve, reject }
}
```

使用情景通常是，你的 promise 需要其他的事件侦听器来决议，而此事件侦听器又不能放置在 Promise 构造方法内部。

## 兼容性

| API           | Chrome        | Firefox       | Safari         |
| ------------- | ------------- | ------------- | -------------- |
| resolve       | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| reject        | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| constructor   | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| all           | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| allSettled    | 76 (2019-07)  | 71 (2019-12)  | 13 (2019-09)   |
| race          | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| any           | 85 (2020-08)  | 79 (2020-07)  | 14 (2020-09)   |
| withResolvers | 119 (2023.10) | 121 (2023.12) | 17.4 (2024.03) |
| then          | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| catch         | 32 (2014-01)  | 29 (2014-04)  | 8 (2014-10)    |
| finally       | 63 (2017-12)  | 58 (2018-01)  | 11.1 (2018-04) |
