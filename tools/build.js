// This is the internal builder for Sealeded's tools based on esbuild.

// https://esbuild.github.io/
import esbuild from 'esbuild'

const toJson = JSON.stringify
const getBuildingTime = (d) => d.toISOString()
const getVersionOfES = (d, offset = 0) => {
  const currentYear = d.getFullYear()
  const lowestVersion = 2015 // ECMAScript2015 = ES6
  const targetVersion = currentYear + offset // targetVersion manipulated by offset
  const resolvedVersion = Math.max(lowestVersion, targetVersion)
  return `es${resolvedVersion}`
}

const build = async (entry, config = {}) => {
  // resolve config
  const {
    minify = false,
    sourcemap = false,
    outfile = 'index.dist.js',
    bannerMsg = '\n',
    buildingDate = new Date(),
  } = config
  const buildingTime = getBuildingTime(buildingDate)

  // get resolved config
  const resolvedConfig = {
    bundle: true,
    entryPoints: [entry],
    outfile,
    minify,
    format: 'esm',
    target: getVersionOfES(buildingDate, -3), // compat 3 versions early
    legalComments: 'inline', // preserves copyright comments
    sourcemap: sourcemap && 'inline', // only use inline sourcemap if needed
    banner: {
      js: bannerMsg, // the banner message for the entry point
    },
    define: {
      RUNTIME: toJson({
        env: 'production',
        time: buildingTime,
      }),
    },
    // more details about the resolvedConfig
    // The `minify` not only removes spaces and replaces identifiers, but also replaces parts of the source code with the optimal expression or statement structure based on the AST.
    // The `target` only recognizes and transforms syntax features(like `x ?? y` --> `x == null ? y : x`) but not apis(like `Promise.any()`), so, the apis need a suitable polyfill.
    // The `target` may be inaccurate because ECMAScript is released in the middle of each year, and browsers have varying support for the new features of that released version. Some may have been supported before the release, while others may only be supported after a period of time after the release.
  }
  // console.log('IN BUILDING: Using the following config to build:')
  // console.log(resolvedConfig)

  // begin building
  const res = await esbuild.build(resolvedConfig)
  // console.log('IN BUILDING: Building done with the following result:')
  // console.log(res)

  return res
}

export default build
