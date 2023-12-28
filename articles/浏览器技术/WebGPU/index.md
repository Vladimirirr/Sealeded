# WebGPU

文档：<https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API>

## 概述

The WebGPU API enables web developers to **use the underlying system's GPU** to carry out high-performance computations and draw complex images that can be rendered in the browser on HTML tag `canvas`.

**WebGPU is the successor to WebGL**, providing better compatibility with **modern GPU**, support for GPGPU(General Purpose GPU) computations, faster operations, and access to more advanced GPU features.

浏览器只迁移了 OpenGL，没有迁移 OpenCL(Open Computing Library)，因此 WebGL 不具备 GPGPU 功能。

从书写格式上，WebGL(OpenGL) 偏向过程式，而 WebGPU 偏向声明式（更现代、高效和简洁）。

### 与 WebGL(OpenGL-ES) 的关系

两者的关系就像 WebSQL 与 WebIndexedDB（WebSQL 的代替者，更适合浏览器的大存储解决方案），前者（2008 年诞生，试图将 SQLite 引入到浏览器，从而补充浏览器不能存储大量内容的缺陷，但 Firefox 从来没引入过它）已经被淘汰，Chrome 也将从 version.120 起移除（至此不再有任何浏览器支持 WebSQL）。

同样，WebGL 是从 OpenGL-ES(Open Graphics Library for Embedded System) 移至而来。而 OpenGL 是最早一批的 GL（诞生在 1990 年），现在的 GPU 已经发展得很高级了（现代化），OpenGL 最早的设计思想早已不能满足现在 GPU 的工作方式了，因此 OpenGL 的发起组织 Khronos 决定**彻底重构**以升级 OpenGL，重命名叫 Vulkan，因此 Vulkan 也是 OpenGL 的代替者，或者叫 OpenGL3.0。

至于为什么现代浏览器还支持 OpenGL 这一套，是因为浏览器给 OpenGL 和操作系统自带的 GL（Microsoft 上是 DirectX，Apple 上是 Metal）作了一个中间转换件。只不过，随着发展，这种中间件的方式越来越得不到发展，比如 Safari 一直推迟到现在才支持了 OpenGL2.0。

总结：OpenGL(Graphics Library) + OpenCL(Computing Library) + Upgrade(Refactoring) = Vulkan

目前地表最强的三个 GPU 引擎：

1. Micorsoft DirectX: Microsoft's Windows and Playstation and so on
2. Apple Metal: Apple's MacOS and iOS and so on
3. Khronos Vulkan(OpenGL-Next, OpenGL3.0): OpenSource and Used for Android nowadays

## 兼容性

### WebGPU

实验功能。

- Chrome >= 113
- FF (Available in preview version)
- Safari (Not Supports)
- AndroidWebView (Not Supports)

### WebGL

正式功能。

- Chrome >= 9(2011.02)
- Firefox >= 4(2011.03)
- Safari >= 5.1(2011.07)
- AndroidWebView >= 4.4.3(2014.06)
