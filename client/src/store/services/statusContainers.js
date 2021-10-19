import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'
class statusContainers extends BaseModel {
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
    if (data.unread && data.unread.length > 0) {
      const unread = []
      for (let i = 0; i < data.unread.length; i++) {
        if (typeof data.unread[i].id === 'object' && data.unread[i].type) {
          unread.push(
            {
              type: data.unread[i].type,
              id: new models.api[data.unread[i].type](data.unread[i].id)._id
            })
        } else {
          unread.push(data.unread[i])
        }
      }
      data.unread = unread
    }
    if (data.user) {
      if (typeof data.user === 'object') {
        // eslint-disable-next-line new-cap
        data.user = new models.api.users(data.user)._id
      }
    }
    if (data.reference) {
      if (typeof data.reference === 'object') {
        // eslint-disable-next-line new-cap
        data.reference = new models.api[data.type](data.reference)._id
      }
    }
    return data
  }
}
statusContainers.modelName = 'statusContainers'
const servicePath = 'status-containers'
const servicePlugin = makeServicePlugin({
  Model: statusContainers,
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
