const { disallow } = require('feathers-hooks-common')

module.exports = {
  before: {
    all: [
      disallow('external'),
      (context) => {
        context.app.logger.info('Created Mail (before hook)', JSON.stringify(context.data))
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context.app.logger.info('Created Mail (after hook)', JSON.stringify(context.result))
      }
    ],
    update: [],
    patch: [],
    remove: []
  }
}
