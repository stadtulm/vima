export function activities ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class activities extends BaseModel {
    static modelName = 'activities'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'activities'
  const vuexPlugin = makeServicePlugin({
    Model: activities,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
