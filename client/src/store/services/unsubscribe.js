export function unsubscribe ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class newsletter extends BaseModel {
    static modelName = 'newsletter' // Required for $FeathersVuex plugin to work after production transpile.
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'newsletter'
  const vuexPlugin = makeServicePlugin({
    Model: newsletter,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
