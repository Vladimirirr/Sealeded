# 转换

## TextDecoder

字节数组 --> 字符串

将字节数组按照指定的编码方式（支持多种）输出字符串。

```js
/**
 * @constructor TextDecoder(encoding, options)
 * @param {string = 'utf-8'} encoding - 浏览器内置的多语言 + 当前操作系统内置的多语言
 * @param {Object = {}} options
 * @param {boolean = false} options.fatal - throw an error or replace with 0xFFFD when decoding invalid bytes
 * @param {boolean = false} options.ignoreBOM - ignore the bom
 * @return {string}
 */
const de = new TextDecoder('utf-8')
const bytes = new Uint8Array([72, 101, 108, 108, 111])
const result = de.decode(bytes) // decode 方法仅接受 Uint8Array 格式
console.log(result) // Hello
```

## TextEncoder

字符串 --> 字节数组

将字符串（仅限 UTF-8）输出它的字节数组（Uint8Array）。

```js
// TextEncoder only supports UTF-8
const en = new TextEncoder(/* no params */)
const bytes = en.encode('Hello')
console.log(bytes) // [72, 101, 108, 108, 111]
```
