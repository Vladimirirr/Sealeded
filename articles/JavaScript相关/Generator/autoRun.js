/**
 * async await 的简易实现版本
 * 一个自执行的生成器
 * @param {GeneratorFunction} gen - a generator
 * @param {any[]} inits - init values to the generator
 * @return {Promise}
 */
export const autoRun = (gen, ...inits) => {
  // init a promise as the result
  const controller = { resolve: null, reject: null }
  const result = new Promise((resolve, reject) => {
    // save the resolve and reject function
    controller.resolve = resolve
    controller.reject = reject
  })
  // current value of the iterator
  let value = undefined
  // get the iterator from its generator with init value
  const it = gen(...inits)
  // try next
  const next = () => {
    try {
      const nextData = it.next(value)
      if (nextData.done) {
        controller.resolve(nextData.value)
        return
      }
      // always promiseify the returned value
      const returned = Promise.resolve(nextData.value)
      returned.then(
        (res) => {
          value = res
          next()
        },
        (err) => {
          // an error happened
          reject(err)
        }
      )
    } catch (err) {
      controller.reject(err)
    }
  }
  // begin the iterator
  next()
  // return a promise including the final value of the generator
  return result
}
