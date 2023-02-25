# Generator 函数（简称 Generator）

- 一个可暂停的函数
- 一个可编程的迭代器

## 最佳实践

与 Promise 组合，可以构建出自执行生成器技术（**书写简单但健壮的复杂异步操作组合**）。

一个基本的自执行生成器的实现：[autoRun](./autoRun.test.html)

这也正是 ES2017 的 `async function with await` 语法糖。
