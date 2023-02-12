## JavaScript 字符编码

JavaScript 引擎内部以**UTF-16**编码存储字符。

## 码点和码元

码点(Code Point)：是每个字符的 Unicode 编号。

码元(Code Unit)：字符在实际传输过程中的编码方式（例如 UTF-8），可能是 1 个字节，也可能是 2 个及以上的字节，这些字节就是码元，**码元就是码点的具体实现**，对码点编码成码元的技术叫做字符编码方式，常见的有 UTF-8、UTF-16 和 UTF-32，这里的 UTF 全称是 Universal Character Set 或 Unicode Transformation Format。

举例：
Unicode 编码的字符集的汉字【你】的编号是 20320，十六进制是 0x4F60，也就是说，【你】的 Unicode 编码是 0x4F60，码点是 0x4F60，当【你】在网络上传输时，通常使用 UTF-8 编码，经过 UTF-8 编码的【你】变成了二进制的【E4 BD A0】，而这 3 个字节就是【你】的码元。

## 字符方法

问题引入：

`'𠮷'.length`输出`2`

回答：

这个字符不位于基本平面，它的码点是 0x20bb7，虽然 JavaScript 引擎内部以 UTF-16 存储字符，但是不区分代理对，认为 2 字节就是 1 个字符。

ES5 的 String.fromCharCode(Number)：返回 Number 指定的 Unicode 码点的字符，在[U+0000, U+FFFF]范围，超过 U+FFFF 则做高位截断处理，例如 0x20bb7 会被截断成 0x0bb7，验证`String.fromCharCode(0x20bb7) == String.fromCharCode(0x0bb7)`输出`true`

ES6 的 String.fromCodePoint(Number)：同 String.fromCharCode 方法，但是修复了码点超出 U+FFFF 的问题，`String.fromCodePoint(0x20bb7)`能正确输出`𠮷`

早期的 str.charAt(Index)：返回给定位置的字符，取给定位置的 2 个字节代表的码点值的字符

ES5 的 str.charCodeAt(Index)：返回给定位置的 2 个字节代表的码点值，如果 Index 超出【字符串长度-1】，则返回 NaN

ES6 的 str.codePointAt(Index)：同 str.charCodeAt 方法，还能准确识别出 UTF-16 的代理对，如果 Index 超出【字符串长度-1】，则返回 undefined

案例：

```js
console.log('𠮷a'.charCodeAt(0)) // 55362 只返回了该字符的代理对的前半部分
console.log('𠮷a'.charCodeAt(1)) // 57271 只返回了该字符的代理对的后半部分
console.log('𠮷a'.charCodeAt(2)) // 97
console.log('𠮷a'.charCodeAt(3)) // NaN
console.log('𠮷a'.codePointAt(0)) // 134071 返回了完整的该字符的代理对
console.log('𠮷a'.codePointAt(1)) // 57271 尝试识别代理对失败，返回这2个字节代表的码点
console.log('𠮷a'.codePointAt(2)) // 97
console.log('𠮷a'.codePointAt(3)) // undefined
console.log('𠮷a'.charAt(0)) // 乱码
console.log('𠮷a'.charAt(1)) // 乱码
console.log('𠮷a'.charAt(2)) // 'a'
console.log('𠮷a'.charAt(3)) // ''
```

## 补充

1. ES6 补充了非基本平面的字符的字面量表示方法：`'\u{hexNumber}'`，例如`'\u{20bb7}' == '𠮷'`输出`true`
2. String.fromCharCode 和 String.fromCodePoint 能传入多个数值参数，返回它们各自表示的字符的字符串
