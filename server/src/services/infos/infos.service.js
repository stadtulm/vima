// Initializes the `infos` service on path `/infos`
const { Infos } = require('./infos.class')
const createModel = require('../../models/infos.model')
const hooks = require('./infos.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: false,
    whitelist: ['$options', '$regex'],
    multi: false
  }

  // Initialize our service with any options it requires
  app.use('/infos', new Infos(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('infos')

  service.hooks(hooks)
}
