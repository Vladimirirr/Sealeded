# WebComponents

## 概述

浏览器内置的组件封装技术（封装 JavaScript、HTML 和 CSS）。

文档：https://developer.mozilla.org/en-US/docs/Web/Web_Components

WebComponents 技术的基建工具：

1. Custom elements - 自定义元素的逻辑模板（基类）
2. Shadow dom - 组件内部结构
3. CSS scoping - 组件内部样式
4. Event retargeting - 组件事件重定位

其他：

1. 【空白（包括还未 upgrade）的自定义元素】和【HTMLUnknownElement 元素】与【空白的 span 元素】在 CSS 表现上完全一致
2. 一个 WebComponents 框架 [lit](https://github.com/lit/lit)

## Custom elements

- `customElements.define(name: string, class: HTMLElement, { extends?: string })` - defines a new custom element
- `customElements.get(name: string)` - returns the class of a custom element
- `customElements.upgrade(elem: HTMLElement)` - tries to upgrade all elements containing shadow dom in the elem, even if they are not connected
- `customElements.whenDefined(name: string)` - returns a promise that resolves when the element is defined

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

这与传统的框架(Vue、React)不同，传统的框架必须要先把子组件渲染出来，然后插入到父组件里，但是 WebComponents 不需要，它的渲染直接由浏览器渲染。

### Autonomous custom elements

全新的自定义元素，直接继承自 HTMLElement 类。

示例 [index.html](./autonomousCustomElm/index.html)。

### Customized built-in elements

自定义内建元素，继承自已经存在的内建元素的类，例如 HTMLButtonElement，这样搜索引擎就能知道此自定义元素的语义了。

示例 [index.html](./customBuiltinElm/index.html)。

此标准没有被 Safari 或 WebKit 的浏览器实现，它们认为扩展一个已知元素功能的最好方法是对此元素附上不同功能的特性（即 CustomAttribute，类似 Vue 的自定义指令），例如（伪代码）：

```html
<p make-round="12px">Hello</p>
<script>
  // 对节点 `border-radius: xxxx`
  class MakeRound extends Attribute {
    constructor() {}
    makeRound() {
      this.style.borderRadius = this.attributes.get('make-round')
    }
    connectedCallback() {
      // 此特性附上节点时，或带此特性的节点连接到文档时
      this.makeRound()
    }
    disconnectedCallback() {
      // 相反
      this.style.borderRadius = ''
    }
    valueChanged(oldValue, newValue) {
      // 特性值变化时
      this.makeRound()
    }
  }
  customAttrbutes.define('make-round', MakeRound)
</script>
```

## Shadow Dom

一个元素可以有如下两种 DOM 树：

1. LightDom：常规的 DOM 树，暴露在主文档里面
2. ShadowDom：隐藏的 DOM 树，隐藏在组件内部（主文档不能查找到）

如果一个元素同时存在这两种树，将渲染 Shadow 树，但是我们可以将其两者结合（ShadowDom 的插槽与 LightDom 的填充（占槽内容））。

可以存在 ShadowDom 的元素：

1. 自定义元素
2. 这些内置元素：`article` `aside` `blockquote` `body` `div` `footer` `h1` `h2` `h3` `h4` `h5` `h6` `header` `main` `nav` `p` `secion` `span`

### ShadowDom 的样式

可以给 ShadowDom 使用 style 和 link:css 标签。

具体的：

1. `:host` 选择 shadow 的宿主，主文档里对宿主的样式将覆盖`:host`选择器的样式（除非`:host`里的样式使用了`important`规则），这样我们可以给元素设置默认的样式，也可以在外部自定义元素的样式
2. `:host(attr)` 只在宿主带有特定 attribute 时选中它
3. `:host-context(selector)` 只有宿主的某一个祖先元素能匹配 selector 时才选中它

插槽的样式来自主文档，而非 shadow：

1. 可以对 slot 样式化，然后 slot 的内容将继承样式
2. `::slotted(selector)` 根据 selector 匹配占槽元素且给其设置样式（只能顶级独立使用），它不能向下选择更深的子元素，比如`::slotted(div > p)`或`::slotted(div) > p`都不可以

主文档没有任何的选择器能选中 shadow 内部的子元素，但是，CSS 变量可以穿梭在主文档和 shadow 里，我们可以在 shadow 里使用带有 CSS 变量的样式，比如`.tipColor{ color: var(--baseFontColor, black) }`，而在主文档可以设置对应的 CSS 变量，还可以根据需要实时改变它的值，就像暴露方法一样，我们将某一个样式暴露出去（实现组件样式的自定义需求）：

```css
body {
  --baseFontColor: pink;
}
custom-elem {
  --baseFontColor: hotpink;
}
```

#### 总结

shadow 样式可以影响：

- shadow 树
- shadow 宿主
- 占槽元素（来自 Light）（`::slotted(selector)`可以选择占槽元素本身，但不能选择它的子元素）

主文档样式可以影响：

- shadow 宿主
- 占槽元素及占槽元素的内容

### ShadowDom 的事件

shadow 内的子元素触发的事件当冒泡到宿主时，将被浏览器重定位事件的 target 为宿主而非真正的触发事件的元素。

如果事件发生在 slotted（占槽元素）上，不会发生重定向（因为它就是存在在 LightDom 里，即主文档里）。

事件的 event.composed 控制着此事件能否冒泡出宿主。因此，派发自定义事件需要指定 composed，不然它将不能冒泡出组件（宿主），也不能被主文档捕获。

```js
window.addEventListener('click', (e) => {
  console.log('window', e.composedPath())
})
customElements.define(
  'my-elem',
  class extends HTMLElement {
    connectedCallback() {
      // 测试 open 和 closed 的 ShadowDom 是如何影响到占槽元素的事件路径的
      const shadow = this.attachShadow({ mode: 'open' })
      shadow.innerHTML = `
        <div class="myElemContainer">
          <slot name="title"></slot>
        </div>
      `
    }
  }
)
```

结果：

1. ShadowOpenDom 的占槽元素事件路径：slotted -> slot -> div.myElemContainer -> shadowDomRoot(documentFragment) -> my-elem(host) -> body -> html -> document -> window
2. ShadowClosedDom 的占槽元素事件路径：slotted -> my-elem -> body -> html -> document -> window

### ShadowDom 的插槽

slot 元素本身不会产生任何特定的框（可理解是自带 `display: none;` 的特性），但是会呈现其里面的内容。

slot 元素的 offsetParent 永远是 null。

slot 是一个渲染结果的占位元素（一个透传元素，不对任何已有 dom 树的结构构成影响），占槽元素的渲染结果将映射到此处，但是仅仅是映射而已：

1. 占槽元素依旧在主文档里，位置没有发生改变，它的 owner 是主文档
2. ShadowDom 也没有真正地将占槽元素替换 slot

ShadowDom 的样式选择器`::slotted`提供了装饰占槽元素的能力，但是只能针对占槽元素本身（无法再选择它的下级）。

```html
<user-card>
  <span slot="username" style="color: hotpink;">RYZZ</span>
  <!-- 多个同一个名字的插槽将依次映射 -->
  <span slot="birthday">19981122</span>
  <span slot="birthday">19981122</span>
  <!-- 将被当作默认插槽的内容 -->
  <div>
    <!-- 无效，slot必须是直接子代 -->
    <span slot="birthday">19981122</span>
  </div>
</user-card>
```

#### 占槽元素的更改

占槽元素的增加、修改、移除，浏览器将实时保持它的渲染结果。

我们可以监视 slotchange 事件（例如`this.shadowRoot.onslotchange = () => {}`），此事件由相应的 slot 标签发出且 composed 是 false，从而知晓占槽元素的增加或移除情况，但是此事件不会在占槽元素修改时触发，想要监视占槽元素的修改，使用 MutationObserver。

#### 与插槽相关的方法

1. `slottedNode.assignedSlot` 返回该占槽元素映射的插槽元素
2. `slotNode.assignedNodes({ flatten: false })` 返回此插槽正在映射的占槽节点们
3. `slotNode.assignedElements({ flatten: false })` 同上，只是占槽元素们

参数：

- `flatten`: a boolean value indicating if to return the assigned elements of any available child slot elements (true) or not (false)

#### 下拉菜单的例子

```html
<template id="mySelectTemp">
  <style>
    .MySelectContainer {
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
    }
    .MySelectContainer > .title {
      padding: 3px;
      border: 2px silver solid;
      cursor: pointer;
      user-select: none;
    }
    .MySelectContainer > .options > slot {
      font-size: 0.9em;
    }
    .unshowOptions {
      display: none;
    }
  </style>
  <div class="MySelectContainer">
    <div class="title">
      <slot name="title">DefaultTitle</slot>
    </div>
    <div class="options unshowOptions" id="options">
      <slot name="option">
        <div>DefaultOption</div>
      </slot>
    </div>
  </div>
</template>

<script>
  customElements.define(
    'my-select',
    class extends HTMLElement {
      connectedCallback() {
        this.shadow = this.attachShadow({ mode: 'open' })
        const temp = document.getElementById('mySelectTemp')
        this.shadow.appendChild(temp.content.cloneNode(true))
        this.shadow.addEventListener(
          'click',
          (e) => {
            if (e.target.slot == 'title') {
              const el = this.shadow.getElementById('options')
              el.classList.toggle('unshowOptions')
            } else if (e.target.slot == 'option') {
              e.target.dispatchEvent(
                // 不需要 composed
                // 因为此事件是向占槽元素触发的（占槽元素处在 LightDom）
                new CustomEvent('select', {
                  detail: e.target.innerHTML,
                  bubbles: true,
                })
              )
            }
          },
          false
        )
      }
    }
  )
</script>

<my-select id="mySelect">
  <div slot="title">Choose a language:</div>
  <div slot="option">JavaScript</div>
  <div slot="option">Bash</div>
  <div slot="option">PHP</div>
  <div slot="option">Python</div>
</my-select>

<script>
  document.getElementById('mySelect').addEventListener('select', (e) => {
    console.log('Cap onSelect', e)
  })
</script>
```

## 模板 template

浏览器直接忽略模板里的任何内容（包括不规范的标签结构、style 样式和 script 代码），或者说，模板里的内容处于不活跃状态，直到将它插入到主文档（简称文档）里。

模板的 content 是 DocumentFragment 对象（轻量版的独立的 document，可以使用 `new window.DocumentFragment()` 或 `window.document.createDocumentFragment()` 创建），它被插入到其他节点时，只会插入它的子元素们，它自己不被插入。

继承关系：DocumentFragment <- Node <- EventTarget <- Object

```html
<!-- template的内容将被浏览器直接忽略（也不会反应到主文档上） -->
<template id="temp11">
  <p>
    <!-- 这种不规范的结构在template里不会被浏览器自动修复 -->
    <div>AABB</div>
  </p>
  <style>
    div {
      /* 样式也不会生效 */
      color: hotpink;
    }
  </style>
  <script>
    // 代码也不会执行
    console.log('Hello!')
  </script>
</template>
```

直到它被插入到主文档里，浏览器才会真正的去查看它的内容：

```js
document.body.appendChild(temp11.content.cloneNode(true))
```

## 数据传递

WebComponents 间的数据传递：

1. 传统特性只能传递字符串，简单但是数据量不能太多（不像目前前端框架，Vue、React，等，特性可以直接传递任意的数据类型）
2. 直接将数据挂载在组件的特性上
3. 采取 CustomEvent 传递
4. 采取 BlobURL 传递

## HMR

适合 WebComponents 组件在 Vite 下的热更新代码。

参见：[hmr.js](./hmr.js)
