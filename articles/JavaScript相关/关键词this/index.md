# 关键词 this

在 OOP 语言里，都有 this 这个概念和关键词，它指向的是当前对象自己。

例如下面的 Java 代码示例：

```java
public class Main {
  // 入口
  public static void main(String[] args) {
    Foo foo = new Foo("jack", 22);
    foo.say();
  }
}
class Foo {
  String name; // 默认值 null
  int age; // 默认值 0
  Foo(String name, int age) {
    // 赋值
    this.name = name;
    this.age = age;
  }
  public void say() {
    // this 必定等于当前的 name = "jack" 且 age = 22 的 foo
    System.out.println(this.name);
    System.out.println(this.age);
    System.out.println(this); // 此对象的内存地址标识符
  }
}
```

但是，在 JavaScript 里，this 不是固定不变的，它随着函数上下文的不同而变化！（糟糕！让我们代码书写的负担变重了！）

## 独立执行

函数的 this 就是顶级域里的 this，在浏览器下是 window，在 node.js 下是 global，ES2020 提案的 globalThis 关键词统一了 JavaScript 在不同 runtime 下顶级域里对 this 值的标识符名字。

```js
function foo() {
  console.log(this === window) // true
}

foo()
```

## 方法执行

在 JavaScript 里，如果一个函数被对象的键指向，那么这个函数又叫做此对象的方法。

注意，在 JavaScript 里，一个对象永远不可能 owner 一个函数，对象只能持有函数的地址（即只能指向一个函数）！这点也与 Java 不同。

```js
const o = {
  foo() {
    console.log(this === o, this === window)
  },
}
o.foo() // 输出 true false

const outFoo = o.foo
outFoo() // 输出 false true 即，对象始终没有真正持有过这个函数本体，持有的只是这个函数的地址！
```

## 指定 this

函数继承自 Function，而 Function.prototype 存在 call 和 apply 两个方法，它们都接受一个对象当作此函数执行时的 this 值，唯一不同的是，call 接受的是参数列表，而 apply 接受的是参数数组，即 `fn.call(thisValue, ...args) <-> fn.apply(thisValue, [...agrs])`。

```js
function foo(a, b) {
  console.log(this === o) // true
  console.log(a + b)
}
const o = {
  name: 'jack',
  age: 22,
}

foo.call(o, 1, 2) // output: true and 3
foo.apply(o, [1, 2]) // same with above
```

## 构造器

JavaScript 没有真正意义上的构造器，当一个函数被关键词 new 执行时，此时这个函数便是构造器了。（ES6 的 class 语法也仅仅是语法糖！）

```js
function Foo() {
  // 习惯性，把会被关键词new执行的函数命名大写驼峰
  console.log(this) // 此时的this是一个新建的对象（对象的__proto__指向Foo的prototype），Foo函数将隐式返回此对象
}
```

## 消除 this -- 箭头函数

箭头函数（又叫 lambda 表达式）的域没有 this，它的 this 继承自父域（就像普通变量沿着域链查找一样），如果父也是箭头函数，将一直向上找到顶级域里的 this。

## 最佳实践

在 JavaScript 里不写任何与 this 相关的代码，建议走函数式编程路线（闭包！）。
