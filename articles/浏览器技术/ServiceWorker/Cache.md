# Cache

The Cache interface provides a persistent storage mechanism for request and response object pairs that are cached in long lived memory.

Note that the Cache interface is exposed to GlobalThis and WebWorker. You don't have to use it in conjunction with ServiceWorker, even though it is defined in the ServiceWorker specification.

注意：此接口仅在安全的上下文里

与 indexedDB 相比，Cache 能记录下一次 request 与 response 的全部内容！

能正常处理相同 request 的 URL 但是 header.vary 字段不同的情况，保存多条与它相照 response 的记录。

与 window.indexedDB 对象一样（IDBFactory 接口的浏览器内置实现），window.caches 对象是 CacheStorage 接口的一个浏览器内置实现。

## CacheStorage 方法

1. `open(cacheName: string): Promise<Cache>` 创建（不存在）或得到（已存在）一个 Cache 对象
2. `delete(cacheName: string): Promise<boolean>` 移除一个 Cache 对象
3. `has(cacheName: string): Promise<boolean>` 检测一个 Cache 对象的存在性
4. `keys(): Promise<string[]>` 得到全部的 Cache 对象的名称
5. `match(req: URLString | Request, matchCfg?: Object): Promise<Response | undefined>` 在全部的 Cache 对象里查找符合 request 的记录，这样我们就不必一个一个地 open 全部的 Cache 对象再 match 了

matchCfg:

- `ignoreSearch: false`：是否忽略 URL 的查询参数
- `ignoreMethod: false`：是否忽略请求方法的不同（Cache 只能 GET 和 HEAD 请求方法）
- `ignoreVary: false`：是否忽略 vary 字段
- `cacheName: string`：表示在指定的 Cache 里搜索

文档：<https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage>

## Cache 方法

1. `add(req: URLString | Request): Promise<void>` 根据请求参数获取它的 response，缓存到 cache 里，即 fetch + cache.put
2. `addAll(req: Array<URLString | Request>): Promise<void>` add 的批量方式
3. `put(req: Request, res: Response): Promise<void>` 缓存给定的 request 和 response，仅支持 GET 请求，会覆盖相同 request 的记录
4. `delete(req: URLString | Request, matchCfg?: Object): Promise<boolean>` 移除给定 request 的记录
5. `match(req: URLString | Request, matchCfg?: Object): Promise<Response | undefined>` 查找
6. `matchAll(req: URLString | Request, matchCfg?: Object): Promise<Response[]>` match 的批量方式
7. `keys(): Promise<Request>` 得到全部的记录

matchCfg:

- `ignoreSearch: false`：同上
- `ignoreMethod: false`：同上
- `ignoreVary: false`：同上

备注：

1. 如果 add 得到的 response 的 status 非 200，将拒绝决议，而 put 可以放入非 200 的 response

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Cache>

## 缓存清理

```js
caches.open(`caches_${currentVersion}`)
caches.keys().then((name) => {
  if (isTooOld(name, currentVersion)) {
    caches.delete(name)
  }
})
```

## Header `vary` 与缓存的关系

单词 vary：v. 不同（特征、环境、等等）

示例：

小红操作 IE（旧代浏览器）和 Firefox（现代浏览器）访问同一个目标网站，该网站会根据不同的 UA(UserAgent) 返回不同的结果（IE 的代码可能被转译），以提高访客的浏览体验，同时在 response 设置 `header.set('vary', 'user-agent')`，以告诉下游的缓存代理（如果有的话）在缓存此 response 时还要关注 `user-agent` 字段，不同的此字段的请求需要返回不同的缓存 response。

`vary`的目标是【缓存 Serevr 和 代理 Server】，告诉这些 Server 要如何去缓存一个 response（除了要查看 host 和 path，还要关注 vary 字段）。

因此，不同 `vary` 的相同请求（相同 URL）依旧表示不同的请求。

MDN 文档：

The Vary HTTP response header determines how to match future request headers to decide whether a cached response can be used rather than requesting a fresh one from the origin server.

HTTP 标准：<https://www.rfc-editor.org/rfc/rfc9110.html#name-vary>
