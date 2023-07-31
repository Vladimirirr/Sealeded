# Broadcast Channel

不同浏览上下文（但需要 same-origin）之间的广播技术。

浏览上下文：在浏览器里能运行代码的独立环境，比如，一个 窗口、标签、iframe、worker

```js
const bc = new BroadcastChannel('channel_01') // 如果不存在此频道则创建（标识符 bc.name），否则就进入，类似 Symbol.for
bc.postMessage({ value: 'hello' }) // 广播信息，自己不会接收到自己广播的信息
bc.onmessage = console.log // 接收信息
bc.onmessageerror = console.error // 接收到不能正常读取的信息
// bc.close() // 退出频道
```

与 SharedWorker 相比，它只关注消息的传递。

兼容性：Chrome > 54, FF > 38, Safari > 15.4, AndroidWebView > 54
