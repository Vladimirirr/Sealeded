# Clipboard

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Clipboard>

读写系统的剪切板。

## 概述

`navigator.clipboard` 实现了 `Clipboard (<- EventTarget <- Object)` 接口。

## 权限

读写需要被授权，且此页面需要处于或刚刚处于交互状态。

### 检查权限

```js
const canClipboardRead = await navigator.permissions.query({
  name: 'clipboard-read',
})
if (canClipboardRead == 'denied') {
  alert('Can not read from the clipboard without permission.')
  return
}
```

## API

### read

返回剪切板的内容（任意类型）。

签名：`read(): Promise<ClipboardItem[] | PermissionError>`

### readText

返回剪切板的文本内容。

签名：`readText(): Promise<string | PermissionError>`

返回空字符串的情况：

1. 剪切板没有任何内容
2. 剪切板没有文本形式的内容

### write

向剪切板写入的内容（任意类型）。

签名：`write(data: ClipboardItem[]): Promise<void | PermissionError>`

### writeText

向剪切板写入文本内容。

签名：`writeText(text: string): Promise<void | PermissionError>`

### ClipboardItem

读写剪切板时的单项内容，此接口封装和抹平了不同操作系统各自的剪切板接口的内容交换格式。

签名：`new ClipboardItem({ mimeType: string, data: Blob | string | Promise<Blob | string> }, { presentationStyle: string })`

#### 特性

- `types: string[]`：当前项目内的全部内容的 mime 值
- `presentationStyle: 'unspecified' | 'inline' | 'attachment'`：如何展现当前项目的内容

#### 方法

- `getType(mime: string): Promise<Blob | Error>`：得到此 mime 类型对应的内容

### 其中“任意类型的内容”的具体内容

目前支持的：

- `image/png`
- `text/html`

### 代码示例

```js
const clipboard = window.navigator.clipboard

const clipboardUtils = {
  /**
   * Read arbitrary data from clipboard.
   */
  read: async () => {
    const clipboardItems: ClipboardItem[] = await clipboard.read()
    const clipboardResult: Blob[][] = []
    for (const item of clipboardItems) {
      const itemResult: Blob[] = []
      clipboardResult.push(itemResult)
      for (const type of item.types) {
        const blob: Blob = await item.getType(type)
        itemResult.push(blob)
      }
    }
    return clipboardResult
  },
  /**
   * Write arbitrary data into clipboard.
   * @param {string} value.type - mime type for the value
   * @param {string | Blob} value.data - the value
   */
  write: async (
    data: { type: string, value: string | Blob }[]
  ): Promise<void> => {
    const clipboardItem = new ClipboardItem(
      data.reduce((a, c) => ((a[c.type] = c.value), a), {})
    )
    // Support for multiple ClipboardItems is still not implemented at 2023-12.
    return await clipboard.write([clipboardItem])
  },
  /**
   * Read text data from clipboard.
   */
  readText: (): Promise<string> => clipboard.readText(),
  /**
   * Write text data from clipboard.
   */
  writeText: (v: string): Promise<void> => clipboard.writeText(v),
}
```

## 与剪切板相关的事件

### oncopy

### oncut

### onpaste

### ClipboardEvent

Instance Property:

- `clipboardData`：一个 DataTransfer 对象
