# Language

WebAssemblyScript 语言特性。

## 概念

### TypeScript-like

很类似 TypeScript，语法和语义基本兼容。WebAssemblyScript 是 【TypeScript 的子集】 + 【WebAssembly 特有的东西】。

### 定义类型

WebAssemblyScript is compiled ahead-of-time by supporting strict static types only.

WebAssemblyScript 只支持静态类型。

不含 `any` 和 `undefined`：

```ts
// bad
function foo(a?) {
  var b = a + 1
  return b
}

// good
function foo(a: i32 = 0): i32 {
  var b = a + 1
  return b
}
```

不含联合类型（对象与 `null` 联合的除外），泛型代替之：

```ts
// bad
function foo(a: i32 | string): void {}

// good
function foo<T>(a: T): void {}
```

对象必须有类型，Map 或 Class 宣言它：

```ts
// bad
var a = {}
a.foo = 'hi'

// good
var a = new Map<string, string>()
a.set('foo', 'hi')

// good
class A {
  Construct:or(public foo: string) {}
}
var a = new A('hi')
```

### 模块导入

```ts
// assembly/env.ts
export declare function logInt(i: i32): void
```

```ts
// assembly/index.ts
import { logInt } from './env.ts'

logInt(42)
```

```js
// host env
WebAssembly.instantiateStreaming(fetch('./test.wasm'), {
  'assembly/env': {
    logInt: (i) => console.log('logInt', i),
  },
})
```

### 模块导出

```ts
// assembly/index.ts
export function add(a: i32, b: i32): i32 {
  return a + b
}
```

```js
// host env
const {
  instance: { exports },
} = await WebAssembly.instantiateStreaming('./test.wasm')

console.log(exports.add(1, 2))
```

### 特殊导入

一些特殊的语言特性需要宿主的支持。

- `env.abort(message: usize, fileName: usize, line: u32, column: u32): void`
  Called on unrecoverable errors. Typically present if assertions are enabled or errors are thrown.

- `env.trace(message: usize, n: i32, a0..4?: f64): void`
  Called when trace is called in user code.

- `env.seed(): f64`
  Called when the random number generator needs to be seeded.

### Tree Sharking

自带模块级的 Sharking，还可采取选择语句和标识常量来实现更细致的：

```ts
if (ASC_FEATURE_SIMD) {
  // compute with SIMD operations
} else {
  // fallback without SIMD operations
}
```

## 类型系统

| WebAssemblyScript Type   | WebAssembly type | TypeScript type  | Description                                   |
| ------------------------ | ---------------- | ---------------- | --------------------------------------------- |
| _数字_                   |                  |                  |                                               |
| i32                      | i32              | number           | 32-bit signed integer                         |
| u32                      | i32              | number           | 32-bit unsigned integer                       |
| i64                      | i64              | bigint           | 64-bit signed                                 |
| u64                      | i32              | bigint           | 64-bit unsigned                               |
| isize                    | i32 or i64       | number or bigint | 32-bit signed in WASM32 or 64-bit in WASM64   |
| usize                    | i32 or i64       | number or bigint | 32-bit unsigned in WASM32 or 64-bit in WASM64 |
| _浮点_                   |                  |                  |                                               |
| f32                      | f32              | number           | 32-bit float                                  |
| f64                      | f64              | number           | 64-bit float                                  |
| _小数字_                 |                  |                  |                                               |
| i8                       | i32              | number           | 8-bit signed integer                          |
| u8                       | i32              | number           | 8-bit unsigned integer                        |
| i16                      | i32              | number           | 16-bit signed integer                         |
| u16                      | i32              | number           | 16-bit unsigned integer                       |
| bool                     | i32              | boolean          | 1-bit unsigned integer                        |
| _向量_                   |                  |                  |                                               |
| v128                     | v128             | -                | v128                                          |
| _指针（可被 GC 的类型）_ |                  |                  |                                               |
| ref_extern               | (ref extern)     | Object           | external reference                            |
| ref_any                  | (ref any)        | Object           | internal reference                            |
| ref_func                 | (ref func)       | Function         | function reference                            |
| ref_eq                   | (ref eq)         | Object           | equatable reference                           |
| ref_struct               | (ref struct)     | Object           | data reference                                |
| ref_array                | (ref array)      | Array            | array reference                               |
| ref_string               | (ref string)     | string           | string reference                              |
| _特殊_                   |                  |                  |                                               |
| void                     | -                | void             | no return value                               |

注意：

1. 布尔值是整数类型
2. 即便可直接 `const msg: string = "xxxx"` 赋值字符串，但在这里字符串不是基础类型，它是对象，因此没有 `string(20)` 这样的转换到字符串的强制类型转换

### 类型推理

表达式的类型宣言 `<T> expression` 和 `expression as T` 是显示类型推理。WebAssemblyScript 每个表达式的类型必须是已知的或隐式类型推理得出的，且函数的类型不论如何都必须显式给出。

```ts
const a: i32 = 10
const b: i32 = 20
const c = a + b // 隐式类型推理，相当 `const c: i32 = a + b`

var foo: f32 // 默认 0.0

const test = (): i32 => {
  // 函数的结果值不能隐式类型推理，必须显式给出
  const res: i32 = 20
  return res
}
```

`class` 和 `function` 类型可以是 `null`，即 `T | null`（此联合类型是目前唯一一个有效的联合类型）。

### 赋值

在不显式类型转换下，一些值也可被赋值到其他类型上（即隐式类型转换，但不赞成隐式类型转换）：

| →       | bool | i8/u8 | i16/u16 | i32/u32 | i64/u64 | f32 | f64 |
| ------- | ---- | ----- | ------- | ------- | ------- | --- | --- |
| bool    | √    | √     | √       | √       | √       | √   | √   |
| i8/u8   |      | √     | √       | √       | √       | √   | √   |
| i16/u16 |      |       | √       | √       | √       | √   | √   |
| i32/u32 |      |       |         | √       | √       |     | √   |
| i64/u64 |      |       |         |         | √       |     |     |
| f32     |      |       |         |         |         | √   | √   |
| f64     |      |       |         |         |         |     | √   |

```ts
var i8val: i8 = -128 // 0x80
var u8val: u8 = i8val // becomes 128 (0x80)
var i16val: i16 = i8val // becomes -128 through sign-extension (0xFF80)
var u16val: u16 = i8val // becomes 65408 through masking (0xFF80)
var f32val: f32 = i8val // becomes -128.0
```

### 比较

`==` 和 `!=` 与 `===` 和 `!==` 一致。

不同类型的比较（上表）会发生隐式类型转换：

1. 等值比较 `==` `!=`
2. 相对比较 `>` `<` `>=` `<=`（要求符号位一致）

### 强制类型转换（仅限基础数据类型）

语法：`targetTypeName(currentTypeValue)`

```ts
export function test(): void {
  const a: i32 = 20
  const b: i8 = i8(a)
  console.log(b.toString())
}
```

### 范围限制

```ts
const i8.MIN_VALUE: i8 = -128
const i8.MAX_VALUE: i8 = 127

const i16.MIN_VALUE: i16 = -32768
const i16.MAX_VALUE: i16 = 32767

const i32.MIN_VALUE: i32 = -2147483648
const i32.MAX_VALUE: i32 = 2147483647

const i64.MIN_VALUE: i64 = -9223372036854775808
const i64.MAX_VALUE: i64 = 9223372036854775807

const isize.MIN_VALUE: isize // WASM32: i32.MIN_VALUE, WASM64: i64.MIN_VALUE
const isize.MAX_VALUE: isize // WASM32: i32.MAX_VALUE, WASM64: i64.MAX_VALUE

const u8.MIN_VALUE: u8 = 0
const u8.MAX_VALUE: u8 = 255

const u16.MIN_VALUE: u16 = 0
const u16.MAX_VALUE: u16 = 65535

const u32.MIN_VALUE: u32 = 0
const u32.MAX_VALUE: u32 = 4294967295

const u64.MIN_VALUE: u64 = 0
const u64.MAX_VALUE: u64 = 18446744073709551615

const usize.MIN_VALUE: usize = 0
const usize.MAX_VALUE: usize // WASM32: u32.MAX_VALUE, WASM64: u64.MAX_VALUE

const bool.MIN_VALUE: bool = 0
const bool.MAX_VALUE: bool = 1

const f32.MIN_VALUE: f32 = -3.40282347e+38
const f32.MAX_VALUE: f32 = 3.40282347e+38
const f32.MIN_NORMAL_VALUE: f32 = 1.17549435e-38
const f32.MIN_SAFE_INTEGER: f32 = -16777215
const f32.MAX_SAFE_INTEGER: f32 = 16777215
const f32.EPSILON: f32 = 1.19209290e-07

const f64.MIN_VALUE: f64 = -1.7976931348623157e+308
const f64.MAX_VALUE: f64 = 1.7976931348623157e+308
const f64.MIN_NORMAL_VALUE: f64 = 2.2250738585072014e-308
const f64.MIN_SAFE_INTEGER: f64 = -9007199254740991
const f64.MAX_SAFE_INTEGER: f64 = 9007199254740991
const f64.EPSILON: f64 = 2.2204460492503131e-16
```

### 位移

### 宏类型

## 内置

### global

#### 常量

- `const NaN: auto // f32 or f64`
- `const Infinity: auto // f32 or f64`

#### 函数

- `function isNaN<T>(value: T): bool`
- `function isFinite<T>(value: T): bool`
- `function parseInt(str: string, radix?: i32): f64`
  Parses a string representing an integer to an f64 number Returns `NaN` on invalid inputs.
  - `F32.parseInt` to a 32-bit float
  - `F64.parseInt` to a 64-bit float
  - `I8.parseInt` to a signed 8-bit integer
  - `U8.parseInt` to a unsigned 8-bit integer
  - `I16.parseInt` to a signed 16-bit integer
  - `U16.parseInt` to a unsigned 16-bit integer
  - `I32.parseInt` to a signed 32-bit integer
  - `U32.parseInt` to a unsigned 32-bit integer
  - `I64.parseInt` to a signed 64-bit integer
  - `U64.parseInt` to a unsigned 64-bit integer
- `function parseFloat(str: string): f64`
  Parses a string to a 64-bit float. Returns `NaN` on invalid inputs.

#### 内置

这些内置特性提供了对 WebAssembly 和 Compiler 的直接访问，它们是标准内置集合的低级 API。

静态类型检查：

这些检查结果都在 compiling 时就转写成常量固定了下来。

- `isInteger<T>(value?: T): bool`
- `isSigned<T>(value?: T): bool`
- `isReference<T>(value?: T): bool`
- `isArray<T>(value?: T): bool`
- `isFunction<T>(value?: T): bool`
- `isVector<T>(value?: T): bool`: Test if value is a SIMD vector type
- `isNullable<T>(value?: T): bool`
- `isConstant(expression: auto): bool`
- `isDefined(expression: auto): bool`
- `isManaged<T>(expression: auto): bool`

工具：

- `sizeof<T>(): usize`
- `offsetof<T>(fieldName?: string): usize`
- `nameof<T>(value?: T): string`
- `alignof<T>(): usize`
- `idof<T>(): u32`
- `assert<T>(isTrueish: T, message?: string): T`
- `trace(message: string, n?: i32, a0..a4?: f64): void`
- `instantiate<T>(...args: auto[]): T`
- `bswap<T>(value: T): T`: Reverses the byte order of the specified integer.
- `changetype<T>(value: auto): T`

WebAssembly：

直接转写到各自的 WebAssembly 指令。

WebAssembly 的 Math：

- `abs<T>(value: T): T`
- `max<T>(left: T, right: T): T`
- `min<T>(left: T, right: T): T`
- `floor<T>(value: T): T`
- `ceil<T>(value: T): T`
- `nearest<T>(value: T): T`
- `sqrt<T>(value: T): T`
- `trunc<T>(value: T): T`
- ...

WebAssembly 的 Memory：

- `load<T>(ptr: usize, immOffset?: usize, immAlign?: usize): T`
- `store<T>(ptr: usize, value: auto, immOffset?: usize, immAlign?: usize): void`
- `memory.size(): i32`
- `memory.grow(value: i32): i32`
- `memory.copy(dst: usize, src: usize, n: usize): void`
- `memory.fill(dst: usize, value: u8, n: usize): void`
- `memory.repeat(dst: usize, src: usize, srcLength: usize, count: usize): void`
- `memory.compare(lhs: usize, rhs: usize, n: usize): i32`
- `memory.data(size: i32, align?: i32): usize`
- `memory.data<T>(values: T[], align?: i32): usize`

WebAssembly 的 Control Flow：

- `function select<T>(ifTrue: T, ifFalse: T, condition: bool): T`
- `function unreachable(): auto`

WebAssembly 的 Atomics：

WebAssembly 的 SIMD：

### Array

与 JavaScript 的数组一致，但是需要保证每个项目的类型一样。

```ts
export function test(): void {
  const arr = new Array<string>()
  arr[4] = 'ok'
  console.log(`The dynamic length is ${arr.length.toString()} now.`)
  // output: "The dynamic length is 5 now."
}
```

Construct:

`new Array<T>(length?: i32)`

Static Members:

- `const length: i32`
- `isArray<T>(value: T): bool`

Instance Members:

- `concat(other: Array<T>): Array<T>`
- `slice(start?: i32, end?: i32): Array<T>`
- `push(value: T): i32`
- `pop(): T`
- `unshift(value: T): i32`
- `shift(): T`
- `splice(start: i32, deleteCount?: i32): Array<T>`
- `some(fn: (value: T, index: i32, self: Array<T>) => bool): bool`
- `every(fn: (value: T, index: i32, self: Array<T>) => bool): bool`
- `fill(value: T, start?: i32, end?: i32): this`
- `map<U>(fn: (value: T, index: i32, self: Array<T>) => U): Array<U>`
- `filter(fn: (value: T, index: i32, self: Array<T>) => bool): Array<T>`
- `reduce<U>(fn: (accumValue: U, currentValue: T, index: i32, self: Array<T>) => U, initialValue: U): U`
- `findIndex(fn: (value: T, index: i32, self: Array<T>) => bool): i32`
- `findLastIndex(fn: (value: T, index: i32, self: Array<T>) => bool): i32`
- `includes(value: T, fromIndex?: i32): bool`
- `indexOf(value: T, fromIndex?: i32): i32`
- `lastIndexOf(value: T, fromIndex?: i32): i32`
- `forEach(fn: (value: T, index: i32, self: Array<T>) => void): void`
- `join(separator?: string): string`
- `flat(): valueof<T>[]`
- `reverse(): this`
- `sort(fn?: (a: T, b: T) => i32): this`
- `copyWithin(target: i32, start: i32, end?: i32): this`
- `toString(): string`

### StaticArray

固定数量的数组，它没有回备缓冲区，因此效率比普通数组要高。与 C 的数组很类似。

Construct:

`new StaticArray<T>(length: i32)`

Static Members:

- `fromArray<T>(source: Array<T>): StaticArray<T>`

Instance Members:

- `concat`
- `slice`
- `some`
- `every`
- `fill`
- `map`
- `filter`
- `reduce`
- `findIndex`
- `findLastIndex`
- `includes`
- `indexOf`
- `lastIndexOf`
- `at(pos: i32): T`
- `forEach`
- `join`
- `reverse`
- `sort`
- `copyWithin`
- `toString`

### ArrayBuffer

A fixed-length raw binary buffer.

与 JavaScript 的一致。

Construct:

`new ArrayBuffer(length: i32)`

Static Members:

- `function isView<T>(value: T): bool`: Returns `true` if value is one of the buffer views(TypedArray or DataView)

Instance Members:

- `const byteLength: i32`
- `function slice(begin?: i32, end?: i32): ArrayBuffer`
- `function toString(): string`

### TypedArray

An Array-like view on a raw binary buffer.

与 JavaScript 一致，没有真正意义上的 TypedArray，它是下面其中的一个变体。

变体：

| Variant           | Element type |
| ----------------- | ------------ |
| Int8Array         | i8           |
| Int16Array        | i16          |
| Int32Array        | i32          |
| Int64Array        | i64          |
| Uint8Array        | u8           |
| Uint8ClampedArray | u8           |
| Uint16Array       | u16          |
| Uint32Array       | u32          |
| Uint64Array       | u64          |
| Float32Array      | f32          |
| Float64Array      | f64          |

Construct:

`new TypedArray(length: i32)` 默认赋值内存都是 0

Static Members:

- `const BYTES_PER_ELEMENT: usize`
- `wrap(buffer: ArrayBuffer, byteOffset?: i32, length?: i32): TypedArray`

Instance Members:

- `const buffer: ArrayBuffer`
- `const byteOffset: i32`
- `const byteLength: i32`
- `const length: i32`

---

- `some`
- `every`
- `fill`
- `map`
- `reduce`
- `reduceRight`
- `findIndex`
- `findLastIndex`
- `includes`
- `indexOf`
- `lastIndexOf`
- `forEach`
- `reverse`
- `set`
- `sort`
- `subarray`

### DataView

An interface for working with a raw binary buffer.

与 JavaScript 的一致。

Construct:

`new DataView(buffer: ArrayBuffer, byteOffset?: i32, byteLength?: i32)`

Instance Members:

- `const buffer: ArrayBuffer`
- `const byteLength: i32`
- `const byteOffset: i32`

---

- `getFloat32(byteOffset: i32, littleEndian?: bool): f32`
- `getFloat64(byteOffset: i32, littleEndian?: bool): f64`
- `getInt8(byteOffset: i32): i8`
- `getInt16(byteOffset: i32, littleEndian?: bool): i16`
- `getInt32(byteOffset: i32, littleEndian?: bool): i32`
- `getInt64(byteOffset: i32, littleEndian?: bool): i64`
- `getUint8(byteOffset: i32, littleEndian?: bool): u8`
- `getUint16(byteOffset: i32, littleEndian?: bool): u16`
- `getUint32(byteOffset: i32, littleEndian?: bool): u32`
- `getUint64(byteOffset: i32, littleEndian?: bool): u64`
- `setFloat32(byteOffset: i32, value: f32, littleEndian?: bool): void`
- `setFloat64(byteOffset: i32, value: f64, littleEndian?: bool): void`
- `setInt8(byteOffset: i32, value: i8): void`
- `setInt16(byteOffset: i32, value: i16, littleEndian?: bool): void`
- `setInt32(byteOffset: i32, value: i32, littleEndian?: bool): void`
- `setInt64(byteOffset: i32, value: i64, littleEndian?: bool): void`
- `setUint8(byteOffset: i32, value: u8, littleEndian?: bool): void`
- `setUint16(byteOffset: i32, value: u16, littleEndian?: bool): void`
- `setUint32(byteOffset: i32, value: u32, littleEndian?: bool): void`
- `setUint64(byteOffset: i32, value: u64, littleEndian?: bool): void`
- `toSting(): string`

The littleEndian defaults to `false`.

### Date

目前仅包含最基础的实现。

获取当前时间需要从宿主传入 Date 对象。

Construct:

`new Date(value: i64)`

### String

A fixed-length sequence of UTF-16 code units.

Static Members:

- `fromCharCode(unit: i32, surr?: i32): string`
- `fromCharCodes(units: u16[]): string`
- `fromCodePoint(code: i32): string`
- `fromCodePoints(codes: i32[]): string`

Instance Members:

- `const length: i32`

---

- `at(pos: i32): string`
- `charAt(pos: i32): string`
- `charCodeAt(pos: i32): i32`
- `codePointAt(pos: i32): i32`
- `concat(other: string): string`
- `includes(search: string, start?: i32): bool`
- `endsWith(search: string, end?: i32): bool`
- `startsWith(search: string, start?: i32): bool`
- `indexOf(search: string, start?: i32): i32`
- `lastIndexOf(search: string, start?: i32): i32`
- `padStart(length: i32, pad: string): string`
- `padEnd(length: i32, pad: string): string`
- `repeat(count?: i32): string`
- `replace(search: string, replacement: string): string`
- `replaceAll(search: string, replacement: string): string`
- `slice(start: i32, end?: i32): string`
- `split(separator?: string, limit?: i32): string[]`
- `substring(start: i32, end?: i32): string`
- `trim(): string`
- `trimStart(): string`
- `trimLeft(): string`
- `trimEnd(): string`
- `trimRight(): string`
- `toString(): this`

#### Encoding API

- `String.UTF8.byteLength(str: string, nullTerminated = false): i32`
- `String.UTF8.encode(str: string, nullTerminated = false): ArrayBuffer`
- `String.UTF8.encodeUnsafe(str: usize, len: i32, buf: usize, nullTerminated = false): usize`
- `String.UTF8.decode(buf: ArrayBuffer, nullTerminated = false): string`
- `String.UTF8.decodeUnsafe(buf: usize, len: usize, nullTerminated = false): string`
- `String.UTF16.byteLength(str: string): i32`
- `String.UTF16.encode(str: string): ArrayBuffer`
- `String.UTF16.encodeUnsafe(str: usize, len: i32, buf: usize): usize`
- `String.UTF16.decode(buf: ArrayBuffer): string`
- `String.UTF16.decodeUnsafe(buf: usize, len: usize): string`

与 JavaScript 的 UTF-16 字符串保持一致，可能出现单独的代理对中的一个，不会去显式的检查和纠正，这在 JS 与 WAS 互传时保持哈希一致很重要。

### Math

数学操作。

变体：

- NativeMath: WebAssembly implementation for f64
- NativeMathf: WebAssembly implementation for f32
- JSMath: JavaScript implementation for f64 (imported from the host)

`Math` 默认 `NativeMath`， `Mathf` 默认 `NativeMathf`。默认不采取 `JSMath`，除非你需要更小的体积而非更快的效率。

Static members:

- `const E: T`
- `const LN2: T`
- `const LN10: T`
- `const LOG2E: T`
- `const LOG10E: T`
- `const PI: T`
- `const SQRT1_2: T`
- `const SQRT2: T`

---

- `abs(x: T): T`
- `floor(x: T): T`
- `ceil(x: T): T`
- `pow(base: T, exponent: T): T`
- `max(value1: T, value2: T): T`
- `min(value1: T, value2: T): T`
- `random(): T`
- `round(x: T): T`
- `trunc(x: T): T`
- `exp(x: T): T`
- `sign(x: T): T`
- `signbit(x: T): bool`
- `sqrt(x: T): T`
- `log(x: T): T`
- `log2(x: T): T`
- `log10(x: T): T`
- `sin(x: T): T`
- `sinh(x: T): T`
- `cos(x: T): T`
- `cosh(x: T): T`
- `tan(x: T): T`
- `tanh(x: T): T`
- `asin(x: T): T`
- `asinh(x: T): T`
- `acos(x: T): T`
- `acosh(x: T): T`
- `atan(x: T): T`
- `atan2(y: T, x: T): T`
- `atanh(x: T): T`
- ...

### Number

数字的包装对象。它包含的值可是任何数字类型的值。

#### 整数

One of the wrappers `I8`, `I16`, `I32`, `I64`, `U8`, `U16`, `U32` or `U64` represents their respective basic integer type `T`.

Static Members:

- `const MIN_VALUE: T`
- `const MAX_VALUE: T`
- `parseInt(value: string, radix?: i32): T`

Instance Members:

- `toString(radix?: i32): string`

#### 浮点

One of the wrappers `F32` or `F64` represents their respective basic floating point type `T`.

Static Members:

- `const EPSILON: T`
- `const MAX_VALUE: T`
- `const MIN_VALUE: T`
- `const MAX_SAFE_INTEGER: T`
- `const MIN_SAFE_INTEGER: T`
- `const POSITIVE_INFINITY: T`
- `const NEGATIVE_INFINITY: T`
- `const NaN: T`
- `isNaN(value: T): bool`
- `isFinite(value: T): bool`
- `isInteger(value: T): bool`
- `isSafeInteger(value: T): bool`
- `parseInt(value: string, radix?: i32): T`
- `parseFloat(value: string): T`

Instance Members:

- `toString(): string`

### Map

与 JavaScript 的 Map 一致，除了，如果 get 一个不存在的 key 会直接报错而不是返回 `undefined`（这里不存在 `undefined` 类型），因此在 get 一个可能不存在的项目时要 has 检查。

Construct:

`new Map<K,V>()`

Instance Members:

- `const size: i32`

---

- `set(key: K, value: V): this`
- `get(key: K): V`
- `delete(key: K): bool`
- `has(key: K): bool`
- `clear(): void`
- `keys(): Array<K>`
- `values(): Array<V>`
- `toString(): string`

### Set

与 JavaScript 的 Set 一致。

Construct:

`new Set<T>()`

Instance Members:

- `const size: i32`

---

- `add(value: T): void`
- `delete(key: K): bool`
- `has(value: T): bool`
- `clear(): void`
- `values(): Array<T>`
- `toString(): string`

### Error

Represents a runtime error.

变体：

- Error
- RangeError
- TypeError
- SyntaxError

Construct:

`new Error(message?: string)`

Instance Members:

- `const message: string`
- `const name: string`
- `const stack: string`

---

- `toString(): string`

### Symbol

一个唯一的符号。

与 JavaScript 的类似，但不全相同。

Construct:

`Symbol(description?: string): symbol` 它不是一个对象，是基本值，因此不需要 new

Static Members:

- `for(key: string): symbol`
- `symbol(sym: symbol): string | null`

Instance Members:

- `toString(): string`: Returns a string representation of the symbol of the form `"Symbol(<keyName>)"`.

### console

console 的实现需要从宿主传入。

Methods:

- `log`
- `info`
- `warn`
- `error`
- `debug`
- `assert`
- `time`
- `timeLog`
- `timeEnd`

### crypto

Static Members:

- `getRandomValues(array: Uint8Array): void`

### heap

提供了内存管理方法，类似 C 语言的 malloc calloc realloc 和 free。

Manual memory management can be used in parallel wtih GC (automatic memory management), which can be handy, just like C++. But both of the two managements can not be used mixed for a same target (i.e. trying to `heap.free` a GC hosted object or casting a block to a managed object respectively would break since one has a GC header and the other does not).

Static Members:

- `heap.alloc(size: usize): usize`: The `malloc` in C.
- `heap.realloc(ptr: usize, size: usize): usize`: The `realloc` in C.
- `heap.free(ptr: usize): void`: The `free` in C.
- `heap.reset(): void`: 重置整个 heap 内存，仅限 stub 模式。

### process

Node.js 的 `process` 模拟。

Static Members:

- `arch: string`: The CPU architecture for which the binary was compiled. Either `wasm32` or `wasm64`.
- `platform: string`: Where the binary was compiled. Always `wasm`.
- `argv: string[]`: Array of command line arguments passed to the binary on `instantiation`.
- `env: Map<string,string>`: Map of variables in the binary's user environment.
- `exitCode: i32`: Process exit code to use when the process exits gracefully. Defaults to `0`.
- `exit(code?: i32): void`: Terminates the process with either the given exit code, or `process.exitCode` if omitted.
- `stdin: ReadableStream`
- `stdout: WritableStream`
- `stderr: WritableStream`
- `time(): i64`: 系统的当前时间，单位毫秒。
