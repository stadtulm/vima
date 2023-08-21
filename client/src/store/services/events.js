export function events ({ feathers }) {
  const { apiClient, apiVuex } = feathers
  const { BaseModel, makeServicePlugin } = apiVuex

  class events extends BaseModel {
    static modelName = 'events'
    // Define default properties here
    static instanceDefaults () {
      return {
      }
    }
  }
  const servicePath = 'events'
  const vuexPlugin = makeServicePlugin({
    Model: events,
    service: apiClient.service(servicePath),
    servicePath,
    whitelist: ['$regex', '$options', '$populate'],
    paramsForServer: ['$populate']
  })

  // Setup the client-side Feathers hooks.
  apiClient.service(servicePath).hooks({})

  return vuexPlugin
}
