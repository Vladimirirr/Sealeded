# Webpack

最早也是最常见的 Web 平台打包器。

它把任何一个文件都看作一个模块，默认地，它只认识 JavaScript 模块，其他模块需要各自的载入器来把这些模块最终转换到 JavaScript，比如 CSS，需要一个叫做 css-loader 的载入器，来把 CSS 代码转成 JavaScript。

最早，Webpack 的配置项巨复杂，因此出现了一个叫做 Parcel 的打包器，它的口号是“零配置打包工具”，且抢占了较多的 Webpack 市场，也因此，Webpack@4 起，内置了很多默认的配置，不再需要繁琐的配置项了。

Webpack@5 引入了模块联邦概念，进一步将公共模块发挥到极致。

目前，有很多工具试图去代替 Webpack，也成功了很多，包括，SWC、ESBuild、TurboPack、Vite，它们的发出点都是让其他更高效的语言（主要是 Golang 和 Rust）代替 JavaScript 语言。或许，Webpack 在将来会消失，但是 Webpack 开创和发扬了 Web 前端的打包概念，它的影响意义深远。

官网：<https://webpack.js.org/>
