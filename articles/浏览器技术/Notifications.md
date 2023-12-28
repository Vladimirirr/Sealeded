# Web Notifications

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API>

仅在安全上下文。也存在 Worker 里。

让网页向终端发送系统级的通知消息（不在浏览器内）。

## 授权

此操作需要得到授权。

```html
<button onclick="perm()">Click to allow the desktop notification.</button>
<script>
  const perm = () => {
    const promise = Notification.requestPermission()
    // wait for permission
  }
</script>
```
