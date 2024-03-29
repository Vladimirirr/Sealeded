# WAT (WebAssembly Text Format)

地址：<https://developer.mozilla.org/en-US/docs/WebAssembly/Understanding_the_text_format>

WAT 的组成单位是 S-表达式，一个非常古老非常简单的表示树的文本格式。一个 S-表达式 即树上的一个节点，由一个括号表示。

## 一个简单的示例

Source WAS:

```ts
/**
 * The result of multiplying a by b.
 * @param a
 * @param b
 * @return a * b
 */
function multiply(a: i32, b: i32): i32 {
  return a * b
}

/**
 * Get the factorial of a number.
 * @param n - limited in [1, 10]
 * @return n! or -1 if failed
 */
export function factorial(n: i32): i32 {
  const min = 1
  const max = 10
  if (n == min) return 1
  if (n > max) return -1 // 非法入参 too big
  if (n < min) return -1 // 非法入参 too small
  let sum: i32 = 1
  for (let i = 2; i <= n; i++) {
    // sum *= i;
    sum = multiply(sum, i)
  }
  return sum
}
```

Result WAT:

```wat
;; 根节点，一个 wasm 模块
(module
  ;; multiply 函数
  (func $multiply (param $a i32) (param $b i32) (result i32)
   ;; wasm 的函数是栈式的，即 stack machine
   local.get $a ;; $a 入栈（入和出的都是内置栈的操作数栈）
   local.get $b ;; $b 入栈
   i32.mul ;; 出栈两个，做数学积，再入栈
   ;; 此时，栈只有一项，便是函数的结果
   return ;; 结束函数，不操作栈
  )

  ;; factorial 函数
  (func $factorial (param $n i32) (result i32)
   (local $sum i32) ;; 本地变量
   (local $i i32) ;; 本地变量
   local.get $n ;; n 入栈
   i32.const 1 ;; 1 入栈
   i32.eq ;; 出栈两个，比较是否相等(1 true and 0 false)，入栈结果
   if ;; 出栈结果
    ;; 真
    i32.const 1
    return
   end
   local.get $n
   i32.const 10
   i32.gt_s ;; gt(>) with signed
   if
    i32.const -1
    return
   end
   local.get $n
   i32.const 1
   i32.lt_s ;; lt(<) with signed
   if
    i32.const -1
    return
   end
   i32.const 1
   local.set $sum ;; 出栈一个，赋值给 $sum
   i32.const 2
   local.set $i
   loop $for-loop-0 ;; loop 和它的标签名，0 = index
    local.get $i
    local.get $n
    i32.le_s ;; le(<=) with signed
    if
     local.get $sum
     local.get $i
     call $multiply ;; call function 出栈和赋值（即 local.$sum -> param.$a、local.$i -> param.$b）此函数需要的参数，同时栈的控制权由此函数接管
     local.set $sum
     local.get $i
     i32.const 1
     i32.add
     local.set $i
     br $for-loop-0 ;; br = break, here means continue loop
    end
   end
   local.get $sum ;; 最终的 sum 值入栈，栈目前只有一项（函数结果）
   return
  )

  ;; 导出 multiply 和 factorial
  (export "multiply" (func $multiply))
  (export "factorial" (func $factorial))
)

```

## 宿主函数的回值

```wat
(import "env" "outTest" (func $outTest (result i32)))
;; 回值会被 JavaScript 转成符合 i32 类型的值
;; 在 wasm 的 NaN = f32 or f64 的 0x8000000000000
;; 在 wasm 的 Infinity = f32 or f64 的 inf
```

## 打印字符串的示例

`WebAssembly`:

```wat
(module
  ;; 导入打印函数
  (import "console" "log" (func $consoleLog (param i32) (param i32)))

  ;; 我们指定：前 4KB 是共享交换区，即 sharedMemoryArea
  ;; 接下来的 4KB 是栈（我们自己的栈，WebAssembly 有自己的内置栈）
  ;; 剩下的是堆内存
  (memory $memory 1) ;; 1 = 1 Page = 64KB

  (func $printHello
   ;; Set 'hello' to position from 0 to 4 at memory.
   i32.const 0
   i32.const 104 ;; ascii 'h'
   i32.store8 $memory ;; 目前 WebAssembly 仅支持一个内存，因此 $memory 可省略
   i32.const 1
   i32.const 101 ;; ascii 'e'
   i32.store8 $memory
   i32.const 2
   i32.const 108 ;; ascii 'l'
   i32.store8 $memory
   i32.const 3
   i32.const 108 ;; ascii 'l'
   i32.store8 $memory
   i32.const 4
   i32.const 111 ;; ascii 'o'
   i32.store8 $memory
   ;; Set arguments for consoleLog.
   i32.const 0 ;; param ptr
   i32.const 5 ;; param len
   call $consoleLog
  )

  (export "memory" (memory $memory)) ;; 导出内存（共享)
  (export "printHello" (func $printHello)) ;; 导出函数
)

```

`test.js`:

```js
const wasm = await WebAssembly.instantiateStreaming(
  fetch('./build/test.wasm'),
  {
    console: {
      log: (ptr, len) => {
        var bytes = new Uint8Array(memory.buffer, ptr, len)
        var string = new TextDecoder('utf8').decode(bytes)
        console.log('wasm print:', string)
      },
    },
  }
)
const memory = wasm.instance.exports.memory
wasm.instance.exports.printHello()
```

## Table 的简单示例

`WebAssembly`:

```wat
(module
  (func $f1 (result i32)
    i32.const 42)
  (func $f2 (result i32)
    i32.const 16)
  (table 2 funcref) ;; includes 2 elements with type funcref(function reference)
  (elem (i32.const 0) $f1 $f2) ;; `i32.const 0` represents the start offset of $f1 and $f2
  (type $return_i32 (func (result i32))) ;; defines a type
  (func (export "callWithIndex") (param $idx i32) (result i32)
    local.get $idx
    call_indirect (type $return_i32) ;; call a function at position $idx with specified type
  )
)

```

`test.js`:

```js
const wasm = await WebAssembly.instantiateStreaming(
  fetch('./build/test.wasm'),
  {}
)
console.log(wasm.instance.exports.callByIndex(0)) // 42
console.log(wasm.instance.exports.callByIndex(1)) // 16
console.log(wasm.instance.exports.callByIndex(2)) // RuntimeError: The table index is out of bounds.
```

## Table 和 Memory 实现函数共享

A simple kind of DLL(Dynamic Link Library).

两个 wasm 共享同一个 内存对象 和 表格对象（函数**指针**）。

`test1.wat`:

```wat
(module
  (import "env" "memory" (memory 1)) ;; 导入的内存大小要匹配
  (import "env" "table" (table 2 funcref)) ;; 导入的数量和类型要匹配
  (elem (i32.const 0) $sharedFn) ;; 把 $sharedFn 保存到 table 的 0 号位置（目前仅支持一个 table，因此不需要显式指定 table 名字）
  (func $sharedFn (result i32)
    i32.const 0
    i32.load ;; 载入和得到内存 0 位置的值

    ;; 或这样写（参数在指令的下面），像 JavaScript 的函数一样，但不是全部的 WAT Compiler 都支持
    ;; i32.load (i32.const 0)
  )
)

```

`test2.wat`:

```wat
(module
  (import "env" "memory" (memory 1))
  (import "env" "table" (table 2 funcref))
  (type $void_to_i32 (func (result i32)))
  (func (export "callSharedFnWithParams") (result i32)
    i32.const 0
    i32.const 42
    i32.store ;; store 42(as a param for sharedFn) at address 0
    i32.const 0
    call_indirect (type $void_to_i32) ;; call
  )
)

```

`test.js`:

```js
const table = new WebAssembly.Table({ initial: 2, element: 'anyfunc' }) // 2 elements with anyfunc(eq funcref in new version)
const memory = new WebAssembly.Memory({ initial: 1 }) // 1 Page = 64 KB = 65536 Bytes

const importObject = {
  env: { table, memory },
}

const init = async () => {
  const wasm = await Promise.all([
    WebAssembly.instantiateStreaming(fetch('./build/test1.wasm'), importObject),
    WebAssembly.instantiateStreaming(fetch('./build/test2.wasm'), importObject),
  ])
  window.wasm = wasm
  console.log('result', wasm[1].instance.exports.callSharedFnWithParams())
}

init()
```
