# WebWorker - DedicatedWorker

**WebWorker 是真正的操作系统级别的线程。它们是 W3C 的标准而非 JavaScript 的，使浏览器端的 JavaScript 赋能多线程技术。**

WebWorker 目前主要的类型:

1. DedicatedWorker = `window.Worker`
2. SharedWorker = `window.SharedWorker`
3. ServiceWorker = `navigator.serviceWorker`

其中，ServiceWorker 需要上下文安全（即 localhost 和 HTTPS），而且它是单例模式（即一个 same-origin 只能存在一个 ServiceWorker）。

传送门：

1. [SharedWorker](../SharedWorker/index.md)
1. [ServiceWorker](../ServiceWorker/index.md)

大多数情况下 WebWorker 或 Worker 指的都是 DedicatedWorker。

## 构造器

```js
new Worker(workerURL, ?options) // must be under same-origin policy
// workerURL：需要载入的worker路径（可以是BlobURL，甚至可以是DataURL），同时MIME必须是text/javascript（或合法的JavaScript类型）
// options: {
//   type: ('classic' | 'module') = 'classic', // worker的类型，对于Chrome>=80支持module，从而在worker间使用标准模块化技术，而Firefox目前的最新版本102依旧不支持
//   ?name: string, // 此worker的名字（主要方便debug）
//   ?credentials: ('omit' | 'same-origin' | 'include' = 'omit') // 凭证，如果是classic的worker默认moit，即不需要凭证
// }

```

## 数据传递

worker 的 postMessage 传递的是数据的副本（传值而非传址），数据被[**结构化的克隆**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)拷贝和传递，可以简单地理解为强化的 JSON，它还能传递 JS 专有的数据类型。

不过可以通过 postMessage 的第二个参数直接转让一个数据。

### 转让数据

当需要 postMessage 发送大体积的数据时（比如，一个数据量很大的 ArrayBuffer），如果是复制传递将很消耗内存，此时，我们可以直接转让这个数据。

示例：

```js
const w = new Worker('./testWorker.js')
const largeData = new ArrayBuffer(8192) // 模拟一个很大的数据
// w.postMessage(largeData) // 不好，现在内存里直接出现两个相同的大块数据！
w.postMessage({ data: largeData }, [largeData]) // 第二个参数是一个可传递对象数组，描述发送出去的数据里需要被转让的数据
console.log(largeData.byteLength) // 输出 0，因为此数据已经被转让

// 当worker处理好数据了，可以同样postMessage把数据再转让回来（如果需要的话）
```

可传递对象：ArrayBuffer、MessagePort、ReadableStream、WritableStream、TransformStream、等等

TransferableObject: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects>

## 访问限制

- worker 运行在独立的上下文（有自己独立的事件循环），worker 内部的全局对象不是 window，也不包含 window，使用 self 或全局的 this 来访问 worker 的[全局对象(DedicatedWorkerGlobalScope)](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope)
- 除了不能直接操作父页面的 dom 及其相关操作，其他常用的浏览器 API 都能使用，比如 AJAX（不过返回的 response 的 responseXML 总是 null）、fetch、websocket、indexedDB、setTimeout、等等，但是 localStorage 和 sessionSorage 不能用，可以在此查看[具体的清单](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

## 导入脚本

语法：`[self.]importScript(path1, path2, ...)`

在 worker 内部引入脚本（直接在当前的 worker 环境内执行此脚本，相当于 C 语言的`#include`）。

The importScripts method **synchronously** imports and runs one or more scripts into the worker's scope。

## 子 worker

在 worker 内部可以继续生成 worker（路径相对父 worker 而非根页面），但必须与根页面保持相同的 same-origin，即全部的 worker 都需要与根页面 same-origin。

## 其他

workerInstance.terminate 方法：立刻终止此 worker，不会给 worker 留下剩余的操作机会

onmessageerror 事件：当此 worker 收到非法的数据时

## 封装 webworker

参见[index.html](./index.html)里的 demo。
