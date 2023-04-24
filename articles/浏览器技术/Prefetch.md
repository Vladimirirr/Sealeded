# 预拉取技术

## 概述

现在的前端项目大多都是 SPA(Single Page Application)，且采取组件模块的设计思想，因此都需要打包（构建）工具，比如，Webpack、Parcel、Rollup 和 目前很火的 Vite。

打包的目的就是将多个高内聚的文件整合到一个文件里，减少网络下载的次数，但是如果全部都打包到一个文件里，又将导致这个文件变得巨大（巨石），因此，代码割离(Code Splitting)技术就此提出，每一个打包工具都或多或少地支持此技术：

1. 相同的代码抽离到一个单独的模块里（减少冗余）
2. 懒载入(Code Lazy Loading) 或 按需载入(Loading on Demand)，比如，路由表里的 `component: () => import('/src/pages/About.vue')`
3. 依赖代码抽离到单独的文件里
4. 控制代码块的载入级(Loading Priority)

### 情景复现

小红在首页按下了去购买页面的按钮，而购买页面是一个懒载入的代码块，此时就需要即时下载此代码，导致首次按钮按下需要一段等待时间，表现上就像卡住了一样，当网络不好时此问题更显著，有下面这些方法可缓解此问题：

1. 载入此代码块时，我们放置一个正在载入的效果，缓解客户等待的心理状态，但这治标不治本
2. 浏览器提出的预拉取技术，在浏览器空闲时拉取和缓存需要的代码，以便当真正需要这些代码时，直接从缓存里读取即可

### HTTP 演变简述（题外话，但也与本文相关）

1. HTTP1.0 (1996)：每一次的请求都要建立一个 TCP 连接，因此不能保持该网站的状态（也是 HTTP1.x 的最大特点，因此出现了 Cookies 技术）
2. HTTP1.1 (1997)：引入了较多的缓存策略，同时引入了长连接技术，多个请求能在同一个 TCP 连接下收发（但是不是真正意义上的持久），也不能保持状态
3. HTTP2.0 (2015)：前生是 SPDY，HTTP2.0 相当是它的标准化，真正实现全部的请求都在同一个 TCP 连接下收发，还包括：Header Compressed by HPACK 和 Seerver Push
4. HTTP3.0 (dev)：前生是 QUIC，HTTP3.0 相当是它的标准化，在 HTTP2.0 的基础上，从 TCP 转向 UDP（在 UDP 的基础上，实现了一套专门针对 Web 网络的可靠传输方案，包括快速建立 TCP + SSL）

浏览器（有些网关也会做限制）对同一个域名下的 TCP 总数有限制（差不多 5 个），因此在 HTTP1.x 下，超限的 TCP 就必须入队等待前面的 TCP 释放。

HTTP1.x 的【一次请求即一次 TCP】和【一个域名有限的 TCP 】，因此打包（文件组合，多个零碎的文件组合在一起）是非常有意义的。

HTTP1.1 已经向整个 WWW 贡献了 15 年的消息交换基建，而且至今（2023 年）依旧是各大浏览器和网关（nginx、apache）的默认方案！

从 HTTP2.0 起：

1. 默认都只能跑在 SSL 下
2. 能保持连接的状态（不再需要 Cookies 了）

HTTP2.0 的标准已经敲定，HTTP3.0 的标准已经大差不多了但仍在发展。

## 浏览器的预拉取技术

一共有这些方式：

1. `link:preload` 暗示浏览器此页面必定需要的内容，浏览器将在主文档渲染结束时就立刻去拉取和缓存这些内容
2. `link:modulepreload` 和 preload 相同，只是它指定拉取的文件是 ES 模块，因此，浏览器还将检索模块间的依赖关系图
3. `link:prefetch` 暗示浏览器此页面可能需要的内容，浏览器将在空闲时去拉取和缓存这些内容
4. `link:preconnect` 暗示浏览器空闲时与此地址建立连接，保证通信就绪
5. `link:dns-prefetch` 暗示浏览器空闲时获取此域名的真正地址
6. `link:prerender` 暗示浏览器空闲时渲染此页面

preload 有很高的载入级，如果指定的 preload 内容在主文档渲染结束的一段时间内（5s ~ 10s）未被需要到，浏览器将报告一条警告：

- Chrome: The resource "XXXX" was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate "as" value and it is preloaded intentionally.
- Firefox: The resource at "XXXX" preloaded with link preload was not used within a few seconds. Make sure all attributes of the preload tag are set correctly.

## link 标签

此是一个特性很多且变化灵活的标签，主要目的是将一个外部内容引入到主文档里，该标签的核心特性：

1. `rel`：rel = relationship，表示引入的内容和主文档的关系，此特性常常带着它的其他子特性
2. `herf`：href = hypertext-reference，内容的地址
3. `type`：内容的 MIME
4. `media`：工作在此标签上的媒体查询
5. `integrity`：内容的签名，即 checksum
6. `crossorigin`：CORS 请求的配置：
   1. anonymous（默认值，及任何非法的值的退回值）：不带任何验证信息
   1. use-credentials：带上任何验证（Cookies、证书 或 HTTP Auth）

此标签的 `onload` 和 `onerror` 让你可感知内容的载入情况。

### 重要特性 `rel`

仅列出与本文相关的 `rel` 值：

#### preload

暗示浏览器立刻（高载入级）下载和缓存此内容，有些地方需要此内容！

##### 核心子特性 `as`

向 【设置 Request Content-Type】、【检测 Response Content-Type】、【设置 CSP】、【设置 LoadingPriority】 提供相关的信息：

| Value(Priority) | Applies To                                    |
| --------------- | --------------------------------------------- |
| script          | `<script>` 和 WebWorker 的`importScripts`     |
| worker          | WebWorker                                     |
| fetch           | `XHR` 和 `fetch`                              |
| style           | `<link rel="stylesheet">` 和 CSS 的 `@import` |
| image           | `<img>` `<picture>` 和 CSS 的 `*-image`       |
| audio           | `<audio>`                                     |
| video           | `<video>`                                     |
| track           | `<track>` 的 WebVTT files                     |
| font            | CSS 的 `@font-face`                           |
| embed           | `<embed>`                                     |
| object          | `<object>`                                    |
| document        | `<iframe>`                                    |

备注：

1. 当 XHR、fetch 和 font 默认 CORS 载入

最佳实践：

1. 抽离的重要的代码块
1. CSS 内的 `@import`、`@font-face` 和 `*-image`（比如 `background-image`）
1. JS 将读取的内容，比如 JSON、WebWorkers、子模块
1. 较大的 audios、videos 和 images

##### 其他子特性（非必须） `type`

在 `as` 基础上再指定它精细的 MIME 值。

```html
<link rel="preload" href="myCat.mp4" as="video" type="video/ogm" />
```

#### modulepreload

Same with preload, but more applicable to the ES module scripts.

#### prefetch

Tells to browser these resources will be used in the future, and the browser can download thses in background.

Same with preload, but more applicable to the resources needed in the future.

#### preconnect

Tells to browser should preemptively connect to the target resource's origin by performing part or all of the handshake.

```html
<link rel="preconnect" href="https://email.mysite.com" />
```

#### dns-prefetch

```html
<link rel="dns-prefetch" href="https://static.mysite.me" />
```

#### prerender

```html
<link rel="prerender" href="https://www.mysite.me/login/qrcode" />
```

## 浏览器兼容性 (2023.04.21)

| Supports      | Chrome       | Firefox       | Safari                            |
| ------------- | ------------ | ------------- | --------------------------------- |
| preload       | 50 - 2016.03 | 85 - 2021.01  | 11.1 - 2018.03                    |
| modulepreload | 66 - 2018.04 | No            | No (Can be opened in TP version.) |
| prefetch      | 8 - 2006.12  | 2 - 2006.10   | No (Can be opened in settings.)   |
| preconnect    | 46 - 2015.10 | 39 - 2015.07  | 11.1 - 2018.03                    |
| dns-prefetch  | 4 - 2010.01  | 3.5 - 2009.06 | 5 - 2010.06                       |
| prerender     | 13 - 2011.08 | No            | No                                |

对不支持的特性（仅 preload 和 prefetch），可 polyfill，也很简单，基本就是（以 preload 举例）：

1. 抓取：`document.querySelectorAll('link[rel=preload])`
2. 下载：采取 XHR 或 fetch 下载它们，保存到 Cache 或 indexedDB 甚至 WebStorage 里，注意，要采取不同的 version 从而阻止被客户端持久缓存
3. 拦截：当交互到这些代码时，采取 ServiceWorker 或其他的方式（改写 XHR 或 fetch 的发送方法）拦截这些请求，最终让已缓存的结果响应它们

modulepreload 还将构建此模块的静态依赖图，因此不能被 polyfill，这是语言特性。

## 参考

1. `<link>` 标签：https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link
2. `ref` 特性：https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel
