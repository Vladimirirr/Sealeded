import path from 'path'
import fs from 'fs/promises'

import build from './build.js'

// toolName is also the directory name where the tool in
const [toolName] = process.argv.slice(2)

const toolDirPath = path.resolve(toolName) // get tool's directory path
const toolPackagePath = path.resolve(toolDirPath, 'package.json') // get tool's package.json path

const getOutfilePath = (name, version, minify) => {
  const minifyPart = minify ? '.min' : ''
  const fileName = `${name}.${version}.dist${minifyPart}.js`
  return path.resolve(toolDirPath, 'dist', fileName)
}
const getBuildingTime = (d) => d.toUTCString()

const begin = async () => {
  const packageContent = await fs.readFile(toolPackagePath, {
    // tell the readFile to return the text(JSON data) rather than data buffer
    encoding: 'utf-8',
  })
  const packageData = JSON.parse(packageContent)

  const buildingDate = new Date()

  const {
    main: mainEntry,
    version,
    description,
    author,
    repository: { url: repoPath, directory: repoDir },
    license,
  } = packageData
  const bannerMsg = `
/*!
  * ${toolName} v${version} (${getBuildingTime(buildingDate)})
  * description: ${description}
  * author: ${author}
  * source: ${repoPath}/${repoDir}
  * license: ${license}
  * ****
  */
`
  const res = await build(path.resolve(toolDirPath, mainEntry), {
    minify: true,
    outfile: getOutfilePath(toolName, version, true),
    bannerMsg,
    buildingDate,
  })
  console.log('Build done.')
  0 && console.log(res) // it may use when debugging, but for now, we closed it
}

begin()
