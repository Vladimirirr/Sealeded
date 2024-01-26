// A basic babel configuration for library.

// babel@7
// https://babel.dev/docs/options
// 通常，babel 都和打包器一起工作（例如，webpack 的 babel-laoder），很少单独工作，因此不需要一些与路径等相关的外部环境的配置，因此下面也没列出
export default {
  // 目标环境
  targets: ['chrome > 79'],
  // 预设，Array<[presetName: string, options?: Object]>
  presets: [
    [
      '@babel/env', // "@babel/preset-env"
      {
        // 传给此预设的配置参数
        useBuiltIns: 'entry',
        targets: ['firefox > 99'], // 不设置，将继承自上级的，设置，将与上级的做并集
      },
    ],
  ],
  // 插件，Array<[pluginName: string, options?: Object]>
  plugins: [
    [
      '@babel/transform-runtime', // "@babel/plugin-transform-runtime"
      {
        corejs: 3, // 选择 runtime 的类型，默认 false（仅 @babel/runtime），此处 3 = @babel/runtime-corejs3 = @babel/runtime + corejs3 with pure functions
        helpers: true, // 指示是内联还是引入的方式来插入 babel runtime helpers ，默认 true 表示不内联，而是从 @babel/runtime/helpers 引入需要的 helpers
        regenerator: true, // 指示是内联还是引入的方式来插入与生成器相关的 regenerator runtime helpers，默认 true 表示不内联，而是从 @babel/runtime/regenerator 引入需要的 helpers
      },
    ],
  ],
  // 转译推定（高级选项，谨慎设置），实现更快地转译，除非必要，不然不要设置此选项
  // "assumptions": {
  //   // "noDocumentAll": true, // 表示，不会对特殊对象 `document.all` 做 `null` 和 `undefined` 的检测
  //   // "noNewArrows": true // 表示，不会对箭头函数进行 new
  // }
}
