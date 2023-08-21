export function translations ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class translations extends BaseModel {
    static modelName = 'translations' // Required for $FeathersVuex plugin to work after production transpile.
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'translations'
  const vuexPlugin = makeServicePlugin({
    Model: translations,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
