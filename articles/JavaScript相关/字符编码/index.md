# JavaScript 与字符编码

JavaScript 引擎内部以**UTF-16**编码存储字符。

## 码点和码元

码点(Code Point)：是每个字符的 Unicode 编号。

码元(Code Unit)：字符在实际传输过程中的编码方式（例如 UTF-8），可能是 1 个字节，也可能是 2 个及以上的字节，这些字节就是码元，**码元就是码点的具体实现**，对码点编码成码元的技术叫做字符编码方式，常见的有 UTF-8、UTF-16 和 UTF-32， UTF 全称 Unicode Transformation Format。

举例：
Unicode 编码的字符集的汉字【你】的编号是 20320，十六进制是 0x4F60，也就是说，【你】的 Unicode 编码是 0x4F60，码点是 0x4F60，当【你】在网络上传输时，通常采取 UTF-8 编码，经过 UTF-8 编码的【你】变成了二进制的【E4 BD A0】，而这 3 个字节就是【你】的码元。

## 字符方法

问题引入：

- `'𠮷'.length` 输出 `2`
- `[...'𠮷'].length` 输出 `1`

回答：

这个字符不位于基本平面，它的码点是 0x20bb7。传统的 JavaScript 字符串长度 length 认为 2 个字节就是 1 个字符，而 ES6 的字符串内置的迭代器能正常识别 UTF-16 的代理对。

为什么传统的 JavaScript 方法不能识别代理对，是因为 JavaScript 被创造出来的时候认为 UCS-2 已经足够了。

### 方法

ES5 的 String.fromCharCode(Number)：返回 Number 指定的 Unicode 码点的字符，在[U+0000, U+FFFF]范围，超过 U+FFFF 则做高位截断处理，例如 0x20bb7 会被截断成 0x0bb7，验证`String.fromCharCode(0x20bb7) == String.fromCharCode(0x0bb7)`输出`true`

ES6 的 String.fromCodePoint(Number)：同 String.fromCharCode 方法，但是修复了码点超出 U+FFFF 的问题，`String.fromCodePoint(0x20bb7)`能正确输出`𠮷`

早期的 String#charAt(Index)：返回给定位置的字符，取给定位置的 2 个字节代表的码点值的字符

ES5 的 String#charCodeAt(Index)：返回给定位置的 2 个字节代表的码点值，如果 Index 超出【字符串长度 - 1】，则返回 NaN

ES6 的 String#codePointAt(Index)：同 String#charCodeAt 方法，还能识别出 UTF-16 的代理对，如果 Index 超出【字符串长度 - 1】，则返回 undefined

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

### 补充

1. ES6 补充了非基本平面的字符的字面量表示方法：`'\u{hexNumber}'`，例如`'\u{20bb7}' == '𠮷'`输出`true`
2. String.fromCharCode 和 String.fromCodePoint 能传入多个数值参数，返回它们各自表示的字符的字符串

## 字符集的编码

Unicode 是地球全部已知语言文字的整张映射表。
一共 17 个平面，范围：`[0, 0x10FFFF]`，其中 0 号平面`[0, 0xFFFF]`，16 号平面`[0x100000, 0x10FFFF]`。

UTF 是最流行的 Unicode 编码方案，实现网络 Unicode 字符的传输。

### 可变编码：

#### UTF-8

1. ASCII 占 1 字节
2. ASCII Extension（法语、德语、等）占 2 字节
3. 其他常见语种（中文、日文、等）占 3 字节
4. 表情和非常见文字 占 4 字节

#### UTF-16

1. 0 号平面的全部字符占 2 字节
2. 代理对（其他平面）占 4 字节：范围`[U+D800, U+DFFF]`

#### 地方专有（都兼容 ASCII）

1. GBK 中文汉字
2. Big5 中文繁体汉字
3. ShiftJIS 日文
4. ...

### 固定编码：

#### ASCII

只有 ASCII 字符集。

#### UCS-2

UCS = Universal Character Set

只能表示 0 号平面，始终 2 字节。

#### UCS-4(UTF-32)

能表示全部平面，始终 4 字节。

## JavaScript 的支持

JavaScript 的字符集编解码工具：[TextEncoder 与 TextDecoder](./Codec.md)

## 汉字编码：GB2312、GBK 和 GB18030

GB 即 GuoBiao（国标），2312 和 18030 是 国标号。GBK 即 GuoBiaoKuoZhan。

三者关系：GB18030 > GBK > GB2312（依次兼容，依次涵盖更多的字符）

GB2312：

- 格式：ASCII 1 字节，汉字 2 字节
- 概览：收录 6763 汉字 及 682 特殊符号

GBK：

- 格式：ASCII 1 字节，汉字 2 字节
- 概览：收录 20902 汉字（包含繁体，但与 Big5 不兼容） 及 984 特殊符号

GB18030：

- 格式：ASCII 1 字节，汉字 2 和 4 字节，4 字节是 GB18030 多出来的字符（它的前两个字节不与 2 字节的汉字相冲突）
- 概览：更多的罕见字符（比如，甲骨文）

GB 系列都采取固定长度的方法来管理不同的字符（与 UTF-16 类似）。

除非是语言考古专业方向的汉字，不然 GBK 已经足够了。
