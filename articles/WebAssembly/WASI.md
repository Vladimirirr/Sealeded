# WASI (WASM System Interface)

此标准指出了 wasm 在操作系统下需要的 API 集合，一个 wasm runtime 必须是合格的 WASI 实现。这就像 UNIX-like 都实现了 POSIX 一样。

WASI gives sandboxed WebAssembly applications access to the operating system by POSIX-like functions.

WASI 是模块化的，包括：

1. FileSystem
2. Network
3. Date
4. Math
5. ...

在 Web 上，你导入的 importObject 可拓展自带的 WASI，例如，将封装了 fetch 的网络请求方法注入到 WASI 上。

## Node.js 举例

地址：<https://nodejs.org/api/wasi.html>
