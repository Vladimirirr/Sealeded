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
new Worker(workerPath, ?options) // under same-origin policy
// workerPath：需要载入的worker的文件路径（可以是本页面创建的BlobURL），必须返回有效的JavaScript的mime类型，比如text/javascript
// options: {
//   type: 'classic' | 'module' = 'classic', // worker的类型，对于Chrome>=80支持module，从而在worker之间使用标准的模块化编程，而Firefox目前的最新版本102依旧不支持
//   name?: string, // 此worker的名字（主要方便debug）
//   credentials？: 'omit' | 'same-origin' | 'include' = 'omit' // 指定凭证，如果是classic的worker默认moit，即不需要凭证
// }

```

## 数据传递

worker 的 postMessage 传递的是数据的副本（传值而非传址），数据使用[**结构化的克隆**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)进行拷贝和传递，可以简单地理解为强化的 JSON，它还能传递 JS 专有的数据类型。

不过可以通过 postMessage 的第二个参数使用传址方式（传递一个对象的引用），即转让一个对象。

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
