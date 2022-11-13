# 类型转化

### 前言

JavaScript 的糟粕之一就是它的隐式类型转换，比如令人费解的如下代码：

```js
const whatIsTheResult = !!([] + '') == 0
// whatIsTheResult 的值是 true
// 解释：
// 0. （前置条件）由于是【双等于】而非【三等于，也叫做全等】，且等号左右两侧的类型不相同，JavaScript引擎将启动隐式类型转换，尝试将它们转为相同的类型（无法转换时将抛出异常，示例见下），再进行比较，对于【三等于】来说，如果等号左右两侧类型不相同，直接返回false
// 1. `[] + ''` -> `[].toString() + ''` -> `[].join('') + ''` -> `'' + ''` -> `''` 最终得到空字符串
// 2. `!!''` -> false 最终得到布尔假值，因为空字符串视作假值
// 3. 0 -> false 最终得到布尔假值，因为数字0也视作假值
// false === false 成立，最终输出true
```

### 【双等于】规则（基于[ES5.1](http://es5.github.io/#x11.9.3)）

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
   4. x 是字符串，序列和 y 完全相等，返回 true
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

备注 1：+0 就是 0

备注 2：toPrimitive 的行为

1. 对象是否存在 valueOf 方法，存在的话，返回其执行结果
2. 对象是否存在 toString 方法，存在的话，返回其执行结果
3. 报错
