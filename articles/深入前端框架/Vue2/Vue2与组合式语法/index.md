# Vue2 的组合式语法

不得不说使用组合式语法与 Hook 的写法很舒服，Vue 团队专门对 Vue2 版本做了改造，让它内置支持一定程度的 Vue3 组合式语法，即 Vue2.7.x 版本系列。

而 Vue2.6.14 作为选项式语法的最后一个版本。

## 基本思想

不修改 Vue2 已经存在的响应式与依赖收集系统（基于 defineProperty），在此基础上对 Vue2 修改，使它支持组合式。

```js
// 其他特性（比如props、$emit、$attrs、$listeners），建议还是使用选项式语法，毕竟对Vue2支持组合式语法都是基于polyfill的（即hack方式），可能有潜在的问题
import { ref, computed, watch, watchEffect, onMount } from 'vue2.7.8'

const Foo = {
  name: 'Foo',
  components: {
    // 子组件使用方法依旧
  },
  setup() {
    // do initState -> do initSetup -> do callSetup -> get setupResult -> unwrap each ref and proxy on the vm
    const { ref, computed, watch, watchEffect } = Vue
    const age = ref(22)
    const nextYearAge = computed(() => age.value + 1)
    watch([age], (/* no args */) => console.log('watch'))
    watchEffect(() => {
      // 立刻运行此函数（副作用，即Effect）
      // 当其中的依赖变化时，再次运行
      console.log('watchEffect', age.value)
    })
    const addYear = () => ++age.value
    return { age, nextYearAge, addYear }
  },
  template: `
    <div>
      <!-- 2.7.8的模板支持ESNext的语法，比如可选链 -->
      <p>The age value is {{age}} while the next year is {{nextYearAge}}.</p>
      <p><button v-on:click="addYear">add year</button></p>
    </div>
  `,
}
```

函数：

```js
// 只是核心伪代码，Vue2.7.8里的代码要详细地多
function ref(raw) {
  var ref = { __isRef: true, __raw: raw }
  defineReactive(ref, 'value', raw)
  return ref
}
function computed(getter /* alias for effect */) {
  var watcher = new Watcher(getCurrentInstance(), getter, noop, { lazy: true })
  var ref = {
    __isRef: true,
    __isReadonly: true,
    effect: watcher,
    get value() {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      return watcher.value
    },
  }
  return ref
}
function reactive(data) {
  data['__isReactive'] = true
  observe(data)
  return data
}
function watch(deps, effect) {
  var getter = function () {
    return deps.map(function (dep) {
      switch (getDepType(dep)) {
        case 'ref':
          return ref.value // touch the ref.value and make effect track the value
          break
        case 'reactive':
          return traverse(dep) // touch all value of a reactive data
          break
        case 'function':
          return dep.call(this) // touch will happen when executing the function
          break
        default:
          return
      }
    })
  }
  var watcher = new Watcher(getCurrentInstance(), getter, effect, {
    user: true,
  })
  return watcher.teardown.bind(watcher)
}
function watchEffect(effect) {
  return watch([effect], effect) // 特殊的watch
}
```

## 插件`vue-composition-api`

在`beforeCreate`钩子里将`setup`包裹到`$options.data`方法，在`initState`里执行`initSetup`方法，将`ref`定义自动`unwrap`的`getter`到`vm`上。

## 建议

Vue2 就使用最经典的选项式语法，使用 2.5.17 或 2.6.14 版本。不要使用任何使用 polyfill 来对 Vue2 提供组合式支持的技术，包括`vue-composition-api`插件以及 2.7.x 版本内置对组合式的支持。

## 发现

其实组合式语法不是 Proxy 特有的，使用 defineProperty 也能实现组合式语法，只不过实现很受限制，需要大量的 hack 方法，很不优雅。
