# MessageChannel

连接两个不同的【浏览上下文】，比如：iframe 的、DWroker 的、等等。

## 示例

直接使用 MessageChannel 代理两个 DWorker 的消息发送，而不需要再走主线程中转了。

```js
// 主线程
const w1 = new Worker('./w1.js')
const w2 = new Worker('./w2.js')
const channel = new MessageChannel()

// channel 的每个 port 需要 start 使其激活从而才能接收数据（onmessage 的 setter 里会自执行一次，而 addEventListener 不会）
// port 的 close 方法将永久关闭此端口（不能再被激活）
// port 有 onmessage 和 onmessageerror（收到的数据不能被反序列化）

// 我们需要把这两个 port 转交给这两个 worker
// postMessage 的第二个参数支持一个 Transferable Objects 数组（以转移或转交一个数据而不是复制），而 channel 的 port1 和 port2 就是此类型
// port 也会填充到 event.ports 中（因此可以不在传输的信息里指定 port）
w1.postMessage(
  {
    type: 'connecting',
    port: channel.port1, // 非必须
  },
  [channel.port1]
)
w2.postMessage(
  {
    type: 'connecting',
    port: channel.port2, // 非必须
  },
  [channel.port2]
)
```
