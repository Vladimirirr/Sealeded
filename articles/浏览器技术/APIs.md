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

textContent 获取节点包含的**全部**文本内容（包括子节点的），innerText 获取节点**已经渲染出来**的文本（包括子节点的，简单地说，它和光标在此节点上选中的文本一样）。因此，innerText 获取不到 script 和 style 的内容。

如果 innerText 的节点未被渲染（未被插入文档 或 被隐藏），此时它与 textContent 一样。

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

如果对 textContent 或 innerText 赋值，则移除之前的全部节点，再插入一个文本节点！特殊字符将被转义，空白将被缩合，但是 innterText 还会将 `\n` 转换到 `<br>`。

innerText 受样式的影响，因此在读它时会以目前的样式实时渲染一次，再输出结果，性能较低，会导致重排重绘，这与读节点的 scrollTop 类似。

## alert、confirm 与 prompt

这些是浏览器提供的最基本的反馈式交互组件，它们都以模态框的形式出现。（模态，model，意味着当它出现时，除了它的其他内容都不能被交互，甚至将暂停当前正在执行的代码。）

- `alert(message: string = ''): void` 提示框
- `confirm(message: string = ''): boolean` 确认框
- `prompt(title: string, default?: string = ''): string | null` 输入框

兼容性问题：prompt 方法在 iOS 上的 Cancel 和 OK 两个按钮一样，按理，取消按钮的值得是 null。在 Chrome、Firefox 和 AndroidWebView 上都正常。

## 对象拷贝 -- Object.assign 与 structuredClone

### Object.assign

ES6 标准。

语法：`Object.assign(target: Object, ...sources: Object[]): Object`

浅拷贝一个对象，将一些对象的全部可枚举建（不含继承）赋值（操作符`=`）到目标对象上。

### structuredClone

深拷贝一个值（任意类型）。

语法：`structuredClone(value: any, { transfer?: Transferable[] }): any`

这其实是浏览器内部的 [结构化拷贝方法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) 对外暴露的实现方法。

下面列出的值不能拷贝：

1. 函数
2. 对象的特性描述符
3. 对象的`__proto__`
4. DOM 节点

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

## Web Share API

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API>

The Web Share API provides a mechanism for sharing text, links, files, and other content to an arbitrary share target selected by the user.

需要安全的上下文环境。不存在 WebWorker 里。

此 API 仅有两个方法：

1. `navigator.canShare(sharedData: Object): boolean` 检测内容是否可以被共享
2. `navigator.share(sharedData: Object): Promise<undefined | Error>` 尝试共享（需要已与页面发生过人机交互，因此它必须是由 UI 控件触发而来，而且 sharedData 必须符合格式）

sharedData:

- `url: string`: A string represents a URL to be shared
- `text: string`: A string represents a normal text to be shared
- `title: string`: A string represents a sharing title (may be ignored by the UA)
- `files: File[]`: An array of File objects represents files to be shared

可共享的文件类型：文本文件、媒体文件（图片、音频、视频）以及 PDF

示例：

```js
const sharedData = {
  title: 'Look something amazing',
  text: 'Hello!',
}

const btn = document.querySelector('button#share')

btn.addEventListener('click', async () => {
  if (!navigator.canShare(sharedData)) {
    return alert('失败（格式错误）')
  }
  try {
    await navigator.share(sharedData)
    alert('已共享。')
  } catch (err) {
    alert('失败（其他）')
  }
})
```

## Web Device Memory API

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Device_Memory_API>

仅在安全上下文。也存在 Worker 里。

仅 FF 不支持。

能帮我们推测当前客户端的内存大小（估计值），以前只能靠 `userAgent` 去猜。

```ts
type T_RAM = 0.25 | 0.5 | 1 | 2 | 4 | 8 // 单位 GB
const RAM: T_RAM = navigator.deviceMemory
// 只会返回 T_RAM 定义的值，不暴露真正的内存大小（保护低配或高配设备的隐私）
```

## Web Vibration API

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API>

仅 Safari 不支持。

Vibration for mobile devices.

```js
navigator.vibrate(200) // vibrate 200ms
navigator.vibrate([200, 100, 200]) // vibrate 200ms -> pause 100ms -> vibrate 200ms
navigator.vibrate(0) // 取消当前的 vibrate，下同
navigator.vibrate([])
navigator.vibrate([0])
```

## import.meta

import.meta 是一个语法！是一个整体！而非普通对象与它键值对的组合！

它的表现是一个特殊的对象，此对象描述着与此模块运行时有关的信息。

它的实体（表现出来的对象）由 JavaScript 运行时在装载此模块时被构建，此对象的 `__proto__` 是 null，它的全体特性都是可配置的、可写的、可枚举的。

默认的特性：

- `url`：模块的绝对路径
- `resolve(path: string): string`：类似 node.js 里的 resolve 方法，以当前路径和传入路径得到新路径

## insertAdjacentElement/insertAdjacentHTML/insertAdjacentText

adjacent: adj. 相邻的

全部浏览器支持。

### insertAdjacentElement

语法：`(targetElement: Element).insertAdjacentElement(position: string, elementToBeInserted: Element): elementToBeInserted`

参数 position：（值忽略大小写，但标准是全小写）

- `'beforebegin'`: before the `targetElement` itself
- `'afterend'`: after the `targetElement` itself
- `'afterbegin'`: inside the `targetElement`, and before its first child
- `'beforeend'`: inside the `targetElement`, and after its last child

注意：只在节点具有父元素存都存在在文档树里，beforebegin 和 afterend 有效

可视化表达：

```html
<!-- beforebegin -->
<target-element>
  <!-- afterbegin -->
  childNodes
  <!-- beforeend -->
</target-element>
<!-- afterend -->
```

### insertAdjacentHTML

与 insertAdjacentElement 类似，但是传入的是代表 HTML 结构的字符串（与 innerHTML 相同）。

与 innerHTML 相比，它不需要额外清空（卸载和销毁）已经存在的内容（节点们），因此，效率更高。

语法：`targetElement.insertAdjacentHTML(position: string, html: string): void`

### insertAdjacentText

与 insertAdjacentElement 类似，但是传入的是代表 HTML 文本节点的字符串。

语法：`targetElement.insertAdjacentText(position: string, html: string): void`

## append/prepend/after/before

全部浏览器支持。

### append

语法：`(targetElement: Element).append(...(string | Element)[]): void`

向 targetElement 的末处插入一组节点（字符串将转换到文本节点）。

与 appendChild 不同：

1. 还能直接插入字符串表示的文本节点
2. 批量插入
3. 没有返回值，而 appendChild 返回被插入的节点
4. appendChild 由 `Node.Prototype` 实现，而 append 由` (Element <- Node).Prototype` 实现

### prepend

同 append，只不过它向始处插入一组节点。

没有诸如 prependChild 方法，这与 appendChild 不对称。

### after

语法：`(targetElement: Element).after(...(string | Element)[]): void`

insertAdjacentElement 的 beforeend 方法的批量形式，字符串转换到文本节点。

### before

语法同 after。

insertAdjacentElement 的 afterbegin 方法的批量形式，字符串转换到文本节点。

## requestFullscreen

The `Element.requestFullscreen(): Promise<undefined | Error>` method triggers an asynchronous request for browsers to make the element be displayed in fullscreen mode.

The browser maintains a fullscreen-ed stack. So, the `requestFullscreen` means push, while the `exitFullscreen` means pop.

此方法带前缀的踩坑记录：

- `Element.webkitRequestFullscreen` 和 `Element.webkitRequestFullScreen`（注意，此处的 `S` ！）都存在在 Chrome 里。但是只有 `webkitExitRequestFullscreen` 存在, 而 `webkitExitRequestFullScreen` 不存在（离谱！）。
- 带前缀的 `webkitRequest*` 和 `webkitExit*` 只触发带前缀的 `onwebkitfullscreenchange` 事件，不触发标准的 `onfullscreenchange` 的事件。同理，标准的 `reques*` 和 `exit*` 只触发标准的 `onfullscreenchange` 事件。
