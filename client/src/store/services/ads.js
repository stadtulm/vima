export function ads ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class ads extends BaseModel {
    static modelName = 'ads'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'ads'
  const vuexPlugin = makeServicePlugin({
    Model: ads,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$and', '$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
