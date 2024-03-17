# 其他 CSS 知识点汇总

## 节点隐藏方法

常规方法：

- `display: none` 此节点参与节点树的构建，但不参与渲染
- `visibility: hidden` 此节点参与渲染的 Layouting 但不参与 Painting，因此它保留在文档里的布局框

hack 方法：

- `opacity: 0` 设置此元素全不模糊 (= transparent)
- `position: fixed; left: -9999px;` 离文档很远的距离
- `transform: scale(0)` 缩放节点到没有大小的状态

当一个带有滚动条的节点被 `display: none` 时再显示回来，滚动条将重置，其他的方法都不会。

## JS 主线程阻塞不影响 CSS 的运作

JS 主线程阻塞（比如，一个很长执行时间的函数）不会造成 CSS 的 animation 和 transition 及 scrollbar 的暂停。这些不由渲染线程绘制而直接在 Painting 时候由显卡绘制。

## 重置值的关键字

- `initial`：默认值，注意不是浏览器内置样式表示的默认值，而是 CSS 标准指定的默认值
- `inherit`：继承父值，对于可继承的属性，这只会强化继承这个含义，对于不可继承的属性，它会强制去继承父值，就好像设置了与父值相同的值
- `unset`：不设置值，对于可继承的属性 = `inherit`，不然 = `initial`
- `revert`：恢复此值，移除任何对此属性设置过的额外样式，直到除了浏览器的内置样式，再也没有任何其他额外的样式修饰此属性

注意，有些浏览器能让用户在一定程度上自定义内置样式（包括，自定义主题、偏好设置、等等），因此 `revert` 也会受到此影响。

### 对于 `inherit`

```html
<style>
  div > span:nth-child(2) {
    /* display 是一个不可继承的属性，但是 inherit 能让你强制让 display 去继承父值 */
    display: inherit; /* 相当设置了 `display: block;` */
  }
</style>
<div>
  <!-- div 里的 span 显示的是独立的三行，由于第二个 span 的 display 是 block -->
  <span>1111</span>
  <span>2222</span>
  <span>3333</span>
</div>
```

### 对于 `initial` 和 `revert`

```css
div {
  display: revert; /* 即 block，浏览器内置样式对 div 的 display 的默认值 */
  display: initial; /* 即 inline，CSS 标准对 display 的默认值 */
}
h1 {
  font-weight: revert; /* 即 bold，浏览器内置样式对 h1 的 font-weight 的默认值 */
  font-weight: initial; /* 即 normal，CSS 标准对 font-weight 的默认值 */
}
```

### 全部重置（关键字 `all`）

A shorthand property for resetting all CSS properties except for `direction`, `unicode-bidi` and `CSS-Custom-Property`.

```css
.foo > .bar {
  /* 可接受的值：initial inherit unset revert */
  all: revert; /* .foo 下的 .bar 元素的所有属性都恢复到未被额外样式修饰过时的样子，省去了一个个写所有被额外样式修饰过的属性的繁琐 */
}
```

### 兼容性

- `initial`：Chrome1、FF19、Safari1.2
- `inherit`：Chrome1、FF1、Safari1
- `unset`：Chrome41、FF27、Safari9.1
- `revert`：Chrome84、FF67、Safari9.1
- `all`：Chrome37、FF27、Safari9.1
