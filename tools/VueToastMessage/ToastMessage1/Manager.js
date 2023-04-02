// ToastMessage 的管理器

import ToastMessageContainer from './Container.js'

// 一些常量
const defaults = {
  duration: 3000, // 默认显示时长
}

let count = 0 // ToastMessage 的计数器
let instance = null // 单例模式的管理器

// 显示 ToastMessage 的方法
const showMessage = (
  type = 'tip',
  content = '',
  duration = defaults.duration
) => {
  // check the instance
  if (instance == null) throw Error('Invoke function initToastMessage first.')

  // inc and get the message id (mid = message id)
  const mid = count++

  // open
  instance.add(mid, type, content, duration)

  // 关闭此 ToastMessage 的方法
  return () => instance.del(mid)
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
  instance = new Vue(ToastMessageContainer) // get the Vue instance for ToastMessageContainer
  instance.$mount() // mount the instance and get its element
  window.document.body.appendChild(instance.$el) // append the element into body
  // return all exposed functions
  return {
    __instance: instance, // for testing only
    clear: instance.clear,
    ...messageFns,
  }
}

export default initToastMessage
