console.log('i am sharedWorker')

// 保存全部连接到此 SharedWorker 的页面
const allPorts = new Set()

onconnect = (e) => {
  // e: MessageEvent
  // e.target === this(SharedWorkerGlobalScope)
  console.log('[SharedWorkerInternal] onconnect', e)

  // 连接到此的消息管道的端口
  const comingPort = e.source // === e.ports[0]

  // 同样，onmessage 会帮你执行 e.port.start 方法，而不需你自己执行一下
  comingPort.onmessage = (e) => {
    // e: MessageEvent
    console.log(e)
    // 在这里，我们可以处理发来的数据(e.data)，也可以把结果转发给其他的页面
  }
  // comingPort.start() // 不需要了

  // add 到已有列表里
  allPorts.add(comingPort)
}
