# MessageEvent

不同【浏览上下文】间的信息交换格式 MessageEvent(<- Event <- Object)。

The properties of the MessageEvent:

- `data` 承载的信息
- `source` 信息发送者（仅浏览器端存在，Server 端发来的信息此值是 null）
- `origin` 信息发送者的唯一标识
- `ports` MessagePort 数组，表示此信息正在传输特定的信息交换端口
- `lastEventId` 当前信息的唯一标识，SSE 特有（Server 端发送的 id 字段的映射）

【浏览上下文】代表一个独立的 window 环境（一个独立的线程或进程（取决具体实现））：

- 有独立的 JavaScript 引擎（必定存在）
- 有独立的 EventLoop 引擎（必定存在）
- 有独立的 DomRender 引擎（可能存在）
- 其他独立的引擎，比如：Network、Storage、Debugger、等等

不同【浏览上下文】：iframe、window.open、worker、外部环境（非浏览器环境）

【浏览上下文】还存在跨域与同域的场景，即 same-origin。

下面是浏览器领域下的全部 MessageEvent 场景。

## Server Sent Event / Event Source

Server 向 Client 推送信息（仅字符格式）的技术，单向。

此技术就是一项持久连接的 http 请求，Server 一直挂起此请求，每当要推送信息时就向此请求写入值。

限制：浏览器对 http1.0 同一个域的最大同时连接数有限（低于 10 个）

示例：

Client:

```js
const es = new EventSource('/eventsource/test')
/**
 * 核心 request headers
 * accept: text/event-stream
 * cache-control: no-cache
 */
es.onopen = console.info
es.onerror = console.error
es.onmessage = (event) => {
  // event: MessageEvent
  console.log(event)
}

// es.close() // close the event source
```

Server:

```js
const http = require('http')

http
  .createServer((request, response) => {
    const { path, connection } = request

    if (path === '/eventsource/test') {
      response.writeHead(200, {
        ContentType: 'text/event-stream', // the response type here
        CacheControl: 'no-cache', // optional
        Connection: 'keep-alive', // optional
      })

      const interval = setInterval(() => {
        // send a message to client
        // each message separated by double line-break
        const data = new Date().toISOString()
        response.write(`data: ${data}\n\n`)
      }, 1e3)

      connection.addEventListener('close', () => clearInterval(interval))
    }
  })
  .listen(3330, '127.0.0.1')
```

文档：<https://developer.mozilla.org/en-US/docs/Web/API/EventSource>

## Web Sockets

Server 与 Client 全双工信息（字符或字节）交换的技术。

与 SSE 不同，这是一项独立的协议。

它的 onmessage 与 SSE 相同，示例代码略。

文档：<https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API>

## Cross-Origin Document Messaging

跨域【浏览上下文】的信息交换。（同域的可以相互访问彼此的全部信息）

例如：

1. 内嵌的 `iframe`
2. `window.open` 的窗体

语法：`otherWindow.postMessage( message: any, targetOrigin: string, transfer?: Transferable[] )`

- `otherWindow` 其他窗体
- `message` 发送的信息
- `targetOrigin` 接收目标，值 `'*'` 表示不验证接收目标
- `transfer` 转让的内容

targetOrigin 是验证措施，如果目标窗口非同域，我们不能在发送方窗口读取它的 location（隐私策略），因此，我们不能知晓当前窗口中的网站是否是我们的目标网站（使用者随时可以导航，而我们对此不能感知）。

指定 targetOrigin 可以保证目标窗口只在处在目标网站时才可以接收数据。在发送敏感数据时，这很重要。

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage>

## Message Channel

两个不同【浏览上下文】的信息交换方案。

[Cross-Origin Document Messaging](#cross-origin-document-messaging)里的不同窗体间的信息交换就是此技术的浏览器内置实现。

例如：

- 两个 worker
- 两个 iframe
- 一个 worker 与一个 iframe

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API>

## Broadcast Channel

同域下的全部【浏览上下文】的广播形式的信息交换技术。

```js
const bc = new BroadcastChannel('foo') // 如果foo不存在，就建立和入驻此管道，如果foo已经存在，就直接入驻，与Symbol.for方法一样
```

广播（而非单播），因此它的 postMessage 不支持转让内容。

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API>

## Cross WebWorkers

All WebWorkers.

- [DedicatedWorker](../WebWorker/index.md)
- [SharedWorker](../SharedWorker/index.md)
- [ServiceWorker](../ServiceWorker/index.md)
