import Store from '../'

export function statusContainerHelper ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class statusContainerHelper extends BaseModel {
    static modelName = 'statusContainerHelper'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'status-container-helper'
  const vuexPlugin = makeServicePlugin({
    Model: statusContainerHelper,
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
