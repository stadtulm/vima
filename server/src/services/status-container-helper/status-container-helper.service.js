// Initializes the `status-container-helper` service on path `/status-container-helper`
const { StatusContainerHelper } = require('./status-container-helper.class')
const hooks = require('./status-container-helper.hooks')

module.exports = function (app) {
  const options = {
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/status-container-helper', new StatusContainerHelper(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('status-container-helper')

  service.hooks(hooks)
}
