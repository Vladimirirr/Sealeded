# 被低估的 HTML 标签

> 文章 [Unleash the Power of the Platform with These HTML Tags.](https://www.builder.io/blog/powerful-html-tags) 的中文翻译。（此文是科普文，科普一些不常见的但是很酷的标签）

让我们认识一些被低估的 HTML 标签，释放这些标签蕴含的能量！

## `<dialog>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog>

浏览器内置的对话框（模态框）组件。

它很简单：

```html
<dialog>
  <!-- `<dialog>` 默认处在 `display: none` -->
  <h2>Title</h2>
  <form method="dialog">
    <!-- 表单里的提交按钮将当作此对话框的关闭按钮 -->
    <button type="submit">OK</button>
  </form>
</dialog>

<button id="openDialog">Open</button>
<button id="closeDialog">Close</button>

<script>
  const dialogElm = document.querySelector('dialog')
  const openButtonElm = document.querySelector('button#openDialog')
  const closeButtonElm = document.querySelector('button#closeDialog')

  openButtonElm.addEventListener('click', () => {
    dialogElm.showModal() // show modally
    // dialogElm.show() // show normally
  })
  closeButtonElm.addEventListener('click', () => {
    // We can pass some data into the close method.
    // And we can read the data from the `dialogElm.returnValue` later.
    dialogElm.close(/* data */)
  })
</script>

<style>
  /* 定制对话框的背景 */
  ::backdrop {
    background-color: lightcoral;
    opacity: 0.8;
  }
</style>
```

## `<details>` 和 `<summary>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details>
> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary>

Using `<details>` and `<summary>` allows the creation of collapsible sections of content with a summary that can be clicked to reveal or hide the details.

不需要任何 JavaScript 就能控制内容的显示与否。或 JavaScript 设置 `<summary>` 的 `open` 特性来控制是否显示它的内容 `<details>`。

## `<datalist>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist>

定义表单组件的值列表。

一个 autocomplete 下拉框：

```html
<label for="ice-cream-choice">Choose a flavor: </label>
<input list="ice-cream-flavors" id="ice-cream-choice" name="ice-cream-choice" />

<datalist id="ice-cream-flavors">
  <option value="Chocolate"></option>
  <option value="Coconut"></option>
  <option value="Mint"></option>
  <option value="Strawberry"></option>
  <option value="Vanilla"></option>
</datalist>
```

## `<meter>` 和 `<progress>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meter>
> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/progress>

显示当前状态的指示条。

两者最大的不同：

1. `<progress>` 是单一色
2. `<progress>` 仅能定义两个值 max 和 value，而且 min 始终是 0
3. `<progress>` 唯一一个好处就是，当 value 空时，将显示一个 loading

## `<mark>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/mark>

标记文本，默认黄色。

## `<picture>`

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture>

最被低估的标签，它能对不同设备和它的尺寸提供最合适的图像，极大地提高交互体验。

例子：

```html
<picture>
  <!-- device's min-width >= 1440px -->
  <source srcset="image-large.jpg" media="(min-width: 1440px)" />
  <!-- device's min-width >= 760px -->
  <source srcset="image-medium.jpg" media="(min-width: 760px)" />
  <!-- default, device's min-width < 760px -->
  <source srcset="image-small.jpg" />
  <!-- fallback when the browser does not support the element -->
  <img src="image-default.jpg" alt="image" />
</picture>
```

## 数学公式

> 文档：<https://developer.mozilla.org/en-US/docs/Web/MathML>

MathML is an XML based language for describing mathematical notations.
