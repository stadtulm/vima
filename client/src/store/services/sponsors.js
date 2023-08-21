export function sponsors ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class sponsors extends BaseModel {
    static modelName = 'sponsors'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'sponsors'
  const vuexPlugin = makeServicePlugin({
    Model: sponsors,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
