module.exports = {
  productionSourceMap: false,

  transpileDependencies: [
    'vuetify',
    'feathers-vuex'
  ],

  configureWebpack: {
    devtool: 'source-map'
  },

  devServer: {
    port: 8081
  },

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: true
    }
  },

  chainWebpack: config => {
    config.optimization
      .minimizer('terser')
      .tap(args => {
        const { terserOptions } = args[0]
        terserOptions.keep_classnames = true
        terserOptions.keep_fnames = true
        return args
      })
  }
}
