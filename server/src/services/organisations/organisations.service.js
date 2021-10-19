// Initializes the `organisations` service on path `/organisations`
const { Organisations } = require('./organisations.class')
const createModel = require('../../models/organisations.model')
const hooks = require('./organisations.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$options', '$regex']
  }

  // Initialize our service with any options it requires
  app.use('/organisations', new Organisations(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('organisations')

  service.hooks(hooks)
}
