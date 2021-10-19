// Initializes the `discussions` service on path `/discussions`
const { Discussions } = require('./discussions.class')
const createModel = require('../../models/discussions.model')
const hooks = require('./discussions.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$populate'],
    lean: { virtuals: true },
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/discussions', new Discussions(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('discussions')

  service.hooks(hooks)
}
