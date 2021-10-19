// Initializes the `sendstats` service on path `/sendstats`
const { Sendstats } = require('./sendstats.class')
const createModel = require('../../models/sendstats.model')
const hooks = require('./sendstats.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/sendstats', new Sendstats(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('sendstats')

  service.hooks(hooks)
}
