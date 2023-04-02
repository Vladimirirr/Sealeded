import initToastMessage from './Manager.js'
import './index.css'

// Vue's install function
export default (Vue) => {
  const manager = initToastMessage(Vue)
  Vue.prototype.$tm = manager // tm = ToastMessage
}
