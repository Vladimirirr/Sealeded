# 类型转换

## 基础值

### 转换到布尔值

- 对象始终是 true
- 空字符串、0、null、undefined -> false

### 转换到数字

- true -> 1
- false -> 0
- 数字字符串 -> 数字

### 转换到字符串

- true -> 'true'
- false -> 'false'
- 数字 -> 数字字符串

## 对象的 toPrimitive

JavaScript 不能重载操作符（C++、Ruby、Python、等语言可以），因此我们不能控制诸如 `console.log(obj1 - obj2)` 减法操作的结果。在这情况下，对象会被尝试转换到基础值，然后操作这些基础值，从而得到结果（也是一个基础值）。

JavaScript 把对象转换到什么样的类型（数字或字符串）取决上下文的 hint 值：

- `'string'` 希望：对象 -> 字符串
- `'number'` 希望：对象 -> 数字
- `'default'` 希望不清晰

这里没有布尔值（全部的对象在布尔上下文里都是 true）。

JavaScript 会以下面的方式将对象转换到基本值（伪代码表示）：

```js
const __toPrimitive__ = (o, currentOperatingContext) => {
  // 得到当前转换提示hint
  const hint = currentOperatingContext.hint

  // 检测得到的值是否符合
  const failCheck = (v) => {
    // 内置方法，检测是否是基础值
    if (isNotPrimitive(v)) {
      throw TypeError('Cannot get a primitive value from the object.')
    }
  }

  // 列出对象的全部转换方法（全部3个）
  const toPrimitive = o[Symbol.toPrimitive]
  // toString 和 valueOf 是很早就已经存在的方法，因此它们不是 Symbol 的形式存在
  // toString 对 对象 默认得到 '[object Object]'
  // valueOf 对 对象 默认得到它自己
  const toString = o.toString
  const valueOf = o.valueOf

  // 转换的结果
  let res = undefined

  if (toPrimitive) {
    res = toPrimitive.call(o, hint)
    failCheck(res)
  } else {
    const get = (fns) => {
      for (const f of fns) {
        res = f.call(o)
        if (isPrimitive(res)) {
          break
        }
      }
    }
    switch (hint) {
      case 'string':
        // 常见希望输出字符串的操作，比如 alert
        get([toString, valueOf])
        break
      case 'number': // 常见希望输出数字的操作，各种数学操作
      case 'default': // 其他操作，很少出现此情况
        get([valueOf, toString])
        break
    }
    // 只有当 toString 与 valueOf 返回的都不是基本值才报错
    failCheck(res)
  }

  return res
}
```

因此，我们只需实现其中任何一个方法即可让对象转换到基础值。

标准没有规定这些方法必须要返回 hint 标识的类型，只需要返回基础值即可，toString 也可以返回非字符串类型，这是旧时的设计问题遗留导致的，例如：

```js
const o = {
  // valueOf 返回了一个字符串
  valueOf() {
    return '2'
  },
}

console.log(o * 2) // 4，对象被转换到基础值字符串 "2"，不过立刻被乘法符号转换到数字 2。
```

文档地址：<https://tc39.es/ecma262/#sec-toprimitive>

## 【双等号】规则 ([ES5.1](http://es5.github.io/#x11.9.3))

`x == y`的行为：

1. x 和 y 是同类型
   1. x 是 undefined，返回 true
   2. x 是 null，返回 true
   3. x 是数字
      1. x 是 NaN，返回 false
      2. y 是 NaN，返回 false
      3. x 和 y 相等，返回 true
      4. x 是 +0，y 是 -0，返回 true
      5. x 是 -0，y 是 +0，返回 true
   4. x 是字符串，字符和 y 完全相等，返回 true
   5. x 是布尔值，y 是它的同类型，返回 true
   6. x 和 y 都指向一个对象，返回 true
2. x 是 null，y 是 undefined，返回 true
3. x 是 undefined，y 是 null，返回 true
4. x 是数字，y 是字符串，返回 x == toNumber(y)
5. x 是字符串，y 是数字，返回 toNumber(x) == y
6. **x 是布尔值，返回 toNumber(x) == y**
7. **y 是布尔值，返回 x == toNumber(y)**
8. x 是字符串或数字，y 是对象，返回 x == toPrimitive(y)
9. x 是对象，y 是字符串或数字，返回 toPrimitive(x) == y
10. 返回 false

## 举例

```js
const whatIsTheResult = !!([] + '') == 0
// whatIsTheResult 的值是 true
// 解释：
// 0. （前置条件）【双等】而非【三等，也叫做全等】，且等号左右两侧的类型不相同，JavaScript引擎将隐式类型转换，尝试将它们转为相同的类型，再进行比较，对于【三等于】来说，如果等号左右两侧类型不相同，直接返回false
// 1. `[] + ''` -> `[].toString() + ''` -> `[].join('') + ''` -> `'' + ''` -> `''` 最终得到空字符串
// 2. `!!''` -> false 最终得到布尔假值，因为空字符串视作假值
// 3. false -> 0 最终得到数字0
// 0 === 0 成立，最终输出true
```
