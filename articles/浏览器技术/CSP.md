# CSP (Content Security Policy)

> 文档：<https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP/>
> 指南：<https://content-security-policy.com/>
> 标准：<https://www.w3.org/TR/CSP/>

## 概述

CSP 是浏览器提供的一个额外的安全保障，可检查和缓解一些攻击（比如，XXS、CSRF、非法内容注入、点击造假、等等），这些攻击的危害从污染网站、到窃取信息、再到散播恶意软件。

Web 的安全基建是 SameOrigin Policy，CSP 是在此基础上的额外安全保障。

CSP 工作在**白名单**模式下，只有在白名单里的内容才能载入，从根本上杜绝或缓解了恶意代码的攻击。

## 攻击

### XSS

Cross-site scripting (XSS) is a security exploit which allows an attacker to inject into a website malicious client-side code. This code is executed by the victims and lets the attackers bypass access controls and impersonate users.

### CSRF

Cross-Site Request Forgery (CSRF) is an attack that impersonates a trusted user and sends a website unwanted commands.

### Others

And so on.

## 书写

in Server: (Recommendation)

```js
httpServer.global({
  // enableSSL: 1, // HTTPS
  routes: [
    {
      path: '/',
      redirect: '/index.html',
    },
    {
      path: '/index.html',
      file: '@www/mysite/index.html',
    },
    // others
  ],
  addedHeaders: [
    {
      // add the CSP header for all html files
      match: /\.html$/,
      headers: {
        'Content-Security-Policy': 'rules',
      },
    },
  ],
})
```

in Browser: (Alternative, Not Recommendation)

```html
<!-- 做测试时、或目前不能修改 Server 配置时，不然尽可能不要采取此方式定义 CSP -->
<!-- 一些指令不能工作在此模式下：report-to, frame-ancestors, sandbox, ... -->
<meta http-equiv="Content-Security-Policy" content="rules" />

<!-- Report-Only Do Not works too in the meta tag. -->
<meta http-equiv="Content-Security-Policy-Report-Only" content="rules" />
```

The priority of HTTP Header is higher than `<meta>` in the same directives.

## 报告

语法：

```txt
// 限制 + 报告
// report-uri(CSPv1) 是 report-to(CSPv2) 的旧指令（前生），处在移除状态
// 最基础的语法都相同，即直接写一个报告的地址，但是 report-to 还可与其他和安全相关的 Headers 相结合
Content-Security-Policy: <policy> [...]; report-to http://csp-report.mysite.me

或

// 仅报告
Content-Security-Policy-Report-Only: <policy> [...]; report-to http://csp-report.mysite.me
```

任何违反 CSP 的操作都将被报告（格式是 JSON，MIME 是 `application/csp-report`），结构如下：

```ts
type T_ReportMessage = {
  disposition: 'enforce' | 'report' // 处置方式，取决 Content-Security-Policy 或 Content-Security-Policy-Report-Only
  'blocked-uri': string // 被阻止载入的内容的地址 'http://static2.mysite.me/css/global.css'
  'document-uri': string // 文档的地址 'http://www.mysite.me/home.html'
  'effective-directive': string // 违反的指令 'style-src-elem'
  'original-policy': string // CSP 的配置 'style-src static.mysite.me; report-to csp-report.mysite.me'
  'script-sample': string // 违反指令的代码的前 40 个字符，仅 `script-src-*` 和 `style-src-*`，且存在 `script-sample` 指令时
  'status-code': string // 内容的 HTTP 状态码
}
```

## 指令的值（白名单）

### `<host_source>`

Internet host by name or IP address.

The URL's schema (aka protocol), port, and path are optional. The `*` can be used for all parts of URL indicating all the legal values of each are valid.

Upgrades are allowed for the schema (e.g. `http://` also matches `https://` and `ws://` also matches `wss://`).

Other schema: (Not Recommended)

1. `data:` allows `data: URL` to be used as a content source (**unsafe**)
2. `blob:` allows `blob: URL`
3. `filesystem:` allows `filesystem: URL` ([detail](https://developer.mozilla.org/en-US/docs/Web/API/FileSystem))
4. `mediastream` allows `mediastream: URL` ([detail](https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API))

### 关键词

关键词的单引号是必须的，不然会被当作 `<host_source>`。

#### common

下面的 `xxxx` 必须是合法的可读的 ASCII 字符，建议采取 base64 对这些值做处理。

- `'none'` 任何此类内容的都不能载入（即全部禁止），也是一个未写值的指令的回退值（即 `script-src 'none'` === `script-src `）
- `'self'` SameOrigin
- `'unsafe-inline'` 激活内联内容的载入，包括内联的 script、style 和 各类其他可内联的内容
- `'unsafe-hashes'` 限制 `'unsafe-inline'`：哈希值（仅 sha(256|384|512)）相同的内联内容方可载入 `script-src 'unsafe-hashes' 'sha256-xxxx'` --简写--> `script-src 'sha256-xxxx'`
- `'nonce-<xxxx>'` 限制 `'unsafe-inline'`：nonce 代表一个一次性的随便值（由 Server 端生成），只有带相同 `nonce="xxxx"` 特性值的内联内容方可载入 `script-src 'nonce-xxxx'`
- `'report-sample'` 在违规报告里包含一些样本代码

#### script only

- `'unsafe-eval'` 激活文本表示的 JS 代码，主要涉及 `eval` `new Function` `setTimeout` `setInterval`
- `'strict-dynamic'` 限制 `'unsafe-inline'`：受信任代码创建的内联 `<script>`（即 `body.append(scriptNode)`）也受信任

## 指令

### 获取指令 (Fetch Directives)

CSP fetch directives are used in a `Content-Security-Policy` header and control locations from which certain resource types can be loaded. For example, `script-src` allows developers to allow trusted resources of script to execute on a page, while `font-src` controls the resources of web fonts.

All fetch directives fall back to `default-src`. That means, if a fetch directive is absent in the CSP header, the user agent will look for the `default-src` directive.

When a directive is absent (not the directive value is absent), it means there is no restriction on the resources it represents.

Syntax: `directive <source> [...]`

#### default-src (CSPv1)

任何未配置的获取指令的回退值。

#### script-src (CSPv1)

Specifies valid sources for all JavaScript.

#### script-src-elm (CSPv3)

Specifies valid sources for `<script>`.

Fallback: script-src <- default-src

#### script-src-attr (CSPv3)

Specifies valid sources for any attribute contained JavaScript.

For example:

```html
<button id="foo" onclick="clickFn()">Foo</button>
```

Fallback: script-src <- default-src

#### child-src (CSPv2)

Specifies the valid sources for WebWorker and `<iframe>`.

#### worker-src (CSPv3)

Specifies valid sources for all WebWorkers including DedicatedWorker, SharedWorker and ServiceWorker.

Fallback: child-src <- script-src <- default-src

#### style-src (CSPv1)

Specifies valid sources for all stylesheets.

#### style-src-elem (CSPv3)

Specifies valid sources for `<style>` and `<link rel="stylesheet">`.

Fallback: style-src <- default-src

#### style-src-attr (CSPv3)

Specifies valid sources for any attribute contained styles.

For example:

```html
<div id="foo" style="margin: 20px">Foo</div>
<script>
  // And, use JavaScript to set inline style for a element is also influenced by `style-src-attr` policy.
  document.getElementById('foo').setAttribute('style', 'padding: 2px;')
  document.getElementById('foo').style.padding = '2px'
</script>
```

Fallback: style-src <- default-src

#### img-src (CSPv1)

Specifies valid sources for images and favicons.

#### media-src (CSPv1)

Specifies valid sources that can be loaded using `<audio>` and `<video>`.

#### connect-src (CSPv1)

Specifies the URLs that can be loaded using script interfaces.

The interfaces：

- `fetch()`
- `XMLHttpRequest`
- `WebSocket`
- `SourceEvent`
- `navigator.sendBeacon()`
- `<a ping>`

#### frame-src (CSPv1)

Specifies valid sources for `<iframe>`.

#### object-src (CSPv1)

Specifies valid sources for `<object>`, `<embed>`, and `<applet>`.

#### prefetch-src (CSPv3)

Specifies valid sources that can be prefetched or prerendered.

#### font-src (CSPv1)

Specifies valid sources the fonts can load using `@font-face`.

#### manifest-src (CSPv3)

Specifies valid sources the manifest can load.

### 文档指令 (Document Directives)

No default fallback directive. So, a directive that does not specify a value allows anything.

#### base-uri (CSPv2)

Specifies the URLs which can be used in the `<base>`.

#### sandbox (CSPv2)

Enables a sandbox for the current page, which is similar to the `<iframe>` sandbox attribute.

Syntax: `sandbox [<value ...>]`

The values list:

1. `allow-downloads`
2. `allow-downloads-without-user-activation`
3. `allow-forms`
4. `allow-modals`
5. `allow-orientation-lock`
6. `allow-pointer-lock`
7. `allow-popups`
8. `allow-popups-to-escape-sandbox`
9. `allow-presentation`
10. `allow-same-origin`
11. `allow-scripts`
12. `allow-top-navigation`

### 跳转指令 (Navigation Directives)

No default fallback directive. So, a directive that does not specify a value allows anything.

#### form-action (CSPv2)

Specifies valid URLs for `<form action>`.

#### frame-ancestors (CSPv2)

Specifies valid parents that can embed the current page using `<iframe>`.

Setting this directive to `'none'` is similar to `X-Frame-Options: deny` (which is also supported in older browsers).

#### navigate-to (CSPv3)

Specifies valid targets for navigating, such as `<a href>`, `location.herf` and `window.open`.

### 报告指令 (Reporting Directives)

参考 [报告](#报告) 章节。

### 其他指令 (Other Directives)

### 已经移除的指令 (Removed Directives)

## 最佳实践

### 与当前一致

```txt
default-src 'self'
```

## 兼容性

| Browser | CSPv1 with Prefix             | CSPv1 | CSPv2 | CSPv3 |
| ------- | ----------------------------- | ----- | ----- | ----- |
| Chrome  | X-Webkit-CSP 14+              | 25+   | 50+   | 59+   |
| Firefox | X-Content-Security-Policy 4+  | 23+   | 31+   | 58+   |
| Safari  | X-Webkit-CSP 6+               | 7+    | 10+   | 15.4+ |
| Edge    | Never used with Prefix        | 12+   | 15+   | 79+   |
| IE      | X-Content-Security-Policy 10+ | No    | No    | No    |

## 其他安全措施

1. `X-Content-Type-Options: nosniff` 阻止浏览器默认的对 script 和 style 内容的检查从而修正非法的 MIME 值，当指定此值时，如果 script 或 sytle 的 MIME 不是标准的受信任的 MIME 类型，浏览器将拒绝它们的载入
2. `X-Frame-Options: deny | sameorigin` 向浏览器表示，此页面不能被嵌入到 `iframe` 里，或者此页面必须顶级呈现，即 `window === window.top`
