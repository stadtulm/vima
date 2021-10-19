// Initializes the `violations` service on path `/violations`
const { Violations } = require('./violations.class')
const createModel = require('../../models/violations.model')
const hooks = require('./violations.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$populate'],
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/violations', new Violations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('violations')

  service.hooks(hooks)
}
