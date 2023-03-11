# Promise

Promise 的出现与最佳实践。

## Callback

关键词：失去控制、失去信任、嵌套地狱

失去控制和失去信任的代码示例：

```html
<script type="module">
  // 我们的支付系统
  import checkout from './our/payment/system/index.js'
  // 一个组件，但是来自一个第三方的框架
  import SubmitBtn from './third/part/components/SubmitBtn.js'
</script>
<template>
  <!-- 我们的购物车组件的模板 -->
  <div class="goodsList">
    <!-- 商品列表 -->
  </div>
  <div class="operations">
    <!-- 操作按钮组 -->
    <submit-btn id="payBtn">支付</submit-btn>
  </div>
  <script>
    const payBtn = document.getElementById('payBtn')
    // 我们把支付函数传入了第三方代码，我们只能祈祷此第三方代码不会出错，祈祷它能正确地执行我们传入的callback！
    // 不要少执行、也不要多执行、也希望传入正确的参数（即，下面的参数e是符合格式的，它的data也是支付系统可以识别的格式）！
    // 这就是失去控制（我们不再是callback的控制者）、失去信任（失去控制导致的），我们失去了对我们自己代码（即callback）的控制和信任！啊，这糟糕极了！
    // 如果它的click执行了好多次callback，那么我们就会受到客户的投诉（为什么我的钱包多扣了钱）！
    // 虽然我们可以在callback里设置一重重的检查器（比如，设置一个外部变量来记录执行的次数），但这大大地增加了我们代码的可读性，反而使得我们的软件变得复杂难懂，而且很冗余！
    payBtn.addEventListener('click', (e) => checkout(e.payData))
  </script>
</template>
```

嵌套地狱的代码示例：

```js
// 使用一个很简单的前端工具框架 -- jQuery
// $是jQuery的简写标识符
// $.ajax是jQuery对XHR的封装，类似axios
$.ajax({
  path: 'first',
  data: 'initial',
  success: (res) => {
    console.log('first returned', res)
    $.ajax({
      path: 'second',
      data: res.data,
      success: (res) => {
        console.log('second returned', res)
        $.ajax({
          path: 'third',
          data: res.data,
          success: (res) => {
            console.log('third returned', res)
            // 我们的second必须依赖first返回的结果
            // 同样，third必须依赖second返回的结果
            // 这样它们就被一次次地嵌套，或许还可能继续嵌套下去，天呐，我的显示器不够宽了！
          },
        })
      },
    })
  },
})
```

## Promise

关键词：控制反转、信任反转、代理、中立、一次性、链式

控制反转、信任反转、代理、中立、一次性的代码示例：

```html
<script>
  // 控制反转、信任反转：我们的callback的控制权依旧是我们的，而且我们可以信任callback执行的次数和传入的参数、等等
  // 代理、中立：第三方代码与我们的callback被一个中立的代理者控制着
  // 一次性：第三方代码只能返回一次结果（即Promise里的决议术语），即便将来它继续返回结果也将被代理者忽略

  // 依旧是我们的支付按钮
  const payBtn = document.getElementById('payBtn')
  // 我们请出我们的代理者，即Promise
  const promise = new Promise((resolve) => {
    // 此函数将立刻执行
    // 我们把resolve传入第三方代码（即，我们的callback不再是我们的支付函数，而是代理者的决议标识函数），resolve表示决议此Promise，而且只有首次的resolve有效，这就是控制反转，Promise让我们的callback又回到了我们自己的代码里
    payBtn.addEventListener('click', resolve)
  })
  promise.then((res) => {
    // 这里才是我们真正的支付函数，此函数没有传给第三方代码，而是传给了代理者，而代理者在我们的代码控制下！
    // 静静地等待我们的客户按下支付按钮
    // 最终，我们支付此订单
    checkout(res.data)
  })
</script>
```

链式的代码示例：

```js
// 假设$.ajax.withPromise是ajax的Promise变体
$.ajax
  .withPromise({
    path: 'first',
    data: 'initial',
  })
  .then((res) => {
    console.log('first returned', res)
    return $.ajax.promise({
      path: 'second',
      data: res.data,
    })
  })
  .then((res) => {
    console.log('second returned', res)
    return $.ajax.promise({
      path: 'third',
      data: res.data,
    })
  })
  .then((res) => {
    console.log('third returned', res)
    // 哈哈，现在它们没有被嵌套，而是自上而下地书写，读起来轻松多了！
    // 书写思维从 嵌套 -> 链式 转变！
    // 这棒极了！
  })
```

## Promise under Generator

关键词：以同步地思维继续书写异步代码

详见[autoRun](../Generator/autoRun.test.html)。

使用语法糖：

```js
const foo = async () => {
  const firstRes = await $.ajax.withPromise({
    path: 'first',
    data: 'initial',
  })
  // 上面的await关键词告知foo函数，你需要等待此Promise返回结果（决议）才能继续向下执行！
  console.log('first returned', firstRes)
  const secondRes = await $.ajax.withPromise({
    path: 'second',
    data: firstRes.data,
  })
  console.log('second returned', firstRes)
  const thirdRes = await $.ajax.withPromise({
    path: 'third',
    data: secondRes.data,
  })
  console.log('third returned', firstRes)
  // 看到了没！现在异步代码以同步的方式书写出来了，它们可以和同步的代码写在一起，就好像它们也变成了同步的代码一样！
  // 太奇妙了！
}
```

## 总结

Promise 目的：使异步任务**可控制可信任**且**高效地链式组合**的技术

传统基于回调函数的异步任务解决方案的缺点：

1. 不可信任，将 callback 传给其他 api，如果此 api 有潜在的 bug 将影响到此 callback，比如此 api 没有正确地执行传给它的 callback（过多或过少地执行、或根本没有执行、或执行传入的参数不符合预期、等等）
2. callback 的嵌套写法带来的死亡金字塔代码（嵌套地狱）

Promise 如何解决：

1. 创建一个 promise，由此 promise 代理此 api 的状态变更和对应的 callback
2. 支持链式语法

Promise 执行的时机：每轮事件循环的微任务阶段，JavaScript 引擎将收集和执行全部已经决议的 promise，遇到未被捕获的拒绝的 promise 将抛出异常
