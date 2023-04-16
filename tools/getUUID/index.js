const info = {
  engine: null,
  generator: null,
}

const charMap = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]
const charMapLen = charMap.length

const uuidPosPreset = [8, 4, 4, 4, 12]

// determine the random engine and create the generator based the engine
if (crypto?.randomUUID) {
  // randomUUID available
  info.engine = crypto.randomUUID.bind(crypto)
  info.generator = crypto.randomUUID.bind(crypto)
} else if (crypto?.getRandomValues) {
  // getRandomValues available
  info.engine = crypto.getRandomValues.bind(crypto)
  info.generator = () => {
    const uuid = uuidPosPreset.map((i) => {
      const buffer = info.engine(new Uint8Array(i))
      const res = []
      buffer.forEach((i) => res.push(charMap[i % charMapLen]))
      return res.join('')
    })
    return uuid.join('-')
  }
} else if (URL?.createObjectURL) {
  // createObjectURL available
  info.engine = URL.createObjectURL.bind(URL)
  info.generator = () => {
    const blobURL = URL.createObjectURL(new Blob([]))
    const uuid = blobURL.split('/').pop()
    URL.revokeObjectURL(blobURL)
    return uuid
  }
} else if (Math?.random) {
  // random available
  info.engine = Math.random.bind(Math)
  const getChar = () => {
    const i = Math.floor(info.engine() * charMapLen)
    return charMap[i]
  }
  info.generator = () => {
    const uuid = uuidPosPreset.map((i) => {
      const res = Array(i)
        .fill(0)
        .map(() => getChar())
      return res.join('')
    })
    return uuid.join('-')
  }
}

/**
 * 返回一个 UUID 例如 '20340d03-8284-45be-a504-2f8af6c5fe10'
 * @return {string | undefined}
 */
const getRandom = () => info.generator?.()
getRandom.info = info

export default getRandom
