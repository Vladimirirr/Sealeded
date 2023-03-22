# Crypto

Crypto 接口提供了最基本的密码学方面的 API。（WebWorker 里也存在）

浏览器已经有内置的 Crypto 接口实现（window.crypto 对象）。

浏览器兼容性：

- Chrome >= 37, 2014-08
- Firefox >= 32, 2014-12
- Safari >= 7, 2013-10
- AndroidWebview >= 37, 2014-09
- Node.js >= 15, 2020-10
- Deno.js >= 1.18, 2022-01

内置方法：

- `crypto.getRandomValues(typedArray)`: 向 typedArray 填入密码安全的随机数
- `crypto.randomUUID()`: 仅在安全上下文，得到密码安全的 UUID 值
- `crypto.subtle`: 仅在安全上下文，得到一个 subtleCrypto 对象（提供了密码学上的基本操作方法）

## digest

语法：`digest(algorithm: string, data: ArrayBuffer | TypedArray | DateView): Promise<ArrayBuffer>`

配置：

- algorithm 的值：'SHA-1' 'SHA-256' 'SHA-384' 'SHA-512'（现在 SHA-1 是不安全的）

示例：

```js
const source = new Uint8Array([97, 98, 99, 100]) // 字符串 'abcd'
window.crypto.subtle.digest('sha-1', source).then((res) => {
  console.log('result', res)
})
```

## encrypt & decrypt

语法：`encrypt(algorithm: Object, key: CryptoKey, data: ArrayBuffer | TypedArray | DateView): Promise<ArrayBuffer>`

配置：

- algorithm 的值是一个对象，表示 encrypt 的类型，包括 RSA-OAEP、AES-CTR、AES-CBC 和 AES-GCM（格式：类型-模式）
  其中，RSA（非对称）和 AES-GCM（对称）的安全性最高

示例：

- [AES-GCM](./AES_GCM.js)
