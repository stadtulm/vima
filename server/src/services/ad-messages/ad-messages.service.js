// Initializes the `ad-messages` service on path `/ad-messages`
const { AdMessages } = require('./ad-messages.class')
const createModel = require('../../models/ad-messages.model')
const hooks = require('./ad-messages.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    multi: true,
    whitelist: ['$populate']
  }

  // Initialize our service with any options it requires
  app.use('/ad-messages', new AdMessages(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('ad-messages')

  service.hooks(hooks)
}
