// Initializes the `newsletter` service on path `/newsletter`
const { Newsletter } = require('./newsletter.class')
const hooks = require('./newsletter.hooks')

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/newsletter', new Newsletter(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('newsletter')

  service.hooks(hooks)
}
