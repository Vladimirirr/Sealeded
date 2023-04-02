// 此处的 raw 告知导入工具（比如，Vite）以文本形式直接导入文件的内容，这样就可将 CSS 样式文件的内容直接嵌入到 shadowDom 里（封装地更彻底），而不必像下面一样创建一个 link:css 节点
// import css from './index.css?raw'

// 自定义元素自己 === this
// 自定义元素的 dom 根 === shadowRoot
// 在主文档的 dom 嵌套关系：shadowRoot里的dom节点 -> shadowRoot -> 自定义元素自己 -> 主文档

class InfiniteList extends HTMLElement {
  constructor() {
    super()
  }

  // methods
  update(data) {
    data.forEach((i) => {
      const item = document.createElement('div')
      item.className = 'item'
      item.id = i.id
      item.innerHTML = i.html
      this.rootContainer.insertBefore(item, this.reachedSlot)
    })
    // check again after updating
    this.checkIsReached()
  }
  checkIsReached() {
    // 最简单的方法
    this.reachedOb.unobserve(this.reached)
    this.reachedOb.observe(this.reached)
  }
  // events
  onReached() {
    console.log('onReached.')
    this.dispatchEvent(new CustomEvent('reached'))
  }

  connectedCallback() {
    // open a shadow dom and return its reference accessed by `this.shadowRoot`
    this.attachShadow({ mode: 'open' })

    // init all related dom
    {
      // create a css-link node to import its style
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = './index.css'
      this.shadowRoot.appendChild(link)
    }
    {
      // create a root container
      const rootContainer = document.createElement('div')
      rootContainer.className = 'InfiniteListContainer'
      this.shadowRoot.appendChild(rootContainer)
      this.rootContainer = rootContainer
    }
    {
      // create a reached node
      const reachedSlot = document.createElement('slot')
      const defaultReached = document.createElement('div')
      reachedSlot.name = 'reached'
      reachedSlot.className = 'reached'
      defaultReached.className = 'defaultReached'
      defaultReached.innerHTML = 'loading...'
      reachedSlot.appendChild(defaultReached)
      this.rootContainer.appendChild(reachedSlot)
      this.reachedSlot = reachedSlot
      const slottedEl = reachedSlot.assignedElements()
      if (slottedEl.length) {
        this.reached = slottedEl[0]
      } else {
        this.reached = defaultReached
      }
    }
    {
      // create a observer for checking is reached
      const ob = new IntersectionObserver(
        ([entry]) => {
          // 这里，我们只观察一个，因此我们直接取数组的首个
          console.log('IntersectionObserver Call', entry)
          if (entry.isIntersecting) {
            // 触底
            this.onReached()
          }
        },
        { root: this.rootContainer }
      )
      ob.observe(this.reached)
      this.reachedOb = ob
    }

    // first re-check
    this.checkIsReached()
  }
  disconnectedCallback() {}
}

export default InfiniteList
