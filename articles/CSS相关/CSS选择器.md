# CSS 选择器

## 简单选择器

根据类名、id 名、标签名来选择元素。

## 组合选择器（选择器操作符）

组合多个选择器从而创建一个复杂选择器，其实就是选择器操作符。

### 子代选择器 `<space>`

选择指定元素的全部子元素。

### 直接子代选择器 `>`

选择指定元素的一级子元素（直接子代）。

### 相邻选择器 `+`

选择**紧随**指定元素的**下一个**同级元素。

### 同代选择器 `~`

选择指定元素**下面的**全部同级元素。

## 特殊选择器

### 全部选择器 `*`

选择一个范围下的全部元素。

```css
.header > * {
  /* .header 下全部的直接子代的样式如下 */
  padding: 2px;
}
```

### 选择器列表 `,`

连接多个选择器从而构成一个选择器列表。

```css
.header,
.footer {
  /* .header 和 .footer 的样式如下 */
  font-size: 20px;
}
```

## 特性选择器

### `[attr]`

带 attr 特性名（值任意）的。

```html
<p attr="any">sth</p>
<p attr>sth</p>
```

### `[attr="value"]`

特性值与给定值相同（全包含）的。

```html
<style>
  [btntype='center_controller_close_btn'] {
    border: 1px red solid;
  }
</style>
<button btntype="center_controller_close_btn">click</button>
```

### `[attr~="value"]`

特性值（列表格式，空格相隔）包含给定值的。

```html
<style>
  [color='red'] {
    padding: 2px;
  }
</style>
<p color="red green yellow">sth</p>
<p color="red">sth</p>
```

### `[attr|="value"]`

相当：`/^(value-.+|value)$/`

```html
<style>
  [lang='en'] {
    padding: 2px;
  }
</style>
<p lang="en-US">sth</p>
<p lang="en">sth</p>
```

### `[attr^="value"]`

相当：`/^value/`

### `[attr$="value"]`

相当：`/value$/`

### `[attr*="value"]`

相当：`/value/`

## 伪类

选择器的修饰符，修饰一些特定的状态及相关的信息（这些信息不能或很难以复杂选择器表现出来）。

### 状态

- `:hover`：光标悬停的
- `:focus`：获得焦点的
- `:focus-visible`：获得焦点的，且浏览器认为需要重点突出显示的（零障碍模式）
- `:focus-within`：它或它的子代获得焦点的
- `:active`：正在活跃的
- `:fullscreen`：处在全荧幕状态的
- `:link`：仅 `<a>`，未访问的超链接
- `:visited`：仅 `<a>`，已访问的超链接
- `:lang(langCode)`：特定语言的，即选择带 `lang="langCode"` 特性值的
- `:target`：当前活跃的锚标记
- `:defined`：已定义的
- `:indeterminate`：中间态的，比如 `<input type="checkbox">` 的 indeterminate 值，`<input type="radio">` 整组都未选中时，没有值的 `<progress>`
- `:modal`：处在模态状态的（模态意味着除了此内容，其余的内容都处在不可交互状态，最经典的就是 alert 弹窗），比如 `<dialog>` 的 showModal 方式
- `:paused`：处在暂停状态的，比如 `<audio>` `<video>`
- `:playing`：处在暂停状态的，比如 `<audio>` `<video>`
- `:picture-in-picture`：处在画中画模式的
- `:placeholder-shown`：仅 `<input>` `<textarea>`，其 placeholder text 存在时的

### 位置

主要方法：

其中的 n ∈ 自然数。

- `:nth-child(n)`：找到它修饰的元素的全部同级的同代元素，选择其中的第 n 个元素（类型必须一致，否则匹配失败）
- `:nth-last-child(n)`：同上，只不过 n 倒数选择
- `:nth-of-type(n)`：找到它修饰的元素的全部同级同类型的同代元素（已过滤非同类型），选择其中的第 n 个元素
- `:nth-last-of-type(n)`：同上，只不过 n 倒数选择

快捷方法：

- `:first-child` === `:nth-child(1)`
- `:last-child` === `:nth-last-child(1)`
- `:first-of-type` === `:nth-of-type(1)`
- `:last-of-type` === `:nth-last-of-type(1)`

其他：

- `:empty`：没有子代的
- `:only-chid`：选择仅存在一个子元素的
- `:only-of-chid`：选择仅存在一个子元素且同类型的
- `:root` 主文档的根，即 `<html>`
- `:host` Shadow 文档的根，即它的宿主

### 表单

- `:required`：仅 `<input>` `<select>` `<textarea>`，选择必填的
- `:optional`：相反

- `:disabled`：仅 `<input>` `<select>` `<textarea>`，选择不可交互的
- `:enabled`：相反

- `:read-only`：仅 `<input>` `<textarea>`，选择只读的
- `:read-write`：相反

- `:out-of-range`：仅存在 max 和 min 特性的 `<input>`，选择超出范围的
- `:in-range`：相反

- `:valid`：仅 `<input>`，选择值符合格式的
- `:invalid`：相反

- `:checked`：仅 `<input type="checkbox">` `<input type="radio">` `<select>`，选择被选中的
- `:unchecked`：相反

### 函数

- `:has(selector)`：选择存在给定子代的
- `:is(...selectors)`：列表选择器的简写，它的优先级取决列表里最高的
- `:where(...selectors)`：与 `:is()` 相同，只是它的优先级始终是 0
- `:not(...selectors)`：不能被 selector 匹配的子元素

## 伪元素

补充选择器选中元素的内容，这些补充内容不在 DOM 树里，但是目前浏览器的 DevTools 的 Element 面板都能可视化的观察到这些补充内容。

### `::after`

在指定的元素末插入内容。

### `::before`

在指定的元素前插入内容。

### `::first-letter`

选择指定元素的首字母。

看上去好像首字母本来就已经存在了，其实是给首字母创造了一个独立的元素框，对这个框实施样式。

### `::first-line`

选择指定元素的首行。（仅存在换行的元素）

给首行创造一个的样式框。

### `::selection`

选择当前光标选中的内容。

给选中的内容创造一个的样式框。

### `::marker`

列表项（即`<li>`和`<summary>`）的标记符号的样式。

### `::backdrop`

全荧幕时的荧幕背景。

### `::file-selector-button`

The upload button in `<input type="file">`.

### `::placeholder`

The placeholder text in an `<input>` or `<textarea>` element.

### `::part()`

Represents any element within a shadow tree that has a matching part attribute.

### `::slotted()`

Represents any element that has been placed into a slot inside an HTML template.
