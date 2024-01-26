# webpack 打包的 bundle.js 代码分析

## webpack.config.js

```js
const { resolve } = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: resolve('dist'),
  },
}
```

## Source

`index.js`：入口

```js
import * as operation from './oper.js'
console.log(
  `i am index.js, and i imported a module whose description is: ${operation.desc}.`
)
console.log(`4 + 5 = ${operation.add(4, 5)}`)
console.log(`4 * 5 = ${operation.mul(4, 5)}`)
```

`oper.js`：自定义模块

```js
function add() {
  return [].slice.call(arguments).reduce((acc, val) => acc + val)
}
function mul() {
  return [].slice.call(arguments).reduce((acc, val) => acc * val)
}
var desc = 'some math operations'
export { add, mul, desc }
```

## webpack4 的 bundle.js

```js
;(function (modules) {
  // webpackBootstrap
  // The module cache
  var installedModules = {}

  // The require function
  function __webpack_require__(moduleId) {
    // 此函数执行一个模块（已经被webpack封装成了函数，即modules），返回这个模块的导出
    // Check if module is in cache
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    // Create a new module (and put it into the cache)
    var module = (installedModules[moduleId] = {
      i: moduleId, // 字符串或数字
      l: false, // l = loaded
      exports: {},
    })

    // Execute the module function
    // webpack把ES6模块转成CommonJS，故传入module、module.exports和require
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    )

    // Flag the module as loaded
    module.l = true

    // Return the exports of the module
    return module.exports
  }

  // expose the modules object (__webpack_modules__)
  // 全部模块
  __webpack_require__.m = modules

  // expose the module cache
  // 模块缓存
  __webpack_require__.c = installedModules

  // define getter function for harmony exports
  // 工具函数，设置一个返回模块导出的name对应的值的getter
  // 比如模块oper.js导出了desc，那么它导出的exports对象存在一个叫做desc的访问器getter，此访问器通过闭包返回desc对应的值
  __webpack_require__.d = function (exports, name, getter) {
    if (!__webpack_require__.o(exports, name)) {
      Object.defineProperty(exports, name, {
        enumerable: true,
        get: getter,
      })
    }
  }

  // define __esModule on exports
  // 给exports对象设置相关标识，表示此对象是ES6模块
  __webpack_require__.r = function (exports) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exports, Symbol.toStringTag, {
        value: 'Module',
      })
    }
    Object.defineProperty(exports, '__esModule', { value: true })
  }

  // create a fake namespace object
  // mode & 1: value is a module id, require it
  // mode & 2: merge all properties of value into the ns
  // mode & 4: return value when already ns object
  // mode & 8|1: behave like require
  __webpack_require__.t = function (value, mode) {
    if (mode & 1) value = __webpack_require__(value)
    if (mode & 8) return value
    if (mode & 4 && typeof value === 'object' && value && value.__esModule)
      return value
    var ns = Object.create(null)
    __webpack_require__.r(ns)
    Object.defineProperty(ns, 'default', {
      enumerable: true,
      value: value,
    })
    if (mode & 2 && typeof value != 'string')
      for (var key in value)
        __webpack_require__.d(
          ns,
          key,
          function (key) {
            return value[key]
          }.bind(null, key)
        )
    return ns
  }

  // getDefaultExport function for compatibility with non-harmony modules
  // harmony module就是ES6模块
  // 如果是ES6的module就取default，不是ES6的module就直接返回此module
  // 当oper.js采取`module.exports = {add, mul, desc};`导出时
  // 当index.js采取`import operation from './oper.js';`导入时
  // oper.js不会被webpack做任何处理，意味着oper.js导出的exports对象不会被__webpack_require__.r函数加工，即表明此exports不是ES6模块
  // 同时将会在index.js观察到__webpack_require__.n被执行了，代码如下
  // /* harmony import */ var _oper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./oper.js */ "./src/oper.js");
  // /* harmony import */ var _oper_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_oper_js__WEBPACK_IMPORTED_MODULE_0__);
  __webpack_require__.n = function (module) {
    var getter =
      module && module.__esModule
        ? function getDefault() {
            return module['default']
          }
        : function getModuleExports() {
            return module
          }
    __webpack_require__.d(getter, 'a', getter) // 这个设置访问器（由于访问器就叫做getter，但是此函数内部也有个getter变量，为避免混淆，本句的访问器和getter不是一个意思）的方法很巧妙，getter函数给自身设置了一个叫做a的访问器，而这个访问器又是getter函数本身，执行这个getter函数会返回闭包当中的module.default或module
    return getter
    // 返回的getter是一个函数，函数自身的特性`a`就是默认的导出
  }

  // Object.prototype.hasOwnProperty.call
  // 工具函数hasOwnProperty
  __webpack_require__.o = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property)
  }

  // __webpack_public_path__
  // 模块的基本路径
  __webpack_require__.p = ''

  // Load entry module and return exports
  // __webpack_require__.s表示入口模块
  return __webpack_require__((__webpack_require__.s = './src/index.js'))
})({
  // webpack会将全部的ES模块语法转成CommonJS模块语法
  // ES6的导出和导入都会被等效地替换成__webpack_require__.d和 __webpack_require__函数
  './src/index.js':
    /*!**********************!*\
    !*** ./src/index.js ***!
    \**********************/
    /*! no exports provided */
    function (module, __webpack_exports__, __webpack_require__) {
      'use strict'
      // 严格模式下的eval会生成自己的变量域
      // 下面eval的代码会被映射到webpack:///src/index.js这个文件
      eval(
        '__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _oper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./oper.js */ "./src/oper.js");\n\r\n\r\nconsole.log(`i am index.js, and i imported a module whose description is: ${_oper_js__WEBPACK_IMPORTED_MODULE_0__["desc"]}.`);\r\n\r\nconsole.log(`4 + 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__["add"](4, 5)}`);\r\nconsole.log(`4 * 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__["mul"](4, 5)}`);\r\n\n\n//# sourceURL=webpack:///./src/index.js?'
      )
    },

  './src/oper.js':
    /*!*********************!*\
    !*** ./src/oper.js ***!
    \*********************/
    /*! exports provided: add, mul, desc */
    function (module, __webpack_exports__, __webpack_require__) {
      'use strict'
      eval(
        '__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "add", function() { return add; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mul", function() { return mul; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "desc", function() { return desc; });\nfunction add(){\r\n\treturn [].slice.call(arguments).reduce( (acc, val)=>acc+val );\r\n}\r\n\r\nfunction mul(){\r\n\treturn [].slice.call(arguments).reduce( (acc, val)=>acc*val );\r\n}\r\n\r\nvar desc = \'some math operations\';\r\n\r\n\r\n\n\n//# sourceURL=webpack:///./src/oper.js?'
      )
    },
})
```

打包的`index.js`：

```js
__webpack_require__.r(__webpack_exports__)

/* harmony import */
var _oper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(
  /*! ./oper.js */ './src/oper.js'
)

console.log(
  `i am index.js, and i imported a module whose description is: ${_oper_js__WEBPACK_IMPORTED_MODULE_0__['desc']}.`
)
console.log(`4 + 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__['add'](4, 5)}`)
console.log(`4 * 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__['mul'](4, 5)}`)
```

打包的`oper.js`：

```js
__webpack_require__.r(__webpack_exports__)

/* harmony export (binding) */
__webpack_require__.d(__webpack_exports__, 'add', function () {
  return add
})
/* harmony export (binding) */
__webpack_require__.d(__webpack_exports__, 'mul', function () {
  return mul
})
/* harmony export (binding) */
__webpack_require__.d(__webpack_exports__, 'desc', function () {
  return desc
})
function add() {
  return [].slice.call(arguments).reduce((acc, val) => acc + val)
}
function mul() {
  return [].slice.call(arguments).reduce((acc, val) => acc * val)
}
var desc = 'some math operations'
```

## webpack5 的 bundle.js

```js
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 * 打包结果和webpack4很像，只是少了webpack4内置的兼容函数，剩下的函数和变量都和webpack4差不多
 */
;(() => {
  // webpackBootstrap
  'use strict'
  var __webpack_modules__ = {
    './src/index.js':
      /*!**********************!*\
      !*** ./src/index.js ***!
      \**********************/
      (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _oper_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./oper.js */ "./src/oper.js");\n\r\n\r\nconsole.log(`i am index.js, and i imported a module whose description is: ${_oper_js__WEBPACK_IMPORTED_MODULE_0__.desc}.`);\r\n\r\nconsole.log(`4 + 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__.add(4, 5)}`);\r\nconsole.log(`4 * 5 = ${_oper_js__WEBPACK_IMPORTED_MODULE_0__.mul(4, 5)}`);\r\n\n\n//# sourceURL=webpack://webpacktest5/./src/index.js?'
        )
      },

    './src/oper.js':
      /*!*********************!*\
      !*** ./src/oper.js ***!
      \*********************/
      (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
        eval(
          '__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   "add": () => (/* binding */ add),\n/* harmony export */   "mul": () => (/* binding */ mul),\n/* harmony export */   "desc": () => (/* binding */ desc)\n/* harmony export */ });\nfunction add(){\r\n\treturn [].slice.call(arguments).reduce( (acc, val)=>acc+val );\r\n}\r\n\r\nfunction mul(){\r\n\treturn [].slice.call(arguments).reduce( (acc, val)=>acc*val );\r\n}\r\n\r\nvar desc = \'some math operations\';\r\n\r\n\r\n\n\n//# sourceURL=webpack://webpacktest5/./src/oper.js?'
        )
      },
  }

  // The module cache
  var __webpack_module_cache__ = {}

  // The require function
  function __webpack_require__(moduleId) {
    // Check if module is in cache
    var cachedModule = __webpack_module_cache__[moduleId]
    if (cachedModule !== undefined) {
      return cachedModule.exports
    }
    // Create a new module (and put it into the cache)
    var module = (__webpack_module_cache__[moduleId] = {
      // no module.id needed
      // no module.loaded needed
      exports: {},
    })
    // Execute the module function
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__)
    // Return the exports of the module
    return module.exports
  }

  // 给__webpack_require__挂载方法，下同
  /* webpack/runtime/define property getters */
  ;(() => {
    // define getter functions for harmony exports
    __webpack_require__.d = (exports, definition) => {
      for (var key in definition) {
        if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key],
          })
        }
      }
    }
  })()

  /* webpack/runtime/hasOwnProperty shorthand */
  ;(() => {
    __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop)
  })()

  /* webpack/runtime/make namespace object */
  ;(() => {
    // define __esModule on exports
    __webpack_require__.r = (exports) => {
      if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module',
        })
      }
      Object.defineProperty(exports, '__esModule', { value: true })
    }
  })()

  // startup
  // Load entry module and return exports
  // This entry module can't be inlined because the eval devtool is used.
  var __webpack_exports__ = __webpack_require__('./src/index.js')
})()
```
