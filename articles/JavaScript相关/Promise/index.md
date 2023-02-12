# Promise

Promise 目的：使异步任务**可控制可信任**且**高效地链式组合**的技术

传统基于回调函数的异步任务解决方案的缺点：

1. 不可信任，将 callback 传给其他 api，如果此 api 有潜在的 bug 将影响到此 callback，比如此 api 没有正确地执行传给它的 callback（过多或过少地执行、或根本没有执行、或执行传入的参数不符合预期、等等）
2. callback 的嵌套写法带来的死亡金字塔代码

Promise 如何解决：

1. 创建一个 promise，由此 promise 代理此 api 的状态变更和对应的 callback
2. 支持链式语法

Promise 执行的时机：每轮事件循环的微任务阶段，JavaScript 引擎将收集和执行全部已经决议的 promise，遇到未被捕获的拒绝的 promise 将抛出异常
