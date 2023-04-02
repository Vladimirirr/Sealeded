const iconsImport = import.meta.glob('./*.svg', { eager: true })

const fileNameReg = /\.\/(\w+)\.svg/

const icons = Object.keys(iconsImport).reduce((acc, cur) => {
  const matched = cur.match(fileNameReg)
  const fileName = matched[1]
  acc[fileName] = iconsImport[cur].default
  return acc
}, {})

export default icons
