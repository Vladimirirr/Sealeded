# WebAssembly API

地址：<https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface>

与 WebAssembly 相关 API 的命名空间。

## 方法

- `instantiate(buffer: ArrayBuffer, importObject?)`: Compiles and instantiates a WebAssembly binary code, and returns a `Module` with its first `Instance`.
- `instantiateStreaming(source: Response | Promise<Response>, importObject?)`
- `compile(buffer: ArrayBuffer)`: Compiles only.
- `compileStreaming(source: Response | Promise<Response>)`
- `validate(buffer: ArrayBuffer): boolean`

示例：

```js
const wasm = await WebAssembly.instantiateStreaming(fetch('./test.wasm'))
// wasm.module = { [[imports]]: { module: 'env', name: 'abort', kind: 'function' }, [[exports]]: { name: 'add', kind: 'function' } }
// wasm.instance = { exports, [[module]], [[functions]], [[globals]], [[memories]], [[tables]] }
```

- `[[imports]]`：模块导入的内容，即 `importObject`
- `[[exports]]`：模块导出的内容

- `exports`：供 JavaScript 访问的导出的内容
- `[[module]]`：它的 module
- `[[functions]]`：模块全部的函数
- `[[globals]]`：模块全部的顶级内容
- `[[memories]]`：载入的内存对象（目前仅支持一个）
- `[[tables]]`：载入的表格对象（目前仅支持一个）

其中 `[[xxxx]]` 代表内置特性（代码上不能观测到的）。

## 构造器

### `Global`

A `WebAssembly.Global` object represents a global variable instance, accessible from both JavaScript and importable or exportable across one or more `WebAssembly.Module` instances. This allows dynamic linking of multiple modules.

### `Module`

A `WebAssembly.Module` object contains **stateless** WebAssembly code that has already been compiled, which can be shared with Workers, and instantiated by `WebAssembly.instantiate` multiple times.

### `Instance`

A `WebAssembly.Instance` object is a **stateful** and executable instance of a `WebAssembly.Module`, containing all the exported WebAssembly functions that allow calling into WebAssembly code from JavaScript.

### `Memory`

The `WebAssembly.Memory` object is a resizable `ArrayBuffer` that holds the raw bytes of memory accessed by a `WebAssembly.Instance`.

### `Table`

The `WebAssembly.Table` object is a structure representing a WebAssembly Table, which stores function references.

### `Tag`

The `WebAssembly.Tag` object defines a type of a WebAssembly exception.

### `Exception`

The `WebAssembly.Exception` object represents a runtime exception thrown from WebAssembly to JavaScript or thrown from JavaScript to a WebAssembly exception handler.

### `CompileError`

The `WebAssembly.CompileError` object indicates an error during WebAssembly decoding or validation.

### `LinkError`

The `WebAssembly.LinkError` object indicates an error during module instantiation (besides traps from the start function).

### `RuntimeError`

The `WebAssembly.RuntimeError` object is the error type that is thrown whenever WebAssembly specifies a trap.

### 术语

trap: 非法操作（未在标准定义里）导致的不可恢复的（中止程式）RuntimeError（例如，除零、溢出），是 Runtime 对非法操作的拦截从而保证程式不会导致安全问题，此 Error 只能被 Runtime 捕捉同时传递给外部的处理器
