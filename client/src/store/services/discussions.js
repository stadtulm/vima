import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class discussions extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

  // Define default properties here
  static instanceDefaults () {
    return {
    }
  }

  // Updates `data.group` to be an instance of the `Group` class.
  static setupInstance (data, { store, models }) {
    if (data.group) {
      if (typeof data.group === 'object') {
        // eslint-disable-next-line new-cap
        data.group = new models.api.groups(data.group)._id
      }
    }
    return data
  }
}
discussions.modelName = 'discussions'
const servicePath = 'discussions'
const servicePlugin = makeServicePlugin({
  Model: discussions,
  service: feathersClient.service(servicePath),
  servicePath,
  whitelist: ['$exists']
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
