// Initializes the `blog` service on path `/blog`
const { Blog } = require('./blog.class')
const createModel = require('../../models/blog.model')
const hooks = require('./blog.hooks')

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ['$options', '$regex'],
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/blog', new Blog(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('blog')

  service.hooks(hooks)
}
