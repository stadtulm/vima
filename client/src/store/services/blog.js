export function blog ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class blog extends BaseModel {
    static modelName = 'blog'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'blog'
  const vuexPlugin = makeServicePlugin({
    Model: blog,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
