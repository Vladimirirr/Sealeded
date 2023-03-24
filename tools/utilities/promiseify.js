/**
 * Promise 化一个 error-first 的 callback
 * @param {Function}
 * @return {Function}
 */
const promiseify = (fn) =>
  function () {
    return new Promise((resolve, reject) => {
      const args = [].slice.call(arguments)
      args.push((err, data) => {
        // Promise 未标准前，node.js 里的 callback 都是 error-first style
        // 传入断定 Promise 决议结果的函数（当作之前的函数的 callback）
        if (err) reject(err)
        else resolve(data)
      })
      fn.apply(this, args)
    })
  }

export default promiseify
