# WebComponents

## 概述

浏览器内置的组件封装技术（封装 JavaScript、HTML 和 CSS）。

文档：https://developer.mozilla.org/en-US/docs/Web/Web_Components

WebComponents 技术的基建工具：

1. Custom elements - 自定义元素的逻辑模板
2. Shadow dom - 组件内部结构
3. CSS scoping - 组件内部样式
4. Event retargeting - 组件事件重定位

其他：

1. 一个浏览器未识别的标签，将被视作 span
2. 一个 WebComponents 框架 [lit](https://github.com/lit/lit)

## Custom elements

- customElements.define(name, class, opts?) - defines a new custom element
- customElements.get(name) - returns the class of a custom element
- customElements.upgrade(elem) - tries to upgrade all elements containing shadow dom in the elem, even if they are not connected
- customElements.whenDefined(name) - returns a promise that resolves when the element is defined

位于自定义元素内的子元素触发的事件，当冒泡到自定义元素外时，它的 target 将被重新定位为自定义元素。

### Upgrade of custom elements

如果浏览器在 customElements.define 前的任何地方见到了自定义元素，不会报错，只是把这个元素当作未知元素。

`:not(:defined)` CSS 选择器可以对这样的未定义的元素增加样式。

当 customElement.define 执行了，自定义元素就被 upgraded。

### The render order of HTML elements

```html
<div>
  <p></p>
</div>
```

Order: div constructed -> div connected -> p constructed -> p connected -> div disconnected -> p disconnected

例子：

```html
<script>
  customElements.define(
    'user-info',
    class extends HTMLElement {
      connectedCallback() {
        console.log(this.innerHTML) // output nothing, because user-info is rendered before the b
      }
    }
  )
</script>

<user-info><b>Jack</b></user-info>
```

这与传统的框架(Vue、React)不同，传统的框架必须要先把子组件渲染出来，然后插入到父组件里，但是 WebComponents 不需要，它的渲染由浏览器渲染。

### Autonomous custom elements

全新的自定义元素，直接继承自 HTMLElement 类。

示例 [index.html](./autonomousCustomElm/index.html)。

### Customized built-in elements

自定义内建元素，继承自已经存在的内建元素的类，例如 HTMLButtonElement，这样搜索引擎就能知道此自定义元素的语义了。

示例 [index.html](./customBuiltinElm/index.html)。

## Shadow Tree(Shadow Dom)

一个元素可以有如下两种 DOM Tree：

1. LightTree：常规的 DOM 树，暴露在主文档里面（能被 JavaScript 索引）
2. ShadowTree：隐藏的 DOM 树

如果一个元素同时存在这两种树，将渲染 Shadow 树，但是我们可以将其两者结合（ShadowTree 的插槽与 LightTree 的填充）。

可以存在 ShadowTree 的元素：

1. 自定义元素
2. 这些内置元素：atticle aside blockquote body div footer h1 h2 h3 h4 h5 h6 header main nav p secion span

### 封装

ShadowTree 的元素在主文档的 LightTree 的 querySelector 不可见，ShadowTree 有自己独立的样式（与主文档的相互隔离）。
