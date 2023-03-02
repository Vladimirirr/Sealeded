# 浏览器相关的 api

## btoa 与 atob

This feature is available on WebWorker.
This feature is compatibility on all browsers.

### btoa(binary to ascii)

这里的 ascii 具体是 latin-1。

将字符串表示(latin-1)的二进制数据转换成 base64。

### atob(ascii to binary)

反向操作。

## encodeURIComponent 与 encodeURI

### encodeURIComponent

将输入当作 URI 的组件进行转义（UTF-8 的格式）。

不被转换的字符：`A-Za-z` `0-9` `-` `_` `.` `!` `~` `*` `'` `(` `)`

反向操作：decodeURIComponent

### encodeURI

将输入当作一个 URI 整体进行转义（UTF-8 的格式）。

不被转换的字符：

- URI 保留：`;` `,` `/` `?` `:` `@` `&` `=` `+` `$`
- 不需要被处理的：`A-Za-z` `0-9` `-` `_` `.` `!` `~` `*` `'` `(` `)`
- 其他：`#`

反向操作：decodeURI

### escape

This function had been deprecated.

当字符 `< 0xFF` 时，使用 `%udd` 替换。
当字符 `> 0xFF` 且 `< 0xFFFF` 时，使用 `%udddd` 替换。
如果字符 `> 0xFFFF` 将被替换成代理对的格式。

不被转换的字符：`@` `*` `_` `+` `-` `.`

反向操作：unescape（不能识别代理对）

## document.adoptedStyleSheets

Set an array of constructed(or compiled) stylesheets for a document(`window.document` or `customElement.shadowRoot`).

与直接在文档内使用的 `<style>`标签、`<link rel="stylesheet">`标签 相同，但是它具有可编程的接口 —— `CSSStyleSheet`。

举例：

```js
const css = new CSSStyleSheet()
css.replaceSync('p{ color: pink; }')
window.document.adoptedStyleSheets.push(css) // Safari(2023.02) 不支持
```

## setTimeout 与 setInterval

### setTimeout

将函数推迟到一段时间之后再执行。

签名：`setTimeout(func, delay = 0, ...args)`

注意：此函数只是告诉浏览器想要在 delay 毫秒之后执行，但是如果浏览器正在执行其他事情或者当前系统正忙时，可能会推迟它的执行，**也就是真正的执行时机会延后（但绝对不会提前）**

### setInterval

以此时间间隔重复执行此函数。

签名与 setTimeout 相同。

浏览器内部会按照`[c + delay, c + 2delay, c + 3delay, c + n * delay]`的时刻重复执行此函数（其中 c = currentTime，即执行 setInterval 的时刻）。

func 函数的实际执行时间间隔要比代码中设定的时间间隔要短！（因为执行此函数被包括在了 delay 期间。）

### 休眠

当页面处于非活跃状态，浏览器会显著地降低计时器的频率。

## crypto

crypto 接口提供了最基本的密码学方面的 API。（WebWorker 同样）

- `crypto.getRandomValues(typedArray)`: 向 typedArray 填入密码安全的随机数
- `crypto.getRandomValues()`: 仅在安全上下文，得到密码安全的 UUID 值
- `crypto.subtle`: 仅在安全上下文，得到一个 subtleCrypto 对象

### subtleCrypto

提供了密码学上的基本操作方法。

- `encrypt`
- `decrypt`
- `digest`
- `sign`
- ...
