// Initializes the `subscribers` service on path `/subscribers`
const { Subscribers } = require('./subscribers.class')
const createModel = require('../../models/subscribers.model')
const hooks = require('./subscribers.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app)
  }

  // Initialize our service with any options it requires
  app.use('/subscribers', new Subscribers(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('subscribers')

  service.hooks(hooks)
}
