// Initializes the `ads` service on path `/ads`
const { Ads } = require('./ads.class')
const createModel = require('../../models/ads.model')
const hooks = require('./ads.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$regex', '$options', '$populate'],
    lean: { virtuals: true },
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/ads', new Ads(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('ads')

  service.hooks(hooks)
}
