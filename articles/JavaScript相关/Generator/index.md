# Generator 函数（简称 Generator）

基本思想：一种可暂停的函数，是 JavaScript **协程**的原生实现

生成器其实也是**迭代器**。

最佳实践：与 Promise 组合，可以构建**书写简单但功能健壮的复杂异步操作组合**，这也就是 ES2017 最受关注的`async function`语法

扩展：

1. React 的 fiber 架构就是一种协程设计思想（渲染过程可暂停或中断），不过 React 没有使用 JavaScript 原生提供的 Generator 协程（出于一些客观原因），而是自己实现了一套适用于 React 并发渲染机制的协程架构
