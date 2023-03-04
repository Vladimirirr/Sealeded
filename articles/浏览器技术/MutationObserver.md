# DOM MutationObserver

MutationObserver 接口提供了观察一颗 DOM 树变化的能力。它是旧的 Mutation Events 的替代品。

Provides the ability to watch for changes being made to the DOM tree. It is designed as a replacement for the older Mutation Events feature which was part of the DOM3 Events specification.

目前(2023-03-04)全部的浏览器都完全支持此技术。

## 构造器

签名：`new MutationObserver(callback)`

当树变化时，就会唤起此 callback，它接收两个参数：

1. `mutationList: MutationRecord[]` 全部变化的描述信息的列表
2. `observer: MutationObserver` 此观察者自己

一个节点可以被多个观察者观察。

### MutationRecord

A MutationRecord represents an individual DOM mutation. It is the object that is passed to MutationObserver's callback.

1. `type: ('childList', 'attribute' | 'characterData')` 变化类型
2. `target: Node` 触发的节点
3. `addedNodes: Node[]` 新增的节点们
4. `removedNodes: Node[]` 移除的节点们
5. `previousSibling: Node` 新增或移除的上一个兄弟节点
6. `nextSibling: Node` 新增或移除的下一个兄弟节点
7. `attributeName: string` 变化了的特性名字
8. `oldValue: any` 变化前的值（只有当 attributeOldValue 或 characterDataOldValue 是 true 时）

## 方法

### `disconnect()`

暂停接收变化通知，直到再次执行 observe 方法。同时释放被观察的 DOM 树（也就是说，观察者不会干涉此节点的垃圾回收，就如同 WeekMap 与 WeekSet 一样）。

已经检测到变化但是尚未报告给观察者的变化信息都将被丢掉。

### `observe(target: Element | Node, cfg = {})`

准备观察一颗树的变化。

参数配置项：（childList、attributes 和 characterData 三者里至少一个是真）

下列配置默认都是 false。

这些参数可以相互重叠。

1. subtree：观察目标节点的整棵树（深度观察）
2. childList：观察目标节点的直接子代节点的变化（新增或移除）
3. attributes：观察目标节点的特性的变化
4. attributeFilter：观察的特性的白名单（此值 true 那么 attributes 默认 true）
5. attributeOldValue：保存特性的变化前的值（此值 true 那么 attributes 默认 true）
6. characterData：观察目标节点上的文本内容
7. characterDataOldValue：保存文本内容的变化前的值（此值 true 那么 characterData 默认 true）

错误的配置项将会报错：

1. 配置项其实没有观察任何内容
2. attributes 是 false，但是 attributeOldValue 和或 attributeFilter 是 true
3. characterData 是 false，但是 characterDataOldValue 是 true

### `takeRecords()`

除了被动地接收变化的通知，还可以主动拉取全部的但还没通知观察者的变化信息，即 takeRecords 方法。注意，主动的拉取不会再触发 callback。

我们可以在 disconnect 前拉取一下剩下的变化。

## 示例

```js
const callback = (mutationList, observer) => {
  console.log(
    mutationList.map((i) => i.type),
    observer === ob
  )
}
const ob = new MutationObserver(callback)
ob.observe(document.getElementById('infoList'), {
  // 常见配置
  childList: true,
  subtree: true,
  attributes: true,
})
```

## 最佳实践

1. 查看 MutionRecord 信息，你甚至可以撤回节点的更改（即撤销操作），与 contentEditable 特性配合实现文本编辑器
2. 监视页面上任何内容的变化，及时做出反应，比如引入第三方广告时，不想让第三方的广告肆无忌惮地破坏我们的页面布局

## 旧的 Mutation Events

不再推荐！已被移除规范！仅作参考！

示例：

```js
document
  .getElementById('infoList')
  .addEventListener('DOMSubtreeModified', (e) => {
    // e: MutationEvent <- Event
    console.log(e)
  })
```

全部支持的类型：

1. DOMAttrModified
2. DOMAttributeNameChanged
3. DOMCharacterDataModified
4. DOMElementNameChanged
5. DOMNodeInserted
6. DOMNodeRemoved
7. DOMNodeInsertedIntoDocument
8. DOMNodeRemovedFromDocument
9. DOMSubtreeModified

跨浏览器：事件类型过于繁多和零散，不同浏览器支持程度不尽相同

性能：

1. 每个节点内容的变化都会触发一个事件，又 DOM Event 的优先级较高（还具有捕获和冒泡两个阶段），一下子较多的变化会触发大量的事件，而 MutationObserver 会收集一段时间里的全部变化，再在空闲时一起汇报给它的观察器
2. 浏览器以事件形式实现 DOM 树变化的观察会影响浏览器自己的性能
