// constants
const empty = void 0
const internalDBName = 'idbStorage'
const internalStoreName = 'main'
const fixedVersion = 1
const indexedDB = globalThis.indexedDB

// utils
/**
 * call a function with try-catch
 * @param {Function} fn
 */
const tryCatch = (fn, ...args) => {
  try {
    return [fn.apply(fn, args), empty]
  } catch (err) {
    return [empty, err]
  }
}
/**
 * a common error handler for transaction
 * @param {Event} e
 * @param {Function} reject
 */
const errorHandler = (e, reject) => {
  // 不需要冒泡到 db 上
  e.stopPropagation()
  reject(e.target.error)
}

/**
 * 写入一个值，与 WebStorage.setItem 类似
 * @param {IDBFactory} db - internal parameter and will be passed automatically
 * @param {string} key - key
 * @param {any} value - value
 * @return {Promise} indicates if the operation is successful or not
 */
const setItem = (db, key, value) => {
  return new Promise((resolve, reject) => {
    const ta = db.transaction(internalStoreName, 'readwrite')
    const os = ta.objectStore(internalStoreName)
    const [req, immediateErr] = tryCatch(() => os.put({ key, value }))
    if (immediateErr) {
      return reject(immediateErr)
    }
    req.onsuccess = (e) => {
      return e // e.target.result 是设定的值的 key
    }
    req.onerror = (e) => {
      // e.preventDefault() -> does not abort the transaction, triggers the onerror but ignores the onabort
      // e.stopPropagation() -> aborts the transaction, triggers the onabort but ignores the onerror
      // e.preventDefault() and stopPropagation() -> does not abort the transaction, ignores both the onerror and onabort
      return e // e.target.error
    }
    ta.oncomplete = () => {
      resolve(empty)
    }
    ta.onerror = (e) => {
      // 此 event 可取消
      errorHandler(e, reject)
    }
    ta.onabort = (e) => {
      // 此 event 不可取消（不能 preventDefault）
      // an abort event triggers the onerror first, and then triggers this onabort
      e.stopPropagation()
    }
  })
}

/**
 * 读取一个值，与 WebStorage.getItem 类似
 * @param {IDBFactory} db
 * @param {string} key
 * @return {Promise}
 */
const getItem = (db, key) => {
  const readInfo = {
    value: empty,
  }
  return new Promise((resolve, reject) => {
    const ta = db.transaction(internalStoreName, 'readonly')
    const os = ta.objectStore(internalStoreName)
    const [req, immediateErr] = tryCatch(() => os.get(key))
    if (immediateErr) {
      return reject(immediateErr)
    }
    req.onsuccess = (e) => {
      readInfo.value = e.target.result.value
      return e
    }
    req.onerror = (e) => {
      return e // e.target.error
    }
    ta.oncomplete = () => {
      resolve(readInfo.value)
    }
    ta.onerror = (e) => {
      errorHandler(e, reject)
    }
    ta.onabort = (e) => {
      e.stopPropagation()
    }
  })
}

/**
 * 移除一个值，与 WebStorage.removeItem 类似
 * @param {IDBFactory} db
 * @param {string} key
 * @return {Promise}
 */
const removeItem = (db, key) => {
  return new Promise((resolve, reject) => {
    const ta = db.transaction(internalStoreName, 'readwrite')
    const os = ta.objectStore(internalStoreName)
    const [req, immediateErr] = tryCatch(() => os.delete(key))
    if (immediateErr) {
      return reject(immediateErr)
    }
    req.onsuccess = (e) => {
      return e // e.target.result = undefined
    }
    req.onerror = (e) => {
      return e // e.target.error
    }
    ta.oncomplete = () => {
      resolve(empty)
    }
    ta.onerror = (e) => {
      errorHandler(e, reject)
    }
    ta.onabort = (e) => {
      e.stopPropagation()
    }
  })
}

/**
 * 移除全部，清空
 * @param {IDBFactory} db
 * @return {Promise}
 */
const clear = (db) => {
  return new Promise((resolve, reject) => {
    const ta = db.transaction(internalStoreName, 'readwrite')
    const os = ta.objectStore(internalStoreName)
    const [req, immediateErr] = tryCatch(() => os.clear())
    if (immediateErr) {
      return reject(immediateErr)
    }
    req.onsuccess = (e) => {
      return e // e.target.result = undefined
    }
    req.onerror = (e) => {
      return e // e.target.error
    }
    ta.oncomplete = () => {
      resolve(empty)
    }
    ta.onerror = (e) => {
      errorHandler(e, reject)
    }
    ta.onabort = (e) => {
      e.stopPropagation()
    }
  })
}

/**
 * 安装：
 * 返回一个 idbStorage 对象，同时也将在 globalThis 上挂载此对象
 * @return {Promise}
 */
const install = () => {
  return new Promise((resolve, reject) => {
    // 得到一个 indexedDB instance
    // 如果存在话，就直接复用，否则就创建一个
    const openedInfo = {
      db: null,
      version: -1,
    }
    const openReq = indexedDB.open(internalDBName, fixedVersion)
    openReq.onerror = (e) => {
      console.error('IDB failed.')
      reject(e.target.error)
    }
    openReq.onblocked = (e) => {
      // 我们这里不会触发此事件，因为我们总是 open version 1
      console.error('IDB blocked.')
      reject(e)
    }
    openReq.onsuccess = (e) => {
      console.log('IDB opening.')
      openedInfo.db = e.target.result
      openedInfo.version = e.target.result.version
      resolve(openedInfo)
    }
    openReq.onupgradeneeded = (e) => {
      console.log('IDB upgrading.')
      const db = e.target.result
      db.createObjectStore(internalStoreName, { keyPath: 'key' })
    }
  }).then((openedInfo) => {
    // 暴露的方法
    const exposed = {
      __db: openedInfo.db,
      __version: openedInfo.version,
      setItem: setItem.bind(empty, openedInfo.db),
      getItem: getItem.bind(empty, openedInfo.db),
      removeItem: removeItem.bind(empty, openedInfo.db),
      clear: clear.bind(empty, openedInfo.db),
    }
    // 挂载
    Object.defineProperty(globalThis, internalDBName, {
      configurable: false,
      enumerable: true,
      writable: false,
      value: Object.freeze(exposed),
    })
    // 返回
    return exposed
  })
}

/**
 * 卸载
 */
const uninstall = () => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(internalDBName)
    req.onsuccess = (e) => resolve(e.target.result) // result = undefined
    req.onerror = (e) => reject(e.target.error)
  })
}

export { install, uninstall }
