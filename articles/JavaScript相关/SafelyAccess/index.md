# 可选链 `?.`（语法糖）

具备短路特性！

只能取值而不能赋值！

可选链可以安全地深度地访问一个对象，即使中间有不存在的键，也不会出现错误。

这样，我们就不需要一次又一次地写 if 语句了。

示例：

```js
const res = a?.b?.c // same with `a?.b?.['c']`
const res2 = a?.b?.()
```

transformed:

```js
const isNulish = (a) => a == null
const empty = undefined
const res = isNulish(a) ? empty : isNulish(a.b) ? empty : a.b.c
const res2 = isNulish(a) ? empty : isNulish(a.b) ? empty : a.b()
```

# 空值表达式 `??`（语法糖）

具备短路特性！

如果前置表达式是空值，就返回它的备选值。

示例：

```js
const res = a ?? b // b 就是备选值
```

transformed:

```js
const isNulish = (a) => a == null
const res = isNulish(a) ? b : a
```

### 与 `||`

它们之间最根本的不同：

- `||` 返回第一个 真的 值
- `??` 返回第一个 已定义的 值

意味着 `||` 不区分 `''` `0` `false` 与 `null / undefined`。

### 警告

`??`是【选择列表中第一个已定义的值】的简便方式的操作符，与 `||` 不是同一个类型的操作符，因此，当 `??` 与 `&&` 或 `||` 一起出现在表达式里，将报错：

```js
// const x = 1 && 2 ?? 3; // a syntax error happened unless using explicit parentheses around it to make work
const y = 1 && (2 ?? 3) // ok
const z = (1 && 2) ?? 3 // ok
```
