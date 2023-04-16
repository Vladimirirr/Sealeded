# 其他 CSS 知识点汇总

## 节点隐藏方法

常规方法：

- `display: none` 此节点参与节点树的构建，但不参与渲染
- `visibility: hidden` 此节点参与渲染的 Layouting 但不参与 Painting，因此它保留在文档里的布局框

hack 方法：

- `opacity: 0` 设置此元素全模糊（表现上即全透明）
- `position: fixed; left: -9999px;` 离文档很远的距离
- `transform: scale(0)` 缩放节点到没有大小的状态

当一个带有滚动条的节点被 `display: none` 时再显示回来，滚动条将重置，其他的方法都不会。

## JS 主线程阻塞不影响 CSS 的运作

JS 主线程阻塞（比如，一个很长执行时间的函数）不会造成 CSS 的 animation 和 transition 及 scrollbar 的暂停。这些不由渲染线程绘制而直接在 Painting 时候由显卡绘制。
