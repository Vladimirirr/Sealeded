// get a random string
const getRandom = () => (Math.random() + '').slice(2)

/**
 * Get a fixed length random string.
 * @param {number} len
 * @return {string}
 */
const getFixedRandom = (len = 8) => {
  const res = getRandom()
  const resLen = res.length
  if (resLen >= len) {
    return res.slice(0, len)
  }
  return res + getFixedRandom(len - resLen)
}

export default getFixedRandom
