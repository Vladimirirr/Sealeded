/**
 * 首字符大写
 * @param {string} str
 * @return {string}
 */
export const makeFirstCharUpper = (str) => {
  const chars = Array.from(str)
  chars.unshift(chars.shift().toUpperCase())
  return chars.join('')
}
