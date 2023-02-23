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

TODO

## ElementsSearcher

TODO

### `getElement*`

### `querySelector*`

### 实时集合

## DOM MutationObserver

TODO
