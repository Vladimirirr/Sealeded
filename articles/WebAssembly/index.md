# WebAssembly(WASM) 概述

## 前生：asm.js

浏览器是一个极佳的跨平台环境，随着 Firefox（2004 - 2016 年）和 Chrome（2008 - 至今）对 Web 平台的称霸，及 IE 的没落（2022 年微软宣布正式关停 IE），越来越多的 PWA(Progressive Web App) 在浏览器上出现，不过 JavaScript 运行效率的问题，浏览器上很难跑大型软件（比如微软的 VSCode Online，谷歌的 Google Earth）。

2012 年，Firefox（Mozilla 公司）的 Alon Zakai 在探索 LLVM 编译器工具链时，突发奇想，能否把 C/C++ 代码转译为对应的高效率的 JavaScript 代码，毕竟 JavaScript 语言也参考了 C/C++，而 C/C++ 是写大型软件和游戏的首选语言。

于是乎，一个名为 [Emscripten](https://github.com/emscripten-core/emscripten) 的项目由此诞生，将 C/C++ 代码编译为高度优化的 JavaScript，叫做 asm.js。

无独有偶，当时如火如荼（2016 年以前）的 Adobe Flash 同样存在一个叫做 Mandreel 的框架，采取 C/C++ 来创建 Adobe Flash/AIR 软件，类似地，把 C/C++ 代码编译为高度优化的 ActionScript3 代码。

asm.js 规范：<http://asmjs.org/spec/latest/>

### 实现 asm.js 的难点

C/C++ -> JavaScript 有两个最大的难点：

1. static vs dynamic
2. manage memory manually vs manage memory automatically

而 asm.js 采取下列方法来解决：

1. 保证变量类型不会发生突变，而且仅定义的 2 种类型（signed int 和 signed double）
2. 尽可能地阻止垃圾回收的发生（采取 ArrayBuffer 自己模仿内存）

### 浏览器上的 asm.js

当浏览器发现是 asm.js 格式的 JavaScript 代码时（如果浏览器不认识 asm.js，比如 IE，也没关系，asm.js 只是 JavaScript 的子集），就会跳过针对 JavaScript 语言的诸多类型检查，甚至唤出 WebGL 来帮忙运行，asm.js 能到达 50% ~ 80% 本地语言的速度。

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

慢慢地，各大浏览器都接受了 [asm.js](http://asmjs.org/)，接着，asm.js 演变成了 [WebAssembly](https://webassembly.org/)（简称 WASM），**一种直接运行在浏览器上的二进制代码，相当 Java 的字节码**，让其他语言（比如 C/C++）来代替 JavaScript 运行 CPU 密集的工作。

## Emscripten 概述

摘自 [Emscripten](https://emscripten.org/) 官网：

Emscripten is a complete Open Source compiler toolchain to WebAssembly. Using Emscripten you can:

1. Compile C/C++ code, or any other language that uses LLVM, into WebAssembly, and run it on the Web, Node.js, or other wasm runtimes.
2. Compile the C/C++ runtimes of other languages into WebAssembly, and then run code in those other languages in an indirect way (for example, this has been done for Python and Lua).

翻译：

1. 将 C/C++ 代码或任何其他采取 LLVM 的语言编译为 WebAssembly，同时在 Web、Node.js 或其他 wasm 运行时上运行这些代码。
2. 将其他语言的 C/C++ 运行时编译为 WebAssembly，最终间接地运行这些语言的代码（例如，Python 和 Lua 已经这样做了）。

其他非平台的语言，即需要运行时的语言，在编译为 wasm 时，需要把它的运行时也编译为 wasm，这就大增了 wasm 文件的尺寸，效率也不会高。

比如 Python 编译为 wasm，实际上是把 CPython（C 语言实现的 Python 编译器）编译为了 wasm，在基于此 wasm 的运行时上运行 Python 代码。

注意：自实现垃圾回收的静态编译语言（比如，C#、Go、Java），需要将它们的垃圾回收也编译到 wasm 里

## 可编译到 WASM 语言的清单列表

地址：<https://github.com/appcypher/awesome-wasm-langs>

## 衍生阅读：SIMD.js

在 asm.js 的时代，还存在一项提高 JavaScript 数学运行效率（剑指 complex computation）的技术（规范），即 JavaScript 上的 SIMD（单指令多数据，Single Instruction and Multiple Data），此技术暴露的 API 能直接将 complex computation 交给 CPU 或 GPU ，不过遗憾的是此技术没被纳入过标准（也没被任何的浏览器支持过），代码示例：

```js
const result = SIMD.float32x4(2.1, 2.2, 2.4, 2.8)
// 除了乘法，还有减法、除法、绝对值、相反数、平方根、等等
```

立项背景：2014 年 Mozilla、Google 和 Intel 合作，起草了此技术项目

项目终止：随着更强大的 WASM 技术立项，SIMD.js 技术被 WASM 合入，提案中止
