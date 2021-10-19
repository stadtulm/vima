// Initializes the `statistics` service on path `/statistics`
const { Statistics } = require('./statistics.class')
const hooks = require('./statistics.hooks')

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/statistics', new Statistics(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('statistics')

  service.hooks(hooks)
}
