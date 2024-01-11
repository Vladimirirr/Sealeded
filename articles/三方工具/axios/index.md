# axios

官网：<https://github.com/axios/axios>

Promise based HTTP client for the browser and node.js.

axios = ajax input and output system

## 核心代码

```js
/**
 * 发送请求的核心axios方法，来自axios.0.19.2
 * @param {Object} config 请求的配置对象，与默认配置整合
 * @return {Promise} 请求的结果
 */
Axios.prototype.request = function request(config) {
  // get the resolved config
  config = mergeConfig(this.defaults, config)

  // 得到请求的promise链
  // dispatchRequest在浏览器里就是XMLHttpRequest方法的封装
  // 如果一个promise的then的fulfillment处理器是undefined或null，表示将结果继续传递下去
  // 如果一个promise的then的rejection处理器是undefined或null，表示将错误继续抛出
  var chain = [dispatchRequest, undefined]

  // 代表请求结果的promise
  var promise = Promise.resolve(config)

  // 将此请求的全部请求拦截器（在请求前的中间件）插入到chain前面
  this.interceptors.request.forEach(function unshiftRequestInterceptors(
    interceptor
  ) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected)
  })

  // 相反
  this.interceptors.response.forEach(function pushResponseInterceptors(
    interceptor
  ) {
    chain.push(interceptor.fulfilled, interceptor.rejected)
  })

  // 激活整个promise链
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift())
  }
  // 核心！promise链！
  // return (
  //  Promise.resolve(config)
  //  .then(requestInterceptor_2_fulfillment, requestInterceptor_2_rejection)
  //  .then(requestInterceptor_1_fulfillment, requestInterceptor_1_rejection)
  //  .then(dispatchRequest, undefined)
  //  .then(responseInterceptor_1_fulfillment, responseInterceptor_1_rejection)
  //  .then(responseInterceptor_2_fulfillment, responseInterceptor_2_rejection)
  // )
  // 得到表示请求结果的promise

  return promise
}
```

## adapter（适配器）

adapter 是 axios 发送请求的执行者，在浏览器下是 `new XMLHttpRequest` 的封装（在`/src/lib/adapters/xhr.js`），在 node.js 下是 `http.request` 的封装（在`/src/lib/adapters/http.js`）。

axios 允许自定义 adapter 来扩展 axios 本身。

### mock adapter for axios

一个简单的 mock adapter。

```js
import axios from 'axios'
import axiosDefaultAdapter from 'axios/lib/adapters/xhr.js'

const service = axios.create({
  baseURL: 'http://127.0.0.1:10002',
  timeout: 10e3,
  // 适配器函数需要返回 Promise
  adapter: async (config) => {
    // config 是即将发起请求的配置项
    if (config.needMock) {
      // 测试此请求是需要被 mock，可按照特殊字段匹配，也可按照 URL 匹配，等等
      return {
        // 适配器返回的格式如下：
        data: '{"code": 0, "error": "", data: [11, 22]}',
        status: 200,
        statusText: 'ok',
        headers: {
          'Content-Type': 'text/json',
        },
        config: config, // 请求配置项本身
        request: {}, // 正常请求的话，这个是此请求的 XHR 对象
      }
    } else {
      // 不需要被mock的请求
      return axiosDefaultAdapter(config)
    }
  },
})

service({
  url: '/user/id/list',
  method: 'get',
  params: {},
  needMock: 1,
})
  .then(console.log)
  .catch(console.error)
```
