import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class chatMessages extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

  // Define default properties here
  static instanceDefaults () {
    return {
    }
  }

  // Updates `data.unread` to be an instance of the corresponding class.
  static setupInstance (data, { store, models }) {
    if (data.author) {
      if (typeof data.author === 'object') {
        // eslint-disable-next-line new-cap
        data.author = new models.api.users(data.author)._id
      }
    }
    return data
  }
}
chatMessages.modelName = 'chatMessages'
const servicePath = 'chat-messages'
const servicePlugin = makeServicePlugin({
  Model: chatMessages,
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
