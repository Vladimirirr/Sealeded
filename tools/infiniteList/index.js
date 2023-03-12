class InfiniteList extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
  }
  disconnectedCallback() {}

  static get observedAttributes() {
    return ['list']
  }
  attributeChangedCallback(name, oldValue, newValue) {}
}

export default InfiniteList
