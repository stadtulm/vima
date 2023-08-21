export function subscribers ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class subscribers extends BaseModel {
    static modelName = 'subscribers'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'subscribers'
  const vuexPlugin = makeServicePlugin({
    Model: subscribers,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
