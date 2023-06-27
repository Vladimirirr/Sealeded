# WebAssembly(WASM) 概述

标准：<https://webassembly.github.io/spec/core/index.html>

## 前生：asm.js

浏览器是一个极佳的跨平台环境，越来越多的 PWA(Progressive Web App) 在浏览器上出现，不过 JavaScript 运行效率的问题，浏览器上很难跑大软件（比如微软的 VSCode Online，谷歌的 Google Earth）。

2012 年，Firefox 的 Alon Zakai 在探索 LLVM 时，突发奇想，能否把 C/C++ 代码转译为对应的高效率的 JavaScript 代码，毕竟 JavaScript 语言也参考了 C/C++，一个名为 [Emscripten](https://github.com/emscripten-core/emscripten) 的项目由此诞生，将 C/C++ 代码转译到高度优化的 JavaScript，叫做 asm.js。

当时如火如荼（2016 前）的 Adobe Flash 同样存在一个叫做 Mandreel 的框架，采取 C/C++ 来创建 Adobe Flash/AIR 软件，类似地，把 C/C++ 代码转译到高度优化的 ActionScript 代码。

asm.js 标准：<http://asmjs.org/spec/latest/>

### asm.js 的实现难点

C/C++ -> JavaScript 有两个最大的难点：

1. static vs dynamic
2. manage memory manually vs manage memory automatically

而 asm.js 采取下列方法来解决：

1. 保证变量类型不会发生突变，而且仅定义了数字类型（int 和 float）
2. 尽可能地阻止垃圾回收的发生（采取 ArrayBuffer 自己模仿内存）

### 浏览器上的 asm.js

当浏览器发现是 asm.js 格式的 JavaScript 代码时（如果浏览器不认识 asm.js，如 IE，也没关系，asm.js 只是 JavaScript 的子集），就会跳过针对 JavaScript 语言的诸多类型检查，甚至唤出 WebGL 来帮忙运行，asm.js 能到达 50% ~ 80% 本地语言的速度。

### asm.js 代码示例

```js
function foo() {
  'use asm' // 语法标记
  // 需要在 declare 变量的同时赋值，使得引擎能立刻知晓它的类型
  const x = 2 | 0 // 指示 x 是一个整数，否则默认是浮点数
  // 下面，我们 1 + ... + 100
  let i = 0 | 0 // 整数
  let sum = 0 | 0 // sum 也是
  for (i = 1; i <= 100; i++) {
    sum = (sum + i) | 0
  }
  return (sum + 2) | 0 // 指示函数的结果是整数
}
function bar() {
  'use asm'
  const heap = new Uint8Array(64) // 得到一个 64 字节的堆内存，我们在这里自己管理此函数需要的内存，不让 JS 引擎的垃圾回收干预
  // 需要一个字符串：一个指针和字符数组，就像 C 语言的一样

  // 正常的方法不符合 asm.js
  // let str = 'ABC' // 这会导致 JS 引擎自己创建一个堆内存
  // str = null // 这会导致 JS 引擎垃圾回收此堆内存

  // 符合 asm.js 的写法
  const A = 65 | 0
  const B = 66 | 0
  const C = 67 | 0
  const EOL = 0 | 0 // 字符串结束标记
  // 填入内存
  heap[0] = A
  heap[1] = B
  heap[2] = C
  heap[3] = EOL
  // 输出此字符串
  for (let i = 0 | 0; ; ) {
    if (heap[i] === (0 | 0)) break
    console.log(String.fromCharCode(heap[i]))
  }
  // 在函数结束时，将释放这些内存
  return // 显式的 return，指示此函数不返回值
}
```

## WASM 诞生

慢慢地，各大浏览器都接受了 [asm.js](http://asmjs.org/)，接着，asm.js 演变成了 [WebAssembly](https://webassembly.org/)（简称 WASM 或 wasm），**一种直接运行在浏览器上的二进制代码，相当 Java 的字节码**，让它代替 JavaScript 运行 CPU 密集工作。

正如 Assembly 一样，它的目的不是让你直接去书写它（即便存在文本格式），而是其他语言的交叉转译目标，比如 C/C++、Rust、TinyGo 和 WebAssemblyScript(TypeScript-like)。

WebAssembly 是线性内存，即一个很长的可增的字节数组（与 `asm.js` 一样），它和宿主都可读写此内存，从而实现值内容的直接交换。

WebAssembly 存在一个内置栈（操作数栈），任何内置操作都在此栈里，例如 `i32.const` 指令操作的目标栈就是此内置栈。

WebAssembly 的重要概念：

1. Module: A loaded and compiled WebAssembly binary file that is stateless, like a blob, and can be shared between windows and workers by `postMessage`.
2. Memory: A linear and resizable ArrayBuffer that can be read and written by WebAssembly and host language.
3. Table: A table containing functions references.
4. Instance: A Module loaded all needed states at runtime, including a Memory, Table, and some imported values.

与 ES 导入语句的对照：

```js
import Foo from './foo.js'

// from 的 './foo.js' -> Module
// import 的 Foo -> Instance
```

- 一个模块可得到多个实例
- 一个内存或表格可被多个实例同时读写
- 【未来】一个实例可挂载多个 Memory
- 【未来】一个实例可挂载多个 Table

## WASM 与 WAT

[WAT](./WAT.md)

## WASM 与 WASI

[WAT](./WASI.md)

## Emscripten

摘自 [Emscripten](https://emscripten.org/) 官网：

Emscripten is a complete Open Source compiler toolchain to WebAssembly. Using Emscripten you can:

1. Compile C/C++ code, or any other language that uses LLVM, into WebAssembly, and run it on the Web, Node.js, or other wasm runtimes.
2. Compile the C/C++ runtimes of other languages into WebAssembly, and then run code in those other languages in an indirect way (for example, this has been done for Python and Lua).

翻译：

1. 将 C/C++ 代码或任何其他采取 LLVM 的语言转译为 WebAssembly，同时在 Web、Node.js 或其他 wasm 运行时上运行这些代码。
2. 将其他语言的 C/C++ 运行时转译为 WebAssembly，最终间接地运行这些语言的代码（例如，Python 和 Lua）。

Python 转译为 wasm，其实是把 CPython 转译到 wasm，在基于此 wasm 的运行时上运行 Python 代码。

注意：自实现垃圾回收的静态转译语言（比如，C#、Go、Java），需要将它们的垃圾回收也转译到 wasm 里

## WebAssemblyScript

[WebAssemblyScript](./WebAssemblyScript/index.md)

## 可转译到 WASM 语言的清单列表

地址：<https://github.com/appcypher/awesome-wasm-langs>

## 衍生

### SIMD.js

在 asm.js 的时代，还存在一项提高 JavaScript 数学运行效率的技术，即 JavaScript 上的 SIMD，此技术暴露的 API 能直接将 complex computation 交给 CPU 或 GPU ，不过遗憾的是此技术没被纳入过标准（也没被任何的浏览器支持过），代码示例：

```js
const result = SIMD.float32x4(2.1, 2.2, 2.4, 2.8)
// 除了乘法，还有减法、除法、绝对值、相反数、平方根、等等
```

立项背景：2014 年 Mozilla、Google 和 Intel 合作，起草了此技术项目

项目终止：随着更强大的 WASM 技术立项，SIMD.js 技术被 WASM 合入，提案中止
