# Permissions

文档：<https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API>

## 概述

检查当前页面被授予或被拒绝的权限。

纵观 Web 发展史，一些较早出现的 API 要么有自己独有的权限处理方式（比如 Notification），要么则没有（比如 Geolocation）。

而 Permissions API 统一了不同 Web API 的权限管理。

可管理的 Web API：（格式：`权限名字：可配置的具体子权限`）

- `Clipboard API`: `clipboard-read`, `clipboard-write`
- `Storage API`: `persistent-storage`
- `Geolocation API`: `geolocation`
- `Notifications API`: `notifications`
- `Sensor API`: `accelerometer`, `gyroscope`, `magnetometer`, `ambient-light-sensor`
- `Media Capture and Streams API`: `microphone`, `camera`
- `Local Font Access API`: `local-fonts`
- `Push API`: `push`
- `Background Synchronization API`: `background-sync`
- `Payment Handler API`: `payment-handler`
- `Web MIDI API`: `midi`
- `Storage Access API`: `storage-access`
- `Window Management API`: `window-management`

## example

```ts
interface I_PermissionDescriptor {
  name: string // The permission name you want to query. Each browser supported values may be different.
  userVisibleOnly? = false // Only for Web Push API
  sysex? = false // Only for Web MIDI API
}
interface I_PermissionStatus extends EventTarget {
  name: string // The name of the requested permission.
  state: 'granted' | 'prompt' | 'denied' // The state of the requested permission.
  onchange: (e: Event) => void // The event handler fires when the state changes.
}
// 查询
const toQuery: I_PermissionDescriptor = { name: 'geolocation' }
navigator.permissions.query(toQuery).then((result: I_PermissionStatus) => {
  if (result.state == 'granted') {
    showLocalNewsWithGeolocation()
  } else if (result.state == 'prompt') {
    showButtonToEnableLocalNews()
  } else {
    // Don't do anything if the permission was denied.
  }
})

// Some unsupported functions.

// 请求一个权限。
// navigator.permissions.request({})

// 请求一组权限。
// navigator.permissions.requestAll([])

// 撤销一个权限，把此权限设置到默认值（通常是 'prompt'）。
// navigator.permissions.revoke({})
```
