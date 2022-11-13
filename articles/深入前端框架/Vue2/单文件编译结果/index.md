# Vue2 单文件 + Vite(with plugin `vite-plugin-vue2`)

```vue
<template>
  <p>hello {{ name }}</p>
</template>
<script>
import dayjs from 'dayjs'

console.log('hello')

export default {
  name: 'Hello',
  data() {
    return {
      name: 'nat',
    }
  },
  methods: {},
}
</script>
<style scoped>
p {
  padding: 10px;
}
</style>
<style>
p {
  padding: 12px;
}
</style>
```

编译结果：

```js
import { vue2Normalizer, injectStyleToHeadTag } from './node_modules/.vite/vite-plugin-vue2.js'
import dayjs from 'dayjs'

const sfc__script = {
  name: 'Hello',
  data() {
    return {
      name: 'nat',
    }
  },
  methods: {},
}

const sfc__render = function() {
  with (this) {
    return _c('p', [_v("hello " + _s(name))])
  }
}
const sfc__staticRenderFns = []
const sfc__styles = [
  {
    scopedId: 'data-v-4cebd208',
    content: 'p[data-v-4cebd208]{ padding: 10px; }',
  },
  {
    content: 'p{ padding: 12px; }',
  },
]

const componentOptions = vue2Normalizer(
  sfc__script,
  sfc__render,
  sfc__staticRenderFns,
  sfc__styles: injectStyleToHeadTag(sfc__styles)
)
componentOptions.$options.file = '/src/pages/Demo/Demo.vue'

export default componentOptions
```
