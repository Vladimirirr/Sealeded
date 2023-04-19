<template>
  <div>
    <h1>测试一下 renderSnippet 方法</h1>
    <renderSnippet
      :renderer="() => h('p', {}, 'Rendered from renderSnippet.')"
    />
    <h1>定义模板（没有内容）</h1>
    <DefineFoo v-slot="props">
      <div>Name: {{ props.name }}</div>
      <div>Age: {{ props.age }}</div>
      <div v-if="props.$slots.bolderAge">
        slot:bolderAge:
        <renderSnippet
          :renderer="() => props.$slots.bolderAge({ data: props })"
        />
        <!-- another method to execute a render function in template block -->
        <!-- Vue3 内置组件 component 也能接受一个函数组件 -->
        <!-- <component :is="props.$slots.bolderAge" :data="props"></component> -->
      </div>
      <div v-if="props.$slots.default">
        slot:default:
        <renderSnippet
          :renderer="() => props.$slots.default({ data: props })"
        />
      </div>
    </DefineFoo>
    <h1>测试模板</h1>
    <h2>
      只有 props
      <!-- 这里定义的组件的 props 将直接被传入到 templateRender 函数里 -->
    </h2>
    <ReuseFoo name="ryzz" age="24"></ReuseFoo>
    <h2>
      props 和 额外的一些插槽
      <!-- 这里插槽的参数赋值是组件定义里的 props -->
    </h2>
    <ReuseFoo name="ryzzzz" age="2444">
      <!-- 具名插槽 -->
      <template v-slot:bolderAge="props">
        <b>{{ props.data.age }}</b>
      </template>
      <!-- 默认插槽 -->
      <template v-slot>
        <b>哈哈</b>
      </template>
    </ReuseFoo>
  </div>
</template>
<script setup>
import { h } from 'vue'
import { createReusableTemplate } from './index.js'

const [DefineFoo, ReuseFoo] = createReusableTemplate('Foo')
</script>
