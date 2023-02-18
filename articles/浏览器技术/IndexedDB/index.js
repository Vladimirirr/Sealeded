// immediate mark a db deleted, and will delete the db in background async
const delReq = indexedDB.deleteDatabase('TestDB11')

window.currentDB = null

// 请求 open DB
// indexedDB: IDBFactory
// open success: onupgradeneeded(if version higher) -> onsuccess
// open fail: onerror
/**
 * name: string - open or create a db
 * version: number = 1 - the version of the db to open
 */
const request = indexedDB.open('TestDB11', 1)
request.onerror = (error) => {
  // all index event is the dom event type
  console.error('Open failed', error)
}
request.onsuccess = (event) => {
  // event.target: IDBOpenDBRequest <- IDBRequest <- EventTarget <- Object
  // event.target.result: IDBDatabase <- EventTarget <- Object
  console.group('Opened')
  console.log('The event', event)
  console.log('The DB', event.target.result)
  console.groupEnd('Opened')
  window.currentDB = event.target.result
}
request.onupgradeneeded = async (event) => {
  // event: IDBVersionChangeEvent
  // it means that the db need to upgrade
  // now the db is available to modify the structure of the db, such as create, delete or modify an object store in the db
  // a versionchange transaction opened in this event callback
  const db = event.target.result
  const oldVersion = event.oldVersion
  const newVersion = db.version
  console.group('Upgraded')
  console.log('The event', event)
  console.log(`The version ${oldVersion} -> ${newVersion}`)
  console.groupEnd('Upgraded')
  // 细致的upgrade
  // switch (oldVersion) {
  //   case 0:
  //     // first open
  //     // ...
  //     break
  //   case n:
  //     // n:int > 0
  //     // do something to update the db from oldVersion(=n) to newVersion
  //     // ...
  //     break
  // }
  // 粗暴但是简单不容易出错的upgrade，直接查看需要的新的对象仓是否存在，即针对内存的存在与否决定upgrade
  // db.objectStoreNames: DOMStringList
  if (db.objectStoreNames.contains('aNewObjectStoreFromTheNewVersion')) {
    // ...
  }
  // createObjectStore is a sync operate
  /**
   * objectStoreName: string
   * options: object
   * options.keyPath: string - use the keyPath as the primary key for objects
   * options.autoIncrement: boolean - use an auto increment as the primary key for values with any type
   */
  db.createObjectStore('books', { keyPath: 'bookId' })
  // db.deleteObjectStore('books') // deleteObjectStore also is a sync operate
}

// add or update a book
const addBook = (bookId = '', bookName = '', bookPrice = 0, userDesc = '') => {
  return new Promise((resolve, reject) => {
    // ta: IDBTransaction
    // ta.mode: string = 'readonly' | 'readwrite' - 默认 readonly
    // ta.db: IDBDatabase
    // ta.error: Error
    // ta.abort() - give up all changes
    // ta.objectStore(name) - get a object store by name
    // ta.onabort
    // ta.oncomplete
    // ta.onerror
    // 与其他 DB 相比，index 不存在 commit 方法，即 index 事务都是自提交的（在全部的请求决议且 microtask 队列空时）
    const ta = currentDB.transaction('books', 'readwrite')
    // os: IDBObjectStore
    // os.indexNames
    // os.keyPath
    // os.name
    // os.transaction
    // os.autoIncrement
    // os.add(value, key?): IDBRequest - if a key existed throws an error
    // os.put(value, key?): IDBRequest - if a key existed just update the key's value
    const os = ta.objectStore('books')
    const req = os.put({
      bookId,
      bookName,
      bookPrice,
      bookDesc: {
        userDesc: userDesc,
        createdTime: Date.now(),
        protocol: window.location.protocol,
        port: window.location.port,
      },
    })
    req.onsuccess = (e) => {
      msgTip('ok', `add the key "${e.target.result}" successfully`)
      console.log(e)
      resolve(e.target.result)
    }
    req.onerror = (e) => {
      msgTip('err', `add failed because "${e.target.error}"`)
      console.error(e)
      reject(e.target.result)
    }
  })
}

// get the book
const getBook = (bookId = 0) => {
  return new Promise((resolve) => {
    const ta = currentDB.transaction('books', 'readonly')
    const os = ta.objectStore('books')
    const req = os.get(bookId)
    req.onsuccess = (e) => {
      msgTip('ok', 'getBook OK')
      console.log(e)
      resolve(e.target.result)
    }
  })
}

// get all books
const getAllBooks = () => {
  return new Promise((resolve) => {
    const ta = currentDB.transaction('books', 'readonly')
    const os = ta.objectStore('books')
    const req = os.getAll()
    req.onsuccess = (e) => {
      msgTip('ok', 'getAllBook OK')
      console.log(e)
      resolve(e.target.result)
    }
  })
}

// delete a bokk
const delBook = (bookId = '') => {
  const ta = currentDB.transaction('books', 'readwrite')
  const os = ta.objectStore('books')
  const req = os.delete(bookId) // 还可以接受 range 对象
  req.onsuccess = (e) => {
    msgTip('ok', 'delBook OK')
    console.log(e)
  }
}

// clear all books
const clearBooks = () => {
  const ta = currentDB.transaction('books', 'readwrite')
  const os = ta.objectStore('books')
  const req = os.clear()
  req.onsuccess = (e) => {
    msgTip('ok', 'clearBooks OK')
    console.log(e)
  }
}
