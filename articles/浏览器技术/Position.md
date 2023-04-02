# 坐标

## 常见的元素定位信息

### 注意

- `display: none` 导致它们的值都显示 0（它们未渲染，因此也得不到值）
- 这些得到的值都将被四舍五入到整数，需要精细的定位信息，请采取 `el.getBoundingClientRect()` 方法

### offsetWidth/offsetHeight/offsetLeft/offsetTop/offsetParent

offsetParent 指向距离此元素最短的父级定位元素或 table、td、th、body 元素，如果此元素的 display 不可见，得到的是 null。

offsetWidth 和 offsetHeight 即 border-box 时的 width 和 height。

offsetTop 表示此元素 outer-border（也要带上存在的 margin）到 offsetParent 的 inner-border 的垂直距离。这是一个绝对值，不受 offsetParent 滚动条位置的影响。

offsetLeft 同理。

它们共同描述了此元素相对 offsetParent 的定位框。

### clientWidth/clientHeight/clientLeft/clientTop

clientWidth 和 clientHeight 即 content-box 时的 width 和 height。

clientHeight 表示此元素的**内部**高度，包含自己的 padding，但不包括 border 和 margin 及水平滚动条的高度（如果存在的话）。对内联元素始终显示 0。

clientWidth 同理。

clientTop 表示此元素的 border-top-width。

clientLeft 同理。

### scrollWidth/scrollHeight/scrollLeft/scrollTop

scrollTop 表示此元素的垂直滚动条已经向上滚动的距离，如果元素不可滚动（overflow 是 hidden 或 visible），它的值将始终是 0。

scrollLeft 同理。

scrollHeight 表示此元素的**全部**高度，包括溢出而导致的不可见内容（包括 `::before` 和 `::after`），此值与【在没有滚动条的情况下去适应元素全部内容需要的最小高度】的值相同，包括自己的 padding，但不包括 border 和 margin 及 水平滚动条的高度（如果存在的话）。如果此元素里的内容不需要垂直滚动条就可容纳，它的 scrollHeight 与 clientHeight 相同。

scrollWidth 同理。

### 实践

检查元素是否触底：

```js
const threshold = 10 // 假设阈值是10px
Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < threshold // 触底
```

## 滚动长度

- window.scrollX
- window.scrollY

## getBoundingClientRect

返回一个元素相对当前可视区域的绝对坐标信息。长宽包括 padding 和 border。

1. top
2. left
3. height
4. width
5. bottom = top + height
6. right = left + width
7. y = top
8. x = left
