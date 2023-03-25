# Resize Observer

The Resize Observer API provides a performant mechanism by which code can monitor an element for changes to its size, with notifications being delivered to the observer each time the size changes.

观察元素大小变化的观察者，以前我们只能采取笨重的方法来实现：

1. 定时轮询
2. window.onresize 时查看需要的元素们的尺寸大小
3. window.matchMedia 方法，此方法立刻执行一次媒体查询以检查是否符合规则

与其他观察者（比如，MutationObserver、IntersectionObserver）语法基本相同：

全部浏览器兼容。

## ResizeObserver

语法：`new ResizeObserver(callback: (entries: ResizeObserverEntry[]) => any)`

### methods

- `observe(target: Element, cfg?: T_ObserveCfg): void`：可以同时观察多个目标，因此 callback 的参数 entries 是一个数组
- `unobserve(target: Element): void`
- `disconnect(): void`

类型定义：

```ts
type T_ObserveCfg = {
  box: 'content-box' | 'border-box' | 'device-pixel-content-box' = 'content-box'
}
```

## ResizeObserverEntry

描述变化的单元。

### properties

- `borderBoxSize: ResizeObserverSize`: An object containing the new border box size of the observed element when the callback is run
- `contentBoxSize: ResizeObserverSize`: An object containing the new content box size of the observed element when the callback is run
- `devicePixelContentBoxSize: ResizeObserverSize`: An object containing the new content box size in device pixels of the observed element when the callback is run
- `contentRect: DOMRectReadOnly`: A DOMRectReadOnly object containing the new size of the observed element when the callback is run
- `target: Element`: A reference to the Element being observed

#### ResizeObserverSize

- blockSize: 在块方向上的长度（高）
- inlineSize: 在内联方向上的长度（宽）

## 示例

```html
<div id="messageInput" contenteditable>
  <p>Type here...</p>
  <p><br /></p>
</div>

<script>
  const ob = new ResizeObserver((entries) => {
    console.log(entries)
  })

  ob.observe(document.getElementById('messageInput')) // 每一次的observe都会立刻触发一次callback (initial trigger)
</script>
```
