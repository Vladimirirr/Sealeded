# 创建项目

安装依赖：

`npm i -D assemblyscript`

创建项目：

`npx asinit testProject`

得到如下结构的目录：

```txt
./assembly
你的代码目录。

./assembly/tsconfig.json
TypeScript 配置，向你的 IDE 提供 WebAssemblyScript 的类型支持。

./assembly/index.ts
入口。

./build
相当 dist 目录。

./build/.gitignore
让 Git 忽略构建出来的东西。

./asconfig.json
构建配置。

./package.json
项目信息，和包含一些必要的命令。

./tests/index.js
Node.js 上的测试。

./index.html
浏览器上的测试。

```

构建：

`npm run build`

测试：

`npm run test`
