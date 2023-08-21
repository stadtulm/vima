import Store from '../'

export function statistics ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class statistics extends BaseModel {
    static modelName = 'statistics'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'statistics'
  const vuexPlugin = makeServicePlugin({
    Model: statistics,
    service: apiClient.service(servicePath),
    servicePath,
    handleEvents: {
      updated: (item) => {
        Store.commit('SET_USER_COUNT', item)
        return item
      }
    }
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
