# lodash

## 链式方法

Use `_.chain(dataSource).methodA(func).methodB(func)[...methods].value()` to open an operations chaining.

## 集合操作

```js
import _ from 'lodash'

const a = ['A', 'B']
const b = ['A', 'C', 'D']

console.log(_.intersection(a, b)) // 交集：a 和 b 相同的项
console.log(_.union(a, b)) // 全集 ：a 和 b 全部的项（已去重）
console.log(_.xor(a, b)) // 补集：a 没有的项 + b 没有的项（即 = 全集 - 交集）
console.log(_.difference(_.union(a, b), _.intersection(a, b))) // 补集：全集 - 交集

// output
// ['A']
// ['A', 'B', 'C', 'D']
// ['B', 'C', 'D']
// ['B', 'C', 'D']
```
