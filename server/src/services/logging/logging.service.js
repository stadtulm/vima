// Initializes the `logging` service on path `/logging`
const { Logging } = require('./logging.class')
const hooks = require('./logging.hooks')
const multer = require('multer')
const multipartMiddleware = multer()

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/logging',
    multipartMiddleware.single('data'),
    new Logging(options, app)
  )

  // Get our initialized service so that we can register hooks
  const service = app.service('logging')

  service.hooks(hooks)
}
