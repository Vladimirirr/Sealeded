# Web 安全

Web 安全的基建是浏览器的 SameOrigin 策略。

## SameOrigin 策略

只有 Protocol、Host(a Domain or IP)、Port 都相同的网站（叫做同域，不然叫做跨域），才能相互访问彼此的内容，不然会出现跨域错误。

跨域限制：

- 跨域的不同 window 只能相互读取很有限的一些内容。标准解决方案：postMessage
- 跨域的请求不能被发送或回来时被浏览器拦截。标准解决方案：CORS（它的安全基建是 JavaScript 不能修改 Response Header）

不受 SameOrigin Policy 限制的标签：`<script>` `<link>` `<img>` `<iframe>`，因此在 CORS 提出之前，有各类采取这些标签的奇技淫巧来解决跨域请求的问题，其中 [JSONP](../JSONP.md) 最出名。

### 插件的 SameOrigin

以前的浏览器插件（包括但不限，Flash、JavaApplet、SilverLight）也有自己的 SameOrigin 表达，Flash 举例：

`crossdomain.xml`:（同时要求此文件必须是合法的 XML MIME）

```xml
<cross-domain-policy>
  <domain-access-from domain="*.mysite.me"></domain-access-from>
</cross-domain-policy>
```

目前浏览器插件已经消失殆尽（插件多数有系统级的权限，会大大地影响浏览器的安全性），提出的 HTML5（带各类强化的本地或系统级的功能，比如，摄像头、录音、地理定位、绘图、画中画模式、等等）已经彻底代替插件。

## 安全攻击

1. [XSS](./AttackXSS.md)
2. [CSRF](./AttackCSRF.md)
3. [ClickHijacking](./AttackClickHijacking.md)

## 更强地安全策略

内容白名单（内容安全策略 Content-Security-Policy）：[CSP(Content Security Policty)](./CSP.md)

## 其他

### `<canvas>`

此标签提供内置且强大的绘图技术（包括 2D 和 WebGL 提速的 3D），它能操纵它画布上的每一个像素。但也带来了一些潜在攻击，比如，一些简单的验证码图像能被它破解，而且它是在浏览器上在线破解，都省去了 Server 端的消耗。
