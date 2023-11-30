# run-limited-concurrency

Run concurrent works with a limit.

有限制地控制并发量。

参见 `test.html` 的示例以学习如何操作。

## 实现基理

1. JavaScript 单线程，一次只能处理一个任务
2. 迭代器的每次消耗都是唯一的值，不会出现重复的消耗

```js
// 实现基理的演示 demo

const delay = (t) => new Promise((a) => setTimeout(a, t * 1e3))

const doWork = async (it) => {
  console.log('doWork run')
  for (const value of it) {
    await delay(2)
    console.log('doWork log', value)
  }
}

const test = async (str) => {
  // 生成此字符串的迭代器
  const it = Array.from(str).values()

  // 限制同时并发数量最大是 2
  // 很简单，workers里有两个Promise同时在消耗同一个迭代器里面的值，当迭代器被消耗没了，这两个Promise随之决议
  const workers = new Array(2).fill(it).map(doWork)

  // begin
  await Promise.all(workers)

  // log
  console.log('finished')
}

test('ABCDEFG')
```
