// const { SYNC } = require('feathers-sync')

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [
      // context => { context[SYNC] = false }
    ],
    find: [],
    get: [],
    create: [
      (context) => {
        context.result.tmpResetToken = context.app['_tmpuser_' + context.result._id]
        delete context.app['_tmpuser_' + context.result._id]
      }
    ],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
