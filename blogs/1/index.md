# 浏览器与 Server 长连接技术

浏览器和 Server 保持长连接的方法。

## 定时器

最简单，setTimeout、setInterval 或其他定时器定期向 Server 发送请求，此方法优点就是简单，缺点就是不灵活，容易造成大量没有意义的请求。

## 长轮询

浏览器向 Server 发出一个请求，Server 收到请求同时将这个请求挂起，当 Server 需要向浏览器发送内容了，就响应挂起的这个请求，浏览器收到响应再发送一个请求，Server 再把它挂起，如此反复，即实现了最简单的长轮询，不需要任何新的技术。

注意：浏览器对一个域下同时最大的 http 连接数有限制（低于 10 个）

浏览器端代码：

```js
function validHttpStatus() {
  return arguments[0] > 199 && arguments[0] < 300
}
async function longPolling() {
  let response = await fetch('http://localhost:3000/getdata')
  if (!validHttpStatus(response.status)) {
    // 发生了错误，打印一下错误
    console.error(`${response.url}: ${response.statusText}`)
    setTimeout(longPolling, 1e3) // 过一会再试
  } else {
    // 打印出Server返回的内容
    let data = await response.text()
    console.info(data)
    // 立刻再次执行，保持连接一直处于打开状态
    longPolling()
  }
}
longPolling()
```

Server 端代码：

```js
function delay(seconds) {
  return new Promise((ok) => setTimeout(ok, 1e3 * seconds))
}
router.get('/getdata', async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  ctx.set('Content-Type', 'text/plain; charset=utf-8')
  ctx.set('Cache-Control', 'no-store') // 不要缓存
  await delay(Math.floor(Math.random() * 10) + 1) // 模拟Server突然向浏览器响应内容
  ctx.body = 'hi ' + new Date()
  await next()
})
```

## Server Sent Event

文档: <https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface>

只有 IE 不支持。

此技术就是一项持久连接的 http 请求，Server 一直挂起此请求，每当要推送信息时就向此请求写入值。

约束：

1. 只能 Server 向浏览器推送内容，浏览器不能向 Server 发送内容
2. 只能是文本类型

SSE 是可自重连 http 协议，而 websocket 需要我们自己处理重连，简单的单向且内容量不多的情景可以 SSE，没必要上 websocket。

浏览器端代码：

```js
function start() {
  var eventSource = new EventSource('http://localhost:3000/getdata')
  eventSource.onmessage = function (e) {
    // 或addEventListener
    console.log('a new msg here:', e.data)
  }
  eventSource.addEventListener('goodbye', function (e) {
    // 对于自定义事件，不能onxxxx，必须是addEventListener
    console.log('finial message:', e.data)
  })
  setTimeout(() => {
    // 一小时自动关闭
    // 一旦一个EventSource实例被关闭，必须再新建一个，和XHR一样
    eventSource.close()
  }, 1e3 * 60 * 60)
}
start()
```

Server 端代码：

```js
var http = require('http')
var count = 0
http
  .createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.url.includes('getdata')) {
      if (count++ == 2) {
        // 只有2次，不让浏览器继续连接了
        count = 0 // 重置
        res.statusCode = 204 // 规范约定了204是告诉浏览器不要重试了，Server关闭连接了，204状态码本身表示无内容，No-Content
        res.end()
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      let id = setInterval(() => {
        // 每条消息以双LF分隔，每条消息还有event、retry和id字段
        // event: 表示本消息的事件名，浏览器需要对它进行addEventListener
        // retry: 告诉浏览器重试等待事件，单位毫秒，默认3000
        // id：本消息的ID，重试时标识定位
        res.write(`data: hi ${new Date()}\n\n`)
      }, (Math.floor(Math.random() * 2) + 1) * 1e3)
      setTimeout(() => {
        clearInterval(id)
        // 本次消息完成，然后浏览器将尝试自动重连
        res.end(`event: goodbye\ndata: see next time\n\n`)
      }, 1e3 * 4)
    } else {
      res.end()
    }
  })
  .listen(3000)
```

## WebSocket

是浏览器和 Server 全双工的通信，它不是建立在 http 上（直接建立在 tcp 上），而是自己的 ws 协议。

当浏览器请求建立 websocket 连接时，发送的 http 请求有 2 个重要字段：（XHR 或 fetch 不能模拟）

- GET /getdata
- Connection: Upgrade // 表示浏览器需要改变（升级）协议
- Upgrade: websocket // 改变到 websocket

如果 Server 同意：

- 101 Switching Protocols
- Connection: Upgrade
- Upgrade: websocket

方法：

- `socket.send(data: string | ArrayBuffer | Blob): void`
- `socket.close(code?: number = 1005, reason?: string): void`

事件：

- `open`
- `message`
- `error`
- `close`

特性：

- `binaryType: 'blob' | 'arraybuffer'` 设置或查看当前二进制模式
- `binaryType: 'blob' | 'arraybuffer'` 设置或查看当前二进制模式
- `readyState: 0 | 1 | 2 | 3` CONNECTING OPENED CLOSING CLOSED
- `url: string`
- `protocol: string`
- `extension: string`

浏览器端代码：

```js
function start() {
  var id
  let socket = new WebSocket('ws://localhost:3000/getdata') // 注意是ws://
  socket.binaryType = 'arraybuffer' // 默认是'blob'
  socket.onopen = function (e) {
    console.log('opened')
    socket.send('hi') // 发送文本
    // id = setInterval(() => {
    //   socket.send(new Uint8Array([1,2,3,4])); // 发送二进制，可以是ArrayBuffer或Blob
    // }, 2000);
  }
  socket.onmessage = function (e) {
    console.log('a msg here:', e.data)
  }
  socket.onclose = function (e) {
    console.log(`closed, code=${e.code}, reason=${e.reason}`)
    // clearInterval(id);
    // 如果返回的code是1006，表示对方被非正常关闭，比如进程被杀死了，这个状态码是无法通过代码设置的
  }
}
// start();
```

Server 端代码：

```js
const http = require('http')
const ws = require('ws')

const wsinstance = new ws.Server({ noServer: true })

http
  .createServer(function (req, res) {
    // 只接受websocket
    if (
      !req.headers.upgrade ||
      req.headers.upgrade.toLowerCase() != 'websocket'
    ) {
      res.end()
      return
    }
    // Connection: keep-alive, Upgrade
    if (!/upgrade/i.test(req.headers.connection)) {
      res.end()
      return
    }
    // 进行协议升级
    wsinstance.handleUpgrade(
      req,
      req.socket,
      Buffer.allocUnsafe(0),
      function (ws) {
        ws.on('message', function (data) {
          console.log('receive data from browser:', data)
          // ws.send(`now ${new Date}!`); // 发送文本
          ws.send(new Uint8Array([5, 6, 7, 8])) // 发送二进制内容
          setTimeout(() => ws.close(1000, 'Bye!'), 5000)
        })
      }
    )
  })
  .listen(3000)
```

> 2021-04-29
