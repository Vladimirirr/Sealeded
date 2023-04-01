# `===` 是如何比 `==` 快 15 倍的？

> 文章 [How can `==` be up to 15 times slower than `===` ?](https://www.builder.io/blog/double-equal-vs-triple-equal) 的中文翻译。

我们都知道 JavaScript 同时存在两种比较操作（即 [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality)的相等 和 [`===`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality)的严格相等）。但是两者到底有什么不同，引擎又会如何处理它们呢？

## 不同

`==`是强制比较。这里的【强制】意味着引擎试图将比较双方都强制转换到同一个类型（对我们书写者来说，这是隐式类型转换），然后查看它们是否相等。下面是一些示例：

```js
log('1' == 1) // true
log(1 == '1') // true
log(true == 1) // true
log(1 == true) // true
log([1] == 1) // true
log(1 == [1]) // true
```

强制是对称的，如果`a==b`真，`b==a`同样也真。而且，只有当两个操作数完全相同（NaN 除外）时，`===`才真。因此，上述示例换成`===`时都将变假。

## 强制的规则

规则很复杂（这也是杜绝`==`的一个论点），下面展示了实现此规则有多么地复杂：

```js
function doubleEqual(a, b) {
  if (typeof a === typeof b) return a === b
  if (wantsCoercion(a) && isCoercable(b)) {
    b = b.valueOf()
  } else if (wantsCoercion(b) && isCoercable(a)) {
    const temp = a.valueOf()
    a = b
    b = temp
  }
  if (a === b) return true
  switch (typeof a) {
    case 'string':
      if (b === true) return a === '1' || a === 1
      if (b === false) return a === '0' || a === 0 || a === ''
      if (a === '' && b === 0) return true
      return a === String(b)
    case 'boolean':
      if (a === true) return b === 1 || String(b) === '1'
      else return b === false || String(b) === '0' || String(b) === ''
    case 'number':
      if (a === 0 && b === false) return true
      if (a === 1 && b === true) return true
      return a === Number(String(b))
    case 'undefined':
      return b === undefined || b === null
    case 'object':
      if (a === null) return b === null || b === undefined
    default:
      return false
  }
}

function wantsCoercion(value) {
  const type = typeof value
  return type === 'string' || type === 'number' || type === 'boolean'
}

function isCoercable(value) {
  return value !== null && typeof value === 'object'
}
```

哇，好复杂，我甚至不能打包票它能正常工作！也许存在更简单的实现，但这是我能做的最好的。

值得注意的是，如果比较双方有一个是对象，引擎会 invoke 对象的 toPrimitive 方法来让对象将自己强制转换到基本值。

## 性能对比

强制类型转换相当复杂，且代价很昂贵，有一个测试对比：（同一时间内处理的数量）

- `number[]`: 1:1
- `string[]`: 1:1.5
- `(number | string)[]`: 1:3.9
- `objects[]`: 1:15

首先我们来谈谈数字数组，当引擎发现数组是纯数字时，它会将它们存储在一个叫做 `PACKED_SMI_ELEMENTS` 的特殊数组里。在此情况下，引擎知道将`==`视作`===`是安全的，因此性能是相同的。但是，一旦数字数组里包含其他内容，`==`就变糟糕了。

字符串数组里，`==`的性能比`===`降低了一半，而且只会变得更糟糕，字符串在引擎里很特殊（它是一个内置对象）。

一旦涉及到数字与字符串的混合，速度就会慢 4 倍。

但情况变得更糟糕的是，对象可以定义 toPrimitive 方法，以便将其自身强制转换到基本值。因此引擎必须要执行存在的此方法。在对象上定位一个特性需要内联缓存，内联缓存是特性读取的捷径，即便如此缓存，但以 megamorphic 方式读取时也会减慢至少 10 倍。

## `==`什么时候可以写

现代引擎处理`===`非常快！因此，大多数情况下即使让`===`慢 15 倍也不会有太大影响。尽管如此，我还是很难想出`==`而不是`===`作比较的理由。强制规则很复杂，这是一个表演的敲门砖，不要误伤自己，在写`==`前一定要三思。

唯一我能想到的书写`==`的情况：`value === null || value === undefined`简化到`value == null`
