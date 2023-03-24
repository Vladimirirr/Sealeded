# 浏览器相关的 api

## btoa 与 atob

This feature is available on WebWorker.
This feature is compatibility on all browsers.

### btoa(binary to ascii)

这里的 ascii 具体是 latin-1。

将字符串表示(latin-1)的二进制数据转换成 base64。

如果传入非字符串，将对其字符串化，例如，传入 TypedArray 将执行它的 toString 方法（与 Array 的一样）。

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

## textContent 与 innerText

textContent 获取节点包含的**全部**文本内容，innerText 获取节点**已经渲染出来**的文本。因此，innerText 获取不到 script 和 style 的内容。

```html
<div id="test">
  <p>Hello</p>
  <p style="display: none;">Jack</p>
  <p style="visibility: hidden;">Jack</p>
  <p style="opacity: 0;">Jack</p>
</div>
<script>
  console.log(document.getElementById('test').textContent) // 'Hello\nJack\nJack\nJack'
  console.log(document.getElementById('test').innerText) // 'Hello\n\nJack'
</script>
```

如果对 textContent 或 innerText 赋值，其实就是 innerHTML 的赋值！只是赋值的内容都将转成文本（特殊字符将被转义）。

## alert、confirm 与 prompt

这些是浏览器提供的最基本的反馈式交互组件，它们都以模态框的形式出现。（模态，model，意味着当它出现时，除了它的其他内容都不能被交互，甚至将暂停当前正在执行的代码。）

- `alert(message: string = ''): void` 提示框
- `confirm(message: string = ''): boolean` 确认框
- `prompt(title: string, default?: string = ''): string | null` 输入框

## 对象拷贝 -- Object.assign 与 structuredClone

### Object.assign

ES6 标准。

语法：`Object.assign(target: Object, ...sources: Object[]): Object`

浅拷贝一个对象，将一些对象的全部可枚举建（不含继承）赋值（操作符`=`）到目标对象上。

### structuredClone

深拷贝一个值（任意类型）。

语法：`structuredClone(value: any, { transfer?: Transferable[] }): any`

这其实是浏览器内部的[结构化拷贝方法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)对外暴露的实现方法。

浏览器很多与值的传输和保存方法均在使用：

- postMessage
- indexedDB
- ...

浏览器兼容性：

- Chrome >= 98, 2022.02
- Firefox >= 94, 2021.11
- Safari >= 15.4, 2022.03
- AndroidWebview >= 111, 2023.03

## eval

语法：`eval(code: string): any`

eval 的结果是最后一条语句的值，eval 内的代码在当前词法环境（lexical environment）下执行，且能修改外面的变量。

在严格模式下，eval 有自己单独的词法环境，不能影响到外面。

不在严格模式下，eval 没有自己单独的词法环境，它共享它执行时的词法环境。

注意，使用 `window.eval` 执行时，它的词法环境将被限制在 window 下。

不节制地 eval 会导致 minifier 工具不能正常工作（工具不能预知什么样的代码会被构建）。

### 语句的值

常规代码只能得到一个表达式的值，不能得到一条语句的值，得到一条语句的值我们只能可以借助浏览器的控制台、或者 eval 方法。但是，在过去，有一个被撤销的提案可以得到语句的值：

```js
// 使用 Call 关键词，紧跟着一个语句块
const result = Call {
  1 + 1
}
console.log(result) // output: 2
```

## new Function

语法：`new Function(...params: string[], code: string): Function`

与 eval 一样，但是它始终在 window 词法环境下执行传入的字符串代码（这不仅提高了构建未知代码的安全性和效率，也使得各种 minifier 工具能正常工作）。

## sendBeacon

Beacon：n. 信标

This method is intended for analytics and diagnostics code to send data to a server. (Only available in window but not WebWorker)

在 onbeforeunload 或 onunload 事件里你的代码不能阻止此卸载过程（preventDefault 没有效果），浏览器会限制此事件处理器代码的执行时长，浏览器也不会保证 fetch 或 XHR 一定会被发送出去。

此接口将向 Server 发送一个少量内容的 POST 网络请求，不接收它的结果。浏览器会保证（承诺）将请求发出去(enqueue the request into the BackgroundTask list)，此方法不阻塞页面的卸载，请求可能在页面已经卸载了才被真正发出去，因此请求的结果不再有意义。

全部浏览器兼容。

语法：`navigator.sendBeacon(URL: string, data?: any): boolean`

- 任何 fetch 或 XHR 支持的内容类型都可以被发送（包括，ArrayBuffer、Blob、FormData、字符串、等等）
- 返回值表示浏览器是否已经接受了此请求（同时也做出承诺）
