# Concurrent in React

## Use concurrent to improve the performance of re-render

Due to a change in the state of a React component, it and its subcomponents will all be re rendered to get the latest VNode tree (one-way data flow, passed from top to bottom), which is a recursive rendering mode that consumes a lot of memory and CPU resources.

To resolve the problem, the React Team determined to use concurrent mode replaced the traditional recursion mode, which means a high priority render task can interrupt a low priority render task, and the render system works on time slice mode.

And transform the Tree structure VNode to Linked-List structure [Fiber](https://github.com/acdlite/react-fiber-architecture).

## The concurrent apis in React 18

### `useTransition`钩子

Sign: `useTransition(): [isPending: Boolean, startTransition: Function]`

Description: It mark a update as a transition task(a low priority task), which can make UI still response during the expensive state transition.

### `useDeferredValue`钩子

Sign: `useDeferredValue(value: T): copiedValue: T`

Description: It receive a value and return its copy. Update to this value will be regarded as low priority. When an urgent task comes in, this hook will return the old value rendered last time to avoid triggering another unnecessary render during this urgent task. that is, delaying an unimportant render by returning a historical value when an urgent render comes in.

### `useSyncExternalStore`钩子

Sign: `useSyncExternalStore(store.subscribe: (listener) => Function, store.getSnapshot: () => T): T`

向外部状态管理器提供的保证组件状态一致的接口。（由于 concurrent mode 导致的 break changing）

React 内部的状态都不存在撕裂问题，比如 useState、useContext。

举例：

```jsx
const createStore = (init = []) => {
  const store = new Map(init)
  const listeners = new Set()
  const notify = () => listeners.forEach((i) => i())
  return {
    __store: store,
    __listeners: listeners,
    set(id, data) {
      store.set(id, data)
      notify()
    },
    del(id) {
      store.delete(id)
      notify()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return store
    },
  }
}
const myStore = createStore([['foo', 12n]])

const useMyStore = (name) => {
  const value = useSyncExternalStore(
    myStore.subscribe,
    useCallback(() => myStore.getSnapshot().get(name), [name])
  )
  const updateValue = (newValue) => myStore.set(name, newValue)
  return [value, updateValue]
}
```

### `useInsertionEffect`钩子

Sign: `useInsertionEffect(effect: Function): void`

向外部工具提供最佳的注入样式的时刻的钩子。

### `React.lazy`方法

Sign: `React.lazy(() => import('dynamicComponent.jsx'))`

Create a lazy laoding component.

### `React.Suspense`组件

指定其中的子组件树还没载入完成时的加载器。

### React18 多个 UI 共存的情况

正在进行一个普通渲染，这时，一个高优先级渲染抢占普通渲染的渲染权，那么，React 就要维持两个 UI。需要注意的是，一个 UI 只有完整地渲染结束 React 才会把它 commit 到视图，防止出现视图撕裂。
