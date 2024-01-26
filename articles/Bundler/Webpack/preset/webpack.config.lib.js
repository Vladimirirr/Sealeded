// A basic webpck configuration for library.
/**
 * webpack: 5
 * webpack-cli: 5
 * babel-loader: 9
 * @babel/preset-env: 7
 */

// 是否是生产环境
const isProd = process.env.NODE_ENV

// https://webpack.js.org/configuration/
export default {
  mode: isProd ? 'production' : 'development',
  watch: !isProd,
  entry: './src/index.js',
  output: {
    path: './dist', // 输出目录
    filename: 'my-library.js', // 输出文件名
    library: {
      name: 'MyLibrary', // 对外暴露的模块名字，如果需要的话，主要是 iife 类的打包方式需要的
      type: 'umd', // 打包格式
      // type: var = var + iife
      // type: this = this + iife
      // type: self = self + iife
      // type: window = window + iife
      // type: module = es Module
      // type: commonjs = commonjs Module
      // type: commonjs2 = commonjs Module，与 commonjs 的不同是，commonjs 标准仅定义了 exports 关键词，而 node.js 的实现其实是 module.exports 对象（因此叫做 commonjs2），只是标准和实现的不同，本质上是一样的
      // type: amd = amd Module, Asynchronous Module Definition, RequireJS
      // type: umd = umd Module, Universal Module Definition，是 amd、commonjs 和 iife 的三合一
      // type: system = system Module, WHATWG's JavaScript Module Loader, SystemJS
    },
  },
  // 定义外部依赖
  externals: {
    // 不打包像 lodash 这样的三方依赖，没必要
    // key = 模块名字 value = 外部引入此模块的名字
    lodash: {
      // lodash 比较特殊，在非模块环境下（iife 格式的打包），lodash 对外暴露的模块名字是 `_` 而非同包名的 `lodash`，因此要对非模块环境下单独配置
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash', // 对 amd 和 system 生效
      // 非模块环境下引入 lodash 的名字
      root: '_',
    },
    dayjs: 'dayjs', // dayjs 在外部引入的名字和包名是一样的，因此不需要详细定义
  },
  // 选择要生成何种类型的 sourcemap，false 表示不生成
  devtool: isProd ? false : 'eval',
  // 插件列表
  plugins: [],
  // 配置 webpack 如何处理不同类型的 module，最主要的参数是 loaders
  module: {
    // 配置 loaders，从而能正常读取非 JavaScript 的文件
    rules: [
      {
        // babel 转译到 ES6
        test: /\.js$/,
        include: /src/,
        use: {
          loader: 'babel-loader',
          // babel 的配置也能从当前目录的 babel.config.js 读取
          options: {},
        },
      },
      {
        // 读取 CSS
        test: /\.css$/,
        include: /src/,
        use: [
          {
            loader: 'style-loader',
            options: {},
          },
          {
            loader: 'css-loader',
            options: {},
          },
        ],
      },
    ],
  },
}
