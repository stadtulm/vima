// Initializes the `translator` service on path `/translator`
const { Translator } = require('./translator.class')
const hooks = require('./translator.hooks')

module.exports = function (app) {
  const options = {
  }

  // Initialize our service with any options it requires
  app.use('/translator', new Translator(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('translator')

  service.hooks(hooks)
}
