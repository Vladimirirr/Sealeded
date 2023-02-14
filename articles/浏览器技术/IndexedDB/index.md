[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)（下面简称 index）是浏览器端（前端）的非关系型（使用索引表）事务数据库，能存储大量的 JavaScript 数据结构（经过结构化处理），甚至包括二进制数据（Blob 或 ArrayBuffer 对象）。

数据结构支持情况：

1. 基本类型除了 Symbol 不支持，其他都支持
2. 普通对象 - 只保存它自己（非枚举和继承的都不保存）
3. 数组支持
4. 函数不支持
5. 正则表达式支持 - 只保存正则表达式的核心信息
6. 日期对象支持 - 只保存日期对象的核心信息

浏览器在隐私模式下不能使用 index。

index 只是底层 API，有一些已经封装了这些内在细节的工具：

- https://github.com/localForage/localForage
- https://github.com/pouchdb/pouchdb
- https://github.com/dexie/Dexie.js
- https://github.com/jakearchibald/idb
- https://github.com/jakearchibald/idb-keyval
- https://github.com/ujjwalguptaofficial/JsStore
