# Snabbdom 基本思想

## 工作方式

只是简单描述一下 snabbdom 的基本思想，而不是细致的分析。

### 主要函数的原型

1. `patch(oldVNode | Element, newVNode)`: 对 oldVNode 参照 newVNode 执行 patch，使得 oldVNode 最终与 newVNode 相同
2. `createElm(VNode, insertedVnodeQueue)`: 根据 VNode 创建对应的 dom，挂载在 VNode.elm，**每次的 createElm 只创建传入的 VNode 本身对应的 dom**，对于 VNode 的子节点，将继续执行 createElm 进行递归创建
3. `patchVNode(oldVNode, newVNode, insertedVnodeQueue)`: 真正 patch 新旧 VNode 的函数
4. `updateChildren(newVNode.elm, oldVNodeChildren, newVNodeChildren, insertedVnodeQueue)`: patch 新旧 VNode 的子节点

### 首次 patch

1. 首次 patch 时，传入的 oldVNode 是目标 dom 元素，即`patch(targetElm: HTMLElement, VNode)`，它被替换成对应的 VNode`{ sel: getSel(oldVNode), data: {}, children: [], elm: oldVNode, key: undefined, text: undefined }`
2. 比较新旧 VNode 是否为相同的节点类型，即`isSameNode(oldVNode, newVNode) => isSameKey && isSameIs && isSameSel`
3. 如果相同，进入`patchVNode(oldVNode, newVNode)`
   1. 参见`重新 patch`的`patchVNode`方法
4. 如果不同，按照 newVNode 创建对应的 dom 元素，挂载在`newVNode.elm`上
   1. 保存原始目标元素`oldVNode.elm`为`targetElm`，并得到它的父元素`parentElm`
   2. 进入`createElm(newVNode)`，对着 newVNode 创建对应的 dom
   3. `newVNode.elm = document.createElement(newVNode.tag)` 根据 newVNode 的 sel 创建对应的 dom 元素，即`document.createElement(sel)`
   4. `create.forEach((fn) => fn(emptyVNode, newVNode))` 使用工具函数集 create，以空 VNode 作为参照物，按照 newVNode 来创建 newVNode.elm 的属性（比如：className、attributes、style、eventListeners、等等，下同）
   5. `newVNode.children.forEach((childVNode) => VNode.elm.appendChild(createElm(childVNode)))` 对它的子节点再执行 createElm
   6. `return newVNode.elm` 最终返回创建完成的 dom 元素
   7. 替换目标元素`parentElm.replaceChild(targetElm, newVNode.elm)`

注释：

1. getSel 函数将得到 targetElm 的 tagName、className 和 id，将它们组合成对应的 CSS 选择器
2. emptyVNode 即`{ sel: '', data: {}, children: [], elm: undefined, key: undefined, text: undefined }`
3. `const patch = init([classModule, propsModule, attributesModule, datasetModule, styleModule, eventListenersModule])` 对应的 create 函数集就是 `[updateClass, updateProps, updateAttrs, updateDataset, updateStyle, updateEventListeners]`

### 重新 patch

1. `patch(oldVNode, newVNode)` 对新旧 VNode 进行 patch
2. `patchVNode(oldVNode, newVNode)` 比较新旧 VNode，将不同的地方更新，最终使得新旧 VNode 相同，这个过程就叫做 patch
3. `newVNode.elm = oldVNode.elm` 把当前待更新的 dom 赋值给 newVNode，接下来按照 newVNode 来对此 elm 进行更新
4. `update.forEach((fn) => fn(oldVNode, newVNode))` 使用工具函数集 `update`，按照新旧 VNode 的差异来更新 newVNode.elm，**只更新此 elm 元素本身的属性，不更新它的子元素**
5. `updateChilren(parentElm = newVNode.elm, oldVNode.children, newVNode.children)` 处理它们的子节点，对需要比较的子节点继续执行 patchVNode
6. patchVNode 函数无返回值
7. patch 函数返回更新完成的 newVNode

注释：

1. 工具函数集 update 和 create 相同

## hooks

hook 函数不需要返回值

### 对于单个 VNode 节点

```JavaScript
init(VNode){
  // 在 VNode 首次创建它的 dom 时，即在 createElm 函数的最开始被调用
}
create(emptyVNode, newVNode){
  // 在 VNode 首次创建它的 dom 时，即在 createElm 函数已经创建完了此 VNode 的 dom 后被立刻调用
}
insert(VNode){
  // 在 VNode 首次被插入到它的父 dom 或 targetElm 时，它在 patch 函数的末尾被调用
  // 在调用一次 patch 函数时，会初始化一个 insertedVnodeQueue 数组，在 createElm 函数中会把带有 hook.insert 的 VNode push 进去，在 patch 函数的末尾会对 insertedVnodeQueue 里面的 VNode 依次执行它们的 insert 钩子
}
prepatch(oldVNode, newVNode){
  // 首次挂载不会触发此方法
  // 在 patchVnode 函数的最开始被调用，此时的 newVNode.elm 还没有被 oldVNode.elm 赋值
}
update(oldVNode, newVNode){
  // 首次挂载不触发
  // 在 patchVnode 函数的 update 更新函数集完成后被立刻调用
}
postpatch(oldVNode, newVNode){
  // 首次挂载不触发
  // 在 patchVnode 函数的末尾被调用，此时 newVNode.elm 已经最新
}
destroy(VNode){
  // 节点从 dom 中被直接或间接移除（由于父节点被移除了导致它的子节点也被移除）
  // styleModule 模块默认内置一个 applyDestroyStyle 的 destroy 钩子
  // 执行此钩子时对应的节点还没从 dom 中被移除，在这里可以对即将被移除的节点设置移除时的 style 样式，将由 applyDestroyStyle 函数应用设置的样式
}
remove(VNode, remove){
  // 节点从 dom 中被移除
  // 在移除节点前，将先执行它和它子组件的 destroy 钩子
  // 此钩子需要执行 remove 函数，将此节点从 dom 移除，因此可以控制节点被移除的时机或在移除前执行一些操作
  // styleModule 模块默认内置一个 applyRemoveStyle 的 remove 钩子
  // 只有在此节点的全部 remove 钩子都执行了 remove 函数，才会将其从 dom 移除，全部的 remove 钩子 = 来自全部模块的 remove 钩子们 + 节点自身的 remove 钩子，所以源码里 removeVnodes 函数的 `listeners = cbs.remove.length + 1;` 与 createRmCb 函数返回的函数的 `if (--listeners === 0) doRemoveNode` 相互对应，每次执行 remove 函数使得 listeners - 1，当 listeners 为 0 时才真正执行移除
}
```
