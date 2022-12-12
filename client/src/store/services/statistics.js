import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'
import Store from '../'

class statistics extends BaseModel {
  // eslint-disable-next-line no-useless-constructor
  constructor (data, options) {
    super(data, options)
  }

  // Define default properties here
  static instanceDefaults () {
    return {
    }
  }
}
statistics.modelName = 'statistics'
const servicePath = 'statistics'
const servicePlugin = makeServicePlugin({
  Model: statistics,
  service: feathersClient.service(servicePath),
  servicePath,
  handleEvents: {
    updated: (item) => {
      Store.commit('SET_USER_COUNT', item)
      return item
    }
  }
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
