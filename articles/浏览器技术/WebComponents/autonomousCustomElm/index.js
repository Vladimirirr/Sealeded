import MyCounter from './MyCounter.JS'

class App extends HTMLElement {
  constructor() {
    super()
    console.log('App constructed')
  }
  connectedCallback() {
    // Node.isConnected 可检测一个节点是否已经接入到了一个文档里（主文档或Shadow文档）
    console.log('App connected')
    const shadowDom = this.attachShadow({ mode: 'open' })
    const num = this.getAttribute('counter-begin-number')
    shadowDom.innerHTML = `
      <p>Look the my-counter below: </p>
      <my-counter begin-number="${num}"></my-counter>
    `
  }
  disconnectedCallback() {
    console.log('App disconnected')
  }
}

// let the browser know that <my-counter> is a custom element and served by the class MyCounter
// 名字必须使用 - 相隔，以便浏览器能快速与内建元素做区分
window.customElements.define('my-counter', MyCounter)

window.customElements.define('test-app', App)
