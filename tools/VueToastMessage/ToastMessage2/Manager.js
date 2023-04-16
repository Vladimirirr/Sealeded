// ToastMessage 的管理器

import ToastMessage from './ToastMessage.js'

// 一些常量
const defaults = {
  duration: 3000, // 默认显示时长
  zIndexBeginning: 1122, // 默认的 z-index 起点 (by the way, the 1122 is my birthday's month and date)
  fixedHeight: 30, // 默认的 ToastMessage 固定高度，写在 CSS 样式表里
  itemsGap: 20, // 默认的 ToastMessage 间的间隔
}
const heightGap = defaults.fixedHeight + defaults.itemsGap // 最终 ToastMessage 间的相距高度

let count = 0 // ToastMessage 的计数器
let VueCtor = null // Vue
const allMessages = [] // 全部的 ToastMessage

const getTop = () => {
  let top = 20 // initial top
  if (allMessages.length) {
    top += heightGap * allMessages.length
  }
  return `${top}px`
}

// 显示 ToastMessage 的方法
const showMessage = (
  type = 'tip',
  content = '',
  duration = defaults.duration
) => {
  // inc and get the message id (mid = message id)
  const mid = count++

  // init and open a ToastMessage
  const props = {
    mid,
    type,
    content,
    duration,
    styles: {
      zIndex: defaults.zIndexBeginning + mid,
      top: getTop(),
    },
  }
  const onClosing = () => {
    const foundIndex = allMessages.indexOf(instance)
    if (foundIndex > -1) {
      allMessages.splice(foundIndex, 1)
    }
    // 重置其他 ToastMessage 的 top 位置，数组自带的 slice 可对传入的参数纠错（因此，这里不需要校验参数）
    allMessages.slice(foundIndex).forEach((i) => {
      const el = i.$el
      const currentTop = parseInt(el.style.top, 10) // 显式指定 radix 参数，以提高转换速度（parseInt 不必再检查传入参数的格式了）
      const newTop = currentTop - heightGap
      el.style.top = `${newTop}px`
    })
  }
  const instance = new VueCtor({
    render() {
      const h = this.$createElement
      return h(
        ToastMessage,
        {
          props,
          on: {
            closing: onClosing,
          },
        },
        []
      )
    },
    methods: {
      close() {
        this.$children[0].close()
      },
    },
  })
  allMessages.push(instance)
  instance.$mount()
  window.document.body.appendChild(instance.$el)

  // 关闭此 ToastMessage 的方法
  return instance.close
}

// 得到具体的方法，这些方法将暴露出去
const messageTypes = ['success', 'error', 'warning', 'tip']
const messageFns = messageTypes.reduce(
  (acc, cur) => (
    (acc[cur] = (content, duration) => showMessage(cur, content, duration)), acc
  ),
  {}
)

/**
 * @param {Function} Vue
 */
const initToastMessage = (Vue) => {
  VueCtor = Vue
  return {
    __allMessages: allMessages, // for testing only
    clear: () => {
      // 需要固定当前的 allMessages，防止在 onClosing 里移除数组项目导致的数组颤抖使此处的 forEach 次数不对
      allMessages.slice().forEach((i) => i.close())
      // allMessages.length = 0 // 不需要再重置 length 了，此时数组已经空
    },
    ...messageFns,
  }
}

export default initToastMessage
