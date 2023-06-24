# WebAssemblyScript

地址：<https://www.assemblyscript.org/>

许可：Apache 2.0

基建：Binaryen

## 概述

A TypeScript-like language for compiling to WebAssembly.

1. 专门给 WebAssembly 设计的 TypeScript-like 语言
2. 安装很简单，不需要复杂的工具链，只需要 `npm i -D assemblyscript`

入门示例：

```ts
export const add = (a: i32, b: i32): i32 => a + b
```

一些简称：WebAssemblyScript = AssemblyScript, WAS = AS

### 目标

WebAssemblyScript 的目标是打造一门类 TypeScript 语法的转译到 WebAssembly 目标的高级语言，即 WebAssembly 上的一个薄膜。目前它是 WebAssembly 的官方语言之一（Rust、C/C++、WebAssemblyScript、TinyGo）。

### 从 WebAssembly 看来

内置函数涵盖了 WebAssembly 标准指令，下例演示了如何直接操做内存空间：

```ts
// store 和 load 是内置函数，将被 compiler 转写到相对的 WebAssembly 指令
store<i32>(ptr, load<i32>(ptr) + load<i32>(ptr, 4), 8)
```

相当的 C 代码：

```c
*(ptr + 2) = *ptr + *(ptr + 1)
```

### 从 JavaScript 看来

提供了很多与 JavaScript 类似的 API，包括：Math、Array、TypedArray、String、Map、等等。

### FAQ

#### AssemblyScript 是 WebAssembly 上的 VM 或 Interpreter 吗？

No, AssemblyScript compiles to WebAssembly bytecode directly, statically, ahead-of-time.

#### AssemblyScript 和 TypeScript 的相同或不同之处？

语法类似的类型系统，仅此而已。

#### AssemblyScript 最终会全兼容 TypeScript 吗？

不会，它们是不同的东西。不过，如果你的 TypeScript 类型很健壮 (strict types)，就可很容易地转换到 AssemblyScript。

#### 举一些 AssemblyScript 的典型场景？

1. 媒体处理
2. 游戏
3. 模拟器
4. 子操作系统
5. 代码安全

## 目录

### [Starting](./Starting.md)

### [Compiler](./Compiler.md)

### [Language](./Language.md)

### [Runtime](./Runtime.md)
