# JSONP

注意！JSONP 技术已经被淘汰！这里只是回温一下这个极其经典的绕过浏览器跨域限制访问资源的方法。

目前跨域问题的标准处理方案是 [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 技术，不再需要前端插足，况且它本来就不该是前端的问题（资源可达的问题从来都是 Server 端需要处理的问题）。

## JSONP (JSON with Padding)

### 起因

A 网站的网络请求（比如，JavaScript 的 `XHR` 或 CSS 的 `@fontface`）不能发到 B 网站（B 网站可能直接忽略本次请求，或者也可能返回了一些数据，但是不管如何，当此跨域请求返回到浏览器时，浏览器将直接拦截掉此请求的返回内容）（受限浏览器的安全策略 —— [Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)）。

### 发现

但是！诸如 `img` `script` 的标签不受此策略的影响。它们能请求任意地址的资源！

### 结果

我们可以将发送给 B 网站的请求放在这些标签的 src 值里，使用这些标签**代理**我们的网络请求。

### 示例

Client 端的 JSONP 工具:

```js
// a util for get a random id for a jsonp callback
const getCallbackId = () => `jsonpCallback_${(Math.random() + '').slice(2)}`

// save the all sent requests with its callback globally
const jsonpCallbacks = {}
window.jsonpCallbacks = jsonpCallbacks

/**
 * @param {string} URL - the target
 * @param {Object} data - data attached in last of the URL
 * @param {Function} callback - the callback to handle the responded data
 */
const jsonp = (URL, data, callback) => {
  // format the data from Object to URLSearchParams
  data = new URLSearchParams(data)
  // create a temporary script element
  const scriptElm = document.createElement('script')
  // get a unique id for this jsonp callback
  const callbackId = getCallbackId()
  // set the URL on a script element
  scriptElm.src =
    URL + '?' + `jsonpCallbackId=${callbackId}` + '&' + data.toString()
  // put the element on the document
  document.body.appendChild(scriptElm)
  // save the callback
  jsonpCallbacks[callbackId] = (response) => {
    // call user callback
    callback(response, {
      // the request
      URL,
      data,
    })
    // cleanup
    document.body.removeChild(scriptElm)
    delete jsonpCallbacks[callbackId]
  }
}
```

Server 的处理 JSONP 请求的路由:

```js
// #!/bin/deno

// run this script file with the command `deno run --watch --allow-net ./server/index.js`

// Deno 使用与 ESModule 相同的模块标准（一个文件就是一个模块），这里直接引入一个官方标准模块（会有缓存策略）
import { serve } from 'https://deno.land/std@0.157.0/http/server.ts'

// a short name for JSON.stringify
const JsonStr = JSON.stringify

// Deno 的 WebServer 使用与浏览器端相似的接口和方法
const handler = async (request) => {
  const path = request.url
  const method = request.method

  console.log(`A request received: path = ${path} | method = ${method}`)

  // a simple router 一个简单的路由
  if (path.includes('/jsonp')) {
    const URLResolved = new URL(path)
    const URLParamsResolved = URLResolved.searchParams
    const jsonpCallbackId = URLParamsResolved.get('jsonpCallbackId')
    const username = URLParamsResolved.get('username')
    const responseData = {
      who: '',
      now: new Date().toLocaleDateString(),
      data: [11, 22],
      powered: 'deno',
    }
    responseData.who = username ?? 'unknown'
    const scriptText = `
      window.jsonpCallbacks.${jsonpCallbackId}(
        // We pad the response data with JSON format into the callback provided by UA !
        // This is origin of the name JSONP!
        // 我们把要返回的数据以JSON的格式填充到了浏览器提供给我们的callback里！
        // 这就是JSONP名字的含义！
        ${JsonStr(responseData)}
      )`
    return new Response(scriptText, {
      status: 200,
      headers: {
        'Content-Type': 'text/javascript',
      },
    })
  }

  // a default response 一个兜底值
  return new Response('Not found the requested resource.', {
    status: 404,
  })
}

serve(handler, { port: 3330 })
```

Test:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>JSONP Test</title>
    <!-- 引入上面的 JSONP 工具 -->
    <script src="./jsonp.js"></script>
    <script>
      // 测试
      jsonp('/jsonp', { username: 'Nat' }, console.log)
    </script>
  </head>
  <body></body>
</html>
```

### 限制

1. 只能发送 GET 请求，只能发送少量数据
2. 需要和 Server 端约定好 JSONP-Callback 的名字
3. 不安全

## CORS (Cross-Origin Resource Sharing)

CORS 使用 HTTP 的 Headers 来处理各种跨域问题，即，将跨域问题直接让 HTTP 协议来处理。

### Request Headers

1. `Access-Control-Allow-Origin`
2. `Access-Control-Expose-Headers`
3. `Access-Control-Max-Age`
4. `Access-Control-Allow-Credentials`
5. `Access-Control-Allow-Methods`
6. `Access-Control-Allow-Headers`

### Response Headers

1. `Origin`
2. `Access-Control-Request-Method`
3. `Access-Control-Request-Headers`

### Preflight Request

预请求：发送一个 OPTION 类型的 HTTP 请求，来询问 Server 是否接受接下来的请求

简单请求不会发送预请求，比如，GET 请求。

大多数的 POST 请求都会发送预请求，以验证 Server 是否接受，不接受的话就可以免去一次不必要的请求发送。
