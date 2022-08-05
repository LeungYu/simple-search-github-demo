const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  runtimeCompiler: true,
  productionSourceMap: false,
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      config.externals = {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        lodash: '_',
        'ant-design-vue': 'antd'
      }
    }
  },
  devServer: {
    port: 8080,
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    allowedHosts: '*'
  }
})
