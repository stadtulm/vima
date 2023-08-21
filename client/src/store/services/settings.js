import app from '@/main'
import Store from '@/store'

// TODO: Check if app stuff works

export function settings ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class settings extends BaseModel {
    static modelName = 'settings'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'settings'
  const vuexPlugin = makeServicePlugin({
    Model: settings,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({
    after: {
      all: [context => {
        if (context.method !== 'remove') {
          if (Array.isArray(context.result)) {
            app.config.globalProperties.$settings = context.result[0]
          } else {
            app.config.globalProperties.$settings = context.result
          }
          const tmpVisibilities = {}
          for (const key of Object.keys(app.config.globalProperties.$settings.modules)) {
            tmpVisibilities[key] = Store.getters.isModuleActiveOrDependency(key)
          }
          Store.commit('SET_MODULE_VISIBILITIES', tmpVisibilities)
        }
      }]
    }
  })

  return vuexPlugin
}
