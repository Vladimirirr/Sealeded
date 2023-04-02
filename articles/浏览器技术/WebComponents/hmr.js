// Vite 下的 WebComponents 热更新代码
// 下面的代码直接附在需要热更新的 WebComponents 组件文件的代码里
// 可写一个插件以自插入下面的代码

if (import.meta.hot) {
  // 引入此 if 语句，在构建时这里的热更新代码可以被 treesharking 掉
  import.meta.hot.accept((newModule) => {
    // 首次模块载入不会触发
    // 当热更新传播到此模块时将触发
    if (newModule) {
      // newModule is undefined when a SyntaxError happened
      // console.log('updated: count is now', newModule)

      // get the latest module content
      const moduleDefault = newModule['default']
      // get all old elements
      const elms = document.getElementsByTagName(tagName)
      // information for this updating
      const updateInfo = {
        needReload: false,
      }
      // handle them
      Array.from(elms).forEach((el) => {
        if (updateInfo.needReload) {
          // 如果已经需要强制更新了，就没必要再处理下去了
          return
        }
        if (el.hotUpdate) {
          // 如果存在热更新方法
          el.hotUpdate(moduleDefault)
        } else {
          // CustomElementRegistry 接口没有提供任何与 unregister 或 updateRegistered 类似的方法，因此只能重载整个浏览器（强制更新）
          updateInfo.needReload = true
        }
      })
      if (updateInfo.needReload) {
        window.location.reload()
      }
    }
  })
}
