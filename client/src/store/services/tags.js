export function tags ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class tags extends BaseModel {
    static modelName = 'tags'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'tags'
  const vuexPlugin = makeServicePlugin({
    Model: tags,
    service: apiClient.service(servicePath),
    servicePath
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
