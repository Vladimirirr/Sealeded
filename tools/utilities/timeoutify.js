/**
 * 对一个函数的执行时间设置超时阈值
 * @param {Function} fn - 目标函数
 * @param {number} timeout - 超时时间（单位：ms）
 * @return {Function}
 */
const timeoutify = (fn, timeout) => {
  let timer = setTimeout(() => (timer = null), timeout)
  return function () {
    // 传统的 function（这里可能需要 this）
    if (timer) {
      // timer 存在表示还未超时
      clearTimeout(timer)
      fn.apply(this, arguments)
    } else {
      // 超时
      throw Error(`Refuse to execute the callback beacuse of Timeout.`)
    }
  }
}

// const testFn = () => console.log('I should be called in 2 seconds.') // 此函数只有3秒内有效，超时不予执行
// const testFnWithTimeout = timeoutify(testFn, 2e3)

export default timeoutify
