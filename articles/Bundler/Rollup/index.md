# Rollup

JavaScript 的打包工具，严格践行 ES Module 标准。

官网：<https://rollupjs.org/>

## vs. Webpack

Webpack 是大而全的 web 打包工具（从名字便能看出），而 Rollup 更专注 JavaScript 的打包。

## 重要或难懂的配置

查看 `./preset/rollup.config.lib.js` 模板。

## 插件

### JS 相关

#### @rollup/plugin-commonjs

Convert CommonJS modules to ES modules, so they can be included in a Rollup bundle.

Rollup 仅能读写标准的 ES 模块，不支持旧时的 CJS 模块，因此需要插件来帮忙读写 CJS 模块。

#### @rollup/plugin-node-resolve

Locate a module with the [Node.js resolution algorithm](https://nodejs.org/api/modules.html#modules_all_together).

举例：

```js
// 如果没引入此插件，打包会报错，不能找到此导入，因为标准的 ESM 必须需要文件的路径和扩展名
import foo from 'foo' // 没有 路径 和 扩展名
import foo from './foo' // 没有 扩展名
```

#### @rollup/plugin-babel

Integrate seamlessly between Rollup and Babel.

集成 Babel（转换 ES6+ 的 JavaScript）。

#### @rollup/plugin-strip

Remove `debugger` statements and functions like `assert.equal` and `console.log` from the code.

在构建时移除 debugging 信息。

#### @rollup/plugin-terser

Generate a minified bundle with terser.

#### @rollup/legacy

Add `export` declarations to legacy non-module scripts.

#### @rollup/virtual

Load virtual modules.

`./rollup.config.js`:

```js
import virtual from '@rollup/plugin-virtual'

export default {
  input: 'src/entry.js',
  plugins: [
    virtual({
      ironman: `export default 'And I am ironman.'`,
    }),
  ],
}
```

`./src/index.js`:

```js
import ironman_said from 'ironman' // import a virtual module

console.log({ ironman_said })
```

### 替换相关

#### @rollup/plugin-alias

Define aliases when bundling.

路径替换，例如 `@` -> `/src`。

#### @rollup/plugin-inject

Scan modules for global variables and injects `import` statements where necessary.

导入模块需要的依赖，例如，lodash 在项目里很多处都需要，可让此插件来帮忙写 `import _ from 'lodash'`。

#### @rollup/plugin-replace

Replace targeted strings in files while bundling.

字符串常量替换。

### 转换相关

#### @rollup/plugin-url

Import a file as a base64 data or asset identifier(if the file's size exceeds the limit).

This will copy a file to the destination with a hashed filename if the size exceeds the limit. A file will always be copied when the limit is set to 0.

#### @rollup/image

Import JPG, PNG, GIF, SVG, and WebP files as base64.

#### @rollup/json

Import JSON files.

#### @rollup/sucrase

Import TypeScript, Flow, JSX files and so on with Sucrase.

Sucrase forks from Babel Core, and focuses on compiling non-standard JavaScript language extensions, such as JSX, TypeScript and Flow.

#### @rollup/typescript

Import TypeScript files.

#### @rollup/wasm

Import WebAssembly files.

#### @rollup/yaml

Import YAML files.

#### @rollup/dsv

Import CSV and TSV files.

#### rollup-plugin-vue

Import Vue files.

### All plugins

At: <https://github.com/rollup/awesome>
