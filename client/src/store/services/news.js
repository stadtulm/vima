export function news ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class news extends BaseModel {
    static modelName = 'news'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'news'
  const vuexPlugin = makeServicePlugin({
    Model: news,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
