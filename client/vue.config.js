module.exports = {
  productionSourceMap: false,

  transpileDependencies: [
    'vuetify',
    'feathers-vuex'
  ],

  devServer: {
    disableHostCheck: true,
    port: 8081
  },

  pluginOptions: {
    i18n: {
      locale: 'de',
      fallbackLocale: 'de',
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
