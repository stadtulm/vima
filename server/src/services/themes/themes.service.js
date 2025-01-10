// Initializes the `themes` service on path `/themes`
const { Themes } = require('./themes.class')
const createModel = require('../../models/themes.model')
const hooks = require('./themes.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$populate'],
    lean: { virtuals: true },
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/themes', new Themes(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('themes')

  service.hooks(hooks)
}
