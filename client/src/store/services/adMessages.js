import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class adMessages extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

  // Define default properties here
  static instanceDefaults () {
    return {
    }
  }

  // Updates `data.author` to be an instance of the `User` class.
  static setupInstance (data, { store, models }) {
    if (data.author && typeof data.author === 'object') {
      // eslint-disable-next-line new-cap
      data.author = new models.api.users(data.author)._id
    }
    return data
  }
}
adMessages.modelName = 'adMessages'
const servicePath = 'ad-messages'
const servicePlugin = makeServicePlugin({
  Model: adMessages,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
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
})

export default servicePlugin
