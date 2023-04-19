// ToastMessage 的模板

import IconsMap from '../icons/index.js' // 图标映射
import { makeFirstCharUpper } from '../utils.js'

export default {
  name: 'ToastMessageTemplate',
  props: ['mid', 'type', 'content', 'duration'],
  render() {
    const h = this.$createElement
    const { mid, type, content } = this
    const typeClassSuffix = makeFirstCharUpper(type)
    const messageNode = h(
      'div',
      {
        class: ['ToastMessage', `ToastMessage${typeClassSuffix}`],
        attrs: {
          id: `ToastMessage__${mid}`,
        },
      },
      [
        h(
          'img',
          {
            class: 'Icon',
            attrs: {
              src: IconsMap[type],
            },
          },
          []
        ),
        h(
          'div',
          {
            class: 'Content',
          },
          [content]
        ),
      ]
    )
    return h(
      'transition',
      {
        props: {
          name: 'ToastMessageTransition',
          appear: true,
        },
      },
      [messageNode]
    )
  },
  data() {
    return {
      timer: null,
    }
  },
  methods: {
    close() {
      // close itself
      this.$parent.del(this.mid)
    },
  },
  mounted() {
    this.timer = setTimeout(this.close, this.duration)
  },
  beforeDestroy() {
    clearTimeout(this.timer)
  },
}
