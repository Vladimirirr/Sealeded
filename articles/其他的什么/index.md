# 其他的什么

## disable source mapping in browsers

- Chrome: DevTools -> Settings -> Preferences -> Sources -> uncheck "Enable JavaScript source maps"
- Firefox: DevTools -> Settings -> Advanced Settings -> uncheck "Enable Source Maps"

## 表单提交的页面

当一个页面是由表单提交 `<form action method="POST">` 而得到的，重载此页面浏览器将提示 “是否重发已提交的表单？”。

## 搭建私有 npm 仓库

基本工作方式：

1. 设置此 npm 的接口是内网地址：`npm config set registry http://172.31.0.10`
2. 搭建 npm server，代理需要的 npm 请求（比如，下载、上传）
3. 拦截下载请求，在内部里查找是否存在此包，存在的话就输出此包
4. 不存在的话，查询外网地址（比如 npm 的官方地址），下载和缓存此包再输出
5. 拦截上传请求，将包存放在内部

包的保存方式：

1. Filesystem
2. Database
3. Others: OSS

方案：

1. [verdaccio](https://github.com/verdaccio/verdaccio) (based on filesystem)
2. [cnpmcore](https://github.com/cnpm/cnpmcore) (based on database)
3. [nexus](https://www.sonatype.com/products/nexus-repository) 企业级的解决方案
4. [artifactory](https://jfrog.com/artifactory) 同上

## 路由与 URL

在 URL 上，你能在【一个文件】或【一个目录】里，以`\`做区分，而在命令行模式下，你不能在【一个文件】里，永远只能在【一个目录】里，这是 URL 与命令行在路径处理上的最大区别，ReachRouter 采取的是命令行格式的路径，它忽视末端的`\`，`\some\where\` = `\some\where`。

## underscore#template

```js
var userListView = `
  <ol>
  <%for ( let i = 0; i < users.length; i++ ){%>
    <li>
      <a href="<%=users[i].url%>">
        <%=users[i].name%>
        is
        <%=users[i].age%>
        years old.
      </a>
    </li>
  <% } %>
  </ol>
  <b>above total: <%= users.length %></b>
`
var userListData = [
  { name: 'nat', age: 18, url: 'http://localhost:3000/nat' },
  { name: 'jack', age: 22, url: 'http://localhost:3000/jack' },
]
function templateSimple(str) {
  var head = "var p = []; with(data){ p.push('"
  var body = str
    .replace(/[\r\n]/g, ' ')
    .replace(/<%=(.+?)%>/g, "');p.push($1);p.push('")
    .replace(/%>/g, "p.push('")
    .replace(/<%/g, "');")
  var tail = "');} return p.join('');"
  return new Function('data', head + body + tail)
}
function template(str) {
  var [interpolate, evaluate] = [/<%=(.+?)%>/g, /<%(.+?)%>/g] // interpolate插值 和 evaluate语句
  var matcher = new RegExp(`${interpolate.source}|${evaluate.source}|$`, 'g')
  var index = 0
  var p = '' // position
  var escapes = {
    '\n': 'n',
    '\r': 'r',
    '\u2028': 'u2028',
    '\u2029': 'u2029',
    '\\': '\\',
    "'": "'",
  }
  var escapeRegexp = /[\n\r\u2028\u2029\\']/g
  var escapeChar = (match) => '\\' + escapes[match]
  str.replace(matcher, function (match, interpolate, evaluate, offset) {
    p += str.slice(index, offset).replace(escapeRegexp, escapeChar)

    index = offset + match.length

    if (interpolate) {
      p += `' + (${interpolate} || \'\') + '`
    } else if (evaluate) {
      p += `'; ${evaluate} p+='`
    }

    return match
  })
  p = "var p = ''; with(data){ p+='" + p + "';} return p;"
  return new Function('data', p)
}
```

## 长连接技术

1. Use setTimeout or setInterval
2. SSE, Server Send Event (only server can send message and only supports text format)
3. websocket (full duplex communication and supports binary and text format)

## TaggedTemplate

带标签的模板字符串能实现一些特殊的目的，例如，能当作一门 DSL 的语法模板。因此，标准要求实现需要记住带标签的模板字符串得到的结果里任何与模板自己相关的内容（即，表现在 strings 参数上）。方便在构造 DSL 时，能知晓它是否来自同一个模板（即缓存模板）。

示例：

```js
const store = new WeakMap()
const html = (strings, ...vals) => {
  if (store.has(strings)) {
    console.log('Exists')
    return store.get(strings)
  }
  console.log('New')
  store.set(strings, vals.join('----'))
  return store.get(strings)
}

{
  html`aaaa${1}bbbb`
  html`aaaa${2}bbbb`
  // output: Exists x2
}
{
  const getTpl = (title) => html`aaaa${title}bbbb`
  getTpl(1)
  getTpl(2)
  // output: New Exists
}

// Spec: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates>

// 标准指出：
// The first argument received by the tag function is an array of strings. For any template literal, its length is equal to the number of substitutions (occurrences of `${expr}`) plus one, and is therefore always non-empty.
// For any particular tagged template literal expression, the tag function will always be called with the exact same literal array, no matter how many times the literal is evaluated.
// This allows the tag to cache the result based on the identity of its first argument. To further ensure the array value's stability, the first argument and its raw property are both frozen, so you can't mutate them in any way.
```

## 模板字符串中的换行在源代码与运行时里的不同

假设 `foo.js` 文件是 CRLF 换行：

```js
const aa = `
a
b
`
console.log(aa.length) // output: 4
```

此文件模板字符串部分的字节大小是 6，但是 JavaScript 引擎（Chrome 和 Firefox）在解析这部分字符串时，`\r\n` 变成了 `\n`。
