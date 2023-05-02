# Web 安全

Web 安全的基建是浏览器的 SameOrigin 策略。

## SameOrigin 策略

只有 Protocol、Domain、Port 都相同的网站（叫做同域，不然叫做跨域），才能相互访问彼此的内容（浏览器端的不同 window（标准方案：postMessage） 和 与 Server 端的接口（标准方案：CORS）），不然就会出现跨域错误。

## 安全攻击

1. [XSS](./AttackXSS.md)
2. [CSRF](./AttackCSRF.md)
3. [ClickHijacking](./AttackClickHijacking.md)

## 更强地安全策略

即：[CSP(Content Security Policty)](./CSP.md)
