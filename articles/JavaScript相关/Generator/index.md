# Generator 函数（简称 Generator）

一个可以被暂停的函数、一个可以被编程的迭代器，JavaScript 里协程的实现。

最佳实践：与 Promise 组合，可以构建**书写简单但健壮的复杂异步操作组合**，这也就是 ES2017 最受关注的`async function`语法糖

扩展：React 的 fiber 架构就是一种协程设计思想（渲染过程可暂停或中断），不过 React 没有使用 JavaScript 原生提供的 Generator 协程（出于一些客观原因），而是自己实现了一套更适用于 React 并发渲染机制的协程架构
