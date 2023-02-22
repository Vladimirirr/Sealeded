# web worker

**下面的 worker 均指 web worker（也叫专用 worker），与 shared worker 、 service worker 、 audio worker 以及其他的 worker 相区分。**

**web worker 是真正的操作系统级别的线程。**

## 构造器

```js
new Worker(workerPath, ?options)
// workerPath：需要加载的worker的脚本路径（可以是本页面创建的BlobURL），必须返回有效且同源的JavaScript的mime类型，比如text/javascript
// options: {
//   type: 'classic' | 'module' = 'classic', // worker的类型，对于Chrome>=80支持module，从而在worker之间使用标准的模块化编程，而Firefox目前的最新版本102依旧不支持
//   name?: string, // 此worker的名字，用于调试
//   credentials？: 'omit' | 'same-origin' | 'include' = 'omit' // 指定凭证，如果是classic的worker默认moit，即不需要凭证
// }

```

## 数据传递

worker 的 postMessage 传递的是数据的副本（传值而非传址），数据使用[**结构化克隆算法**](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)进行拷贝并传递，结构化克隆算法可以简单地理解为升级版的 JSON 算法，因为它还能传递 JS 的特殊数据类型（函数、Symbol），还可以解决循环引用问题。

不过可以通过 postMessage 的第二个参数开启传址方式（传递一个对象的引用），即转让一个对象。

## 限制访问

- worker 运行在独立的上下文（有自己独立的事件循环），worker 内部的全局对象不是 window，也不包含 window，使用 self 或全局的 this 来访问 worker 的[全局对象(DedicatedWorkerGlobalScope)](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope)
- 除了不能直接操作父页面的 dom 及其相关操作，其他常用的浏览器 API 都能使用，比如 AJAX（不过返回的 response 的 responseXML 总是 null）、fetch、websocket、indexedDB、setTimeout、等等，但是 localStorage 和 sessionSorage 不能用，可以在此查看[具体的清单](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)

## 导入脚本

语法：`[self.]importScript(path1, path2, ...)`

在 worker 内部引入脚本（即在当前的 worker 环境内执行此脚本，相当于 C 语言的`#include`）。

将同时下载多个脚本，但是执行顺序严格按照书写顺序，且 importScript 是同步执行，只有当全部的脚本执行完才释放 JS 控制权。

## 子 worker

在 worker 内部可以继续生成 worker（路径解析相当于父 worker 而非根页面），但必须与跟页面同源，即全部的 worker 都需要与根页面同源。

## 其他

workerInstance.terminate 方法：立刻终止此 worker，不会给 worker 留下剩余的操作机会

onmessageerror 事件：当此 worker 无法解析收到的数据时

## 封装 webworker

参见[index.html](./index.html)里的 demo。
