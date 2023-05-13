# DocumentFragment

DocumentFragment 只是存储节点的容器（一个隐藏的文档），有大多数的节点操作方法，对它的操作不会影响到主文档，最终一次性的插入到主文档（高效率）。

Document（主要是 HTMLDocument）是一个网页的入口，即主文档，包括此网页相关的全部信息。

Template 和 DocumentFragment 很像，都是保存节点的容器，但是 Template 侧重节点的静态模板，而 DocumentFragment 侧重处理大量的节点。
