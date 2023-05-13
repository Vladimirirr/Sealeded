# TreeWalker

内置的 DOM 树 walker（或 traveller），方式是 DFS(Depth First Search) 或 BFS(Breath First Search)。

一个节点是否可视只取决它的 `whatToShow` 和 `filter` 配置，而不管它是否被渲染。

兼容性：全部兼容

语法：`document.createTreeWalker(root: Node, whatToShow: number = NodeFiler.SHOW_ALL, filter?: Function): TreeWalker`

其中的 NodeFilter 是一组 magic 数字常量。

## 示例

```html
<div id="test">
  <p>
    <span>AA</span>
    <b>BB</b>
  </p>
  <div>OK<b>KO</b></div>
</div>
<script>
  // create a node walker for the `div#test`
  const walker = document.createTreeWalker(
    document.getElementById('test'),
    NodeFilter.SHOW_ALL
    // {
    //   // 目前只有 acceptNode 方法
    //   acceptNode: (currentNode) => {
    //     // NodeFilter.FILTER_ACCEPT(=1)
    //     // NodeFilter.FILTER_REJECT(=2)
    //     // NodeFilter.FILTER_SKIP(=3)
    //     // 目前 FILTER_REJECT 和 FILTER_SKIP 一样
    //     return currentNode.nodeName.toUpperCase() == "P"
    //       ? NodeFilter.FILTER_ACCEPT
    //       : NodeFilter.FILTER_REJECT;
    //   },
    // }
  )
  // walking
  while (1) {
    const nextNode = walker.nextNode()
    if (nextNode) {
      console.log({ nextNode })
    } else {
      break
    }
  }
</script>
```

## instance properties

- `root: Node`: 根节点
- `whatToShow: number`: 数字掩码，指定需要游经的节点类型，存在的值：
  1. `NodeFilter.SHOW_ALL`: 4294967295 (max value of uint64)
  2. `NodeFilter.SHOW_ELEMENT`: 1
  3. `NodeFilter.SHOW_TEXT`: 4
  4. `NodeFilter.SHOW_COMMENT`: 128
  5. `NodeFilter.SHOW_DOCUMENT`: 256
  6. `NodeFilter.SHOW_DOCUMENT_FRAGMENT	`: 1024
  7. `NodeFilter.SHOW_DOCUMENT_TYPE`: 512
- `filter: Function`: 是否接受此节点的检查器
- `currentNode`: 当前节点

## instance methods

- `firstChild()`: Go to the first child of current.
- `lastChild()`: Go to the last child of current.
- `nextNode()`: Go next.
- `previousNode()`: Go back.
- `nextSibling()`: Go next sibling.
- `previousSibling()`: Go back sibling.
- `parentNode()`: Go to the parent node of current.

备注：

- nextNode 和 previousNode 和 parentNode 是 DFS
- nextSibling 和 previousSibling 和 firstChild 和 lastChild 是 BFS

## NodeIterator

较简单的 TreeWalker。

兼容性：全部兼容

语法：`document.createNodeIterator(root, whatToShow, filter): NodeIterator`

### instance properties

- `root`
- `whatToShow`
- `filter`
- `referenceNode`: current node

### instance methods

- `nextNode`
- `previousNode`

### 一些不同

1. NodeIterator 的 nextNode 方法首次结果是根节点，而 TreeWalker 的直接是它的首个子节点
2. NodeIterator 只能是 DFS
