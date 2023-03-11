type T_IDBSupportedType =
  | string
  | number
  | boolean
  | bigint
  | null
  | undefined
  | Object
  | Date
  | RegExp
  | ArrayBuffer
  | Array<T_IDBSupportedType>
  | Set<T_IDBSupportedType>
  | Map<T_IDBSupportedType, T_IDBSupportedType>
type T_SingleReturned = undefined | Error

interface I_IDBStorage {
  __db: IDBFactory
  __version: number
  setItem: (key: string, value: T_IDBSupportedType) => Promise<T_SingleReturned>
  getItem: (key: string) => Promise<T_IDBSupportedType | Error>
  removeItem: (key: string) => Promise<T_SingleReturned>
  clear: () => Promise<T_SingleReturned>
}

export const install: () => Promise<I_IDBStorage | Error>
export const uninstall: () => Promise<T_SingleReturned>
