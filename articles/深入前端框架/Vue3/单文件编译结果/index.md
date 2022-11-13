# Vue3 单文件 + Vite

```vue
<template>
  <div>hello {{ name }}</div>
</template>
<script setup>
import { ref } from 'vue'
import { makeDone } from '@/utils'

console.log('mark 1')

const name = ref(0)

console.log('mark 2')
</script>
<style scoped>
div {
  color: red;
}
</style>
```

setup 语法糖等于：

```vue
<script>
import { ref } from 'vue'
import { makeDone } from '@/utils'

// console.log('mark 1') // 没有被编译到此处，意味着不会在导入时就执行
// console.log('mark 2') // 同上

export default {
  setup() {
    console.log('mark 1') // 被编译到此处！
    const name = ref(0)
    console.log('mark 2') // 被编译到此处！
    return {
      name,
      makeDone,
    }
  },
}
</script>
```

最终结果：

```js
import { injectStyleToHeadTag } from './node_modules/.vite/deps/@vite/client.js'
import { ref } from './node_modules/.vite/deps/vue.js'
import { makeDone } from '/src/utils/index.js'
const sfc__main = {
  name: 'Demo',
  setup(props) {
    console.log('mark 1') // 被编译到此处！
    const name = ref(0)
    console.log('mark 2') // 被编译到此处！
    return {
      name,
      makeDone,
    }
  },
}
const sfc__render = () => {} // 渲染函数省略
const sfc__styles = [
  {
    scopedId: 'data-v-4cebd208',
    content: 'div[data-v-4cebd208]{ color: red; }',
  },
]

export default {
  sfc__main,
  sfc__render,
  sfc__styles: injectStyleToHeadTag(sfc__styles),
}
```
