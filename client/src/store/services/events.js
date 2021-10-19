import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class events extends BaseModel {
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
events.modelName = 'events'
const servicePath = 'events'
const servicePlugin = makeServicePlugin({
  Model: events,
  service: feathersClient.service(servicePath),
  servicePath,
  whitelist: ['$regex', '$options', '$populate'],
  paramsForServer: ['$populate']
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
