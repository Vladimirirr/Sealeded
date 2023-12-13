# WebSocket

文档：<https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API>

兼容性：

- Chrome >= 5(2010.05)
- FF >= 7(2011.09)
- Safari >= 5(2010.06)
- IE >= 10(2012.09)
- AndroidWebView >= 4.4(2013.12)

## 概述

Server 与 Browser 间的全双工通信技术。

## API

签名：`new WebSocket(url: string, protocols: Array<string> = []): WebSocket <- EventTarget <- Object`

参数：

1. `url`: The URL to connect
2. `protocols`: Used for sub-protocols

### 方法

#### send

发送信息，将内容推入到发送缓冲区，同时增长 ws.bufferedAmount 的值。如果不能发送（比如，缓冲区已满），将关闭 ws。

签名：`send(data: string | ArrayBuffer | Blob | TypedArray | DataView): void`

在 CONNECTING 时的 send 将报错，在 CLOSING 或 CLOSED 时的 send 将忽略。

#### close

签名：`close(closeCode: number = 1000, closeReason: string = ''): void`

关闭此 ws 的连接或连接请求，关闭会等待正在发送和未发送的信息被发生出去。

对已经 CLOSED 的 ws 再 close() 将忽略（也不会再有 onclose）。

### 事件

也支持 `addEventListener`。

#### `onopen(e: Event)`

ws 已连接时。

#### `onmessage(e: MessageEvent)`

ws 收到信息时。

Event Properties:

- `data: string | ArrayBuffer | Blob`：内容（取决 ws.binaryType 的值）
- `origin: string`：发送者
- `lastEventId`：始终空（在 ws 上没有意义，下同）
- `source`：始终空
- `ports`：始终空

#### `onclose(e: CloseEvent)`

ws 被关闭时。

Event Properties:

- `code: number`：关闭状态码（关闭状态码大全：<https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code>）
- `reason: string`：关闭状态信息
- `wasClean: boolean`：是否已经安全地被关闭

#### `onerror(e: Event)`

ws 发生错误时。（同时导致 ws 的关闭）

The error event is fired when a connection with a WebSocket has been closed due to an error.

### 特性

1. `readyState: 0 | 1 | 2 | 3`：0 = CONNECTING，1 = OPEN，2 = CLOSING，3 = CLOSED
2. `binaryType: 'arrayBuffer' | 'blob' | '' = ''`：指定收到的内容的类型
3. `bufferedAmount: number`：缓冲区里面的内容的长度
4. `url: string`：ws 连接到的 URL
5. `protocol: string`：Server 选择的 sub-protocol
6. `extensions: string`：Server 选择的 extensions
