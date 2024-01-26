# FileSystem

文档：<https://developer.mozilla.org/en-US/docs/Web/API/File_System_API>

此 API 赋能了浏览器读取当前设备的文件系统里的文件，包含了各种基本的 FileSystem APIs。

## 安全性

安全性和隐私是此 API 最需要考虑的，因此除非用户授权了一个 文件 或 目录，否则此 API 不能访问这些内容。

## 可扩展

`FileSystemHandle` 对象可通过 `postMessage()` 转移，也可保存到 indexedDB 里。

## 基本概述

与 文件 或 目录 的操作都基于句柄来提供的，父类 `FileSystemHandle` 派生出 `FileSystemFileHandle` 和 `FileSystemDirectoryHandle` 来代表这两者。

借助 `window.showOpenFilePicker()` 和 `window.showDirectoryPicker()` 两个方法来获取用户选择的 文件 或 目录 句柄。
