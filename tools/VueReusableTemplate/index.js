import { createCommentVNode } from 'vue' // vue@2.7 或 vue@3.x
import { cloneDeep } from 'lodash'

// ReusableTemplate 的创建函数
export const createReusableTemplate = (name = 'unknown') => {
  let templateRender = null
  const DefineTemplate = {
    name: `DefineTemplate__${name}`,
    created() {
      // 保存此模板定义的渲染函数
      templateRender = this.$slots.default
    },
    render() {
      // 模板组件不需要渲染任何东西，或者渲染一个注释以表示它的存在
      return createCommentVNode(this.$options.name)
    },
  }
  const ReuseTemplate = {
    name: `ReuseTemplate__${name}`,
    render() {
      if (templateRender == null) {
        throw `Cannot find the defined template for the ReuseTemplate named "${this.$options.name}".`
      }
      // templateRender's params --传入到--> 此定义的模板的默认渲染函数
      // templateRender's params --传入到--> 此定义的模板的 v-slot 里
      const params = {
        // cloneDeep 防止不必要的响应式的干涉，同时保证这些值是干净的
        ...cloneDeep(this.$attrs),
        $slots: cloneDeep(this.$slots),
      }
      const result = templateRender(params)
      return result
    },
  }
  return [DefineTemplate, ReuseTemplate]
}

// 在 Vue 的模板里执行一个渲染函数，得到一小段的 VNodes，大量的 VNodes 考虑抽离到单独的组件里
// Vue 的模板是 VNodes 的高级抽象，失去灵活性，但换来超强的 AOT 静态优化，也有效地降低学习门槛
// React 的 JSX 是 VNodes 的中低级抽象，很灵活，但牺牲了静态优化
// 此方法，即下面的 renderSnippet 组件，让你能在模板里直接渲染一个渲染函数而不需繁琐地再抽离出一个单独的组件
export const renderSnippet = {
  // snippet 表示一小段的 VNodes
  name: 'renderSnippet',
  props: { renderer: Function },
  render() {
    if (this.renderer == null) {
      throw 'Cannot find the "props.renderer".'
    }
    return this.renderer(this)
  },
}
