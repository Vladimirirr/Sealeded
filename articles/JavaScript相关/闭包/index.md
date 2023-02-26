# 闭包

## 闭包的出现和本质

【词法作用域】和【函数一等公民导致】两者导致的副作用，闭包是一个**函数**及其引用的父级**作用域**。

由于词法作用域，闭包在书写函数代码时就被创建了。

### 出现背景

1. 由于 JavaScript 基于静态作用域（也叫词法作用域），即函数对变量的作用域链查找规则在书写源代码时就决定了，与运行时无关（对应动态作用域，比如 Bash），示例：

```js
var name = 'stark'
function foo(otherFunction) {
  var name = 'thor'
  bar()
}
function bar() {
  console.log(`my name is ${name}`)
}

// run bar directly and print 'stark'
bar()

// run bar wrapped with foo and print 'stark' too
foo()
```

多数语言都是静态作用域。
如果是动态作用域，上述示例代码的 foo 执行将打印'thor'而不是'stark'。

2. 由于 JavaScript 将函数作为一等公民，函数就像普通值一样能传来传去（比如当作其他函数的入参或返回值，此时这个其他函数便是高阶函数）

### 引出本质

由于上述提到的两点基本前提，也就导致了闭包的出现：

```js
function foo() {
  var statement = 'hi Mr. stark'
  var count = 0
  // 由于foo函数返回值是另一个bar函数，那么foo就叫做高阶函数
  // 由于返回的bar函数在外部可能会被执行，引擎就必须存活statement和count变量，也就是**存活【当前】的foo的函数作用域**
  return function bar() {
    console.log(`${statement} with ${++count} times.`)
  }
}

var fn = foo()
fn() // 'hi Mr. stark with 1 times'
fn() // 'hi Mr. stark with 2 times'

var fn2 = foo() // each foo function will create a **new independent** scope
fn2() // 'hi Mr. stark with 1 times'
fn2() // 'hi Mr. stark with 2 times'
```

由于：

1. 静态作用域：bar 函数对它内部使用到的变量 statement 和 count 的查找作用域链在书写时就被确定
2. JavaScript 是一等公民：bar 函数允许作为 foo 函数的返回值被返回出去

**最终导致：** JavaScript 引擎即便在 foo 函数执行完毕了也要继续存活 foo 函数的作用域，因为此作用域被 bar 函数使用到了，**此时 foo 函数的作用域就叫做【闭包】，而 bar 函数叫做【闭包函数】（拥有闭包的函数）**。

### 验证一个闭包能被多个引用它的函数相互读写

```js
const field = () => {
  var name = 'origin'
  return {
    // 核心：下面的三个方法，使用到的name变量，都来自同一个作用域 —— 当前的field的函数作用域
    a() {
      name = 'aaaa'
    },
    b() {
      name = 'bbbb'
    },
    what() {
      console.log(name)
    },
  }
}

const fieldDo = field()

fieldDo.what() // origin
fieldDo.a()
fieldDo.what() // aaaa
fieldDo.b()
fieldDo.what() // bbbb
fieldDo.a()
fieldDo.what() // aaaa
```
