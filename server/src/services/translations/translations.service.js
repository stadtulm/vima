// Initializes the `translations` service on path `/translations`
const { Translations } = require('./translations.class')
const createModel = require('../../models/translations.model')
const hooks = require('./translations.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    multi: true,
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$populate', '$exists', '$ne', '$eq']
  }

  // Initialize our service with any options it requires
  app.use('/translations', new Translations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('translations')

  service.hooks(hooks)
}
