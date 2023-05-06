# DOMParser

Parse from the HTML or XML source code to the HTMLDocument or XMLDocument instance.

Parse HTML is same with setting innerHTML for an Element.

兼容性：全部兼容

语法：`DOMParser.parseFromString(code: string, mime: string): HTMLDocument | XMLDocument`

支持的 mime 列表：

- `text/html`
- `text/xml`
- `application/xml`
- `application/xhtml+xml`
- `image/svg+xml`

其中，仅 `text/html` 将唤起 HTML parser（任何 `<script>` 都标记不活跃），其他的都唤起 XML parser。

## 示例

```js
const parser = new DOMParser()

// HTMLDocument
const htmlString = '<strong>Beware of the leopard</strong>'
const doc1 = parser.parseFromString(htmlString, 'text/html')

// XMLDocument
const xmlString = '<warning>AABB</warning>'
const doc2 = parser.parseFromString(xmlString, 'text/xml')

// XMLDocument
const svgString = '<circle cx="50" cy="50" r="50" />'
const doc3 = parser.parseFromString(svgString, 'image/svg+xml')

console.log(doc1)
console.log(doc2)
console.log(doc3)

// And you can use TreeWalker or NodeIterator to inspect into these documents.
```
