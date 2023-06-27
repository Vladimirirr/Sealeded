# Compiler

The Compiler of AssemblyScript is `asc`.

## Options

### Optimization

The compiler can optimize for both speed (`--Ospeed`) and size (`--Osize`), as well as produce a debug build (`--debug`).

- `--debug`: Make a debug build.
- `--release`: Make a release build.
- `--optimize, -O`: Default optimizations.
- `--optimizeLevel`: How much to focus on optimizing code(`[0, 3]`).
- `--shrinkLevel`: How much to focus on shrinking code size(`[0, 2]`).
- `--Ospeed`: Optimize for speed.
- `--Osize`: Optimize for size.
- `--converge`: Re-optimizes until no further improvements can be made.
- `--noAssert`: Replaces assertions with just their value without trapping.

### Output

- `--outFile, -o`: The WebAssembly binary output file (`.wasm`).
- `--textFile, -t`: The WebAssembly text output file (`.wat`).
- `--bindings, -b`: The bindings files (`.js` + `.d.ts`).
  - `raw`: The bindings only.
  - `esm`: The bindings and instantiates itself.

### Debugging

- `--sourcemap`: Output the sourcemap for binary file.
- `--debug`: Output the debug information in binary file.

### Features

There are some flags about WebAssembly or compiler features.

- `--importMemory`: Imports the memory from `env.memory`.
- `--noExportMemory`: Does not export the memory as `memory`.
- `--initialMemory`: The initial memory size in pages.
- `--maximumMemory`: The maximum memory size in pages.
- `--importTable`: Imports the function table from `env.table`.
- `--exportTable`: Exports the function table as `table`.
- `--runtime`: The runtime.
- `--exportRuntime`: Exports the runtime helpers.

### Linking

- `--memoryBase`: The start offset of emitted memory.
- `--tableBase`: The start offset of emitted table.

### API

To integrate with the compiler, for example to post-process the AST, one or multiple custom transforms can be specified.

即插件系统。

- `--transform`：The custom transformer.

## Host bindings

WASM 目前只支持交换数字类型，其他高级类型的交换直接提供了内存，但这需要自己封装不同类型的处理方案，例如，字符串、对象、数组、等等。因此需要粘合代码帮忙，即 bindings。

ASC Compiler 目前 bindings 支持的高级类型（即 `--bindings`）：

| Type        | Strategy    |
| ----------- | ----------- |
| Boolean     | Value by u8 |
| String      | Copy        |
| Array       | Copy        |
| StaticArray | Copy        |
| ArrayBuffer | Copy        |
| Object      | Copy        |

### Object

普通对象，直接深拷贝的方式交换：

```ts
class NormalPlainObject {
  msg: string = ''
  id: i32 = 0
}
export function getObject(): NormalPlainObject {
  return {
    msg: 'hello',
    id: 2,
  }
}
```

## Transforms

在 compiling 各个时刻的 hooks。类似 Webpack 插件的 transform 钩子。

## Portability

JS/TS <--> WAS 的可移植性建议。
