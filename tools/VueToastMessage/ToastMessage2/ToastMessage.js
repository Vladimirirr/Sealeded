// ToastMessage 的模板

import IconsMap from '../icons/index.js' // 图标映射

// 首字母大写
const makeFirstCharUpper = (type) => {
  const chars = Array.from(type)
  chars.unshift(chars.shift().toUpperCase())
  return chars.join('')
}

export default {
  name: 'ToastMessage',
  props: ['mid', 'type', 'content', 'duration', 'styles'],
  render() {
    const h = this.$createElement
    const { mid, type, content, styles: style } = this // get all its props
    const typeClassSuffix = makeFirstCharUpper(type)
    const messageNode = h(
      'div',
      {
        style,
        class: ['ToastMessage', `ToastMessage${typeClassSuffix}`],
        attrs: {
          id: `ToastMessage__${mid}`,
        },
        directives: [
          {
            name: 'show',
            rawName: 'v-show',
            value: this.show,
            expression: 'this.show',
          },
        ],
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
        on: {
          'after-leave': this.handleAfterLeave,
        },
      },
      [messageNode]
    )
  },
  data() {
    return {
      timer: null,
      show: true,
      isClosed: false,
    }
  },
  watch: {
    isClosed() {
      if (this.isClosed) {
        this.show = false
      }
    },
  },
  methods: {
    handleAfterLeave() {
      // 当消失的专场特效结束了，对此 ToastMessage 清理

      this.$destroy()
      this.$el.remove() // window.document.body.removeChild(this.$el);
    },
    close() {
      // 进入关闭状态

      // check
      if (this.isClosed) return
      // 清除此计时器，clearTimeout 可以传入一个已经兑现的或不存在的计时器标识符而不会报错
      clearTimeout(this.timer)
      // 告诉父组件我即将被关闭
      this.$emit('closing')
      // update flag
      this.isClosed = true
    },
  },
  mounted() {
    this.timer = setTimeout(this.close, this.duration)
  },
}
