export function themes ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class themes extends BaseModel {
    static modelName = 'themes'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'themes'
  const vuexPlugin = makeServicePlugin({
    Model: themes,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
