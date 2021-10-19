// Initializes the `apikeys` service on path `/apikeys`
const { Apikeys } = require('./apikeys.class')
const createModel = require('../../models/apikeys.model')
const hooks = require('./apikeys.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/apikeys', new Apikeys(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('apikeys')

  service.hooks(hooks)
}
