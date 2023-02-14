window.indexedDB.deleteDatabase('TestDB11')

window.currentDB = null

// 任何操作都是一次请求
// indexedDB: IDBFactory
const request = window.indexedDB.open(
  /* DBName(open or create) */ 'TestDB11',
  /* DBVersion, latest(existed) or 1(non-existed) default */ 1
)

request.onerror = (error) => {
  // error: Event <- Object
  console.error('Open failed', error)
}
request.onsuccess = (event) => {
  // event: Event <- Object
  // event.target: IDBOpenDBRequest <- IDBRequest <- EventTarget <- Object
  // event.target.result: IDBDatabase <- EventTarget <- Object
  console.group('Opened')
  console.log('The event', event)
  console.log('The DB', event.target.result)
  console.groupEnd('Opened')
  window.currentDB = event.target.result
}
request.onupgradeneeded = async (event) => {
  // a versionchange transaction opened in this event callback
  // the db prepared to update, and is available to modify the struct of the db
  // such as create or delete an object store in the db
  console.log('Upgraded', event)
  const oldVersion = event.target.result.version
  console.log('old version', oldVersion)
  db = event.target.result
  db.createObjectStore('books', { keyPath: 'bookId' })
}

const addBook = (bookId = 0, bookName = 'JavaScript', bookInfo = null) => {
  // ta: IDBTransaction
  // ta.mode: string = 'readonly' | 'readwrite' | 'versionChange'
  // ta.db: IDBDatabase
  // ta.error: Error
  // ta.abort() - give up all changes
  // ta.objectStore(name) - get a object store named name
  // ta.onabort
  // ta.oncomplete
  // ta.onerror
  // 与其他 DB 相比，index 不存在 commit 方法，即 index 事务都是自提交的
  const ta = currentDB.transaction('books', 'readwrite')
  // os: IDBObjectStore
  // os.indexNames
  // os.keyPath
  // os.name
  // os.transaction
  // os.autoIncrement
  // os.add(value, key?): IDBRequest
  // os.put(value, key?): IDBRequest
  // os.get(key): IDBRequest
  // os.delete(key): IDBRequest
  // os.clear(): IDBRequest
  const os = ta.objectStore('books')
  const req = os.add({
    bookId,
    bookName,
    bookInfo,
  })
  req.onsuccess = (e) => {
    console.log('addBook OK', e)
  }
}
const getBook = (bookId = 0) => {
  const ta = currentDB.transaction('books', 'readonly')
  const os = ta.objectStore('books')
  const req = os.get(bookId)
  req.onsuccess = (e) => {
    console.log('getBook OK', e)
    alert(JSON.stringify(e.target.result))
  }
}
const getAllBook = () => {
  const ta = currentDB.transaction('books', 'readonly')
  const os = ta.objectStore('books')
  const req = os.getAll()
  req.onsuccess = (e) => {
    console.log('getAllBook OK', e)
    alert(JSON.stringify(e.target.result))
  }
}
const updateBook = (
  bookId = 0,
  newBookName = 'JavaScript 2',
  newBookInfo = null
) => {
  const ta = currentDB.transaction('books', 'readwrite')
  const os = ta.objectStore('books')
  // update or add a record
  const req = os.put({
    bookId,
    bookName: newBookName,
    bookInfo: newBookInfo,
  })
  req.onsuccess = (e) => {
    console.log('updateBook OK', e)
    alert(JSON.stringify(e.target.readyState))
  }
}
const delBook = (bookId = 0) => {
  const ta = currentDB.transaction('books', 'readwrite')
  const os = ta.objectStore('books')
  const req = os.delete(bookId)
  req.onsuccess = (e) => {
    console.log('delBook OK', e)
    alert(JSON.stringify(e.target.readyState))
  }
}
