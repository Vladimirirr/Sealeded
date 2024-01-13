# lodash

官网：<https://github.com/lodash/lodash>

一套 JavaScript 工具方法集，是 underscore 的继承者。

## 链式

Use `_.chain(dataSource).methodA(func).methodB(func)[...methods].value()` to open an operations chaining.

## 常见工具

排除了 JS 语言已经内置支持的工具方法。

### 数组

#### chunk

函数：`chunk(array, size = 1)`

数组按 size 分组。

#### compact

函数：`compact(array)`

数组去除假值（`false`、`null`、`0`、`undefined`、`NaN`）。

#### first

函数：`first(array)`

取数组首项。

#### last

函数：`last(array)`

取数组末项。

#### flatten

#### flattenDeep

#### flattenDepth

#### fromParis & fromEntries

#### take

#### takeWhile

#### takeRight

#### takeRightWhile

#### uniq

### 集合

#### countBy

#### groupBy

#### orderBy

#### sortBy

#### sample

#### sampleSize

#### shuffle

### 函数

#### curry

#### curryRight

#### debounce

#### throttle

#### deley

#### once

#### partial

#### partialRight

### 语言

#### clone

#### cloneDeep

#### isEqual

深对比两个值，支持 JS 全部的内置类型，包括：基础类型 和 Object Array ArrayBuffer Date RegExp Map 等对象类型。

#### isNil

等于 `value == null`。

#### toArray

相当 `Array.from`。

#### toNumber

相当 `parseInt(x, 10)` + `parseFloat(x)` + `Number(x) | +(x)`。

#### toString

相当 `String(x) | (x) + ''`，但是 null 和 undefined 结果是空字符串。

### 数学

#### max

即 `Math.max(a,b,c,d)`，它是 `_.max([a,b,c,d])`。

#### min

#### mean

平均值。

#### sum

和。

#### clamp

#### range

#### inRnage

#### random

### 对象

#### assign

#### assignIn

类似 assign，但还会复制它的 `__proto__`。

#### get

读取对象路径给定的值。

#### set

设置对象路径给定的值。

#### unset

移除对象路径给定的值。

#### update

更改对象路径给定的值。

#### defaults

#### defaultsDeep

#### entries & paris

#### forIn

对象的 `forEach`。

#### invert

对象键值对反转。

#### invoke

执行对象键路径上的方法。

#### keys

#### values

#### mapKeys

#### mapValues

#### omit

#### pick

### 字符串

#### camelCase

#### kebabCase

#### snakeCase

#### capitalize

#### startsWith

#### endsWith

#### repeat

#### truncate

#### words

### 其他

#### attempt

#### constant

#### defaultTo

#### flow

#### flowRight

#### identity

#### noop

#### property

#### times

#### uniqueId

### Seq

#### \_

创建隐式链。

#### \_.chain

创建显式链。

#### .tap

修改链中某一个环节里的值，直接修改值本身。

```js
_([1, 2, 3, 4])
  .tap((arr) => {
    // 改变传入的数组
    arr.shift()
  })
  .reverse()
  .value()
// => [2, 1]
```

#### .thru

类似 `.tap`，但根据旧值返回需要的结果值。

```js
_([1, 2, 3, 4])
  .thru((arr) => {
    // 改变传入的数组
    return arr.slice(1)
  })
  .reverse()
  .value()
// => [2, 1]
```

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
