# JSON

JSON(JavaScript Object Notation) 是网络数据传输的一种格式（语言不相关），与 XML 相同，但更适合 B/S 架构。

JSON 是 Unicode 文本格式。

JSON 的语法是 JavaScript 的子集，而且许多语言都内置支持 JSON 格式，比如 Java、PHP、Rust、Python、等。

JSON 的语法格式非常受限（比如，键名必须是双引号、也不能含有注释），不过有个 JSON 的变体 [JSON5](https://github.com/json5/json5) 没有那么多限制，JSON 语法受限不是标准的制定者或实现者懒，而是这样能方便各个平台和语言能高效地【格式化】与【反格式化】（专注性能，降低潜在的转换问题）。

标准：https://www.rfc-editor.org/rfc/rfc7159

## JSON.stringify

将 JavaScript 对象转成 JSON 字符串。

签名：`JSON.stringify(value: Object, replacer?:Function, space = 0): string`

注意：

1. 仅支持 JavaScript 的 `number` `string` `boolean` `null` `Object` `Array` 类型
2. 不支持存在相互索引的对象

### 校验

拦截一个对象转换到 JSON 时的操作。

```js
const data = {
  firstName: 'Zhenyu',
  lastName: 'Yang',
  age: 22,
  greeting: 'Hello!',
}

const result = JSON.stringify(data, (key, val) => {
  // 首次执行时，key是空字符串，而val是整个被处理的对象
  console.log(key, val)
  // 返回 undefined 表示跳过此值
  if (key == 'age') return undefined
  return val
})

console.log(result) // without attribute age
```

### 美化

第三个参数可以传入 JSON 每行的缩进（空格）长度，此时如果不需要第二个参数，可以给其传入 `undefined`。

### toJSON

如果对象存在 toJSON 方法，那么 stringify 在转换时就会执行它，同时以它返回的结果来代替此对象的转换，即代替 stringify 对对象的默认转换方式。

注意！toJSON 不是让你直接返回一个 JSON 字符串，而是返回一个你希望此对象被如何转换的衍生值。

```js
const aa = {}
aa.toJSON = function () {
  // 让 aa 对象看作数字
  return 10
}

const bb = {}
bb.toJSON = function () {
  // 让 aa 对象看作字符串，注意！除非你真的要返回字符串，否则这是错误的！
  return 'hi'
}

const cc = {}
cc.toJSON = function () {
  // return another object instead
  return [11, 22]
}

const data = {
  aa,
  bb,
  cc,
}

console.dir(JSON.stringify(data)) // print: `{"aa":10,"bb":"hi","cc":[11,22]}`
```

## JSON.parse

签名：`JSON.parse(value: string, reviver?:Function): Object`

### 校验

其中的 reviver 与 stringify 的 replacer 相同。

## 小技巧

我们可以使用 `JSON.parse(JSON.stringify(data))` 来快速深拷贝一个符合 JSON 语义的 JavaScript 对象。
