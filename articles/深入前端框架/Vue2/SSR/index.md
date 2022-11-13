# SSR

SSR 需要数据的确定性，意味着不能也不需要在服务端做数据的响应式化处理，客户端使用 SSR 的目的是获取 App 某一个时刻的某一个状态的视图快照，服务端一次性交付快照的字符串文本。
由于不维护状态，有些生命周期钩子在 SSR 时不能使用，只有 beforeCreate 和 created 会被调用。

1. 避免在 beforeCreate 和 created 钩子里做副作用操作，因为这些副作用将影响服务端，比如 setInterval
2. 避免操作服务端不存在的 API，比如 dom
3. 一些操作 dom 的自定义指令不能用，将自定义指令转为对应组件，或编写对应的适用于服务端渲染的自定义指令

由于 Vue2 不像 Vue3 一样，它是单例模式，请务必不要污染 Vue，确保每个请求都是从最初的 Vue 开始。

```js
const Vue = require('vue')

const originPrototype = Vue.prototype

const extend = (target, source) =>
  Object.keys(source).forEach((key) => (target[key] = source[key]))

const createApp = (options, prototypeOptions = {}) => {
  const newPrototype = Object.create(originPrototype)
  extend(newPrototype, prototypeOptions)
  return new Vue(options)
}
```

基本原理：

1. 执行组件的渲染函数得到 VNode 树
2. 执行 renderNode 开始渲染 Vnode 树
3. 对每个 Node
   1. 渲染左 tag with all its attributes
   2. 渲染右 tag，对于自闭合标签直接返回'/>'
   3. 如果存在 children，就继续（回到`3`）
4. 插入到父节点里面
5. 返回渲染结果文本

```js
function renderNode(node, isRoot, context) {
  // context.write 像当前缓存文本写入
  // context.next 渲染当前节点的孩子节点
  // context.renderStack 使用栈保存当前渲染的节点深度，比如[Root, Layout, Header, div, span, b]，其中每个节点都是VNode结构表示
  if (node.isString) {
    // 渲染文本节点
    renderStringNode(node, context)
  } else if (isDef(node.componentOptions)) {
    // 渲染子组件
    // if isRoot, the component's outer element will append an extra attr with `data-server-rendered`
    renderComponent(node, isRoot, context)
  } else if (isDef(node.tag)) {
    // 渲染dom元素
    renderElement(node, isRoot, context)
  } else if (isTrue(node.isComment)) {
    // 渲染注释
    context.write(`<!-- ${node.text} -->`, context.next)
  } else {
    context.write(
      node.raw ? node.text : escape(String(node.text)),
      context.next
    )
  }
}
```

`_ssrEscape`: escape
`_ssrNode`: renderStringNode
`_ssrList`: renderStringList
`_ssrAttr`: renderAttr
`_ssrAttrs`: renderAttrs, it will call renderAttr internally
`_ssrDOMProps`: renderDOMProps
`_ssrClass`: renderSSRClass
`_ssrStyle`: renderSSRStyle

流式渲染，依旧还是一次性执行完组件的 render，把完整的 VNode 树拿到，渲染出文本结果，再流式的把这些文本返回给浏览器，毕竟 Vue2 的 VNode 树就是递归结构，不能中断，不像 React 的 fiber。

举例：

```js
const VueApp = new Vue({
  data: {
    name: 'jack',
  },
  methods: {
    fn() {
      console.log(1122)
    },
  },
  components: {
    Foo: {
      props: ['who'],
      template: '<div>I am Foo Component, and the name prop is {{who}}</div>',
    },
  },
  template: `
    <div id="app">
      <p>hello {{ name }}</p>
      <p><input v-model="name" /></p>
      <p v-if="false">v-if-false here</p>
      <p v-show="false">v-show-false here</p>
      <p v-for="i in [11, 22]">{{ i }}</p>
      <p><button @click="fn">clickme</button></p>
      <Foo :who="name" @something="fn" />
    </div>
    `,
})
```

```html
<div id="app">
  <p>hello {{ name }}</p>
  <p><input v-model="name" /></p>
  <p v-if="false">v-if-false here</p>
  <p v-show="false">v-show-false here</p>
  <p v-for="i in [11, 22]">{{ i }}</p>
  <p><button @click="fn">clickme</button></p>
  <Foo :who="name" @something="fn" />
</div>
```

compileToFunctions is from vue-server-renderer instead of Vue's origin

```js
function anonymous() {
  with (this) {
    return _c(
      'div',
      {
        id: '#app',
      },
      [
        _ssrNode(
          '<p>' +
            _ssrEscape('hello ' + _s(name)) +
            '</p> <p><input' +
            _ssrAttr('value', name) +
            '></p> ' +
            (false ? '<p>v-if-false here</p>' : '<!---->') +
            ' <p' +
            _ssrStyle(null, null, { display: false ? '' : 'none' }) +
            '>v-show-false here</p> ' +
            _ssrList([11, 22], function (i) {
              return '<p>' + _ssrEscape(_s(i)) + '</p>'
            }) +
            ' <p><button>clickme</button></p> '
        ),
        _c('Foo', { attrs: { who: name }, on: { something: fn } }),
      ],
      2
    )
  }
}
```

```js
// 客户端的render
;(function anonymous() {
  with (this) {
    return _c(
      'div',
      {
        attrs: {
          id: 'app',
        },
      },
      [
        _c('p', [_v('hello ' + _s(name))]),
        _v(' '),
        _c('p', [
          _c('input', {
            directives: [
              {
                name: 'model',
                rawName: 'v-model',
                value: name,
                expression: 'name',
              },
            ],
            domProps: {
              value: name,
            },
            on: {
              input: function ($event) {
                if ($event.target.composing) return
                name = $event.target.value
              },
            },
          }),
        ]),
        _v(' '),
        false ? _c('p', [_v('v-if-false here')]) : _e(),
        _v(' '),
        _c(
          'p',
          {
            directives: [
              {
                name: 'show',
                rawName: 'v-show',
                value: false,
                expression: 'false',
              },
            ],
          },
          [_v('v-show-false here')]
        ),
        _v(' '),
        _l([11, 22], function (i) {
          return _c('p', [_v(_s(i))])
        }),
        _v(' '),
        _c('p', [
          _c(
            'button',
            {
              on: {
                click: fn,
              },
            },
            [_v('clickme')]
          ),
        ]),
        _v(' '),
        _c('Foo', {
          attrs: {
            who: name,
          },
          on: {
            something: fn,
          },
        }),
      ],
      2
    )
  }
})
```

```html
<div id="app" data-server-rendered="true">
  <p>hello jack</p>
  <p>
    <input value="jack" />
  </p>
  <!--  -->
  <p style="display:none;">v-show-false here</p>
  <p>11</p>
  <p>22</p>
  <p>
    <button>clickme</button>
  </p>
  <div>I am Foo Component, and the name prop is jack</div>
</div>
```

注水过程：
当客户端使用 new Vue 挂载时，发现存在 data-server-rendered，就使用注水。
Vue 会检查服务端下发的已经渲染的 DOM 与客户端本身渲染的 VNode 的结构是否一致，不一致，将丢弃服务端渲染的内容。

1. new Vue -> 创建根组件的整颗树
2. 在首次根 patch 时判断根 dom 是否存在 data-server-rendered
3. 存在的话，移除此标记，以 hydrate 方式渲染（同时标记全局 hydrating 为真，这样子组件也将以 hydrate 方式渲染）
4. 执行 hydrate，此方法检查是否匹配，匹配的话直接把对应的 dom 赋值给 VNode.elm

注意，有些 dom 结构会被浏览器自动修改（修正），会导致注水时匹配失败：

```html
<table>
  <tr>
    <td>hi</td>
  </tr>
</table>
```

浏览器会自动加上`tbody`标签。
