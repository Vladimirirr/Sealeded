# Chrome DevTools Network Panel

查看网页全部网络请求的地方，其中一些高级功能如下。

## 覆盖请求

### `Override headers`

覆盖（修改）某请求的响应头，但不能移除已存在的响应头（只能对其设置空字符串）。此功能会将覆盖配置文件保存在本地，格式如下：

```json
// 修改 testReq 请求的配置文件的内容
// ~/localhost%3A5500/home/testPage/testReq/.headers
[
  {
    "applyTo": "testReq", // 支持通配符 `*`（零或多个字符）和 `?`（一个字符）
    "headers": [
      {
        "name": "test-header",
        "value": "test1122"
      }
    ]
  }
]
```

### `Override content`

覆盖（修改）某请求的内容体，同样按照 URL 保存在本地。

这能快速地实现前端的 mock 需求。

### `Show all overrides`

查看全部被修改的请求。

## 阻止请求

1. `Block request URL`: 阻止（拦截）某请求，请求不会被发出
2. `Block request domain`: 阻止（拦截）某请求所在域（协议、主机、端口）的全部请求

支持通配符 `*` 和 `?`。
