// mdn reference for WebWorker: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#web_workers_api

const Worker = window.Worker
const Blob = window.Blob
const createObjectURL = window.URL.createObjectURL
const revokeObjectURL = window.URL.revokeObjectURL

/**
 * 根据传入的worker字符串模板得到其真正的worker
 * @param {string} workerTemplate a worker template
 * @return {{worker: Worker, workBlobURL: string}} a worker with its blobURL
 */
const createWorker = (workerTemplate) => {
  const workBlob = new Blob([workerTemplate], {
    type: 'text/javascript',
  })
  const workBlobURL = createObjectURL(workBlob)
  const worker = new Worker(workBlobURL)
  return {
    worker,
    workBlobURL,
  }
}

/**
 * 一次性的worker
 * @param {Function} work a work function to run in the worker
 * @param {any} data data to the work
 * @return {Promise} a promise to get the result from the worker
 */
export const runDisposableWorker = (work, data) => {
  const workerTemplate = `
    self.onmessage = (e) => {
      // 收到message立刻执行，再将结果发出去
      self.postMessage(
        (${work})(e.data)
      )
      // 一次性
      self.close()
    }
  `
  const { worker, workBlobURL } = createWorker(workerTemplate)
  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => resolve(e.data)
    worker.onerror = (err) => reject(err)
    worker.postMessage(data)
  }).finally(() => revokeObjectURL(workBlobURL))
}

/**
 * 普通的worker
 * @param {Function} work same as above
 * @return {{post: Function, close: Function}} a worker controller
 */
export const runWorker = (work) => {
  const workerTemplate = `
    self.onmessage = (e) => {
      self.postMessage(
        (${work})(e.data)
      )
    }
  `
  const { worker, workBlobURL } = createWorker(workerTemplate)
  let promiseResolve = null
  let promiseReject = null
  const resetPromise = () => (promiseResolve = promiseReject = null)
  worker.onmessage = (e) => promiseResolve?.(e.data)
  worker.onerror = (err) => promiseReject?.(err)
  return {
    post(data) {
      // 执行此worker
      if (promiseResolve) {
        throw Error('Can not begin a new work when another work is working.')
      }
      const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
      })
      worker.postMessage(data)
      return promise.then(
        (data) => {
          // 重置promiseResolve和promiseReject
          resetPromise()
          // 结果
          return data
        },
        (err) => {
          resetPromise()
          // 错误
          throw err
        }
      )
    },
    close() {
      return worker.terminate() && revokeObjectURL(workBlobURL)
    },
  }
}

/**
 * 根据不同action执行不同任务的worker
 * @param {{action: string, work: Function}[]} actions all actions that the worker accepts
 * @return {{post: Function, close: Function}} a worker contoller
 */
export const runWorkerByActions = (actions) => {
  const workerTemplate = `
    self.onmessage = (e) => {
      const actions = [
        ${actions.map(
          ({ action, work }) => `{ action: '${action}', work: ${work} }`
        )}
      ]
      const action = actions.find(i => i.action === e.data.action)
      action && self.postMessage((action.work)(e.data.data))
    }
  `
  const { worker, workBlobURL } = createWorker(workerTemplate)
  let promiseResolve = null
  let promiseReject = null
  const resetPromise = () => (promiseResolve = promiseReject = null)
  worker.onmessage = (e) => promiseResolve?.(e.data)
  worker.onerror = (err) => promiseReject?.(err)
  return {
    post(action, data) {
      // 执行其中的一个action
      if (promiseResolve) {
        throw Error('Can not begin a new work when another work is working.')
      }
      const promise = new Promise((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
      })
      worker.postMessage({ action, data })
      return promise.then(
        (data) => {
          // 重置promiseResolve和promiseReject
          resetPromise()
          // 结果
          return data
        },
        (err) => {
          resetPromise()
          // 错误
          throw err
        }
      )
    },
    close() {
      return worker.terminate() && revokeObjectURL(workBlobURL)
    },
  }
}
