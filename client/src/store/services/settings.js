import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'
import Vue from 'vue'
import Store from '@/store'
class settings extends BaseModel {
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
settings.modelName = 'settings'
const servicePath = 'settings'
const servicePlugin = makeServicePlugin({
  Model: settings,
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
    all: [context => {
      if (context.method !== 'remove') {
        if (Array.isArray(context.result)) {
          Vue.prototype.$settings = context.result[0]
        } else {
          Vue.prototype.$settings = context.result
        }
        const tmpVisibilities = {}
        for (const key of Object.keys(Vue.prototype.$settings.modules)) {
          Vue.prototype.$set(tmpVisibilities, key, Store.getters.isModuleActiveOrDependency(key))
        }
        Store.commit('SET_MODULE_VISIBILITIES', tmpVisibilities)
      }
    }],
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
