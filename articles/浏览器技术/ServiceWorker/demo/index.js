// 当前环境 this = ServiceWorkerGlobalScope

const thisVersion = '20230222.1' // the version of the sw, which created in building stage

oninstall = (e) => {
  // initialize the indexedDB or caches
  // 此时此 sw 可能不能立刻激活（可能其他正在执行旧 sw 的页面还没全部关闭）
  // 可以在这里执行 skipWaiting() 来立刻激活此 sw 而不需要再等待，需要注意的是，只是接下来 open 的页面执行此 sw，老的已经 opened 的页面继续旧的 sw
  // 一个 sw 的 install 只执行一次
  console.log('sw installing', e)
  // install 的准备工作
  const initWorks = async () => {
    {
      // 初始化一个 cache
      // cache 能完整地保存一次请求的 request 和 response 对象
      const cache = await caches.open(thisVersion) // sw 和 cache 的 version 需要始终相同，避免缓存错乱
      // 缓存列出的请求
      // 不要缓存入口文件！（比如 index.html）
      await cache.addAll(['/common.css'])
    }
    {
      // 初始化 indexedDB
      const openReq = indexedDB.open(thisVersion) // same version with the sw
      openReq.onupgradeneeded = (e) => {
        const db = e.target.result
        db.createObjectStore('cached', { keyPath: 'id' })
      }
      // 一个等待 indexedDB 完成的 promise
      const waitPromise = new Promise((resolve, reject) => {
        openReq.onsuccess = resolve
        openReq.onerror = reject
      })
      await waitPromise
    }
  }
  // 让此 sw 保持在 installing，直到准备工作完成
  e.waitUntil(initWorks())
}

onactivate = (e) => {
  // 此 sw 需要做激活前的准备工作（比如，清除旧的缓存）
  // 一个 sw 的 activate 只执行一次
  console.log('sw activating', e)
  e.waitUntil(async () => {
    // do somethng for activating and keep the sw in activating stage
    // 清除旧的缓存
    const allCaches = await caches.keys()
    await Promise.all(
      allCaches.map((name) => {
        if (name != thisVersion) {
          // del all unmatched caches
          return caches.delete(i)
        }
      })
    )
  })
}

// 简单资源的缓存处理（使用 Cache API 来简单粗暴但高效地缓存请求的整个 request 和 response）
const handleCachedResources = async (request) => {
  // 检查
  const cached = await caches.match(request)
  if (cached) return cached

  // 请求
  const response = await fetch(request)

  // 缓存
  const cache = await caches.open(thisVersion)
  // 保存此请求的 request 和 response
  // 注意，clone 是必须的，put 会消耗此 response，而一个已经消耗的 response 不能再被读取了
  await cache.put(request, response.clone())

  return response
}
// 工具方法
const getResponse = (error = '', data = null) => {
  return new Response(
    JSON.stringify({
      code: error ? 500 : 200,
      error: error,
      data,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
// 拦截全部的网络请求 XHR 和 fetch，包括标签的请求（比如：`img.src`）
onfetch = (e) => {
  // e: FetchEvent <- ExtendableEvent <- Event
  console.log('sw: Intercepted a request: ', e)
  // request: Request
  const request = e.request
  // check the request and do something
  if (request.headers.has('Need-Cache')) {
    // 将本次请求的 request 和 response 保存
    e.respondWith(handleCachedResources(request))
  } else if (request.headers.has('Need-Control')) {
    // 直接在 sw 里面处理的请求
    const targetPath = new URL(request.url).pathname
    switch (targetPath) {
      case '/comment':
        e.respondWith(
          request.json().then(async (data) => {
            if (data.content.length < 5) {
              return getResponse('Not enough words.')
            } else {
              const openReq = indexedDB.open(thisVersion)
              const waitPromise = new Promise((resolve) => {
                openReq.onsuccess = (e) => {
                  const db = e.target.result
                  const ta = db.transaction('cached', 'readwrite')
                  const os = ta.objectStore('cached')
                  req = os.put(data)
                  req.onsuccess = resolve
                }
              })
              await waitPromise
              return getResponse('')
            }
          })
        )
        break
      case '/commentList':
        // 从 indexedDB 获取数据，如果存在的话直接返回，否则再请求
        e.respondWith(
          new Promise((resolve) => {
            const openReq = indexedDB.open(thisVersion)
            openReq.onsuccess = (e) => {
              const db = e.target.result
              const ta = db.transaction('cached')
              const os = ta.objectStore('cached')
              const req = os.getAll()
              req.onsuccess = (e) => {
                resolve(getResponse('', e.target.result))
              }
            }
          })
        )
        break
    }
  } else {
    // 其他请求都放行
    console.log(`放行了：${request.url}`)
    e.respondWith(fetch(request))
  }
}

// message channel with its main thread
// onmessage = (e) => {
//   console.log(`The ServiceWorker received a message from host: ${e.data}`)
// }
