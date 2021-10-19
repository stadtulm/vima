// Initializes the `discussion-messages` service on path `/discussion-messages`
const { DiscussionMessages } = require('./discussion-messages.class')
const createModel = require('../../models/discussion-messages.model')
const hooks = require('./discussion-messages.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$populate', '$exists'],
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/discussion-messages', new DiscussionMessages(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('discussion-messages')

  service.hooks(hooks)
}
