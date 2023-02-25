# 转换

## TextDecoder

将字节数组按照指定的编码方式（支持多种）输出字符串。

```js
/**
 * @param {string} encoding
 * @param {Object} options
 * @param {boolean} options.fatal - throw an error or replace with 0xFFFD when decoding invalid bytes
 * @param {boolean} options.ignoreBOM - ignore the bom or not
 * @return {string}
 */
const de = new TextDecoder('utf-8') // more formats
const bytes = new Uint8Array([72, 101, 108, 108, 111])
console.log(de.decode(bytes)) // Hello
```

## TextEncoder

将字符串（仅限 UTF-8）输出它的字节数组。

```js
// TextEncoder only supports UTF-8
const en = new TextEncoder(/* no params */)
/**
 * @param {string} text
 * @return {Uint8Array}
 */
const bytes = en.encode('Hello')
console.log(bytes) // [72, 101, 108, 108, 111]
```
