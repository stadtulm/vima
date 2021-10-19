// Initializes the `statusContainers` service on path `/status-containers`
const { StatusContainers } = require('./status-containers.class')
const createModel = require('../../models/status-containers.model')
const hooks = require('./status-containers.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    multi: true,
    whitelist: ['$populate'],
    estimatedDocumentCount: true
  }

  // Initialize our service with any options it requires
  app.use('/status-containers', new StatusContainers(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('status-containers')

  service.hooks(hooks)
}
