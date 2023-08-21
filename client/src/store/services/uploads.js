export function uploads ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class uploads extends BaseModel {
    static modelName = 'uploads' // Required for $FeathersVuex plugin to work after production transpile.
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'uploads'
  const vuexPlugin = makeServicePlugin({
    Model: uploads,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
