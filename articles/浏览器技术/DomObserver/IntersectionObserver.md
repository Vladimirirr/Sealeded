# DOM IntersectionObserver

单词 intersection: n. 交叉、相交

观察**目标元素**与**它的容器**的可见区域的**相交**（或**交叉**）情况（非同步，但优先级也不低）。

术语：

- 容器元素 = root
- 目标元素 = target
- 相交情况 = 交叉区域的信息 = 交叉值

目标与容器的 border+padding+content 相互参与交叉检测。

目前(2023-03-04)全部的浏览器都完全支持此技术。

## 构造器

签名：`new IntersectionObserver(callback, cfg = {})`

当目标超出阈值时，就会唤起此 callback，它接收两个参数：

1. `entries: IntersectionObserverEntry[]` 交叉值的列表
2. `observer: IntersectionObserver` 此观察者自己

一个 observer 可以同时 observe 多个处在同一个容器里的目标，因此 callback 的第一个参数是一个交叉值的列表。

目标的首次 observe 一定会触发一次 callback，即初始化位置的定位。

### 配置项 -- cfg

1. root: 目标的容器（参与检查的可见区域，得是目标的父元素），默认是当前视窗可见区域
2. rootMargin: 延长容器的外边距（格式与 CSS 的 margin 一样）（也可以是负数），默认 `'0px'`
3. threshold: 触发的阈值，一个 0 到 1 的浮点数，表示相交区域的比例，默认 `0`

#### rootMargin

示例：

```html
<style>
  #con {
    position: relative;
    width: 100px;
    height: 100px;
    background-color: antiquewhite;
  }
  #tar {
    position: absolute;
    left: 140px; /* 慢慢地降低此值，在距离容器外20px的地方将触发callback */
    border: 1px red solid;
  }
</style>
<div id="con">
  <div id="tar">HERE</div>
</div>
<script>
  const ob = new IntersectionObserver(
    ([entry]) => {
      // 在距离容器20px外的地方触发！
      // 在做懒加载的时候，不必等到目标进入容器才触发，可以提前触发！即提前下载数据！
      console.log(entry)
    },
    {
      root: window.con,
      rootMargin: '20px',
    }
  )
  ob.observe(window.tar)
</script>
```

#### threshold

如果是 0，意味着如果【有相交区域】或者【没有相交区域】时**立刻**触发，因此得到的 IntersectionObserverEntry 的 intersectionRect 的 height 或 width 是 1px。此值还可以是一个列表，比如 `[0, 0.25, 0.5, 0.75, 1]`，意味着将在【即将可见】、【25%可见】、【50%可见】、【75%可见】、【完全可见】这 5 个期间触发 callback。

### IntersectionObserverEntry

1. boundingClientRect: 目标的 DOMRectReadOnly
2. **intersectionRatio**: 目标与可见区域的比例
3. intersectionRect: 容器和目标元素的相交区域的 DOMRectReadOnly
4. **isIntersecting**: 表示目标已经在容器内可见（已经超越给定的阈值或阈值列表里的最低值）
5. rootBounds: 容器的 DOMRectReadOnly
6. target: 目标元素
7. time: 从 observe 到触发此值的时间

## 父子关系

目标与容器可以是 子 absolute 父 relative。

特殊的：

目标是 fixed，那么它将相对整个文档可视区域固定定位，此时，要将文档视作 root 传入而非它的父元素。

目标是 sticky，那么它将相对它的最近的可滚动的父元素相对定位（不脱离文档，与 relative 一样），此时 root 也就是它的父元素。

## 方法

### `observe(target: Element)`

观察目标 target 在 root 里的可见情况。可以同时观察多个目标。

### `unobserve(target: Element)`

结束观察一个目标。

### `takeRecords()`

将剩下全部的交叉值拉取（不再触发 callback）。

与 MutationObserver 相同。

### `disconnect()`

停止观察。（与 MutationObserver 一样，IntersectionObserver 也不会干预它依赖的元素的垃圾回收）

## 最佳实践

1. 无限滚动列表（懒加载）
2. 埋点的曝光
3. 滚动到特定区域的动画效果
4. ...

## 示例：一个简单的无限列表

```html
<style>
  #container {
    height: 300px;
    width: 150px;
    overflow: scroll;
  }
  .item {
    padding: 10px;
    background-color: pink;
  }
  .item:nth-child(odd) {
    background-color: hotpink;
  }
</style>
<div id="container">
  <div id="target" data-desc="触底参考标记">loading...</div>
</div>
<script>
  const container = document.getElementById('container')
  const target = document.getElementById('target')

  let currentItemIndex = 1
  const more = (len) => {
    // 模拟网络请求
    return new Promise((resolve) => {
      setTimeout(() => {
        Array(len)
          .fill(0)
          .forEach(() => {
            const el = document.createElement('div')
            el.className = 'item'
            el.innerText = `item: ${currentItemIndex++}`
            container.insertBefore(el, target)
          })
        resolve()
      }, 2 * 1e3)
    })
  }

  const ob = new IntersectionObserver(
    ([entry], thisOb) => {
      // 这里，我们只观察一个，因此我们直接取数组的首个
      if (entry.isIntersecting) {
        // 目标进入了容器，意味着到底了，需要加载更多的数据
        console.log('触底。')
        more(10).then(() => {
          // 这里可以检测首次数据填入到容器里是否填满了
          // 再次使用observe检测
          thisOb.disconnect()
          thisOb.observe(target)
        })
      }
    },
    {
      root: container,
    }
  )
  ob.observe(target) // 首次 observe 时始终会触发一次
</script>
```
