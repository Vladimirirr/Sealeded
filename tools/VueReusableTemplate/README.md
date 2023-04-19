# VueReusableTemplate

创建一个能直接在 Vue 组件的模板语法里复写的子模板。

此方法仅支持 Vue2.7 和 Vue3，这是由 Vue2 不支持下面的模板特性而导致的：

```vue
<template>
  <div class="container">
    <!-- 直接把此组件里的全部内容看作此组件的一个默认插槽（默认渲染函数，即 FooComponentInstance.$slots.default） -->
    <Foo v-slot="props">
      <p>some text</p>
    </Foo>
  </div>
</template>
```

> 此方法参考自 `@vueuse/core` 的 `createReusableTemplate`。
