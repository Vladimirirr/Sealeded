// A basic babel configuration for application.

// babel@7
// https://babel.dev/docs/options
export default {
  targets: ['chrome > 79'],
  presets: [['@babel/env', { useBuiltIns: 'entry' }]],
  plugins: [['@babel/transform-runtime', {}]],
}
