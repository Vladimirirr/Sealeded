# Dynamic Require

Env: webpack@4，同时也参考了 webpack@5 的输出

目录结构：

```txt
/src
  ./mock
    ./a.js := `export default 'aaaa'`
    ./b.js := `export default 'bbbb'`
  ./utils
    ./mockServer.js
```

`/src/utils/mockServer.js` 文件：

```js
// 当 require 导入的模块带表达式时（即 dynamic require），由于构建时不知道会导入的具体模块，因此会创建一个模块请求上下文（包含了所有可能导入的模块，并被打包到此导入所在的 bundle 里）
const result = require('../mock/' + window.whichFile + '.js')
console.log(result)
```

上述代码被 webpack 转译为：

```js
const requireContext = __webpack_require__('./src/mock sync recursive \\.js$')
const result = requireContext(window.whichFile + '.js')
console.log(result)
```

也可以创建一个自定义的模块请求上下文来实现相同的功能：

```js
// The require.context function can create a custom modules require context.
// The require.context function exposes more parameters for loading dynamic modules.
// The require.context function's all parameters must be static.
// 返回一个函数，它接受 moduleName 参数，并返回对应的模块，其中 moduleName 是被 regexp 匹配到的文件的路径。
// 如果 mode 是 async，此模块请求上下文会被单独打包，即一个单独的 bundle。（实验性功能，目前 webpack@5 仍然不支持）
const requireContext = require.context(
  /* directory */ '../mock',
  /* recursive, for searching in sub-directories, default true */ true,
  /* regexp, for matching target files, default /^\.\/.*$/ */ /\.js$/,
  /* mode, for loading modules with sync or async, default sync */ 'sync'
)
const a_mock_result = requireContext('a.js') // 如果是 sync
// const a_mock_result_async = requireContext('a.js').then((res) => res.default) // 如果是 async
```

被 webpack 转译为：

```js
const requireContext = __webpack_require__('./src/mock sync recursive \\.js$')
const a_mock_result = requireContext('a.js')
```

上面的 `__webpack_require__('./src/mock sync recursive \\.js$')` 是：

```js
const webpackInternalModulesMap = {
  // 在这！
  './src/mock sync recursive \\.js$': function (
    // webpack 内部模块系统构建在 cjs 模块标准上，因此，这里的参数都是对 cjs 的模仿
    module,
    __webpack_exports__,
    __webpack_require__
  ) {
    // A map for all required modules by `require.context`.
    const map = {
      // key = moduleName, value = moduleId
      // moduleName: for requiring a module in this require context
      // moduleId: used in webpack internal modules system, in development mode, the id is the module's file path, in production mode, the id is a number for reducing size
      'a.js': './src/mock/a.js',
      'b.js': './src/mock/b.js',
    }
    /**
     * Get a module with its module name.
     * @param {string} moduleName
     * @return {Module}
     */
    function requireContext(moduleName) {
      const id = requireContextResolve(moduleName)
      return __webpack_require__(id)
    }
    /**
     * Get the module id with its name.
     * @param {string} moduleName
     * @return {string}
     */
    function requireContextResolve(moduleName) {
      if (!__webpack_require__.o(map, moduleName)) {
        // o 方法 = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
        const e = new Error(`Cannot find module "${moduleName}".`)
        e.code = 'MODULE_NOT_FOUND'
        throw e
      }
      return map[moduleName]
    }
    /**
     * Get all modules' name in this require context.
     * @return {Array<string>}
     */
    function requireContextKeys() {
      return Object.keys(map)
    }
    requireContext.resolve = requireContextResolve
    requireContext.keys = requireContextKeys
    requireContext.id = './src/mock sync recursive \\.js$'
    module.exports = requireContext
  },
  './src/mock/a.js': function (
    module,
    __webpack_exports__,
    __webpack_require__
  ) {
    'use strict'
    // r 方法做了这些事情，即定义此对象是一个 ESM
    // 1. Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    // 2. Object.defineProperty(exports, '__esModule', { value: true }) // 如果不支持 Symbol.toStringTag
    __webpack_require__.r(__webpack_exports__)
    __webpack_exports__['default'] = 'aaaa'
  },
  './src/mock/b.js': function (
    module,
    __webpack_exports__,
    __webpack_require__
  ) {
    'use strict'
    __webpack_require__.r(__webpack_exports__)
    __webpack_exports__['default'] = 'bbbb'
  },
}
```
