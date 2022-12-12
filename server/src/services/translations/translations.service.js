// Initializes the `translations` service on path `/translations`
const { Translations } = require('./translations.class')
const hooks = require('./translations.hooks')

module.exports = function (app) {
  const options = {
  }

  // Initialize our service with any options it requires
  app.use('/translations', new Translations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('translations')

  service.hooks(hooks)
}
