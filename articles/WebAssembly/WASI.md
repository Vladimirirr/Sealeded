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

## Wasmer 与 Docker

### Docker

Docker 是跨时代的，它将 Virtualization Technology 推到了顶峰 —— 容器技术（轻便、可移植、自给自足）。

口号 "Build, Ship and Run Any App, Anywhere"。

但是 Docker 依赖 Linux 内核（一个容器根本上是一个最小化的 Linux 环境），下面的措施实现了容器间的隔离技术：

1. namespaces -> 资料隔离
2. cgroups -> 权限限制
3. 写时复制 -> 高效 IO

在 Windows 下（非 Linux），运行 Docker 需要 [Cygwin](https://www.cygwin.com/) 或 内置的 [WSL(Windows10 and later)](https://learn.microsoft.com/en-us/windows/wsl/) 来模仿 Linux 环境。

### Wasmer

[Wasmer](https://wasmer.io/) 是一个 WebAssembly Runtime，能运行普通的 WebAssembly 模块，也能运行专有的 Wasmer Package。

其中 Wasmer Package 是一项构建在 WebAssembly 上的容器技术，它的 WASI 复现了 POSIX，因此能运行各样的 App。正如 Docker 一样，但它不重依赖 Linux 内核（零依赖），因此能跑在 Web 及各类的嵌入式设备上。

口号 "Run, Publish and Deploy any code, anywhere"。

Wasmer 也有自己的包管理器和平台 —— wapm。

Wasmer Package = Docker Image。

### 总结

WebAssembly 的目的不是取代 Docker，它们根本不是一个东西，只不过恰好 WebAssembly 也可做到类似 Docker 能做的事情，而且不需要依赖 Linux 内核。

就目前而言，Wasmer 不可能也不会去代替 Docker。Docker 在 Server 端举足轻重，很多软件的首要平台都是 Linux（例如，Redis），因此 Docker 是它们的首选（Docker 构建在 Linux 内核之上，自带 Linux 环境）。Wasmer 是轻量级的 Docker，重心在嵌入式上。

Docker 的创造者曾谦言：“如果 2008 年已经存在了 WebAssembly 和 WASI，就没 Docker 什么事了。”
