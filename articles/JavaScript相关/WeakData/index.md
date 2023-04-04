# WeakMap 与 WeakSet

## 概述

这两个数据类型与 JavaScript 引擎的垃圾回收(GarbageCollection)息息相关，JavaScript 引擎在值【可达】或【可能被访问到】时会将其保持在内存中。

但 WeakMap 不会阻止垃圾回收对键（对象）的回收，一旦此对象不能被其他任何方法访问时，垃圾回收会将此对象和它关联的值一起回收掉，同理，WeakSet 不会阻止垃圾回收对值（对象）的回收。

示例：

```js
let userInfo = { name: 'Jack', age: 22 }

const weakMap = new WeakMap()
weakMap.set(userInfo, 'The user information of Jack.')

userInfo = null // 覆盖指向，使得userInfo之前指向的内容不再能被访问到

// 下一次浏览器引擎（JavaScript引擎）的 GC 时，之前 userInfo 占的内存将被回收
```

WeakMap 仅接收对象类型的键。对象被弱持有（弱指向），意味着如果对象本身被垃圾回收掉，那么在 WeakMap 中的记录也会被移除。这是代码层面观察不到的。同理，WeakSet 只是弱持有它的值（对象）。

由于随时可能给 GC 回收，故不能得到它当前全部 items 的长度，也不能迭代它。

WeakMap 只有这些方法：

- `get(key: Object)`
- `set(key: Object, value: any)`
- `delete(key: Object)`
- `has(key: Object)`

WeakSet 只有这些方法：

- `add(value: Object)`
- `delete(value: Object)`
- `has(value: Object)`

## 案例

保存一个数据的额外数据。两个数据就是主从关系（或依赖关系），当主数据消亡时，从数据也随之消亡，从而实现数据的自清理。

其中主数据大多数来自第三方包。

### 额外的数据

一个保存访客次数的第三方包：

```js
export const visitsCountMap = new Map() // map: user -> visits count

// 增加访客访问次数
export const countUser = (user) => {
  const count = visitsCountMap.get(user) || 0
  visitsCountMap.set(user, count + 1)
}
```

我们引入它：

```js
import { visitsCountMap, countUser } from './visits.js'

let userInfo = { name: 'Jack', age: 22 }

countUser(userInfo) // count his visits

// 一段时间，Jack 溜了
setTimeou(() => {
  userInfo = null
  setTimeout(() => {
    console.log(visitsCountMap.size)
    // 按理来说，Jack 对象现在需要被垃圾回收了，但是实际上，它将继续留在内存里，因为它是 visitsCountMap 的一个键
    // 我们还要清理 visitsCountMap，否则内存将泄露
    // 此时，如果 visitsCountMap 是 WeakMap 而非 Map，我们将省去这些烦人的清理工作
  }, 2 * 1e3)
}, 10 * 1e3)
```

### 缓存

A thirdpart package for calculating a complex data:

```js
export const cache = new Map()

// cache the all calculated result
export const process = (/* source: Object */ source) => {
  if (!cache.has(source)) {
    const result = /* calculations of the result for */ source
    cache.set(source, result)
  }
  return cache.get(source)
}
```

Use it:

```js
const sourceData = {
  /* 一些数据 */
}

// 首次需要
const result1 = process(sourceData) // calc it

// 其他也需要的地方
const result2 = process(sourceData) // and calc again

// 一段时间，不再需要此数据了
setTimeout(() => {
  sourceData = null
  setTimeout(() => {
    console.log(cache.size) // Oops! 它还存在在内存里！We need WeakMap instead! 我们需要WeakMap！
  }, 2 * 1e3)
}, 4 * 1e3)
```

## WeakMap 的 polyfill

```js
var WeakMap = function () {
  // 假设已存在 getUUID
  this.name = '__wm__' + getUUID()
}
WeakMap.prototype.set = function (key, value) {
  Object.defineProperty(key, this.name, {
    // 重点
    value: [key, value],
  })
  return this
}
WeakMap.prototype.get = function (key) {
  var entry = key[this.name] // 取到 set 时候放在目标对象键值对的值
  return entry && (entry[0] === key ? entry[1] : undefined)
}
```
