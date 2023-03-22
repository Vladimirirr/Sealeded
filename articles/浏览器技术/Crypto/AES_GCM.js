const AES_GCM = (key, iv) => {
  const cfg = {
    name: 'AES-GCM',
    iv,
  }
  const encrypt = (source) => window.crypto.subtle.encrypt(cfg, key, source)
  const decrypt = (source) => window.crypto.subtle.decrypt(cfg, key, source)
  return {
    encrypt,
    decrypt,
  }
}

const source = new Uint8Array([97, 98, 99, 100]) // 字符串 'abcd'
const iv = window.crypto.getRandomValues(new Uint8Array(12)) // GCM 必须 12
const userPwd = '1122' // user password

// a key without password
const test_withoutPwd = async () => {
  // 得到一个key
  const key = await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256, // length: (128 | 192 | 256)
    },
    true, // 此key能被导出
    ['encrypt', 'decrypt']
  )
  // 得到方法
  const { encrypt, decrypt } = AES_GCM(key, iv)
  // test
  setTimeout(async () => {
    const encrypted = await encrypt(source)
    console.log('encrypted', encrypted)
    const decrypted = await decrypt(encrypted)
    console.log('decrypted', decrypted)
  }, 0)
}

const test_withPwd = async () => {
  const PBKDF2 = 'PBKDF2' // 从文本的password派生key，需要PBKDF2格式
  const userPwdBuffer = new TextEncoder().encode(userPwd) // 将字符串的password转成Uint8Array
  const salt = window.crypto.getRandomValues(new Uint8Array(16)) // 盐，16位
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    userPwdBuffer,
    PBKDF2,
    false, // PBKDF2类型不能设置true
    ['deriveBits', 'deriveKey']
  )
  const key = await window.crypto.subtle.deriveKey(
    {
      name: PBKDF2,
      salt,
      iterations: 1e3,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )
  const { encrypt, decrypt } = AES_GCM(key, iv)
  // test
  setTimeout(async () => {
    const encrypted = await encrypt(source)
    console.log('encrypted', encrypted)
    const decrypted = await decrypt(encrypted)
    console.log('decrypted', decrypted)
  }, 0)
}

test_withoutPwd()
test_withPwd()
