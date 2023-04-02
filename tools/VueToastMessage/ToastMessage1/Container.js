// ToastMessage 的容器

import ToastMessageTemplate from './Template.js'

export default {
  name: 'ToastMessageContainer',
  render() {
    const h = this.$createElement
    const messages = this.allMessages.map((i) =>
      h(ToastMessageTemplate, {
        props: i,
        key: i.mid, // 保证每个 ToastMessage 都是唯一的，防止 vDOM 的 diff 对它 reuse 导致的一些列问题
      })
    )
    return h(
      'div',
      {
        class: ['ToastMessageContainer'],
      },
      messages
    )
  },
  data() {
    return {
      allMessages: [], // 目前存在的全部 ToastMessage
    }
  },
  methods: {
    add(mid, type, content, duration, zIndex) {
      // 增入一个 ToastMessage
      this.allMessages.push({ mid, type, content, duration, zIndex })
    },
    del(mid) {
      // 移除一个 ToastMessage
      const foundIndex = this.allMessages.findIndex((i) => i.mid == mid)
      if (foundIndex > -1) {
        this.allMessages.splice(foundIndex, 1)
      }
    },
    clear() {
      // 清空，全部移除
      this.allMessages = []
    },
  },
}
