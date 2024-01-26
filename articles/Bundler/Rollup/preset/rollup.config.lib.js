// A basic rollup configuration for library.

// https://rollupjs.org/configuration-options/
export default {
  // 入口
  input: './src/index.js',
  // 定义外部依赖，打包的排除项，相当 webpack 的 externals，一个数组 Array<string | RegExp | Function>
  external: ['lodash'], // 字符串 'lodash' 相当 /^lodash$/，因此要和引入的模块名字全匹配
  // 输出
  output: {
    // dir 和 file 参数同时只能存在一个
    // dir: './dist', // 当有多个 chunk 输出时（多入口、动态导入、自定义 manualChunks）
    file: './dist/my-library.js', // 输出文件名，当仅有一个 chunk 输出时
    format: 'umd', // 打包格式
    // type: es
    // type: cjs
    // type: iife
    // type: amd
    // type: system
    // type: umd
    name: 'MyLibrary', // 对外暴露的模块名字，在 iife 和 umd 的情况下必须
    // 定义外部依赖的名字（仅 iife 和 umd 有效），与 external 定义的要相互匹配
    globals: {
      lodash: '_',
    },
    // 其他非核心选项
    // banner: '', // banner 信息
    // footer: '', // footer 信息
    // chunkFileNames: '[name]-[hash].js', // 自定义 chunk 名字
    // assetFileNames: 'assets/[name]-[hash][extname]', // 自定义 asset 名字
    // compact: false, // 是否压缩 rollup 填入的 helpers，比如 umd 的检查代码
    // 创建自定义的公共 chunk（不能是 iife 和 umd），相当 webpack 的 SplitChunksPlugin，但是没 webpack 复杂的配置项
    // manualChunks 是一个对象 或者 是一个函数（更灵活）
    // manualChunks: {
    //   // key = chunkName, value = Array<moduleId>
    //   // moduleId: string = 依赖名字 或 模块路径，其中 moduleId 会被 @rollup/plugin-node-resolve 合法化处理
    //   vender: ['vue', 'dayjs'], // 这 2 个依赖会被打包到单独的 chunk 里，包括 'dayjs/format' 这样的按需导入
    //   utils: ['./src/utils1.js', './src/utils2.js'], // 这 2 个模块会被打包到单独的 chunk 里
    // },
    // sourcemap: false, // 选择 sourcemap 的类型
    // true = 独立的 sourcemap 文件
    // false = 不生成
    // inline = 内联
    // hidden = true 但 bundle 里不引入此 sourcemap
  },
  // 观察器
  watch: true, // 配置文件设置目前不工作，需在 cli 里设置有效 `npx rollup -c -w` -c = --config -w = --watch
  // 插件列表
  plugins: [],
}
