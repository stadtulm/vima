
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        if (context.data.data) {
          context.data = JSON.parse(context.data.data)
        }
      }
    ],
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
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
