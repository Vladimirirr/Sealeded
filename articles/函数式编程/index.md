# 函数式编程

简单描述：数据**流经**由**纯函数**组成的**管道**，最终得到结果。

基本概念：函数式编程属于标准的**声明式编程**。

举例：

```js
_.chain(originData) // 对此数据开启管道流
  .filter((i) => i.success) // 管道流的第一个中间件（一个纯函数）
  .mapKeys(
    // 第二个中间件
    (value, key) => (key === 'path' && value.startsWith('/') ? 'fullpath' : key)
  )
  .ifElse(
    // 第三个中间件
    // 与命令式if语句等价的方法
    (i) => !!(i.length % 2),
    (i) => {
      /* when true, do something */
    },
    (i) => {
      /* when false, do something */
    }
  )
  .value() // 得出最终的结果（惰性，直到执行value才会执行整个管道流）
```
