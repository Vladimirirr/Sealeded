import {
  camelize,
  DelegatedEvents,
  DelegatedEventName,
  DelegatedEventDataSplit,
} from './utilsAndConsts.js'

/**
 * Component MyCounter
 */
class MyCounter extends HTMLElement {
  constructor() {
    super()
    // in this time, only the core data of the element has been inited
    // others such as attributes has not been ready yet
    // the render stage of the element should be delayed on connectedCallback

    // init
    console.log('MyCounter constructed')
    this.eventDelegating = this.eventDelegater.bind(this)
    this.isInstanced = false
    this.isEventSealed = true
  }

  // internal attributes
  // flags
  isMounted = false
  // values
  content = null
  wrapperNode = null

  // internal methods
  // merge new state into current
  mergeState(newState) {
    this.state = Object.assign({}, this.state, newState)
  }
  // set the latest state and trigger update
  setState(newState) {
    // always return a brand-new state just like React class-based component
    this.mergeState(newState)
    // we can merge all updates in a same macrotask cycle to one
    this.update()
  }
  // merge the derived state from props
  mergeDerivedState() {
    const newState = this.getDerivedStateFromProps?.()
    if (newState) {
      this.mergeState(newState)
      if (this.isMounted) {
        this.update()
      }
    }
  }
  // event delegater
  eventDelegater(e) {
    const eventData = e.target.getAttribute(DelegatedEventName)
    if (!eventData) return
    const [eventType, eventHandlerName] = eventData.split(
      DelegatedEventDataSplit
    )
    if (!DelegatedEvents.includes(eventType)) return
    this[eventHandlerName](e)
    if (this.isEventSealed) {
      e.stopPropagation()
    }
  }

  // lifecycles
  // onMounted
  onMounted() {
    console.log('onMounted')
  }
  // onUpdated
  onUpdated() {
    console.log('onUpdated')
  }
  // onUnmounted
  onUnmounted() {
    console.log('onUnmounted')
  }

  // the state of the element
  state = {}
  // the props of the element
  props = {}

  // custom methods
  onAddClick(e) {
    this.setState({
      currentNumber: this.state.currentNumber + 1,
    })
  }
  onSubClick(e) {
    this.setState({
      currentNumber: this.state.currentNumber - 1,
    })
  }

  // custom internal methods can be overriden
  // preprocess the props and then derive state just like what React does
  getDerivedStateFromProps() {
    return {
      currentNumber: +this.props.beginNumber.newValue,
    }
  }

  // the render function of the element
  // a pure function just return the HTML with its CSS(classnames or inline-styles)
  render() {
    const currentNumber = this.state.currentNumber
    return `
      <button @event="click::onSubClick"> - </button>
      <b>${currentNumber}</b>
      <button @event="click::onAddClick"> + </button>
    `
  }

  // get the css styles
  styles() {
    return `
      #\_\_contentWrapper{
        display: flex;
        align-items: center;
      }
      button{
        padding: 2px 10px;
      }
      b{
        padding: 0 4px;
        color: hotpink;
        user-select: none;
      }
    `
  }

  // update the component to make the view latest
  update() {
    const newView = this.render()
    this.wrapperNode.innerHTML = newView
    // call lifecycle hook
    if (this.isMounted) {
      this.onUpdated()
    }
  }

  connectedCallback() {
    // when the element appended into the document
    console.log('MyCounter connected')

    // create the custom element's body
    if (!this.isInstanced) {
      // init a shadow dom
      // mode = 'open': can be accessed by elem.shadowRoot
      // mode = 'open': can not be accessed from outside
      // elem.shadowRoot.host === elem
      this.content = this.attachShadow({ mode: 'open' }) // create and return the elem's shadow tree
      {
        // create css styles

        // method 1 - (traditional)
        const cssNode = document.createElement('style')
        cssNode.innerHTML = this.styles()
        this.content.appendChild(cssNode)

        // // method 2 - (preferable)
        // const css = new CSSStyleSheet()
        // css.replaceSync(this.styles())
        // // the adoptedStyleSheets api
        // // unsupported Safari, supported Chrome > 72, Firefox > 100, AndroidWebView > 108
        // this.content.adoptedStyleSheets.push(css)
      }
      {
        // create wrapper for rendered content
        const wrapperNode = document.createElement('div')
        wrapperNode.id = '__contentWrapper'
        this.content.appendChild(wrapperNode)
        this.wrapperNode = wrapperNode
      }
      // mark this custom element has been inited
      this.isInstanced = true
    }
    // install all event delegations
    DelegatedEvents.forEach((event) => {
      this.content.addEventListener(event, this.eventDelegating)
    })
    // first update
    this.update()
    // mark element isMounted true
    this.isMounted = true
    // call lifecycle hook
    this.onMounted()
  }

  disconnectedCallback() {
    // when the element removed from the document
    console.log('MyCounter disconnected')

    // uninstall all event delegations
    DelegatedEvents.forEach((event) => {
      this.content.removeEventListener(event, this.eventDelegating)
    })
    // mark element isMounted false
    this.isMounted = false
    // call lifecycle hook
    this.onUnmounted()
  }

  static get observedAttributes() {
    // array of attribute names to monitor for changes
    // ** notice that the attribute in HTML is case-insensitive **
    // ** notice that the attribute's value in HTML is always string type **
    return ['begin-number']
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // called when one of attributes listed above is modified
    // ** notice that this callback is called before connectedCallback **
    // save the change
    this.props[camelize(name)] = { oldValue, newValue }
    // update state
    this.mergeDerivedState()
  }
}

export default MyCounter
