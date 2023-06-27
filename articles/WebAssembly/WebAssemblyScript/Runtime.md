# Runtime

AssemblyScript Runtime 包含程式需要的内存管理和垃圾回收，它对写者不可见，除非你需要改造它，例如将它跑在其他的设备下，而非常见的 x86、arm、等等。

## Variants

目前内置三种不同的 Runtime `--runtime <incremental | minimal | raw>`：

1. `incremental`: TLSF + incremental GC
2. `minimal`: TLSF + lightweight GC invoked externally
3. `stub`: No GC

Default `incremental`, a full solution recommended in most use cases.

## API

`--exportRuntime` 可导出 Runtime 与 GC 相关的 API，因此可在外部 allocate 或 free 内存，多在 `minimal` 模式下：

- `__new(size: usize, id: u32): usize`
- `__pin(ptr: usize): usize`
- `__unpin(ptr: usize): void`
- `__collect(): void`
- `const __rtti_base: usize`

## Memory layout

WebAssembltScript 对线性内存划区的方式：

| Region      | Start offset  | End offset            | Desc                                 |
| ----------- | ------------- | --------------------- | ------------------------------------ |
| Static Data | `0`           | `__data_end`          | 常量的存放区，例如 字符串            |
| Stack       | `__data_end`  | `__heap_base`         | WebAssembltScript 自己的栈           |
| Heap        | `__heap_base` | `memory.size() << 16` | 堆，保证可增，即 dynamic allocations |

## Calling convention

Generated bindings take care of the calling convention automatically, but other environments may want to adhere to it specifically.
