# DOM MutationObserver

MutationObserver 接口提供了观察一颗 DOM 树变化的能力。它是旧的 Mutation Events 的替代品。

MutationObserver is a **micro-task**.

Provides the ability to watch for changes being made to the DOM tree. It is designed as a replacement for the older Mutation Events feature which was part of the DOM3 Events specification.

目前(2023-03-04)全部的浏览器都完全支持此技术。

## 构造器

签名：`new MutationObserver(callback)`

当树变化时，就会唤起此 callback，它接收两个参数：

1. `mutationList: MutationRecord[]` 一段时间内（本次 EventLoop）的全部变化的描述信息列表
2. `observer: MutationObserver` 此观察者自己

一个节点可以被多个观察者观察。

### MutationRecord

A MutationRecord represents an **individual** DOM mutation. It is the object inside the array passed to the callback of a MutationObserver.

1. `type: ('childList' | 'attribute' | 'characterData')` 变化类型
2. `target: Node` 发生变化的节点
3. `addedNodes: Node[]` 新增的节点们（当 `append(...nodes)` 时）
4. `removedNodes: Node[]` 移除的节点们（目前没有方法像 `append` 一样能批量移除多个节点）
5. `previousSibling: Node | null` 新增或移除的上一个兄弟节点
6. `nextSibling: Node | null` 新增或移除的下一个兄弟节点
7. `attributeName: string | null` 变化了的特性名字
8. `oldValue: type | null` 变化前的值（只有当 attributeOldValue 或 characterDataOldValue 是 true 时），若 type 是 childList 值是 null

#### 备注

CharacterData 是一个抽象接口（意味着没有 CharacterData 类型的对象），它包含一个节点全部的字符信息，我们需要实现此接口的接口（比如 Text、Comment）。

- Text 文本节点 `['Text', 'CharacterData', 'Node', 'EventTarget', 'Object']`
- Comment 注释节点 `['Comment', 'CharacterData', 'Node', 'EventTarget', 'Object']`
- HTMLDivElement 普通元素节点 `['HTMLDivElement', 'HTMLElement', 'Element', 'Node', 'EventTarget', 'Object']`

#### 小结

MutationRecord 使得 MutationObserver 很灵活，它可以处理多个变化，而不需要对每个变化都创建一个单独的事件处理器。

文档：<https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord>

## 方法

### `disconnect()`

停止接收变化通知，直到再次执行 observe 方法。同时释放被观察的 DOM 树（也就是说，观察者不会干涉此节点的垃圾回收，就如同 WeekMap 与 WeekSet 一样）。

已经检测到变化但是尚未报告给观察者的变化信息都将被丢掉。

### `observe(target: Element | Node, cfg = {})`

准备观察一颗树的变化。

参数配置项：（childList、attributes 和 characterData 三者里至少一个是真）

下列配置默认都是 false。

这些参数可以相互重叠。

1. childList：观察目标节点的直接子代节点的变化（新增或移除）
2. subtree：深度观察目标节点的整棵树（与 childList 搭配）
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

我们可以在 disconnect 前拉取一下剩下的还没处理的变化。

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

## 旧的 Mutation Events（存在设计缺陷）

不再推荐！已被移除规范！仅作参考！

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

事件类型繁多且零散，不同浏览器支持程度不尽相同（Safari 没有 DOMAttrModified，Firefox 没有 DOMElementNameChanged 和 DOMAttributeNameChanged）。

而且 MutationEvent 包含的信息很少（仅有）：

- `attrChange`: Indicates what kind of change triggered the DOMAttrModified event. It can be MODIFICATION (1), ADDITION (2) or REMOVAL (3). It has no meaning for other events and is then set to 0.
- `attrName`: Indicates the name of the node affected by the DOMAttrModified event. It has no meaning for other events and is then set to the empty string.
- `newValue`: In DOMAttrModified events, contains the new value of the modified Attr node. In DOMCharacterDataModified events, contains the new value of the modified CharacterData node. In all other cases, returns the empty string.
- `prevValue`: In DOMAttrModified events, contains the previous value of the modified Attr node. In DOMCharacterDataModified events, contains previous value of the modifiedCharacterData node. In all other cases, returns the empty string.
- `relatedNode`: Indicates the node related to the event.

示例：

```js
document
  .getElementById('infoList')
  .addEventListener('DOMSubtreeModified', (e) => {
    // e: MutationEvent <- Event
    console.log(e)
  })
```

## 性能

MutationObserver 与 EventMutation 有着根本的不同:

1. EventMutation 构建在 DOM Event System 的基础上，而每个 Event 都是自主和立刻的（高优先级，且还具有捕获和冒泡两个过程），这意味着，如果一下子有 1000 个节点的变化，将触发 1000 个 Events 在整个文档里穿梭
2. 而 MutationObserver 会在合适的时候（尽快但相对空闲，浏览器将其以 micro-task 的方式实现），对这 1000 个已经变化的内容构建 1000 个 MutationRecord，而这 1000 个 Records 将被整合到一个数组里，接着只触发**一次**callback
3. 当对整个 document 放置 EventMutation Listener 时，整个页面的性能将急剧下降（-150% ~ -700%）
